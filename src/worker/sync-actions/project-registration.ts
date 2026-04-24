import {
  isGitHubProviderType,
  normalizeProviderConfig as normalizeSharedProviderConfig,
  type ProviderConfig
} from '../../providers/shared/config.ts';
import type { ProviderType } from '../../providers/shared/types.ts';
import { createProviderRegistry } from '../../providers/index.ts';
import { parseRepositoryReference } from '../../providers/github-issues/repository.ts';
import { loadNormalizedState, saveStateWithUpdatedAt } from '../core/state.ts';
import { SETTINGS_SCOPE, DEFAULT_CONNECTION_TEST_KEY, DEFAULT_ISSUE_TYPE, DEFAULT_PROVIDER_ID, DEFAULT_PAPERCLIP_STATUS, DEFAULT_SYNC_FREQUENCY_MINUTES } from '../core/defaults.ts';
import { findActiveProject } from '../core/project-helpers.ts';
import type {
  AgentIssueProviderAccess,
  ConnectionHealthByProvider,
  ConnectionHealthState,
  PaperclipIssueStatus,
  PluginSyncSettings,
  ProjectSyncConfig,
  StatusMappingRule,
  SyncRunState,
  SyncTaskFilters,
  UpstreamProjectMapping,
  UpstreamUserReference
} from '../core/models.ts';
import {
  normalizeBoolean,
  normalizeInputRecord,
  normalizeOptionalString,
  normalizeProjectName,
  normalizeScopeId,
  normalizeStringArray,
  normalizeUpstreamUserReference
} from '../core/utils.ts';
import { createProviderConfigResolver, type ProviderDisplayConfig } from '../providers/config-resolver.ts';

type ProjectRegistrationContext = {
  state: {
    get(scope: { scopeKind: 'instance'; stateKey: string }): Promise<unknown>;
    set(scope: { scopeKind: 'instance'; stateKey: string }, value: unknown): Promise<void>;
  };
  config: { get(): Promise<unknown> };
  secrets: { resolve(ref: string): Promise<string | undefined> };
  projects: {
    list(input: { companyId: string }): Promise<Array<{ id: string; name: string; archivedAt?: unknown; git?: { repository?: string } }>>;
  };
};

const providerRegistry = createProviderRegistry<ProjectRegistrationContext>();
const providerConfigResolver = createProviderConfigResolver<ProjectRegistrationContext>({
  normalizeOptionalString,
  defaultProviderId: DEFAULT_PROVIDER_ID,
  defaultIssueType: DEFAULT_ISSUE_TYPE
});

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

function normalizeCompanyId(value: unknown): string | undefined {
  return normalizeScopeId(value);
}

function normalizeSyncState(value: unknown): SyncRunState {
  if (!value || typeof value !== 'object') {
    return { status: 'idle' };
  }
  const record = value as Record<string, unknown>;
  return {
    status: record.status === 'running' || record.status === 'success' || record.status === 'error' ? record.status : 'idle',
    ...(normalizeOptionalString(record.message) ? { message: normalizeOptionalString(record.message) } : {}),
    ...(normalizeOptionalString(record.checkedAt) ? { checkedAt: normalizeOptionalString(record.checkedAt) } : {})
  };
}

function normalizeConnectionTestState(value: unknown): ConnectionHealthState {
  if (!value || typeof value !== 'object') {
    return { status: 'idle' };
  }
  const record = value as Record<string, unknown>;
  return {
    status: record.status === 'testing' || record.status === 'success' || record.status === 'error' ? record.status : 'idle',
    ...(normalizeOptionalString(record.message) ? { message: normalizeOptionalString(record.message) } : {}),
    ...(normalizeOptionalString(record.checkedAt) ? { checkedAt: normalizeOptionalString(record.checkedAt) } : {}),
    ...(normalizeOptionalString(record.providerKey) ? { providerKey: normalizeOptionalString(record.providerKey) as ProviderType } : {}),
    ...(normalizeOptionalString(record.providerId) ? { providerId: normalizeOptionalString(record.providerId) } : {})
  };
}

