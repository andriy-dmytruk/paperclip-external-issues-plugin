import type { ProviderType } from './plugin-config.js';
import type { UpstreamUserReference } from './assignees.js';

export type MappingRow = {
  id: string;
  providerId: string;
  enabled?: boolean;
  jiraProjectKey: string;
  jiraJql: string;
  paperclipProjectId: string;
  paperclipProjectName: string;
  filters: TaskFilters;
};

export type TaskFilters = {
  onlyActive?: boolean;
  author?: UpstreamUserReference;
  assignee?: UpstreamUserReference;
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
};

export type StatusMappingRow = {
  id: string;
  jiraStatus: string;
  paperclipStatus: string;
  assigneeAgentId?: string | null;
};

export type AssignableAgent = {
  id: string;
  name: string;
  title?: string | null;
  status?: string;
};

export type AgentIssueProviderAccess = {
  enabled: boolean;
  allowedAgentIds: string[];
};

export type ProjectSettingsTabId = 'essential' | 'agent-access' | 'mappings' | 'status-mapping';

export type SyncProgressState = {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
  processedCount?: number;
  totalCount?: number;
  importedCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  failedCount?: number;
};

export type ConnectionTestState = {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
};

export type ProjectToolbarState = {
  configured: boolean;
  syncFailed?: boolean;
  syncStatus?: 'idle' | 'running' | 'success' | 'error' | string;
  providerType?: ProviderType | null;
  providerName?: string | null;
  projectId?: string;
};

export type IssueSyncPresentation = {
  visible: boolean;
  isSynced: boolean;
  supportsIssueUpdate?: boolean;
  supportsStatusUpdates?: boolean;
  supportsAssignableUsers?: boolean;
  supportsComments?: boolean;
  providerKey?: string;
  upstreamProviderId?: string | null;
  issueId?: string;
  localStatus?: string;
  upstreamIssueKey?: string | null;
  titlePrefix?: string | null;
  openInProviderUrl?: string | null;
  lastSyncedAt?: string | null;
  syncTone?: 'local' | 'synced' | 'needs_attention';
  mapping?: {
    jiraProjectKey: string;
    paperclipProjectName: string;
  };
  upstreamStatus?: {
    name: string;
    category: string;
  };
  upstreamTransitions?: Array<{
    id: string;
    name: string;
  }>;
  upstream?: {
    issueKey: string;
    jiraUrl: string;
    jiraAssigneeDisplayName?: string;
    jiraCreatorDisplayName?: string;
    jiraStatusName: string;
    jiraStatusCategory: string;
    lastSyncedAt?: string;
    lastPulledAt?: string;
    lastPushedAt?: string;
    source: 'jira' | 'paperclip';
  };
  upstreamComments?: Array<{
    id: string;
    body: string;
    authorDisplayName: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type CommentSyncPresentation = {
  visible: boolean;
  linked: boolean;
  origin: 'paperclip' | 'provider_pull' | 'provider_push';
  providerKey?: ProviderType;
  jiraIssueKey?: string;
  jiraUrl?: string;
  upstreamCommentId?: string | null;
  styleTone?: 'synced' | 'local' | 'info';
  badgeLabel?: string;
  isEditable?: boolean;
  uploadAvailable?: boolean;
  lastSyncedAt?: string | null;
  syncMessage?: string;
};

export type CleanupCandidate = {
  issueId: string;
  title: string;
  jiraIssueKey: string;
  status: string;
};

export type UpstreamUserSearchData = {
  suggestions: UpstreamUserReference[];
  errorMessage?: string;
};

export type UpstreamProjectSuggestion = {
  id: string;
  key: string;
  displayName: string;
  url?: string;
};

export type UpstreamProjectSearchData = {
  suggestions: UpstreamProjectSuggestion[];
  errorMessage?: string;
};
