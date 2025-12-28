import axios from 'axios';
import { JiraAuth } from './types';

// Create a global axios instance
const api = axios.create({
  // The base URL will be proxied by Vite to the backend
  baseURL: '/api',
});

// Function to set auth headers on the global instance
export const setAuthHeaders = (auth: JiraAuth | null) => {
  if (auth) {
    api.defaults.headers.common['x-jira-domain'] = auth.domain;
    api.defaults.headers.common['x-jira-email'] = auth.email;
    api.defaults.headers.common['x-jira-token'] = auth.token;
  } else {
    // Clear headers if auth is cleared
    delete api.defaults.headers.common['x-jira-domain'];
    delete api.defaults.headers.common['x-jira-email'];
    delete api.defaults.headers.common['x-jira-token'];
  }
};

export default api;
