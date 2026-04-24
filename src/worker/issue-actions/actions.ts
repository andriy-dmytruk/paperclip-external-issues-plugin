import type { Issue } from '@paperclipai/plugin-sdk';
import type {
  PluginSyncSettings,
  ProjectSyncConfig,
  UpstreamIssueLinkData,
  UpstreamIssueRecord,
  UpstreamProjectMapping,
  UpstreamUserReference
} from '../core/models.ts';
import type { PluginSetupContext } from '../core/context.ts';
import {
  COMMENT_LINKS_STATE_KEY,
  SETTINGS_SCOPE
} from '../core/defaults.ts';
import { loadNormalizedState } from '../core/state.ts';
import {
  normalizeSettings,
  resolveMappedPaperclipState
} from '../core/settings-runtime.ts';
import { providerRegistry } from '../core/context.ts';
import {
  ensureIssueMarker,
  ensureIssueTitlePrefix,
  getProviderPlatformName
} from '../sync/helpers.ts';
import { getLinkIdentityMetadata } from '../sync/reconcile.ts';
import {
  findCommentLinkEntity,
  findOrRecoverLinkedIssueEntity,
  upsertCommentLinkEntity,
  upsertIssueLinkEntity
} from '../sync/link-repository.ts';
import {
  resolveMappingForIssue,
  resolveProjectConfigForIssue
} from '../sync/project-resolution.ts';
import { syncMappings } from '../sync/orchestrator.ts';
import {
  addUpstreamCommentForProvider,
  createUpstreamIssueForProvider,
  getEffectiveProjectStatusMappings,
  getProviderTypeById,
  listUpstreamTransitionsForProvider,
  searchUpstreamIssues,
  setUpstreamAssigneeForProvider,
  syncUpstreamStatusFromPaperclipForProvider,
  transitionUpstreamIssueForProvider,
  updateUpstreamIssueForProvider
} from '../providers/provider-actions.ts';

async function loadIssueActionContext(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<{
  settings: PluginSyncSettings;
  projectConfig: ProjectSyncConfig | null;
  mapping: UpstreamProjectMapping | null;
  link: UpstreamIssueLinkData | null;
}> {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const projectConfig = await resolveProjectConfigForIssue(ctx, settings, companyId, issueId);
  const mapping = await resolveMappingForIssue(ctx, settings, companyId, issueId);
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, companyId, issueId);
  return { settings, projectConfig, mapping, link };
}

async function reloadUpstreamIssue(
  ctx: PluginSetupContext,
  companyId: string,
  mapping: UpstreamProjectMapping | null,
  link: UpstreamIssueLinkData
): Promise<UpstreamIssueRecord> {
  const [reloadedIssue] = await searchUpstreamIssues(
    ctx,
    {
      id: mapping?.id ?? 'reload',
      companyId,
      providerId: link.providerId ?? mapping?.providerId,
      jiraProjectKey: link.jiraProjectKey,
      jiraJql: mapping?.jiraJql,
      paperclipProjectId: mapping?.paperclipProjectId,
      paperclipProjectName: mapping?.paperclipProjectName ?? '',
      filters: mapping?.filters
    },
    { issueKey: link.jiraIssueKey }
  );

  if (!reloadedIssue) {
    throw new Error(`Upstream issue ${link.jiraIssueKey} could not be reloaded after update.`);
  }

  return reloadedIssue;
}

