import type { Issue, ToolRunContext } from '@paperclipai/plugin-sdk';
import type { ProviderType } from '../../providers/shared/types.ts';
import type {
  ProjectSyncConfig,
  PluginSyncSettings,
  UpstreamProjectMapping
} from '../core/models.ts';
import type { PluginSetupContext, UpstreamIssueLinkData } from '../core/context.ts';
import { SETTINGS_SCOPE } from '../core/defaults.ts';
import { loadNormalizedState } from '../core/state.ts';
import { getProjectConfig, normalizeSettings } from '../core/settings-runtime.ts';
import { resolveMappingForIssue } from '../sync/project-resolution.ts';
import { findOrRecoverLinkedIssueEntity } from '../sync/link-repository.ts';
import { getProviderTypeById } from '../providers/provider-actions.ts';

export async function authorizeIssueProviderTool(
  ctx: PluginSetupContext,
  runCtx: ToolRunContext,
  paperclipIssueId: string,
  options?: { requireLinkedIssue?: boolean }
): Promise<{
  settings: PluginSyncSettings;
  issue: Issue;
  projectConfig: ProjectSyncConfig;
  mapping: UpstreamProjectMapping;
  providerId: string;
  providerType: ProviderType;
  link: UpstreamIssueLinkData | null;
}> {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const issue = await ctx.issues.get(paperclipIssueId, runCtx.companyId);
  if (!issue) {
    throw new Error('Paperclip issue not found.');
  }
  if (!issue.projectId) {
    throw new Error('This Paperclip issue is not attached to a project.');
  }
  if (issue.projectId !== runCtx.projectId) {
    throw new Error('Issue provider tools can only access issues in the agent run project.');
  }

  const projectConfig = getProjectConfig(settings, runCtx.companyId, issue.projectId);
  if (!projectConfig) {
    throw new Error('Issue provider tools are not enabled for this project.');
  }

  const access = projectConfig.agentIssueProviderAccess;
  if (!access?.enabled) {
    throw new Error('Issue provider tools are not enabled for this project.');
  }
  if (!Array.isArray(access.allowedAgentIds) || !access.allowedAgentIds.includes(runCtx.agentId)) {
    throw new Error('This agent is not allowed to use issue provider tools for this project.');
  }
  if (!projectConfig.providerId) {
    throw new Error('This project does not have an issue provider selected.');
  }

  const mapping = await resolveMappingForIssue(ctx, settings, runCtx.companyId, paperclipIssueId);
  if (!mapping) {
    throw new Error('This project does not have an upstream mapping yet.');
  }

  const providerId = projectConfig.providerId;
  const providerType = await getProviderTypeById(ctx, providerId);
  const link = await findOrRecoverLinkedIssueEntity(ctx, settings, runCtx.companyId, paperclipIssueId);
  if (options?.requireLinkedIssue && !link) {
    throw new Error('This Paperclip issue is not linked to an upstream issue yet.');
  }

  return {
    settings,
    issue,
    projectConfig,
    mapping,
    providerId,
    providerType,
    link
  };
}
