import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { definePlugin, runWorker, type Issue, type IssueComment, type PluginLauncherRegistration } from '@paperclipai/plugin-sdk';

const SETTINGS_SCOPE = {
  scopeKind: 'instance' as const,
  stateKey: 'paperclip-jira-plugin-settings'
};

const ISSUE_LINK_ENTITY_TYPE = 'paperclip-jira-plugin.issue-link';
const HIDDEN_ISSUE_MARKER_PREFIX = '<!-- paperclip-jira-plugin-upstream: ';
const HIDDEN_ISSUE_MARKER_SUFFIX = ' -->';
const DEFAULT_SYNC_FREQUENCY_MINUTES = 15;
const DEFAULT_ISSUE_TYPE = 'Task';
const COMMENT_LINKS_STATE_KEY = 'paperclip-jira-plugin-comment-links';
const DEFAULT_PROVIDER_ID = 'provider-default-jira';

type PluginSetupContext = Parameters<Parameters<typeof definePlugin>[0]['setup']>[0];
type PaperclipIssueStatus = Issue['status'];

interface JiraMapping {
  id: string;
  companyId?: string;
  providerId?: string;
  jiraProjectKey: string;
  jiraJql?: string;
  paperclipProjectId?: string;
  paperclipProjectName: string;
  filters?: JiraTaskFilters;
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
  providerKey?: 'jira';
}

interface JiraTaskFilters {
  onlyActive?: boolean;
  author?: string;
  assignee?: string;
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
}

interface JiraSyncSettings {
  mappings: JiraMapping[];
  syncStateByCompanyId?: Record<string, SyncRunState>;
  scheduleFrequencyMinutesByCompanyId?: Record<string, number>;
  filtersByCompanyId?: Record<string, JiraTaskFilters>;
  connectionTestByCompanyId?: Record<string, ConnectionTestState>;
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

interface JiraProviderDisplayConfig {
  providerId: string;
  providerName: string;
  baseUrl?: string;
  userEmail?: string;
  defaultIssueType: string;
  tokenSaved: boolean;
}

interface JiraProviderConfigRecord {
  id?: string;
  type?: string;
  name?: string;
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
}

interface JiraProviderConfig {
  id: string;
  type: 'jira';
  name: string;
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
}

interface JiraIssueRecord {
  id: string;
  key: string;
  summary: string;
  description: string;
  assigneeDisplayName?: string;
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

const GLOBAL_SYNC_LAUNCHER: PluginLauncherRegistration = {
  id: 'paperclip-jira-plugin-global-runtime-launcher',
  displayName: 'Sync Issues',
  description: 'Open the issue sync dialog.',
  placementZone: 'globalToolbarButton',
  action: {
    type: 'openModal',
    target: 'JiraSyncLauncherModal'
  },
  render: {
    environment: 'hostOverlay',
    bounds: 'wide'
  }
};

const ENTITY_SYNC_LAUNCHER: PluginLauncherRegistration = {
  id: 'paperclip-jira-plugin-entity-runtime-launcher',
  displayName: 'Sync Issues',
  description: 'Open the issue sync dialog for the current entity.',
  placementZone: 'toolbarButton',
  entityTypes: ['project', 'issue'],
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

function normalizeCompanyId(value: unknown): string | undefined {
  return normalizeOptionalString(value);
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
    ...(record.providerKey === 'jira' ? { providerKey: 'jira' as const } : {})
  };
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
  return {
    ...(typeof record.onlyActive === 'boolean' ? { onlyActive: record.onlyActive } : {}),
    ...(normalizeOptionalString(record.author) ? { author: normalizeOptionalString(record.author) } : {}),
    ...(normalizeOptionalString(record.assignee) ? { assignee: normalizeOptionalString(record.assignee) } : {}),
    ...(normalizeFilterNumber(record.issueNumberGreaterThan) !== undefined
      ? { issueNumberGreaterThan: normalizeFilterNumber(record.issueNumberGreaterThan) }
      : {}),
    ...(normalizeFilterNumber(record.issueNumberLessThan) !== undefined
      ? { issueNumberLessThan: normalizeFilterNumber(record.issueNumberLessThan) }
      : {})
  };
}

function normalizeProviderConfig(value: unknown, index: number): JiraProviderConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const type = normalizeOptionalString(record.type);
  const name = normalizeOptionalString(record.name);
  const id = normalizeOptionalString(record.id);
  if ((type && type !== 'jira') || !name) {
    return null;
  }

  return {
    id: id ?? `provider-${index + 1}`,
    type: 'jira',
    name,
    ...(normalizeOptionalString(record.jiraBaseUrl) ? { jiraBaseUrl: normalizeOptionalString(record.jiraBaseUrl) } : {}),
    ...(normalizeOptionalString(record.jiraUserEmail) ? { jiraUserEmail: normalizeOptionalString(record.jiraUserEmail) } : {}),
    ...(normalizeOptionalString(record.jiraToken) ? { jiraToken: normalizeOptionalString(record.jiraToken) } : {}),
    ...(normalizeOptionalString(record.jiraTokenRef) ? { jiraTokenRef: normalizeOptionalString(record.jiraTokenRef) } : {}),
    ...(normalizeOptionalString(record.defaultIssueType) ? { defaultIssueType: normalizeOptionalString(record.defaultIssueType) } : {})
  };
}

function normalizeMapping(value: unknown, index: number): JiraMapping | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const jiraProjectKey = normalizeOptionalString(record.jiraProjectKey)?.toUpperCase();
  const paperclipProjectName = normalizeOptionalString(record.paperclipProjectName);

  if (!jiraProjectKey || !paperclipProjectName) {
    return null;
  }

