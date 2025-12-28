export interface Issue {
  id: string;
  key: string;
  summary: string;
  status: string;
  timeSpentSeconds: number;
}

export interface JiraAuth {
  domain: string;
  email: string;
  token: string;
}
