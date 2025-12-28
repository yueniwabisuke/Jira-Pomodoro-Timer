import express, { Request, Response } from 'express';
import cors from 'cors';
import axios, { isAxiosError } from 'axios';

const app = express();
const port = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Helper function to create a Jira API client per request ---
const getJiraClient = (req: Request) => {
  const jiraDomain = req.headers['x-jira-domain'] as string;
  const jiraEmail = req.headers['x-jira-email'] as string;
  const jiraToken = req.headers['x-jira-token'] as string;

  if (!jiraDomain || !jiraEmail || !jiraToken) {
    return null;
  }

  return axios.create({
    baseURL: `https://${jiraDomain}/rest/api/3`,
    headers: {
      'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
};


// --- API Endpoints ---

// GET /api/issues: Fetch issues for the user specified in headers
app.get('/api/issues', async (req: Request, res: Response) => {
  const jiraApi = getJiraClient(req);
  if (!jiraApi) {
    return res.status(400).json({ message: 'Jira authentication headers are missing.' });
  }

  try {
    console.log('Fetching issues from Jira...');
    const requestBody = {
      jql: 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC',
      fields: ['summary', 'status', 'timetracking'],
    };
    const response = await jiraApi.post('/search/jql', requestBody);

    const issues = response.data.issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      timeSpentSeconds: issue.fields.timetracking?.timeSpentSeconds || 0,
    }));

    console.log(`Found ${issues.length} issues.`);
    res.json(issues);

  } catch (error) {
    console.error('--- Error fetching Jira issues ---');
    if (isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        return res.status(error.response?.status || 500).json(error.response?.data);
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});

// POST /api/issues/:issueKey/worklog: Add a worklog to an issue
app.post('/api/issues/:issueKey/worklog', async (req: Request, res: Response) => {
  const jiraApi = getJiraClient(req);
  if (!jiraApi) {
    return res.status(400).json({ message: 'Jira authentication headers are missing.' });
  }
  
  const { issueKey } = req.params;
  const { timeSpentSeconds } = req.body;

  if (!timeSpentSeconds || typeof timeSpentSeconds !== 'number') {
    return res.status(400).json({ message: 'timeSpentSeconds (number) is required.' });
  }

  try {
    console.log(`Adding worklog to issue ${issueKey}...`);
    await jiraApi.post(`/issue/${issueKey}/worklog`, { timeSpentSeconds });
    res.status(201).json({ message: 'Worklog added successfully' });

  } catch (error) {
    console.error(`--- Error adding worklog to ${issueKey} ---`);
    if (isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        return res.status(error.response?.status || 500).json(error.response?.data);
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  console.log('Now waiting for requests from the frontend with auth headers.');
});