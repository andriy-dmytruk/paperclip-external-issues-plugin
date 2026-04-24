export type TaskFilters = {
  onlyActive?: boolean;
  author?: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
    username?: string;
  } | string;
  assignee?: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
    username?: string;
  };
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
};

export type CommentSyncPresentation = {
  visible: boolean;
  linked: boolean;
  origin: 'paperclip' | 'provider_pull' | 'provider_push';
  providerKey?: string;
  styleTone?: 'synced' | 'local' | 'info';
  badgeLabel?: string;
  jiraIssueKey?: string;
  jiraUrl?: string;
  upstreamCommentId?: string | null;
  isEditable?: boolean;
  uploadAvailable?: boolean;
  lastSyncedAt?: string | null;
  syncMessage?: string;
};

export function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'project-1',
    companyId: 'company-1',
    urlKey: 'alpha',
    goalId: null,
    goalIds: [],
    goals: [],
    name: 'Alpha',
    description: null,
    status: 'planned',
    leadAgentId: null,
    targetDate: null,
    color: null,
    env: null,
    pauseReason: null,
    pausedAt: null,
    executionWorkspacePolicy: null,
    codebase: {
      workspaceId: null,
      repoUrl: null,
      repoRef: null,
      defaultRef: null,
      repoName: null,
      localFolder: null,
      managedFolder: '',
      effectiveLocalFolder: '',
      origin: 'local_folder'
    },
    workspaces: [],
    primaryWorkspace: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}

export function makeIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'issue-1',
    companyId: 'company-1',
    projectId: 'project-1',
    projectWorkspaceId: null,
    goalId: null,
    parentId: null,
    title: 'Local Paperclip issue',
    description: 'Local body',
    status: 'todo',
    priority: 'medium',
    assigneeAgentId: null,
    assigneeUserId: null,
    checkoutRunId: null,
    executionRunId: null,
    executionAgentNameKey: null,
    executionLockedAt: null,
    createdByAgentId: null,
    createdByUserId: null,
    issueNumber: 1,
    identifier: 'PC-1',
    requestDepth: 0,
    billingCode: null,
    assigneeAdapterOverrides: null,
    executionWorkspaceId: null,
    executionWorkspacePreference: null,
    executionWorkspaceSettings: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    hiddenAt: null,
    labelIds: [],
    labels: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}

export function makeAgent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agent-1',
    companyId: 'company-1',
    name: 'Atlas',
    urlKey: 'atlas',
    role: 'member',
    title: 'Engineer',
    icon: null,
    status: 'idle',
    reportsTo: null,
    capabilities: null,
    adapterType: 'openai',
    adapterConfig: {},
    runtimeConfig: {},
    budgetMonthlyCents: 0,
    spentMonthlyCents: 0,
    pauseReason: null,
    pausedAt: null,
    permissions: {
      canCreateAgents: false
    },
    lastHeartbeatAt: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}
