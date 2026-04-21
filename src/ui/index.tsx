import React, { useEffect, useState } from 'react';
import {
  useHostContext,
  usePluginAction,
  usePluginData,
  usePluginToast
} from '@paperclipai/plugin-sdk/ui';

function cardStyle(): React.CSSProperties {
  return {
    border: '1px solid color-mix(in srgb, currentColor 14%, transparent)',
    borderRadius: 12,
    padding: 16,
    background: 'linear-gradient(180deg, color-mix(in srgb, canvas 92%, transparent), color-mix(in srgb, canvas 98%, transparent))'
  };
}

function stackStyle(gap = 12): React.CSSProperties {
  return {
    display: 'grid',
    gap
  };
}

function rowStyle(): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  };
}

function buttonStyle(variant: 'primary' | 'secondary' = 'secondary'): React.CSSProperties {
  return {
    borderRadius: 10,
    padding: '8px 12px',
    border: variant === 'primary' ? '1px solid #1d4ed8' : '1px solid color-mix(in srgb, currentColor 16%, transparent)',
    background: variant === 'primary' ? '#2563eb' : 'transparent',
    color: variant === 'primary' ? 'white' : 'inherit',
    cursor: 'pointer',
    fontWeight: 600
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    borderRadius: 10,
    border: '1px solid color-mix(in srgb, currentColor 16%, transparent)',
    padding: '10px 12px',
    background: 'transparent',
    color: 'inherit'
  };
}

function badgeStyle(tone: 'local' | 'synced' | 'info'): React.CSSProperties {
  const palette =
    tone === 'synced'
      ? { background: '#dcfce7', color: '#166534', border: '#86efac' }
      : tone === 'local'
        ? { background: '#ffedd5', color: '#9a3412', border: '#fdba74' }
        : { background: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    border: `1px solid ${palette.border}`,
    background: palette.background,
    color: palette.color,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 700
  };
}

function formatDate(value?: string | null): string {
  if (!value) {
    return 'Never';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function formatIssueStatus(value?: string | null): string {
  if (!value) {
    return 'Unknown';
  }

  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function ResultMessage(props: {
  message?: string | null;
}): React.JSX.Element | null {
  if (!props.message) {
    return null;
  }

  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 12px',
      background: 'color-mix(in srgb, currentColor 6%, transparent)',
      fontSize: 13
    }}
    >
      {props.message}
    </div>
  );
}

function useActionRunner<TParams extends Record<string, unknown>>(actionKey: string) {
  const action = usePluginAction(actionKey);
  const toast = usePluginToast();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run(params: TParams) {
    try {
      setBusy(true);
      setMessage(null);
      const result = await action(params) as { message?: string };
      const nextMessage = result?.message ?? 'Done.';
      setMessage(nextMessage);
      toast({
        title: 'Jira Sync',
        body: nextMessage,
        tone: 'success'
      });
      return result;
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Action failed.';
      setMessage(nextMessage);
      toast({
        title: 'Jira Sync',
        body: nextMessage,
        tone: 'error'
      });
      throw error;
    } finally {
      setBusy(false);
    }
  }

  return {
    run,
    busy,
    message
  };
}

