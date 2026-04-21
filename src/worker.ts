import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { definePlugin, runWorker, type Issue, type IssueComment } from '@paperclipai/plugin-sdk';

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

type PluginSetupContext = Parameters<Parameters<typeof definePlugin>[0]['setup']>[0];
type PaperclipIssueStatus = Issue['status'];

interface JiraMapping {
  id: string;
  companyId?: string;
  jiraProjectKey: string;
  jiraJql?: string;
  paperclipProjectId?: string;
  paperclipProjectName: string;
}

interface SyncRunState {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
  importedCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  failedCount?: number;
  lastRunTrigger?: 'manual' | 'schedule' | 'pull' | 'push';
}

interface JiraSyncSettings {
  mappings: JiraMapping[];
  syncStateByCompanyId?: Record<string, SyncRunState>;
  scheduleFrequencyMinutesByCompanyId?: Record<string, number>;
  updatedAt?: string;
}

interface JiraConfig {
  baseUrl?: string;
  userEmail?: string;
  token?: string;
  defaultIssueType: string;
}

interface JiraIssueRecord {
  id: string;
  key: string;
  summary: string;
  description: string;
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
  jiraIssueId: string;
  jiraIssueKey: string;
  jiraProjectKey: string;
  jiraUrl: string;
  jiraStatusName: string;
  jiraStatusCategory: string;
  lastSyncedAt: string;
  lastPulledAt?: string;
  lastPushedAt?: string;
  linkedCommentCount?: number;
  source: 'jira' | 'paperclip';
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
    ...(typeof record.importedCount === 'number' ? { importedCount: record.importedCount } : {}),
    ...(typeof record.updatedCount === 'number' ? { updatedCount: record.updatedCount } : {}),
    ...(typeof record.skippedCount === 'number' ? { skippedCount: record.skippedCount } : {}),
    ...(typeof record.failedCount === 'number' ? { failedCount: record.failedCount } : {}),
    ...(record.lastRunTrigger === 'manual' || record.lastRunTrigger === 'schedule' || record.lastRunTrigger === 'pull' || record.lastRunTrigger === 'push'
      ? { lastRunTrigger: record.lastRunTrigger }
      : {})
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
    ...(normalizeOptionalString(record.jiraJql) ? { jiraJql: normalizeOptionalString(record.jiraJql) } : {}),
    ...(normalizeOptionalString(record.paperclipProjectId) ? { paperclipProjectId: normalizeOptionalString(record.paperclipProjectId) } : {}),
    ...(normalizeCompanyId(record.companyId) ? { companyId: normalizeCompanyId(record.companyId) } : {})
  };
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

async function getResolvedConfig(ctx: PluginSetupContext): Promise<JiraConfig> {
  const config = await ctx.config.get();
  const baseUrl = normalizeOptionalString(config.jiraBaseUrl)?.replace(/\/+$/, '');
  const userEmail = normalizeOptionalString(config.jiraUserEmail);
  const tokenRef = normalizeOptionalString(config.jiraTokenRef);
  const token = tokenRef ? await ctx.secrets.resolve(tokenRef) : undefined;

  return {
    ...(baseUrl ? { baseUrl } : {}),
    ...(userEmail ? { userEmail } : {}),
    ...(token ? { token } : {}),
    defaultIssueType: normalizeOptionalString(config.defaultIssueType) ?? DEFAULT_ISSUE_TYPE
  };
}

function isConfigReady(config: JiraConfig): boolean {
  return Boolean(config.baseUrl && config.token);
}

