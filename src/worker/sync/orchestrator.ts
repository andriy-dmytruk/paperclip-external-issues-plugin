import type {
  PluginSyncSettings as SyncSettings,
  SyncRunState,
  SyncTaskFilters,
  UpstreamIssueLinkData,
  UpstreamIssueRecord,
  UpstreamProjectMapping as UpstreamMapping
} from '../core/models.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { providerConfigResolver } from '../core/context.ts';
import { COMMENT_LINKS_STATE_KEY, SETTINGS_SCOPE } from '../core/defaults.ts';
import { loadNormalizedState } from '../core/state.ts';
import {
  getFiltersForCompany,
  getMappingsForScope,
  getProjectConfig,
  getProjectSyncState,
  normalizeSettings,
  saveConnectionTestState,
  saveSyncState
} from '../core/settings-runtime.ts';
import {
  findProjectById,
  findProjectGitHubRepository,
  mappingMatchesProject,
  resolvePaperclipProjectForMapping
} from '../core/project-helpers.ts';
import {
  buildImportedIssueDescription,
  ensureIssueTitlePrefix,
  hashCommentBody
} from './helpers.ts';
import { getLinkIdentityMetadata } from './reconcile.ts';
import {
  findCommentLinkEntityByRemoteId,
  findLinkedIssueEntity,
  findLinkedIssueEntityByIdentity,
  findLinkedIssueEntityByKey,
  isIssueHidden,
  upsertCommentLinkEntity,
  upsertIssueLinkEntity
} from './link-repository.ts';
import {
  getEffectiveProjectStatusMappings,
  getProviderTypeById,
  searchUpstreamIssues
} from '../providers/provider-actions.ts';
import { resolveMappedPaperclipState } from '../core/settings-runtime.ts';
import {
  buildConfigSummary,
  buildGitHubConfigSummary,
  isConfigReady,
  isGitHubConfigReady
} from '../data/provider-status.ts';
import { isGitHubProviderType } from '../../providers/shared/config.ts';

async function importUpstreamComments(
  ctx: PluginSetupContext,
  companyId: string,
  issueId: string,
  upstreamIssue: UpstreamIssueRecord
): Promise<void> {
  for (const upstreamComment of upstreamIssue.comments) {
    const linkedComment = await findCommentLinkEntityByRemoteId(ctx, COMMENT_LINKS_STATE_KEY, issueId, upstreamComment.id);
    if (linkedComment) {
      continue;
    }

    const importedComment = await ctx.issues.createComment(
      issueId,
      `Imported from Jira by ${upstreamComment.authorDisplayName} on ${new Date(upstreamComment.createdAt).toLocaleString('en-CA')}\n\n${upstreamComment.body}`,
      companyId
    );
    await upsertCommentLinkEntity(ctx, issueId, {
      commentId: importedComment.id,
      issueId,
      companyId,
      jiraIssueKey: upstreamIssue.key,
      jiraCommentId: upstreamComment.id,
      direction: 'pull',
      lastSyncedAt: new Date().toISOString()
    });
  }
}

