import type { SyncRunState } from '../core/models.ts';

export function shouldRunScheduledSync(syncState: SyncRunState, scheduleFrequencyMinutes: number): boolean {
  if (!syncState.checkedAt) {
    return true;
  }

  const lastCheckedAt = new Date(syncState.checkedAt).getTime();
  return Number.isFinite(lastCheckedAt)
    ? (Date.now() - lastCheckedAt) >= scheduleFrequencyMinutes * 60_000
    : true;
}
