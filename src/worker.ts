import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Octokit } from '@octokit/rest';
import { definePlugin, runWorker, type Issue, type IssueComment, type PluginLauncherRegistration, type ToolResult, type ToolRunContext } from '@paperclipai/plugin-sdk';
import { ApiApi as JiraApiClient } from '../generated/jira-dc-client/9.12.0/apis/ApiApi.ts';
import {
  Configuration as JiraApiConfiguration,
  FetchError as JiraFetchError,
  querystring as jiraApiQuerystring,
  ResponseError as JiraResponseError
} from '../generated/jira-dc-client/9.12.0/runtime.ts';
import { createProviderRegistry } from './providers/index.ts';
import {
  DEFAULT_GITHUB_API_BASE_URL,
  DEFAULT_JIRA_ISSUE_TYPE,
  isGitHubProviderType,
  isJiraProviderType,
  normalizeProviderConfig as normalizeSharedProviderConfig,
  normalizeProviderConfigs,
  normalizeProviderType,
  type GitHubIssuesProviderConfig,
  type JiraCloudProviderConfig,
  type JiraDcProviderConfig,
  type ProviderConfig
} from './providers/shared/config.ts';
import type { CanonicalUpstreamProject, ProviderType } from './providers/shared/types.ts';
import { parseRepositoryReference } from './github-repo.ts';
import { getIssueProviderAgentToolDeclaration } from './issue-provider-agent-tools.ts';

const SETTINGS_SCOPE = {
  scopeKind: 'instance' as const,
  stateKey: 'paperclip-jira-plugin-settings'
};

const ISSUE_LINK_ENTITY_TYPE = 'paperclip-jira-plugin.issue-link';
const HIDDEN_ISSUE_MARKER_PREFIX = '<!-- paperclip-jira-plugin-upstream: ';
const HIDDEN_ISSUE_MARKER_SUFFIX = ' -->';
const DEFAULT_SYNC_FREQUENCY_MINUTES = 15;
const DEFAULT_ISSUE_TYPE = DEFAULT_JIRA_ISSUE_TYPE;
const COMMENT_LINKS_STATE_KEY = 'paperclip-jira-plugin-comment-links';
const DEFAULT_PROVIDER_ID = 'provider-default-jira';
const DEFAULT_CONNECTION_TEST_KEY = '__default__';
const providerRegistry = createProviderRegistry();

type PluginSetupContext = Parameters<Parameters<typeof definePlugin>[0]['setup']>[0];
type PaperclipIssueStatus = Issue['status'];
const DEFAULT_PAPERCLIP_STATUS: PaperclipIssueStatus = 'todo';
const DEFAULT_EXPLICIT_STATUS_MAPPINGS: JiraStatusMapping[] = [{
  jiraStatus: 'Closed',
  paperclipStatus: 'done'
}, {
  jiraStatus: 'Done',
  paperclipStatus: 'done'
}];

interface JiraMapping {
  id: string;
  companyId?: string;
  providerId?: string;
  enabled?: boolean;
  jiraProjectKey: string;
  jiraJql?: string;
  paperclipProjectId?: string;
  paperclipProjectName: string;
  filters?: JiraTaskFilters;
}

interface JiraProjectMapping {
  id: string;
  enabled?: boolean;
  jiraProjectKey: string;
  jiraJql?: string;
  filters?: JiraTaskFilters;
}

interface JiraStatusMapping {
  jiraStatus: string;
  paperclipStatus: PaperclipIssueStatus;
  assigneeAgentId?: string | null;
}

interface SyncRunState {
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

interface ConnectionTestState {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
  providerKey?: ProviderType;
  providerId?: string;
}

type ConnectionTestStateByProvider = Record<string, ConnectionTestState>;

interface JiraUserReference {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  username?: string;
}

interface UpstreamProjectSearchResult {
  suggestions: CanonicalUpstreamProject[];
}

interface JiraTaskFilters {
  onlyActive?: boolean;
  author?: JiraUserReference;
  assignee?: JiraUserReference;
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
}

interface JiraSyncSettings {
  projectConfigs?: JiraProjectSyncConfig[];
  mappings: JiraMapping[];
  syncStateByCompanyId?: Record<string, SyncRunState>;
  scheduleFrequencyMinutesByCompanyId?: Record<string, number>;
  filtersByCompanyId?: Record<string, JiraTaskFilters>;
  connectionTestByCompanyId?: Record<string, ConnectionTestStateByProvider>;
  updatedAt?: string;
}

interface JiraProjectSyncConfig {
  id: string;
  companyId: string;
  projectId?: string;
  projectName: string;
  providerId?: string;
  agentIssueProviderAccess?: AgentIssueProviderAccess;
  defaultAssignee?: JiraUserReference;
  defaultStatus?: PaperclipIssueStatus;
  defaultStatusAssigneeAgentId?: string | null;
  statusMappings?: JiraStatusMapping[];
  scheduleFrequencyMinutes?: number;
  mappings: JiraProjectMapping[];
  syncState?: SyncRunState;
  connectionTest?: ConnectionTestState;
  updatedAt?: string;
}

interface JiraConfig {
  providerId: string;
  providerName: string;
  baseUrl?: string;
  userEmail?: string;
  token?: string;
  defaultIssueType: string;
}

interface AgentIssueProviderAccess {
  enabled: boolean;
  allowedAgentIds: string[];
}

interface GitHubConfig {
  providerId: string;
  providerName: string;
  apiBaseUrl: string;
  token?: string;
  defaultRepository?: string;
}

interface ProviderDisplayConfig {
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  baseUrl?: string;
  userEmail?: string;
  defaultIssueType?: string;
  githubApiBaseUrl?: string;
  defaultRepository?: string;
  tokenSaved: boolean;
}

type ProviderConfigRecord = Partial<ProviderConfig> & Record<string, unknown>;

interface JiraIssueRecord {
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

interface JiraCommentRecord {
  id: string;
  body: string;
  authorDisplayName: string;
  createdAt: string;
  updatedAt: string;
}

type GitHubIssueStateReason = 'completed' | 'not_planned' | 'duplicate' | 'reopened';

interface JiraIssueLinkData {
  issueId: string;
  companyId: string;
  projectId?: string;
  providerId?: string;
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

interface JiraCommentLinkData {
  commentId: string;
  issueId: string;
  companyId: string;
  jiraIssueKey: string;
  jiraCommentId: string;
  direction: 'pull' | 'push';
  lastSyncedAt: string;
}

const ENTITY_SYNC_LAUNCHER: PluginLauncherRegistration = {
  id: 'paperclip-jira-plugin-entity-launcher',
  displayName: 'Sync Issues',
  description: 'Open the issue sync dialog for the current entity.',
  placementZone: 'toolbarButton',
  entityTypes: ['project'],
  action: {
    type: 'openModal',
    target: 'JiraSyncLauncherModal'
  },
  render: {
    environment: 'hostOverlay',
    bounds: 'wide'
  }
};

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  return undefined;
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map((entry) => normalizeOptionalString(entry))
        .filter((entry): entry is string => Boolean(entry))
    : [];
}

function normalizeAgentIssueProviderAccess(value: unknown): AgentIssueProviderAccess | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const enabled = normalizeBoolean(record.enabled);
  if (enabled === undefined) {
    return undefined;
  }

  return {
    enabled,
    allowedAgentIds: normalizeStringArray(record.allowedAgentIds)
  };
}

function normalizeInputRecord(input: unknown): Record<string, unknown> {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const params = record.params;
  if (!params || typeof params !== 'object') {
    return record;
  }

  return {
    ...record,
    ...(params as Record<string, unknown>)
  };
}

function normalizeCompanyId(value: unknown): string | undefined {
  return normalizeOptionalString(value);
}

function normalizeJiraUserReference(value: unknown): JiraUserReference | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    return {
      accountId: trimmed,
      displayName: trimmed,
      username: trimmed
    };
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const accountId =
    normalizeOptionalString(record.accountId)
    ?? normalizeOptionalString(record.name)
    ?? normalizeOptionalString(record.key)
    ?? normalizeOptionalString(record.id);
  const displayName =
    normalizeOptionalString(record.displayName)
    ?? normalizeOptionalString(record.emailAddress)
    ?? normalizeOptionalString(record.name)
    ?? normalizeOptionalString(record.key)
    ?? accountId;

  if (!accountId || !displayName) {
    return undefined;
  }

  return {
    accountId,
    displayName,
    ...(normalizeOptionalString(record.emailAddress) ? { emailAddress: normalizeOptionalString(record.emailAddress) } : {}),
    ...(normalizeOptionalString(record.username) || normalizeOptionalString(record.name) || normalizeOptionalString(record.key)
      ? { username: normalizeOptionalString(record.username) ?? normalizeOptionalString(record.name) ?? normalizeOptionalString(record.key) }
      : {})
  };
}

function getJiraPersonDisplayName(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  return normalizeOptionalString(record.displayName)
    ?? normalizeOptionalString(record.emailAddress)
    ?? normalizeOptionalString(record.name)
    ?? normalizeOptionalString(record.key)
    ?? normalizeOptionalString(record.accountId)
    ?? normalizeOptionalString(record.id);
}

function getJiraUserQueryValue(user?: JiraUserReference): string | undefined {
  return user?.accountId ?? user?.username;
}

function normalizeSyncState(value: unknown): SyncRunState {
  if (!value || typeof value !== 'object') {
    return { status: 'idle' };
  }

  const record = value as Record<string, unknown>;
  const status = record.status;
  return {
    status:
      status === 'running' || status === 'success' || status === 'error'
        ? status
        : 'idle',
    ...(normalizeOptionalString(record.message) ? { message: normalizeOptionalString(record.message) } : {}),
    ...(normalizeOptionalString(record.checkedAt) ? { checkedAt: normalizeOptionalString(record.checkedAt) } : {}),
    ...(typeof record.processedCount === 'number' ? { processedCount: record.processedCount } : {}),
    ...(typeof record.totalCount === 'number' ? { totalCount: record.totalCount } : {}),
    ...(typeof record.importedCount === 'number' ? { importedCount: record.importedCount } : {}),
    ...(typeof record.updatedCount === 'number' ? { updatedCount: record.updatedCount } : {}),
    ...(typeof record.skippedCount === 'number' ? { skippedCount: record.skippedCount } : {}),
    ...(typeof record.failedCount === 'number' ? { failedCount: record.failedCount } : {}),
    ...(record.lastRunTrigger === 'manual' || record.lastRunTrigger === 'schedule' || record.lastRunTrigger === 'pull' || record.lastRunTrigger === 'push'
      ? { lastRunTrigger: record.lastRunTrigger }
      : {})
  };
}

function normalizeConnectionTestState(value: unknown): ConnectionTestState {
  if (!value || typeof value !== 'object') {
    return { status: 'idle' };
  }

  const record = value as Record<string, unknown>;
  return {
    status:
      record.status === 'testing' || record.status === 'success' || record.status === 'error'
        ? record.status
        : 'idle',
    ...(normalizeOptionalString(record.message) ? { message: normalizeOptionalString(record.message) } : {}),
    ...(normalizeOptionalString(record.checkedAt) ? { checkedAt: normalizeOptionalString(record.checkedAt) } : {}),
    ...(normalizeOptionalString(record.providerKey) ? { providerKey: normalizeOptionalString(record.providerKey) as ProviderType } : {}),
    ...(normalizeOptionalString(record.providerId) ? { providerId: normalizeOptionalString(record.providerId) } : {})
  };
}

function normalizeConnectionTestStateByProvider(value: unknown): ConnectionTestStateByProvider {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const record = value as Record<string, unknown>;
  const looksLikeSingleState =
    'status' in record
    || 'message' in record
    || 'checkedAt' in record
    || 'providerKey' in record
    || 'providerId' in record;

  if (looksLikeSingleState) {
    const normalized = normalizeConnectionTestState(value);
    const key = normalized.providerId ?? DEFAULT_CONNECTION_TEST_KEY;
    return { [key]: normalized };
  }

  return Object.fromEntries(
    Object.entries(record)
      .map(([providerId, state]) => [providerId, normalizeConnectionTestState(state)] as const)
      .filter(([, state]) => (
        state.status !== 'idle'
        || Boolean(state.message)
        || Boolean(state.checkedAt)
        || Boolean(state.providerKey)
        || Boolean(state.providerId)
      ))
  );
}

function normalizeFilterNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : undefined;
  }
  return undefined;
}

function normalizeTaskFilters(value: unknown): JiraTaskFilters {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const record = value as Record<string, unknown>;
  const author = normalizeJiraUserReference(record.author);
  const assignee = normalizeJiraUserReference(record.assignee);
  return {
    ...(typeof record.onlyActive === 'boolean' ? { onlyActive: record.onlyActive } : {}),
    ...(author ? { author } : {}),
    ...(assignee ? { assignee } : {}),
    ...(normalizeFilterNumber(record.issueNumberGreaterThan) !== undefined
      ? { issueNumberGreaterThan: normalizeFilterNumber(record.issueNumberGreaterThan) }
      : {}),
    ...(normalizeFilterNumber(record.issueNumberLessThan) !== undefined
      ? { issueNumberLessThan: normalizeFilterNumber(record.issueNumberLessThan) }
      : {})
  };
}

function normalizePaperclipStatus(value: unknown): PaperclipIssueStatus | undefined {
  return value === 'backlog'
    || value === 'todo'
    || value === 'in_progress'
    || value === 'in_review'
    || value === 'blocked'
    || value === 'done'
    || value === 'cancelled'
    ? value
    : undefined;
}

function normalizeJiraStatusMapping(value: unknown): JiraStatusMapping | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const jiraStatus = normalizeOptionalString(record.jiraStatus);
  const paperclipStatus = normalizePaperclipStatus(record.paperclipStatus);
  if (!jiraStatus || !paperclipStatus) {
    return null;
  }

  return {
    jiraStatus,
    paperclipStatus,
    ...(Object.prototype.hasOwnProperty.call(record, 'assigneeAgentId')
      ? { assigneeAgentId: normalizeOptionalString(record.assigneeAgentId) ?? null }
      : {})
  };
}

function getDefaultStatusMappings(): JiraStatusMapping[] {
  return DEFAULT_EXPLICIT_STATUS_MAPPINGS.map((entry) => ({ ...entry }));
}

function getEffectiveStatusMappings(projectConfig: JiraProjectSyncConfig | null): JiraStatusMapping[] {
  if (!projectConfig?.statusMappings?.length) {
    return getDefaultStatusMappings();
  }

  return projectConfig.statusMappings;
}

function normalizeProviderConfig(value: unknown, index: number): ProviderConfig | null {
  return normalizeSharedProviderConfig(value, index);
}

function normalizeStoredProjectKey(value: unknown): string | undefined {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    return undefined;
  }

  return parseRepositoryReference(normalized) ? normalized : normalized.toUpperCase();
}

function normalizeMapping(value: unknown, index: number): JiraMapping | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const jiraProjectKey = normalizeStoredProjectKey(record.jiraProjectKey);
  const paperclipProjectName = normalizeOptionalString(record.paperclipProjectName);

  if (!jiraProjectKey || !paperclipProjectName) {
    return null;
  }

  return {
    id: normalizeOptionalString(record.id) ?? `mapping-${index + 1}`,
    ...(typeof record.enabled === 'boolean' ? { enabled: record.enabled } : {}),
    jiraProjectKey,
    paperclipProjectName,
    ...(normalizeOptionalString(record.providerId) ? { providerId: normalizeOptionalString(record.providerId) } : {}),
    ...(normalizeOptionalString(record.jiraJql) ? { jiraJql: normalizeOptionalString(record.jiraJql) } : {}),
    ...(normalizeOptionalString(record.paperclipProjectId) ? { paperclipProjectId: normalizeOptionalString(record.paperclipProjectId) } : {}),
    ...(record.filters ? { filters: normalizeTaskFilters(record.filters) } : {}),
    ...(normalizeCompanyId(record.companyId) ? { companyId: normalizeCompanyId(record.companyId) } : {})
  };
}

function normalizeProjectMapping(value: unknown, index: number): JiraProjectMapping | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const jiraProjectKey = normalizeStoredProjectKey(record.jiraProjectKey);
  if (!jiraProjectKey) {
    return null;
  }

  return {
    id: normalizeOptionalString(record.id) ?? `mapping-${index + 1}`,
    ...(typeof record.enabled === 'boolean' ? { enabled: record.enabled } : {}),
    jiraProjectKey,
    ...(normalizeOptionalString(record.jiraJql) ? { jiraJql: normalizeOptionalString(record.jiraJql) } : {}),
    ...(record.filters ? { filters: normalizeTaskFilters(record.filters) } : {})
  };
}

function normalizeProjectConfig(value: unknown, index: number): JiraProjectSyncConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const companyId = normalizeCompanyId(record.companyId);
  const projectName = normalizeOptionalString(record.projectName);
  const rawMappings = Array.isArray(record.mappings) ? record.mappings : [];

  if (!companyId || !projectName) {
    return null;
  }

  return {
    id: normalizeOptionalString(record.id) ?? `project-config-${index + 1}`,
    companyId,
    projectName,
    ...(normalizeOptionalString(record.projectId) ? { projectId: normalizeOptionalString(record.projectId) } : {}),
    ...(normalizeOptionalString(record.providerId) ? { providerId: normalizeOptionalString(record.providerId) } : {}),
    ...(normalizeAgentIssueProviderAccess(record.agentIssueProviderAccess)
      ? { agentIssueProviderAccess: normalizeAgentIssueProviderAccess(record.agentIssueProviderAccess) }
      : {}),
    ...(normalizeJiraUserReference(record.defaultAssignee) ? { defaultAssignee: normalizeJiraUserReference(record.defaultAssignee) } : {}),
    ...(normalizePaperclipStatus(record.defaultStatus) ? { defaultStatus: normalizePaperclipStatus(record.defaultStatus) } : {}),
    ...(Object.prototype.hasOwnProperty.call(record, 'defaultStatusAssigneeAgentId')
      ? { defaultStatusAssigneeAgentId: normalizeOptionalString(record.defaultStatusAssigneeAgentId) ?? null }
      : {}),
    ...(Array.isArray(record.statusMappings)
      ? {
          statusMappings: record.statusMappings
            .map((entry) => normalizeJiraStatusMapping(entry))
            .filter((entry): entry is JiraStatusMapping => entry !== null)
        }
      : {}),
    ...(normalizeFrequencyMinutes(record.scheduleFrequencyMinutes) !== null
      ? { scheduleFrequencyMinutes: normalizeFrequencyMinutes(record.scheduleFrequencyMinutes) ?? undefined }
      : {}),
    mappings: rawMappings
      .map((entry, mappingIndex) => normalizeProjectMapping(entry, mappingIndex))
      .filter((entry): entry is JiraProjectMapping => entry !== null),
    ...(record.syncState ? { syncState: normalizeSyncState(record.syncState) } : {}),
    ...(record.connectionTest ? { connectionTest: normalizeConnectionTestState(record.connectionTest) } : {}),
    ...(normalizeOptionalString(record.updatedAt) ? { updatedAt: normalizeOptionalString(record.updatedAt) } : {})
  };
}

function hasLegacyProviderConfig(value: Record<string, unknown>): boolean {
  return Boolean(
    normalizeOptionalString(value.jiraBaseUrl)
    || normalizeOptionalString(value.jiraUserEmail)
    || normalizeOptionalString(value.jiraToken)
    || normalizeOptionalString(value.jiraTokenRef)
    || normalizeOptionalString(value.defaultIssueType)
  );
}

function getProvidersFromConfig(value: unknown): ProviderConfig[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const record = value as Record<string, unknown>;
  const providers = normalizeProviderConfigs(record.providers);
  if (providers.length > 0) {
    return providers;
  }

  if (!hasLegacyProviderConfig(record)) {
    return [];
  }

  return [{
    id: DEFAULT_PROVIDER_ID,
    type: 'jira_dc',
    name: 'Default Jira',
    ...(normalizeOptionalString(record.jiraBaseUrl) ? { jiraBaseUrl: normalizeOptionalString(record.jiraBaseUrl) } : {}),
    ...(normalizeOptionalString(record.jiraUserEmail) ? { jiraUserEmail: normalizeOptionalString(record.jiraUserEmail) } : {}),
    ...(normalizeOptionalString(record.jiraToken) ? { jiraToken: normalizeOptionalString(record.jiraToken) } : {}),
    ...(normalizeOptionalString(record.jiraTokenRef) ? { jiraTokenRef: normalizeOptionalString(record.jiraTokenRef) } : {}),
    ...(normalizeOptionalString(record.defaultIssueType) ? { defaultIssueType: normalizeOptionalString(record.defaultIssueType) } : {})
  }] satisfies ProviderConfig[];
}

function legacyMappingsToProjectConfigs(params: {
  mappings: JiraMapping[];
  scheduleByCompanyId: Record<string, unknown>;
  syncStateByCompanyId: Record<string, unknown>;
  filtersByCompanyId: Record<string, unknown>;
  connectionTestByCompanyId: Record<string, ConnectionTestStateByProvider>;
}): JiraProjectSyncConfig[] {
  const grouped = new Map<string, JiraProjectSyncConfig>();

  for (const mapping of params.mappings) {
    const companyId = mapping.companyId;
    const projectName = mapping.paperclipProjectName.trim();
    if (!companyId || !projectName) {
      continue;
    }

    const groupKey = `${companyId}:${mapping.paperclipProjectId ?? normalizeProjectName(projectName) ?? projectName}`;
    const existing = grouped.get(groupKey);
    if (existing) {
      existing.mappings.push({
        id: mapping.id,
        jiraProjectKey: mapping.jiraProjectKey,
        ...(mapping.jiraJql ? { jiraJql: mapping.jiraJql } : {}),
        ...(mapping.filters ? { filters: mapping.filters } : {})
      });
      continue;
    }

    const legacyCompanyFilters = normalizeTaskFilters(params.filtersByCompanyId[companyId]);
    const legacyConnectionTest = getConnectionTestStateFromCollection(
      params.connectionTestByCompanyId[companyId],
      mapping.providerId
    );
    grouped.set(groupKey, {
      id: `project-config-${grouped.size + 1}`,
      companyId,
      projectName,
      ...(mapping.paperclipProjectId ? { projectId: mapping.paperclipProjectId } : {}),
      ...(mapping.providerId ? { providerId: mapping.providerId } : {}),
      agentIssueProviderAccess: {
        enabled: false,
        allowedAgentIds: []
      },
      ...(legacyCompanyFilters.assignee ? { defaultAssignee: legacyCompanyFilters.assignee } : {}),
      defaultStatus: DEFAULT_PAPERCLIP_STATUS,
      defaultStatusAssigneeAgentId: null,
      statusMappings: getDefaultStatusMappings(),
      ...(normalizeFrequencyMinutes(params.scheduleByCompanyId[companyId]) !== null
        ? { scheduleFrequencyMinutes: normalizeFrequencyMinutes(params.scheduleByCompanyId[companyId]) ?? undefined }
        : {}),
      mappings: [{
        id: mapping.id,
        jiraProjectKey: mapping.jiraProjectKey,
        ...(mapping.jiraJql ? { jiraJql: mapping.jiraJql } : {}),
        ...(mapping.filters ? { filters: mapping.filters } : {})
      }],
      syncState: normalizeSyncState(params.syncStateByCompanyId[companyId]),
      connectionTest: legacyConnectionTest
    });
  }

  return [...grouped.values()];
}

