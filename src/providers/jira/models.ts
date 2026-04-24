export interface JiraCommentRecord {
  id: string;
  body: string;
  authorDisplayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface JiraIssueRecord {
  id: string;
  key: string;
  summary: string;
  description: string;
  assigneeDisplayName?: string;
  creatorDisplayName?: string;
  statusName: string;
  statusCategory: string;
  updatedAt: string;
  createdAt: string;
  issueType: string;
  url: string;
  comments: JiraCommentRecord[];
}
