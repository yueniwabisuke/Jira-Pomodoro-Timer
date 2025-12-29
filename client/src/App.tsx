import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import IssueList from './components/IssueList';
import Timer from './components/Timer';
import Settings from './components/Settings';
import api, { setAuthHeaders } from './api';
import './index.css';
import { Issue, JiraAuth } from './types';
// Import icon components
import RefreshIcon from './components/icons/RefreshIcon';
import SettingsIcon from './components/icons/SettingsIcon';

const JIRA_AUTH_STORAGE_KEY = 'jiraPomodoroAuth';
const POMODORO_DURATION_STORAGE_KEY = 'pomodoroDurationMinutes';
const DEFAULT_POMODORO_DURATION = 25; // Define default duration here

function App() {
  const [jiraAuth, setJiraAuth] = useState<JiraAuth | null>(null);
  const [pomodoroDurationMinutes, setPomodoroDurationMinutes] = useState<number>(() => {
    const savedDuration = localStorage.getItem(POMODORO_DURATION_STORAGE_KEY);
    return savedDuration ? parseInt(savedDuration, 10) : DEFAULT_POMODORO_DURATION;
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem(JIRA_AUTH_STORAGE_KEY);
    if (savedAuth) {
      const auth = JSON.parse(savedAuth);
      handleSaveAuth(auth);
    } else {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (jiraAuth) {
      fetchIssues();
    }
  }, [jiraAuth]);

  const handleSaveAuth = (auth: JiraAuth) => {
    setJiraAuth(auth);
    setAuthHeaders(auth);
    localStorage.setItem(JIRA_AUTH_STORAGE_KEY, JSON.stringify(auth));
  };

  const handleSavePomodoroDuration = (duration: number) => {
    // Ensure duration is a valid number and at least 1
    const validatedDuration = Math.max(1, Math.floor(duration));
    if (validatedDuration !== duration) {
        alert('Pomodoro duration must be a positive integer.');
    }
    setPomodoroDurationMinutes(validatedDuration);
    localStorage.setItem(POMODORO_DURATION_STORAGE_KEY, validatedDuration.toString());
  };

  const handleResetPomodoroDuration = () => {
    handleSavePomodoroDuration(DEFAULT_POMODORO_DURATION);
  };

  const handleClearAuth = () => {
    setJiraAuth(null);
    setAuthHeaders(null);
    localStorage.removeItem(JIRA_AUTH_STORAGE_KEY);
    setIssues([]);
    setError(null);
    setActiveIssue(null);
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/issues');
      setIssues(response.data);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(`Failed to fetch issues. Status: ${err.response?.status}. Please check credentials and connection.`);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTimer = (issue: Issue) => setActiveIssue(issue);
  const handleTimerStop = () => setActiveIssue(null);

  if (activeIssue && jiraAuth) {
    return <Timer activeIssue={activeIssue} onTimerStop={handleTimerStop} pomodoroDurationMinutes={pomodoroDurationMinutes} />;
  }

  if (!jiraAuth) {
    return <Settings onSave={handleSaveAuth} />;
  }

  return (
    <div>
      <header className="app-header">
        <div className="app-header-title">
          <h1>Jira Pomodoro Timer</h1>
        </div>
        {/* Clear Settings button remains in header, but not inside app-header-actions */}
        <button onClick={handleClearAuth} className="action-button clear-settings-button" title="設定をクリア">
          <SettingsIcon />
          <span>設定をクリア</span>
        </button>
      </header>
      
      <main>
        {isLoading ? (
          <p>Loading issues...</p>
        ) : (
          <>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {/* Reload Issues button is now below the header, centered */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button onClick={fetchIssues} disabled={isLoading} className="action-button" title="課題を再読み込み">
                <RefreshIcon />
                <span>課題を再読み込み</span>
              </button>
            </div>
            
            <hr style={{ margin: '2rem 0' }}/>

            <div className="pomodoro-duration-group">
                <div className="pomodoro-duration-input-row">
                    <label htmlFor="pomodoro-duration-input">Pomodoro Duration (minutes):</label>
                    <input
                        id="pomodoro-duration-input"
                        type="number"
                        value={pomodoroDurationMinutes}
                        onChange={(e) => handleSavePomodoroDuration(parseInt(e.target.value, 10))}
                        min="1"
                        max="60"
                        step="1"
                    />
                </div>
                <button onClick={handleResetPomodoroDuration} className="action-button reset-pomodoro-button">
                    Reset to Default (25 min)
                </button>
            </div>
            <hr style={{ margin: '2rem 0' }}/>
            <IssueList issues={issues} onStartTimer={handleStartTimer} isLoading={isLoading} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;