function normalizeSettings(value: unknown): JiraSyncSettings {
  if (!value || typeof value !== 'object') {
    return {
      mappings: [],
      projectConfigs: []
    };
  }

  const record = value as Record<string, unknown>;
  const rawMappings = Array.isArray(record.mappings) ? record.mappings : [];
  const rawProjectConfigs = Array.isArray(record.projectConfigs) ? record.projectConfigs : [];
  const scheduleByCompanyId =
    record.scheduleFrequencyMinutesByCompanyId && typeof record.scheduleFrequencyMinutesByCompanyId === 'object'
      ? record.scheduleFrequencyMinutesByCompanyId as Record<string, unknown>
      : {};
  const syncStateByCompanyId =
    record.syncStateByCompanyId && typeof record.syncStateByCompanyId === 'object'
      ? record.syncStateByCompanyId as Record<string, unknown>
      : {};
  const filtersByCompanyId =
    record.filtersByCompanyId && typeof record.filtersByCompanyId === 'object'
      ? record.filtersByCompanyId as Record<string, unknown>
      : {};
  const connectionTestByCompanyId =
    record.connectionTestByCompanyId && typeof record.connectionTestByCompanyId === 'object'
      ? record.connectionTestByCompanyId as Record<string, unknown>
      : {};
  const normalizedConnectionTestByCompanyId = Object.fromEntries(
    Object.entries(connectionTestByCompanyId).map(([companyId, state]) => [companyId, normalizeConnectionTestStateByProvider(state)])
  );

  const mappings = rawMappings
    .map((entry, index) => normalizeMapping(entry, index))
    .filter((entry): entry is JiraMapping => entry !== null);
  const projectConfigs = rawProjectConfigs
    .map((entry, index) => normalizeProjectConfig(entry, index))
    .filter((entry): entry is JiraProjectSyncConfig => entry !== null);

  return {
    mappings,
    projectConfigs: projectConfigs.length > 0
      ? projectConfigs
      : legacyMappingsToProjectConfigs({
          mappings,
          scheduleByCompanyId,
          syncStateByCompanyId,
          filtersByCompanyId,
          connectionTestByCompanyId: normalizedConnectionTestByCompanyId
        }),
    scheduleFrequencyMinutesByCompanyId: Object.fromEntries(
      Object.entries(scheduleByCompanyId)
        .map(([companyId, minutes]) => [companyId, normalizeFrequencyMinutes(minutes)] as const)
        .filter((entry): entry is [string, number] => entry[1] !== null)
    ),
    syncStateByCompanyId: Object.fromEntries(
      Object.entries(syncStateByCompanyId).map(([companyId, syncState]) => [companyId, normalizeSyncState(syncState)])
    ),
    filtersByCompanyId: Object.fromEntries(
      Object.entries(filtersByCompanyId).map(([companyId, filters]) => [companyId, normalizeTaskFilters(filters)])
    ),
    connectionTestByCompanyId: normalizedConnectionTestByCompanyId,
    ...(normalizeOptionalString(record.updatedAt) ? { updatedAt: normalizeOptionalString(record.updatedAt) } : {})
  };
}

function normalizeFrequencyMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  const normalized = Math.max(1, Math.min(24 * 60, Math.round(value)));
  return normalized;
}

function getMappingsForCompany(settings: JiraSyncSettings, companyId?: string): JiraMapping[] {
  const projectScopedMappings = (settings.projectConfigs ?? [])
    .filter((projectConfig) => (!companyId || projectConfig.companyId === companyId) && Boolean(projectConfig.providerId))
    .flatMap((projectConfig) => projectConfig.mappings.map((mapping) => ({
      id: mapping.id,
      companyId: projectConfig.companyId,
      providerId: projectConfig.providerId,
      jiraProjectKey: mapping.jiraProjectKey,
      ...(mapping.jiraJql ? { jiraJql: mapping.jiraJql } : {}),
      paperclipProjectId: projectConfig.projectId,
      paperclipProjectName: projectConfig.projectName,
      ...(mapping.filters ? { filters: mapping.filters } : {})
    })));
  if (projectScopedMappings.length > 0) {
    return projectScopedMappings;
  }

  if (!companyId) {
    return settings.mappings;
  }

  return settings.mappings.filter((mapping) => mapping.companyId === companyId);
}

function getProjectConfigsForCompany(settings: JiraSyncSettings, companyId?: string): JiraProjectSyncConfig[] {
  if (!companyId) {
    return settings.projectConfigs ?? [];
  }

  return (settings.projectConfigs ?? []).filter((projectConfig) => projectConfig.companyId === companyId);
}

function getProjectConfig(
  settings: JiraSyncSettings,
  companyId: string,
  projectId?: string,
  projectName?: string
): JiraProjectSyncConfig | null {
  return getProjectConfigsForCompany(settings, companyId).find((projectConfig) => (
    (projectId && projectConfig.projectId === projectId)
    || (!projectId && projectName && normalizeProjectName(projectConfig.projectName) === normalizeProjectName(projectName))
  )) ?? null;
}

function inferDefaultUpstreamKeyFromMappings(
  settings: JiraSyncSettings,
  companyId: string | undefined,
  providerId: string | undefined,
  providerType: ProviderType
): string | null {
  if (!providerId) {
    return null;
  }

  const mappings = getMappingsForCompany(settings, companyId)
    .filter((mapping) => mapping.providerId === providerId)
    .filter((mapping) => mapping.jiraProjectKey.trim().length > 0);
  if (mappings.length === 0) {
    return null;
  }

  if (isGitHubProviderType(providerType)) {
    const githubMapping = mappings.find((mapping) => mapping.jiraProjectKey.includes('/')) ?? mappings[0];
    return githubMapping?.jiraProjectKey?.trim() ?? null;
  }

  return mappings[0]?.jiraProjectKey?.trim() ?? null;
}

function resolveMappedPaperclipState(
  projectConfig: JiraProjectSyncConfig | null,
  jiraStatusName: string
): Partial<Pick<Issue, 'status' | 'assigneeAgentId'>> {
  if (!projectConfig) {
    return {};
  }

  const normalizedStatusNames = getNormalizedStatusAliases(jiraStatusName);
  const matchedMapping = getEffectiveStatusMappings(projectConfig).find((entry) => (
    normalizedStatusNames.includes(normalizeStatusName(entry.jiraStatus))
  ));

  return {
    status: matchedMapping?.paperclipStatus ?? projectConfig.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
    assigneeAgentId: matchedMapping
      ? (matchedMapping.assigneeAgentId ?? null)
      : (projectConfig.defaultStatusAssigneeAgentId ?? null)
  };
}

function normalizeGitHubStateReason(value: string | null | undefined): GitHubIssueStateReason | undefined {
  if (!value) {
    return undefined;
  }

  switch (value.trim().toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'not_planned':
    case 'not planned':
      return 'not_planned';
    case 'duplicate':
      return 'duplicate';
    case 'reopened':
      return 'reopened';
    default:
      return undefined;
  }
}

function getGitHubStatusName(
  state: string | null | undefined,
  stateReason: string | null | undefined
): string {
  if (String(state).toLowerCase() !== 'closed') {
    return 'Open';
  }

  switch (normalizeGitHubStateReason(stateReason)) {
    case 'completed':
      return 'Completed';
    case 'not_planned':
      return 'Not planned';
    case 'duplicate':
      return 'Duplicate';
    case 'reopened':
      return 'Reopened';
    default:
      return 'Closed';
  }
}

function getGitHubStatusCategory(
  state: string | null | undefined,
  stateReason: string | null | undefined
): string {
  if (String(state).toLowerCase() !== 'closed') {
    return 'Open';
  }

  return normalizeGitHubStateReason(stateReason) === 'not_planned' ? 'Cancelled' : 'Done';
}

function getNormalizedStatusAliases(statusName: string): string[] {
  const normalizedStatusName = normalizeStatusName(statusName);
  const aliases = new Set<string>([normalizedStatusName]);
  if (['completed', 'not planned', 'duplicate'].includes(normalizedStatusName)) {
    aliases.add('closed');
  }
  return [...aliases];
}

function parseGitHubTransition(
  transitionId: string
): { state: 'open' | 'closed'; stateReason?: Exclude<GitHubIssueStateReason, 'reopened'> } {
  const normalized = transitionId.trim().toLowerCase();
  if (normalized === 'closed' || normalized === 'completed' || normalized === 'closed:completed') {
    return { state: 'closed', stateReason: 'completed' };
  }
  if (normalized === 'not_planned' || normalized === 'not planned' || normalized === 'closed:not_planned') {
    return { state: 'closed', stateReason: 'not_planned' };
  }
  if (normalized === 'duplicate' || normalized === 'closed:duplicate') {
    return { state: 'closed', stateReason: 'duplicate' };
  }
  return { state: 'open' };
}

async function getAvailableProviders(ctx: PluginSetupContext): Promise<ProviderConfig[]> {
  return getProvidersFromConfig(await ctx.config.get());
}

async function getMappingProviderId(
  ctx: PluginSetupContext,
  mapping: JiraMapping
): Promise<string | undefined> {
  void ctx;
  return mapping.providerId;
}

