import type { Issue } from '@paperclipai/plugin-sdk';
import type {
  PluginSyncSettings,
  UpstreamCommentLinkData,
  UpstreamIssueLinkData
} from '../core/models.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { COMMENT_LINKS_STATE_KEY, ISSUE_LINK_ENTITY_TYPE } from '../core/defaults.ts';
import { providerConfigResolver } from '../core/context.ts';
import { resolveMappingForIssue } from './project-resolution.ts';
import { getProviderTypeById, searchUpstreamIssues } from '../providers/provider-actions.ts';
import { buildLinkIdentityCandidates, getLinkIdentityMetadata } from './reconcile.ts';
import { isConfigReady, isGitHubConfigReady } from '../data/provider-status.ts';

interface LinkRepositoryContext {
  entities: {
    list(input: { entityType: string; limit: number }): Promise<Array<{ scopeKind?: string | null; scopeId?: string | null; data: unknown }>>;
    upsert(input: {
      entityType: string;
      scopeKind: 'issue';
      scopeId: string;
      externalId: string;
      title: string;
      status: string;
      data: Record<string, unknown>;
    }): Promise<unknown>;
  };
  state: {
    get(input: { scopeKind: 'issue'; scopeId: string; stateKey: string }): Promise<unknown>;
    set(input: { scopeKind: 'issue'; scopeId: string; stateKey: string }, value: unknown): Promise<unknown>;
  };
  issues: {
    get(issueId: string, companyId: string): Promise<Issue | null>;
  };
}

export function extractUpstreamIssueKey(issue: Issue): string | null {
  const markerMatch = issue.description?.match(/<!-- paperclip-external-issues-plugin-upstream: ([^ >]+) -->/i);
  if (markerMatch?.[1]) {
    return markerMatch[1].trim().toUpperCase();
  }

  const titleMatch = issue.title.match(/^\[([A-Z][A-Z0-9]+-\d+)\]/i);
  return titleMatch?.[1]?.trim().toUpperCase() ?? null;
}

export function isIssueHidden(issue: Issue): boolean {
  const issueRecord = issue as unknown as Record<string, unknown>;
  return issueRecord.hidden === true || Boolean(issueRecord.hiddenAt);
}

export async function findLinkedIssueEntity(
  ctx: LinkRepositoryContext,
  issueId: string
): Promise<UpstreamIssueLinkData | null> {
  const records = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  const scopedRecord = records.find((record) => record.scopeKind === 'issue' && record.scopeId === issueId);
  if (!scopedRecord) {
    return null;
  }

  return scopedRecord.data as UpstreamIssueLinkData;
}

export async function findLinkedIssueEntityByKey(
  ctx: LinkRepositoryContext,
  jiraIssueKey: string,
  options?: {
    companyId?: string;
    projectId?: string;
  }
): Promise<UpstreamIssueLinkData | null> {
  const records = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  if (records.length === 0) {
    return null;
  }

  const scoped = records
    .map((record) => record.data as UpstreamIssueLinkData)
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

  return sortedByLastSynced[0] ?? null;
}

export async function findLinkedIssueEntityByIdentity(
  ctx: LinkRepositoryContext,
  identityKey: string,
  options?: {
    companyId?: string;
    projectId?: string;
  }
): Promise<UpstreamIssueLinkData | null> {
  const records = await ctx.entities.list({
    entityType: ISSUE_LINK_ENTITY_TYPE,
    limit: 500
  });
  if (records.length === 0) {
    return null;
  }

  const normalizedIdentityKey = identityKey.trim().toLowerCase();
  const scoped = records
    .map((record) => record.data as UpstreamIssueLinkData)
    .filter((record) =>
      buildLinkIdentityCandidates(record).some((candidate) => candidate === normalizedIdentityKey)
      && (!options?.companyId || record.companyId === options.companyId)
      && (!options?.projectId || record.projectId === options.projectId)
    );
  const sortedByLastSynced = [...scoped].sort((left, right) => {
    const leftTime = left.lastSyncedAt ? Date.parse(left.lastSyncedAt) : Number.NEGATIVE_INFINITY;
    const rightTime = right.lastSyncedAt ? Date.parse(right.lastSyncedAt) : Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });

  return sortedByLastSynced[0] ?? null;
}

export async function upsertIssueLinkEntity(
  ctx: LinkRepositoryContext,
  issueId: string,
  data: UpstreamIssueLinkData
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

export async function findOrRecoverLinkedIssueEntity(
  ctx: PluginSetupContext,
  settings: PluginSyncSettings,
  companyId: string,
  issueId: string
): Promise<UpstreamIssueLinkData | null> {
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

  const providerId = mapping.providerId;
  const providerType = await getProviderTypeById(ctx, providerId);
  if (providerType === 'github_issues') {
    if (!isGitHubConfigReady(await providerConfigResolver.resolveGitHubProviderConfig(ctx, providerId))) {
      return null;
    }
  } else if (!isConfigReady(await providerConfigResolver.resolveJiraProviderConfig(ctx, providerId))) {
    return null;
  }

  const [jiraIssue] = await searchUpstreamIssues(ctx, mapping, { issueKey: jiraIssueKey });
  if (!jiraIssue) {
    return null;
  }

  const repairedLink: UpstreamIssueLinkData = {
    issueId,
    companyId,
    projectId: issue.projectId ?? mapping.paperclipProjectId,
    ...(providerId ? { providerId } : {}),
    ...getLinkIdentityMetadata({
      providerType,
      jiraProjectKey: mapping.jiraProjectKey,
      jiraIssueId: jiraIssue.id,
      jiraIssueKey: jiraIssue.key
    }),
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
  ctx: LinkRepositoryContext,
  commentLinksStateKey: string,
  issueId: string
): Promise<Record<string, UpstreamCommentLinkData>> {
  const stored = await ctx.state.get({
    scopeKind: 'issue',
    scopeId: issueId,
    stateKey: commentLinksStateKey
  });
  if (!stored || typeof stored !== 'object') {
    return {};
  }

  return stored as Record<string, UpstreamCommentLinkData>;
}

export async function findCommentLinkEntity(
  ctx: LinkRepositoryContext,
  commentLinksStateKey: string,
  issueId: string,
  commentId: string
): Promise<UpstreamCommentLinkData | null> {
  const registry = await getCommentLinkRegistry(ctx, commentLinksStateKey, issueId);
  return registry[commentId] ?? null;
}

export async function findCommentLinkEntityByRemoteId(
  ctx: LinkRepositoryContext,
  commentLinksStateKey: string,
  issueId: string,
  jiraCommentId: string
): Promise<UpstreamCommentLinkData | null> {
  const registry = await getCommentLinkRegistry(ctx, commentLinksStateKey, issueId);
  return Object.values(registry).find((entry) => entry.jiraCommentId === jiraCommentId) ?? null;
}

export async function upsertCommentLinkEntity(
  ctx: LinkRepositoryContext,
  issueId: string,
  data: UpstreamCommentLinkData
): Promise<void> {
  const registry = await getCommentLinkRegistry(ctx, COMMENT_LINKS_STATE_KEY, issueId);
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
