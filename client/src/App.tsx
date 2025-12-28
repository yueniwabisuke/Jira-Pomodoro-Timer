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

function App() {
  const [jiraAuth, setJiraAuth] = useState<JiraAuth | null>(null);
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
    return <Timer activeIssue={activeIssue} onTimerStop={handleTimerStop} />;
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
            <IssueList issues={issues} onStartTimer={handleStartTimer} isLoading={isLoading} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;