function normalizeProjectName(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

async function findProjectById(
  ctx: PluginSetupContext,
  companyId: string,
  projectId: string | undefined
): Promise<{ id: string; name: string } | null> {
  if (!projectId) {
    return null;
  }

  const projects = await ctx.projects.list({ companyId });
  const project = projects.find((entry) => entry.id === projectId && !entry.archivedAt);
  return project ? { id: project.id, name: project.name } : null;
}

function getProjectGitHubRepository(project: unknown): string | undefined {
  if (!project || typeof project !== 'object') {
    return undefined;
  }

  const record = project as Record<string, unknown>;
  const workspaces = Array.isArray(record.workspaces) ? record.workspaces : [];
  const primaryWorkspace =
    record.primaryWorkspace && typeof record.primaryWorkspace === 'object'
      ? record.primaryWorkspace as Record<string, unknown>
      : null;
  const codebase =
    record.codebase && typeof record.codebase === 'object'
      ? record.codebase as Record<string, unknown>
      : null;

  const repoCandidates = [
    primaryWorkspace?.repoUrl,
    ...workspaces
      .filter((workspace): workspace is Record<string, unknown> => Boolean(workspace && typeof workspace === 'object'))
      .sort((left, right) => Number(Boolean(right.isPrimary)) - Number(Boolean(left.isPrimary)))
      .map((workspace) => workspace.repoUrl),
    codebase?.repoUrl
  ];

  for (const candidate of repoCandidates) {
    const normalized = normalizeOptionalString(candidate);
    const parsed = normalized ? parseRepositoryReference(normalized) : null;
    if (parsed) {
      return `${parsed.owner}/${parsed.repo}`;
    }
  }

  return undefined;
}

async function findProjectGitHubRepository(
  ctx: PluginSetupContext,
  companyId: string,
  projectId?: string,
  projectName?: string
): Promise<string | undefined> {
  const projects = (await ctx.projects.list({ companyId })).filter((project) => !project.archivedAt);
  const matchedProject = projectId
    ? projects.find((project) => project.id === projectId)
    : projects.find((project) => normalizeProjectName(project.name) === normalizeProjectName(projectName));

  return matchedProject ? getProjectGitHubRepository(matchedProject) : undefined;
}

async function resolvePaperclipProjectForMapping(
  ctx: PluginSetupContext,
  companyId: string,
  mapping: JiraMapping
): Promise<{ id: string; name: string } | null> {
  const projects = (await ctx.projects.list({ companyId })).filter((project) => !project.archivedAt);

  if (mapping.paperclipProjectId) {
    const matchedById = projects.find((project) => project.id === mapping.paperclipProjectId);
    if (matchedById) {
      return { id: matchedById.id, name: matchedById.name };
    }
  }

  const normalizedName = normalizeProjectName(mapping.paperclipProjectName);
  if (!normalizedName) {
    return null;
  }

  const matchedByName = projects.find((project) => normalizeProjectName(project.name) === normalizedName);
  return matchedByName ? { id: matchedByName.id, name: matchedByName.name } : null;
}

function mappingMatchesProject(mapping: JiraMapping, project: { id: string; name: string } | null): boolean {
  if (!project) {
    return false;
  }

  if (mapping.paperclipProjectId && mapping.paperclipProjectId === project.id) {
    return true;
  }

  return normalizeProjectName(mapping.paperclipProjectName) === normalizeProjectName(project.name);
}

function getSyncStateForCompany(settings: JiraSyncSettings, companyId?: string): SyncRunState {
  if (!companyId) {
    return { status: 'idle' };
  }

  return settings.syncStateByCompanyId?.[companyId] ?? { status: 'idle' };
}

function getScheduleFrequencyMinutes(settings: JiraSyncSettings, companyId?: string): number {
  if (!companyId) {
    return DEFAULT_SYNC_FREQUENCY_MINUTES;
  }

  return settings.scheduleFrequencyMinutesByCompanyId?.[companyId] ?? DEFAULT_SYNC_FREQUENCY_MINUTES;
}

function getProjectSyncState(
  settings: JiraSyncSettings,
  companyId?: string,
  projectId?: string
): SyncRunState {
  if (!companyId) {
    return { status: 'idle' };
  }

  if (!projectId) {
    return getSyncStateForCompany(settings, companyId);
  }

  const projectConfig = getProjectConfigsForCompany(settings, companyId).find((entry) => entry.projectId === projectId);
  if (!projectConfig) {
    return getSyncStateForCompany(settings, companyId);
  }

  return projectConfig.syncState ?? { status: 'idle' };
}

function getProjectConnectionTestState(
  settings: JiraSyncSettings,
  companyId?: string,
  projectId?: string,
  providerId?: string
): ConnectionTestState {
  if (!companyId || !projectId) {
    return getConnectionTestStateForCompany(settings, companyId, providerId);
  }

  const projectConnectionTest = getProjectConfigsForCompany(settings, companyId)
    .find((projectConfig) => projectConfig.projectId === projectId)?.connectionTest;
  if (!projectConnectionTest) {
    return getConnectionTestStateForCompany(settings, companyId, providerId);
  }

  if (providerId && projectConnectionTest.providerId && projectConnectionTest.providerId !== providerId) {
    return getConnectionTestStateForCompany(settings, companyId, providerId);
  }

  return projectConnectionTest;
}

function getProjectScheduleFrequencyMinutes(
  settings: JiraSyncSettings,
  companyId?: string,
  projectId?: string
): number {
  if (!companyId || !projectId) {
    return getScheduleFrequencyMinutes(settings, companyId);
  }

  return getProjectConfigsForCompany(settings, companyId).find((projectConfig) => projectConfig.projectId === projectId)?.scheduleFrequencyMinutes
    ?? getScheduleFrequencyMinutes(settings, companyId);
}

function getFiltersForCompany(settings: JiraSyncSettings, companyId?: string): JiraTaskFilters {
  if (!companyId) {
    return {};
  }

  return normalizeTaskFilters(settings.filtersByCompanyId?.[companyId]);
}

function getConnectionTestStateFromCollection(
  states: ConnectionTestStateByProvider | undefined,
  providerId?: string
): ConnectionTestState {
  if (!states) {
    return { status: 'idle' };
  }

  if (providerId) {
    return states[providerId] ?? { status: 'idle' };
  }

  return states[DEFAULT_CONNECTION_TEST_KEY]
    ?? Object.values(states)[0]
    ?? { status: 'idle' };
}

function getConnectionTestStateForCompany(
  settings: JiraSyncSettings,
  companyId?: string,
  providerId?: string
): ConnectionTestState {
  if (!companyId) {
    return { status: 'idle' };
  }

  return getConnectionTestStateFromCollection(settings.connectionTestByCompanyId?.[companyId], providerId);
}

async function saveSettings(ctx: PluginSetupContext, settings: JiraSyncSettings): Promise<void> {
  await ctx.state.set(SETTINGS_SCOPE, {
    ...settings,
    updatedAt: new Date().toISOString()
  });
}

async function saveProjectConfig(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  projectConfig: JiraProjectSyncConfig
): Promise<JiraSyncSettings> {
  const next: JiraSyncSettings = {
    ...settings,
    projectConfigs: [
      ...(settings.projectConfigs ?? []).filter((entry) => entry.id !== projectConfig.id),
      {
        ...projectConfig,
        updatedAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };
  await saveSettings(ctx, next);
  return next;
}

async function saveSyncState(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  companyId: string | undefined,
  syncState: SyncRunState,
  projectId?: string
): Promise<JiraSyncSettings> {
  if (!companyId) {
    return settings;
  }

  const nextProjectConfigs = (settings.projectConfigs ?? []).map((projectConfig) => (
    projectId && projectConfig.companyId === companyId && projectConfig.projectId === projectId
      ? { ...projectConfig, syncState, updatedAt: new Date().toISOString() }
      : projectConfig
  ));
  const next: JiraSyncSettings = {
    ...settings,
    projectConfigs: nextProjectConfigs,
    syncStateByCompanyId: {
      ...(settings.syncStateByCompanyId ?? {}),
      [companyId]: syncState
    },
    updatedAt: new Date().toISOString()
  };
  await saveSettings(ctx, next);
  return next;
}

async function saveConnectionTestState(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  companyId: string | undefined,
  connectionTest: ConnectionTestState,
  projectId?: string
): Promise<JiraSyncSettings> {
  if (!companyId) {
    return settings;
  }

  const nextProjectConfigs = (settings.projectConfigs ?? []).map((projectConfig) => (
    projectId && projectConfig.companyId === companyId && projectConfig.projectId === projectId
      ? { ...projectConfig, connectionTest, updatedAt: new Date().toISOString() }
      : projectConfig
  ));
  const companyConnectionTests = settings.connectionTestByCompanyId?.[companyId] ?? {};
  const connectionTestKey = connectionTest.providerId ?? DEFAULT_CONNECTION_TEST_KEY;
  const next: JiraSyncSettings = {
    ...settings,
    projectConfigs: nextProjectConfigs,
    connectionTestByCompanyId: {
      ...(settings.connectionTestByCompanyId ?? {}),
      [companyId]: {
        ...companyConnectionTests,
        [connectionTestKey]: connectionTest
      }
    },
    updatedAt: new Date().toISOString()
  };
  await saveSettings(ctx, next);
  return next;
}

async function getResolvedConfig(
  ctx: PluginSetupContext,
  providerId?: string,
  overrides?: ProviderConfigRecord
): Promise<JiraConfig> {
  const rawConfig = await ctx.config.get();
  const providers = getProvidersFromConfig(rawConfig);
  const matchedProvider =
    (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
    ?? providers[0]
    ?? {
      id: providerId ?? DEFAULT_PROVIDER_ID,
      type: 'jira_dc' as const,
      name: 'Default Jira'
    };
  const config = {
    ...matchedProvider,
    ...(overrides ?? {})
  };
  if (!isJiraProviderType(config.type)) {
    throw new Error(`Provider ${config.name} does not use Jira transport.`);
  }
  const jiraConfig = config as JiraDcProviderConfig | JiraCloudProviderConfig;
  const baseUrl = normalizeOptionalString(jiraConfig.jiraBaseUrl)?.replace(/\/+$/, '');
  const userEmail = normalizeOptionalString(jiraConfig.jiraUserEmail);
  const tokenRef = normalizeOptionalString(jiraConfig.jiraTokenRef);
  const inlineToken = normalizeOptionalString(jiraConfig.jiraToken);
  const token = inlineToken ?? (tokenRef ? await ctx.secrets.resolve(tokenRef) : undefined);

  return {
    providerId: normalizeOptionalString(config.id) ?? matchedProvider.id,
    providerName: normalizeOptionalString(config.name) ?? matchedProvider.name,
    ...(baseUrl ? { baseUrl } : {}),
    ...(userEmail ? { userEmail } : {}),
    ...(token ? { token } : {}),
    defaultIssueType: normalizeOptionalString(jiraConfig.defaultIssueType) ?? DEFAULT_ISSUE_TYPE
  };
}

async function getProviderDisplayConfig(
  ctx: PluginSetupContext,
  providerId?: string,
  overrides?: ProviderConfigRecord
): Promise<ProviderDisplayConfig> {
  const rawConfig = await ctx.config.get();
  const providers = getProvidersFromConfig(rawConfig);
  const matchedProvider =
    (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
    ?? providers[0]
    ?? {
      id: providerId ?? DEFAULT_PROVIDER_ID,
      type: 'jira_dc' as const,
      name: 'Default Jira'
    };
  const config = {
    ...matchedProvider,
    ...(overrides ?? {})
  };
  if (isJiraProviderType(config.type)) {
    const jiraConfig = config as JiraDcProviderConfig | JiraCloudProviderConfig;
    const baseUrl = normalizeOptionalString(jiraConfig.jiraBaseUrl)?.replace(/\/+$/, '');
    const userEmail = normalizeOptionalString(jiraConfig.jiraUserEmail);
    const inlineToken = normalizeOptionalString(jiraConfig.jiraToken);
    const tokenRef = normalizeOptionalString(jiraConfig.jiraTokenRef);

    return {
      providerId: normalizeOptionalString(config.id) ?? matchedProvider.id,
      providerName: normalizeOptionalString(config.name) ?? matchedProvider.name,
      providerType: config.type,
      ...(baseUrl ? { baseUrl } : {}),
      ...(userEmail ? { userEmail } : {}),
      defaultIssueType: normalizeOptionalString(jiraConfig.defaultIssueType) ?? DEFAULT_ISSUE_TYPE,
      tokenSaved: Boolean(inlineToken || tokenRef)
    };
  }

  const githubConfig = config as GitHubIssuesProviderConfig;
  const githubApiBaseUrl = normalizeOptionalString(githubConfig.githubApiBaseUrl) ?? DEFAULT_GITHUB_API_BASE_URL;
  const githubToken = normalizeOptionalString(githubConfig.githubToken);
  const githubTokenRef = normalizeOptionalString(githubConfig.githubTokenRef);
  return {
    providerId: normalizeOptionalString(githubConfig.id) ?? matchedProvider.id,
    providerName: normalizeOptionalString(githubConfig.name) ?? matchedProvider.name,
    providerType: 'github_issues',
    githubApiBaseUrl,
    ...(normalizeOptionalString(githubConfig.defaultRepository)
      ? { defaultRepository: normalizeOptionalString(githubConfig.defaultRepository) }
      : {}),
    tokenSaved: Boolean(githubToken || githubTokenRef)
  };
}

async function getResolvedGitHubConfig(
  ctx: PluginSetupContext,
  providerId?: string,
  overrides?: ProviderConfigRecord
): Promise<GitHubConfig> {
  const rawConfig = await ctx.config.get();
  const providers = getProvidersFromConfig(rawConfig);
  const matchedProvider =
    (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
    ?? providers[0]
    ?? {
      id: providerId ?? 'provider-default-github',
      type: 'github_issues' as const,
      name: 'Default GitHub'
    };
  const config = {
    ...matchedProvider,
    ...(overrides ?? {})
  };
  if (!isGitHubProviderType(config.type)) {
    throw new Error(`Provider ${config.name} does not use GitHub transport.`);
  }

  const githubConfig = config as GitHubIssuesProviderConfig;
  const tokenRef = normalizeOptionalString(githubConfig.githubTokenRef);
  const inlineToken = normalizeOptionalString(githubConfig.githubToken);
  const token = inlineToken ?? (tokenRef ? await ctx.secrets.resolve(tokenRef) : undefined);
  return {
    providerId: normalizeOptionalString(githubConfig.id) ?? matchedProvider.id,
    providerName: normalizeOptionalString(githubConfig.name) ?? matchedProvider.name,
    apiBaseUrl: normalizeOptionalString(githubConfig.githubApiBaseUrl) ?? DEFAULT_GITHUB_API_BASE_URL,
    ...(token ? { token } : {}),
    ...(normalizeOptionalString(githubConfig.defaultRepository)
      ? { defaultRepository: normalizeOptionalString(githubConfig.defaultRepository) }
      : {})
  };
}

function isConfigReady(config: JiraConfig): boolean {
  return Boolean(config.baseUrl && config.token);
}

function buildConfigSummary(config: JiraConfig): { ready: boolean; message: string } {
  if (isConfigReady(config)) {
    return {
      ready: true,
      message: `${config.providerName} is configured for ${config.baseUrl}.`
    };
  }

  return {
    ready: false,
    message: `Set the Jira base URL and token for ${config.providerName}. jiraUserEmail is optional and is only needed for Jira environments that require Basic auth instead of Bearer token auth.`
  };
}

function buildDisplayConfigSummary(config: ProviderDisplayConfig): { ready: boolean; message: string } {
  if (config.providerType === 'github_issues') {
    if (config.tokenSaved) {
      return {
        ready: true,
        message: config.defaultRepository
          ? `Repository: ${config.defaultRepository}`
          : `API: ${config.githubApiBaseUrl ?? DEFAULT_GITHUB_API_BASE_URL}`
      };
    }

    return {
      ready: false,
      message: 'Token required'
    };
  }

  if (config.baseUrl && config.tokenSaved) {
    return {
      ready: true,
      message: config.baseUrl
    };
  }

  return {
    ready: false,
    message: 'Base URL and token required'
  };
}

function isGitHubConfigReady(config: GitHubConfig): boolean {
  return Boolean(config.apiBaseUrl && config.token);
}

function buildGitHubConfigSummary(config: GitHubConfig): { ready: boolean; message: string } {
  if (isGitHubConfigReady(config)) {
    return {
      ready: true,
      message: `${config.providerName} is configured for ${config.apiBaseUrl}.`
    };
  }

  return {
    ready: false,
    message: `Set a GitHub token for ${config.providerName}.`
  };
}

function getGitHubApi(ctx: PluginSetupContext, config: GitHubConfig): Octokit {
  if (!config.token) {
    throw new Error('GitHub is not configured. Set githubToken or githubTokenRef.');
  }

  return new Octokit({
    auth: config.token,
    baseUrl: config.apiBaseUrl,
    request: {
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => await ctx.http.fetch(
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url,
        init
      )
    }
  });
}

function extractGitHubErrorDetail(data: unknown): string | undefined {
  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  const message = typeof record.message === 'string' ? record.message.trim() : '';
  const errors = Array.isArray(record.errors)
    ? record.errors
        .map((entry) => {
          if (typeof entry === 'string') {
            return entry.trim();
          }

          if (!entry || typeof entry !== 'object') {
            return '';
          }

          const errorRecord = entry as Record<string, unknown>;
          const field = typeof errorRecord.field === 'string' ? errorRecord.field.trim() : '';
          const code = typeof errorRecord.code === 'string' ? errorRecord.code.trim() : '';
          const entryMessage = typeof errorRecord.message === 'string' ? errorRecord.message.trim() : '';
          return [field, code, entryMessage].filter(Boolean).join(': ');
        })
        .filter((entry) => entry.length > 0)
    : [];

  return [message, ...errors].filter(Boolean).join(' ').trim() || undefined;
}

async function normalizeGitHubApiError(error: unknown): Promise<Error> {
  if (error && typeof error === 'object') {
    const status = typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;
    const response = (error as { response?: { data?: unknown } }).response;
    const detail = extractGitHubErrorDetail(response?.data)
      ?? (error instanceof Error ? error.message.trim() : '');

    if (status) {
      const hint =
        status === 401
          ? 'Check that the GitHub Personal Access Token is valid and has not expired.'
          : status === 403
            ? 'Check that the GitHub Personal Access Token can write issues for this repository.'
            : status === 404
              ? 'Check that the repository exists and that the GitHub Personal Access Token can access it.'
              : status === 422
                ? 'GitHub can return this when the selected assignee cannot be assigned to this repository or when the issue update payload is invalid.'
                : '';
      const suffix = [detail, hint].filter(Boolean).join(' ');
      return new Error(`GitHub request failed (${status}). ${suffix}`.trim());
    }
  }

  return error instanceof Error ? error : new Error('GitHub request failed.');
}

async function githubApiCall<T>(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  run: (api: Octokit) => Promise<T>
): Promise<T> {
  try {
    return await run(getGitHubApi(ctx, config));
  } catch (error) {
    const normalizedError = await normalizeGitHubApiError(error);
    ctx.logger.error('GitHub API call failed.', {
      providerId: config.providerId,
      baseUrl: config.apiBaseUrl,
      message: normalizedError.message
    });
    throw normalizedError;
  }
}

function getRepoReferenceFromMapping(mapping: JiraMapping, config?: GitHubConfig): { owner: string; repo: string; url: string } {
  const parsed = parseRepositoryReference(mapping.jiraProjectKey)
    ?? (config?.defaultRepository ? parseRepositoryReference(config.defaultRepository) : null);
  if (!parsed) {
    throw new Error('GitHub mappings require repository values like owner/repo.');
  }

  return parsed;
}

function normalizeGitHubIssueRecord(
  value: {
    id: number;
    number: number;
    title: string;
    body?: string | null;
    state?: string;
    state_reason?: string | null;
    html_url?: string;
    assignees?: Array<{ login?: string | null }> | null;
    user?: { login?: string | null } | null;
    created_at?: string;
    updated_at?: string;
  },
  repoFullName: string
): JiraIssueRecord {
  const assigneeDisplayName = value.assignees?.[0]?.login ?? undefined;
  const creatorDisplayName = value.user?.login ?? undefined;
  const issueKey = `${repoFullName}#${value.number}`;
  return {
    id: String(value.id),
    key: issueKey,
    summary: value.title,
    description: value.body ?? '',
    ...(assigneeDisplayName ? { assigneeDisplayName } : {}),
    ...(creatorDisplayName ? { creatorDisplayName } : {}),
    statusName: getGitHubStatusName(value.state, value.state_reason),
    statusCategory: getGitHubStatusCategory(value.state, value.state_reason),
    updatedAt: value.updated_at ?? new Date().toISOString(),
    createdAt: value.created_at ?? new Date().toISOString(),
    issueType: 'Issue',
    url: value.html_url ?? `https://github.com/${repoFullName}/issues/${value.number}`,
    comments: []
  };
}

function normalizeGitHubCommentRecord(
  value: {
    id: number;
    body?: string | null;
    user?: { login?: string | null } | null;
    created_at?: string;
    updated_at?: string;
  }
): JiraCommentRecord {
  return {
    id: String(value.id),
    body: value.body ?? '',
    authorDisplayName: value.user?.login ?? 'GitHub user',
    createdAt: value.created_at ?? new Date().toISOString(),
    updatedAt: value.updated_at ?? new Date().toISOString()
  };
}

async function testGitHubConnection(
  ctx: PluginSetupContext,
  config: GitHubConfig
): Promise<{ status: 'success' | 'error'; message: string }> {
  try {
    const response = await githubApiCall(ctx, config, async (api) => await api.rest.users.getAuthenticated());
    return {
      status: 'success',
      message: `Connected to GitHub as ${response.data.login}.`
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'GitHub connection test failed.'
    };
  }
}

async function searchGitHubUsers(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  query: string
): Promise<JiraUserReference[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const response = await githubApiCall(ctx, config, async (api) => await api.rest.search.users({
    q: `${trimmedQuery} in:login`,
    per_page: 10
  }));
  return response.data.items.map((user) => ({
    accountId: user.login,
    displayName: user.login,
    username: user.login
  }));
}

async function listGitHubRepositories(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  query?: string
): Promise<CanonicalUpstreamProject[]> {
  const trimmedQuery = query?.trim().toLowerCase() ?? '';
  const suggestionLimit = 20;
  const pageSize = 100;
  const maxPages = trimmedQuery ? 10 : 1;
  const seenRepoKeys = new Set<string>();
  const suggestions: CanonicalUpstreamProject[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const repositories = await githubApiCall(ctx, config, async (api) => await api.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: pageSize,
      page,
      affiliation: 'owner,collaborator,organization_member'
    }));
    const pageItems = repositories.data;
    for (const repo of pageItems) {
      const fullName = repo.full_name?.trim() ?? '';
      if (!fullName || seenRepoKeys.has(fullName.toLowerCase())) {
        continue;
      }

      const repoName = repo.name?.toLowerCase() ?? '';
      const repoUrl = repo.html_url?.toLowerCase() ?? '';
      const fullNameLower = fullName.toLowerCase();
      if (trimmedQuery && !fullNameLower.includes(trimmedQuery) && !repoName.includes(trimmedQuery) && !repoUrl.includes(trimmedQuery)) {
        continue;
      }

      seenRepoKeys.add(fullNameLower);
      suggestions.push({
        id: String(repo.id),
        key: fullName,
        displayName: fullName,
        ...(repo.html_url ? { url: repo.html_url } : {})
      });
      if (suggestions.length >= suggestionLimit) {
        break;
      }
    }

    if (suggestions.length >= suggestionLimit || pageItems.length < pageSize) {
      break;
    }
  }

  if (suggestions.length > 0) {
    return suggestions;
  }

  if (config.defaultRepository?.trim()) {
    return [{
      id: config.defaultRepository,
      key: config.defaultRepository,
      displayName: config.defaultRepository
    }];
  }

  return [];
}

async function resolveGitHubCurrentUser(
  ctx: PluginSetupContext,
  config: GitHubConfig
): Promise<JiraUserReference | undefined> {
  try {
    const response = await githubApiCall(ctx, config, async (api) => await api.rest.users.getAuthenticated());
    const login = response.data.login?.trim();
    if (!login) {
      return undefined;
    }

    return {
      accountId: login,
      displayName: login,
      username: login
    };
  } catch {
    return undefined;
  }
}

async function searchGitHubIssues(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  mapping: JiraMapping,
  options?: {
    issueKey?: string;
  }
): Promise<JiraIssueRecord[]> {
  const repo = getRepoReferenceFromMapping(mapping, config);
  if (options?.issueKey) {
    const issueNumberMatch = options.issueKey.match(/#(\d+)$/);
    if (!issueNumberMatch) {
      return [];
    }
    const issueNumber = Number(issueNumberMatch[1]);
    const [issueResponse, commentsResponse] = await Promise.all([
      githubApiCall(ctx, config, async (api) => await api.rest.issues.get({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: issueNumber
      })),
      githubApiCall(ctx, config, async (api) => await api.rest.issues.listComments({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: issueNumber,
        per_page: 100
      }))
    ]);
    const issueRecord = normalizeGitHubIssueRecord(issueResponse.data, `${repo.owner}/${repo.repo}`);
    return [{
      ...issueRecord,
      comments: commentsResponse.data.map((comment) => normalizeGitHubCommentRecord(comment))
    }];
  }

  const response = await githubApiCall(ctx, config, async (api) => await api.rest.issues.listForRepo({
      owner: repo.owner,
      repo: repo.repo,
      state: 'all',
      per_page: 50
    }));
  return response.data
    .filter((issue) => !Object.prototype.hasOwnProperty.call(issue, 'pull_request'))
    .map((issue) => normalizeGitHubIssueRecord(issue, `${repo.owner}/${repo.repo}`));
}

async function createGitHubIssue(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  mapping: JiraMapping,
  issue: Issue
): Promise<JiraIssueRecord> {
  const repo = getRepoReferenceFromMapping(mapping, config);
  const response = await githubApiCall(ctx, config, async (api) => await api.rest.issues.create({
    owner: repo.owner,
    repo: repo.repo,
    title: stripIssueTitlePrefix(issue.title),
    body: stripIssueMarker(issue.description ?? '')
  }));
  return normalizeGitHubIssueRecord(response.data, `${repo.owner}/${repo.repo}`);
}

async function updateGitHubIssue(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  issueKey: string,
  issue: Issue
): Promise<void> {
  const repoMatch = issueKey.match(/^([^#]+)#(\d+)$/);
  const repo = repoMatch ? parseRepositoryReference(repoMatch[1]) : null;
  const issueNumber = repoMatch ? Number(repoMatch[2]) : NaN;
  if (!repo || !Number.isFinite(issueNumber)) {
    throw new Error('GitHub issue key must look like owner/repo#123.');
  }

  await githubApiCall(ctx, config, async (api) => await api.rest.issues.update({
    owner: repo.owner,
    repo: repo.repo,
    issue_number: issueNumber,
    title: stripIssueTitlePrefix(issue.title),
    body: stripIssueMarker(issue.description ?? '')
  }));
}

async function addGitHubComment(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  issueKey: string,
  body: string
): Promise<{ id: string }> {
  const repoMatch = issueKey.match(/^([^#]+)#(\d+)$/);
  const repo = repoMatch ? parseRepositoryReference(repoMatch[1]) : null;
  const issueNumber = repoMatch ? Number(repoMatch[2]) : NaN;
  if (!repo || !Number.isFinite(issueNumber)) {
    throw new Error('GitHub issue key must look like owner/repo#123.');
  }

  const response = await githubApiCall(ctx, config, async (api) => await api.rest.issues.createComment({
    owner: repo.owner,
    repo: repo.repo,
    issue_number: issueNumber,
    body
  }));
  return { id: String(response.data.id) };
}

function listGitHubTransitions(): Array<{ id: string; name: string }> {
  return [
    { id: 'open', name: 'Open' },
    { id: 'closed:completed', name: 'Completed' },
    { id: 'closed:not_planned', name: 'Not planned' },
    { id: 'closed:duplicate', name: 'Duplicate' }
  ];
}

async function transitionGitHubIssue(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  issueKey: string,
  transitionId: string
): Promise<void> {
  const repoMatch = issueKey.match(/^([^#]+)#(\d+)$/);
  const repo = repoMatch ? parseRepositoryReference(repoMatch[1]) : null;
  const issueNumber = repoMatch ? Number(repoMatch[2]) : NaN;
  if (!repo || !Number.isFinite(issueNumber)) {
    throw new Error('GitHub issue key must look like owner/repo#123.');
  }

  const { state, stateReason } = parseGitHubTransition(transitionId);
  await githubApiCall(ctx, config, async (api) => await api.rest.issues.update({
    owner: repo.owner,
    repo: repo.repo,
    issue_number: issueNumber,
    state,
    ...(stateReason ? { state_reason: stateReason } : {})
  }));
}

async function setGitHubIssueAssignee(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  issueKey: string,
  assignee: JiraUserReference
): Promise<void> {
  const repoMatch = issueKey.match(/^([^#]+)#(\d+)$/);
  const repo = repoMatch ? parseRepositoryReference(repoMatch[1]) : null;
  const issueNumber = repoMatch ? Number(repoMatch[2]) : NaN;
  if (!repo || !Number.isFinite(issueNumber)) {
    throw new Error('GitHub issue key must look like owner/repo#123.');
  }

  const login = (assignee.username ?? assignee.accountId).trim();
  if (!login) {
    throw new Error('Select a GitHub user before updating the assignee.');
  }

  await githubApiCall(ctx, config, async (api) => await api.rest.issues.update({
    owner: repo.owner,
    repo: repo.repo,
    issue_number: issueNumber,
    assignees: [login]
  }));
}

async function syncGitHubStatusFromPaperclip(
  ctx: PluginSetupContext,
  config: GitHubConfig,
  issueKey: string,
  paperclipStatus: PaperclipIssueStatus
): Promise<boolean> {
  await transitionGitHubIssue(
    ctx,
    config,
    issueKey,
    paperclipStatus === 'cancelled'
      ? 'closed:not_planned'
      : paperclipStatus === 'done'
        ? 'closed:completed'
        : 'open'
  );
  return true;
}

async function getProviderTypeById(ctx: PluginSetupContext, providerId?: string): Promise<ProviderType> {
  if (!providerId) {
    return 'jira_dc';
  }

  return (await getProviderDisplayConfig(ctx, providerId)).providerType;
}

async function testProviderConnectionAction(
  ctx: PluginSetupContext,
  providerType: ProviderType,
  providerId?: string,
  overrides?: ProviderConfigRecord
): Promise<{ status: 'success' | 'error'; message: string }> {
  if (isGitHubProviderType(providerType)) {
    return await testGitHubConnection(ctx, await getResolvedGitHubConfig(ctx, providerId, overrides));
  }

  return await testJiraConnection(ctx, await getResolvedConfig(ctx, providerId, overrides));
}

async function searchProviderUsers(
  ctx: PluginSetupContext,
  providerType: ProviderType,
  providerId: string,
  query: string
): Promise<JiraUserReference[]> {
  if (isGitHubProviderType(providerType)) {
    return await searchGitHubUsers(ctx, await getResolvedGitHubConfig(ctx, providerId), query);
  }

  return await searchJiraUsers(ctx, await getResolvedConfig(ctx, providerId), query);
}

async function searchProviderProjects(
  ctx: PluginSetupContext,
  providerType: ProviderType,
  providerId: string,
  query?: string
): Promise<CanonicalUpstreamProject[]> {
  const adapter = providerRegistry.get(providerType);
  if (!adapter.listUpstreamProjects) {
    return [];
  }

  if (isGitHubProviderType(providerType)) {
    return await adapter.listUpstreamProjects({
      listUpstreamProjects: async (
        _adapterProviderType: 'github_issues',
        config: GitHubIssuesProviderConfig,
        nextQuery?: string
      ) => await listGitHubRepositories(ctx, await getResolvedGitHubConfig(ctx, providerId, config), nextQuery)
    }, {
      ...(await getProvidersFromConfig(await ctx.config.get())).find((provider) => provider.id === providerId) as GitHubIssuesProviderConfig
    }, query);
  }

  return await adapter.listUpstreamProjects({
    listUpstreamProjects: async (
      _adapterProviderType: 'jira_dc' | 'jira_cloud',
      config: JiraDcProviderConfig | JiraCloudProviderConfig,
      nextQuery?: string
    ) => await listJiraProjects(ctx, await getResolvedConfig(ctx, providerId, config), nextQuery)
  }, {
    ...(await getProvidersFromConfig(await ctx.config.get())).find((provider) => provider.id === providerId) as JiraDcProviderConfig | JiraCloudProviderConfig
  }, query);
}

async function resolveProviderCurrentUser(
  ctx: PluginSetupContext,
  providerType: ProviderType,
  providerId: string
): Promise<JiraUserReference | undefined> {
  if (isGitHubProviderType(providerType)) {
    return await resolveGitHubCurrentUser(ctx, await getResolvedGitHubConfig(ctx, providerId));
  }

  return await resolveJiraCurrentUser(ctx, await getResolvedConfig(ctx, providerId));
}

async function searchUpstreamIssues(
  ctx: PluginSetupContext,
  mapping: JiraMapping,
  options?: {
    issueKey?: string;
    filters?: JiraTaskFilters;
  }
): Promise<JiraIssueRecord[]> {
  const providerType = await getProviderTypeById(ctx, await getMappingProviderId(ctx, mapping));
  if (isGitHubProviderType(providerType)) {
    return await searchGitHubIssues(ctx, await getResolvedGitHubConfig(ctx, mapping.providerId), mapping, options);
  }

  return await searchJiraIssues(ctx, await getResolvedConfig(ctx, mapping.providerId), mapping, options);
}

async function createUpstreamIssueForProvider(
  ctx: PluginSetupContext,
  mapping: JiraMapping,
  issue: Issue
): Promise<JiraIssueRecord> {
  const providerType = await getProviderTypeById(ctx, await getMappingProviderId(ctx, mapping));
  if (isGitHubProviderType(providerType)) {
    return await createGitHubIssue(ctx, await getResolvedGitHubConfig(ctx, mapping.providerId), mapping, issue);
  }

  return await createJiraIssue(ctx, await getResolvedConfig(ctx, mapping.providerId), mapping, issue);
}

async function updateUpstreamIssueForProvider(
  ctx: PluginSetupContext,
  mapping: JiraMapping,
  issueKey: string,
  issue: Issue
): Promise<void> {
  const providerType = await getProviderTypeById(ctx, await getMappingProviderId(ctx, mapping));
  if (isGitHubProviderType(providerType)) {
    await updateGitHubIssue(ctx, await getResolvedGitHubConfig(ctx, mapping.providerId), issueKey, issue);
    return;
  }

  await updateJiraIssue(ctx, await getResolvedConfig(ctx, mapping.providerId), issueKey, issue);
}

async function listUpstreamTransitionsForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string
): Promise<Array<{ id: string; name: string }>> {
  const providerType = await getProviderTypeById(ctx, providerId);
  if (isGitHubProviderType(providerType)) {
    return listGitHubTransitions();
  }

  return await listJiraTransitions(ctx, await getResolvedConfig(ctx, providerId), issueKey);
}

async function transitionUpstreamIssueForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string,
  transitionId: string
): Promise<void> {
  const providerType = await getProviderTypeById(ctx, providerId);
  if (isGitHubProviderType(providerType)) {
    await transitionGitHubIssue(ctx, await getResolvedGitHubConfig(ctx, providerId), issueKey, transitionId);
    return;
  }

  await transitionJiraIssue(ctx, await getResolvedConfig(ctx, providerId), issueKey, transitionId);
}

async function setUpstreamAssigneeForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string,
  assignee: JiraUserReference
): Promise<void> {
  const providerType = await getProviderTypeById(ctx, providerId);
  if (isGitHubProviderType(providerType)) {
    await setGitHubIssueAssignee(ctx, await getResolvedGitHubConfig(ctx, providerId), issueKey, assignee);
    return;
  }

  await setJiraIssueAssignee(ctx, await getResolvedConfig(ctx, providerId), issueKey, assignee);
}

async function addUpstreamCommentForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string,
  body: string
): Promise<{ id: string }> {
  const providerType = await getProviderTypeById(ctx, providerId);
  if (isGitHubProviderType(providerType)) {
    return await addGitHubComment(ctx, await getResolvedGitHubConfig(ctx, providerId), issueKey, body);
  }

  return await addJiraComment(ctx, await getResolvedConfig(ctx, providerId), issueKey, body);
}

function buildProviderTypeOptions(): Array<{ value: ProviderType; label: string }> {
  return providerRegistry.list().map((adapter) => ({
    value: adapter.type,
    label: adapter.label
  }));
}

async function countImportedIssuesByProject(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<Record<string, number>> {
  const issueLinks = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  const counts: Record<string, number> = {};
  for (const entry of issueLinks) {
    const data = entry.data as Partial<JiraIssueLinkData>;
    if (!data.projectId || data.source !== 'jira') {
      continue;
    }
    if (companyId && data.companyId !== companyId) {
      continue;
    }
    counts[data.projectId] = (counts[data.projectId] ?? 0) + 1;
  }
  return counts;
}

function encodeBasicAuth(userEmail: string, token: string): string {
  return Buffer.from(`${userEmail}:${token}`, 'utf8').toString('base64');
}

function getJiraApi(ctx: PluginSetupContext, config: JiraConfig): JiraApiClient {
  if (!config.baseUrl || !config.token) {
    throw new Error('Jira is not configured. Set jiraBaseUrl and jiraTokenRef.');
  }

  const authorization =
    config.userEmail
      ? `Basic ${encodeBasicAuth(config.userEmail, config.token)}`
      : `Bearer ${config.token}`;

  return new JiraApiClient(new JiraApiConfiguration({
    basePath: `${config.baseUrl}/rest`,
    fetchApi: async (input: RequestInfo | URL, init?: RequestInit) => await ctx.http.fetch(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url,
      init
    ),
    queryParamsStringify: (params) => jiraApiQuerystring(params).replace(/%2C/g, ','),
    headers: {
      Accept: 'application/json',
      Authorization: authorization
    }
  }));
}

async function normalizeJiraApiError(error: unknown): Promise<Error> {
  if (error instanceof JiraResponseError) {
    let responseText = '';
    try {
      responseText = await error.response.text();
    } catch {
      responseText = '';
    }

    let detail = responseText || error.response.statusText;
    try {
      const parsed = responseText ? JSON.parse(responseText) as Record<string, unknown> : null;
      if (parsed) {
        const errorMessages = Array.isArray(parsed.errorMessages)
          ? parsed.errorMessages.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : [];
        const fieldErrors = parsed.errors && typeof parsed.errors === 'object'
          ? Object.entries(parsed.errors as Record<string, unknown>)
              .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
              .map(([field, value]) => `${field}: ${String(value)}`)
          : [];
        const combined = [...errorMessages, ...fieldErrors].join(' ');
        if (combined) {
          detail = combined;
        }
      }
    } catch {
      // Keep the raw response text when Jira does not return JSON.
    }

    return new Error(`Jira request failed (${error.response.status}). ${detail}`);
  }

  if (error instanceof JiraFetchError) {
    return error.cause instanceof Error
      ? error.cause
      : new Error('Jira request failed.');
  }

  return error instanceof Error ? error : new Error('Jira request failed.');
}

async function jiraApiCall<T>(
  ctx: PluginSetupContext,
  config: JiraConfig,
  run: (api: JiraApiClient) => Promise<T>
): Promise<T> {
  try {
    return await run(getJiraApi(ctx, config));
  } catch (error) {
    const normalizedError = await normalizeJiraApiError(error);
    ctx.logger.error('Jira API call failed.', {
      providerId: config.providerId,
      baseUrl: config.baseUrl,
      message: normalizedError.message
    });
    throw normalizedError;
  }
}

function isNoContentBridgeError(error: unknown): boolean {
  return error instanceof Error
    && error.message.includes('Invalid response status code 204');
}

async function jiraApiCallAllowNoContent(
  ctx: PluginSetupContext,
  config: JiraConfig,
  run: (api: JiraApiClient) => Promise<unknown>
): Promise<void> {
  try {
    await jiraApiCall(ctx, config, run);
  } catch (error) {
    if (isNoContentBridgeError(error)) {
      return;
    }

    throw error;
  }
}

function adfNodeText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => adfNodeText(entry)).filter(Boolean).join('');
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const record = value as Record<string, unknown>;
  const type = normalizeOptionalString(record.type);
  const text = normalizeOptionalString(record.text);
  const content = Array.isArray(record.content) ? record.content : [];

  if (type === 'hardBreak') {
    return '\n';
  }

  const childText = content.map((entry) => adfNodeText(entry)).join('');
  if (type === 'paragraph' || type === 'heading' || type === 'blockquote' || type === 'listItem') {
    return `${childText}\n\n`;
  }
  if (type === 'bulletList' || type === 'orderedList') {
    return `${childText}\n`;
  }

  return text ?? childText;
}

function adfToMarkdown(value: unknown): string {
  return adfNodeText(value).replace(/\n{3,}/g, '\n\n').trim();
}

function plainTextToAdf(text: string): Record<string, unknown> {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'paragraph',
      content: paragraph.split('\n').flatMap((line, index) => (
        index === 0
          ? [{ type: 'text', text: line }]
          : [{ type: 'hardBreak' }, { type: 'text', text: line }]
      ))
    }));

  return {
    version: 1,
    type: 'doc',
    content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph', content: [] }]
  };
}

function buildJiraIssueUrl(config: JiraConfig, issueKey: string): string {
  return `${config.baseUrl}/browse/${issueKey}`;
}

function escapeJqlValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildJiraSearchJql(mapping: JiraMapping, filters?: JiraTaskFilters): string {
  const clauses: string[] = [`project = ${mapping.jiraProjectKey}`];
  if (filters?.onlyActive) {
    clauses.push('statusCategory != Done');
  }
  if (filters?.author) {
    const authorValue = getJiraUserQueryValue(filters.author);
    if (authorValue) {
      clauses.push(`reporter = "${escapeJqlValue(authorValue)}"`);
    }
  }
  if (filters?.assignee) {
    const assigneeValue = getJiraUserQueryValue(filters.assignee);
    if (assigneeValue) {
      clauses.push(`assignee = "${escapeJqlValue(assigneeValue)}"`);
    }
  }
  if (filters?.issueNumberGreaterThan !== undefined) {
    clauses.push(`issuekey > ${mapping.jiraProjectKey}-${filters.issueNumberGreaterThan}`);
  }
  if (filters?.issueNumberLessThan !== undefined) {
    clauses.push(`issuekey < ${mapping.jiraProjectKey}-${filters.issueNumberLessThan}`);
  }

  if (mapping.jiraJql?.trim()) {
    return `${mapping.jiraJql.trim()} ORDER BY updated DESC`;
  }

  return `${clauses.join(' AND ')} ORDER BY updated DESC`;
}

function stripIssueTitlePrefix(title: string): string {
  let next = title.trim();
  const jiraPrefixPattern = /^\[[A-Z][A-Z0-9]+-\d+\]\s*/i;
  const githubPrefixPattern = /^\[[a-z0-9_.-]+\/[a-z0-9_.-]+#\d+\]\s*/i;
  while (jiraPrefixPattern.test(next) || githubPrefixPattern.test(next)) {
    next = next
      .replace(jiraPrefixPattern, '')
      .replace(githubPrefixPattern, '')
      .trim();
  }
  return next;
}

function ensureIssueTitlePrefix(title: string, jiraIssueKey: string): string {
  const cleanTitle = stripIssueTitlePrefix(title);
  return `[${jiraIssueKey}] ${cleanTitle || jiraIssueKey}`;
}

function normalizeJiraIssue(value: unknown, config: JiraConfig): JiraIssueRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const fields = record.fields && typeof record.fields === 'object' ? record.fields as Record<string, unknown> : {};
  const status = fields.status && typeof fields.status === 'object' ? fields.status as Record<string, unknown> : {};
  const statusCategory = status.statusCategory && typeof status.statusCategory === 'object'
    ? status.statusCategory as Record<string, unknown>
    : {};
  const issueType = fields.issuetype && typeof fields.issuetype === 'object'
    ? fields.issuetype as Record<string, unknown>
    : {};
  const assignee = fields.assignee && typeof fields.assignee === 'object'
    ? fields.assignee as Record<string, unknown>
    : {};
  const creator = fields.creator && typeof fields.creator === 'object'
    ? fields.creator as Record<string, unknown>
    : {};
  const reporter = fields.reporter && typeof fields.reporter === 'object'
    ? fields.reporter as Record<string, unknown>
    : {};
  const commentsValue = fields.comment && typeof fields.comment === 'object'
    ? fields.comment as Record<string, unknown>
    : {};
  const comments = Array.isArray(commentsValue.comments)
    ? commentsValue.comments
        .map((entry) => normalizeJiraComment(entry))
        .filter((entry): entry is JiraCommentRecord => entry !== null)
    : [];
  const assigneeDisplayName = getJiraPersonDisplayName(assignee);
  const creatorDisplayName = getJiraPersonDisplayName(creator) ?? getJiraPersonDisplayName(reporter);
  const key = normalizeOptionalString(record.key);
  const id = normalizeOptionalString(record.id);
  const summary = normalizeOptionalString(fields.summary);

  if (!key || !id || !summary) {
    return null;
  }

  return {
    id,
    key,
    summary,
    description: adfToMarkdown(fields.description),
    ...(assigneeDisplayName ? { assigneeDisplayName } : {}),
    ...(creatorDisplayName ? { creatorDisplayName } : {}),
    statusName: normalizeOptionalString(status.name) ?? 'Unknown',
    statusCategory: normalizeOptionalString(statusCategory.name) ?? 'Unknown',
    updatedAt: normalizeOptionalString(fields.updated) ?? new Date().toISOString(),
    createdAt: normalizeOptionalString(fields.created) ?? new Date().toISOString(),
    issueType: normalizeOptionalString(issueType.name) ?? DEFAULT_ISSUE_TYPE,
    url: buildJiraIssueUrl(config, key),
    comments
  };
}

function getProviderPlatformName(providerType: ProviderType): string {
  return isGitHubProviderType(providerType) ? 'GitHub' : 'Jira';
}

function normalizeJiraComment(value: unknown): JiraCommentRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const author = record.author && typeof record.author === 'object' ? record.author as Record<string, unknown> : {};
  const id = normalizeOptionalString(record.id);
  if (!id) {
    return null;
  }

  return {
    id,
    body: adfToMarkdown(record.body),
    authorDisplayName: getJiraPersonDisplayName(author) ?? 'Jira user',
    createdAt: normalizeOptionalString(record.created) ?? new Date().toISOString(),
    updatedAt: normalizeOptionalString(record.updated) ?? new Date().toISOString()
  };
}

async function searchJiraIssues(
  ctx: PluginSetupContext,
  config: JiraConfig,
  mapping: JiraMapping,
  options?: {
    issueKey?: string;
    filters?: JiraTaskFilters;
  }
): Promise<JiraIssueRecord[]> {
  if (options?.issueKey) {
    const issueKey = options.issueKey;
    try {
      const response = await jiraApiCall(
        ctx,
        config,
        async (api) => await api.getIssue({
          issueIdOrKey: issueKey,
          fields: 'summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter'
        })
      );
      const issue = normalizeJiraIssue(response, config);
      if (issue) {
        return [issue];
      }
    } catch {
      // Some Jira deployments allow search reliably but reject or reshape direct issue fetches.
      // Fall back to the same search transport used by full sync so issue recovery and refresh remain consistent.
    }

    const response = await jiraApiCall(
        ctx,
        config,
        async (api) => await api.searchUsingSearchRequest({
          requestBody: {
          jql: `issuekey = ${issueKey} ORDER BY updated DESC`,
          maxResults: 1,
          fields: ['summary', 'description', 'status', 'comment', 'updated', 'created', 'issuetype', 'assignee', 'creator', 'reporter']
        }
      })
    );
    const issues = Array.isArray(response.issues) ? response.issues : [];
    return issues
      .map((entry: unknown) => normalizeJiraIssue(entry, config))
      .filter((entry: JiraIssueRecord | null): entry is JiraIssueRecord => entry !== null);
  }

  const response = await jiraApiCall(
    ctx,
    config,
    async (api) => await api.searchUsingSearchRequest({
      requestBody: {
        jql: buildJiraSearchJql(mapping, options?.filters),
        maxResults: 50,
        fields: ['summary', 'description', 'status', 'comment', 'updated', 'created', 'issuetype', 'assignee', 'creator', 'reporter']
      }
    })
  );
  const issues = Array.isArray(response.issues) ? response.issues : [];
  return issues
    .map((entry: unknown) => normalizeJiraIssue(entry, config))
    .filter((entry: JiraIssueRecord | null): entry is JiraIssueRecord => entry !== null);
}

async function createJiraIssue(
  ctx: PluginSetupContext,
  config: JiraConfig,
  mapping: JiraMapping,
  issue: Issue
): Promise<JiraIssueRecord> {
  const createResponse = await jiraApiCall(
    ctx,
    config,
    async (api) => await api.createIssue({
      requestBody: {
        fields: {
          project: { key: mapping.jiraProjectKey },
          summary: stripIssueTitlePrefix(issue.title),
          description: plainTextToAdf(stripIssueMarker(issue.description ?? '')),
          issuetype: { name: config.defaultIssueType }
        }
      }
    })
  );
  const createdKey = normalizeOptionalString(createResponse.key);
  if (!createdKey) {
    throw new Error('Jira did not return the created issue key.');
  }

  const [createdIssue] = await searchJiraIssues(ctx, config, mapping, { issueKey: createdKey });
  if (!createdIssue) {
    throw new Error(`Jira created ${createdKey}, but the plugin could not reload it.`);
  }

  return createdIssue;
}

async function updateJiraIssue(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string,
  issue: Issue
): Promise<void> {
  await jiraApiCallAllowNoContent(
    ctx,
    config,
    async (api) => {
      await api.editIssueRaw({
        issueIdOrKey: jiraIssueKey,
        requestBody: {
          fields: {
            summary: stripIssueTitlePrefix(issue.title),
            description: plainTextToAdf(stripIssueMarker(issue.description ?? ''))
          }
        }
      });
    }
  );
}

async function listJiraTransitions(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string
): Promise<Array<{ id: string; name: string }>> {
  const response = await jiraApiCall(
    ctx,
    config,
    async (api) => await api.getTransitions({
      issueIdOrKey: jiraIssueKey
    })
  );
  const transitions = Array.isArray(response.transitions) ? response.transitions : [];
  return transitions
    .map((entry: unknown) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const record = entry as Record<string, unknown>;
      const id = normalizeOptionalString(record.id);
      const name = normalizeOptionalString(record.name);
      return id && name ? { id, name } : null;
    })
    .filter((entry: { id: string; name: string } | null): entry is { id: string; name: string } => entry !== null);
}

function normalizeStatusName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function targetTransitionName(status: PaperclipIssueStatus): string[] {
  switch (status) {
    case 'backlog':
      return ['backlog'];
    case 'todo':
      return ['selected for development', 'to do', 'todo', 'open'];
    case 'in_progress':
      return ['in progress', 'doing'];
    case 'in_review':
      return ['in review', 'review'];
    case 'blocked':
      return ['blocked'];
    case 'done':
      return ['done', 'closed', 'complete'];
    case 'cancelled':
      return ['cancelled', 'canceled', 'wont do', 'won t do'];
    default:
      return [];
  }
}

async function syncJiraStatusFromPaperclip(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string,
  paperclipStatus: PaperclipIssueStatus
): Promise<boolean> {
  const transitions = await listJiraTransitions(ctx, config, jiraIssueKey);
  const targetNames = targetTransitionName(paperclipStatus);
  const transition = transitions.find((entry) => targetNames.includes(normalizeStatusName(entry.name)));
  if (!transition) {
    return false;
  }

  await jiraApiCallAllowNoContent(
    ctx,
    config,
    async (api) => {
      await api.doTransitionRaw({
        issueIdOrKey: jiraIssueKey,
        requestBody: {
          transition: {
            id: transition.id
          }
        }
      });
    }
  );
  return true;
}

async function transitionJiraIssue(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string,
  transitionId: string
): Promise<void> {
  await jiraApiCallAllowNoContent(
    ctx,
    config,
    async (api) => {
      await api.doTransitionRaw({
        issueIdOrKey: jiraIssueKey,
        requestBody: {
          transition: {
            id: transitionId
          }
        }
      });
    }
  );
}

async function setJiraIssueAssignee(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string,
  assignee: JiraUserReference
): Promise<void> {
  const attempts = [
    {
      requestBody: {
        name: assignee.username ?? assignee.accountId
      }
    },
    {
      requestBody: {
        accountId: assignee.accountId
      }
    },
    {
      requestBody: {
        name: assignee.accountId
      }
    }
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      await jiraApiCallAllowNoContent(
        ctx,
        config,
        async (api) => {
          await api.assignRaw({
            issueIdOrKey: jiraIssueKey,
            requestBody: attempt.requestBody
          });
        }
      );
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to update the Jira assignee.');
}

async function addJiraComment(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string,
  body: string
): Promise<{ id: string }> {
  const payloads = [
    {
      body
    },
    {
      body: plainTextToAdf(body)
    }
  ];

  let lastError: unknown;
  for (const requestBody of payloads) {
    try {
      const response = await jiraApiCall(
        ctx,
        config,
        async (api) => await api.addComment({
          issueIdOrKey: jiraIssueKey,
          requestBody
        })
      );
      const id = normalizeOptionalString(response.id);
      if (!id) {
        throw new Error('Jira did not return the created comment id.');
      }

      return { id };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to create the Jira comment.');
}

async function testJiraConnection(
  ctx: PluginSetupContext,
  config: JiraConfig
): Promise<{ status: 'success' | 'error'; message: string }> {
  try {
    await jiraApiCall(
      ctx,
      config,
      async (api) => await api.getUser_36()
    );
    return {
      status: 'success',
      message: config.baseUrl
        ? `Connected to Jira at ${config.baseUrl}.`
        : 'Connected to Jira.'
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Jira connection test failed.'
    };
  }
}

async function resolveJiraCurrentUser(
  ctx: PluginSetupContext,
  config: JiraConfig
): Promise<JiraUserReference | undefined> {
  try {
    const response = await jiraApiCall(
      ctx,
      config,
      async (api) => await api.getUser_36()
    );
    return normalizeJiraUserReference(response)
      ?? (config.userEmail ? {
        accountId: config.userEmail,
        displayName: config.userEmail,
        emailAddress: config.userEmail,
        username: config.userEmail
      } : undefined);
  } catch {
    return config.userEmail
      ? {
          accountId: config.userEmail,
          displayName: config.userEmail,
          emailAddress: config.userEmail,
          username: config.userEmail
        }
      : undefined;
  }
}

async function searchJiraUsers(
  ctx: PluginSetupContext,
  config: JiraConfig,
  query: string
): Promise<JiraUserReference[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const attempts: Array<() => Promise<unknown>> = [
    async () => await jiraApiCall(ctx, config, async (api) => await api.findUsers({
      username: trimmedQuery,
      maxResults: 10,
      includeActive: true
    })),
    async () => await jiraApiCall(ctx, config, async (api) => await api.findUsersAndGroups({
      query: trimmedQuery,
      maxResults: 10
    })),
    async () => await jiraApiCall(ctx, config, async (api) => await api.findUsersForPicker({
      query: trimmedQuery,
      maxResults: 10
    }))
  ];

  for (const attempt of attempts) {
    try {
      const response = await attempt();
      const rawCandidates = Array.isArray(response) ? response : [response];
      const candidates = rawCandidates.flatMap((candidate) => {
        if (Array.isArray(candidate)) {
          return candidate;
        }

        const record = candidate && typeof candidate === 'object'
          ? candidate as Record<string, unknown>
          : null;
        if (!record) {
          return [];
        }

        const pickerUsersValue = record.users;
        const pickerUsersRecord = pickerUsersValue && typeof pickerUsersValue === 'object'
          ? pickerUsersValue as Record<string, unknown>
          : null;
        const pickerUsers = Array.isArray(pickerUsersRecord?.users)
          ? pickerUsersRecord.users
          : Array.isArray(record.users)
            ? record.users
            : Array.isArray(record.items)
              ? record.items
              : Array.isArray(record.groups)
                ? record.groups
                : Array.isArray(record.header)
                  ? record.header
                  : [];
        return pickerUsers.length > 0 ? pickerUsers : [record];
      });
      const suggestions = candidates
        .map((entry) => normalizeJiraUserReference(entry))
        .filter((entry): entry is JiraUserReference => entry !== undefined)
        .filter((entry, index, all) => all.findIndex((candidate) => candidate.accountId === entry.accountId) === index);

      if (suggestions.length > 0) {
        return suggestions;
      }
    } catch {
      // Jira search support differs between Server/DC deployments, and some
      // instances restrict particular user lookup endpoints. Try the next
      // documented endpoint instead of surfacing provider-switch failures.
    }
  }

  try {
    const exactUser = await jiraApiCall(
      ctx,
      config,
      async (api) => await api.getUser({
        username: trimmedQuery
      })
    );
    const normalized = normalizeJiraUserReference(exactUser);
    if (normalized) {
      return [normalized];
    }
  } catch {
    // Ignore exact-match lookup failures and return an empty set instead.
  }

  return [];
}

async function listJiraProjects(
  ctx: PluginSetupContext,
  config: JiraConfig,
  query?: string
): Promise<CanonicalUpstreamProject[]> {
  const trimmedQuery = query?.trim().toLowerCase() ?? '';
  const response = await jiraApiCall(ctx, config, async (api) => await api.getAllProjects({
    includeArchived: false
  }));
  const projects = Array.isArray(response) ? response : [];

  return projects
    .map((project) => {
      const record = project && typeof project === 'object' ? project as Record<string, unknown> : null;
      if (!record) {
        return null;
      }
      const key = normalizeOptionalString(record.key);
      const displayName = normalizeOptionalString(record.name) ?? key;
      const url = normalizeOptionalString(record.self);
      if (!key || !displayName) {
        return null;
      }
      return {
        id: normalizeOptionalString(record.id) ?? key,
        key,
        displayName,
        ...(url ? { url } : {})
      } satisfies CanonicalUpstreamProject;
    })
    .filter((project): project is CanonicalUpstreamProject => project !== null)
    .filter((project) => {
      if (!trimmedQuery) {
        return true;
      }
      return project.key.toLowerCase().includes(trimmedQuery)
        || project.displayName.toLowerCase().includes(trimmedQuery)
        || (project.url?.toLowerCase().includes(trimmedQuery) ?? false);
    })
    .slice(0, 20);
}

function buildIssueMarker(jiraIssueKey: string): string {
  return `${HIDDEN_ISSUE_MARKER_PREFIX}${jiraIssueKey}${HIDDEN_ISSUE_MARKER_SUFFIX}`;
}

function stripIssueMarker(description: string): string {
  return description.replace(/<!-- paperclip-jira-plugin-upstream: [^>]+ -->/g, '').trim();
}

function ensureIssueMarker(description: string, jiraIssueKey: string): string {
  const cleanDescription = stripIssueMarker(description).trim();
  const marker = buildIssueMarker(jiraIssueKey);
  return cleanDescription ? `${cleanDescription}\n\n${marker}` : marker;
}

function hasIssueMarker(description: string | null | undefined, jiraIssueKey?: string): boolean {
  if (!description) {
    return false;
  }

  return jiraIssueKey
    ? description.includes(buildIssueMarker(jiraIssueKey))
    : /<!-- paperclip-jira-plugin-upstream: [^>]+ -->/.test(description);
}

function hashCommentBody(body: string): string {
  return createHash('sha1').update(body).digest('hex');
}

function buildImportedIssueDescription(jiraIssue: JiraIssueRecord): string {
  const body = jiraIssue.description.trim();
  return ensureIssueMarker(body || `_Imported from Jira ${jiraIssue.key}._`, jiraIssue.key);
}

function matchesImportedIssueSnapshot(issue: Issue, link: JiraIssueLinkData): boolean {
  if (link.importedTitleHash && link.importedDescriptionHash) {
    const currentTitleHash = hashCommentBody(issue.title);
    const currentDescriptionHash = hashCommentBody(issue.description ?? '');
    return currentTitleHash === link.importedTitleHash && currentDescriptionHash === link.importedDescriptionHash;
  }

  const prefixedTitle = issue.title.trim().startsWith(`[${link.jiraIssueKey}]`);
  const descriptionHasMarker = hasIssueMarker(issue.description ?? '', link.jiraIssueKey);
  return prefixedTitle && descriptionHasMarker;
}

function shouldPresentIssueLink(issue: Issue, link: JiraIssueLinkData | null): link is JiraIssueLinkData {
  if (!link) {
    return false;
  }

  const hasTitlePrefix = issue.title.trim().startsWith(`[${link.jiraIssueKey}]`);
  const descriptionHasMarker = hasIssueMarker(issue.description ?? '', link.jiraIssueKey);
  return hasTitlePrefix || descriptionHasMarker;
}

function extractUpstreamIssueKey(issue: Issue): string | null {
  const markerMatch = issue.description?.match(/<!-- paperclip-jira-plugin-upstream: ([^ >]+) -->/i);
  if (markerMatch?.[1]) {
    return markerMatch[1].trim().toUpperCase();
  }

  const titleMatch = issue.title.match(/^\[([A-Z][A-Z0-9]+-\d+)\]/i);
  return titleMatch?.[1]?.trim().toUpperCase() ?? null;
}

async function findLinkedIssueEntity(
  ctx: PluginSetupContext,
  issueId: string
): Promise<JiraIssueLinkData | null> {
  const records = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  const scopedRecord = records.find((record) => record.scopeKind === 'issue' && record.scopeId === issueId);
  if (!scopedRecord) {
    return null;
  }

  return scopedRecord.data as unknown as JiraIssueLinkData;
}

async function findLinkedIssueEntityByKey(
  ctx: PluginSetupContext,
  jiraIssueKey: string,
  options?: {
    companyId?: string;
    projectId?: string;
  }
): Promise<JiraIssueLinkData | null> {
  const records = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  if (records.length === 0) {
    return null;
  }

  const scoped = records
    .map((record) => record.data as unknown as JiraIssueLinkData)
    .filter((record) =>
      record.jiraIssueKey === jiraIssueKey
      && (!options?.companyId || record.companyId === options.companyId)
      && (!options?.projectId || record.projectId === options.projectId)
    );
  const sortedByLastSynced = [...scoped].sort((left, right) => {
    const leftTime = left.lastSyncedAt ? Date.parse(left.lastSyncedAt) : Number.NEGATIVE_INFINITY;
    const rightTime = right.lastSyncedAt ? Date.parse(right.lastSyncedAt) : Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });

  if (options?.companyId || options?.projectId) {
    return sortedByLastSynced[0] ?? null;
  }

  return sortedByLastSynced[0] ?? null;
}

function isIssueHidden(issue: Issue): boolean {
  const issueRecord = issue as unknown as Record<string, unknown>;
  return issueRecord.hidden === true || Boolean(issueRecord.hiddenAt);
}

async function upsertIssueLinkEntity(
  ctx: PluginSetupContext,
  issueId: string,
  data: JiraIssueLinkData
): Promise<void> {
  await ctx.entities.upsert({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    scopeKind: 'issue',
    scopeId: issueId,
    externalId: `${data.jiraIssueKey}:${issueId}`,
    title: data.jiraIssueKey,
    status: data.jiraStatusName,
    data: data as unknown as Record<string, unknown>
  });
}

async function findOrRecoverLinkedIssueEntity(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  companyId: string,
  issueId: string
): Promise<JiraIssueLinkData | null> {
  const existing = await findLinkedIssueEntity(ctx, issueId);
  if (existing) {
    return existing;
  }

  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue) {
    return null;
  }

  const jiraIssueKey = extractUpstreamIssueKey(issue);
  if (!jiraIssueKey) {
    return null;
  }

  const byKey = await findLinkedIssueEntityByKey(ctx, jiraIssueKey, {
    companyId,
    projectId: issue.projectId ?? undefined
  });
  if (byKey?.issueId === issueId) {
    return byKey;
  }

  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  if (!mapping) {
    return null;
  }

  const providerId = await getMappingProviderId(ctx, mapping);
  const providerType = await getProviderTypeById(ctx, providerId);
  if (isGitHubProviderType(providerType)) {
    if (!isGitHubConfigReady(await getResolvedGitHubConfig(ctx, providerId))) {
      return null;
    }
  } else if (!isConfigReady(await getResolvedConfig(ctx, providerId))) {
    return null;
  }

  const [jiraIssue] = await searchUpstreamIssues(ctx, mapping, { issueKey: jiraIssueKey });
  if (!jiraIssue) {
    return null;
  }

  const repairedLink: JiraIssueLinkData = {
    issueId,
    companyId,
    projectId: issue.projectId ?? mapping.paperclipProjectId,
    ...(providerId ? { providerId } : {}),
    jiraIssueId: jiraIssue.id,
    jiraIssueKey: jiraIssue.key,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraUrl: jiraIssue.url,
    ...(jiraIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: jiraIssue.assigneeDisplayName } : {}),
    ...(jiraIssue.creatorDisplayName ? { jiraCreatorDisplayName: jiraIssue.creatorDisplayName } : {}),
    jiraStatusName: jiraIssue.statusName,
    jiraStatusCategory: jiraIssue.statusCategory,
    linkedCommentCount: jiraIssue.comments.length,
    lastSyncedAt: new Date().toISOString(),
    lastPulledAt: new Date().toISOString(),
    source: 'jira'
  };
  await upsertIssueLinkEntity(ctx, issueId, repairedLink);
  return repairedLink;
}

async function getCommentLinkRegistry(
  ctx: PluginSetupContext,
  issueId: string
): Promise<Record<string, JiraCommentLinkData>> {
  const stored = await ctx.state.get({
    scopeKind: 'issue',
    scopeId: issueId,
    stateKey: COMMENT_LINKS_STATE_KEY
  });
  if (!stored || typeof stored !== 'object') {
    return {};
  }

  return stored as Record<string, JiraCommentLinkData>;
}

async function findCommentLinkEntity(
  ctx: PluginSetupContext,
  issueId: string,
  commentId: string
): Promise<JiraCommentLinkData | null> {
  const registry = await getCommentLinkRegistry(ctx, issueId);
  return registry[commentId] ?? null;
}

async function findCommentLinkEntityByRemoteId(
  ctx: PluginSetupContext,
  issueId: string,
  jiraCommentId: string
): Promise<JiraCommentLinkData | null> {
  const registry = await getCommentLinkRegistry(ctx, issueId);
  return Object.values(registry).find((entry) => entry.jiraCommentId === jiraCommentId) ?? null;
}

async function upsertCommentLinkEntity(
  ctx: PluginSetupContext,
  issueId: string,
  data: JiraCommentLinkData
): Promise<void> {
  const registry = await getCommentLinkRegistry(ctx, issueId);
  await ctx.state.set(
    {
      scopeKind: 'issue',
      scopeId: issueId,
      stateKey: COMMENT_LINKS_STATE_KEY
    },
    {
      ...registry,
      [data.commentId]: data
    }
  );
}

async function importJiraComments(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  jiraIssue: JiraIssueRecord
): Promise<void> {
  for (const jiraComment of jiraIssue.comments) {
    const linkedComment = await findCommentLinkEntityByRemoteId(ctx, issueId, jiraComment.id);
    if (linkedComment) {
      continue;
    }

    const importedComment = await ctx.issues.createComment(
      issueId,
      `Imported from Jira by ${jiraComment.authorDisplayName} on ${new Date(jiraComment.createdAt).toLocaleString('en-CA')}\n\n${jiraComment.body}`,
      companyId
    );
    await upsertCommentLinkEntity(ctx, issueId, {
      commentId: importedComment.id,
      issueId,
      companyId,
      jiraIssueKey: jiraIssue.key,
      jiraCommentId: jiraComment.id,
      direction: 'pull',
      lastSyncedAt: new Date().toISOString()
    });
  }
}

async function resolveMappingForIssue(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  companyId: string,
  issueId: string
): Promise<JiraMapping | null> {
  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue?.projectId) {
    return null;
  }

  const projectConfig = getProjectConfig(settings, companyId, issue.projectId);
  if (projectConfig?.mappings[0]) {
    const mapping = projectConfig.mappings[0];
    return {
      id: mapping.id,
      companyId,
      providerId: projectConfig.providerId,
      jiraProjectKey: mapping.jiraProjectKey,
      ...(mapping.jiraJql ? { jiraJql: mapping.jiraJql } : {}),
      paperclipProjectId: projectConfig.projectId,
      paperclipProjectName: projectConfig.projectName,
      ...(mapping.filters ? { filters: mapping.filters } : {})
    };
  }

  const issueProject = await findProjectById(ctx, companyId, issue.projectId);
  return getMappingsForCompany(settings, companyId).find((mapping) => mappingMatchesProject(mapping, issueProject)) ?? null;
}

async function resolveProjectConfigForIssue(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  companyId: string,
  issueId: string
): Promise<JiraProjectSyncConfig | null> {
  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue?.projectId) {
    return null;
  }

  return getProjectConfig(settings, companyId, issue.projectId);
}

async function getConfigForMapping(
  ctx: PluginSetupContext,
  mapping: JiraMapping
): Promise<JiraConfig> {
  return await getResolvedConfig(ctx, await getMappingProviderId(ctx, mapping));
}

async function importOrUpdateIssueFromJira(
  ctx: PluginSetupContext,
  companyId: string,
  mapping: JiraMapping,
  jiraIssue: JiraIssueRecord
): Promise<'imported' | 'updated' | 'skipped'> {
  const resolvedProject = await resolvePaperclipProjectForMapping(ctx, companyId, mapping);
  if (!resolvedProject) {
    return 'skipped';
  }
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const projectConfig = getProjectConfig(settings, companyId, resolvedProject.id, resolvedProject.name);
  const mappedPaperclipState = resolveMappedPaperclipState(projectConfig, jiraIssue.statusName);

  const existingLink = await findLinkedIssueEntityByKey(ctx, jiraIssue.key, {
    companyId,
    projectId: resolvedProject.id
  });
  const now = new Date().toISOString();
  const providerId = await getMappingProviderId(ctx, mapping);
  const importedTitle = ensureIssueTitlePrefix(jiraIssue.summary, jiraIssue.key);
  const importedDescription = buildImportedIssueDescription(jiraIssue);

  const createImportedIssue = async (
    linkSeed?: JiraIssueLinkData
  ): Promise<'imported'> => {
    const createdIssue = await ctx.issues.create({
      companyId,
      projectId: resolvedProject.id,
      title: importedTitle,
      description: importedDescription,
      priority: 'medium'
    });
    await ctx.issues.update(
      createdIssue.id,
      {
        description: importedDescription,
        ...mappedPaperclipState
      },
      companyId
    );
    await upsertIssueLinkEntity(ctx, createdIssue.id, {
      ...(linkSeed ?? {}),
      issueId: createdIssue.id,
      companyId,
      projectId: resolvedProject.id,
      ...(providerId ? { providerId } : {}),
      jiraIssueId: jiraIssue.id,
      jiraIssueKey: jiraIssue.key,
      jiraProjectKey: mapping.jiraProjectKey,
      jiraUrl: jiraIssue.url,
      ...(jiraIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: jiraIssue.assigneeDisplayName } : {}),
      ...(jiraIssue.creatorDisplayName ? { jiraCreatorDisplayName: jiraIssue.creatorDisplayName } : {}),
      jiraStatusName: jiraIssue.statusName,
      jiraStatusCategory: jiraIssue.statusCategory,
      linkedCommentCount: jiraIssue.comments.length,
      lastSyncedAt: now,
      lastPulledAt: now,
      source: 'jira',
      importedTitleHash: hashCommentBody(importedTitle),
      importedDescriptionHash: hashCommentBody(importedDescription)
    });
    await importJiraComments(ctx, companyId, createdIssue.id, jiraIssue);
    return 'imported';
  };

  if (!existingLink) {
    return await createImportedIssue();
  }

  const existingIssue = await ctx.issues.get(existingLink.issueId, companyId);
  if (!existingIssue) {
    return await createImportedIssue(existingLink);
  }
  if (isIssueHidden(existingIssue)) {
    // If users hid an imported issue, keep it hidden and recreate a fresh synced copy on demand.
    return await createImportedIssue(existingLink);
  }

  await ctx.issues.update(
    existingIssue.id,
    {
      title: importedTitle,
      description: importedDescription,
      ...mappedPaperclipState
    } as Record<string, unknown>,
    companyId
  );
  await upsertIssueLinkEntity(ctx, existingIssue.id, {
    ...existingLink,
    ...(providerId ? { providerId } : {}),
    jiraIssueId: jiraIssue.id,
    jiraIssueKey: jiraIssue.key,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraUrl: jiraIssue.url,
    ...(jiraIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: jiraIssue.assigneeDisplayName } : {}),
    ...(jiraIssue.creatorDisplayName ? { jiraCreatorDisplayName: jiraIssue.creatorDisplayName } : {}),
    jiraStatusName: jiraIssue.statusName,
    jiraStatusCategory: jiraIssue.statusCategory,
    linkedCommentCount: jiraIssue.comments.length,
    lastSyncedAt: now,
    lastPulledAt: now,
    importedTitleHash: hashCommentBody(importedTitle),
    importedDescriptionHash: hashCommentBody(importedDescription)
  });
  await importJiraComments(ctx, companyId, existingIssue.id, jiraIssue);
  return 'updated';
}

async function syncMappings(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  companyId: string,
  options?: {
    projectId?: string;
    issueId?: string;
    issueLinkKey?: string;
    filters?: JiraTaskFilters;
    trigger?: SyncRunState['lastRunTrigger'];
  }
): Promise<SyncRunState> {
  const allMappings = getMappingsForCompany(settings, companyId);
  let workingSettings = settings;
  const scopedProject = options?.projectId ? await findProjectById(ctx, companyId, options.projectId) : null;
  const scopedProjectConfig =
    options?.projectId
      ? getProjectConfig(settings, companyId, options.projectId, scopedProject?.name)
      : null;
  if (options?.projectId && scopedProjectConfig && !scopedProjectConfig.providerId) {
    return await saveSyncState(ctx, workingSettings, companyId, {
      status: 'error',
      message: 'Select a provider before running sync for this project.',
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    }, options.projectId).then((next) => getProjectSyncState(next, companyId, options.projectId));
  }
  const candidateMappings = scopedProjectConfig
    ? scopedProjectConfig.mappings
      .filter((mapping) => mapping.enabled !== false)
      .map((mapping) => ({
        id: mapping.id,
        companyId,
        providerId: scopedProjectConfig.providerId,
        jiraProjectKey: mapping.jiraProjectKey,
        ...(mapping.enabled !== false ? { enabled: true } : {}),
        ...(mapping.jiraJql ? { jiraJql: mapping.jiraJql } : {}),
        paperclipProjectId: scopedProjectConfig.projectId,
        paperclipProjectName: scopedProjectConfig.projectName,
        ...(mapping.filters ? { filters: mapping.filters } : {})
      }))
    : options?.projectId
      ? allMappings.filter((mapping) => mapping.enabled !== false && mappingMatchesProject(mapping, scopedProject))
      : allMappings.filter((mapping) => mapping.enabled !== false);
  const mappings: JiraMapping[] = [];
  for (const mapping of candidateMappings) {
    const resolvedProject = await resolvePaperclipProjectForMapping(ctx, companyId, mapping);
    if (!resolvedProject) {
      continue;
    }
    const providerType = await getProviderTypeById(ctx, mapping.providerId);
    const resolvedGitHubRepository =
      !mapping.jiraProjectKey && isGitHubProviderType(providerType)
        ? await findProjectGitHubRepository(ctx, companyId, resolvedProject.id, resolvedProject.name)
        : undefined;
    mappings.push({
      ...mapping,
      ...(resolvedGitHubRepository ? { jiraProjectKey: resolvedGitHubRepository } : {}),
      paperclipProjectId: resolvedProject.id,
      paperclipProjectName: resolvedProject.name
    });
  }
  if (mappings.length === 0) {
    return await saveSyncState(ctx, workingSettings, companyId, {
      status: 'error',
      message: 'Enable at least one project mapping before running sync.',
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    }, options?.projectId).then((next) => getProjectSyncState(next, companyId, options?.projectId));
  }

  workingSettings = await saveSyncState(ctx, workingSettings, companyId, {
    status: 'running',
    message: 'Upstream sync is running.',
    checkedAt: new Date().toISOString(),
    processedCount: 0,
    lastRunTrigger: options?.trigger ?? 'manual'
  }, options?.projectId);

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  try {
    const issueBatches: Array<{ mapping: JiraMapping; issues: JiraIssueRecord[] }> = [];
    for (const mapping of mappings) {
      const providerType = await getProviderTypeById(ctx, mapping.providerId);
      try {
        const configSummary = isGitHubProviderType(providerType)
          ? buildGitHubConfigSummary(await getResolvedGitHubConfig(ctx, mapping.providerId))
          : buildConfigSummary(await getResolvedConfig(ctx, mapping.providerId));
        if (!configSummary.ready) {
          const errorMessage = `Provider for mapping ${mapping.jiraProjectKey} is not ready. ${configSummary.message}`;
          workingSettings = await saveConnectionTestState(ctx, workingSettings, companyId, {
            status: 'error',
            message: errorMessage,
            checkedAt: new Date().toISOString(),
            providerKey: providerType,
            ...(mapping.providerId ? { providerId: mapping.providerId } : {})
          }, options?.projectId);
          throw new Error(errorMessage);
        }

        const mappingFilters = options?.filters ?? mapping.filters ?? getFiltersForCompany(workingSettings, companyId);
        const issues = await searchUpstreamIssues(ctx, mapping, {
          ...(options?.issueLinkKey ? { issueKey: options.issueLinkKey } : {}),
          ...(mappingFilters ? { filters: mappingFilters } : {})
        });
        workingSettings = await saveConnectionTestState(ctx, workingSettings, companyId, {
          status: 'success',
          message: `Last sync succeeded for ${mapping.jiraProjectKey}.`,
          checkedAt: new Date().toISOString(),
          providerKey: providerType,
          ...(mapping.providerId ? { providerId: mapping.providerId } : {})
        }, options?.projectId);
        issueBatches.push({ mapping, issues });
      } catch (error) {
        if (error instanceof Error && !/is not ready\./.test(error.message)) {
          workingSettings = await saveConnectionTestState(ctx, workingSettings, companyId, {
            status: 'error',
            message: error.message,
            checkedAt: new Date().toISOString(),
            providerKey: providerType,
            ...(mapping.providerId ? { providerId: mapping.providerId } : {})
          }, options?.projectId);
        }
        throw error;
      }
    }

    const totalCount = issueBatches.reduce((sum, batch) => sum + batch.issues.length, 0);
    workingSettings = await saveSyncState(ctx, workingSettings, companyId, {
      status: 'running',
      message: totalCount > 0 ? `Upstream sync is running. 0 of ${totalCount} issues processed.` : 'No upstream issues matched the current filters.',
      checkedAt: new Date().toISOString(),
      processedCount: 0,
      totalCount,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      lastRunTrigger: options?.trigger ?? 'manual'
    }, options?.projectId);

    let processedCount = 0;
    for (const batch of issueBatches) {
      for (const jiraIssue of batch.issues) {
        if (options?.issueId) {
          const currentLink = await findLinkedIssueEntity(ctx, options.issueId);
          if (currentLink?.jiraIssueKey && currentLink.jiraIssueKey !== jiraIssue.key) {
            continue;
          }
        }

        const result = await importOrUpdateIssueFromJira(ctx, companyId, batch.mapping, jiraIssue);
        if (result === 'imported') {
          importedCount += 1;
        } else if (result === 'updated') {
          updatedCount += 1;
        } else {
          skippedCount += 1;
        }
        processedCount += 1;
        workingSettings = await saveSyncState(ctx, workingSettings, companyId, {
          status: 'running',
          message: totalCount > 0
            ? `Upstream sync is running. ${processedCount} of ${totalCount} issues processed.`
            : 'Upstream sync is running.',
          checkedAt: new Date().toISOString(),
          processedCount,
          totalCount,
          importedCount,
          updatedCount,
          skippedCount,
          failedCount,
          lastRunTrigger: options?.trigger ?? 'manual'
        }, options?.projectId);
      }
    }

    const nextSettings = await saveSyncState(ctx, workingSettings, companyId, {
      status: 'success',
      message: `Upstream sync finished. Imported ${importedCount}, updated ${updatedCount}, skipped ${skippedCount}.`,
      processedCount: importedCount + updatedCount + skippedCount,
      totalCount,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    }, options?.projectId);
    return getProjectSyncState(nextSettings, companyId, options?.projectId);
  } catch (error) {
    failedCount += 1;
    const nextSettings = await saveSyncState(ctx, workingSettings, companyId, {
      status: 'error',
      message: error instanceof Error ? error.message : 'Upstream sync failed.',
      processedCount: importedCount + updatedCount + skippedCount,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    }, options?.projectId);
    return getProjectSyncState(nextSettings, companyId, options?.projectId);
  }
}

async function buildSettingsRegistrationData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string,
  issueId?: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const projects = companyId ? await ctx.projects.list({ companyId }) : [];
  const visibleProjects = projects.filter((project) => !project.archivedAt);
  const importedCountsByProjectId = await countImportedIssuesByProject(ctx, companyId);
  const providers = await getAvailableProviders(ctx);
  const providerSummaries = await Promise.all(providers.map(async (provider) => {
    const config = await getProviderDisplayConfig(ctx, provider.id);
    const configSummary = buildDisplayConfigSummary(config);
    const connectionTest = getConnectionTestStateForCompany(settings, companyId, provider.id);
    const healthStatus =
      connectionTest.status === 'success'
        ? 'connected'
        : connectionTest.status === 'error'
          ? 'degraded'
          : configSummary.ready
            ? 'not_tested'
            : 'needs_config';
    return {
      providerId: provider.id,
      providerKey: provider.type,
      displayName: provider.name,
      status: healthStatus,
      healthLabel:
        healthStatus === 'connected'
          ? 'Connected'
          : healthStatus === 'degraded'
            ? 'Degraded'
            : healthStatus === 'not_tested'
              ? 'Not tested'
              : 'Needs config',
      healthMessage: connectionTest.message,
      configSummary: configSummary.message,
      supportsConnectionTest: true,
      defaultIssueType: config.defaultIssueType,
      tokenSaved: config.tokenSaved
    };
  }));
  const derivedIssue = companyId && issueId ? await ctx.issues.get(issueId, companyId) : null;
  const fallbackProjectId =
    normalizeOptionalString(projectId)
    ?? derivedIssue?.projectId
    ?? (visibleProjects.length === 1 ? visibleProjects[0]?.id : undefined);
  const selectedProject = fallbackProjectId ? visibleProjects.find((project) => project.id === fallbackProjectId) ?? null : null;
  const selectedProjectGitHubRepository = selectedProject ? getProjectGitHubRepository(selectedProject) : undefined;
  const projectConfig = selectedProject
    ? getProjectConfig(settings, companyId ?? '', selectedProject.id, selectedProject.name)
    : null;
  const selectedProviderId = projectConfig?.providerId ?? null;
  const selectedProviderConfig = selectedProviderId ? await getProviderDisplayConfig(ctx, selectedProviderId) : null;
  const selectedProviderSummary = selectedProviderConfig ? buildDisplayConfigSummary(selectedProviderConfig) : null;
  const selectedProviderType = selectedProviderConfig?.providerType ?? null;
  const selectedMappings = projectConfig?.mappings.map((mapping) => ({
    id: mapping.id,
    providerId: projectConfig.providerId,
    enabled: mapping.enabled !== false,
    jiraProjectKey: mapping.jiraProjectKey,
    ...(mapping.jiraJql ? { jiraJql: mapping.jiraJql } : {}),
    paperclipProjectId: projectConfig.projectId,
    paperclipProjectName: projectConfig.projectName,
    ...(mapping.filters ? { filters: mapping.filters } : {})
  })) ?? [];
  const agentIssueProviderAccess = projectConfig?.agentIssueProviderAccess ?? {
    enabled: false,
    allowedAgentIds: []
  };
  const entrySurface = issueId ? 'issue' : selectedProject ? 'project' : 'global';
  const requiresProjectSelection = !selectedProject;
  const providerTypeOptions = buildProviderTypeOptions();

  return {
    entryContext: {
      surface: entrySurface,
      projectId: selectedProject?.id ?? fallbackProjectId ?? null,
      issueId: issueId ?? null,
      projectName: selectedProject?.name ?? null,
      requiresProjectSelection
    },
    currentPage: requiresProjectSelection ? 'projects' : 'project',
    selectedProjectId: selectedProject?.id ?? null,
    selectedProjectName: selectedProject?.name ?? null,
    mappings: selectedMappings,
    filters: selectedMappings[0]?.filters ?? {},
    providers: providerSummaries,
    providerTypeOptions,
    selectedProviderId,
    selectedProviderKey: selectedProviderType,
    connectionTest: getProjectConnectionTestState(settings, companyId, selectedProject?.id, selectedProviderId ?? undefined),
    syncState: getProjectSyncState(settings, companyId, selectedProject?.id),
    scheduleFrequencyMinutes: projectConfig?.scheduleFrequencyMinutes ?? getProjectScheduleFrequencyMinutes(settings, companyId, selectedProject?.id),
    defaultAssignee: projectConfig?.defaultAssignee ?? null,
    defaultStatus: projectConfig?.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
    defaultStatusAssigneeAgentId: projectConfig?.defaultStatusAssigneeAgentId ?? null,
    statusMappings: getEffectiveStatusMappings(projectConfig),
    availableProjects: visibleProjects.map((project) => ({
      id: project.id,
      name: project.name,
      providerId: getProjectConfig(settings, companyId ?? '', project.id, project.name)?.providerId ?? null,
      providerDisplayName: providerSummaries.find((provider) => provider.providerId === getProjectConfig(settings, companyId ?? '', project.id, project.name)?.providerId)?.displayName ?? null,
      isConfigured: Boolean(getProjectConfig(settings, companyId ?? '', project.id, project.name)?.providerId),
      hasImportedIssues: (importedCountsByProjectId[project.id] ?? 0) > 0,
      suggestedUpstreamProjectKeys: getProjectGitHubRepository(project)
        ? { github_issues: getProjectGitHubRepository(project) }
        : undefined
    })),
    configReady: Boolean(projectConfig?.providerId) && (selectedProviderSummary?.ready ?? false),
    configMessage:
      !selectedProject
        ? 'Choose a Paperclip project to configure issue sync.'
        : projectConfig?.providerId
          ? (selectedProviderSummary?.message ?? 'Provider is ready.')
          : 'Select a provider to connect this Paperclip project to an upstream tracker.',
    projectConfig: selectedProject
      ? {
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          providerId: projectConfig?.providerId ?? null,
          agentIssueProviderAccess,
          defaultAssignee: projectConfig?.defaultAssignee ?? null,
          defaultStatus: projectConfig?.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
          defaultStatusAssigneeAgentId: projectConfig?.defaultStatusAssigneeAgentId ?? null,
          statusMappings: getEffectiveStatusMappings(projectConfig),
          scheduleFrequencyMinutes: projectConfig?.scheduleFrequencyMinutes ?? DEFAULT_SYNC_FREQUENCY_MINUTES,
          mappings: selectedMappings,
          suggestedUpstreamProjectKeys: selectedProjectGitHubRepository
            ? { github_issues: selectedProjectGitHubRepository }
            : undefined
        }
      : null,
    projectPage: selectedProject
      ? {
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          selectedProviderId: projectConfig?.providerId ?? null,
          agentIssueProviderAccess,
          suggestedUpstreamProjectKeys: selectedProjectGitHubRepository
            ? { github_issues: selectedProjectGitHubRepository }
            : undefined,
          showProviderSelection: true,
          showHideImported: true,
          showProjectSettings: Boolean(projectConfig?.providerId),
          showSyncActions: Boolean(projectConfig?.providerId),
          navigationContext: {
            surface: entrySurface,
            requiresProjectSelection
          }
        }
      : null,
    providerDirectory: {
      providers: providerSummaries.map((provider) => ({
        providerId: provider.providerId,
        providerType: provider.providerKey,
        displayName: provider.displayName,
        status: provider.status,
        healthLabel: provider.healthLabel,
        healthMessage: provider.healthMessage,
        configSummary: provider.configSummary,
        tokenSaved: provider.tokenSaved
      })),
      availableProviderTypes: providerTypeOptions
    },
    updatedAt: settings.updatedAt
  };
}

async function buildSyncProvidersData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const providers = await getAvailableProviders(ctx);

  return {
    providers: await Promise.all(providers.map(async (provider) => {
      const config = await getProviderDisplayConfig(ctx, provider.id);
      const configSummary = buildDisplayConfigSummary(config);
      const providerConnectionTest = getConnectionTestStateForCompany(settings, companyId, provider.id);
      const healthStatus =
        providerConnectionTest.status === 'success'
          ? 'connected'
          : providerConnectionTest.status === 'error'
            ? 'degraded'
            : configSummary.ready
              ? 'not_tested'
              : 'needs_config';
      return {
        providerId: provider.id,
        providerKey: provider.type,
        displayName: provider.name,
        status: healthStatus,
        healthLabel:
          healthStatus === 'connected'
            ? 'Connected'
            : healthStatus === 'degraded'
              ? 'Degraded'
              : healthStatus === 'not_tested'
                ? 'Not tested'
                : 'Needs config',
        healthMessage: providerConnectionTest.message,
        configSummary: configSummary.message,
        supportsConnectionTest: true,
        tokenSaved: config.tokenSaved
      };
    }))
  };
}

async function buildSyncEntryContextData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string,
  issueId?: string
): Promise<Record<string, unknown>> {
  const settingsData = await buildSettingsRegistrationData(ctx, companyId, projectId, issueId);
  return settingsData.entryContext as Record<string, unknown>;
}

async function buildSyncProjectListData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<Record<string, unknown>> {
  const settingsData = await buildSettingsRegistrationData(ctx, companyId);
  return {
    projects: Array.isArray(settingsData.availableProjects)
      ? settingsData.availableProjects.map((project) => {
          const record = project as Record<string, unknown>;
          return {
            projectId: normalizeOptionalString(record.id) ?? '',
            projectName: normalizeOptionalString(record.name) ?? '',
            providerId: normalizeOptionalString(record.providerId) ?? null,
            providerDisplayName: normalizeOptionalString(record.providerDisplayName) ?? null,
            hasImportedIssues: record.hasImportedIssues === true,
            isConfigured: record.isConfigured === true,
            suggestedUpstreamProjectKeys:
              record.suggestedUpstreamProjectKeys && typeof record.suggestedUpstreamProjectKeys === 'object'
                ? record.suggestedUpstreamProjectKeys as Record<string, string>
                : undefined
          };
        })
      : []
  };
}

async function buildSyncProjectPageData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string,
  issueId?: string
): Promise<Record<string, unknown>> {
  const settingsData = await buildSettingsRegistrationData(ctx, companyId, projectId, issueId);
  const projectPage = settingsData.projectPage as Record<string, unknown> | null | undefined;
  return {
    ...(projectPage ?? {}),
    availableProviders: settingsData.providers ?? [],
    providerSummary: settingsData.providerConfig ?? null,
    projectSettings: settingsData.projectConfig ?? null,
    navigationContext: (settingsData.entryContext as Record<string, unknown> | undefined) ?? null,
    selectedProviderId: settingsData.selectedProviderId ?? null,
    showProviderSelection: Boolean(projectPage?.showProviderSelection ?? settingsData.selectedProjectId),
    showHideImported: Boolean(projectPage?.showHideImported ?? settingsData.selectedProjectId),
    showProjectSettings: Boolean(projectPage?.showProjectSettings),
    showSyncActions: Boolean(projectPage?.showSyncActions),
    mappings: settingsData.mappings ?? [],
    syncProgress: settingsData.syncState ?? { status: 'idle' },
    connectionTest: settingsData.connectionTest ?? { status: 'idle' }
  };
}

