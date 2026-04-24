import { findProjectById } from '../core/project-helpers.ts';
import { shouldRunScheduledSync } from './schedule.ts';
import {
  getProjectScheduleFrequencyMinutes,
  getProjectSyncState,
  normalizeSettings
} from '../core/settings-runtime.ts';
import { runScheduledSync } from './orchestration.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { loadNormalizedState } from '../core/state.ts';
import { SETTINGS_SCOPE } from '../core/defaults.ts';

export function registerSyncJobs(ctx: PluginSetupContext): void {
  ctx.jobs.register('sync.external-issues', async (job: { scheduledAt: string }) => {
    const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
    const projectConfigs = settings.projectConfigs ?? [];
    for (const projectConfig of projectConfigs) {
      const syncState = getProjectSyncState(settings, projectConfig.companyId, projectConfig.projectId);
      const scheduleFrequencyMinutes = getProjectScheduleFrequencyMinutes(settings, projectConfig.companyId, projectConfig.projectId);
      if (!projectConfig.projectId || !shouldRunScheduledSync(syncState, scheduleFrequencyMinutes)) {
        continue;
      }
      const activeProject = await findProjectById(ctx, projectConfig.companyId, projectConfig.projectId);
      if (!activeProject) {
        continue;
      }
      await runScheduledSync(ctx, settings, projectConfig.companyId, projectConfig.projectId);
    }
    ctx.logger.info('Scheduled sync tick finished.', {
      scheduledAt: job.scheduledAt
    });
  });
}
