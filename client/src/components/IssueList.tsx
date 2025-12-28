import React from 'react';
import { Issue } from '../types';

interface Props {
  issues: Issue[];
  onStartTimer: (issue: Issue) => void;
  isLoading: boolean;
}

// Helper function to format seconds into a more readable string like "1h 30m"
const formatTime = (seconds: number): string => {
  if (!seconds || seconds === 0) {
    return '0m';
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  let result = '';
  if (h > 0) {
    result += `${h}h `;
  }
  if (m > 0 || h === 0) {
    result += `${m}m`;
  }
  return result.trim();
};

const IssueList: React.FC<Props> = ({ issues, onStartTimer, isLoading }) => {
  if (isLoading) {
    return <div>Loading issues...</div>;
  }

  return (
    <div>
      <h2>Your Issues ({issues.length})</h2>
      {issues.length === 0 ? (
        <p>No issues found. Make sure you have issues assigned to you in Jira.</p>
      ) : (
        issues.map(issue => (
          <div key={issue.key} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>{issue.key}: {issue.summary}</h4>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  Status: {issue.status} | Total Time: <strong>{formatTime(issue.timeSpentSeconds)}</strong>
                </p>
              </div>
              <button onClick={() => onStartTimer(issue)} style={{ flexShrink: 0, marginLeft: '1rem' }}>
                Start Pomodoro
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default IssueList;