async function buildProviderDirectoryData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<Record<string, unknown>> {
  const settingsData = await buildSettingsRegistrationData(ctx, companyId);
  return settingsData.providerDirectory as Record<string, unknown>;
}

async function buildProviderDetailData(
  ctx: PluginSetupContext,
  companyId?: string,
  providerId?: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const rawConfig = await ctx.config.get();
  const rawConfigRecord = rawConfig && typeof rawConfig === 'object' ? rawConfig as Record<string, unknown> : {};
  const providers = await getAvailableProviders(ctx);
  const selectedProvider = providerId ? providers.find((provider) => provider.id === providerId) ?? null : null;
  const config = selectedProvider ? await getProviderDisplayConfig(ctx, selectedProvider.id) : null;
  const inferredDefaultUpstreamKey = selectedProvider
    ? inferDefaultUpstreamKeyFromMappings(settings, companyId, selectedProvider.id, selectedProvider.type)
    : null;
  const legacyJiraBaseUrl = normalizeOptionalString(rawConfigRecord.jiraBaseUrl);
  const legacyJiraUserEmail = normalizeOptionalString(rawConfigRecord.jiraUserEmail);
  const legacyJiraDefaultIssueType = normalizeOptionalString(rawConfigRecord.defaultIssueType);
  const draftProvider =
    selectedProvider
      ? (isJiraProviderType(selectedProvider.type)
          ? {
              id: selectedProvider.id,
              type: selectedProvider.type,
              name: selectedProvider.name,
              jiraBaseUrl: (selectedProvider as JiraDcProviderConfig | JiraCloudProviderConfig).jiraBaseUrl
                ?? legacyJiraBaseUrl
                ?? '',
              jiraUserEmail: (selectedProvider as JiraDcProviderConfig | JiraCloudProviderConfig).jiraUserEmail
                ?? legacyJiraUserEmail
                ?? '',
              defaultIssueType: (selectedProvider as JiraDcProviderConfig | JiraCloudProviderConfig).defaultIssueType
                ?? legacyJiraDefaultIssueType
                ?? DEFAULT_ISSUE_TYPE
            }
          : {
              id: selectedProvider.id,
              type: 'github_issues' as const,
              name: selectedProvider.name,
              githubApiBaseUrl: (selectedProvider as GitHubIssuesProviderConfig).githubApiBaseUrl ?? DEFAULT_GITHUB_API_BASE_URL,
              defaultRepository: (selectedProvider as GitHubIssuesProviderConfig).defaultRepository ?? inferredDefaultUpstreamKey ?? ''
            })
      : {
          id: providerId ?? DEFAULT_PROVIDER_ID,
          type: 'jira_dc' as const,
          name: '',
          jiraBaseUrl: legacyJiraBaseUrl ?? '',
          jiraUserEmail: legacyJiraUserEmail ?? '',
          defaultIssueType: legacyJiraDefaultIssueType ?? DEFAULT_ISSUE_TYPE
        };
  const draftRecord = draftProvider as Record<string, unknown>;
  const draftName = normalizeOptionalString(draftRecord.name) ?? '';
  const draftJiraBaseUrl = normalizeOptionalString(draftRecord.jiraBaseUrl) ?? '';
  const draftJiraUserEmail = normalizeOptionalString(draftRecord.jiraUserEmail) ?? '';
  const draftDefaultIssueType = normalizeOptionalString(draftRecord.defaultIssueType) ?? DEFAULT_ISSUE_TYPE;
  const draftGitHubApiBaseUrl = normalizeOptionalString(draftRecord.githubApiBaseUrl) ?? DEFAULT_GITHUB_API_BASE_URL;
  const draftDefaultRepository = normalizeOptionalString(draftRecord.defaultRepository) ?? '';
  const connectionTest = selectedProvider ? getConnectionTestStateForCompany(settings, companyId, selectedProvider.id) : { status: 'idle' as const };
  return {
    mode: selectedProvider ? 'edit' : 'create',
    providerId: selectedProvider?.id ?? null,
    providerType: selectedProvider?.type ?? 'jira_dc',
    draft: draftProvider,
    fields: selectedProvider
      ? (isJiraProviderType(selectedProvider.type)
          ? {
              name: draftName,
              jiraBaseUrl: draftJiraBaseUrl,
              jiraUserEmail: draftJiraUserEmail,
              defaultIssueType: draftDefaultIssueType
            }
          : {
              name: draftName,
              githubApiBaseUrl: draftGitHubApiBaseUrl,
              defaultRepository: draftDefaultRepository
            })
      : {
          name: draftName,
          jiraBaseUrl: draftJiraBaseUrl,
          jiraUserEmail: draftJiraUserEmail,
          defaultIssueType: draftDefaultIssueType,
          githubApiBaseUrl: draftGitHubApiBaseUrl,
          defaultRepository: draftDefaultRepository
        },
    tokenSaved: Boolean(config?.tokenSaved),
    healthStatus:
      connectionTest.status === 'success'
        ? 'connected'
        : connectionTest.status === 'error'
          ? 'degraded'
          : config && buildDisplayConfigSummary(config).ready
            ? 'not_tested'
            : 'needs_config',
    healthMessage: connectionTest.message,
    backTarget: companyId ? 'providers' : 'settings',
    availableProviderTypes: buildProviderTypeOptions()
  };
}

