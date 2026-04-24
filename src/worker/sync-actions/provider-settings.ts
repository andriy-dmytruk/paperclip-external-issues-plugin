import type { ProviderType } from '../../providers/shared/types.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { SETTINGS_SCOPE } from '../core/defaults.ts';
import { loadNormalizedState } from '../core/state.ts';
import {
  getProjectConfig,
  normalizeSettings,
  saveConnectionTestState,
  saveProjectConfig,
  saveSettings
} from '../core/settings-runtime.ts';
import type { SyncTaskFilters } from '../core/models.ts';
import { providerConfigResolver } from '../core/context.ts';
import {
  getProviderTypeById,
  getProviderDefaultStatusMappings,
  resolveProviderCurrentUser,
  testProviderConnectionAction
} from '../providers/provider-actions.ts';

export async function saveProviderFiltersForCompany(
  ctx: PluginSetupContext,
  companyId: string,
  filters: SyncTaskFilters
): Promise<void> {
  const previous = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  await saveSettings(ctx, {
    ...previous,
    filtersByCompanyId: {
      ...(previous.filtersByCompanyId ?? {}),
      [companyId]: filters
    },
    updatedAt: new Date().toISOString()
  });
}

export async function runProviderConnectionTest(
  ctx: PluginSetupContext,
  companyId: string,
  providerKey: string | undefined,
  providerId: string | undefined,
  projectId: string | undefined,
  configOverrides: Record<string, unknown> | undefined
) {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const effectiveProviderKey = (providerKey as ProviderType | undefined)
    ?? (providerId ? (await providerConfigResolver.getProviderDisplayConfig(ctx, providerId)).providerType : undefined)
    ?? 'jira_dc';
  const testingSettings = await saveConnectionTestState(ctx, settings, companyId, {
    status: 'testing',
    message: 'Testing provider connection...',
    checkedAt: new Date().toISOString(),
    providerKey: effectiveProviderKey,
    ...(providerId ? { providerId } : {})
  }, projectId);
  const result = await testProviderConnectionAction(
    ctx,
    effectiveProviderKey,
    providerId,
    configOverrides
  );
  await saveConnectionTestState(ctx, testingSettings, companyId, {
    status: result.status,
    message: result.message,
    checkedAt: new Date().toISOString(),
    providerKey: effectiveProviderKey,
    ...(providerId ? { providerId } : {})
  }, projectId);
  return result;
}

export async function refreshProjectProviderIdentity(
  ctx: PluginSetupContext,
  companyId: string,
  projectId: string,
  providerId: string
) {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const projects = await ctx.projects.list({ companyId });
  const project = projects.find((entry) => entry.id === projectId);
  if (!project) {
    throw new Error('Paperclip project not found.');
  }
  const providerType = await getProviderTypeById(ctx, providerId);
  const defaultAssignee = await resolveProviderCurrentUser(ctx, providerId);
  const existing = getProjectConfig(settings, companyId, projectId, project.name);
  await saveProjectConfig(ctx, settings, {
    id: existing?.id ?? `project-config-${Date.now()}`,
    companyId,
    projectId,
    projectName: project.name,
    providerId,
    ...(defaultAssignee ? { defaultAssignee } : {}),
    defaultStatus: existing?.defaultStatus ?? 'todo',
    defaultStatusAssigneeAgentId: existing?.defaultStatusAssigneeAgentId ?? null,
    statusMappings: existing?.statusMappings ?? await getProviderDefaultStatusMappings(ctx, providerId),
    statusMappingsSource: existing?.statusMappingsSource ?? 'provider_default',
    scheduleFrequencyMinutes: existing?.scheduleFrequencyMinutes ?? 60,
    mappings: existing?.mappings ?? [],
    syncState: existing?.syncState,
    connectionTest: existing?.connectionTest
  });
  return {
    defaultAssignee: defaultAssignee ?? null,
    providerType,
    projectName: project.name
  };
}