export function JiraSyncSettingsPage(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const registration = usePluginData<{
    mappings: Array<{
      id: string;
      jiraProjectKey: string;
      jiraJql?: string;
      paperclipProjectId?: string;
      paperclipProjectName: string;
    }>;
    availableProjects: Array<{ id: string; name: string }>;
    configReady: boolean;
    configMessage: string;
    scheduleFrequencyMinutes: number;
    syncState?: {
      status: string;
      message?: string;
      checkedAt?: string;
    };
  }>('settings.registration', {
    companyId
  });
  const saveRegistration = useActionRunner<{
    companyId: string;
    scheduleFrequencyMinutes: number;
    mappings: Array<{
      id?: string;
      jiraProjectKey: string;
      jiraJql?: string;
      paperclipProjectId?: string;
      paperclipProjectName: string;
    }>;
  }>('settings.saveRegistration');
  const runSync = useActionRunner<{ companyId: string }>('sync.runNow');
  const projects = registration.data?.availableProjects ?? [];
  const [scheduleFrequencyMinutes, setScheduleFrequencyMinutes] = useState(15);
  const [rows, setRows] = useState<Array<{
    id: string;
    jiraProjectKey: string;
    jiraJql: string;
    paperclipProjectId: string;
    paperclipProjectName: string;
  }>>([]);

  useEffect(() => {
    if (!registration.data) {
      return;
    }

    setScheduleFrequencyMinutes(registration.data.scheduleFrequencyMinutes ?? 15);
    setRows(
      registration.data.mappings.length > 0
        ? registration.data.mappings.map((mapping) => ({
            id: mapping.id,
            jiraProjectKey: mapping.jiraProjectKey,
            jiraJql: mapping.jiraJql ?? '',
            paperclipProjectId: mapping.paperclipProjectId ?? '',
            paperclipProjectName: mapping.paperclipProjectName
          }))
        : [{
            id: 'mapping-1',
            jiraProjectKey: '',
            jiraJql: '',
            paperclipProjectId: '',
            paperclipProjectName: ''
          }]
    );
  }, [registration.data]);

  return (
    <section style={stackStyle(16)}>
      <div style={cardStyle()}>
        <div style={stackStyle(10)}>
          <div style={rowStyle()}>
            <h2 style={{ margin: 0 }}>Jira Sync</h2>
            <span style={badgeStyle(registration.data?.configReady ? 'synced' : 'local')}>
              {registration.data?.configReady ? 'Configured' : 'Needs config'}
            </span>
          </div>
          <p style={{ margin: 0, opacity: 0.8 }}>
            {registration.data?.configMessage ?? 'Loading Jira connection status...'}
          </p>
          <ResultMessage message={saveRegistration.message ?? runSync.message ?? registration.data?.syncState?.message ?? null} />
          <div style={rowStyle()}>
            <button
              type="button"
              style={buttonStyle('primary')}
              disabled={!companyId || saveRegistration.busy}
              onClick={() => void saveRegistration.run({
                companyId,
                scheduleFrequencyMinutes,
                mappings: rows
                  .filter((row) => row.jiraProjectKey.trim() && row.paperclipProjectName.trim())
                  .map((row) => ({
                    id: row.id,
                    jiraProjectKey: row.jiraProjectKey.trim().toUpperCase(),
                    jiraJql: row.jiraJql.trim() || undefined,
                    paperclipProjectId: row.paperclipProjectId.trim() || undefined,
                    paperclipProjectName: row.paperclipProjectName.trim()
                  }))
              }).then(() => registration.refresh())}
            >
              {saveRegistration.busy ? 'Saving…' : 'Save mappings'}
            </button>
            <button
              type="button"
              style={buttonStyle()}
              disabled={!companyId || runSync.busy}
              onClick={() => void runSync.run({ companyId }).then(() => registration.refresh())}
            >
              {runSync.busy ? 'Syncing…' : 'Run sync'}
            </button>
            <span style={{ fontSize: 13, opacity: 0.7 }}>
              Last sync: {formatDate(registration.data?.syncState?.checkedAt)}
            </span>
          </div>
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={stackStyle(12)}>
          <div style={rowStyle()}>
            <h3 style={{ margin: 0 }}>Schedule</h3>
          </div>
          <label style={stackStyle(6)}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Sync every N minutes</span>
            <input
              style={inputStyle()}
              type="number"
              min={1}
              max={1440}
              value={scheduleFrequencyMinutes}
              onChange={(event) => setScheduleFrequencyMinutes(Number(event.target.value) || 15)}
            />
          </label>
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={stackStyle(12)}>
          <div style={rowStyle()}>
            <h3 style={{ margin: 0 }}>Mappings</h3>
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => setRows((current) => [
                ...current,
                {
                  id: `mapping-${current.length + 1}`,
                  jiraProjectKey: '',
                  jiraJql: '',
                  paperclipProjectId: '',
                  paperclipProjectName: ''
                }
              ])}
            >
              Add mapping
            </button>
          </div>

          {rows.map((row, index) => (
            <div key={row.id} style={{
              ...cardStyle(),
              padding: 12
            }}
            >
              <div style={stackStyle(10)}>
                <div style={rowStyle()}>
                  <strong>Mapping {index + 1}</strong>
                  <button
                    type="button"
                    style={buttonStyle()}
                    onClick={() => setRows((current) => current.filter((entry) => entry.id !== row.id))}
                  >
                    Remove
                  </button>
                </div>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Jira project key</span>
                  <input
                    style={inputStyle()}
                    value={row.jiraProjectKey}
                    placeholder="GRB"
                    onChange={(event) => setRows((current) => current.map((entry) => (
                      entry.id === row.id
                        ? { ...entry, jiraProjectKey: event.target.value }
                        : entry
                    )))}
                  />
                </label>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Optional JQL override</span>
                  <input
                    style={inputStyle()}
                    value={row.jiraJql}
                    placeholder="project = GRB AND statusCategory != Done ORDER BY updated DESC"
                    onChange={(event) => setRows((current) => current.map((entry) => (
                      entry.id === row.id
                        ? { ...entry, jiraJql: event.target.value }
                        : entry
                    )))}
                  />
                </label>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Paperclip project</span>
                  <select
                    style={inputStyle()}
                    value={row.paperclipProjectId}
                    onChange={(event) => {
                      const nextProject = projects.find((project) => project.id === event.target.value);
                      setRows((current) => current.map((entry) => (
                        entry.id === row.id
                          ? {
                              ...entry,
                              paperclipProjectId: event.target.value,
                              paperclipProjectName: nextProject?.name ?? entry.paperclipProjectName
                            }
                          : entry
                      )));
                    }}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JiraSyncDashboardWidget(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const summary = usePluginData<{
    mappingCount: number;
    linkedIssueCount: number;
    syncState?: {
      status: string;
      message?: string;
      checkedAt?: string;
    };
  }>('dashboard.summary', {
    companyId
  });
  const runSync = useActionRunner<{ companyId: string }>('sync.runNow');

  return (
    <section style={cardStyle()}>
      <div style={stackStyle(12)}>
        <div style={rowStyle()}>
          <h3 style={{ margin: 0 }}>Jira Sync</h3>
          <span style={badgeStyle(summary.data?.mappingCount ? 'synced' : 'local')}>
            {summary.data?.mappingCount ? `${summary.data.mappingCount} mapping${summary.data.mappingCount === 1 ? '' : 's'}` : 'No mappings'}
          </span>
        </div>
        <div style={rowStyle()}>
          <div style={{ minWidth: 120 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Linked issues</div>
            <strong>{summary.data?.linkedIssueCount ?? 0}</strong>
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Last sync</div>
            <strong>{formatDate(summary.data?.syncState?.checkedAt)}</strong>
          </div>
        </div>
        <ResultMessage message={runSync.message ?? summary.data?.syncState?.message ?? null} />
        <button
          type="button"
          style={buttonStyle('primary')}
          disabled={!companyId || runSync.busy}
          onClick={() => void runSync.run({ companyId }).then(() => summary.refresh())}
        >
          {runSync.busy ? 'Syncing…' : 'Run Jira sync'}
        </button>
      </div>
    </section>
  );
}

export function JiraSyncIssueTaskDetailView(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const issueId = context.entityId ?? '';
  const detail = usePluginData<{
    visible: boolean;
    linked: boolean;
    localStatus?: string;
    mapping?: {
      jiraProjectKey: string;
      paperclipProjectName: string;
    };
    upstream?: {
      issueKey: string;
      jiraUrl: string;
      jiraStatusName: string;
      jiraStatusCategory: string;
      lastSyncedAt?: string;
      lastPulledAt?: string;
      lastPushedAt?: string;
      source: 'jira' | 'paperclip';
    };
  }>('issue.jiraDetails', {
    companyId,
    issueId
  });
  const pushIssue = useActionRunner<{ companyId: string; issueId: string }>('issue.pushToJira');
  const pullIssue = useActionRunner<{ companyId: string; issueId: string }>('issue.pullFromJira');

  if (!detail.data?.visible) {
    return <></>;
  }

  return (
    <section style={cardStyle()}>
      <div style={stackStyle(12)}>
        <div style={rowStyle()}>
          <h3 style={{ margin: 0 }}>Jira Sync</h3>
          <span style={badgeStyle(detail.data.linked ? 'synced' : 'local')}>
            {detail.data.linked ? 'Synced issue' : 'Pure Paperclip issue'}
          </span>
          {detail.data.upstream?.source ? (
            <span style={badgeStyle('info')}>Source: {detail.data.upstream.source}</span>
          ) : null}
        </div>

        {detail.data.linked ? (
          <div style={stackStyle(8)}>
            <div><strong>Upstream:</strong> {detail.data.upstream?.issueKey}</div>
            <div><strong>Local status:</strong> {formatIssueStatus(detail.data.localStatus)}</div>
            <div><strong>Jira status:</strong> {detail.data.upstream?.jiraStatusName} ({detail.data.upstream?.jiraStatusCategory})</div>
            <div><strong>Last sync:</strong> {formatDate(detail.data.upstream?.lastSyncedAt)}</div>
            <div><strong>Last pull:</strong> {formatDate(detail.data.upstream?.lastPulledAt)}</div>
            <div><strong>Last push:</strong> {formatDate(detail.data.upstream?.lastPushedAt)}</div>
            {detail.data.upstream?.jiraUrl ? (
              <a href={detail.data.upstream.jiraUrl} target="_blank" rel="noreferrer">Open in Jira</a>
            ) : null}
          </div>
        ) : (
          <p style={{ margin: 0, opacity: 0.8 }}>
            This issue is still local to Paperclip. Push it upstream to create the corresponding Jira issue.
          </p>
        )}

        {detail.data.mapping ? (
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Mapped to Jira project <strong>{detail.data.mapping.jiraProjectKey}</strong> from Paperclip project <strong>{detail.data.mapping.paperclipProjectName}</strong>.
          </div>
        ) : null}

        <ResultMessage message={pushIssue.message ?? pullIssue.message} />

        <div style={rowStyle()}>
          <button
            type="button"
            style={buttonStyle('primary')}
            disabled={!companyId || !issueId || pushIssue.busy}
            onClick={() => void pushIssue.run({ companyId, issueId }).then(() => detail.refresh())}
          >
            {pushIssue.busy ? 'Pushing…' : detail.data.linked ? 'Push issue changes' : 'Create in Jira'}
          </button>
          <button
            type="button"
            style={buttonStyle()}
            disabled={!detail.data.linked || !companyId || !issueId || pullIssue.busy}
            onClick={() => void pullIssue.run({ companyId, issueId }).then(() => detail.refresh())}
          >
            {pullIssue.busy ? 'Pulling…' : 'Pull from Jira'}
          </button>
        </div>
      </div>
    </section>
  );
}

export function JiraSyncCommentAnnotation(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const issueId = context.parentEntityId ?? '';
  const commentId = context.entityId ?? '';
  const annotation = usePluginData<{
    visible: boolean;
    linked: boolean;
    direction?: 'pull' | 'push' | null;
    jiraIssueKey?: string;
    lastSyncedAt?: string | null;
  }>('comment.annotation', {
    companyId,
    issueId,
    commentId
  });
  const pushComment = useActionRunner<{ companyId: string; issueId: string; commentId: string }>('comment.pushToJira');

  if (!annotation.data?.visible) {
    return <></>;
  }

  return (
    <div style={{
      ...rowStyle(),
      padding: '8px 10px',
      borderRadius: 10,
      border: '1px solid color-mix(in srgb, currentColor 12%, transparent)',
      background: 'color-mix(in srgb, currentColor 4%, transparent)'
    }}
    >
      <span style={badgeStyle(annotation.data.linked ? 'synced' : 'local')}>
        {annotation.data.linked ? `Comment ${annotation.data.direction === 'pull' ? 'imported from' : 'synced to'} Jira` : 'Comment is local'}
      </span>
      <span style={{ fontSize: 12, opacity: 0.75 }}>
        {annotation.data.jiraIssueKey ? `Issue ${annotation.data.jiraIssueKey}` : 'Jira-linked issue'}
      </span>
      <span style={{ fontSize: 12, opacity: 0.75 }}>
        Last sync: {formatDate(annotation.data.lastSyncedAt)}
      </span>
      {!annotation.data.linked ? (
        <button
          type="button"
          style={buttonStyle()}
          disabled={!companyId || !issueId || !commentId || pushComment.busy}
          onClick={() => void pushComment.run({ companyId, issueId, commentId }).then(() => annotation.refresh())}
        >
          {pushComment.busy ? 'Syncing…' : 'Push comment to Jira'}
        </button>
      ) : null}
      <ResultMessage message={pushComment.message} />
    </div>
  );
}

export function JiraSyncGlobalToolbarButton(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const runSync = useActionRunner<{ companyId: string }>('sync.runNow');

  if (!companyId) {
    return <></>;
  }

  return (
    <button
      type="button"
      style={buttonStyle()}
      disabled={runSync.busy}
      onClick={() => void runSync.run({ companyId })}
      title="Run Jira sync for the current company"
    >
      {runSync.busy ? 'Jira…' : 'Jira Sync'}
    </button>
  );
}

export function JiraSyncEntityToolbarButton(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const runSync = useActionRunner<Record<string, string | undefined>>('sync.runNow');

  if (!companyId || !context.entityId || (context.entityType !== 'project' && context.entityType !== 'issue')) {
    return <></>;
  }

  const params =
    context.entityType === 'project'
      ? { companyId, projectId: context.entityId }
      : { companyId, issueId: context.entityId };

  return (
    <button
      type="button"
      style={buttonStyle()}
      disabled={runSync.busy}
      onClick={() => void runSync.run(params)}
      title={context.entityType === 'project' ? 'Run Jira sync for this project' : 'Refresh this issue from Jira'}
    >
      {runSync.busy ? 'Jira…' : context.entityType === 'project' ? 'Sync Jira project' : 'Sync Jira issue'}
    </button>
  );
}
