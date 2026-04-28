import type { Issue } from '@paperclipai/plugin-sdk';
import type { ProviderType, CanonicalUpstreamProject } from '../../providers/shared/types.ts';
import type { ProviderConfigRecord } from './config-resolver.ts';
import type {
  PaperclipIssueStatus,
  ProjectSyncConfig,
  StatusMappingRule,
  UpstreamIssueRecord,
  SyncTaskFilters as UpstreamSyncFilters,
  UpstreamProjectMapping as UpstreamMapping,
  UpstreamUserReference
} from '../core/models.ts';
import { isGitHubProviderType } from '../../providers/shared/config.ts';
import { providerConfigResolver, providerRegistry, type PluginSetupContext } from '../core/context.ts';

function unsupportedFeatureError(providerLabel: string, feature: string): Error {
  return new Error(`${providerLabel} does not support ${feature}.`);
}

async function getProviderTypeByIdInternal(
  ctx: PluginSetupContext,
  providerId?: string
): Promise<ProviderType> {
  if (!providerId) {
    return 'jira_dc';
  }
  return (await providerConfigResolver.getProviderDisplayConfig(ctx, providerId)).providerType;
}

async function createBoundProvider(
  ctx: PluginSetupContext,
  providerType: ProviderType,
  providerId?: string,
  overrides?: ProviderConfigRecord
) {
  const adapter = providerRegistry.get(providerType);
  const config = isGitHubProviderType(providerType)
    ? await providerConfigResolver.resolveGitHubProviderConfig(ctx, providerId, overrides)
    : await providerConfigResolver.resolveJiraProviderConfig(ctx, providerId, overrides);
  return adapter.createProvider(ctx, config);
}

export async function getBoundProvider(
  ctx: PluginSetupContext,
  providerId?: string,
  overrides?: ProviderConfigRecord
) {
  const providerType = await getProviderTypeByIdInternal(ctx, providerId);
  const provider = await createBoundProvider(ctx, providerType, providerId, overrides);
  return { providerType, provider };
}

export async function getProviderTypeById(
  ctx: PluginSetupContext,
  providerId?: string
): Promise<ProviderType> {
  return getProviderTypeByIdInternal(ctx, providerId);
}

export async function testProviderConnectionAction(
  ctx: PluginSetupContext,
  providerType: ProviderType,
  providerId?: string,
  overrides?: ProviderConfigRecord
): Promise<{ status: 'success' | 'error'; message: string }> {
  const provider = await createBoundProvider(ctx, providerType, providerId, overrides);
  if (!provider.testConnection) {
    return {
      status: 'error',
      message: `${provider.label} does not expose connection testing.`
    };
  }
  return provider.testConnection();
}

export async function searchProviderUsers(
  ctx: PluginSetupContext,
  providerId: string,
  query: string
): Promise<UpstreamUserReference[]> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.capabilities.supportsUserSearch || !provider.searchUsers) {
    throw unsupportedFeatureError(provider.label, 'user search');
  }
  return await provider.searchUsers(query) as UpstreamUserReference[];
}

export async function searchProviderProjects(
  ctx: PluginSetupContext,
  providerId: string,
  query?: string
): Promise<CanonicalUpstreamProject[]> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.capabilities.supportsProjectPicker || !provider.listUpstreamProjects) {
    throw unsupportedFeatureError(provider.label, 'project lookup');
  }
  return await provider.listUpstreamProjects(query) as CanonicalUpstreamProject[];
}

export async function resolveProviderCurrentUser(
  ctx: PluginSetupContext,
  providerId: string
): Promise<UpstreamUserReference | undefined> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.resolveCurrentUser) {
    throw unsupportedFeatureError(provider.label, 'current-user lookup');
  }
  return await provider.resolveCurrentUser() as UpstreamUserReference | undefined;
}

export async function getProviderDefaultStatusMappings(
  ctx: PluginSetupContext,
  providerId?: string
): Promise<StatusMappingRule[]> {
  const providerType = await getProviderTypeByIdInternal(ctx, providerId);
  const adapter = providerRegistry.get(providerType);
  return adapter.getDefaultStatusMappings ? adapter.getDefaultStatusMappings() : [];
}

