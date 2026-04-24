import type { Issue } from '@paperclipai/plugin-sdk';
import { parseRepositoryReference } from '../../providers/github-issues/repository.ts';
import { isGitHubProviderType } from '../../providers/shared/config.ts';
import type { ProviderType } from '../../providers/shared/types.ts';
import { normalizeJiraStatusName } from '../../providers/jira/normalize.ts';
import {
  DEFAULT_CONNECTION_TEST_KEY,
  DEFAULT_PAPERCLIP_STATUS,
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  SETTINGS_SCOPE
} from './defaults.ts';
import type {
  AgentIssueProviderAccess,
  ConnectionHealthByProvider as ConnectionTestStateByProvider,
  ConnectionHealthState as ConnectionTestState,
  PaperclipIssueStatus,
  PluginSyncSettings as SyncSettings,
  ProjectSyncConfig as ProjectConfig,
  ProjectSyncMapping as ProjectMapping,
  StatusMappingRule as StatusMapping,
  SyncRunState,
  SyncTaskFilters,
  UpstreamProjectMapping as UpstreamMapping
} from './models.ts';
import {
  normalizeBoolean,
  normalizeOptionalString,
  normalizeProjectName,
  normalizeScopeId,
  normalizeStringArray,
  normalizeUpstreamUserReference
} from './utils.ts';
import { saveStateWithUpdatedAt } from './state.ts';

type SettingsContext = {
  state: {
    get(scope: { scopeKind: 'instance'; stateKey: string }): Promise<unknown>;
    set(scope: { scopeKind: 'instance'; stateKey: string }, value: unknown): Promise<void>;
  };
};