async function buildSyncPopupState(
  ctx: PluginSetupContext,
  companyId?: string,
  providerId?: string,
  projectId?: string,
  issueId?: string
): Promise<Record<string, unknown>> {
  const settingsData = await buildSettingsRegistrationData(ctx, companyId, projectId, issueId);
  const selectedProviderId =
    normalizeOptionalString(providerId)
    ?? normalizeOptionalString(settingsData.selectedProviderId)
    ?? undefined;
  const config = selectedProviderId ? await getProviderDisplayConfig(ctx, selectedProviderId) : null;
  const selectedProviderType = config?.providerType ?? null;

  return {
    ...settingsData,
    selectedProviderId: selectedProviderId ?? null,
    selectedProviderKey: selectedProviderType,
    providerConfig: selectedProviderId
      ? {
          providerKey: selectedProviderType,
          providerId: selectedProviderId,
          providerName: config?.providerName ?? '',
          jiraBaseUrl: config?.baseUrl ?? '',
          jiraUserEmail: config?.userEmail ?? '',
          defaultIssueType: config?.defaultIssueType ?? DEFAULT_ISSUE_TYPE,
          githubApiBaseUrl: config?.githubApiBaseUrl ?? DEFAULT_GITHUB_API_BASE_URL,
          defaultRepository: config?.defaultRepository ?? '',
          tokenSaved: Boolean(config?.tokenSaved)
        }
      : null,
    filters: settingsData.filters ?? {},
    syncProgress: settingsData.syncState ?? { status: 'idle' },
    connectionTest: settingsData.connectionTest ?? { status: 'idle' }
  };
}

