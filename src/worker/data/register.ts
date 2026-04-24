import { ISSUE_LINK_ENTITY_TYPE } from '../core/defaults.ts';
import {
  buildProjectToolbarStateData,
  buildProviderDetailData,
  buildProviderDirectoryData,
  buildSettingsRegistrationData,
  buildSyncEntryContextData,
  buildSyncPopupState,
  buildSyncProjectListData,
  buildSyncProjectPageData,
  buildSyncProvidersData,
} from './view-models.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { getMappingsForScope, getSyncStateForCompany, normalizeCompanyId, normalizeSettings } from '../core/settings-runtime.ts';
import { normalizeInputRecord, normalizeOptionalString } from '../core/utils.ts';
import { searchProviderProjects, searchProviderUsers } from '../providers/provider-actions.ts';
import { loadNormalizedState } from '../core/state.ts';
import { SETTINGS_SCOPE } from '../core/defaults.ts';
import { buildCommentAnnotationData, buildIssueSyncPresentation } from './issue-presenters.ts';

export function registerSyncDataHandlers(ctx: PluginSetupContext): void {
  ctx.data.register('sync.entryContext', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildSyncEntryContextData(
      ctx,
      normalizeCompanyId(record.companyId),
      normalizeOptionalString(record.projectId),
      normalizeOptionalString(record.issueId)
    );
  });

  ctx.data.register('sync.projectList', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildSyncProjectListData(ctx, normalizeCompanyId(record.companyId));
  });

  ctx.data.register('sync.projectPage', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildSyncProjectPageData(
      ctx,
      normalizeCompanyId(record.companyId),
      normalizeOptionalString(record.projectId),
      normalizeOptionalString(record.issueId)
    );
  });

  ctx.data.register('sync.projectToolbarState', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildProjectToolbarStateData(
      ctx,
      normalizeCompanyId(record.companyId),
      normalizeOptionalString(record.projectId)
    );
  });

  ctx.data.register('sync.providers', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildSyncProvidersData(ctx, normalizeCompanyId(record.companyId));
  });

  ctx.data.register('settings.providerDirectory', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildProviderDirectoryData(ctx, normalizeCompanyId(record.companyId));
  });

  ctx.data.register('settings.providerDetail', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildProviderDetailData(
      ctx,
      normalizeCompanyId(record.companyId),
      normalizeOptionalString(record.providerId)
    );
  });

  ctx.data.register('sync.users.search', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    const providerId = normalizeOptionalString(record.providerId);
    const query = normalizeOptionalString(record.query) ?? '';
    if (!providerId || !query) {
      return { suggestions: [] };
    }

    try {
      return { suggestions: await searchProviderUsers(ctx, providerId, query) };
    } catch (error) {
      return {
        suggestions: [],
        errorMessage: error instanceof Error ? error.message : 'User search failed.'
      };
    }
  });

  ctx.data.register('sync.upstreamProjects.search', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    const providerId = normalizeOptionalString(record.providerId);
    const query = normalizeOptionalString(record.query) ?? '';
    if (!providerId) {
      return { suggestions: [] };
    }

    try {
      return { suggestions: await searchProviderProjects(ctx, providerId, query) };
    } catch (error) {
      return {
        suggestions: [],
        errorMessage: error instanceof Error ? error.message : 'Project lookup failed.'
      };
    }
  });

  ctx.data.register('sync.popupState', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildSyncPopupState(
      ctx,
      normalizeCompanyId(record.companyId),
      normalizeOptionalString(record.providerId),
      normalizeOptionalString(record.projectId),
      normalizeOptionalString(record.issueId)
    );
  });

  ctx.data.register('sync.projectState', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildSyncPopupState(
      ctx,
      normalizeCompanyId(record.companyId),
      undefined,
      normalizeOptionalString(record.projectId),
      normalizeOptionalString(record.issueId)
    );
  });

  ctx.data.register('settings.registration', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return buildSettingsRegistrationData(
      ctx,
      normalizeCompanyId(record.companyId),
      normalizeOptionalString(record.projectId),
      normalizeOptionalString(record.issueId)
    );
  });

  ctx.data.register('dashboard.summary', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    const companyId = normalizeCompanyId(record.companyId);
    const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
    const issueLinks = await ctx.entities.list({
      entityType: ISSUE_LINK_ENTITY_TYPE,
      limit: 500
    });
    const linkedIssueCount = issueLinks.filter((entry: { data: unknown }) => {
      const data = entry.data as { companyId?: string };
      return !companyId || data.companyId === companyId;
    }).length;

    return {
      mappingCount: getMappingsForScope(settings, companyId).length,
      linkedIssueCount,
      syncState: getSyncStateForCompany(settings, companyId)
    };
  });

  ctx.data.register('issue.syncPresentation', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    const companyId = normalizeCompanyId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    if (!companyId || !issueId) {
      return { visible: false, isSynced: false };
    }

    return buildIssueSyncPresentation(ctx, companyId, issueId);
  });

  ctx.data.register('comment.syncPresentation', async (input: unknown) => {
    const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    const companyId = normalizeCompanyId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    const commentId = normalizeOptionalString(record.commentId);
    if (!companyId || !issueId || !commentId) {
      return { visible: false, origin: 'paperclip', uploadAvailable: false };
    }

    return buildCommentAnnotationData(ctx, companyId, issueId, commentId);
  });

  ctx.data.register('sync.assignableAgents', async (input) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeCompanyId(record.companyId);
    if (!companyId) {
      return { agents: [] };
    }

    const agents = await ctx.agents.list({
      companyId,
      limit: 200
    });

    return {
      agents: agents
        .filter((agent: { status: string }) => agent.status !== 'terminated')
        .sort((left: { name: string }, right: { name: string }) => left.name.localeCompare(right.name))
        .map((agent: { id: string; name: string; title?: string | null; status: string }) => ({
          id: agent.id,
          name: agent.name,
          title: agent.title,
          status: agent.status
        }))
    };
  });
}
