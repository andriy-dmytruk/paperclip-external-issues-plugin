import type { PluginSyncSettings as SyncSettings, UpstreamProjectMapping as UpstreamMapping, ProjectSyncConfig } from '../core/models.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { getProjectConfig, getMappingsForScope } from '../core/settings-runtime.ts';
import { findProjectById, mappingMatchesProject } from '../core/project-helpers.ts';

export async function resolveMappingForIssue(
  ctx: PluginSetupContext,
  settings: SyncSettings,
  companyId: string,
  issueId: string
): Promise<UpstreamMapping | null> {
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
  return getMappingsForScope(settings, companyId).find((mapping) => mappingMatchesProject(mapping, issueProject)) ?? null;
}

export async function resolveProjectConfigForIssue(
  ctx: PluginSetupContext,
  settings: SyncSettings,
  companyId: string,
  issueId: string
): Promise<ProjectSyncConfig | null> {
  const issue = await ctx.issues.get(issueId, companyId);
  if (!issue?.projectId) {
    return null;
  }
  return getProjectConfig(settings, companyId, issue.projectId);
}
