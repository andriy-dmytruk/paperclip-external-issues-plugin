import type { Issue } from '@paperclipai/plugin-sdk';
import type { JiraRuntimeConfig } from './api.ts';
import type { JiraIssueRecord, JiraCommentRecord } from './models.ts';
import type { UpstreamProjectMapping, SyncTaskFilters, UpstreamUserReference } from '../../worker/core/models.ts';

interface NormalizeJiraDeps {
  normalizeOptionalString(value: unknown): string | undefined;
  getUpstreamUserDisplayName(value: unknown): string | undefined;
  getUpstreamUserQueryValue(user?: UpstreamUserReference): string | undefined;
  defaultIssueType: string;
}

function buildJiraUniqueUpstreamId(baseUrl: string | undefined, issueId: string): string {
  const normalizedIssueId = issueId.trim();
  const fallbackBase = (baseUrl ?? 'jira').trim().replace(/\/+$/, '');
  try {
    const parsed = new URL(fallbackBase);
    const normalizedBase = `${parsed.protocol}//${parsed.host.toLowerCase()}${parsed.pathname.replace(/\/+$/, '')}`;
    return `jira:${normalizedBase}:${normalizedIssueId}`;
  } catch {
    return `jira:${fallbackBase.toLowerCase()}:${normalizedIssueId}`;
  }
}

function normalizeJiraStatusCategory(value: unknown): string {
  if (!value || typeof value !== 'object') {
    return 'To Do';
  }
  const record = value as Record<string, unknown>;
  const directName = typeof record.name === 'string' ? record.name.trim() : '';
  if (directName) {
    return directName;
  }
  const statusCategory = record.statusCategory;
  if (statusCategory && typeof statusCategory === 'object') {
    const categoryName = typeof (statusCategory as Record<string, unknown>).name === 'string'
      ? ((statusCategory as Record<string, unknown>).name as string).trim()
      : '';
    if (categoryName) {
      return categoryName;
    }
  }
  return 'To Do';
}

function normalizeJiraComment(value: unknown, deps: NormalizeJiraDeps): JiraCommentRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const id = deps.normalizeOptionalString(record.id);
  if (!id) {
    return null;
  }

  const body = (() => {
    if (typeof record.body === 'string') {
      return record.body;
    }
    if (record.body && typeof record.body === 'object') {
      return JSON.stringify(record.body);
    }
    return '';
  })();

  const authorDisplayName = deps.getUpstreamUserDisplayName(record.author) ?? 'Jira user';
  const createdAt = deps.normalizeOptionalString(record.created) ?? new Date().toISOString();
  const updatedAt = deps.normalizeOptionalString(record.updated) ?? createdAt;

  return {
    id,
    body,
    authorDisplayName,
    createdAt,
    updatedAt
  };
}

export function normalizeJiraIssue(
  value: unknown,
  config: JiraRuntimeConfig & { defaultIssueType?: string },
  deps: NormalizeJiraDeps
): JiraIssueRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const id = deps.normalizeOptionalString(record.id);
  const key = deps.normalizeOptionalString(record.key);
  const fields = record.fields && typeof record.fields === 'object'
    ? record.fields as Record<string, unknown>
    : {};
  const summary = deps.normalizeOptionalString(fields.summary);
  if (!id || !key || !summary) {
    return null;
  }

  const description = (() => {
    if (typeof fields.description === 'string') {
      return fields.description;
    }
    if (fields.description && typeof fields.description === 'object') {
      return JSON.stringify(fields.description);
    }
    return '';
  })();

  const status = fields.status && typeof fields.status === 'object'
    ? fields.status as Record<string, unknown>
    : undefined;
  const statusName = deps.normalizeOptionalString(status?.name) ?? 'To Do';
  const statusCategory = normalizeJiraStatusCategory(status);
  const issueType = (() => {
    const typeRecord = fields.issuetype && typeof fields.issuetype === 'object'
      ? fields.issuetype as Record<string, unknown>
      : undefined;
    return deps.normalizeOptionalString(typeRecord?.name) ?? config.defaultIssueType ?? deps.defaultIssueType;
  })();
  const assigneeDisplayName = deps.getUpstreamUserDisplayName(fields.assignee);
  const creatorDisplayName = deps.getUpstreamUserDisplayName(fields.creator) ?? deps.getUpstreamUserDisplayName(fields.reporter);
  const updatedAt = deps.normalizeOptionalString(fields.updated) ?? new Date().toISOString();
  const createdAt = deps.normalizeOptionalString(fields.created) ?? updatedAt;
  const commentsRoot = fields.comment && typeof fields.comment === 'object'
    ? fields.comment as Record<string, unknown>
    : undefined;
  const commentValues = commentsRoot && Array.isArray(commentsRoot.comments)
    ? commentsRoot.comments
    : [];
  const comments = commentValues
    .map((comment) => normalizeJiraComment(comment, deps))
    .filter((comment): comment is JiraCommentRecord => comment !== null);

  return {
    id,
    key,
    uniqueUpstreamId: buildJiraUniqueUpstreamId(config.baseUrl, id),
    summary,
    description,
    ...(assigneeDisplayName ? { assigneeDisplayName } : {}),
    ...(creatorDisplayName ? { creatorDisplayName } : {}),
    statusName,
    statusCategory,
    updatedAt,
    createdAt,
    issueType,
    url: config.baseUrl ? `${config.baseUrl}/browse/${key}` : key,
    comments
  };
}

function appendClause(clauses: string[], clause?: string): void {
  const trimmed = clause?.trim();
  if (trimmed) {
    clauses.push(`(${trimmed})`);
  }
}

export function buildJiraSearchJql(
  mapping: UpstreamProjectMapping,
  filters: SyncTaskFilters | undefined,
  deps: NormalizeJiraDeps
): string {
  const clauses: string[] = [];
  appendClause(clauses, `project = ${mapping.jiraProjectKey}`);
  appendClause(clauses, mapping.jiraJql);
  appendClause(clauses, mapping.upstreamQuery);

  if (filters?.onlyActive) {
    appendClause(clauses, "statusCategory != Done");
  }
  const assignee = deps.getUpstreamUserQueryValue(filters?.assignee);
  if (assignee) {
    appendClause(clauses, `assignee = "${assignee.replace(/"/g, '\\"')}"`);
  }
  const author = deps.getUpstreamUserQueryValue(filters?.author);
  if (author) {
    appendClause(clauses, `reporter = "${author.replace(/"/g, '\\"')}"`);
  }

  return `${clauses.join(' AND ')} ORDER BY updated DESC`;
}

export function plainTextToAdf(text: string): Record<string, unknown> {
  const safeText = text ?? '';
  return {
    type: 'doc',
    version: 1,
    content: [{
      type: 'paragraph',
      content: safeText
        ? [{ type: 'text', text: safeText }]
        : []
    }]
  };
}

export function normalizeJiraStatusName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function targetJiraTransitionNames(status: Issue['status']): string[] {
  switch (status) {
    case 'done':
      return ['done', 'complete', 'completed', 'closed', 'resolved'];
    case 'in_progress':
      return ['in progress', 'in-progress', 'started', 'doing'];
    case 'cancelled':
      return ['cancelled', 'canceled', "won't do", 'declined'];
    case 'todo':
    default:
      return ['to do', 'todo', 'open', 'backlog', 'selected for development'];
  }
}
