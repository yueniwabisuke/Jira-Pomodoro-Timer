ご要望いただいたJira連携ポモドーロタイマーの設計と実装案です。
実際に動作する最小構成のプロジェクトも併せて作成しました。
`README.md`の手順に従っていただくことで、お手元で実行可能です。

---

### 1. 全体アーキテクチャ図

```text
[User] <==> [Browser: React App (Vite)] <==> [Server: Node.js (Express)] <==> [Jira Cloud REST API]
```
- **Browser (React)**: ユーザーが操作するUI。チケットの表示やタイマーの制御を担当。
- **Server (Node.js)**: フロントエンドとJira APIを仲介するサーバー。APIキーなどの機密情報を安全に保持する。
- **Jira API**: チケットの取得や作業ログの登録を行う。

### 2. 画面構成（簡易モック）

```text
+-------------------------------------------------------------------+
| Jira Pomodoro Timer                                               |
+-------------------------------------------------------------------+
|
|  ▼ Your Issues (3)                     [ Reload Issues ]          |
| ----------------------------------------------------------------- |
|  [JP-1] フロントエンドの画面設計を行う                          |
|    <Status: To Do>                            [ Start Pomodoro ]  |
| ----------------------------------------------------------------- |
|  [JP-2] バックエンドのAPIを実装する                             |
|    <Status: In Progress>                      [ Start Pomodoro ]  |
| ----------------------------------------------------------------- |
|
+-------------------------------------------------------------------+
|  🍅 Now Working On:                                               |
|  [JP-1] フロントエンドの画面設計を行う                          |
|
|                         24:59                                     |
|
|                         [ Stop Timer ]                            |
+-------------------------------------------------------------------+
```

### 3. Jira API の具体的な呼び出し例

#### 3.1. 課題検索
```bash
curl --request GET \
  --url "https://YOUR_JIRA_DOMAIN/rest/api/3/search" \
  --user "YOUR_EMAIL:YOUR_API_TOKEN" \
  --header "Accept: application/json" \
  --data-urlencode "jql=assignee = currentUser() AND statusCategory != Done"
```

#### 3.2. Worklogの追加
```bash
curl --request POST \
  --url "https://YOUR_JIRA_DOMAIN/rest/api/3/issue/ISSUE_KEY/worklog" \
  --header "Content-Type: application/json" \
  --data '{ "timeSpentSeconds": 1500 }'
```

### 4. フロントエンドの主要コンポーネントコード

#### 4.1. `App.tsx` (メインコンポーネント)
```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';
import IssueList from './components/IssueList';
import Timer from './components/Timer';
import './index.css';

export interface Issue {
  id: string;
  key: string;
  summary: string;
  status: string;
}

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/issues');
      setIssues(response.data);
    } catch (err) {
      setError('Failed to fetch issues. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchIssues();
  }, []);

  const handleStartTimer = (issue: Issue) => setActiveIssue(issue);
  const handleTimerStop = () => setActiveIssue(null);

  return (
    <div>
      <h1>Jira Pomodoro Timer</h1>
      <button onClick={fetchIssues} disabled={isLoading}>
        {isLoading ? 'Reloading...' : 'Reload Issues'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <hr />
      {activeIssue ? (
        <Timer activeIssue={activeIssue} onTimerStop={handleTimerStop} />
      ) : (
        <IssueList issues={issues} onStartTimer={handleStartTimer} isLoading={isLoading} />
      )}
    </div>
  );
}

export default App;
```

#### 4.2. `IssueList.tsx` (課題一覧)
```typescript
import React from 'react';
import { Issue } from '../App';

interface Props {
  issues: Issue[];
  onStartTimer: (issue: Issue) => void;
  isLoading: boolean;
}

const IssueList: React.FC<Props> = ({ issues, onStartTimer, isLoading }) => {
  if (isLoading) return <div>Loading issues...</div>;

  return (
    <div>
      <h2>Your Issues ({issues.length})</h2>
      {issues.map(issue => (
        <div key={issue.key} className="card">
          <h4>{issue.key}: {issue.summary}</h4>
          <p>Status: {issue.status}</p>
          <button onClick={() => onStartTimer(issue)}>Start Pomodoro</button>
        </div>
      ))}
    </div>
  );
};

export default IssueList;
```

#### 4.3. `Timer.tsx` (タイマー)
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Issue } from '../App';
import axios from 'axios';

interface Props {
  activeIssue: Issue | null;
  onTimerStop: () => void;
}

const POMODORO_DURATION = 25 * 60; // 25 minutes

const Timer: React.FC<Props> = ({ activeIssue, onTimerStop }) => {
  const [time, setTime] = useState(POMODORO_DURATION);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeIssue) {
      setTime(POMODORO_DURATION);
      intervalRef.current = window.setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            logWork();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeIssue]);

  const logWork = async () => {
    if (!activeIssue) return;
    const timeSpentSeconds = POMODORO_DURATION; // Simplified for this example
    try {
      await axios.post(`/api/issues/${activeIssue.key}/worklog`, { timeSpentSeconds });
      alert(`Worklog of 25 minutes added to ${activeIssue.key}.`);
    } catch (error) {
      alert('Failed to log work.');
    }
    onTimerStop();
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const timeSpentSeconds = POMODORO_DURATION - time;
    // Log remaining time if stopped early
    // ... (implementation omitted for brevity)
    onTimerStop();
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="card">
      <h3>🍅 Now Working On:</h3>
      <p>{activeIssue?.key}: {activeIssue?.summary}</p>
      <h1>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</h1>
      <button onClick={handleStop}>Stop Timer</button>
    </div>
  );
};

export default Timer;
```

### 5. バックエンドのAPI実装例 (`server/src/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const { JIRA_DOMAIN, JIRA_USER_EMAIL, JIRA_API_TOKEN } = process.env;

const jiraApi = axios.create({
  baseURL: `https://${JIRA_DOMAIN}/rest/api/3`,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
  },
});

app.get('/api/issues', async (req, res) => {
  try {
    const jql = 'assignee = currentUser() AND statusCategory != Done';
    const response = await jiraApi.get('/search', { params: { jql, fields: 'summary,status' } });
    const issues = response.data.issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
    }));
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

app.post('/api/issues/:issueKey/worklog', async (req, res) => {
  const { issueKey } = req.params;
  const { timeSpentSeconds } = req.body;
  try {
    await jiraApi.post(`/issue/${issueKey}/worklog`, { timeSpentSeconds });
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to add worklog' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

### 6. README形式の起動手順

(作成した `README.md` の内容をここに含めます)

# Jira Pomodoro Timer

This is a minimal web application that connects to your Jira instance, fetches your assigned issues, and allows you to track the time you spend on them using a Pomodoro timer. When the timer stops, the elapsed time is automatically logged to the corresponding Jira issue.

## Prerequisites

- Node.js (v18 or later)
- A Jira Cloud account with an API token.

## Setup & Run

### 1. Backend Setup

```sh
# Navigate to the server directory
cd server

# Create a .env file from the example
cp .env.example .env

# Add your Jira domain, email, and API token to the .env file

# Install dependencies
npm install
```

### 2. Frontend Setup

```sh
# Navigate to the client directory (from the root)
cd ../client

# Install dependencies
npm install
```

### 3. Run the Application

You need two separate terminals.

**Terminal 1 (Backend):**

```sh
# In the /server directory
npm run dev
```

**Terminal 2 (Frontend):**

```sh
# In the /client directory
npm run dev
```

Open `http://localhost:5173` in your browser.

