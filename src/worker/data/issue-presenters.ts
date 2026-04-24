import type { Issue } from '@paperclipai/plugin-sdk';
import { SETTINGS_SCOPE, COMMENT_LINKS_STATE_KEY } from '../core/defaults.ts';
import { loadNormalizedState } from '../core/state.ts';
import { getProjectConfig, normalizeSettings } from '../core/settings-runtime.ts';
import { shouldPresentIssueLink, getProviderPlatformName } from '../sync/helpers.ts';
import {
  findCommentLinkEntity,
  findOrRecoverLinkedIssueEntity,
  upsertIssueLinkEntity
} from '../sync/link-repository.ts';
import { resolveMappingForIssue } from '../sync/project-resolution.ts';
import {
  getProviderTypeById,
  listUpstreamTransitionsForProvider,
  searchUpstreamIssues
} from '../providers/provider-actions.ts';
import {
  providerConfigResolver,
  providerRegistry,
  type PluginSetupContext,
  type UpstreamIssueLinkData
} from '../core/context.ts';
import { isConfigReady, isGitHubConfigReady } from './provider-status.ts';

type AnyRecord = Record<string, any>;

export async function buildIssueSyncPresentation(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<AnyRecord> {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue) {
    return { visible: false };
  }

  const projectConfig = issue.projectId ? getProjectConfig(settings, companyId, issue.projectId) : null;
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const rawLink = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  const link = shouldPresentIssueLink(issue as Issue, rawLink as UpstreamIssueLinkData | null) ? rawLink : null;
  let liveIssue: AnyRecord | null = null;
  const providerType = link?.providerId
    ? (await providerConfigResolver.getProviderDisplayConfig(ctx, link.providerId)).providerType
    : mapping?.providerId
      ? (await providerConfigResolver.getProviderDisplayConfig(ctx, mapping.providerId)).providerType
      : 'jira_dc';
  const providerCapabilities = providerRegistry.get(providerType).capabilities;

  if (link) {
    try {
      const refreshMapping: AnyRecord = mapping ?? {
        id: `live-${link.jiraIssueKey}`,
        companyId,
        providerId: link.providerId,
        jiraProjectKey: link.jiraProjectKey,
        paperclipProjectId: issue.projectId ?? undefined,
        paperclipProjectName: projectConfig?.projectName ?? 'Linked project'
      };
      const canReadLiveIssue = providerType === 'github_issues'
        ? isGitHubConfigReady(await providerConfigResolver.resolveGitHubProviderConfig(ctx, link.providerId ?? mapping?.providerId))
        : isConfigReady(await providerConfigResolver.resolveJiraProviderConfig(ctx, link.providerId ?? mapping?.providerId));
      if (canReadLiveIssue) {
        const [refreshedIssue] = await searchUpstreamIssues(ctx, refreshMapping as any, { issueKey: link.jiraIssueKey });
        if (refreshedIssue) {
          liveIssue = refreshedIssue;
          const refreshedLink: AnyRecord = {
            ...link,
            jiraIssueId: refreshedIssue.id,
            jiraIssueKey: refreshedIssue.key,
            jiraProjectKey: link.jiraProjectKey,
            jiraUrl: refreshedIssue.url,
            ...(refreshedIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: refreshedIssue.assigneeDisplayName } : {}),
            ...(refreshedIssue.creatorDisplayName ? { jiraCreatorDisplayName: refreshedIssue.creatorDisplayName } : {}),
            jiraStatusName: refreshedIssue.statusName,
            jiraStatusCategory: refreshedIssue.statusCategory,
            linkedCommentCount: Array.isArray(refreshedIssue.comments) ? refreshedIssue.comments.length : 0,
            lastSyncedAt: link.lastSyncedAt ?? new Date().toISOString()
          };
          await upsertIssueLinkEntity(ctx, issueId, refreshedLink as UpstreamIssueLinkData);
        }
      }
    } catch {
      liveIssue = null;
    }
  }

  let availableTransitions: Array<{ id: string; name: string }> = [];
  if (link) {
    try {
        availableTransitions = await listUpstreamTransitionsForProvider(
        ctx,
        link.providerId ?? mapping?.providerId,
        link.jiraIssueKey
      );
    } catch {
      availableTransitions = [];
    }
  }

  return {
    visible: Boolean(link || (projectConfig?.providerId && mapping)),
    isSynced: Boolean(link),
    linked: Boolean(link),
    providerKey: providerType,
    supportsIssueUpdate: providerCapabilities.supportsIssueUpdate,
    supportsStatusUpdates: providerCapabilities.supportsStatusUpdates,
    supportsAssignableUsers: providerCapabilities.supportsAssignableUsers,
    supportsComments: providerCapabilities.supportsComments,
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
          upstreamComments: (liveIssue?.comments ?? []).map((comment: AnyRecord) => ({
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

export async function buildCommentAnnotationData(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  commentId: string
): Promise<AnyRecord> {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  if (!link) {
    return { visible: false };
  }

  const commentLink = await findCommentLinkEntity(ctx, COMMENT_LINKS_STATE_KEY, issueId, commentId);
  const origin = !commentLink
    ? 'paperclip'
    : commentLink.direction === 'pull'
      ? 'provider_pull'
      : 'provider_push';
  const providerType = link.providerId
    ? await getProviderTypeById(ctx, link.providerId)
    : 'jira_dc';
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