async function buildIssueJiraDetails(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue) {
    return { visible: false };
  }

  const projectConfig = issue.projectId ? getProjectConfig(settings, companyId, issue.projectId) : null;
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const rawLink = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  const link = shouldPresentIssueLink(issue, rawLink) ? rawLink : null;
  let liveIssue: JiraIssueRecord | null = null;
  const providerType = link?.providerId
    ? (await getProviderDisplayConfig(ctx, link.providerId)).providerType
    : mapping?.providerId
      ? (await getProviderDisplayConfig(ctx, mapping.providerId)).providerType
      : 'jira_dc';
  if (link) {
    try {
      const refreshMapping: JiraMapping = mapping ?? {
        id: `live-${link.jiraIssueKey}`,
        companyId,
        providerId: link.providerId,
        jiraProjectKey: link.jiraProjectKey,
        paperclipProjectId: issue.projectId ?? undefined,
        paperclipProjectName: projectConfig?.projectName ?? 'Linked project'
      };
      const canReadLiveIssue = isGitHubProviderType(providerType)
        ? isGitHubConfigReady(await getResolvedGitHubConfig(ctx, link.providerId ?? mapping?.providerId))
        : isConfigReady(await getResolvedConfig(ctx, link.providerId ?? mapping?.providerId));
      if (canReadLiveIssue) {
        const [refreshedIssue] = await searchUpstreamIssues(ctx, refreshMapping, { issueKey: link.jiraIssueKey });
        if (refreshedIssue) {
          liveIssue = refreshedIssue;
          const refreshedLink: JiraIssueLinkData = {
            ...link,
            jiraIssueId: refreshedIssue.id,
            jiraIssueKey: refreshedIssue.key,
            jiraProjectKey: link.jiraProjectKey,
            jiraUrl: refreshedIssue.url,
            ...(refreshedIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: refreshedIssue.assigneeDisplayName } : {}),
            ...(refreshedIssue.creatorDisplayName ? { jiraCreatorDisplayName: refreshedIssue.creatorDisplayName } : {}),
            jiraStatusName: refreshedIssue.statusName,
            jiraStatusCategory: refreshedIssue.statusCategory,
            linkedCommentCount: refreshedIssue.comments.length,
            lastSyncedAt: link.lastSyncedAt ?? new Date().toISOString()
          };
          await upsertIssueLinkEntity(ctx, issueId, refreshedLink);
        }
      }
    } catch {
      liveIssue = null;
    }
  }
  let availableTransitions: Array<{ id: string; name: string }> = [];
  if (link) {
    try {
      availableTransitions = await listUpstreamTransitionsForProvider(ctx, link.providerId ?? mapping?.providerId, link.jiraIssueKey);
    } catch {
      availableTransitions = [];
    }
  }

  return {
    visible: Boolean(link || (projectConfig?.providerId && mapping)),
    isSynced: Boolean(link),
    linked: Boolean(link),
    providerKey: providerType,
    upstreamProviderId: link?.providerId ?? mapping?.providerId ?? null,
    issueId,
    localStatus: issue.status,
    syncTone: link ? 'synced' : 'local',
    titlePrefix: link ? `[${link.jiraIssueKey}]` : null,
    upstreamIssueKey: link?.jiraIssueKey ?? null,
    openInProviderUrl: link?.jiraUrl ?? null,
    lastSyncedAt: link?.lastSyncedAt ?? null,
    ...(issue.projectId ? { projectId: issue.projectId } : {}),
    ...(mapping
      ? {
          mapping: {
            jiraProjectKey: mapping.jiraProjectKey,
            paperclipProjectName: mapping.paperclipProjectName
          }
        }
      : {}),
    ...(link
      ? {
          upstream: {
            issueKey: link.jiraIssueKey,
            jiraUrl: liveIssue?.url ?? link.jiraUrl,
            jiraAssigneeDisplayName: liveIssue?.assigneeDisplayName ?? link.jiraAssigneeDisplayName,
            jiraCreatorDisplayName: liveIssue?.creatorDisplayName ?? link.jiraCreatorDisplayName,
            jiraStatusName: liveIssue?.statusName ?? link.jiraStatusName,
            jiraStatusCategory: liveIssue?.statusCategory ?? link.jiraStatusCategory,
            lastSyncedAt: link.lastSyncedAt,
            lastPulledAt: link.lastPulledAt,
            lastPushedAt: link.lastPushedAt,
            source: link.source
          },
          upstreamStatus: {
            name: liveIssue?.statusName ?? link.jiraStatusName,
            category: liveIssue?.statusCategory ?? link.jiraStatusCategory
          },
          upstreamTransitions: availableTransitions,
          upstreamComments: (liveIssue?.comments ?? []).map((comment) => ({
            id: comment.id,
            body: comment.body,
            authorDisplayName: comment.authorDisplayName,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
          }))
        }
      : {})
  };
}

