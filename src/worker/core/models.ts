import type { Issue } from '@paperclipai/plugin-sdk';
import type { ProviderType } from '../../providers/shared/types.ts';

export type PaperclipIssueStatus = Issue['status'];

export interface UpstreamUserReference {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  username?: string;
}

export interface SyncTaskFilters {
  onlyActive?: boolean;
  author?: UpstreamUserReference;
  assignee?: UpstreamUserReference;
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
}

export interface UpstreamProjectMapping {
  id: string;
  scopeId?: string;
  companyId?: string;
  providerId?: string;
  enabled?: boolean;
  upstreamProjectKey?: string;
  jiraProjectKey: string;
  upstreamQuery?: string;
  jiraJql?: string;
  paperclipProjectId?: string;
  paperclipProjectName: string;
  filters?: SyncTaskFilters;
}

export interface ProjectSyncMapping {
  id: string;
  enabled?: boolean;
  upstreamProjectKey?: string;
  jiraProjectKey: string;
  upstreamQuery?: string;
  jiraJql?: string;
  filters?: SyncTaskFilters;
}

export interface StatusMappingRule {
  upstreamStatus?: string;
  jiraStatus: string;
  paperclipStatus: PaperclipIssueStatus;
  assigneeAgentId?: string | null;
}

export interface SyncRunState {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
  processedCount?: number;
  totalCount?: number;
  importedCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  failedCount?: number;
  lastRunTrigger?: 'manual' | 'schedule' | 'pull' | 'push';
}

export interface ConnectionHealthState {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
  providerKey?: ProviderType;
  providerId?: string;
}

export type ConnectionHealthByProvider = Record<string, ConnectionHealthState>;

export interface AgentIssueProviderAccess {
  enabled: boolean;
  allowedAgentIds: string[];
}

export interface ProjectSyncConfig {
  id: string;
  scopeId?: string;
  companyId: string;
  projectId?: string;
  projectName: string;
  providerId?: string;
  agentIssueProviderAccess?: AgentIssueProviderAccess;
  defaultAssignee?: UpstreamUserReference;
  defaultStatus?: PaperclipIssueStatus;
  defaultStatusAssigneeAgentId?: string | null;
  statusMappings?: StatusMappingRule[];
  statusMappingsSource?: 'provider_default' | 'custom';
  scheduleFrequencyMinutes?: number;
  mappings: ProjectSyncMapping[];
  syncState?: SyncRunState;
  connectionTest?: ConnectionHealthState;
  updatedAt?: string;
}

export interface PluginSyncSettings {
  projectConfigs?: ProjectSyncConfig[];
  mappings: UpstreamProjectMapping[];
  syncStateByScopeId?: Record<string, SyncRunState>;
  syncStateByCompanyId?: Record<string, SyncRunState>;
  scheduleFrequencyMinutesByScopeId?: Record<string, number>;
  scheduleFrequencyMinutesByCompanyId?: Record<string, number>;
  filtersByScopeId?: Record<string, SyncTaskFilters>;
  filtersByCompanyId?: Record<string, SyncTaskFilters>;
  connectionTestByScopeId?: Record<string, ConnectionHealthByProvider>;
  connectionTestByCompanyId?: Record<string, ConnectionHealthByProvider>;
  updatedAt?: string;
}

export interface UpstreamProjectSearchResult {
  suggestions: Array<{
    id: string;
    key: string;
    displayName: string;
    url?: string;
  }>;
}

export interface UpstreamIssueRecord {
  id: string;
  key: string;
  uniqueUpstreamId: string;
  summary: string;
  description: string;
  url: string;
  comments: Array<{
    id: string;
    body: string;
    authorDisplayName: string;
    createdAt: string;
    updatedAt: string;
  }>;
  statusName: string;
  statusCategory: string;
  assigneeDisplayName?: string;
  creatorDisplayName?: string;
  updatedAt: string;
  createdAt: string;
  issueType: string;
}

export interface UpstreamIssueLinkData {
  issueId: string;
  companyId: string;
  projectId?: string;
  providerId?: string;
  uniqueUpstreamId: string;
  jiraIssueId: string;
  jiraIssueKey: string;
  jiraProjectKey: string;
  jiraUrl: string;
  jiraAssigneeDisplayName?: string;
  jiraCreatorDisplayName?: string;
  jiraStatusName: string;
  jiraStatusCategory: string;
  lastSyncedAt: string;
  lastPulledAt?: string;
  lastPushedAt?: string;
  linkedCommentCount?: number;
  source: 'jira' | 'paperclip';
  importedTitleHash?: string;
  importedDescriptionHash?: string;
}

export interface UpstreamCommentLinkData {
  commentId: string;
  issueId: string;
  companyId: string;
  jiraIssueKey: string;
  jiraCommentId: string;
  direction: 'pull' | 'push';
  lastSyncedAt: string;
}