export async function pushIssueToUpstream(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<Record<string, unknown>> {
  const { projectConfig, mapping, link: existingLink } = await loadIssueActionContext(ctx, companyId, issueId);
  if (!projectConfig?.providerId || !mapping) {
    throw new Error('This Paperclip issue is not in a project with configured upstream sync yet.');
  }

  const providerType = await getProviderTypeById(ctx, projectConfig.providerId);
  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue) {
    throw new Error('Paperclip issue not found.');
  }

  const now = new Date().toISOString();
  let upstreamIssue: UpstreamIssueRecord;
  const providerCapabilities = providerRegistry.get(providerType).capabilities;

  if (existingLink) {
    if (providerCapabilities.supportsIssueUpdate) {
      await updateUpstreamIssueForProvider(ctx, mapping, existingLink.jiraIssueKey, issue);
      await syncUpstreamStatusFromPaperclipForProvider(
        ctx,
        projectConfig.providerId,
        existingLink.jiraIssueKey,
        issue.status
      );
    }
    const [reloadedIssue] = await searchUpstreamIssues(ctx, mapping, { issueKey: existingLink.jiraIssueKey });
    if (!reloadedIssue) {
      throw new Error(`Upstream issue ${existingLink.jiraIssueKey} could not be reloaded after the update.`);
    }
    upstreamIssue = reloadedIssue;
  } else {
    upstreamIssue = await createUpstreamIssueForProvider(ctx, mapping, issue as Issue);
  }

  await ctx.issues.update(
    issueId,
    {
      title: ensureIssueTitlePrefix(issue.title, upstreamIssue.key),
      description: ensureIssueMarker(issue.description ?? '', upstreamIssue.key)
    },
    companyId
  );

  await upsertIssueLinkEntity(ctx, issueId, {
    issueId,
    companyId,
    projectId: issue.projectId ?? projectConfig.projectId ?? mapping.paperclipProjectId,
    providerId: projectConfig.providerId,
    ...getLinkIdentityMetadata({
      providerType,
      jiraProjectKey: mapping.jiraProjectKey,
      jiraIssueId: upstreamIssue.id,
      jiraIssueKey: upstreamIssue.key
    }),
    jiraIssueId: upstreamIssue.id,
    jiraIssueKey: upstreamIssue.key,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraUrl: upstreamIssue.url,
    ...(upstreamIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: upstreamIssue.assigneeDisplayName } : {}),
    ...(upstreamIssue.creatorDisplayName ? { jiraCreatorDisplayName: upstreamIssue.creatorDisplayName } : {}),
    jiraStatusName: upstreamIssue.statusName,
    jiraStatusCategory: upstreamIssue.statusCategory,
    linkedCommentCount: upstreamIssue.comments.length,
    lastSyncedAt: now,
    lastPushedAt: now,
    lastPulledAt: existingLink?.lastPulledAt,
    source: existingLink?.source ?? 'paperclip'
  } as UpstreamIssueLinkData);

  return {
    ok: true,
    issueKey: upstreamIssue.key,
    jiraUrl: upstreamIssue.url,
    message: existingLink ? `Updated upstream issue ${upstreamIssue.key}.` : `Created upstream issue ${upstreamIssue.key}.`
  };
}