function buildConfigSummary(config: JiraConfig): { ready: boolean; message: string } {
  if (isConfigReady(config)) {
    return {
      ready: true,
      message: `Connected through instance config at ${config.baseUrl}.`
    };
  }

  return {
    ready: false,
    message: 'Set jiraBaseUrl and jiraTokenRef in the plugin instance config. jiraUserEmail is optional and is only needed for Jira environments that require Basic auth instead of Bearer token auth.'
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
  }
): Promise<JiraIssueRecord[]> {
  if (options?.issueKey) {
    const response = await jiraRequest<Record<string, unknown>>(
      ctx,
      config,
      `/rest/api/2/issue/${encodeURIComponent(options.issueKey)}?fields=summary,description,status,comment,updated,created,issuetype`
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
        jql: mapping.jiraJql?.trim() || `project = ${mapping.jiraProjectKey} ORDER BY updated DESC`,
        maxResults: 50,
        fields: ['summary', 'description', 'status', 'comment', 'updated', 'created', 'issuetype']
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
          summary: issue.title,
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
          summary: issue.title,
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

function hashCommentBody(body: string): string {
  return createHash('sha1').update(body).digest('hex');
}

function buildImportedIssueDescription(jiraIssue: JiraIssueRecord): string {
  const body = jiraIssue.description.trim();
  return ensureIssueMarker(body || `_Imported from Jira ${jiraIssue.key}._`, jiraIssue.key);
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

  return getMappingsForCompany(settings, companyId).find((mapping) => mapping.paperclipProjectId === issue.projectId) ?? null;
}

async function importOrUpdateIssueFromJira(
  ctx: PluginSetupContext,
  companyId: string,
  mapping: JiraMapping,
  jiraIssue: JiraIssueRecord
): Promise<'imported' | 'updated' | 'skipped'> {
  const existingLink = await findLinkedIssueEntityByKey(ctx, jiraIssue.key);
  const now = new Date().toISOString();
  if (!existingLink) {
    if (!mapping.paperclipProjectId) {
      return 'skipped';
    }

    const createdIssue = await ctx.issues.create({
      companyId,
      projectId: mapping.paperclipProjectId,
      title: jiraIssue.summary,
      description: buildImportedIssueDescription(jiraIssue),
      priority: 'medium'
    });
    await ctx.issues.update(
      createdIssue.id,
      {
        description: buildImportedIssueDescription(jiraIssue)
      },
      companyId
    );
    await upsertIssueLinkEntity(ctx, createdIssue.id, {
      issueId: createdIssue.id,
      companyId,
      projectId: mapping.paperclipProjectId,
      jiraIssueId: jiraIssue.id,
      jiraIssueKey: jiraIssue.key,
      jiraProjectKey: mapping.jiraProjectKey,
      jiraUrl: jiraIssue.url,
      jiraStatusName: jiraIssue.statusName,
      jiraStatusCategory: jiraIssue.statusCategory,
      linkedCommentCount: jiraIssue.comments.length,
      lastSyncedAt: now,
      lastPulledAt: now,
      source: 'jira'
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
      title: jiraIssue.summary,
      description: buildImportedIssueDescription(jiraIssue)
    },
    companyId
  );
  await upsertIssueLinkEntity(ctx, existingIssue.id, {
    ...existingLink,
    jiraIssueId: jiraIssue.id,
    jiraIssueKey: jiraIssue.key,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraUrl: jiraIssue.url,
    jiraStatusName: jiraIssue.statusName,
    jiraStatusCategory: jiraIssue.statusCategory,
    linkedCommentCount: jiraIssue.comments.length,
    lastSyncedAt: now,
    lastPulledAt: now
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
    trigger?: SyncRunState['lastRunTrigger'];
  }
): Promise<SyncRunState> {
  const config = await getResolvedConfig(ctx);
  const configSummary = buildConfigSummary(config);
  if (!configSummary.ready) {
    return await saveSyncState(ctx, settings, companyId, {
      status: 'error',
      message: configSummary.message,
      checkedAt: new Date().toISOString(),
      lastRunTrigger: options?.trigger ?? 'manual'
    }).then((next) => getSyncStateForCompany(next, companyId));
  }

  const allMappings = getMappingsForCompany(settings, companyId);
  const mappings = options?.projectId
    ? allMappings.filter((mapping) => mapping.paperclipProjectId === options.projectId)
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
    lastRunTrigger: options?.trigger ?? 'manual'
  });

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  try {
    for (const mapping of mappings) {
      const issues = options?.issueLinkKey
        ? await searchJiraIssues(ctx, config, mapping, { issueKey: options.issueLinkKey })
        : await searchJiraIssues(ctx, config, mapping);
      for (const jiraIssue of issues) {
        if (options?.issueId) {
          const currentLink = await findLinkedIssueEntity(ctx, options.issueId);
          if (currentLink?.jiraIssueKey && currentLink.jiraIssueKey !== jiraIssue.key) {
            continue;
          }
        }

        const result = await importOrUpdateIssueFromJira(ctx, companyId, mapping, jiraIssue);
        if (result === 'imported') {
          importedCount += 1;
        } else if (result === 'updated') {
          updatedCount += 1;
        } else {
          skippedCount += 1;
        }
      }
    }

    const nextSettings = await saveSyncState(ctx, settings, companyId, {
      status: 'success',
      message: `Jira sync finished. Imported ${importedCount}, updated ${updatedCount}, skipped ${skippedCount}.`,
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
  const config = await getResolvedConfig(ctx);
  const configSummary = buildConfigSummary(config);
  const projects = companyId ? await ctx.projects.list({ companyId }) : [];

  return {
    mappings: getMappingsForCompany(settings, companyId),
    syncState: getSyncStateForCompany(settings, companyId),
    scheduleFrequencyMinutes: getScheduleFrequencyMinutes(settings, companyId),
    availableProjects: projects.map((project) => ({
      id: project.id,
      name: project.name
    })),
    configReady: configSummary.ready,
    configMessage: configSummary.message,
    updatedAt: settings.updatedAt
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
  const link = await findLinkedIssueEntity(ctx, issueId);

  return {
    visible: Boolean(link || mapping),
    linked: Boolean(link),
    issueId,
    localStatus: issue.status,
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
            jiraStatusName: link.jiraStatusName,
            jiraStatusCategory: link.jiraStatusCategory,
            lastSyncedAt: link.lastSyncedAt,
            lastPulledAt: link.lastPulledAt,
            lastPushedAt: link.lastPushedAt,
            source: link.source
          }
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
  return {
    visible: true,
    linked: Boolean(commentLink),
    direction: commentLink?.direction ?? null,
    jiraIssueKey: link.jiraIssueKey,
    jiraUrl: link.jiraUrl,
    lastSyncedAt: commentLink?.lastSyncedAt ?? null
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

  const config = await getResolvedConfig(ctx);
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
      description: ensureIssueMarker(issue.description ?? '', jiraIssue.key)
    },
    companyId
  );
  await upsertIssueLinkEntity(ctx, issueId, {
    issueId,
    companyId,
    projectId: issue.projectId ?? mapping.paperclipProjectId,
    jiraIssueId: jiraIssue.id,
    jiraIssueKey: jiraIssue.key,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraUrl: jiraIssue.url,
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

  const config = await getResolvedConfig(ctx);
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
    message: `Synced comment to Jira issue ${issueLink.jiraIssueKey}.`
  };
}

const plugin = definePlugin({
  async setup(ctx) {
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

    ctx.actions.register('sync.runNow', async (input) => {
      const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
      const companyId = normalizeCompanyId(record.companyId);
      if (!companyId) {
        throw new Error('A company id is required to run Jira sync.');
      }

      const settings = normalizeSettings(await ctx.state.get(SETTINGS_SCOPE));
      return await syncMappings(ctx, settings, companyId, {
        ...(normalizeOptionalString(record.projectId) ? { projectId: normalizeOptionalString(record.projectId) } : {}),
        ...(normalizeOptionalString(record.issueId) ? { issueId: normalizeOptionalString(record.issueId) } : {}),
        trigger: 'manual'
      });
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