function normalizeConnectionTestStateByProvider(value: unknown): ConnectionHealthByProvider {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const record = value as Record<string, unknown>;
  const looksLikeSingleState =
    'status' in record || 'message' in record || 'checkedAt' in record || 'providerKey' in record || 'providerId' in record;
  if (looksLikeSingleState) {
    const normalized = normalizeConnectionTestState(value);
    const key = normalized.providerId ?? DEFAULT_CONNECTION_TEST_KEY;
    return { [key]: normalized };
  }
  return Object.fromEntries(
    Object.entries(record).map(([providerId, state]) => [providerId, normalizeConnectionTestState(state)])
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

function normalizeTaskFilters(value: unknown): SyncTaskFilters {
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

function normalizeStatusMapping(value: unknown): StatusMappingRule | null {
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

function normalizeStatusMappingsSource(value: unknown): 'provider_default' | 'custom' | undefined {
  return value === 'provider_default' || value === 'custom' ? value : undefined;
}

function normalizeStoredProjectKey(value: unknown): string | undefined {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    return undefined;
  }
  return parseRepositoryReference(normalized) ? normalized : normalized.toUpperCase();
}

function normalizeMapping(value: unknown, index: number): UpstreamProjectMapping | null {
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

function normalizeProjectMapping(value: unknown, index: number) {
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

function normalizeProjectConfig(value: unknown, index: number): ProjectSyncConfig | null {
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
  const frequency = normalizeFrequencyMinutes(record.scheduleFrequencyMinutes);
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
            .map((entry) => normalizeStatusMapping(entry))
            .filter((entry): entry is StatusMappingRule => entry !== null)
        }
      : {}),
    ...(normalizeStatusMappingsSource(record.statusMappingsSource)
      ? { statusMappingsSource: normalizeStatusMappingsSource(record.statusMappingsSource) }
      : {}),
    ...(frequency !== null ? { scheduleFrequencyMinutes: frequency } : {}),
    mappings: rawMappings
      .map((entry, mappingIndex) => normalizeProjectMapping(entry, mappingIndex))
      .filter((entry): entry is NonNullable<ReturnType<typeof normalizeProjectMapping>> => entry !== null),
    ...(record.syncState ? { syncState: normalizeSyncState(record.syncState) } : {}),
    ...(record.connectionTest ? { connectionTest: normalizeConnectionTestState(record.connectionTest) } : {}),
    ...(normalizeOptionalString(record.updatedAt) ? { updatedAt: normalizeOptionalString(record.updatedAt) } : {})
  };
}

function normalizeSettings(value: unknown): PluginSyncSettings {
  if (!value || typeof value !== 'object') {
    return { mappings: [], projectConfigs: [] };
  }
  const record = value as Record<string, unknown>;
  const rawMappings = Array.isArray(record.mappings) ? record.mappings : [];
  const rawProjectConfigs = Array.isArray(record.projectConfigs) ? record.projectConfigs : [];
  const toRecord = (candidate: unknown): Record<string, unknown> => (
    candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : {}
  );
  const scheduleByCompanyId = toRecord(record.scheduleFrequencyMinutesByCompanyId);
  const syncStateByCompanyId = toRecord(record.syncStateByCompanyId);
  const filtersByCompanyId = toRecord(record.filtersByCompanyId);
  const connectionTestByCompanyId = toRecord(record.connectionTestByCompanyId);
  return {
    mappings: rawMappings
      .map((entry, index) => normalizeMapping(entry, index))
      .filter((entry): entry is UpstreamProjectMapping => entry !== null),
    projectConfigs: rawProjectConfigs
      .map((entry, index) => normalizeProjectConfig(entry, index))
      .filter((entry): entry is ProjectSyncConfig => entry !== null),
    scheduleFrequencyMinutesByCompanyId: Object.fromEntries(
      Object.entries(scheduleByCompanyId)
        .map(([companyId, frequency]) => [companyId, normalizeFrequencyMinutes(frequency)])
        .filter(([, frequency]) => frequency !== null)
    ) as Record<string, number>,
    syncStateByCompanyId: Object.fromEntries(
      Object.entries(syncStateByCompanyId).map(([companyId, state]) => [companyId, normalizeSyncState(state)])
    ),
    filtersByCompanyId: Object.fromEntries(
      Object.entries(filtersByCompanyId).map(([companyId, filters]) => [companyId, normalizeTaskFilters(filters)])
    ),
    connectionTestByCompanyId: Object.fromEntries(
      Object.entries(connectionTestByCompanyId).map(([companyId, state]) => [companyId, normalizeConnectionTestStateByProvider(state)])
    ),
    ...(normalizeOptionalString(record.updatedAt) ? { updatedAt: normalizeOptionalString(record.updatedAt) } : {})
  };
}

function normalizeFrequencyMinutes(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.max(1, Math.round(value));
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.max(1, Math.round(parsed));
    }
  }
  return null;
}

function cloneStatusMappings(mappings: StatusMappingRule[]): StatusMappingRule[] {
  return mappings.map((entry) => ({ ...entry }));
}

