import { registerProject } from './project-registration.ts';
import {
  buildSyncPopupState,
} from '../data/view-models.ts';
import { providerRegistry, type PluginSetupContext } from '../core/context.ts';
import { normalizeInputRecord, normalizeOptionalString } from '../core/utils.ts';
import { normalizeCompanyId, normalizeSettings, normalizeTaskFilters } from '../core/settings-runtime.ts';
import { normalizeProviderType } from '../../providers/shared/config.ts';
import { getProviderPlatformName } from '../sync/helpers.ts';
import { runManualSyncNow } from '../jobs/orchestration.ts';
import { loadNormalizedState } from '../core/state.ts';
import { SETTINGS_SCOPE } from '../core/defaults.ts';
import {
  refreshProjectProviderIdentity,
  runProviderConnectionTest,
  saveProviderFiltersForCompany
} from './provider-settings.ts';

export function registerSyncActions(ctx: PluginSetupContext): void {
  ctx.actions.register('sync.project.save', async (input: unknown) => {
    return registerProject(ctx, normalizeInputRecord(input));
  });

  ctx.actions.register('sync.project.select', async (input: unknown) => {
    const projectId = normalizeOptionalString(normalizeInputRecord(input).projectId);
    if (!projectId) {
      throw new Error('projectId is required.');
    }

    return {
      projectId,
      navigationTarget: `project:${projectId}`
    };
  });

  ctx.actions.register('sync.project.refreshIdentity', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeCompanyId(record.companyId);
    const projectId = normalizeOptionalString(record.projectId);
    const providerId = normalizeOptionalString(record.providerId);
    if (!companyId || !projectId || !providerId) {
      throw new Error('companyId, projectId, and providerId are required.');
    }

    const result = await refreshProjectProviderIdentity(ctx, companyId, projectId, providerId);

    return {
      defaultAssignee: result.defaultAssignee,
      resolvedFromProviderIdentity: Boolean(result.defaultAssignee),
      message: result.defaultAssignee
        ? `Loaded ${getProviderPlatformName(result.providerType)} user ${result.defaultAssignee.displayName}.`
        : `Could not resolve the current ${getProviderPlatformName(result.providerType)} user for this provider yet.`,
      projectState: await buildSyncPopupState(ctx, companyId, providerId, projectId)
    };
  });

  ctx.actions.register('sync.provider.saveConfig', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeCompanyId(record.companyId);
    const providerKey = normalizeProviderType(record.providerKey);
    const providerId = normalizeOptionalString(record.providerId);
    if (!companyId) {
      throw new Error('A company id is required to save provider sync settings.');
    }
    if (providerKey && !providerRegistry.list().some((adapter: { type: string }) => adapter.type === providerKey)) {
      throw new Error(`Unsupported provider: ${providerKey}`);
    }

    await saveProviderFiltersForCompany(ctx, companyId, normalizeTaskFilters(record.filters));
    return buildSyncPopupState(ctx, companyId, providerId);
  });

  const testConnectionHandler = async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeCompanyId(record.companyId);
    const providerKey = normalizeProviderType(record.providerKey);
    const providerId = normalizeOptionalString(record.providerId);
    const projectId = normalizeOptionalString(record.projectId);
    if (!companyId) {
      throw new Error('A company id is required to test the provider connection.');
    }
    if (providerKey && !providerRegistry.list().some((adapter: { type: string }) => adapter.type === providerKey)) {
      throw new Error(`Unsupported provider: ${providerKey}`);
    }

    const configOverrides =
      record.config && typeof record.config === 'object'
        ? record.config as Record<string, unknown>
        : undefined;
    return runProviderConnectionTest(ctx, companyId, providerKey, providerId, projectId, configOverrides);
  };

  ctx.actions.register('sync.provider.testConnection', testConnectionHandler);

  ctx.actions.register('sync.runNow', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeCompanyId(record.companyId);
    if (!companyId) {
      throw new Error('A company id is required to run sync.');
    }
    const providerKey = normalizeProviderType(record.providerKey);
    if (providerKey && !providerRegistry.list().some((adapter: { type: string }) => adapter.type === providerKey)) {
      throw new Error(`Unsupported provider: ${providerKey}`);
    }

    const overrideFilters = record.filters ? normalizeTaskFilters(record.filters) : undefined;
    const projectId = normalizeOptionalString(record.projectId);
    const issueId = normalizeOptionalString(record.issueId);
    const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
    return runManualSyncNow(ctx, settings, companyId, projectId, issueId, overrideFilters);
  });
}