  return {
    id: normalizeOptionalString(record.id) ?? `mapping-${index + 1}`,
    jiraProjectKey,
    paperclipProjectName,
    ...(normalizeOptionalString(record.providerId) ? { providerId: normalizeOptionalString(record.providerId) } : {}),
    ...(normalizeOptionalString(record.jiraJql) ? { jiraJql: normalizeOptionalString(record.jiraJql) } : {}),
    ...(normalizeOptionalString(record.paperclipProjectId) ? { paperclipProjectId: normalizeOptionalString(record.paperclipProjectId) } : {}),
    ...(record.filters ? { filters: normalizeTaskFilters(record.filters) } : {}),
    ...(normalizeCompanyId(record.companyId) ? { companyId: normalizeCompanyId(record.companyId) } : {})
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

function getProvidersFromConfig(value: unknown): JiraProviderConfig[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const record = value as Record<string, unknown>;
  const rawProviders = Array.isArray(record.providers) ? record.providers : [];
  const providers = rawProviders
    .map((entry, index) => normalizeProviderConfig(entry, index))
    .filter((entry): entry is JiraProviderConfig => entry !== null);
  if (providers.length > 0) {
    return providers;
  }

  if (!hasLegacyProviderConfig(record)) {
    return [];
  }

  return [{
    id: DEFAULT_PROVIDER_ID,
    type: 'jira',
    name: 'Default Jira',
    ...(normalizeOptionalString(record.jiraBaseUrl) ? { jiraBaseUrl: normalizeOptionalString(record.jiraBaseUrl) } : {}),
    ...(normalizeOptionalString(record.jiraUserEmail) ? { jiraUserEmail: normalizeOptionalString(record.jiraUserEmail) } : {}),
    ...(normalizeOptionalString(record.jiraToken) ? { jiraToken: normalizeOptionalString(record.jiraToken) } : {}),
    ...(normalizeOptionalString(record.jiraTokenRef) ? { jiraTokenRef: normalizeOptionalString(record.jiraTokenRef) } : {}),
    ...(normalizeOptionalString(record.defaultIssueType) ? { defaultIssueType: normalizeOptionalString(record.defaultIssueType) } : {})
  }];
}

function normalizeSettings(value: unknown): JiraSyncSettings {
  if (!value || typeof value !== 'object') {
    return {
      mappings: []
    };
  }

  const record = value as Record<string, unknown>;
  const rawMappings = Array.isArray(record.mappings) ? record.mappings : [];
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

  return {
    mappings: rawMappings
      .map((entry, index) => normalizeMapping(entry, index))
      .filter((entry): entry is JiraMapping => entry !== null),
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
    connectionTestByCompanyId: Object.fromEntries(
      Object.entries(connectionTestByCompanyId).map(([companyId, state]) => [companyId, normalizeConnectionTestState(state)])
    ),
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
  if (!companyId) {
    return settings.mappings;
  }

  return settings.mappings.filter((mapping) => mapping.companyId === companyId);
}

async function getAvailableProviders(ctx: PluginSetupContext): Promise<JiraProviderConfig[]> {
  return getProvidersFromConfig(await ctx.config.get());
}

async function getMappingProviderId(
  ctx: PluginSetupContext,
  mapping: JiraMapping
): Promise<string | undefined> {
  if (mapping.providerId) {
    return mapping.providerId;
  }

  const providers = await getAvailableProviders(ctx);
  return providers[0]?.id;
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
  const project = projects.find((entry) => entry.id === projectId);
  return project ? { id: project.id, name: project.name } : null;
}

async function resolvePaperclipProjectForMapping(
  ctx: PluginSetupContext,
  companyId: string,
  mapping: JiraMapping
): Promise<{ id: string; name: string } | null> {
  const projects = await ctx.projects.list({ companyId });

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

function getFiltersForCompany(settings: JiraSyncSettings, companyId?: string): JiraTaskFilters {
  if (!companyId) {
    return {};
  }

  return normalizeTaskFilters(settings.filtersByCompanyId?.[companyId]);
}

function getConnectionTestStateForCompany(settings: JiraSyncSettings, companyId?: string): ConnectionTestState {
  if (!companyId) {
    return { status: 'idle' };
  }

  return settings.connectionTestByCompanyId?.[companyId] ?? { status: 'idle' };
}

async function saveSettings(ctx: PluginSetupContext, settings: JiraSyncSettings): Promise<void> {
  await ctx.state.set(SETTINGS_SCOPE, {
    ...settings,
    updatedAt: new Date().toISOString()
  });
}

async function saveSyncState(
  ctx: PluginSetupContext,
  settings: JiraSyncSettings,
  companyId: string | undefined,
  syncState: SyncRunState
): Promise<JiraSyncSettings> {
  if (!companyId) {
    return settings;
  }

  const next: JiraSyncSettings = {
    ...settings,
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
  connectionTest: ConnectionTestState
): Promise<JiraSyncSettings> {
  if (!companyId) {
    return settings;
  }

  const next: JiraSyncSettings = {
    ...settings,
    connectionTestByCompanyId: {
      ...(settings.connectionTestByCompanyId ?? {}),
      [companyId]: connectionTest
    },
    updatedAt: new Date().toISOString()
  };
  await saveSettings(ctx, next);
  return next;
}

async function getResolvedConfig(
  ctx: PluginSetupContext,
  providerId?: string,
  overrides?: JiraProviderConfigRecord
): Promise<JiraConfig> {
  const rawConfig = await ctx.config.get();
  const providers = getProvidersFromConfig(rawConfig);
  const matchedProvider =
    (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
    ?? providers[0]
    ?? {
      id: providerId ?? DEFAULT_PROVIDER_ID,
      type: 'jira' as const,
      name: 'Default Jira'
    };
  const config = {
    ...matchedProvider,
    ...(overrides ?? {})
  };
  const baseUrl = normalizeOptionalString(config.jiraBaseUrl)?.replace(/\/+$/, '');
  const userEmail = normalizeOptionalString(config.jiraUserEmail);
  const tokenRef = normalizeOptionalString(config.jiraTokenRef);
  const inlineToken = normalizeOptionalString(config.jiraToken);
  const token = inlineToken ?? (tokenRef ? await ctx.secrets.resolve(tokenRef) : undefined);

  return {
    providerId: normalizeOptionalString(config.id) ?? matchedProvider.id,
    providerName: normalizeOptionalString(config.name) ?? matchedProvider.name,
    ...(baseUrl ? { baseUrl } : {}),
    ...(userEmail ? { userEmail } : {}),
    ...(token ? { token } : {}),
    defaultIssueType: normalizeOptionalString(config.defaultIssueType) ?? DEFAULT_ISSUE_TYPE
  };
}

async function getProviderDisplayConfig(
  ctx: PluginSetupContext,
  providerId?: string,
  overrides?: JiraProviderConfigRecord
): Promise<JiraProviderDisplayConfig> {
  const rawConfig = await ctx.config.get();
  const providers = getProvidersFromConfig(rawConfig);
  const matchedProvider =
    (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
    ?? providers[0]
    ?? {
      id: providerId ?? DEFAULT_PROVIDER_ID,
      type: 'jira' as const,
      name: 'Default Jira'
    };
  const config = {
    ...matchedProvider,
    ...(overrides ?? {})
  };
  const baseUrl = normalizeOptionalString(config.jiraBaseUrl)?.replace(/\/+$/, '');
  const userEmail = normalizeOptionalString(config.jiraUserEmail);
  const inlineToken = normalizeOptionalString(config.jiraToken);
  const tokenRef = normalizeOptionalString(config.jiraTokenRef);

  return {
    providerId: normalizeOptionalString(config.id) ?? matchedProvider.id,
    providerName: normalizeOptionalString(config.name) ?? matchedProvider.name,
    ...(baseUrl ? { baseUrl } : {}),
    ...(userEmail ? { userEmail } : {}),
    defaultIssueType: normalizeOptionalString(config.defaultIssueType) ?? DEFAULT_ISSUE_TYPE,
    tokenSaved: Boolean(inlineToken || tokenRef)
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

function buildDisplayConfigSummary(config: JiraProviderDisplayConfig): { ready: boolean; message: string } {
  if (config.baseUrl && config.tokenSaved) {
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

function encodeBasicAuth(userEmail: string, token: string): string {
  return Buffer.from(`${userEmail}:${token}`, 'utf8').toString('base64');
}

async function jiraRequest<T>(
  ctx: PluginSetupContext,
  config: JiraConfig,
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!config.baseUrl || !config.token) {
    throw new Error('Jira is not configured. Set jiraBaseUrl and jiraTokenRef.');
  }

  const headers = new Headers(init?.headers);
  headers.set('accept', 'application/json');
  headers.set(
    'authorization',
    config.userEmail
      ? `Basic ${encodeBasicAuth(config.userEmail, config.token)}`
      : `Bearer ${config.token}`
  );
  if (init?.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await ctx.http.fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers
  });
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Jira request failed (${response.status}). ${responseText || response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return await response.json() as T;
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
    clauses.push(`reporter = "${escapeJqlValue(filters.author)}"`);
  }
  if (filters?.assignee) {
    clauses.push(`assignee = "${escapeJqlValue(filters.assignee)}"`);
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
  return title.replace(/^\[[A-Z][A-Z0-9]+-\d+\]\s*/i, '').trim();
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
  const commentsValue = fields.comment && typeof fields.comment === 'object'
    ? fields.comment as Record<string, unknown>
    : {};
  const comments = Array.isArray(commentsValue.comments)
    ? commentsValue.comments
        .map((entry) => normalizeJiraComment(entry))
        .filter((entry): entry is JiraCommentRecord => entry !== null)
    : [];
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
    ...(normalizeOptionalString(assignee.displayName) ? { assigneeDisplayName: normalizeOptionalString(assignee.displayName) } : {}),
    statusName: normalizeOptionalString(status.name) ?? 'Unknown',
    statusCategory: normalizeOptionalString(statusCategory.name) ?? 'Unknown',
    updatedAt: normalizeOptionalString(fields.updated) ?? new Date().toISOString(),
    createdAt: normalizeOptionalString(fields.created) ?? new Date().toISOString(),
    issueType: normalizeOptionalString(issueType.name) ?? DEFAULT_ISSUE_TYPE,
    url: buildJiraIssueUrl(config, key),
    comments
  };
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
    authorDisplayName: normalizeOptionalString(author.displayName) ?? 'Jira user',
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
    const response = await jiraRequest<Record<string, unknown>>(
      ctx,
      config,
      `/rest/api/2/issue/${encodeURIComponent(options.issueKey)}?fields=summary,description,status,comment,updated,created,issuetype,assignee`
    );
    const issue = normalizeJiraIssue(response, config);
    return issue ? [issue] : [];
  }

  const response = await jiraRequest<Record<string, unknown>>(
    ctx,
    config,
    '/rest/api/2/search',
    {
      method: 'POST',
      body: JSON.stringify({
        jql: buildJiraSearchJql(mapping, options?.filters),
        maxResults: 50,
        fields: ['summary', 'description', 'status', 'comment', 'updated', 'created', 'issuetype', 'assignee']
      })
    }
  );
  const issues = Array.isArray(response.issues) ? response.issues : [];
  return issues
    .map((entry) => normalizeJiraIssue(entry, config))
    .filter((entry): entry is JiraIssueRecord => entry !== null);
}

async function createJiraIssue(
  ctx: PluginSetupContext,
  config: JiraConfig,
  mapping: JiraMapping,
  issue: Issue
): Promise<JiraIssueRecord> {
  const createResponse = await jiraRequest<Record<string, unknown>>(
    ctx,
    config,
    '/rest/api/2/issue',
    {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          project: { key: mapping.jiraProjectKey },
          summary: stripIssueTitlePrefix(issue.title),
          description: plainTextToAdf(stripIssueMarker(issue.description ?? '')),
          issuetype: { name: config.defaultIssueType }
        }
      })
    }
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
  await jiraRequest(
    ctx,
    config,
    `/rest/api/2/issue/${encodeURIComponent(jiraIssueKey)}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        fields: {
          summary: stripIssueTitlePrefix(issue.title),
          description: plainTextToAdf(stripIssueMarker(issue.description ?? ''))
        }
      })
    }
  );
}

async function listJiraTransitions(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string
): Promise<Array<{ id: string; name: string }>> {
  const response = await jiraRequest<Record<string, unknown>>(
    ctx,
    config,
    `/rest/api/2/issue/${encodeURIComponent(jiraIssueKey)}/transitions`
  );
  const transitions = Array.isArray(response.transitions) ? response.transitions : [];
  return transitions
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const record = entry as Record<string, unknown>;
      const id = normalizeOptionalString(record.id);
      const name = normalizeOptionalString(record.name);
      return id && name ? { id, name } : null;
    })
    .filter((entry): entry is { id: string; name: string } => entry !== null);
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

  await jiraRequest(
    ctx,
    config,
    `/rest/api/2/issue/${encodeURIComponent(jiraIssueKey)}/transitions`,
    {
      method: 'POST',
      body: JSON.stringify({
        transition: {
          id: transition.id
        }
      })
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
  await jiraRequest(
    ctx,
    config,
    `/rest/api/2/issue/${encodeURIComponent(jiraIssueKey)}/transitions`,
    {
      method: 'POST',
      body: JSON.stringify({
        transition: {
          id: transitionId
        }
      })
    }
  );
}

async function addJiraComment(
  ctx: PluginSetupContext,
  config: JiraConfig,
  jiraIssueKey: string,
  body: string
): Promise<{ id: string }> {
  const response = await jiraRequest<Record<string, unknown>>(
    ctx,
    config,
    `/rest/api/2/issue/${encodeURIComponent(jiraIssueKey)}/comment`,
    {
      method: 'POST',
      body: JSON.stringify({
        body: plainTextToAdf(body)
      })
    }
  );
  const id = normalizeOptionalString(response.id);
  if (!id) {
    throw new Error('Jira did not return the created comment id.');
  }

  return { id };
}

async function testJiraConnection(
  ctx: PluginSetupContext,
  config: JiraConfig
): Promise<{ status: 'success' | 'error'; message: string }> {
  try {
    await jiraRequest(ctx, config, '/rest/api/2/myself');
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

async function findLinkedIssueEntity(
  ctx: PluginSetupContext,
  issueId: string
): Promise<JiraIssueLinkData | null> {
  const records = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    scopeKind: 'issue',
    scopeId: issueId,
    limit: 1
  });
  if (records.length === 0) {
    return null;
  }

  return records[0]?.data as unknown as JiraIssueLinkData;
}

async function findLinkedIssueEntityByKey(
  ctx: PluginSetupContext,
  jiraIssueKey: string
): Promise<JiraIssueLinkData | null> {
  const records = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    externalId: jiraIssueKey,
    limit: 1
  });
  if (records.length === 0) {
    return null;
  }

  return records[0]?.data as unknown as JiraIssueLinkData;
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
    externalId: data.jiraIssueKey,
    title: data.jiraIssueKey,
    status: data.jiraStatusName,
    data: data as unknown as Record<string, unknown>
  });
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

  const issueProject = await findProjectById(ctx, companyId, issue.projectId);
  return getMappingsForCompany(settings, companyId).find((mapping) => mappingMatchesProject(mapping, issueProject)) ?? null;
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
  const existingLink = await findLinkedIssueEntityByKey(ctx, jiraIssue.key);
  const now = new Date().toISOString();
  const providerId = await getMappingProviderId(ctx, mapping);
  const importedTitle = ensureIssueTitlePrefix(jiraIssue.summary, jiraIssue.key);
  const importedDescription = buildImportedIssueDescription(jiraIssue);
  if (!existingLink) {
    const resolvedProject = await resolvePaperclipProjectForMapping(ctx, companyId, mapping);
    if (!resolvedProject) {
      return 'skipped';
    }

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
        description: importedDescription
      },
      companyId
    );
    await upsertIssueLinkEntity(ctx, createdIssue.id, {
      issueId: createdIssue.id,
      companyId,
      projectId: resolvedProject.id,
      ...(providerId ? { providerId } : {}),
      jiraIssueId: jiraIssue.id,
      jiraIssueKey: jiraIssue.key,
      jiraProjectKey: mapping.jiraProjectKey,
      jiraUrl: jiraIssue.url,
      ...(jiraIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: jiraIssue.assigneeDisplayName } : {}),
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
  }

  const existingIssue = await ctx.issues.get(existingLink.issueId, companyId);
  if (!existingIssue) {
    return 'skipped';
  }

  await ctx.issues.update(
    existingIssue.id,
    {
      title: importedTitle,
      description: importedDescription,
      hiddenAt: null
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
  const scopedProject = options?.projectId ? await findProjectById(ctx, companyId, options.projectId) : null;
  const mappings = options?.projectId
    ? allMappings.filter((mapping) => mappingMatchesProject(mapping, scopedProject))
    : allMappings;
  if (mappings.length === 0) {
    return await saveSyncState(ctx, settings, companyId, {
      status: 'error',
      message: 'Save at least one Jira-to-Paperclip project mapping before running sync.',
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    }).then((next) => getSyncStateForCompany(next, companyId));
  }

  await saveSyncState(ctx, settings, companyId, {
    status: 'running',
    message: 'Jira sync is running.',
    checkedAt: new Date().toISOString(),
    processedCount: 0,
    lastRunTrigger: options?.trigger ?? 'manual'
  });

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  try {
    const issueBatches: Array<{ mapping: JiraMapping; issues: JiraIssueRecord[] }> = [];
    for (const mapping of mappings) {
      const config = await getConfigForMapping(ctx, mapping);
      const configSummary = buildConfigSummary(config);
      if (!configSummary.ready) {
        throw new Error(`Provider for Jira project ${mapping.jiraProjectKey} is not ready. ${configSummary.message}`);
      }

      const mappingFilters = options?.filters ?? mapping.filters ?? getFiltersForCompany(settings, companyId);
      const issues = options?.issueLinkKey
        ? await searchJiraIssues(ctx, config, mapping, { issueKey: options.issueLinkKey })
        : await searchJiraIssues(ctx, config, mapping, { filters: mappingFilters });
      issueBatches.push({ mapping, issues });
    }

    const totalCount = issueBatches.reduce((sum, batch) => sum + batch.issues.length, 0);
    await saveSyncState(ctx, settings, companyId, {
      status: 'running',
      message: totalCount > 0 ? `Jira sync is running. 0 of ${totalCount} issues processed.` : 'No Jira issues matched the current filters.',
      checkedAt: new Date().toISOString(),
      processedCount: 0,
      totalCount,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      lastRunTrigger: options?.trigger ?? 'manual'
    });

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
        await saveSyncState(ctx, settings, companyId, {
          status: 'running',
          message: totalCount > 0
            ? `Jira sync is running. ${processedCount} of ${totalCount} issues processed.`
            : 'Jira sync is running.',
          checkedAt: new Date().toISOString(),
          processedCount,
          totalCount,
          importedCount,
          updatedCount,
          skippedCount,
          failedCount,
          lastRunTrigger: options?.trigger ?? 'manual'
        });
      }
    }

    const nextSettings = await saveSyncState(ctx, settings, companyId, {
      status: 'success',
      message: `Jira sync finished. Imported ${importedCount}, updated ${updatedCount}, skipped ${skippedCount}.`,
      processedCount: importedCount + updatedCount + skippedCount,
      totalCount,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    });
    return getSyncStateForCompany(nextSettings, companyId);
  } catch (error) {
    failedCount += 1;
    const nextSettings = await saveSyncState(ctx, settings, companyId, {
      status: 'error',
      message: error instanceof Error ? error.message : 'Jira sync failed.',
      processedCount: importedCount + updatedCount + skippedCount,
      importedCount,
      updatedCount,
      skippedCount,
      failedCount,
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    });
    return getSyncStateForCompany(nextSettings, companyId);
  }
}

async function buildSettingsRegistrationData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const projects = companyId ? await ctx.projects.list({ companyId }) : [];
  const providers = await getAvailableProviders(ctx);
  const providerSummaries = await Promise.all(providers.map(async (provider) => {
    const config = await getProviderDisplayConfig(ctx, provider.id);
    const configSummary = buildDisplayConfigSummary(config);
    return {
      providerId: provider.id,
      providerKey: provider.type,
      displayName: provider.name,
      status: configSummary.ready ? 'configured' : 'needs_config',
      configSummary: configSummary.message,
      supportsConnectionTest: true,
      defaultIssueType: config.defaultIssueType,
      tokenSaved: config.tokenSaved
    };
  }));
  const selectedProviderId = providerSummaries[0]?.providerId;
  const selectedProviderConfig = selectedProviderId ? await getProviderDisplayConfig(ctx, selectedProviderId) : null;
  const selectedProviderSummary = selectedProviderConfig ? buildDisplayConfigSummary(selectedProviderConfig) : null;

  return {
    mappings: getMappingsForCompany(settings, companyId),
    filters: getFiltersForCompany(settings, companyId),
    providers: providerSummaries,
    selectedProviderId,
    selectedProviderKey: 'jira',
    connectionTest: getConnectionTestStateForCompany(settings, companyId),
    syncState: getSyncStateForCompany(settings, companyId),
    scheduleFrequencyMinutes: getScheduleFrequencyMinutes(settings, companyId),
    availableProjects: projects.map((project) => ({
      id: project.id,
      name: project.name
    })),
    configReady: selectedProviderSummary?.ready ?? false,
    configMessage: selectedProviderSummary?.message ?? 'Create a provider to start syncing.',
    updatedAt: settings.updatedAt
  };
}

async function buildSyncProvidersData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const providers = await getAvailableProviders(ctx);
  const connectionTest = getConnectionTestStateForCompany(settings, companyId);

  return {
    providers: await Promise.all(providers.map(async (provider) => {
      const config = await getProviderDisplayConfig(ctx, provider.id);
      const configSummary = buildDisplayConfigSummary(config);
      const providerConnectionTest =
        connectionTest.providerKey === 'jira' && connectionTest.message && connectionTest.status !== 'idle'
          ? connectionTest
          : { status: 'idle' } as ConnectionTestState;
      return {
        providerId: provider.id,
        providerKey: provider.type,
        displayName: provider.name,
        status:
          providerConnectionTest.status === 'success'
            ? 'connected'
            : configSummary.ready
              ? 'configured'
              : 'needs_config',
        configSummary:
          providerConnectionTest.status === 'success' || providerConnectionTest.status === 'error'
            ? providerConnectionTest.message
            : configSummary.message,
        supportsConnectionTest: true
      };
    }))
  };
}

async function buildSyncPopupState(
  ctx: PluginSetupContext,
  companyId?: string,
  providerId?: string
): Promise<Record<string, unknown>> {
  const settingsData = await buildSettingsRegistrationData(ctx, companyId);
  const selectedProviderId =
    normalizeOptionalString(providerId)
    ?? normalizeOptionalString(settingsData.selectedProviderId)
    ?? undefined;
  const config = selectedProviderId ? await getProviderDisplayConfig(ctx, selectedProviderId) : null;

  return {
    ...settingsData,
    selectedProviderId: selectedProviderId ?? null,
    selectedProviderKey: 'jira',
    providerConfig: {
      providerKey: 'jira',
      providerId: selectedProviderId ?? null,
      providerName: config?.providerName ?? '',
      jiraBaseUrl: config?.baseUrl ?? '',
      jiraUserEmail: config?.userEmail ?? '',
      defaultIssueType: config?.defaultIssueType ?? DEFAULT_ISSUE_TYPE,
      tokenSaved: Boolean(config?.tokenSaved)
    },
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

  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const rawLink = await findLinkedIssueEntity(ctx, issueId);
  const link = shouldPresentIssueLink(issue, rawLink) ? rawLink : null;
  let availableTransitions: Array<{ id: string; name: string }> = [];
  if (link) {
    try {
      const config = await getResolvedConfig(ctx, link.providerId ?? mapping?.providerId);
      availableTransitions = await listJiraTransitions(ctx, config, link.jiraIssueKey);
    } catch {
      availableTransitions = [];
    }
  }

  return {
    visible: Boolean(link || mapping),
    isSynced: Boolean(link),
    linked: Boolean(link),
    providerKey: 'jira',
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
            jiraUrl: link.jiraUrl,
            jiraAssigneeDisplayName: link.jiraAssigneeDisplayName,
            jiraStatusName: link.jiraStatusName,
            jiraStatusCategory: link.jiraStatusCategory,
            lastSyncedAt: link.lastSyncedAt,
            lastPulledAt: link.lastPulledAt,
            lastPushedAt: link.lastPushedAt,
            source: link.source
          },
          upstreamStatus: {
            name: link.jiraStatusName,
            category: link.jiraStatusCategory
          },
          upstreamTransitions: availableTransitions
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
  const link = await findLinkedIssueEntity(ctx, issueId);
  if (!link) {
    return { visible: false };
  }

  const commentLink = await findCommentLinkEntity(ctx, issueId, commentId);
  const origin = !commentLink
    ? 'paperclip'
    : commentLink.direction === 'pull'
      ? 'provider_pull'
      : 'provider_push';
  return {
    visible: true,
    linked: Boolean(commentLink),
    direction: commentLink?.direction ?? null,
    origin,
    providerKey: 'jira',
    isEditable: true,
    uploadAvailable: !commentLink,
    jiraIssueKey: link.jiraIssueKey,
    jiraUrl: link.jiraUrl,
    upstreamCommentId: commentLink?.jiraCommentId ?? null,
    lastSyncedAt: commentLink?.lastSyncedAt ?? null,
    syncMessage:
      origin === 'provider_pull'
        ? `Fetched from Jira issue ${link.jiraIssueKey}.`
        : origin === 'provider_push'
          ? `Uploaded to Jira issue ${link.jiraIssueKey}.`
          : `Local Paperclip comment on Jira issue ${link.jiraIssueKey}.`
  };
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
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  if (!mapping) {
    throw new Error('This Paperclip issue is not in a mapped project yet.');
  }

  const config = await getConfigForMapping(ctx, mapping);
  if (!isConfigReady(config)) {
    throw new Error(buildConfigSummary(config).message);
  }

  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue) {
    throw new Error('Paperclip issue not found.');
  }

  const existingLink = await findLinkedIssueEntity(ctx, issueId);
  const now = new Date().toISOString();
  let jiraIssue: JiraIssueRecord;

  if (existingLink) {
    await updateJiraIssue(ctx, config, existingLink.jiraIssueKey, issue);
    await syncJiraStatusFromPaperclip(ctx, config, existingLink.jiraIssueKey, issue.status);
    const [reloadedIssue] = await searchJiraIssues(ctx, config, mapping, { issueKey: existingLink.jiraIssueKey });
    if (!reloadedIssue) {
      throw new Error(`Jira issue ${existingLink.jiraIssueKey} could not be reloaded after the update.`);
    }
    jiraIssue = reloadedIssue;
  } else {
    jiraIssue = await createJiraIssue(ctx, config, mapping, issue);
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
    projectId: issue.projectId ?? mapping.paperclipProjectId,
    providerId: config.providerId,
    jiraIssueId: jiraIssue.id,
    jiraIssueKey: jiraIssue.key,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraUrl: jiraIssue.url,
    ...(jiraIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: jiraIssue.assigneeDisplayName } : {}),
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
    message: existingLink ? `Updated Jira issue ${jiraIssue.key}.` : `Created Jira issue ${jiraIssue.key}.`
  };
}

async function pullIssueFromJira(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const link = await findLinkedIssueEntity(ctx, issueId);
  if (!link || !mapping) {
    throw new Error('This Paperclip issue is not linked to Jira yet.');
  }

  const syncState = await syncMappings(ctx, settings, companyId, {
    issueId,
    issueLinkKey: link.jiraIssueKey,
    projectId: mapping.paperclipProjectId,
    trigger: 'pull'
  });

  return {
    ok: syncState.status === 'success',
    message: syncState.message ?? 'Jira pull finished.'
  };
}

async function pushCommentToJira(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  commentId: string
): Promise<Record<string, unknown>> {
  const issueLink = await findLinkedIssueEntity(ctx, issueId);
  if (!issueLink) {
    throw new Error('This Paperclip issue is not linked to Jira yet.');
  }

  const existingCommentLink = await findCommentLinkEntity(ctx, issueId, commentId);
  if (existingCommentLink) {
    return {
      ok: true,
      message: `This comment was already synced to Jira issue ${issueLink.jiraIssueKey}.`
    };
  }

  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  if (!mapping) {
    throw new Error('This Paperclip issue is not in a mapped project yet.');
  }

  const config = await getConfigForMapping(ctx, mapping);
  if (!isConfigReady(config)) {
    throw new Error(buildConfigSummary(config).message);
  }

  const comments = await ctx.issues.listComments(issueId, companyId);
  const comment = comments.find((entry) => entry.id === commentId);
  if (!comment) {
    throw new Error('Paperclip comment not found.');
  }

  const commentCreateResult = await addJiraComment(ctx, config, issueLink.jiraIssueKey, comment.body.trim());
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
    message: `Synced comment to Jira issue ${issueLink.jiraIssueKey}.`
  };
}

async function setUpstreamIssueStatus(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  transitionId: string
): Promise<Record<string, unknown>> {
  const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
  const link = await findLinkedIssueEntity(ctx, issueId);
  if (!link) {
    throw new Error('This Paperclip issue is not linked to Jira yet.');
  }

  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const config = await getResolvedConfig(ctx, link.providerId ?? mapping?.providerId);
  if (!isConfigReady(config)) {
    throw new Error(buildConfigSummary(config).message);
  }

  const transitions = await listJiraTransitions(ctx, config, link.jiraIssueKey);
  const selectedTransition = transitions.find((transition) => transition.id === transitionId);
  if (!selectedTransition) {
    throw new Error('That Jira status transition is not available right now.');
  }

  await transitionJiraIssue(ctx, config, link.jiraIssueKey, transitionId);
  const [reloadedIssue] = await searchJiraIssues(ctx, config, {
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
    throw new Error(`Jira issue ${link.jiraIssueKey} could not be reloaded after the status change.`);
  }

  await upsertIssueLinkEntity(ctx, issueId, {
    ...link,
    ...(reloadedIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: reloadedIssue.assigneeDisplayName } : {}),
    jiraStatusName: reloadedIssue.statusName,
    jiraStatusCategory: reloadedIssue.statusCategory,
    lastSyncedAt: new Date().toISOString(),
    lastPushedAt: new Date().toISOString()
  });

  return {
    ok: true,
    message: `Updated Jira status to ${reloadedIssue.statusName}.`
  };
}

async function findCleanupCandidates(
  ctx: PluginSetupContext,
  companyId: string
): Promise<Array<{ issueId: string; title: string; jiraIssueKey: string; status: string }>> {
  const issueLinks = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  const scopedLinks = issueLinks
    .map((entry) => entry.data as unknown as JiraIssueLinkData)
    .filter((entry) => entry.companyId === companyId);
  const candidates: Array<{ issueId: string; title: string; jiraIssueKey: string; status: string }> = [];

  for (const link of scopedLinks) {
    if (link.source !== 'jira' || link.lastPushedAt) {
      continue;
    }

    const issue = await ctx.issues.get(link.issueId, companyId);
    if (!issue) {
      continue;
    }
    if (issue.hiddenAt) {
      continue;
    }

    const commentRegistry = await getCommentLinkRegistry(ctx, issue.id);
    const hasPushedComment = Object.values(commentRegistry).some((entry) => entry.direction === 'push');
    if (hasPushedComment) {
      continue;
    }

    if (!matchesImportedIssueSnapshot(issue, link)) {
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

const plugin = definePlugin({
  async setup(ctx) {
    ctx.launchers.register(GLOBAL_SYNC_LAUNCHER);
    ctx.launchers.register(ENTITY_SYNC_LAUNCHER);

    ctx.data.register('sync.providers', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      return await buildSyncProvidersData(ctx, companyId);
    });

    ctx.data.register('sync.popupState', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const providerId = normalizeOptionalString(record.providerId);
      return await buildSyncPopupState(ctx, companyId, providerId);
    });

    ctx.data.register('settings.registration', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      return await buildSettingsRegistrationData(ctx, companyId);
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

    ctx.actions.register('settings.saveRegistration', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      if (!companyId) {
        throw new Error('A company id is required to save Jira mappings.');
      }

      const previous = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const mappings = Array.isArray(record.mappings) ? record.mappings : [];
      const companyMappings = mappings
        .map((entry, index) => normalizeMapping({
          ...(entry && typeof entry === 'object' ? entry as Record<string, unknown> : {}),
          companyId
        }, index))
        .filter((entry): entry is JiraMapping => entry !== null);
      const scheduleFrequencyMinutes = normalizeFrequencyMinutes(record.scheduleFrequencyMinutes) ?? DEFAULT_SYNC_FREQUENCY_MINUTES;
      const next: JiraSyncSettings = {
        ...previous,
        mappings: [
          ...previous.mappings.filter((mapping) => mapping.companyId !== companyId),
          ...companyMappings
        ],
        scheduleFrequencyMinutesByCompanyId: {
          ...(previous.scheduleFrequencyMinutesByCompanyId ?? {}),
          [companyId]: scheduleFrequencyMinutes
        },
        updatedAt: new Date().toISOString()
      };
      await saveSettings(ctx, next);
      return await buildSettingsRegistrationData(ctx, companyId);
    });

    ctx.actions.register('sync.provider.saveConfig', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const providerKey = normalizeOptionalString(record.providerKey);
      if (!companyId) {
        throw new Error('A company id is required to save provider sync settings.');
      }
      if (providerKey && providerKey !== 'jira') {
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
      return await buildSyncPopupState(ctx, companyId, 'jira');
    });

    ctx.actions.register('sync.provider.testConnection', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const providerKey = normalizeOptionalString(record.providerKey);
      const providerId = normalizeOptionalString(record.providerId);
      if (!companyId) {
        throw new Error('A company id is required to test the Jira connection.');
      }
      if (providerKey && providerKey !== 'jira') {
        throw new Error(`Unsupported provider: ${providerKey}`);
      }

      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const testingSettings = await saveConnectionTestState(ctx, settings, companyId, {
        status: 'testing',
        message: 'Testing Jira connection…',
        checkedAt: new Date().toISOString(),
        providerKey: 'jira'
      });
      const configOverrides =
        record.config && typeof record.config === 'object'
          ? record.config as JiraProviderConfigRecord
          : undefined;
      const config = await getResolvedConfig(ctx, providerId, configOverrides);
      const result = await testJiraConnection(ctx, config);
      await saveConnectionTestState(ctx, testingSettings, companyId, {
        status: result.status,
        message: result.message,
        checkedAt: new Date().toISOString(),
        providerKey: 'jira'
      });
      return result;
    });

    ctx.actions.register('sync.testConnection', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const providerKey = normalizeOptionalString(record.providerKey);
      const providerId = normalizeOptionalString(record.providerId);
      if (!companyId) {
        throw new Error('A company id is required to test the Jira connection.');
      }
      if (providerKey && providerKey !== 'jira') {
        throw new Error(`Unsupported provider: ${providerKey}`);
      }

      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const testingSettings = await saveConnectionTestState(ctx, settings, companyId, {
        status: 'testing',
        message: 'Testing Jira connection…',
        checkedAt: new Date().toISOString(),
        providerKey: 'jira'
      });
      const configOverrides =
        record.config && typeof record.config === 'object'
          ? record.config as JiraProviderConfigRecord
          : undefined;
      const config = await getResolvedConfig(ctx, providerId, configOverrides);
      const result = await testJiraConnection(ctx, config);
      await saveConnectionTestState(ctx, testingSettings, companyId, {
        status: result.status,
        message: result.message,
        checkedAt: new Date().toISOString(),
        providerKey: 'jira'
      });
      return result;
    });

    ctx.actions.register('sync.runNow', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      if (!companyId) {
        throw new Error('A company id is required to run Jira sync.');
      }
      const providerKey = normalizeOptionalString(record.providerKey);
      if (providerKey && providerKey !== 'jira') {
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

    ctx.actions.register('sync.findCleanupCandidates', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      if (!companyId) {
        throw new Error('A company id is required to clean up imported issues.');
      }

      const candidates = await findCleanupCandidates(ctx, companyId);
      return {
        candidates,
        count: candidates.length,
        message:
          candidates.length > 0
            ? `Found ${candidates.length} untouched imported issue${candidates.length === 1 ? '' : 's'} to clean up.`
            : 'No untouched imported issues need cleanup.'
      };
    });

    ctx.actions.register('issue.pushToJira', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      if (!companyId || !issueId) {
        throw new Error('companyId and issueId are required.');
      }

      return await pushIssueToJira(ctx, companyId, issueId);
    });

    ctx.actions.register('issue.pullFromJira', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      if (!companyId || !issueId) {
        throw new Error('companyId and issueId are required.');
      }

      return await pullIssueFromJira(ctx, companyId, issueId);
    });

    ctx.actions.register('issue.setUpstreamStatus', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const transitionId = normalizeOptionalString(record.transitionId);
      if (!companyId || !issueId || !transitionId) {
        throw new Error('companyId, issueId, and transitionId are required.');
      }

      return await setUpstreamIssueStatus(ctx, companyId, issueId, transitionId);
    });

    ctx.actions.register('comment.pushToJira', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const commentId = normalizeOptionalString(record.commentId);
      if (!companyId || !issueId || !commentId) {
        throw new Error('companyId, issueId, and commentId are required.');
      }

      return await pushCommentToJira(ctx, companyId, issueId, commentId);
    });

    ctx.actions.register('comment.uploadToProvider', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      const issueId = normalizeOptionalString(record.issueId);
      const commentId = normalizeOptionalString(record.commentId);
      if (!companyId || !issueId || !commentId) {
        throw new Error('companyId, issueId, and commentId are required.');
      }

      return await pushCommentToJira(ctx, companyId, issueId, commentId);
    });

    ctx.jobs.register('sync.jira-issues', async (job) => {
      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      const companyIds = [...new Set(settings.mappings.map((mapping) => mapping.companyId).filter(Boolean) as string[])];
      for (const companyId of companyIds) {
        const syncState = getSyncStateForCompany(settings, companyId);
        const scheduleFrequencyMinutes = getScheduleFrequencyMinutes(settings, companyId);
        if (!shouldRunScheduledSync(syncState, scheduleFrequencyMinutes)) {
          continue;
        }
        await syncMappings(ctx, settings, companyId, {
          trigger: 'schedule'
        });
      }
      ctx.logger.info('Jira scheduled sync tick finished.', {
        scheduledAt: job.scheduledAt
      });
    });
  },

  async onHealth() {
    return {
      status: 'ok',
      message: 'Jira Sync plugin ready'
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
