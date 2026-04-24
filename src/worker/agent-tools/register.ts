import { getIssueProviderAgentToolDeclaration } from '../../issue-provider-agent-tools.ts';
import type { ToolRunContext } from '@paperclipai/plugin-sdk';
import {
  buildToolContent,
  buildToolError,
  buildToolSuccess
} from './responses.ts';
import {
  pushIssueToUpstream,
  setUpstreamIssueAssignee,
  setUpstreamIssueStatus,
} from '../issue-actions/actions.ts';
import type { PluginSetupContext } from '../core/context.ts';
import {
  normalizeInputRecord,
  normalizeOptionalString,
  normalizeUpstreamUserReference
} from '../core/utils.ts';
import { authorizeIssueProviderTool } from './authorize.ts';
import { buildIssueSyncPresentation } from '../data/issue-presenters.ts';
import { addUpstreamCommentForProvider, searchProviderUsers } from '../providers/provider-actions.ts';

export function registerIssueProviderAgentTools(ctx: PluginSetupContext): void {
  ctx.tools.register(
    'get_upstream_issue',
    getIssueProviderAgentToolDeclaration('get_upstream_issue'),
    async (params: unknown, runCtx: ToolRunContext) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        if (!paperclipIssueId) {
          throw new Error('paperclipIssueId is required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx as any, paperclipIssueId, { requireLinkedIssue: true });
        const detail = await buildIssueSyncPresentation(ctx, runCtx.companyId, paperclipIssueId);
        const upstreamStatus = detail.upstreamStatus as { name?: string; category?: string } | undefined;

        return buildToolSuccess(
          detail,
          buildToolContent('Upstream issue loaded.', [
            typeof detail.upstreamIssueKey === 'string' ? `Issue: ${detail.upstreamIssueKey}` : '',
            typeof detail.openInProviderUrl === 'string' ? `URL: ${detail.openInProviderUrl}` : '',
            upstreamStatus?.name ? `Status: ${upstreamStatus.name}${upstreamStatus.category ? ` (${upstreamStatus.category})` : ''}` : ''
          ])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'list_upstream_comments',
    getIssueProviderAgentToolDeclaration('list_upstream_comments'),
    async (params: unknown, runCtx: ToolRunContext) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        if (!paperclipIssueId) {
          throw new Error('paperclipIssueId is required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx as any, paperclipIssueId, { requireLinkedIssue: true });
        const detail = await buildIssueSyncPresentation(ctx, runCtx.companyId, paperclipIssueId);
        const comments = Array.isArray(detail.upstreamComments) ? detail.upstreamComments : [];

        return buildToolSuccess(
          { paperclipIssueId, comments },
          buildToolContent('Upstream comments loaded.', [`Comments: ${comments.length}`])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'add_upstream_comment',
    getIssueProviderAgentToolDeclaration('add_upstream_comment'),
    async (params: unknown, runCtx: ToolRunContext) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const body = typeof record.body === 'string' ? record.body.trim() : '';
        if (!paperclipIssueId || !body) {
          throw new Error('paperclipIssueId and body are required.');
        }

        const authorized = await authorizeIssueProviderTool(ctx, runCtx as any, paperclipIssueId, { requireLinkedIssue: true });
        const result = await addUpstreamCommentForProvider(
          ctx,
          authorized.link?.providerId ?? authorized.mapping.providerId,
          authorized.link!.jiraIssueKey,
          body
        );

        return buildToolSuccess(
          { paperclipIssueId, upstreamCommentId: result.id },
          buildToolContent('Upstream comment posted.', [
            `Issue: ${authorized.link?.jiraIssueKey ?? ''}`,
            `Comment ID: ${result.id}`
          ])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'set_upstream_status',
    getIssueProviderAgentToolDeclaration('set_upstream_status'),
    async (params: unknown, runCtx: ToolRunContext) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const transitionId = normalizeOptionalString(record.transitionId);
        if (!paperclipIssueId || !transitionId) {
          throw new Error('paperclipIssueId and transitionId are required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx as any, paperclipIssueId, { requireLinkedIssue: true });
        const result = await setUpstreamIssueStatus(ctx, runCtx.companyId, paperclipIssueId, transitionId);
        return buildToolSuccess(result, typeof result.message === 'string' ? result.message : 'Updated upstream status.');
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'set_upstream_assignee',
    getIssueProviderAgentToolDeclaration('set_upstream_assignee'),
    async (params: unknown, runCtx: ToolRunContext) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const assignee = normalizeUpstreamUserReference(record.assignee);
        if (!paperclipIssueId || !assignee) {
          throw new Error('paperclipIssueId and assignee are required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx as any, paperclipIssueId, { requireLinkedIssue: true });
        const result = await setUpstreamIssueAssignee(ctx, runCtx.companyId, paperclipIssueId, assignee);
        return buildToolSuccess(result, typeof result.message === 'string' ? result.message : 'Updated upstream assignee.');
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'search_upstream_users',
    getIssueProviderAgentToolDeclaration('search_upstream_users'),
    async (params: unknown, runCtx: ToolRunContext) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        const query = normalizeOptionalString(record.query);
        if (!paperclipIssueId || !query) {
          throw new Error('paperclipIssueId and query are required.');
        }

        const authorized = await authorizeIssueProviderTool(ctx, runCtx as any, paperclipIssueId);
        const users = await searchProviderUsers(ctx, authorized.providerId, query);

        return buildToolSuccess(
          { paperclipIssueId, users },
          buildToolContent('Upstream users loaded.', [`Matches: ${users.length}`])
        );
      } catch (error) {
        return buildToolError(error);
      }
    }
  );

  ctx.tools.register(
    'create_upstream_issue',
    getIssueProviderAgentToolDeclaration('create_upstream_issue'),
    async (params: unknown, runCtx: ToolRunContext) => {
      try {
        const record = normalizeInputRecord(params);
        const paperclipIssueId = normalizeOptionalString(record.paperclipIssueId);
        if (!paperclipIssueId) {
          throw new Error('paperclipIssueId is required.');
        }

        await authorizeIssueProviderTool(ctx, runCtx as any, paperclipIssueId);
        const result = await pushIssueToUpstream(ctx, runCtx.companyId, paperclipIssueId);
        return buildToolSuccess(result, typeof result.message === 'string' ? result.message : 'Created upstream issue.');
      } catch (error) {
        return buildToolError(error);
      }
    }
  );
}