async function buildCommentAnnotationData(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  commentId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  if (!link) {
    return { visible: false };
  }

  const commentLink = await findCommentLinkEntity(ctx, issueId, commentId);
  const origin = !commentLink
    ? 'paperclip'
    : commentLink.direction === 'pull'
      ? 'provider_pull'
      : 'provider_push';
  const providerType = link.providerId ? (await getProviderDisplayConfig(ctx, link.providerId)).providerType : 'jira_dc';
  const platform = getProviderPlatformName(providerType);
  return {
    visible: true,
    linked: Boolean(commentLink),
    direction: commentLink?.direction ?? null,
    origin,
    providerKey: providerType,
    styleTone:
      origin === 'provider_pull'
        ? 'synced'
        : origin === 'provider_push'
          ? 'info'
          : 'local',
    badgeLabel:
      origin === 'provider_pull'
        ? 'Imported'
        : origin === 'provider_push'
          ? 'Published upstream'
          : 'Local only',
    isEditable: true,
    uploadAvailable: !commentLink,
    jiraIssueKey: link.jiraIssueKey,
    jiraUrl: link.jiraUrl,
    upstreamCommentId: commentLink?.jiraCommentId ?? null,
    lastSyncedAt: commentLink?.lastSyncedAt ?? null,
    syncMessage:
      origin === 'provider_pull'
        ? `Fetched from ${platform} issue ${link.jiraIssueKey}.`
        : origin === 'provider_push'
          ? `Uploaded to ${platform} issue ${link.jiraIssueKey}.`
          : `Local Paperclip comment on ${platform} issue ${link.jiraIssueKey}.`
  };
}

