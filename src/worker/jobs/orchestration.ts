import type { PluginSyncSettings, SyncTaskFilters } from '../core/models.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { syncMappings } from '../sync/orchestrator.ts';

export async function runScheduledSync(
  ctx: PluginSetupContext,
  settings: PluginSyncSettings,
  companyId: string,
  projectId: string
): Promise<void> {
  await syncMappings(ctx, settings, companyId, {
    projectId,
    trigger: 'schedule'
  });
}

export async function runManualSyncNow(
  ctx: PluginSetupContext,
  settings: PluginSyncSettings,
  companyId: string,
  projectId?: string,
  issueId?: string,
  filters?: SyncTaskFilters
) {
  return await syncMappings(ctx, settings, companyId, {
    ...(projectId ? { projectId } : {}),
    ...(issueId ? { issueId } : {}),
    ...(filters ? { filters } : {}),
    trigger: 'manual'
  });
}
