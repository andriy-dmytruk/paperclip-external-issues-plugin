import React, { useEffect, useState } from 'react';
import { useHostContext, usePluginData } from '@paperclipai/plugin-sdk/ui';
import { type UpstreamUserReference } from '../../assignees.js';
import { useActionRunner } from '../../hooks.js';
import { getProviderTypeLabel } from '../../plugin-config.js';
import {
  buttonLabel,
  buttonStyle,
  formatDate,
  getOpenInProviderLabel,
  getProviderCommentPlaceholder,
  getProviderCommentsLabel,
  getProviderPlatformName,
  getProviderPostsLabel,
  getProviderUsersPlaceholder,
  getPullFromProviderLabel,
  iconButtonStyle,
  inputStyle,
  modalBackdropStyle,
  modalPanelStyle,
  providerLabel,
  renderButtonIcon,
  renderProviderIcon,
  rowStyle,
  sectionCardStyle,
  stackStyle
} from '../../primitives.js';
import type { IssueSyncPresentation } from '../../types.js';
import {
  healthBadgeStyle,
  metricCardStyle,
  neutralBadgeStyle,
  formatUpstreamStatusLabel
} from '../shared/feature-primitives.js';
import { UpstreamUserAutocomplete, ResultMessage } from '../shared/shared-controls.js';