export async function getEffectiveProjectStatusMappings(
  ctx: PluginSetupContext,
  projectConfig: ProjectSyncConfig | null
): Promise<StatusMappingRule[]> {
  if (!projectConfig) {
    return [];
  }
  if (projectConfig.statusMappings?.length) {
    return projectConfig.statusMappings;
  }
  return await getProviderDefaultStatusMappings(ctx, projectConfig.providerId);
}

export async function searchUpstreamIssues(
  ctx: PluginSetupContext,
  mapping: UpstreamMapping,
  options?: { issueKey?: string; filters?: UpstreamSyncFilters }
): Promise<UpstreamIssueRecord[]> {
  const { provider } = await getBoundProvider(ctx, mapping.providerId);
  if (!provider.searchIssues) {
    throw unsupportedFeatureError(provider.label, 'issue search');
  }
  return await provider.searchIssues(mapping, options) as UpstreamIssueRecord[];
}

export async function createUpstreamIssueForProvider(
  ctx: PluginSetupContext,
  mapping: UpstreamMapping,
  issue: Issue,
  options?: { assignee?: UpstreamUserReference }
): Promise<UpstreamIssueRecord> {
  const { provider } = await getBoundProvider(ctx, mapping.providerId);
  if (!provider.capabilities.supportsIssueCreation || !provider.createIssue) {
    throw unsupportedFeatureError(provider.label, 'creating upstream issues');
  }
  const createdIssue = await provider.createIssue(mapping, issue) as UpstreamIssueRecord;
  const defaultAssignee = options?.assignee;
  if (!defaultAssignee || !provider.capabilities.supportsAssignableUsers || !provider.setAssignee) {
    return createdIssue;
  }

  await provider.setAssignee(createdIssue.key, defaultAssignee);

  if (!provider.searchIssues) {
    return createdIssue;
  }

  const [reloadedIssue] = await provider.searchIssues(mapping, { issueKey: createdIssue.key }) as UpstreamIssueRecord[];
  return reloadedIssue ?? createdIssue;
}

export async function updateUpstreamIssueForProvider(
  ctx: PluginSetupContext,
  mapping: UpstreamMapping,
  issueKey: string,
  issue: Issue
): Promise<void> {
  const { provider } = await getBoundProvider(ctx, mapping.providerId);
  if (!provider.capabilities.supportsIssueUpdate || !provider.updateIssue) {
    throw unsupportedFeatureError(provider.label, 'updating upstream issues');
  }
  await provider.updateIssue(issueKey, issue);
}

export async function syncUpstreamStatusFromPaperclipForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string,
  paperclipStatus: PaperclipIssueStatus
): Promise<boolean> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.capabilities.supportsStatusUpdates || !provider.syncStatusFromPaperclip) {
    throw unsupportedFeatureError(provider.label, 'status updates');
  }
  return provider.syncStatusFromPaperclip(issueKey, paperclipStatus);
}

export async function listUpstreamTransitionsForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string
): Promise<Array<{ id: string; name: string }>> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.capabilities.supportsStatusUpdates || !provider.listTransitions) {
    throw unsupportedFeatureError(provider.label, 'status transitions');
  }
  return provider.listTransitions(issueKey);
}

export async function transitionUpstreamIssueForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string,
  transitionId: string
): Promise<void> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.capabilities.supportsStatusUpdates || !provider.transitionIssue) {
    throw unsupportedFeatureError(provider.label, 'status transitions');
  }
  await provider.transitionIssue(issueKey, transitionId);
}

export async function setUpstreamAssigneeForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string,
  assignee: UpstreamUserReference
): Promise<void> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.capabilities.supportsAssignableUsers || !provider.setAssignee) {
    throw unsupportedFeatureError(provider.label, 'assignee updates');
  }
  await provider.setAssignee(issueKey, assignee);
}

export async function addUpstreamCommentForProvider(
  ctx: PluginSetupContext,
  providerId: string | undefined,
  issueKey: string,
  body: string
): Promise<{ id: string }> {
  const { provider } = await getBoundProvider(ctx, providerId);
  if (!provider.capabilities.supportsComments || !provider.addComment) {
    throw unsupportedFeatureError(provider.label, 'posting upstream comments');
  }
  return provider.addComment(issueKey, body);
}
