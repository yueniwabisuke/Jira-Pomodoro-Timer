import React, { useState } from 'react';
import { JiraAuth } from '../types';
import './Settings.css';

interface Props {
  onSave: (auth: JiraAuth) => void;
  initialAuth?: JiraAuth;
}

const Settings: React.FC<Props> = ({ onSave, initialAuth }) => {
  const [domain, setDomain] = useState(initialAuth?.domain || '');
  const [email, setEmail] = useState(initialAuth?.email || '');
  const [token, setToken] = useState(initialAuth?.token || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !email || !token) {
      alert('Please fill in all fields.');
      return;
    }
    // Remove protocol and trailing slashes from domain for safety
    const cleanedDomain = domain.replace(/^(https?:\/\/)?/, '').replace(/\/+$/, '');
    onSave({ domain: cleanedDomain, email, token });
  };

  return (
    <div className="settings-container">
      <form onSubmit={handleSave}>
        <h1>Jira Configuration</h1>
        <p>Please provide your Jira credentials to connect.</p>
        
        <div className="form-group">
          <label htmlFor="domain">Jira Domain</label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="your-company.atlassian.net"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Jira Login Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="token">Jira API Token</label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Your Jira API Token"
          />
          <a 
            href="https://id.atlassian.com/manage-profile/security/api-tokens" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Create API Token
          </a>
        </div>

        <button type="submit">Save and Connect</button>
      </form>
    </div>
  );
};

export default Settings;