export function JiraSyncIssueTaskDetailView(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const issueId = context.entityId ?? '';
  const detail = usePluginData<IssueSyncPresentation>('issue.syncPresentation', {
    companyId,
    issueId
  });
  const pushIssue = useActionRunner<{ companyId: string; issueId: string }>('issue.pushToUpstream');
  const pullIssue = useActionRunner<{ companyId: string; issueId: string }>('issue.pullFromUpstream');
  const setUpstreamStatus = useActionRunner<{ companyId: string; issueId: string; transitionId: string }>('issue.setUpstreamStatus');
  const setUpstreamAssignee = useActionRunner<{
    companyId: string;
    issueId: string;
    assignee: UpstreamUserReference | null;
  }>('issue.setUpstreamAssignee');
  const submitComment = useActionRunner<{
    companyId: string;
    issueId: string;
    body: string;
  }>('issue.comment.submit');
  const [commentBody, setCommentBody] = useState('');
  const [upstreamAssigneeDraft, setUpstreamAssigneeDraft] = useState<UpstreamUserReference | null>(null);
  const [showUpstreamComments, setShowUpstreamComments] = useState(false);
  const [statusEditorOpen, setStatusEditorOpen] = useState(false);
  const [statusTransitionDraft, setStatusTransitionDraft] = useState('');
  const [assigneeEditorOpen, setAssigneeEditorOpen] = useState(false);

  useEffect(() => {
    setUpstreamAssigneeDraft(null);
  }, [detail.data?.issueId, detail.data?.upstream?.jiraAssigneeDisplayName, detail.data?.upstreamProviderId]);

  useEffect(() => {
    setShowUpstreamComments(false);
  }, [detail.data?.issueId, detail.data?.upstreamIssueKey]);

  useEffect(() => {
    setStatusEditorOpen(false);
    setAssigneeEditorOpen(false);
    setStatusTransitionDraft('');
  }, [detail.data?.issueId, detail.data?.upstreamIssueKey]);

  if (!detail.data?.visible) {
    return <></>;
  }

  const providerType = detail.data.providerKey;
  const platformName = getProviderPlatformName(providerType);
  const isSynced = detail.data.isSynced;
  const upstreamCommentCount = detail.data.upstreamComments?.length ?? 0;
  const subtitleLabel = isSynced
    ? (detail.data.upstreamIssueKey ?? 'Linked upstream issue')
    : `Local issue for ${platformName}`;
  const statusValue = formatUpstreamStatusLabel(providerType, detail.data.upstreamStatus);
  const supportsIssueUpdate = detail.data.supportsIssueUpdate !== false;
  const supportsStatusUpdates = detail.data.supportsStatusUpdates !== false;
  const supportsAssignableUsers = detail.data.supportsAssignableUsers !== false;
  const supportsComments = detail.data.supportsComments !== false;

  return (
    <div style={stackStyle(14)}>
      <div style={sectionCardStyle()}>
        <div style={stackStyle(16)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={stackStyle(8)}>
              <div style={rowStyle()}>
                <h3 style={{ margin: 0 }}>External Issue Sync</h3>
                <span style={healthBadgeStyle(isSynced ? 'connected' : 'not_tested')}>
                  {isSynced ? 'Synced' : 'Local only'}
                </span>
                {providerType ? (
                  <span style={neutralBadgeStyle()}>
                    {providerLabel(providerType, getProviderTypeLabel(providerType))}
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: 14, opacity: 0.78 }}>
                {subtitleLabel}
              </div>
            </div>

            <div style={rowStyle()}>
              {detail.data.openInProviderUrl ? (
                <a
                  href={detail.data.openInProviderUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...buttonStyle('secondary'),
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {renderProviderIcon(providerType)}
                    <span>{getOpenInProviderLabel(providerType)}</span>
                  </span>
                </a>
              ) : null}
              <button
                type="button"
                style={buttonStyle('primary')}
                disabled={!companyId || !issueId || pushIssue.busy || !supportsIssueUpdate}
                onClick={() => void pushIssue.run({ companyId, issueId }).then((result) => {
                  if (result) {
                    void detail.refresh();
                  }
                })}
              >
                {buttonLabel(
                  'arrow-up',
                  pushIssue.busy
                    ? (isSynced ? 'Syncing upstream…' : 'Creating upstream…')
                    : isSynced
                      ? 'Sync upstream'
                      : 'Create upstream issue'
                )}
              </button>
              {isSynced ? (
                <button
                  type="button"
                  style={buttonStyle()}
                  disabled={!companyId || !issueId || pullIssue.busy}
                  onClick={() => void pullIssue.run({ companyId, issueId }).then((result) => {
                    if (result) {
                      void detail.refresh();
                    }
                  })}
                >
                  {buttonLabel('arrow-down', getPullFromProviderLabel(providerType, pullIssue.busy))}
                </button>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            <div style={metricCardStyle()}>
              <div style={{ ...rowStyle(), justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, opacity: 0.58, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Status</div>
                {supportsStatusUpdates && detail.data.upstreamTransitions && detail.data.upstreamTransitions.length > 0 ? (
                  <button
                    type="button"
                    style={iconButtonStyle()}
                    disabled={!companyId || !issueId || setUpstreamStatus.busy || !supportsStatusUpdates}
                    onClick={() => {
                      setStatusTransitionDraft('');
                      setStatusEditorOpen(true);
                    }}
                    aria-label="Edit status"
                    title="Edit status"
                  >
                    {renderButtonIcon('edit')}
                  </button>
                ) : null}
              </div>
              {detail.data.upstreamStatus ? (
                <strong style={{ fontSize: 16 }}>{statusValue}</strong>
              ) : (
                <strong style={{ fontSize: 16 }}>Not linked</strong>
              )}
            </div>

            <div style={metricCardStyle()}>
              <div style={{ ...rowStyle(), justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, opacity: 0.58, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Assignee</div>
                {isSynced && supportsAssignableUsers ? (
                  <button
                    type="button"
                    style={iconButtonStyle()}
                    disabled={!companyId || !issueId || !detail.data.upstreamProviderId || setUpstreamAssignee.busy || !supportsAssignableUsers}
                    onClick={() => {
                      setUpstreamAssigneeDraft(null);
                      setAssigneeEditorOpen(true);
                    }}
                    aria-label="Edit assignee"
                    title="Edit assignee"
                  >
                    {renderButtonIcon('edit')}
                  </button>
                ) : null}
              </div>
              <strong style={{ fontSize: 16 }}>{detail.data.upstream?.jiraAssigneeDisplayName ?? 'None'}</strong>
            </div>

            <div style={metricCardStyle()}>
              <div style={{ fontSize: 11, opacity: 0.58, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Creator</div>
              <strong style={{ fontSize: 16 }}>{detail.data.upstream?.jiraCreatorDisplayName ?? 'Unknown'}</strong>
            </div>

            <div style={metricCardStyle()}>
              <div style={{ fontSize: 11, opacity: 0.58, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Comments</div>
              <strong style={{ fontSize: 16 }}>{upstreamCommentCount}</strong>
            </div>

            <div style={metricCardStyle()}>
              <div style={{ fontSize: 11, opacity: 0.58, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Last synced</div>
              <strong style={{ fontSize: 16, lineHeight: 1.35 }}>{formatDate(detail.data.upstream?.lastSyncedAt)}</strong>
            </div>
          </div>
        </div>
      </div>

      <ResultMessage
        message={pushIssue.message ?? pullIssue.message ?? setUpstreamStatus.message ?? setUpstreamAssignee.message ?? submitComment.message}
        tone={
          pushIssue.tone === 'error' || pullIssue.tone === 'error' || setUpstreamStatus.tone === 'error' || setUpstreamAssignee.tone === 'error' || submitComment.tone === 'error'
            ? 'error'
            : pushIssue.tone === 'success' || pullIssue.tone === 'success' || setUpstreamStatus.tone === 'success' || setUpstreamAssignee.tone === 'success' || submitComment.tone === 'success'
              ? 'success'
              : 'default'
        }
      />

      {detail.data.isSynced && supportsComments ? (
        <div style={sectionCardStyle()}>
          <div style={stackStyle(12)}>
            <div style={rowStyle()}>
              <strong>{providerLabel(providerType, getProviderCommentsLabel(providerType), 'md')}</strong>
              <span style={{ fontSize: 12, opacity: 0.72 }}>
                {upstreamCommentCount} total
              </span>
              <button
                type="button"
                style={buttonStyle()}
                onClick={() => setShowUpstreamComments((current) => !current)}
              >
                {buttonLabel(showUpstreamComments ? 'hide' : 'eye', showUpstreamComments ? 'Hide comments' : 'Show comments')}
              </button>
            </div>
            {showUpstreamComments ? (
              <div style={stackStyle(10)}>
                {(detail.data.upstreamComments ?? []).length > 0 ? (
                  (detail.data.upstreamComments ?? []).map((comment) => (
                    <div key={comment.id} style={metricCardStyle()}>
                      <div style={rowStyle()}>
                        <strong>{comment.authorDisplayName}</strong>
                        <span style={{ fontSize: 12, opacity: 0.72 }}>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 13,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word'
                      }}
                      >
                        {comment.body || 'No comment body'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.72 }}>
                    No {getProviderCommentsLabel(providerType).toLowerCase()} are available yet.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {detail.data.isSynced ? (
        <div style={sectionCardStyle()}>
          <div style={stackStyle(12)}>
            <div style={rowStyle()}>
              <strong>Post new comment</strong>
              <span style={{ fontSize: 12, opacity: 0.72 }}>{getProviderPostsLabel(providerType)}</span>
            </div>
            <textarea
              style={{
                ...inputStyle(),
                minHeight: 108,
                resize: 'vertical'
              }}
              value={commentBody}
              placeholder={getProviderCommentPlaceholder(providerType)}
              onChange={(event) => setCommentBody(event.target.value)}
            />
            <div style={rowStyle()}>
              <button
                type="button"
                style={buttonStyle('primary')}
                disabled={!companyId || !issueId || !commentBody.trim() || submitComment.busy}
                onClick={() => {
                  void submitComment.run({
                    companyId,
                    issueId,
                    body: commentBody
                  }).then((result) => {
                    if (result) {
                      setCommentBody('');
                      void detail.refresh();
                    }
                  });
                }}
              >
                {buttonLabel('arrow-up', submitComment.busy ? 'Posting…' : 'Post comment')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {statusEditorOpen && supportsStatusUpdates && detail.data.upstreamTransitions && detail.data.upstreamTransitions.length > 0 ? (
        <div style={modalBackdropStyle()}>
          <div style={modalPanelStyle(460)}>
            <div style={stackStyle(12)}>
              <div style={rowStyle()}>
                <strong>Edit status</strong>
                {providerType ? <span style={neutralBadgeStyle()}>{providerLabel(providerType, platformName)}</span> : null}
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                Current: {statusValue}
              </div>
              <label style={stackStyle(6)}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>New status</span>
                <select
                  style={inputStyle()}
                  value={statusTransitionDraft}
                  onChange={(event) => setStatusTransitionDraft(event.target.value)}
                >
                  <option value="">Select a status</option>
                  {detail.data.upstreamTransitions.map((transition) => (
                    <option key={transition.id} value={transition.id}>{transition.name}</option>
                  ))}
                </select>
              </label>
              <div style={rowStyle()}>
                <button
                  type="button"
                  style={buttonStyle()}
                  onClick={() => {
                    setStatusEditorOpen(false);
                    setStatusTransitionDraft('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={buttonStyle('primary')}
                  disabled={!companyId || !issueId || !statusTransitionDraft || setUpstreamStatus.busy}
                  onClick={() => {
                    void setUpstreamStatus.run({
                      companyId,
                      issueId,
                      transitionId: statusTransitionDraft
                    }).then((result) => {
                      if (result) {
                        setStatusEditorOpen(false);
                        setStatusTransitionDraft('');
                        void detail.refresh();
                      }
                    });
                  }}
                >
                  {buttonLabel('save', setUpstreamStatus.busy ? 'Saving…' : 'Save status')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {assigneeEditorOpen ? (
        <div style={modalBackdropStyle()}>
          <div style={{ ...modalPanelStyle(720), overflow: 'visible' }}>
            <div style={stackStyle(12)}>
              <div style={rowStyle()}>
                <strong>Edit assignee</strong>
                {providerType ? <span style={neutralBadgeStyle()}>{providerLabel(providerType, platformName)}</span> : null}
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                Current: {detail.data.upstream?.jiraAssigneeDisplayName ?? 'None'}
              </div>
              <UpstreamUserAutocomplete
                companyId={companyId}
                providerId={detail.data.upstreamProviderId ?? null}
                label="Assignee"
                value={upstreamAssigneeDraft}
                disabled={!companyId || !issueId || !detail.data.upstreamProviderId || setUpstreamAssignee.busy}
                placeholder={getProviderUsersPlaceholder(providerType)}
                dropdownMaxHeight={240}
                hideSelectedSecondary
                onChange={(user) => {
                  setUpstreamAssigneeDraft(user);
                }}
              />
              <div style={rowStyle()}>
                <button
                  type="button"
                  style={buttonStyle()}
                  onClick={() => {
                    setAssigneeEditorOpen(false);
                    setUpstreamAssigneeDraft(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={buttonStyle('primary')}
                  disabled={!companyId || !issueId || !upstreamAssigneeDraft || setUpstreamAssignee.busy}
                  onClick={() => {
                    if (!upstreamAssigneeDraft) {
                      return;
                    }
                    void setUpstreamAssignee.run({
                      companyId,
                      issueId,
                      assignee: upstreamAssigneeDraft
                    }).then((result) => {
                      if (result) {
                        setAssigneeEditorOpen(false);
                        setUpstreamAssigneeDraft(null);
                        void detail.refresh();
                      }
                    });
                  }}
                >
                  {buttonLabel('save', setUpstreamAssignee.busy ? 'Saving…' : 'Save assignee')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
