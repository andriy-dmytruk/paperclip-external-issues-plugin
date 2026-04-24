import { normalizeInputRecord, normalizeOptionalString, normalizeScopeId } from '../core/utils.ts';
import {
  pullIssueFromUpstream,
  pushCommentToUpstream,
  pushIssueToUpstream,
  setUpstreamIssueAssignee,
  setUpstreamIssueStatus,
  submitIssueComment
} from './actions.ts';
import type { PluginSetupContext } from '../core/context.ts';
import { normalizeUpstreamUserReference } from '../core/utils.ts';

export function registerIssueSyncActions(ctx: PluginSetupContext): void {
  ctx.actions.register('issue.setUpstreamAssignee', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    const assignee = normalizeUpstreamUserReference(record.assignee);
    if (!companyId || !issueId || !assignee) {
      throw new Error('companyId, issueId, and assignee are required.');
    }

    return setUpstreamIssueAssignee(ctx, companyId, issueId, assignee);
  });

  ctx.actions.register('issue.pushToUpstream', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    if (!companyId || !issueId) {
      throw new Error('companyId and issueId are required.');
    }

    return pushIssueToUpstream(ctx, companyId, issueId);
  });

  ctx.actions.register('issue.pullFromUpstream', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    if (!companyId || !issueId) {
      throw new Error('companyId and issueId are required.');
    }

    return pullIssueFromUpstream(ctx, companyId, issueId);
  });

  ctx.actions.register('issue.setUpstreamStatus', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    const transitionId = normalizeOptionalString(record.transitionId);
    if (!companyId || !issueId || !transitionId) {
      throw new Error('companyId, issueId, and transitionId are required.');
    }

    return setUpstreamIssueStatus(ctx, companyId, issueId, transitionId);
  });

  ctx.actions.register('comment.pushToUpstream', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    const commentId = normalizeOptionalString(record.commentId);
    if (!companyId || !issueId || !commentId) {
      throw new Error('companyId, issueId, and commentId are required.');
    }

    return pushCommentToUpstream(ctx, companyId, issueId, commentId);
  });

  ctx.actions.register('issue.comment.submit', async (input: unknown) => {
    const record = normalizeInputRecord(input);
    const companyId = normalizeScopeId(record.companyId);
    const issueId = normalizeOptionalString(record.issueId);
    const body = typeof record.body === 'string' ? record.body : '';
    if (!companyId || !issueId) {
      throw new Error('companyId and issueId are required.');
    }

    return submitIssueComment(ctx, companyId, issueId, body);
  });
}
