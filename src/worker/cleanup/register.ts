import { normalizeInputRecord, normalizeOptionalString, normalizeScopeId } from '../core/utils.ts';
import { ISSUE_LINK_ENTITY_TYPE, type PluginSetupContext } from '../core/context.ts';
import { findCleanupCandidatesForCompany } from './cleanup.ts';

export function registerSyncCleanupActions(ctx: PluginSetupContext): void {
  ctx.actions.register('sync.findCleanupCandidates', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const projectId = normalizeOptionalString(record.projectId);
    if (!companyId) {
      throw new Error('A company id is required to clean up imported issues.');
    }

    const candidates = await findCleanupCandidatesForCompany(ctx, ISSUE_LINK_ENTITY_TYPE, companyId, projectId);
    return {
      candidates,
      count: candidates.length,
      message:
        candidates.length > 0
          ? `Found ${candidates.length} imported issue${candidates.length === 1 ? '' : 's'} to clean up.`
          : 'No imported issues need cleanup.'
    };
  });

  ctx.actions.register('sync.cleanupImportedIssues', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const issueIds = Array.isArray(record.issueIds)
      ? record.issueIds.map((issueId) => normalizeOptionalString(issueId)).filter((issueId): issueId is string => Boolean(issueId))
      : [];
    if (!companyId) {
      throw new Error('A company id is required to clean up imported issues.');
    }
    if (issueIds.length === 0) {
      return {
        count: 0,
        message: 'No imported issues were selected.'
      };
    }

    return {
      count: issueIds.length,
      message: `Selected ${issueIds.length} imported issue${issueIds.length === 1 ? '' : 's'} for cleanup.`
    };
  });
}
