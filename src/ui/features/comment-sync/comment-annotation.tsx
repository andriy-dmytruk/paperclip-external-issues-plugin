import React from 'react';
import { useHostContext, usePluginData } from '@paperclipai/plugin-sdk/ui';
import { useActionRunner } from '../../hooks.js';
import {
  badgeStyle,
  buildCommentOriginLabel,
  buttonLabel,
  buttonStyle,
  formatDate,
  getOpenInProviderLabel,
  getProviderPlatformName,
  panelStyle,
  rowStyle
} from '../../primitives.js';
import type { CommentSyncPresentation } from '../../types.js';
import { ResultMessage } from '../shared/shared-controls.js';

export function JiraSyncCommentAnnotation(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const issueId = context.parentEntityId ?? '';
  const commentId = context.entityId ?? '';
  const annotation = usePluginData<CommentSyncPresentation>('comment.syncPresentation', {
    companyId,
    issueId,
    commentId
  });
  const pushComment = useActionRunner<{ companyId: string; issueId: string; commentId: string }>('comment.pushToUpstream');

  if (!annotation.data?.visible) {
    return <></>;
  }

  return (
    <div style={{
      ...panelStyle(
        annotation.data.styleTone === 'synced'
          ? 'synced'
          : annotation.data.styleTone === 'local'
            ? 'local'
            : 'default'
      ),
      display: 'grid',
      gap: 10
    }}
    >
      <div style={rowStyle()}>
        <span style={badgeStyle(
          annotation.data.styleTone === 'local'
            ? 'local'
            : annotation.data.styleTone === 'info'
              ? 'info'
              : 'synced'
        )}
        >
          {annotation.data.badgeLabel ?? buildCommentOriginLabel(annotation.data.origin, annotation.data.providerKey)}
        </span>
        <span style={{ fontSize: 12, opacity: 0.78 }}>
          {buildCommentOriginLabel(annotation.data.origin, annotation.data.providerKey)}
        </span>
        {annotation.data.jiraIssueKey ? (
          <span style={badgeStyle('info')}>{annotation.data.jiraIssueKey}</span>
        ) : null}
        {annotation.data.isEditable ? <span style={badgeStyle('info')}>Editable in Paperclip</span> : null}
      </div>
      <div style={{ fontSize: 12, opacity: 0.78 }}>
        {annotation.data.syncMessage}
      </div>
      <div style={rowStyle()}>
        <span style={{ fontSize: 12, opacity: 0.75 }}>
          Last sync: {formatDate(annotation.data.lastSyncedAt)}
        </span>
        {annotation.data.upstreamCommentId ? (
          <span style={{ fontSize: 12, opacity: 0.75 }}>
            Upstream comment: {annotation.data.upstreamCommentId}
          </span>
        ) : null}
      </div>
      {annotation.data.uploadAvailable ? (
        <div style={rowStyle()}>
          <button
            type="button"
            style={buttonStyle('secondary')}
            disabled={!companyId || !issueId || !commentId || pushComment.busy}
            onClick={() => void pushComment.run({ companyId, issueId, commentId }).then((result) => {
              if (result) {
                void annotation.refresh();
              }
            })}
          >
            {buttonLabel('arrow-up', pushComment.busy ? 'Uploading…' : `Upload comment to ${getProviderPlatformName(annotation.data.providerKey)}`)}
          </button>
        </div>
      ) : null}
      {annotation.data.jiraUrl ? (
        <a
          href={annotation.data.jiraUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            ...buttonStyle('secondary'),
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          {buttonLabel('external', getOpenInProviderLabel(annotation.data.providerKey))}
        </a>
      ) : null}
      <ResultMessage
        message={pushComment.message}
        tone={pushComment.tone === 'error' ? 'error' : pushComment.tone === 'success' ? 'success' : 'default'}
      />
    </div>
  );
}