export function normalizeAgentIssueProviderAccess(value: unknown): AgentIssueProviderAccess | undefined {
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

export function normalizeCompanyId(value: unknown): string | undefined {
  return normalizeScopeId(value);
}

export function normalizeSyncState(value: unknown): SyncRunState {
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

export function normalizeConnectionTestState(value: unknown): ConnectionTestState {
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

export function normalizeConnectionTestStateByProvider(value: unknown): ConnectionTestStateByProvider {
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

export function normalizeTaskFilters(value: unknown): SyncTaskFilters {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const record = value as Record<string, unknown>;
  const author = normalizeUpstreamUserReference(record.author);
  const assignee = normalizeUpstreamUserReference(record.assignee);
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

export function normalizePaperclipStatus(value: unknown): PaperclipIssueStatus | undefined {
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

export function normalizeJiraStatusMapping(value: unknown): StatusMapping | null {
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

export function normalizeStoredProjectKey(value: unknown): string | undefined {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    return undefined;
  }

  return parseRepositoryReference(normalized) ? normalized : normalized.toUpperCase();
}

export function normalizeMapping(value: unknown, index: number): UpstreamMapping | null {
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

export function normalizeProjectMapping(value: unknown, index: number): ProjectMapping | null {
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

export function normalizeProjectConfig(value: unknown, index: number): ProjectConfig | null {
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
    ...(normalizeUpstreamUserReference(record.defaultAssignee) ? { defaultAssignee: normalizeUpstreamUserReference(record.defaultAssignee) } : {}),
    ...(normalizePaperclipStatus(record.defaultStatus) ? { defaultStatus: normalizePaperclipStatus(record.defaultStatus) } : {}),
    ...(Object.prototype.hasOwnProperty.call(record, 'defaultStatusAssigneeAgentId')
      ? { defaultStatusAssigneeAgentId: normalizeOptionalString(record.defaultStatusAssigneeAgentId) ?? null }
      : {}),
    ...(Array.isArray(record.statusMappings)
      ? {
          statusMappings: record.statusMappings
            .map((entry) => normalizeJiraStatusMapping(entry))
            .filter((entry): entry is StatusMapping => entry !== null)
        }
      : {}),
    ...(record.statusMappingsSource === 'provider_default' || record.statusMappingsSource === 'custom'
      ? { statusMappingsSource: record.statusMappingsSource }
      : {}),
    ...(normalizeFrequencyMinutes(record.scheduleFrequencyMinutes) !== null
      ? { scheduleFrequencyMinutes: normalizeFrequencyMinutes(record.scheduleFrequencyMinutes) ?? undefined }
      : {}),
    mappings: rawMappings
      .map((entry, mappingIndex) => normalizeProjectMapping(entry, mappingIndex))
      .filter((entry): entry is ProjectMapping => entry !== null),
    ...(record.syncState ? { syncState: normalizeSyncState(record.syncState) } : {}),
    ...(record.connectionTest ? { connectionTest: normalizeConnectionTestState(record.connectionTest) } : {}),
    ...(normalizeOptionalString(record.updatedAt) ? { updatedAt: normalizeOptionalString(record.updatedAt) } : {})
  };
}

export function normalizeSettings(value: unknown): SyncSettings {
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
    .filter((entry): entry is UpstreamMapping => entry !== null);
  const projectConfigs = rawProjectConfigs
    .map((entry, index) => normalizeProjectConfig(entry, index))
    .filter((entry): entry is ProjectConfig => entry !== null);

  return {
    mappings,
    projectConfigs,
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

export function normalizeFrequencyMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  const normalized = Math.max(1, Math.min(24 * 60, Math.round(value)));
  return normalized;
}

export function getMappingsForScope(settings: SyncSettings, scopeId?: string): UpstreamMapping[] {
  const projectScopedMappings = (settings.projectConfigs ?? [])
    .filter((projectConfig) => (!scopeId || projectConfig.companyId === scopeId) && Boolean(projectConfig.providerId))
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

  if (!scopeId) {
    return settings.mappings;
  }

  return settings.mappings.filter((mapping) => mapping.companyId === scopeId);
}

export function getProjectConfigsForCompany(settings: SyncSettings, companyId?: string): ProjectConfig[] {
  if (!companyId) {
    return settings.projectConfigs ?? [];
  }

  return (settings.projectConfigs ?? []).filter((projectConfig) => projectConfig.companyId === companyId);
}

export function getProjectConfig(
  settings: SyncSettings,
  companyId: string,
  projectId?: string,
  projectName?: string
): ProjectConfig | null {
  return getProjectConfigsForCompany(settings, companyId).find((projectConfig) => (
    (projectId && projectConfig.projectId === projectId)
    || (!projectId && projectName && normalizeProjectName(projectConfig.projectName) === normalizeProjectName(projectName))
  )) ?? null;
}

export function inferDefaultUpstreamKeyFromMappings(
  settings: SyncSettings,
  companyId: string | undefined,
  providerId: string | undefined,
  providerType: ProviderType
): string | null {
  if (!providerId) {
    return null;
  }

  const mappings = getMappingsForScope(settings, companyId)
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

export function resolveMappedPaperclipState(
  projectConfig: ProjectConfig | null,
  jiraStatusName: string,
  effectiveStatusMappings: StatusMapping[] = projectConfig?.statusMappings ?? []
): Partial<Pick<Issue, 'status' | 'assigneeAgentId'>> {
  if (!projectConfig) {
    return {};
  }

  const normalizedStatusNames = getNormalizedStatusAliases(jiraStatusName);
  const matchedMapping = effectiveStatusMappings.find((entry) => (
    normalizedStatusNames.includes(normalizeJiraStatusName(entry.jiraStatus))
  ));

  return {
    status: matchedMapping?.paperclipStatus ?? projectConfig.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
    assigneeAgentId: matchedMapping
      ? (matchedMapping.assigneeAgentId ?? null)
      : (projectConfig.defaultStatusAssigneeAgentId ?? null)
  };
}

function getNormalizedStatusAliases(statusName: string): string[] {
  const normalizedStatusName = normalizeJiraStatusName(statusName);
  const aliases = new Set<string>([normalizedStatusName]);
  if (['completed', 'not planned', 'duplicate'].includes(normalizedStatusName)) {
    aliases.add('closed');
  }
  return [...aliases];
}

export function getSyncStateForCompany(settings: SyncSettings, companyId?: string): SyncRunState {
  if (!companyId) {
    return { status: 'idle' };
  }

  return settings.syncStateByCompanyId?.[companyId] ?? { status: 'idle' };
}

export function getScheduleFrequencyMinutes(settings: SyncSettings, companyId?: string): number {
  if (!companyId) {
    return DEFAULT_SYNC_FREQUENCY_MINUTES;
  }

  return settings.scheduleFrequencyMinutesByCompanyId?.[companyId] ?? DEFAULT_SYNC_FREQUENCY_MINUTES;
}

export function getProjectSyncState(
  settings: SyncSettings,
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

export function getProjectConnectionTestState(
  settings: SyncSettings,
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

export function getProjectScheduleFrequencyMinutes(
  settings: SyncSettings,
  companyId?: string,
  projectId?: string
): number {
  if (!companyId || !projectId) {
    return getScheduleFrequencyMinutes(settings, companyId);
  }

  return getProjectConfigsForCompany(settings, companyId).find((projectConfig) => projectConfig.projectId === projectId)?.scheduleFrequencyMinutes
    ?? getScheduleFrequencyMinutes(settings, companyId);
}

export function getFiltersForCompany(settings: SyncSettings, companyId?: string): SyncTaskFilters {
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

export function getConnectionTestStateForCompany(
  settings: SyncSettings,
  companyId?: string,
  providerId?: string
): ConnectionTestState {
  if (!companyId) {
    return { status: 'idle' };
  }

  return getConnectionTestStateFromCollection(settings.connectionTestByCompanyId?.[companyId], providerId);
}

export async function saveSettings(ctx: SettingsContext, settings: SyncSettings): Promise<void> {
  await saveStateWithUpdatedAt(ctx, SETTINGS_SCOPE, settings);
}

export async function saveProjectConfig(
  ctx: SettingsContext,
  settings: SyncSettings,
  projectConfig: ProjectConfig
): Promise<SyncSettings> {
  const next: SyncSettings = {
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

export async function saveSyncState(
  ctx: SettingsContext,
  settings: SyncSettings,
  companyId: string | undefined,
  syncState: SyncRunState,
  projectId?: string
): Promise<SyncSettings> {
  if (!companyId) {
    return settings;
  }

  const nextProjectConfigs = (settings.projectConfigs ?? []).map((projectConfig) => (
    projectId && projectConfig.companyId === companyId && projectConfig.projectId === projectId
      ? { ...projectConfig, syncState, updatedAt: new Date().toISOString() }
      : projectConfig
  ));
  const next: SyncSettings = {
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

export async function saveConnectionTestState(
  ctx: SettingsContext,
  settings: SyncSettings,
  companyId: string | undefined,
  connectionTest: ConnectionTestState,
  projectId?: string
): Promise<SyncSettings> {
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
  const next: SyncSettings = {
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