async function importOrUpdateIssueFromUpstream(
  ctx: PluginSetupContext,
  companyId: string,
  mapping: UpstreamMapping,
  upstreamIssue: UpstreamIssueRecord
): Promise<'imported' | 'updated' | 'skipped'> {
  const resolvedProject = await resolvePaperclipProjectForMapping(ctx, companyId, mapping);
  if (!resolvedProject) {
    return 'skipped';
  }

  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const projectConfig = getProjectConfig(settings, companyId, resolvedProject.id, resolvedProject.name);
  const effectiveStatusMappings = await getEffectiveProjectStatusMappings(ctx, projectConfig);
  const mappedPaperclipState = resolveMappedPaperclipState(projectConfig, upstreamIssue.statusName, effectiveStatusMappings);

  const now = new Date().toISOString();
  const providerId = mapping.providerId;
  const providerType = await getProviderTypeById(ctx, providerId);
  const linkIdentityMetadata = getLinkIdentityMetadata({
    providerType,
    jiraProjectKey: mapping.jiraProjectKey,
    jiraIssueId: upstreamIssue.id,
    jiraIssueKey: upstreamIssue.key
  });
  const existingLinkByIdentity = await findLinkedIssueEntityByIdentity(
    ctx,
    String(linkIdentityMetadata.upstreamIdentityKey ?? ''),
    {
      companyId,
      projectId: resolvedProject.id
    }
  ) as Record<string, unknown> | null;
  const existingLink = (existingLinkByIdentity ?? await findLinkedIssueEntityByKey(ctx, upstreamIssue.key, {
    companyId,
    projectId: resolvedProject.id
  })) as UpstreamIssueLinkData | null;
  const importedTitle = ensureIssueTitlePrefix(upstreamIssue.summary, upstreamIssue.key);
  const importedDescription = buildImportedIssueDescription(upstreamIssue);

  const createImportedIssue = async (linkSeed?: Record<string, unknown> | UpstreamIssueLinkData): Promise<'imported'> => {
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
      ...linkIdentityMetadata,
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
      lastPulledAt: now,
      source: 'jira',
      importedTitleHash: hashCommentBody(importedTitle),
      importedDescriptionHash: hashCommentBody(importedDescription)
    });
    await importUpstreamComments(ctx, companyId, createdIssue.id, upstreamIssue);
    return 'imported';
  };

  if (!existingLink) {
    return await createImportedIssue();
  }

  const existingIssue = await ctx.issues.get(String(existingLink.issueId), companyId);
  if (!existingIssue) {
    return await createImportedIssue(existingLink);
  }
  if (isIssueHidden(existingIssue)) {
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
    ...linkIdentityMetadata,
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
    lastPulledAt: now,
    importedTitleHash: hashCommentBody(importedTitle),
    importedDescriptionHash: hashCommentBody(importedDescription)
  });
  await importUpstreamComments(ctx, companyId, existingIssue.id, upstreamIssue);
  return 'updated';
}

export async function syncMappings(
  ctx: PluginSetupContext,
  settings: SyncSettings,
  companyId: string,
  options?: {
    projectId?: string;
    issueId?: string;
    issueLinkKey?: string;
    filters?: SyncTaskFilters;
    trigger?: SyncRunState['lastRunTrigger'];
  }
): Promise<SyncRunState> {
  const allMappings = getMappingsForScope(settings, companyId);
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

  const mappings: UpstreamMapping[] = [];
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
    const issueBatches: Array<{ mapping: UpstreamMapping; issues: UpstreamIssueRecord[] }> = [];
    for (const mapping of mappings) {
      const providerType = await getProviderTypeById(ctx, mapping.providerId);
      try {
        const configSummary = isGitHubProviderType(providerType)
          ? buildGitHubConfigSummary(await providerConfigResolver.resolveGitHubProviderConfig(ctx, mapping.providerId))
          : buildConfigSummary(await providerConfigResolver.resolveJiraProviderConfig(ctx, mapping.providerId));
        const providerReady = isGitHubProviderType(providerType)
          ? isGitHubConfigReady(await providerConfigResolver.resolveGitHubProviderConfig(ctx, mapping.providerId))
          : isConfigReady(await providerConfigResolver.resolveJiraProviderConfig(ctx, mapping.providerId));
        if (!providerReady || !configSummary.ready) {
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
      for (const upstreamIssue of batch.issues) {
        if (options?.issueId) {
          const currentLink = await findLinkedIssueEntity(ctx, options.issueId) as Record<string, unknown> | null;
          if (currentLink?.jiraIssueKey && currentLink.jiraIssueKey !== upstreamIssue.key) {
            continue;
          }
        }

        const result = await importOrUpdateIssueFromUpstream(ctx, companyId, batch.mapping, upstreamIssue);
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