function areStatusMappingsEquivalent(left: StatusMappingRule[], right: StatusMappingRule[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((entry, index) => (
    entry.jiraStatus === right[index]?.jiraStatus
    && (entry.upstreamStatus ?? null) === (right[index]?.upstreamStatus ?? null)
    && entry.paperclipStatus === right[index]?.paperclipStatus
    && (entry.assigneeAgentId ?? null) === (right[index]?.assigneeAgentId ?? null)
  ));
}

function getProjectConfig(
  settings: PluginSyncSettings,
  companyId: string,
  projectId?: string,
  projectName?: string
): ProjectSyncConfig | null {
  return (settings.projectConfigs ?? []).find((projectConfig) => (
    projectConfig.companyId === companyId
    && (
      (projectId && projectConfig.projectId === projectId)
      || (!projectId && projectName && normalizeProjectName(projectConfig.projectName) === normalizeProjectName(projectName))
    )
  )) ?? null;
}

async function saveSettings(
  ctx: ProjectRegistrationContext,
  settings: PluginSyncSettings
): Promise<void> {
  await saveStateWithUpdatedAt(ctx, SETTINGS_SCOPE, settings);
}

async function saveProjectConfig(
  ctx: ProjectRegistrationContext,
  settings: PluginSyncSettings,
  projectConfig: ProjectSyncConfig
): Promise<PluginSyncSettings> {
  const existing = settings.projectConfigs ?? [];
  const nextProjectConfigs = [...existing];
  const existingIndex = nextProjectConfigs.findIndex((entry) => entry.id === projectConfig.id);
  if (existingIndex >= 0) {
    nextProjectConfigs[existingIndex] = projectConfig;
  } else {
    nextProjectConfigs.push(projectConfig);
  }
  const nextSettings: PluginSyncSettings = {
    ...settings,
    projectConfigs: nextProjectConfigs,
    updatedAt: new Date().toISOString()
  };
  await saveSettings(ctx, nextSettings);
  return nextSettings;
}

async function getResolvedProviderConfig(
  ctx: ProjectRegistrationContext,
  providerId?: string
) {
  const providerType = await getProviderTypeById(ctx, providerId);
  return isGitHubProviderType(providerType)
    ? await providerConfigResolver.resolveGitHubProviderConfig(ctx, providerId)
    : await providerConfigResolver.resolveJiraProviderConfig(ctx, providerId);
}

async function getProviderDisplayConfig(
  ctx: ProjectRegistrationContext,
  providerId?: string
): Promise<ProviderDisplayConfig> {
  return await providerConfigResolver.getProviderDisplayConfig(ctx, providerId);
}

async function getProviderTypeById(
  ctx: ProjectRegistrationContext,
  providerId?: string
): Promise<ProviderType> {
  if (!providerId) {
    return 'jira_dc';
  }
  return (await getProviderDisplayConfig(ctx, providerId)).providerType;
}

async function getAvailableProviders(
  ctx: ProjectRegistrationContext
): Promise<ProviderConfig[]> {
  const raw = await ctx.config.get();
  const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const providers = Array.isArray(record.providers) ? record.providers : [];
  const normalized = providers
    .map((entry, index) => normalizeSharedProviderConfig(entry, index) as ProviderConfig | null)
    .filter((entry): entry is ProviderConfig => entry !== null)
    .map((entry) => ({ ...entry }));
  if (normalized.length > 0) {
    return normalized;
  }
  const legacy = normalizeSharedProviderConfig(record, 0);
  return legacy ? [{ ...legacy }] : [];
}

async function resolveProviderCurrentUser(
  ctx: ProjectRegistrationContext,
  providerType: ProviderType,
  providerId: string
): Promise<UpstreamUserReference | undefined> {
  const adapter = providerRegistry.get(providerType);
  const config = await getResolvedProviderConfig(ctx, providerId);
  const provider = adapter.createProvider(ctx, config as never);
  if (!provider.resolveCurrentUser) {
    return undefined;
  }
  const user = await provider.resolveCurrentUser();
  return normalizeUpstreamUserReference(user);
}

async function getDefaultProjectMappings(
  ctx: ProjectRegistrationContext,
  providerId: string | undefined,
  input: { companyId: string; projectId?: string; projectName: string }
) {
  if (!providerId) {
    return [];
  }
  const providerType = await getProviderTypeById(ctx, providerId);
  const adapter = providerRegistry.get(providerType);
  const config = await getResolvedProviderConfig(ctx, providerId);
  const provider = adapter.createProvider(ctx, config as never);
  return provider.getDefaultProjectMappings ? await provider.getDefaultProjectMappings(input) : [];
}

async function getProviderDefaultStatusMappings(
  ctx: ProjectRegistrationContext,
  providerId: string | undefined
): Promise<StatusMappingRule[]> {
  if (!providerId) {
    return [];
  }
  const providerType = await getProviderTypeById(ctx, providerId);
  const adapter = providerRegistry.get(providerType);
  return adapter.getDefaultStatusMappings ? adapter.getDefaultStatusMappings() : [];
}

export async function registerProject(
  ctx: ProjectRegistrationContext,
  rawRecord: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const record = normalizeInputRecord(rawRecord);
  const companyId = normalizeCompanyId(record.companyId);
  if (!companyId) {
    throw new Error('A company id is required to save project mappings.');
  }

  const previous = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const mappings = Array.isArray(record.mappings) ? record.mappings : [];
  const explicitProjectId = normalizeOptionalString(record.projectId);
  const explicitProjectNameFromInput = normalizeOptionalString(record.projectName);
  const explicitProviderFieldPresent = Object.prototype.hasOwnProperty.call(record, 'providerId');
  const explicitProviderId = normalizeOptionalString(record.providerId);
  const explicitAgentIssueProviderAccess = normalizeAgentIssueProviderAccess(record.agentIssueProviderAccess);
  const explicitDefaultAssignee = normalizeUpstreamUserReference(record.defaultAssignee);
  const explicitDefaultStatus = normalizePaperclipStatus(record.defaultStatus) ?? DEFAULT_PAPERCLIP_STATUS;
  const explicitDefaultStatusAssigneeAgentId = Object.prototype.hasOwnProperty.call(record, 'defaultStatusAssigneeAgentId')
    ? (normalizeOptionalString(record.defaultStatusAssigneeAgentId) ?? null)
    : undefined;
  const explicitStatusMappings = Array.isArray(record.statusMappings)
    ? record.statusMappings
        .map((entry) => normalizeStatusMapping(entry))
        .filter((entry): entry is StatusMappingRule => entry !== null)
    : undefined;
  const explicitScheduleFrequencyMinutes = normalizeFrequencyMinutes(record.scheduleFrequencyMinutes);
  const explicitProject = await findActiveProject(ctx, companyId, explicitProjectId, explicitProjectNameFromInput);
  const explicitProjectName = explicitProjectNameFromInput ?? explicitProject?.name;
  const shouldResolveProviderIdentity = Boolean(explicitProjectId || explicitProjectName);
  const fallbackProviderId = (await getAvailableProviders(ctx))[0]?.id ?? DEFAULT_PROVIDER_ID;

  const groupedProjectInputs: Array<{
    projectId?: string;
    projectName?: string;
    providerId?: string;
    providerExplicitlyUnset?: boolean;
    agentIssueProviderAccess?: AgentIssueProviderAccess;
    defaultAssignee?: UpstreamUserReference;
    defaultStatus: PaperclipIssueStatus;
    defaultStatusAssigneeAgentId?: string | null;
    statusMappings?: StatusMappingRule[];
    statusMappingsSource?: 'provider_default' | 'custom';
    mappings: Array<UpstreamProjectMapping | Record<string, unknown>>;
  }> = explicitProjectId || explicitProjectName
    ? [{
        projectId: explicitProjectId,
        projectName: explicitProjectName,
        providerId: explicitProviderId,
        providerExplicitlyUnset: explicitProviderFieldPresent && !explicitProviderId,
        agentIssueProviderAccess: explicitAgentIssueProviderAccess,
        defaultAssignee: explicitDefaultAssignee,
        defaultStatus: explicitDefaultStatus,
        defaultStatusAssigneeAgentId: explicitDefaultStatusAssigneeAgentId,
        statusMappings: explicitStatusMappings,
        statusMappingsSource: explicitStatusMappings ? 'custom' : undefined,
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
          providerId: normalized.providerId ?? fallbackProviderId,
          providerExplicitlyUnset: false,
          agentIssueProviderAccess: {
            enabled: false,
            allowedAgentIds: []
          },
          defaultAssignee: normalized.filters?.assignee,
          defaultStatus: DEFAULT_PAPERCLIP_STATUS,
          defaultStatusAssigneeAgentId: null as string | null,
          statusMappings: [] as StatusMappingRule[],
          statusMappingsSource: 'provider_default' as const,
          mappings: [] as UpstreamProjectMapping[]
        };
        current.mappings.push(normalized);
        accumulator.set(key, current);
        return accumulator;
      }, new Map<string, {
        projectId?: string;
        projectName: string;
        providerId?: string;
        agentIssueProviderAccess: AgentIssueProviderAccess;
        defaultAssignee?: UpstreamUserReference;
        defaultStatus: PaperclipIssueStatus;
        defaultStatusAssigneeAgentId: string | null;
        statusMappings: StatusMappingRule[];
        statusMappingsSource: 'provider_default' | 'custom';
        mappings: UpstreamProjectMapping[];
      }>()).values());

  let nextSettings = previous;
  for (const [index, groupedInput] of groupedProjectInputs.entries()) {
    if (!groupedInput.projectName) {
      continue;
    }
    const existing = getProjectConfig(nextSettings, companyId, groupedInput.projectId, groupedInput.projectName);
    const resolvedProviderId = groupedInput.providerExplicitlyUnset
      ? undefined
      : groupedInput.providerId ?? existing?.providerId ?? fallbackProviderId;
    const resolvedDefaultAssignee = groupedInput.defaultAssignee
      ?? existing?.defaultAssignee
      ?? (shouldResolveProviderIdentity && resolvedProviderId
        ? await resolveProviderCurrentUser(ctx, await getProviderTypeById(ctx, resolvedProviderId), resolvedProviderId)
        : undefined);
    const providerDefaultStatusMappings = await getProviderDefaultStatusMappings(ctx, resolvedProviderId);
    const existingProviderDefaultStatusMappings = existing?.providerId
      ? await getProviderDefaultStatusMappings(ctx, existing.providerId)
      : [];
    const providerChanged = existing?.providerId !== resolvedProviderId;
    const shouldResetExistingStatusMappings =
      Boolean(
        providerChanged
        && existing?.statusMappings?.length
        && (
          existing.statusMappingsSource === 'provider_default'
          || areStatusMappingsEquivalent(existing.statusMappings, existingProviderDefaultStatusMappings)
        )
      );
    const resolvedStatusMappings = groupedInput.statusMappings
      ? cloneStatusMappings(groupedInput.statusMappings)
      : shouldResetExistingStatusMappings
        ? cloneStatusMappings(providerDefaultStatusMappings)
        : existing?.statusMappings?.length
          ? cloneStatusMappings(existing.statusMappings)
          : cloneStatusMappings(providerDefaultStatusMappings);
    const resolvedStatusMappingsSource: 'provider_default' | 'custom' =
      groupedInput.statusMappings
        ? 'custom'
        : shouldResetExistingStatusMappings
          ? 'provider_default'
          : existing?.statusMappings?.length
            ? (existing.statusMappingsSource ?? 'custom')
            : 'provider_default';
    const projectConfig: ProjectSyncConfig = {
      id: existing?.id ?? `project-config-${Date.now()}-${index + 1}`,
      companyId,
      projectName: groupedInput.projectName,
      ...(groupedInput.projectId ? { projectId: groupedInput.projectId } : {}),
      providerId: resolvedProviderId,
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
      statusMappings: resolvedStatusMappings,
      statusMappingsSource: resolvedStatusMappingsSource,
      scheduleFrequencyMinutes:
        explicitScheduleFrequencyMinutes
        ?? existing?.scheduleFrequencyMinutes
        ?? DEFAULT_SYNC_FREQUENCY_MINUTES,
      mappings: groupedInput.mappings.map((entry, mappingIndex) => ({
        id: normalizeOptionalString((entry as Record<string, unknown>).id) ?? `mapping-${mappingIndex + 1}`,
        ...(typeof (entry as Record<string, unknown>).enabled === 'boolean'
          ? { enabled: (entry as Record<string, unknown>).enabled === true }
          : {}),
        jiraProjectKey: normalizeStoredProjectKey((entry as Record<string, unknown>).jiraProjectKey) ?? '',
        ...(normalizeOptionalString((entry as Record<string, unknown>).jiraJql)
          ? { jiraJql: normalizeOptionalString((entry as Record<string, unknown>).jiraJql) }
          : {}),
        ...(entry && typeof entry === 'object' && (entry as Record<string, unknown>).filters
          ? { filters: normalizeTaskFilters((entry as Record<string, unknown>).filters) }
          : {})
      })).filter((entry) => Boolean(entry.jiraProjectKey)),
      syncState: existing?.syncState,
      connectionTest: existing?.connectionTest
    };
    if (projectConfig.mappings.length === 0) {
      projectConfig.mappings = await getDefaultProjectMappings(ctx, resolvedProviderId, {
        companyId,
        projectId: groupedInput.projectId,
        projectName: groupedInput.projectName
      });
    }
    nextSettings = await saveProjectConfig(ctx, nextSettings, projectConfig);
  }

  const selectedProjectId = explicitProjectId ?? groupedProjectInputs[0]?.projectId;
  return {
    ok: true,
    companyId,
    projectId: selectedProjectId ?? null
  };
}