export async function pullIssueFromUpstream(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string
): Promise<Record<string, unknown>> {
  const { settings, projectConfig, mapping, link } = await loadIssueActionContext(ctx, companyId, issueId);
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

export async function pushCommentToUpstream(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  commentId: string
): Promise<Record<string, unknown>> {
  const { mapping, link: issueLink } = await loadIssueActionContext(ctx, companyId, issueId);
  if (!issueLink) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  const existingCommentLink = await findCommentLinkEntity(ctx, COMMENT_LINKS_STATE_KEY, issueId, commentId);
  if (existingCommentLink) {
    return {
      ok: true,
      message: `This comment was already synced to upstream issue ${issueLink.jiraIssueKey}.`
    };
  }

  if (!mapping) {
    throw new Error('This Paperclip issue is not in a mapped project yet.');
  }

  const comments = await ctx.issues.listComments(issueId, companyId);
  const comment = comments.find((entry) => entry.id === commentId);
  if (!comment) {
    throw new Error('Paperclip comment not found.');
  }

  const commentCreateResult = await addUpstreamCommentForProvider(
    ctx,
    issueLink.providerId ?? mapping.providerId,
    issueLink.jiraIssueKey,
    comment.body.trim()
  );

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

export async function submitIssueComment(
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
  const { link: issueLink } = await loadIssueActionContext(ctx, companyId, issueId);
  const providerType =
    issueLink?.providerId
      ? await getProviderTypeById(ctx, issueLink.providerId)
      : 'jira_dc';
  const platform = getProviderPlatformName(providerType);

  try {
    const pushResult = await pushCommentToUpstream(ctx, companyId, issueId, createdComment.id);
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

export async function setUpstreamIssueStatus(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  transitionId: string
): Promise<Record<string, unknown>> {
  const { settings, mapping, link } = await loadIssueActionContext(ctx, companyId, issueId);
  if (!link) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  const transitions = await listUpstreamTransitionsForProvider(
    ctx,
    link.providerId ?? mapping?.providerId,
    link.jiraIssueKey
  );
  if (!transitions.find((transition) => transition.id === transitionId)) {
    throw new Error('That upstream status transition is not available right now.');
  }

  await transitionUpstreamIssueForProvider(
    ctx,
    link.providerId ?? mapping?.providerId,
    link.jiraIssueKey,
    transitionId
  );
  const reloadedIssue = await reloadUpstreamIssue(ctx, companyId, mapping, link);
  const projectConfig = await resolveProjectConfigForIssue(ctx, settings, companyId, issueId);
  const effectiveStatusMappings = await getEffectiveProjectStatusMappings(ctx, projectConfig);
  const mappedPaperclipState = resolveMappedPaperclipState(projectConfig, reloadedIssue.statusName, effectiveStatusMappings);
  if (mappedPaperclipState.status || Object.prototype.hasOwnProperty.call(mappedPaperclipState, 'assigneeAgentId')) {
    await ctx.issues.update(issueId, mappedPaperclipState, companyId);
  }

  const providerType = link.providerId ?? mapping?.providerId
    ? await getProviderTypeById(ctx, link.providerId ?? mapping?.providerId)
    : link.upstreamProviderType ?? 'jira_dc';
  await upsertIssueLinkEntity(ctx, issueId, {
    ...link,
    ...(link.providerId ?? mapping?.providerId ? { providerId: link.providerId ?? mapping?.providerId } : {}),
    ...getLinkIdentityMetadata({
      providerType,
      jiraProjectKey: link.jiraProjectKey,
      jiraIssueId: reloadedIssue.id,
      jiraIssueKey: reloadedIssue.key
    }),
    ...(reloadedIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: reloadedIssue.assigneeDisplayName } : {}),
    ...(reloadedIssue.creatorDisplayName ? { jiraCreatorDisplayName: reloadedIssue.creatorDisplayName } : {}),
    jiraStatusName: reloadedIssue.statusName,
    jiraStatusCategory: reloadedIssue.statusCategory,
    lastSyncedAt: new Date().toISOString(),
    lastPushedAt: new Date().toISOString()
  } as UpstreamIssueLinkData);

  return {
    ok: true,
    message: `Updated upstream status to ${reloadedIssue.statusName}.`
  };
}

export async function setUpstreamIssueAssignee(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  assignee: UpstreamUserReference
): Promise<Record<string, unknown>> {
  const { settings, mapping, link } = await loadIssueActionContext(ctx, companyId, issueId);
  if (!link) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  await setUpstreamAssigneeForProvider(
    ctx,
    link.providerId ?? mapping?.providerId,
    link.jiraIssueKey,
    assignee
  );
  const reloadedIssue = await reloadUpstreamIssue(ctx, companyId, mapping, link);
  const projectConfig = await resolveProjectConfigForIssue(ctx, settings, companyId, issueId);
  const effectiveStatusMappings = await getEffectiveProjectStatusMappings(ctx, projectConfig);
  const mappedPaperclipState = resolveMappedPaperclipState(projectConfig, reloadedIssue.statusName, effectiveStatusMappings);
  if (mappedPaperclipState.status || Object.prototype.hasOwnProperty.call(mappedPaperclipState, 'assigneeAgentId')) {
    await ctx.issues.update(issueId, mappedPaperclipState, companyId);
  }

  const providerType = link.providerId ?? mapping?.providerId
    ? await getProviderTypeById(ctx, link.providerId ?? mapping?.providerId)
    : link.upstreamProviderType ?? 'jira_dc';
  await upsertIssueLinkEntity(ctx, issueId, {
    ...link,
    ...(link.providerId ?? mapping?.providerId ? { providerId: link.providerId ?? mapping?.providerId } : {}),
    ...getLinkIdentityMetadata({
      providerType,
      jiraProjectKey: link.jiraProjectKey,
      jiraIssueId: reloadedIssue.id,
      jiraIssueKey: reloadedIssue.key
    }),
    ...(reloadedIssue.assigneeDisplayName ? { jiraAssigneeDisplayName: reloadedIssue.assigneeDisplayName } : {}),
    ...(reloadedIssue.creatorDisplayName ? { jiraCreatorDisplayName: reloadedIssue.creatorDisplayName } : {}),
    jiraStatusName: reloadedIssue.statusName,
    jiraStatusCategory: reloadedIssue.statusCategory,
    lastSyncedAt: new Date().toISOString(),
    lastPushedAt: new Date().toISOString()
  } as UpstreamIssueLinkData);

  return {
    ok: true,
    message: `Updated upstream assignee to ${reloadedIssue.assigneeDisplayName ?? assignee.displayName}.`
  };
}