async function submitIssueComment(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  body: string
): Promise<Record<string, unknown>> {
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    throw new Error('Comment body is required.');
  }

  const createdComment = await ctx.issues.createComment(issueId, trimmedBody, companyId);
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const issueLink = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  const providerType =
    issueLink?.providerId
      ? await getProviderTypeById(ctx, issueLink.providerId)
      : 'jira_dc';
  const platform = getProviderPlatformName(providerType);

  try {
    const pushResult = await pushCommentToJira(ctx, companyId, issueId, createdComment.id);
    return {
      ok: true,
      commentId: createdComment.id,
      publishedUpstream: true,
      upstreamCommentId: pushResult.upstreamCommentId ?? null,
      message: `Created Paperclip comment and published it to ${platform}.`
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Created the comment in Paperclip, but ${platform} publishing failed: ${error.message}`
        : `Created the comment in Paperclip, but ${platform} publishing failed.`
    );
  }
}

function shouldRunScheduledSync(syncState: SyncRunState, scheduleFrequencyMinutes: number): boolean {
  if (!syncState.checkedAt) {
    return true;
  }

  const lastCheckedAt = new Date(syncState.checkedAt).getTime();
  return Number.isFinite(lastCheckedAt)
    ? (Date.now() - lastCheckedAt) >= scheduleFrequencyMinutes * 60_000
    : true;
}

async function pushIssueToJira(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const projectConfig = await resolveProjectConfigForIssue(ctx, settings, companyId, issueId);
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  if (!projectConfig?.providerId || !mapping) {
    throw new Error('This Paperclip issue is not in a project with configured upstream sync yet.');
  }

  const providerType = await getProviderTypeById(ctx, projectConfig.providerId);

  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue) {
    throw new Error('Paperclip issue not found.');
  }

  const existingLink = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  const now = new Date().toISOString();
  let jiraIssue: JiraIssueRecord;

  if (existingLink) {
    await updateUpstreamIssueForProvider(ctx, mapping, existingLink.jiraIssueKey, issue);
    if (isGitHubProviderType(providerType)) {
      await syncGitHubStatusFromPaperclip(ctx, await getResolvedGitHubConfig(ctx, projectConfig.providerId), existingLink.jiraIssueKey, issue.status);
    } else {
      await syncJiraStatusFromPaperclip(ctx, await getResolvedConfig(ctx, projectConfig.providerId), existingLink.jiraIssueKey, issue.status);
    }
    const [reloadedIssue] = await searchUpstreamIssues(ctx, mapping, { issueKey: existingLink.jiraIssueKey });
    if (!reloadedIssue) {
      throw new Error(`Upstream issue ${existingLink.jiraIssueKey} could not be reloaded after the update.`);
    }
    jiraIssue = reloadedIssue;
  } else {
    jiraIssue = await createUpstreamIssueForProvider(ctx, mapping, issue);
  }

  await ctx.issues.update(
    issueId,
    {
      title: ensureIssueTitlePrefix(issue.title, jiraIssue.key),
      description: ensureIssueMarker(issue.description ?? '', jiraIssue.key)
    },
    companyId
  );
  await upsertIssueLinkEntity(ctx, issueId, {
    issueId,
    companyId,
    projectId: issue.projectId ?? projectConfig.projectId ?? mapping.paperclipProjectId,
    providerId: projectConfig.providerId,
    jiraIssueId: jiraIssue.id,
    jiraIssueKey: jiraIssue.key,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraUrl: jiraIssue.url,
    ...(jiraIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: jiraIssue.assigneeDisplayName } : {}),
    ...(jiraIssue.creatorDisplayName ? { jiraCreatorDisplayName: jiraIssue.creatorDisplayName } : {}),
    jiraStatusName: jiraIssue.statusName,
    jiraStatusCategory: jiraIssue.statusCategory,
    linkedCommentCount: jiraIssue.comments.length,
    lastSyncedAt: now,
    lastPushedAt: now,
    lastPulledAt: existingLink?.lastPulledAt,
    source: existingLink?.source ?? 'paperclip'
  });

  return {
    ok: true,
    issueKey: jiraIssue.key,
    jiraUrl: jiraIssue.url,
    message: existingLink ? `Updated upstream issue ${jiraIssue.key}.` : `Created upstream issue ${jiraIssue.key}.`
  };
}

async function pullIssueFromJira(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const projectConfig = await resolveProjectConfigForIssue(ctx, settings, companyId, issueId);
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  if (!link || !mapping) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  const syncState = await syncMappings(ctx, settings, companyId, {
    issueId,
    issueLinkKey: link.jiraIssueKey,
    projectId: projectConfig?.projectId ?? mapping.paperclipProjectId,
    trigger: 'pull'
  });

  return {
    ok: syncState.status === 'success',
    message: syncState.message ?? 'Upstream pull finished.'
  };
}

async function pushCommentToJira(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  commentId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const issueLink = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  if (!issueLink) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  const existingCommentLink = await findCommentLinkEntity(ctx, issueId, commentId);
  if (existingCommentLink) {
    return {
      ok: true,
      message: `This comment was already synced to upstream issue ${issueLink.jiraIssueKey}.`
    };
  }

  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  if (!mapping) {
    throw new Error('This Paperclip issue is not in a mapped project yet.');
  }

  const comments = await ctx.issues.listComments(issueId, companyId);
  const comment = comments.find((entry) => entry.id === commentId);
  if (!comment) {
    throw new Error('Paperclip comment not found.');
  }

  const commentCreateResult = await addUpstreamCommentForProvider(ctx, issueLink.providerId ?? mapping.providerId, issueLink.jiraIssueKey, comment.body.trim());
  await upsertCommentLinkEntity(ctx, issueId, {
    commentId: comment.id,
    issueId,
    companyId,
    jiraIssueKey: issueLink.jiraIssueKey,
    jiraCommentId: commentCreateResult.id,
    direction: 'push',
    lastSyncedAt: new Date().toISOString()
  });

  return {
    ok: true,
    upstreamCommentId: commentCreateResult.id,
    message: `Synced comment to upstream issue ${issueLink.jiraIssueKey}.`
  };
}

async function setUpstreamIssueStatus(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  transitionId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  if (!link) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const transitions = await listUpstreamTransitionsForProvider(ctx, link.providerId ?? mapping?.providerId, link.jiraIssueKey);
  const selectedTransition = transitions.find((transition) => transition.id === transitionId);
  if (!selectedTransition) {
    throw new Error('That upstream status transition is not available right now.');
  }

  await transitionUpstreamIssueForProvider(ctx, link.providerId ?? mapping?.providerId, link.jiraIssueKey, transitionId);
  const [reloadedIssue] = await searchUpstreamIssues(ctx, {
    id: mapping?.id ?? 'reload',
    companyId,
    providerId: link.providerId ?? mapping?.providerId,
    jiraProjectKey: link.jiraProjectKey,
    jiraJql: mapping?.jiraJql,
    paperclipProjectId: mapping?.paperclipProjectId,
    paperclipProjectName: mapping?.paperclipProjectName ?? '',
    filters: mapping?.filters
  }, { issueKey: link.jiraIssueKey });

  if (!reloadedIssue) {
    throw new Error(`Upstream issue ${link.jiraIssueKey} could not be reloaded after the status change.`);
  }

  const projectConfig = await resolveProjectConfigForIssue(ctx, settings, companyId, issueId);
  const mappedPaperclipState = resolveMappedPaperclipState(projectConfig, reloadedIssue.statusName);
  if (mappedPaperclipState.status || Object.prototype.hasOwnProperty.call(mappedPaperclipState, 'assigneeAgentId')) {
    await ctx.issues.update(issueId, mappedPaperclipState, companyId);
  }

  await upsertIssueLinkEntity(ctx, issueId, {
    ...link,
    ...(link.providerId ?? mapping?.providerId ? { providerId: link.providerId ?? mapping?.providerId } : {}),
    ...(reloadedIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: reloadedIssue.assigneeDisplayName } : {}),
    ...(reloadedIssue.creatorDisplayName ? { jiraCreatorDisplayName: reloadedIssue.creatorDisplayName } : {}),
    jiraStatusName: reloadedIssue.statusName,
    jiraStatusCategory: reloadedIssue.statusCategory,
    lastSyncedAt: new Date().toISOString(),
    lastPushedAt: new Date().toISOString()
  });

  return {
    ok: true,
    message: `Updated upstream status to ${reloadedIssue.statusName}.`
  };
}

async function setUpstreamIssueAssignee(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  assignee: JiraUserReference
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  if (!link) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  await setUpstreamAssigneeForProvider(ctx, link.providerId ?? mapping?.providerId, link.jiraIssueKey, assignee);
  const [reloadedIssue] = await searchUpstreamIssues(ctx, {
    id: mapping?.id ?? 'reload',
    companyId,
    providerId: link.providerId ?? mapping?.providerId,
    jiraProjectKey: link.jiraProjectKey,
    jiraJql: mapping?.jiraJql,
    paperclipProjectId: mapping?.paperclipProjectId,
    paperclipProjectName: mapping?.paperclipProjectName ?? '',
    filters: mapping?.filters
  }, { issueKey: link.jiraIssueKey });

  if (!reloadedIssue) {
    throw new Error(`Upstream issue ${link.jiraIssueKey} could not be reloaded after the assignee change.`);
  }

  const projectConfig = await resolveProjectConfigForIssue(ctx, settings, companyId, issueId);
  const mappedPaperclipState = resolveMappedPaperclipState(projectConfig, reloadedIssue.statusName);
  if (mappedPaperclipState.status || Object.prototype.hasOwnProperty.call(mappedPaperclipState, 'assigneeAgentId')) {
    await ctx.issues.update(issueId, mappedPaperclipState, companyId);
  }

  await upsertIssueLinkEntity(ctx, issueId, {
    ...link,
    ...(link.providerId ?? mapping?.providerId ? { providerId: link.providerId ?? mapping?.providerId } : {}),
    ...(reloadedIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: reloadedIssue.assigneeDisplayName } : {}),
    ...(reloadedIssue.creatorDisplayName ? { jiraCreatorDisplayName: reloadedIssue.creatorDisplayName } : {}),
    jiraStatusName: reloadedIssue.statusName,
    jiraStatusCategory: reloadedIssue.statusCategory,
    lastSyncedAt: new Date().toISOString(),
    lastPushedAt: new Date().toISOString()
  });

  return {
    ok: true,
    message: `Updated upstream assignee to ${reloadedIssue.assigneeDisplayName ?? assignee.displayName}.`
  };
}

type AuthorizedIssueProviderToolContext = {
  settings: JiraSyncSettings;
  issue: Issue;
  projectConfig: JiraProjectSyncConfig;
  mapping: JiraMapping;
  providerId: string;
  providerType: ProviderType;
  link: JiraIssueLinkData | null;
};

async function authorizeIssueProviderTool(
  ctx: PluginSetupContext,
  runCtx: ToolRunContext,
  paperclipIssueId: string,
  options?: {
    requireLinkedIssue?: boolean;
  }
): Promise<AuthorizedIssueProviderToolContext> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const issue = await ctx.issues.get(paperclipIssueId, runCtx.companyId);
  if (!issue) {
    throw new Error('Paperclip issue not found.');
  }
  if (!issue.projectId) {
    throw new Error('This Paperclip issue is not attached to a project.');
  }
  if (issue.projectId !== runCtx.projectId) {
    throw new Error('Issue provider tools can only access issues in the agent run project.');
  }

  const projectConfig = getProjectConfig(settings, runCtx.companyId, issue.projectId);
  if (!projectConfig) {
    throw new Error('Issue provider tools are not enabled for this project.');
  }

  const access = projectConfig.agentIssueProviderAccess;
  if (!access?.enabled) {
    throw new Error('Issue provider tools are not enabled for this project.');
  }
  if (!access.allowedAgentIds.includes(runCtx.agentId)) {
    throw new Error('This agent is not allowed to use issue provider tools for this project.');
  }
  if (!projectConfig.providerId) {
    throw new Error('This project does not have an issue provider selected.');
  }

  const mapping = await resolveMappingForIssue(ctx, settings, runCtx.companyId, paperclipIssueId);
  if (!mapping) {
    throw new Error('This project does not have an upstream mapping yet.');
  }

  const providerId = projectConfig.providerId;
  const providerType = await getProviderTypeById(ctx, providerId);
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, runCtx.companyId, paperclipIssueId);
  if (options?.requireLinkedIssue && !link) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  return {
    settings,
    issue,
    projectConfig,
    mapping,
    providerId,
    providerType,
    link
  };
}

function buildToolContent(title: string, lines: string[]): string {
  return [title, ...lines.filter(Boolean)].join('\n');
}

function buildToolSuccess(data: unknown, content: string): ToolResult {
  return {
    data,
    content
  };
}

function buildToolError(error: unknown): ToolResult {
  return {
    error: error instanceof Error ? error.message : 'Tool execution failed.'
  };
}

async function findCleanupCandidates(
  ctx: PluginSetupContext,
  companyId: string,
  projectId?: string
): Promise<Array<{ issueId: string; title: string; jiraIssueKey: string; status: string }>> {
  const issueLinks = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  const scopedLinks = issueLinks
    .map((entry) => entry.data as unknown as JiraIssueLinkData)
    .filter((entry) => entry.companyId === companyId && (!projectId || entry.projectId === projectId));
  const candidates: Array<{ issueId: string; title: string; jiraIssueKey: string; status: string }> = [];

  for (const link of scopedLinks) {
    if (link.source !== 'jira') {
      continue;
    }

    const issue = await ctx.issues.get(link.issueId, companyId);
    if (!issue) {
      continue;
    }
    const issueRecord = issue as unknown as Record<string, unknown>;
    if (issueRecord.hidden === true || Boolean(issueRecord.hiddenAt)) {
      continue;
    }

    candidates.push({
      issueId: issue.id,
      title: issue.title,
      jiraIssueKey: link.jiraIssueKey,
      status: issue.status
    });
  }

  return candidates;
}

async function persistProjectRegistration(
  ctx: PluginSetupContext,
  record: Record<string, unknown>
): Promise<Record<string, unknown>> {
  type GroupedProjectInput = {
    projectId?: string;
    projectName?: string;
    providerId?: string;
    agentIssueProviderAccess?: AgentIssueProviderAccess;
    defaultAssignee?: JiraUserReference;
    defaultStatus?: PaperclipIssueStatus;
    defaultStatusAssigneeAgentId?: string | null;
    statusMappings?: JiraStatusMapping[];
    mappings: Array<JiraMapping | Record<string, unknown>>;
  };
  const companyId = normalizeCompanyId(record.companyId);
  if (!companyId) {
    throw new Error('A company id is required to save project mappings.');
  }

  const previous = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const mappings = Array.isArray(record.mappings) ? record.mappings : [];
  const explicitProjectId = normalizeOptionalString(record.projectId);
  const explicitProjectName = normalizeOptionalString(record.projectName);
  const explicitProviderId = normalizeOptionalString(record.providerId);
  const explicitAgentIssueProviderAccess = normalizeAgentIssueProviderAccess(record.agentIssueProviderAccess);
  const explicitDefaultAssignee = normalizeJiraUserReference(record.defaultAssignee);
  const explicitDefaultStatus = normalizePaperclipStatus(record.defaultStatus) ?? DEFAULT_PAPERCLIP_STATUS;
  const explicitDefaultStatusAssigneeAgentId = Object.prototype.hasOwnProperty.call(record, 'defaultStatusAssigneeAgentId')
    ? (normalizeOptionalString(record.defaultStatusAssigneeAgentId) ?? null)
    : undefined;
  const explicitStatusMappings = Array.isArray(record.statusMappings)
    ? record.statusMappings
        .map((entry) => normalizeJiraStatusMapping(entry))
        .filter((entry): entry is JiraStatusMapping => entry !== null)
    : [];
  const scheduleFrequencyMinutes = normalizeFrequencyMinutes(record.scheduleFrequencyMinutes) ?? DEFAULT_SYNC_FREQUENCY_MINUTES;
  const shouldResolveProviderIdentity = Boolean(explicitProjectId || explicitProjectName);
  const legacyFallbackProviderId = shouldResolveProviderIdentity
    ? undefined
    : (await getAvailableProviders(ctx))[0]?.id;

  const groupedProjectInputs: GroupedProjectInput[] = explicitProjectId || explicitProjectName
    ? [{
        projectId: explicitProjectId,
        projectName: explicitProjectName,
        providerId: explicitProviderId,
        agentIssueProviderAccess: explicitAgentIssueProviderAccess,
        defaultAssignee: explicitDefaultAssignee,
        defaultStatus: explicitDefaultStatus,
        defaultStatusAssigneeAgentId: explicitDefaultStatusAssigneeAgentId,
        statusMappings: explicitStatusMappings,
        mappings
      }]
    : Array.from(mappings.reduce((accumulator, entry) => {
        const normalized = normalizeMapping({
          ...(entry && typeof entry === 'object' ? entry as Record<string, unknown> : {}),
          companyId
        }, accumulator.size);
        if (!normalized?.paperclipProjectName) {
          return accumulator;
        }
        const key = `${normalized.paperclipProjectId ?? normalizeProjectName(normalized.paperclipProjectName) ?? normalized.paperclipProjectName}`;
        const current = accumulator.get(key) ?? {
          projectId: normalized.paperclipProjectId,
          projectName: normalized.paperclipProjectName,
          providerId: normalized.providerId ?? legacyFallbackProviderId,
          agentIssueProviderAccess: {
            enabled: false,
            allowedAgentIds: []
          },
          defaultAssignee: normalized.filters?.assignee,
          defaultStatus: DEFAULT_PAPERCLIP_STATUS,
          defaultStatusAssigneeAgentId: null as string | null,
          statusMappings: getDefaultStatusMappings(),
          mappings: [] as JiraMapping[]
        };
        current.mappings.push(normalized);
        accumulator.set(key, current);
        return accumulator;
      }, new Map<string, {
        projectId?: string;
        projectName: string;
        providerId?: string;
        agentIssueProviderAccess: AgentIssueProviderAccess;
        defaultAssignee?: JiraUserReference;
        defaultStatus: PaperclipIssueStatus;
        defaultStatusAssigneeAgentId: string | null;
        mappings: JiraMapping[];
      }>()).values()) as GroupedProjectInput[];

  let nextSettings = previous;
  for (const [index, groupedInput] of groupedProjectInputs.entries()) {
    if (!groupedInput.projectName) {
      continue;
    }
    const existing = getProjectConfig(previous, companyId, groupedInput.projectId, groupedInput.projectName);
    const resolvedDefaultAssignee = groupedInput.defaultAssignee
      ?? existing?.defaultAssignee
      ?? (shouldResolveProviderIdentity && groupedInput.providerId
        ? await resolveProviderCurrentUser(ctx, await getProviderTypeById(ctx, groupedInput.providerId), groupedInput.providerId)
        : undefined);
    const projectConfig: JiraProjectSyncConfig = {
      id: existing?.id ?? `project-config-${Date.now()}-${index + 1}`,
      companyId,
      projectName: groupedInput.projectName,
      ...(groupedInput.projectId ? { projectId: groupedInput.projectId } : {}),
      ...(groupedInput.providerId ? { providerId: groupedInput.providerId } : {}),
      agentIssueProviderAccess: groupedInput.agentIssueProviderAccess ?? existing?.agentIssueProviderAccess ?? {
        enabled: false,
        allowedAgentIds: []
      },
      ...(resolvedDefaultAssignee ? { defaultAssignee: resolvedDefaultAssignee } : {}),
      defaultStatus: groupedInput.defaultStatus ?? existing?.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
      defaultStatusAssigneeAgentId:
        groupedInput.defaultStatusAssigneeAgentId !== undefined
          ? groupedInput.defaultStatusAssigneeAgentId
          : (existing?.defaultStatusAssigneeAgentId ?? null),
      statusMappings: groupedInput.statusMappings ?? existing?.statusMappings ?? getDefaultStatusMappings(),
      scheduleFrequencyMinutes,
      mappings: (() => {
        const normalizedMappings = groupedInput.mappings.map((entry, mappingIndex) => ({
        id: normalizeOptionalString((entry as Record<string, unknown>).id) ?? `mapping-${mappingIndex + 1}`,
        ...(typeof (entry as Record<string, unknown>).enabled === 'boolean' ? { enabled: (entry as Record<string, unknown>).enabled === true } : {}),
        jiraProjectKey: normalizeStoredProjectKey((entry as Record<string, unknown>).jiraProjectKey) ?? '',
        ...(normalizeOptionalString((entry as Record<string, unknown>).jiraJql) ? { jiraJql: normalizeOptionalString((entry as Record<string, unknown>).jiraJql) } : {}),
        ...(entry && typeof entry === 'object' && (entry as Record<string, unknown>).filters ? { filters: normalizeTaskFilters((entry as Record<string, unknown>).filters) } : {})
      })).filter((entry) => Boolean(entry.jiraProjectKey));
        if (normalizedMappings.length > 0) {
          return normalizedMappings;
        }

        return normalizedMappings;
      })(),
      syncState: existing?.syncState,
      connectionTest: existing?.connectionTest
    };
    if (projectConfig.mappings.length === 0 && isGitHubProviderType(await getProviderTypeById(ctx, groupedInput.providerId))) {
      const inferredRepository = await findProjectGitHubRepository(ctx, companyId, groupedInput.projectId, groupedInput.projectName);
      if (inferredRepository) {
        projectConfig.mappings = [{
          id: 'mapping-1',
          enabled: true,
          jiraProjectKey: inferredRepository
        }];
      }
    }
    nextSettings = await saveProjectConfig(ctx, nextSettings, projectConfig);
  }

  const selectedProjectId = explicitProjectId ?? groupedProjectInputs[0]?.projectId;
  return await buildSettingsRegistrationData(ctx, companyId, selectedProjectId);
}

function registerIssueProviderAgentTools(ctx: PluginSetupContext): void {
  ctx.tools.register(
    'get_upstream_issue',
    getIssueProviderAgentToolDeclaration('get_upstream_issue'),
    async (params, runCtx) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        if (!paperclipIssueId) {
          throw new Error('paperclipIssueId is required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx, paperclipIssueId, { requireLinkedIssue: true });
        const detail = await buildIssueJiraDetails(ctx, runCtx.companyId, paperclipIssueId);
        const upstreamStatus = detail.upstreamStatus as { name?: string; category?: string } | undefined;

        return buildToolSuccess(
          detail,
          buildToolContent('Upstream issue loaded.', [
            typeof detail.upstreamIssueKey === 'string' ? `Issue: ${detail.upstreamIssueKey}` : '',
            typeof detail.openInProviderUrl === 'string' ? `URL: ${detail.openInProviderUrl}` : '',
            upstreamStatus?.name ? `Status: ${upstreamStatus.name}${upstreamStatus.category ? ` (${upstreamStatus.category})` : ''}` : ''
          ])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'list_upstream_comments',
    getIssueProviderAgentToolDeclaration('list_upstream_comments'),
    async (params, runCtx) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        if (!paperclipIssueId) {
          throw new Error('paperclipIssueId is required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx, paperclipIssueId, { requireLinkedIssue: true });
        const detail = await buildIssueJiraDetails(ctx, runCtx.companyId, paperclipIssueId);
        const comments = Array.isArray(detail.upstreamComments) ? detail.upstreamComments : [];

        return buildToolSuccess(
          {
            paperclipIssueId,
            comments
          },
          buildToolContent('Upstream comments loaded.', [
            `Comments: ${comments.length}`
          ])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'add_upstream_comment',
    getIssueProviderAgentToolDeclaration('add_upstream_comment'),
    async (params, runCtx) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const body = typeof record.body === 'string' ? record.body.trim() : '';
        if (!paperclipIssueId || !body) {
          throw new Error('paperclipIssueId and body are required.');
        }

        const authorized = await authorizeIssueProviderTool(ctx, runCtx, paperclipIssueId, { requireLinkedIssue: true });
        const result = await addUpstreamCommentForProvider(ctx, authorized.link?.providerId ?? authorized.mapping.providerId, authorized.link!.jiraIssueKey, body);

        return buildToolSuccess(
          {
            paperclipIssueId,
            upstreamCommentId: result.id
          },
          buildToolContent('Upstream comment posted.', [
            `Issue: ${authorized.link?.jiraIssueKey ?? ''}`,
            `Comment ID: ${result.id}`
          ])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'set_upstream_status',
    getIssueProviderAgentToolDeclaration('set_upstream_status'),
    async (params, runCtx) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const transitionId = normalizeOptionalString(record.transitionId);
        if (!paperclipIssueId || !transitionId) {
          throw new Error('paperclipIssueId and transitionId are required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx, paperclipIssueId, { requireLinkedIssue: true });
        const result = await setUpstreamIssueStatus(ctx, runCtx.companyId, paperclipIssueId, transitionId);
        return buildToolSuccess(result, typeof result.message === 'string' ? result.message : 'Updated upstream status.');
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'set_upstream_assignee',
    getIssueProviderAgentToolDeclaration('set_upstream_assignee'),
    async (params, runCtx) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const assignee = normalizeJiraUserReference(record.assignee);
        if (!paperclipIssueId || !assignee) {
          throw new Error('paperclipIssueId and assignee are required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx, paperclipIssueId, { requireLinkedIssue: true });
        const result = await setUpstreamIssueAssignee(ctx, runCtx.companyId, paperclipIssueId, assignee);
        return buildToolSuccess(result, typeof result.message === 'string' ? result.message : 'Updated upstream assignee.');
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'search_upstream_users',
    getIssueProviderAgentToolDeclaration('search_upstream_users'),
    async (params, runCtx) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const query = normalizeOptionalString(record.query);
        if (!paperclipIssueId || !query) {
          throw new Error('paperclipIssueId and query are required.');
        }

        const authorized = await authorizeIssueProviderTool(ctx, runCtx, paperclipIssueId);
        const users = await searchProviderUsers(ctx, authorized.providerType, authorized.providerId, query);

        return buildToolSuccess(
          {
            paperclipIssueId,
            users
          },
          buildToolContent('Upstream users loaded.', [
            `Matches: ${users.length}`
          ])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'create_upstream_issue',
    getIssueProviderAgentToolDeclaration('create_upstream_issue'),
    async (params, runCtx) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        if (!paperclipIssueId) {
          throw new Error('paperclipIssueId is required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx, paperclipIssueId);
        const result = await pushIssueToJira(ctx, runCtx.companyId, paperclipIssueId);
        return buildToolSuccess(result, typeof result.message === 'string' ? result.message : 'Created upstream issue.');
      } catch (error) {
        return buildToolError(error);
      }
    }
  );
}

const plugin = definePlugin({
  async setup(ctx) {
    ctx.launchers.register(ENTITY_SYNC_LAUNCHER);
    registerIssueProviderAgentTools(ctx);

    ctx.data.register('sync.entryContext', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const projectId = normalizeOptionalString(record.projectId);
      const issueId = normalizeOptionalString(record.issueId);
      return await buildSyncEntryContextData(ctx, companyId, projectId, issueId);
    });

    ctx.data.register('sync.projects', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      return await buildSyncProjectListData(ctx, companyId);
    });

    ctx.data.register('sync.projectList', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      return await buildSyncProjectListData(ctx, companyId);
    });

    ctx.data.register('sync.projectPage', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const projectId = normalizeOptionalString(record.projectId);
      const issueId = normalizeOptionalString(record.issueId);
      return await buildSyncProjectPageData(ctx, companyId, projectId, issueId);
    });

    ctx.data.register('sync.providers', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      return await buildSyncProvidersData(ctx, companyId);
    });

    ctx.data.register('settings.providerDirectory', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      return await buildProviderDirectoryData(ctx, companyId);
    });

    ctx.data.register('settings.providerDetail', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const providerId = normalizeOptionalString(record.providerId);
      return await buildProviderDetailData(ctx, companyId, providerId);
    });

    ctx.data.register('sync.users.search', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const providerId = normalizeOptionalString(record.providerId);
      const query = normalizeOptionalString(record.query) ?? '';
      if (!providerId || !query) {
        return {
          suggestions: []
        };
      }

      try {
        const providerType = await getProviderTypeById(ctx, providerId);
        return {
          suggestions: await searchProviderUsers(ctx, providerType, providerId, query)
        };
      } catch {
        return {
          suggestions: []
        };
      }
    });

    ctx.data.register('sync.upstreamProjects.search', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const providerId = normalizeOptionalString(record.providerId);
      const query = normalizeOptionalString(record.query) ?? '';
      if (!providerId) {
        return { suggestions: [] } satisfies UpstreamProjectSearchResult;
      }

      try {
        const providerType = await getProviderTypeById(ctx, providerId);
        return {
          suggestions: await searchProviderProjects(ctx, providerType, providerId, query)
        } satisfies UpstreamProjectSearchResult;
      } catch {
        return { suggestions: [] } satisfies UpstreamProjectSearchResult;
      }
    });

    ctx.data.register('sync.popupState', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const providerId = normalizeOptionalString(record.providerId);
      const projectId = normalizeOptionalString(record.projectId);
      const issueId = normalizeOptionalString(record.issueId);
      return await buildSyncPopupState(ctx, companyId, providerId, projectId, issueId);
    });

    ctx.data.register('sync.projectState', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const projectId = normalizeOptionalString(record.projectId);
      const issueId = normalizeOptionalString(record.issueId);
      return await buildSyncPopupState(ctx, companyId, undefined, projectId, issueId);
    });

    ctx.data.register('settings.registration', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const projectId = normalizeOptionalString(record.projectId);
      const issueId = normalizeOptionalString(record.issueId);
      return await buildSettingsRegistrationData(ctx, companyId, projectId, issueId);
    });

    ctx.data.register('dashboard.summary', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const mappings = getMappingsForCompany(settings, companyId);
      const issueLinks = await ctx.entities.list({
        entityType: ISSUE_LINK_ENTITY_TYPE,
        limit: 500
      });
      const linkedIssueCount = issueLinks.filter((entry) => {
        const data = entry.data as Partial<JiraIssueLinkData>;
        return !companyId || data.companyId === companyId;
      }).length;

      return {
        mappingCount: mappings.length,
        linkedIssueCount,
        syncState: getSyncStateForCompany(settings, companyId)
      };
    });

    ctx.data.register('issue.jiraDetails', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      if (!companyId || !issueId) {
        return { visible: false };
      }

      return await buildIssueJiraDetails(ctx, companyId, issueId);
    });

    ctx.data.register('issue.syncPresentation', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      if (!companyId || !issueId) {
        return { visible: false, isSynced: false };
      }

      return await buildIssueJiraDetails(ctx, companyId, issueId);
    });

    ctx.data.register('comment.annotation', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const commentId = normalizeOptionalString(record.commentId);
      if (!companyId || !issueId || !commentId) {
        return { visible: false };
      }

      return await buildCommentAnnotationData(ctx, companyId, issueId, commentId);
    });

    ctx.data.register('comment.syncPresentation', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const commentId = normalizeOptionalString(record.commentId);
      if (!companyId || !issueId || !commentId) {
        return { visible: false, origin: 'paperclip', uploadAvailable: false };
      }

      return await buildCommentAnnotationData(ctx, companyId, issueId, commentId);
    });

    ctx.data.register('sync.assignableAgents', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      if (!companyId) {
        return { agents: [] };
      }

      const agents = await ctx.agents.list({
        companyId,
        limit: 200
      });

      return {
        agents: agents
          .filter((agent) => agent.status !== 'terminated')
          .sort((left, right) => left.name.localeCompare(right.name))
          .map((agent) => ({
            id: agent.id,
            name: agent.name,
            title: agent.title,
            status: agent.status
          }))
      };
    });

    ctx.actions.register('settings.saveRegistration', async (input) => {
      const record = normalizeInputRecord(input);
      return await persistProjectRegistration(ctx, record);
    });

    ctx.actions.register('sync.project.save', async (input) => {
      const record = normalizeInputRecord(input);
      return await persistProjectRegistration(ctx, record);
    });

    ctx.actions.register('sync.project.select', async (input) => {
      const record = normalizeInputRecord(input);
      const projectId = normalizeOptionalString(record.projectId);
      if (!projectId) {
        throw new Error('projectId is required.');
      }

      return {
        projectId,
        navigationTarget: `project:${projectId}`
      };
    });

    ctx.actions.register('sync.project.refreshIdentity', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const projectId = normalizeOptionalString(record.projectId);
      const providerId = normalizeOptionalString(record.providerId);
      if (!companyId || !projectId || !providerId) {
        throw new Error('companyId, projectId, and providerId are required.');
      }

      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const projects = await ctx.projects.list({ companyId });
      const project = projects.find((entry) => entry.id === projectId);
      if (!project) {
        throw new Error('Paperclip project not found.');
      }

      const providerType = await getProviderTypeById(ctx, providerId);
      const defaultAssignee = await resolveProviderCurrentUser(ctx, providerType, providerId);
      const existing = getProjectConfig(settings, companyId, projectId, project.name);
      await saveProjectConfig(ctx, settings, {
        id: existing?.id ?? `project-config-${Date.now()}`,
        companyId,
        projectId,
        projectName: project.name,
        providerId,
        ...(defaultAssignee ? { defaultAssignee } : {}),
        defaultStatus: existing?.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
        defaultStatusAssigneeAgentId: existing?.defaultStatusAssigneeAgentId ?? null,
        statusMappings: existing?.statusMappings ?? getDefaultStatusMappings(),
        scheduleFrequencyMinutes: existing?.scheduleFrequencyMinutes ?? DEFAULT_SYNC_FREQUENCY_MINUTES,
        mappings: existing?.mappings ?? [],
        syncState: existing?.syncState,
        connectionTest: existing?.connectionTest
      });

      return {
        defaultAssignee: defaultAssignee ?? null,
        resolvedFromProviderIdentity: Boolean(defaultAssignee),
        message: defaultAssignee
          ? `Loaded ${getProviderPlatformName(providerType)} user ${defaultAssignee.displayName}.`
          : `Could not resolve the current ${getProviderPlatformName(providerType)} user for this provider yet.`,
        projectState: await buildSyncPopupState(ctx, companyId, providerId, projectId)
      };
    });

    ctx.actions.register('sync.provider.saveConfig', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const providerKey = normalizeProviderType(record.providerKey);
      const providerId = normalizeOptionalString(record.providerId);
      if (!companyId) {
        throw new Error('A company id is required to save provider sync settings.');
      }
      if (providerKey && !providerRegistry.list().some((adapter) => adapter.type === providerKey)) {
        throw new Error(`Unsupported provider: ${providerKey}`);
      }

      const previous = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const filters = normalizeTaskFilters(record.filters);
      const next: JiraSyncSettings = {
        ...previous,
        filtersByCompanyId: {
          ...(previous.filtersByCompanyId ?? {}),
          [companyId]: filters
        },
        updatedAt: new Date().toISOString()
      };
      await saveSettings(ctx, next);
      return await buildSyncPopupState(ctx, companyId, providerId);
    });

    ctx.actions.register('sync.provider.testConnection', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const providerKey = normalizeProviderType(record.providerKey);
      const providerId = normalizeOptionalString(record.providerId);
      const projectId = normalizeOptionalString(record.projectId);
      if (!companyId) {
        throw new Error('A company id is required to test the provider connection.');
      }
      if (providerKey && !providerRegistry.list().some((adapter) => adapter.type === providerKey)) {
        throw new Error(`Unsupported provider: ${providerKey}`);
      }

      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const effectiveProviderKey = providerKey ?? (providerId ? (await getProviderDisplayConfig(ctx, providerId)).providerType : undefined) ?? 'jira_dc';
      const testingSettings = await saveConnectionTestState(ctx, settings, companyId, {
        status: 'testing',
        message: 'Testing provider connection…',
        checkedAt: new Date().toISOString(),
        providerKey: effectiveProviderKey,
        ...(providerId ? { providerId } : {})
      }, projectId);
      const configOverrides =
        record.config && typeof record.config === 'object'
          ? record.config as ProviderConfigRecord
          : undefined;
      const result = await testProviderConnectionAction(ctx, effectiveProviderKey, providerId, configOverrides);
      await saveConnectionTestState(ctx, testingSettings, companyId, {
        status: result.status,
        message: result.message,
        checkedAt: new Date().toISOString(),
        providerKey: effectiveProviderKey,
        ...(providerId ? { providerId } : {})
      }, projectId);
      return result;
    });

    ctx.actions.register('sync.testConnection', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const providerKey = normalizeProviderType(record.providerKey);
      const providerId = normalizeOptionalString(record.providerId);
      const projectId = normalizeOptionalString(record.projectId);
      if (!companyId) {
        throw new Error('A company id is required to test the provider connection.');
      }
      if (providerKey && !providerRegistry.list().some((adapter) => adapter.type === providerKey)) {
        throw new Error(`Unsupported provider: ${providerKey}`);
      }

      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const effectiveProviderKey = providerKey ?? (providerId ? (await getProviderDisplayConfig(ctx, providerId)).providerType : undefined) ?? 'jira_dc';
      const testingSettings = await saveConnectionTestState(ctx, settings, companyId, {
        status: 'testing',
        message: 'Testing provider connection…',
        checkedAt: new Date().toISOString(),
        providerKey: effectiveProviderKey,
        ...(providerId ? { providerId } : {})
      }, projectId);
      const configOverrides =
        record.config && typeof record.config === 'object'
          ? record.config as ProviderConfigRecord
          : undefined;
      const result = await testProviderConnectionAction(ctx, effectiveProviderKey, providerId, configOverrides);
      await saveConnectionTestState(ctx, testingSettings, companyId, {
        status: result.status,
        message: result.message,
        checkedAt: new Date().toISOString(),
        providerKey: effectiveProviderKey,
        ...(providerId ? { providerId } : {})
      }, projectId);
      return result;
    });

    ctx.actions.register('sync.runNow', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      if (!companyId) {
        throw new Error('A company id is required to run sync.');
      }
      const providerKey = normalizeProviderType(record.providerKey);
      if (providerKey && !providerRegistry.list().some((adapter) => adapter.type === providerKey)) {
        throw new Error(`Unsupported provider: ${providerKey}`);
      }

      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const overrideFilters = record.filters ? normalizeTaskFilters(record.filters) : undefined;
      return await syncMappings(ctx, settings, companyId, {
        ...(normalizeOptionalString(record.projectId) ? { projectId: normalizeOptionalString(record.projectId) } : {}),
        ...(normalizeOptionalString(record.issueId) ? { issueId: normalizeOptionalString(record.issueId) } : {}),
        ...(overrideFilters ? { filters: overrideFilters } : {}),
        trigger: 'manual'
      });
    });

    ctx.actions.register('issue.setUpstreamAssignee', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const assignee = normalizeJiraUserReference(record.assignee);
      if (!companyId || !issueId || !assignee) {
        throw new Error('companyId, issueId, and assignee are required.');
      }

      return await setUpstreamIssueAssignee(ctx, companyId, issueId, assignee);
    });

    ctx.actions.register('sync.findCleanupCandidates', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const projectId = normalizeOptionalString(record.projectId);
      if (!companyId) {
        throw new Error('A company id is required to clean up imported issues.');
      }

      const candidates = await findCleanupCandidates(ctx, companyId, projectId);
      return {
        candidates,
        count: candidates.length,
        message:
          candidates.length > 0
            ? `Found ${candidates.length} imported issue${candidates.length === 1 ? '' : 's'} to clean up.`
            : 'No imported issues need cleanup.'
      };
    });

    ctx.actions.register('sync.cleanupImportedIssues', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueIds = Array.isArray(record.issueIds)
        ? record.issueIds.map((issueId) => normalizeOptionalString(issueId)).filter((issueId): issueId is string => Boolean(issueId))
        : [];
      if (!companyId) {
        throw new Error('A company id is required to clean up imported issues.');
      }
      if (issueIds.length === 0) {
        return {
          count: 0,
          message: 'No imported issues were selected.'
        };
      }

      return {
        count: issueIds.length,
        message: `Selected ${issueIds.length} imported issue${issueIds.length === 1 ? '' : 's'} for cleanup.`
      };
    });

    ctx.actions.register('issue.pushToJira', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      if (!companyId || !issueId) {
        throw new Error('companyId and issueId are required.');
      }

      return await pushIssueToJira(ctx, companyId, issueId);
    });

    ctx.actions.register('issue.pullFromJira', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      if (!companyId || !issueId) {
        throw new Error('companyId and issueId are required.');
      }

      return await pullIssueFromJira(ctx, companyId, issueId);
    });

    ctx.actions.register('issue.setUpstreamStatus', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const transitionId = normalizeOptionalString(record.transitionId);
      if (!companyId || !issueId || !transitionId) {
        throw new Error('companyId, issueId, and transitionId are required.');
      }

      return await setUpstreamIssueStatus(ctx, companyId, issueId, transitionId);
    });

    ctx.actions.register('comment.pushToJira', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const commentId = normalizeOptionalString(record.commentId);
      if (!companyId || !issueId || !commentId) {
        throw new Error('companyId, issueId, and commentId are required.');
      }

      return await pushCommentToJira(ctx, companyId, issueId, commentId);
    });

    ctx.actions.register('comment.uploadToProvider', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const commentId = normalizeOptionalString(record.commentId);
      if (!companyId || !issueId || !commentId) {
        throw new Error('companyId, issueId, and commentId are required.');
      }

      return await pushCommentToJira(ctx, companyId, issueId, commentId);
    });

    ctx.actions.register('issue.comment.submit', async (input) => {
      const record = normalizeInputRecord(input);
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const body = typeof record.body === 'string' ? record.body : '';
      if (!companyId || !issueId) {
        throw new Error('companyId and issueId are required.');
      }

      return await submitIssueComment(ctx, companyId, issueId, body);
    });

    ctx.jobs.register('sync.jira-issues', async (job) => {
      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const projectConfigs = settings.projectConfigs ?? [];
      for (const projectConfig of projectConfigs) {
        const syncState = getProjectSyncState(settings, projectConfig.companyId, projectConfig.projectId);
        const scheduleFrequencyMinutes = getProjectScheduleFrequencyMinutes(settings, projectConfig.companyId, projectConfig.projectId);
        if (!projectConfig.projectId || !shouldRunScheduledSync(syncState, scheduleFrequencyMinutes)) {
          continue;
        }
        const activeProject = await findProjectById(ctx, projectConfig.companyId, projectConfig.projectId);
        if (!activeProject) {
          continue;
        }
        await syncMappings(ctx, settings, projectConfig.companyId, {
          projectId: projectConfig.projectId,
          trigger: 'schedule'
        });
      }
      ctx.logger.info('Scheduled sync tick finished.', {
        scheduledAt: job.scheduledAt
      });
    });
  },

  async onHealth() {
    return {
      status: 'ok',
      message: 'External Issue Sync plugin ready'
    };
  }
});

export function shouldStartWorkerHost(entrypointUrl: string, argvEntry?: string): boolean {
  const argvEntryPath = normalizeOptionalString(argvEntry);
  if (!argvEntryPath) {
    return true;
  }

  try {
    const workerEntrypointPath = realpathSync(fileURLToPath(entrypointUrl));
    return workerEntrypointPath === realpathSync(argvEntryPath);
  } catch {
    return false;
  }
}

export default plugin;

if (shouldStartWorkerHost(import.meta.url, process.argv[1])) {
  runWorker(plugin, import.meta.url);
}
