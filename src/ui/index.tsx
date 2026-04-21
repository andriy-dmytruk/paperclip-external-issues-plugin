import React, { useEffect, useState } from 'react';
import {
  useHostContext,
  usePluginAction,
  usePluginData,
  usePluginToast
} from '@paperclipai/plugin-sdk/ui';

import {
  DEFAULT_JIRA_ISSUE_TYPE,
  hostFetchJson,
  JIRA_ISSUE_TYPE_OPTIONS,
  usePluginConfig,
  type JiraPluginConfig,
  type JiraProviderConfig
} from './plugin-config.js';

type MappingRow = {
  id: string;
  providerId: string;
  jiraProjectKey: string;
  jiraJql: string;
  paperclipProjectId: string;
  paperclipProjectName: string;
  filters: TaskFilters;
};

type TaskFilters = {
  onlyActive?: boolean;
  author?: string;
  assignee?: string;
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
};

type SyncProgressState = {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
  processedCount?: number;
  totalCount?: number;
  importedCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  failedCount?: number;
};

type ConnectionTestState = {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
};

type PopupState = {
  selectedProviderId?: string | null;
  selectedProviderKey: string;
  mappings: Array<{
    id: string;
    providerId?: string;
    jiraProjectKey: string;
    jiraJql?: string;
    paperclipProjectId?: string;
    paperclipProjectName: string;
    filters?: TaskFilters;
  }>;
  availableProjects: Array<{ id: string; name: string }>;
  providers: Array<{
    providerId: string;
    providerKey: string;
    displayName: string;
    status: string;
    configSummary?: string;
    supportsConnectionTest?: boolean;
    defaultIssueType?: string;
    tokenSaved?: boolean;
  }>;
  providerConfig?: {
    providerId?: string | null;
    providerName?: string;
    jiraBaseUrl?: string;
    jiraUserEmail?: string;
    defaultIssueType?: string;
    tokenSaved?: boolean;
  };
  scheduleFrequencyMinutes?: number;
  syncProgress: SyncProgressState;
  connectionTest: ConnectionTestState;
  configReady: boolean;
  configMessage: string;
};

type ProvidersData = {
  providers: Array<{
    providerId: string;
    providerKey: string;
    displayName: string;
    status: string;
    configSummary?: string;
    supportsConnectionTest?: boolean;
  }>;
};

type IssueSyncPresentation = {
  visible: boolean;
  isSynced: boolean;
  providerKey?: string;
  issueId?: string;
  localStatus?: string;
  upstreamIssueKey?: string | null;
  titlePrefix?: string | null;
  openInProviderUrl?: string | null;
  lastSyncedAt?: string | null;
  syncTone?: 'local' | 'synced' | 'needs_attention';
  mapping?: {
    jiraProjectKey: string;
    paperclipProjectName: string;
  };
  upstreamStatus?: {
    name: string;
    category: string;
  };
  upstreamTransitions?: Array<{
    id: string;
    name: string;
  }>;
  upstream?: {
    issueKey: string;
    jiraUrl: string;
    jiraAssigneeDisplayName?: string;
    jiraStatusName: string;
    jiraStatusCategory: string;
    lastSyncedAt?: string;
    lastPulledAt?: string;
    lastPushedAt?: string;
    source: 'jira' | 'paperclip';
  };
};

type CommentSyncPresentation = {
  visible: boolean;
  linked: boolean;
  origin: 'paperclip' | 'provider_pull' | 'provider_push';
  providerKey?: string;
  jiraIssueKey?: string;
  jiraUrl?: string;
  upstreamCommentId?: string | null;
  isEditable?: boolean;
  uploadAvailable?: boolean;
  lastSyncedAt?: string | null;
  syncMessage?: string;
};

type CleanupCandidate = {
  issueId: string;
  title: string;
  jiraIssueKey: string;
  status: string;
};

function cardStyle(): React.CSSProperties {
  return {
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 16,
    background: 'var(--card, transparent)',
    color: 'inherit'
  };
}

function panelStyle(tone: 'default' | 'synced' | 'local' = 'default'): React.CSSProperties {
  const borderColor =
    tone === 'synced'
      ? 'color-mix(in srgb, #16a34a 35%, var(--border))'
      : tone === 'local'
        ? 'color-mix(in srgb, #d97706 30%, var(--border))'
        : 'color-mix(in srgb, var(--border) 75%, transparent)';
  const background =
    tone === 'synced'
      ? 'color-mix(in srgb, #16a34a 7%, var(--card, transparent))'
      : tone === 'local'
        ? 'color-mix(in srgb, #d97706 6%, var(--card, transparent))'
        : 'color-mix(in srgb, var(--muted, #888) 16%, transparent)';

  return {
    border: `1px solid ${borderColor}`,
    borderRadius: 12,
    padding: 14,
    background
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

function buttonStyle(variant: 'primary' | 'secondary' | 'success' = 'secondary'): React.CSSProperties {
  return {
    borderRadius: 10,
    padding: '8px 14px',
    border:
      variant === 'primary'
        ? '1px solid color-mix(in srgb, #2563eb 55%, var(--border))'
        : variant === 'success'
          ? '1px solid color-mix(in srgb, #16a34a 55%, var(--border))'
          : '1px solid var(--border)',
    background:
      variant === 'primary'
        ? 'color-mix(in srgb, #2563eb 18%, var(--card, transparent))'
        : variant === 'success'
          ? 'color-mix(in srgb, #16a34a 18%, var(--card, transparent))'
          : 'var(--card, transparent)',
    color:
      variant === 'primary'
        ? '#1d4ed8'
        : variant === 'success'
          ? '#166534'
          : 'inherit',
    cursor: 'pointer',
    fontWeight: 700
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    borderRadius: 10,
    border: '1px solid var(--border)',
    padding: '10px 12px',
    background: 'var(--card, transparent)',
    color: 'inherit'
  };
}

function checkboxLabelStyle(): React.CSSProperties {
  return {
    ...rowStyle(),
    fontSize: 13,
    fontWeight: 600
  };
}

function badgeStyle(tone: 'local' | 'synced' | 'info' | 'error'): React.CSSProperties {
  const palette =
    tone === 'synced'
      ? { background: '#dcfce7', color: '#166534', border: '#86efac' }
      : tone === 'local'
        ? { background: '#ffedd5', color: '#9a3412', border: '#fdba74' }
        : tone === 'error'
          ? { background: '#fee2e2', color: '#b91c1c', border: '#fca5a5' }
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

function progressBarStyle(progressPercent: number): React.CSSProperties {
  return {
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    background: 'color-mix(in srgb, currentColor 10%, transparent)',
    position: 'relative',
    isolation: 'isolate',
    '--progress-width': `${Math.max(0, Math.min(100, progressPercent))}%`
  } as React.CSSProperties;
}

function progressFillStyle(progressPercent: number): React.CSSProperties {
  return {
    width: `${Math.max(0, Math.min(100, progressPercent))}%`,
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #2563eb, #22c55e)',
    transition: 'width 180ms ease'
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

const PAPERCLIP_STATUS_OPTIONS = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'] as const;

export function buildSyncProgressLabel(syncProgress?: SyncProgressState | null): string {
  if (!syncProgress) {
    return 'No sync has run yet.';
  }
  if (syncProgress.status === 'running') {
    if (typeof syncProgress.totalCount === 'number') {
      return `${syncProgress.processedCount ?? 0} of ${syncProgress.totalCount} issues processed`;
    }
    return 'Sync is running…';
  }
  if (syncProgress.message) {
    return syncProgress.message;
  }
  if (syncProgress.status === 'success') {
    return 'Sync finished.';
  }
  if (syncProgress.status === 'error') {
    return 'Sync failed.';
  }
  return 'Ready to sync.';
}

export function buildCommentOriginLabel(origin: CommentSyncPresentation['origin']): string {
  if (origin === 'provider_pull') {
    return 'Fetched from Jira';
  }
  if (origin === 'provider_push') {
    return 'Uploaded to Jira';
  }
  return 'Local Paperclip comment';
}

function hasLegacyProviderConfig(config: JiraPluginConfig): boolean {
  return Boolean(
    config.jiraBaseUrl
    || config.jiraUserEmail
    || config.jiraToken
    || config.jiraTokenRef
    || config.defaultIssueType
  );
}

function buildConfiguredProviders(config: JiraPluginConfig): JiraProviderConfig[] {
  if (Array.isArray(config.providers) && config.providers.length > 0) {
    return config.providers.map((provider, index) => ({
      id: provider.id || `provider-${index + 1}`,
      type: 'jira',
      name: provider.name || `Provider ${index + 1}`,
      jiraBaseUrl: provider.jiraBaseUrl,
      jiraUserEmail: provider.jiraUserEmail,
      jiraToken: provider.jiraToken,
      jiraTokenRef: provider.jiraTokenRef,
      defaultIssueType: provider.defaultIssueType || DEFAULT_JIRA_ISSUE_TYPE
    }));
  }

  if (!hasLegacyProviderConfig(config)) {
    return [];
  }

  return [{
    id: 'provider-default-jira',
    type: 'jira',
    name: 'Default Jira',
    jiraBaseUrl: config.jiraBaseUrl,
    jiraUserEmail: config.jiraUserEmail,
    jiraToken: config.jiraToken,
    jiraTokenRef: config.jiraTokenRef,
    defaultIssueType: config.defaultIssueType || DEFAULT_JIRA_ISSUE_TYPE
  }];
}

function createProviderId(): string {
  return `provider-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyProviderDraft(): JiraProviderConfig {
  return {
    id: createProviderId(),
    type: 'jira',
    name: '',
    defaultIssueType: DEFAULT_JIRA_ISSUE_TYPE
  };
}

function createEmptyMappingRow(providerId = ''): MappingRow {
  return {
    id: `mapping-${Math.random().toString(36).slice(2, 10)}`,
    providerId,
    jiraProjectKey: '',
    jiraJql: '',
    paperclipProjectId: '',
    paperclipProjectName: '',
    filters: {}
  };
}

function modalBackdropStyle(): React.CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    background: 'color-mix(in srgb, #111827 50%, transparent)',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    zIndex: 9999
  };
}

function modalPanelStyle(width = 560): React.CSSProperties {
  return {
    ...cardStyle(),
    width: `min(100%, ${width}px)`,
    maxHeight: 'min(86vh, 900px)',
    overflowY: 'auto',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)'
  };
}

function describeMappingFilters(row: MappingRow): string[] {
  const labels: string[] = [];
  if (row.filters.onlyActive) {
    labels.push('Active only');
  }
  if (row.filters.author?.trim()) {
    labels.push(`Author: ${row.filters.author.trim()}`);
  }
  if (row.filters.assignee?.trim()) {
    labels.push(`Assignee: ${row.filters.assignee.trim()}`);
  }
  if (typeof row.filters.issueNumberGreaterThan === 'number') {
    labels.push(`>${row.filters.issueNumberGreaterThan}`);
  }
  if (typeof row.filters.issueNumberLessThan === 'number') {
    labels.push(`<${row.filters.issueNumberLessThan}`);
  }
  if (row.jiraJql.trim()) {
    labels.push('Custom JQL');
  }
  return labels;
}

function ResultMessage(props: {
  message?: string | null;
  tone?: 'default' | 'success' | 'error';
}): React.JSX.Element | null {
  if (!props.message) {
    return null;
  }

  return (
    <div style={{
      borderRadius: 12,
      padding: '10px 12px',
      background:
        props.tone === 'success'
          ? 'color-mix(in srgb, #16a34a 12%, transparent)'
          : props.tone === 'error'
            ? 'color-mix(in srgb, #dc2626 10%, transparent)'
            : 'color-mix(in srgb, currentColor 6%, transparent)',
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
  const [tone, setTone] = useState<'default' | 'success' | 'error'>('default');

  async function run(params: TParams) {
    try {
      setBusy(true);
      setMessage(null);
      const result = await action(params) as { message?: string };
      const nextMessage = result?.message ?? 'Done.';
      setMessage(nextMessage);
      setTone('success');
      toast({
        title: 'Jira Sync',
        body: nextMessage,
        tone: 'success'
      });
      return result;
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Action failed.';
      setMessage(nextMessage);
      setTone('error');
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
    message,
    tone
  };
}

function SyncProgressPanel(props: {
  syncProgress?: SyncProgressState;
}): React.JSX.Element {
  const syncProgress = props.syncProgress;
  const processedCount = syncProgress?.processedCount ?? 0;
  const totalCount = syncProgress?.totalCount ?? 0;
  const percent = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  return (
    <div style={panelStyle(syncProgress?.status === 'success' ? 'synced' : 'default')}>
      <div style={stackStyle(8)}>
        <div style={rowStyle()}>
          <strong>Sync status</strong>
          <span style={badgeStyle(
            syncProgress?.status === 'success'
              ? 'synced'
              : syncProgress?.status === 'error'
                ? 'error'
                : 'info'
          )}
          >
            {syncProgress?.status ? formatIssueStatus(syncProgress.status) : 'Idle'}
          </span>
        </div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          {buildSyncProgressLabel(syncProgress)}
        </div>
        {totalCount > 0 ? (
          <div style={stackStyle(6)}>
            <div style={progressBarStyle(percent)}>
              <div style={progressFillStyle(percent)} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {percent}% complete
            </div>
          </div>
        ) : null}
        <div style={rowStyle()}>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Imported: {syncProgress?.importedCount ?? 0}</span>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Updated: {syncProgress?.updatedCount ?? 0}</span>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Skipped: {syncProgress?.skippedCount ?? 0}</span>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Failed: {syncProgress?.failedCount ?? 0}</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Last sync: {formatDate(syncProgress?.checkedAt)}
        </div>
      </div>
    </div>
  );
}

function MappingEditor(props: {
  rows: MappingRow[];
  providers: Array<{ providerId: string; displayName: string }>;
  onCreate: () => void;
  onEdit: (rowId: string) => void;
  onRemove: (rowId: string) => void;
}): React.JSX.Element {
  return (
    <div style={stackStyle(12)}>
      <div style={rowStyle()}>
        <strong>Project mappings</strong>
        <button
          type="button"
          style={buttonStyle()}
          onClick={props.onCreate}
        >
          Add mapping
        </button>
      </div>
      {props.rows.length === 0 ? (
        <div style={{ fontSize: 13, opacity: 0.72 }}>
          No mappings yet. Add one to connect a Paperclip project to an upstream Jira project.
        </div>
      ) : props.rows.map((row, index) => {
        const providerLabel = props.providers.find((provider) => provider.providerId === row.providerId)?.displayName ?? 'No provider';
        const filterLabels = describeMappingFilters(row);
        return (
          <div key={row.id} style={panelStyle()}>
            <div style={stackStyle(10)}>
              <div style={rowStyle()}>
                <strong>Mapping {index + 1}</strong>
                <span style={badgeStyle(row.providerId ? 'info' : 'local')}>{providerLabel}</span>
                <span style={badgeStyle(row.paperclipProjectId ? 'synced' : 'local')}>
                  {row.paperclipProjectName || 'No Paperclip project'}
                </span>
              </div>
              <div style={{ fontSize: 13, opacity: 0.84 }}>
                <strong>{row.jiraProjectKey || 'No Jira project key'}</strong>
                {' '}to{' '}
                <strong>{row.paperclipProjectName || 'No Paperclip project selected'}</strong>
              </div>
              {filterLabels.length > 0 ? (
                <div style={rowStyle()}>
                  {filterLabels.map((label) => (
                    <span key={label} style={badgeStyle('info')}>{label}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  No extra filters. This mapping syncs the mapped Jira project feed.
                </div>
              )}
              <div style={rowStyle()}>
                <button
                  type="button"
                  style={buttonStyle('secondary')}
                  onClick={() => props.onEdit(row.id)}
                >
                  Edit mapping
                </button>
                <button
                  type="button"
                  style={buttonStyle()}
                  onClick={() => props.onRemove(row.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SyncCenterSurface(props: {
  companyId: string;
  scopeProjectId?: string;
  scopeIssueId?: string;
  embeddedTitle?: string;
  modal?: boolean;
}): React.JSX.Element {
  const companyId = props.companyId;
  const toast = usePluginToast();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const providers = usePluginData<ProvidersData>('sync.providers', { companyId });
  const popup = usePluginData<PopupState>('sync.popupState', {
    companyId,
    providerId: selectedProviderId
  });
  const saveRegistration = useActionRunner<{
    companyId: string;
    scheduleFrequencyMinutes: number;
    mappings: Array<{
      id?: string;
      providerId?: string;
      jiraProjectKey: string;
      jiraJql?: string;
      paperclipProjectId?: string;
      paperclipProjectName: string;
      filters?: TaskFilters;
    }>;
  }>('settings.saveRegistration');
  const testConnection = useActionRunner<{
    companyId: string;
    providerId?: string;
    providerKey: string;
    config: JiraProviderConfig;
  }>('sync.provider.testConnection');
  const runSync = useActionRunner<{
    companyId: string;
    providerKey: string;
    projectId?: string;
    issueId?: string;
  }>('sync.runNow');
  const cleanupCandidates = useActionRunner<{ companyId: string }>('sync.findCleanupCandidates');
  const { configJson, loading: configLoading, saving: configSaving, error: configError, save } = usePluginConfig();
  const [scheduleFrequencyMinutes, setScheduleFrequencyMinutes] = useState(15);
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [providerDrafts, setProviderDrafts] = useState<JiraProviderConfig[]>([]);
  const [draftTokensByProviderId, setDraftTokensByProviderId] = useState<Record<string, string>>({});
  const [providerModal, setProviderModal] = useState<{
    mode: 'create' | 'edit';
    draft: JiraProviderConfig;
    token: string;
  } | null>(null);
  const [mappingModal, setMappingModal] = useState<{
    mode: 'create' | 'edit';
    draft: MappingRow;
  } | null>(null);
  const [cleanupModal, setCleanupModal] = useState<{
    mode: 'all' | 'status' | 'custom';
    status: string;
    customFilter: string;
    candidates: CleanupCandidate[];
    selectedIssueIds: string[];
  } | null>(null);
  const [localResult, setLocalResult] = useState<{ message: string; tone: 'default' | 'success' | 'error' } | null>(null);
  const configuredProviders = buildConfiguredProviders(configJson);
  const selectedProvider = providerDrafts.find((provider) => provider.id === selectedProviderId) ?? providerDrafts[0];
  const selectedProviderToken = selectedProvider ? draftTokensByProviderId[selectedProvider.id] ?? '' : '';
  const selectedProviderStatus = popup.data?.providers?.find((provider) => provider.providerId === selectedProvider?.id)
    ?? providers.data?.providers?.find((provider) => provider.providerId === selectedProvider?.id);
  const visibleCleanupCandidates = cleanupModal
    ? cleanupModal.candidates.filter((candidate) => {
        if (cleanupModal.mode === 'all') {
          return true;
        }
        if (cleanupModal.mode === 'status') {
          return candidate.status === cleanupModal.status;
        }
        const term = cleanupModal.customFilter.trim().toLowerCase();
        if (!term) {
          return true;
        }
        return `${candidate.jiraIssueKey} ${candidate.title} ${candidate.status}`.toLowerCase().includes(term);
      })
    : [];

  useEffect(() => {
    const nextSelectedProviderId = popup.data?.selectedProviderId ?? providerDrafts[0]?.id ?? configuredProviders[0]?.id ?? '';
    if (nextSelectedProviderId && nextSelectedProviderId !== selectedProviderId) {
      setSelectedProviderId(nextSelectedProviderId);
    }
  }, [configuredProviders, popup.data?.selectedProviderId, providerDrafts, selectedProviderId]);

  useEffect(() => {
    setProviderDrafts(buildConfiguredProviders(configJson));
  }, [configJson]);

  useEffect(() => {
    if (!popup.data) {
      return;
    }

    setScheduleFrequencyMinutes(popup.data.scheduleFrequencyMinutes ?? 15);
    setRows(
      popup.data.mappings.length > 0
        ? popup.data.mappings.map((mapping) => ({
            id: mapping.id,
            providerId: mapping.providerId ?? (popup.data?.providers?.[0]?.providerId ?? ''),
            jiraProjectKey: mapping.jiraProjectKey,
            jiraJql: mapping.jiraJql ?? '',
            paperclipProjectId: mapping.paperclipProjectId ?? '',
            paperclipProjectName: mapping.paperclipProjectName,
            filters: {
              onlyActive: mapping.filters?.onlyActive ?? false,
              author: mapping.filters?.author ?? '',
              assignee: mapping.filters?.assignee ?? '',
              issueNumberGreaterThan: mapping.filters?.issueNumberGreaterThan,
              issueNumberLessThan: mapping.filters?.issueNumberLessThan
            }
          }))
        : [createEmptyMappingRow(popup.data.providers?.[0]?.providerId ?? providerDrafts[0]?.id ?? '')]
    );
  }, [popup.data, providerDrafts]);

  function updateSelectedProvider(patch: Partial<JiraProviderConfig>) {
    if (!selectedProvider) {
      return;
    }
    setProviderDrafts((current) => current.map((provider) => (
      provider.id === selectedProvider.id
        ? {
            ...provider,
            ...patch
          }
        : provider
    )));
  }

  function openCreateProviderModal() {
    setProviderModal({
      mode: 'create',
      draft: createEmptyProviderDraft(),
      token: ''
    });
  }

  function openEditProviderModal() {
    if (!selectedProvider) {
      setLocalResult({
        message: 'Select a provider before editing it.',
        tone: 'error'
      });
      return;
    }

    setProviderModal({
      mode: 'edit',
      draft: { ...selectedProvider },
      token: ''
    });
  }

  function saveProviderModal() {
    if (!providerModal) {
      return;
    }

    const nextProvider: JiraProviderConfig = {
      ...providerModal.draft,
      name: providerModal.draft.name.trim(),
      jiraBaseUrl: providerModal.draft.jiraBaseUrl?.trim() || undefined,
      jiraUserEmail: providerModal.draft.jiraUserEmail?.trim() || undefined,
      defaultIssueType: providerModal.draft.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE
    };

    if (!nextProvider.name) {
      setLocalResult({
        message: 'Provider name is required.',
        tone: 'error'
      });
      return;
    }

    setProviderDrafts((current) => (
      providerModal.mode === 'create'
        ? [...current, nextProvider]
        : current.map((provider) => provider.id === nextProvider.id ? nextProvider : provider)
    ));
    if (providerModal.token.trim()) {
      setDraftTokensByProviderId((current) => ({
        ...current,
        [nextProvider.id]: providerModal.token.trim()
      }));
    }
    setSelectedProviderId(nextProvider.id);
    setProviderModal(null);
  }

  function openCreateMappingModal() {
    setMappingModal({
      mode: 'create',
      draft: createEmptyMappingRow(selectedProvider?.id ?? providerDrafts[0]?.id ?? popup.data?.providers?.[0]?.providerId ?? '')
    });
  }

  function openEditMappingModal(rowId: string) {
    const row = rows.find((entry) => entry.id === rowId);
    if (!row) {
      return;
    }

    setMappingModal({
      mode: 'edit',
      draft: {
        ...row,
        filters: { ...row.filters }
      }
    });
  }

  function saveMappingModal() {
    if (!mappingModal) {
      return;
    }

    const nextRow: MappingRow = {
      ...mappingModal.draft,
      jiraProjectKey: mappingModal.draft.jiraProjectKey.trim().toUpperCase(),
      jiraJql: mappingModal.draft.jiraJql,
      paperclipProjectName: mappingModal.draft.paperclipProjectName,
      filters: { ...mappingModal.draft.filters }
    };

    setRows((current) => (
      mappingModal.mode === 'create'
        ? [...current, nextRow]
        : current.map((row) => row.id === nextRow.id ? nextRow : row)
    ));
    setMappingModal(null);
  }

  async function handleSaveAllSettings() {
    const nextProviders = providerDrafts
      .filter((provider) => provider.name.trim())
      .map((provider) => {
        const existingProvider = configuredProviders.find((entry) => entry.id === provider.id);
        const replacementToken = draftTokensByProviderId[provider.id]?.trim();
        const tokenRef = provider.jiraTokenRef?.trim() || undefined;
        return {
          id: provider.id,
          type: 'jira' as const,
          name: provider.name.trim(),
          jiraBaseUrl: provider.jiraBaseUrl?.trim() || undefined,
          jiraUserEmail: provider.jiraUserEmail?.trim() || undefined,
          defaultIssueType: provider.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE,
          ...(replacementToken
            ? { jiraToken: replacementToken, jiraTokenRef: undefined }
            : tokenRef
              ? { jiraTokenRef: tokenRef }
              : existingProvider?.jiraToken
                ? { jiraToken: existingProvider.jiraToken }
                : existingProvider?.jiraTokenRef
                  ? { jiraTokenRef: existingProvider.jiraTokenRef }
                  : {})
        };
      });

    const nextConfig: JiraPluginConfig = {
      ...configJson,
      providers: nextProviders,
      jiraBaseUrl: undefined,
      jiraUserEmail: undefined,
      jiraToken: undefined,
      jiraTokenRef: undefined,
      defaultIssueType: undefined
    };

    await save(nextConfig);
    setDraftTokensByProviderId({});
    await saveRegistration.run({
      companyId,
      scheduleFrequencyMinutes,
      mappings: rows
        .filter((row) => row.providerId.trim() && row.jiraProjectKey.trim() && row.paperclipProjectName.trim())
        .map((row) => ({
          id: row.id,
          providerId: row.providerId.trim(),
          jiraProjectKey: row.jiraProjectKey.trim().toUpperCase(),
          jiraJql: row.jiraJql.trim() || undefined,
          paperclipProjectId: row.paperclipProjectId.trim() || undefined,
          paperclipProjectName: row.paperclipProjectName.trim(),
          filters: {
            ...(row.filters.onlyActive ? { onlyActive: true } : {}),
            ...(row.filters.author?.trim() ? { author: row.filters.author.trim() } : {}),
            ...(row.filters.assignee?.trim() ? { assignee: row.filters.assignee.trim() } : {}),
            ...(typeof row.filters.issueNumberGreaterThan === 'number' ? { issueNumberGreaterThan: row.filters.issueNumberGreaterThan } : {}),
            ...(typeof row.filters.issueNumberLessThan === 'number' ? { issueNumberLessThan: row.filters.issueNumberLessThan } : {})
          }
        }))
    });
    setLocalResult({
      message: 'Saved provider and mapping settings.',
      tone: 'success'
    });
    await popup.refresh();
    await providers.refresh();
  }

  async function handleTestConnection() {
    if (!selectedProvider) {
      setLocalResult({
        message: 'Create or select a provider before testing the connection.',
        tone: 'error'
      });
      return;
    }

    await testConnection.run({
      companyId,
      providerId: selectedProvider.id,
      providerKey: 'jira',
      config: {
        ...selectedProvider,
        jiraBaseUrl: selectedProvider.jiraBaseUrl?.trim() || undefined,
        jiraUserEmail: selectedProvider.jiraUserEmail?.trim() || undefined,
        defaultIssueType: selectedProvider.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE,
        ...(selectedProviderToken.trim() ? { jiraToken: selectedProviderToken.trim(), jiraTokenRef: undefined } : {}),
        ...(selectedProvider.jiraTokenRef?.trim() ? { jiraTokenRef: selectedProvider.jiraTokenRef.trim() } : {})
      }
    });
    await providers.refresh();
    await popup.refresh();
  }

  async function handleRunSync() {
    await handleSaveAllSettings();
    await runSync.run({
      companyId,
      providerKey: 'jira',
      ...(props.scopeProjectId ? { projectId: props.scopeProjectId } : {}),
      ...(props.scopeIssueId ? { issueId: props.scopeIssueId } : {})
    });
    await popup.refresh();
  }

  async function handleCleanup() {
    await handleSaveAllSettings();
    const result = await cleanupCandidates.run({ companyId }) as {
      candidates?: CleanupCandidate[];
      count?: number;
      message?: string;
    };
    const candidates = result.candidates ?? [];
    const defaultSelected = candidates
      .filter((candidate) => candidate.status === 'backlog')
      .map((candidate) => candidate.issueId);
    setCleanupModal({
      mode: 'status',
      status: 'backlog',
      customFilter: '',
      candidates,
      selectedIssueIds: defaultSelected
    });
  }

  async function applyCleanupSelection() {
    if (!cleanupModal) {
      return;
    }

    const hiddenAt = new Date().toISOString();
    for (const issueId of cleanupModal.selectedIssueIds) {
      await hostFetchJson(`/api/issues/${issueId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          hiddenAt
        })
      });
    }

    const message = `Hid ${cleanupModal.selectedIssueIds.length} imported issue${cleanupModal.selectedIssueIds.length === 1 ? '' : 's'} in Paperclip.`;
    setCleanupModal(null);
    setLocalResult({
      message,
      tone: 'success'
    });
    toast({
      title: 'Issue Sync',
      body: message,
      tone: 'success'
    });
    await popup.refresh();
  }

  const panel = (
    <section style={{
      ...cardStyle(),
      ...(props.modal
        ? {
            width: 'min(100%, 980px)',
            maxHeight: 'min(82vh, 980px)',
            overflowY: 'auto',
            padding: 18
          }
        : {})
    }}
    >
      <div style={stackStyle(16)}>
        <div style={rowStyle()}>
          <div style={{ display: 'grid', gap: 4, flex: '1 1 260px' }}>
            <h3 style={{ margin: 0 }}>{props.embeddedTitle ?? 'Issue Sync'}</h3>
            <span style={{ fontSize: 13, opacity: 0.78 }}>
              Configure the provider, test the connection, choose filters, and run issue sync from one place.
            </span>
          </div>
          <span style={badgeStyle(popup.data?.configReady ? 'synced' : 'local')}>
            {popup.data?.configReady ? 'Configured' : 'Needs config'}
          </span>
        </div>

        <ResultMessage
          message={
            configError
            || localResult?.message
            || saveRegistration.message
            || testConnection.message
            || runSync.message
            || cleanupCandidates.message
            || popup.data?.connectionTest?.message
            || popup.data?.configMessage
          }
          tone={
            configError
            || localResult?.tone === 'error'
            || saveRegistration.tone === 'error'
            || testConnection.tone === 'error'
            || runSync.tone === 'error'
            || cleanupCandidates.tone === 'error'
            || popup.data?.connectionTest?.status === 'error'
              ? 'error'
              : localResult?.tone === 'success'
                || saveRegistration.tone === 'success'
                || testConnection.tone === 'success'
                || runSync.tone === 'success'
                || cleanupCandidates.tone === 'success'
                || popup.data?.connectionTest?.status === 'success'
                  ? 'success'
                  : 'default'
          }
        />

        <div style={panelStyle()}>
          <div style={stackStyle(12)}>
            <div style={rowStyle()}>
              <strong>Providers</strong>
              {selectedProviderStatus ? (
                <span style={badgeStyle(
                  selectedProviderStatus.status === 'connected' || selectedProviderStatus.status === 'configured'
                    ? 'synced'
                    : 'local'
                )}
                >
                  {selectedProviderStatus.status === 'connected' ? 'Connected' : selectedProviderStatus.status}
                </span>
              ) : null}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'end' }}>
              <label style={stackStyle(6)}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Saved provider</span>
                <select
                  style={inputStyle()}
                  value={selectedProvider?.id ?? ''}
                  onChange={(event) => setSelectedProviderId(event.target.value)}
                >
                  <option value="">Select provider</option>
                  {providerDrafts.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name || 'Untitled provider'}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={rowStyle()}>
              <button
                type="button"
                style={buttonStyle('primary')}
                onClick={openCreateProviderModal}
              >
                Create new
              </button>
              <button
                type="button"
                style={buttonStyle('secondary')}
                disabled={!selectedProvider}
                onClick={openEditProviderModal}
              >
                Edit selected
              </button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {selectedProviderStatus?.configSummary ?? 'Create a provider to start syncing.'}
            </div>
          </div>
        </div>

        <div style={panelStyle()}>
          <div style={stackStyle(12)}>
            <label style={stackStyle(6)}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Scheduled sync cadence (minutes)</span>
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

        <div style={panelStyle()}>
          <div style={stackStyle(12)}>
            <strong>Project mappings</strong>
            <MappingEditor
              rows={rows}
              providers={(popup.data?.providers ?? []).map((provider) => ({
                providerId: provider.providerId,
                displayName: provider.displayName
              }))}
                onCreate={openCreateMappingModal}
                onEdit={openEditMappingModal}
                onRemove={(rowId) => setRows((current) => current.filter((row) => row.id !== rowId))}
            />
          </div>
        </div>

        <div style={panelStyle()}>
          <div style={stackStyle(12)}>
            <strong>Actions</strong>
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              Sync always uses the latest saved providers and mappings. "Sync now" saves first and then runs.
            </div>
            <div style={rowStyle()}>
              <button
                type="button"
                style={buttonStyle('primary')}
                disabled={saveRegistration.busy || configSaving}
                onClick={() => void handleSaveAllSettings()}
              >
                {saveRegistration.busy || configSaving ? 'Saving…' : 'Save settings'}
              </button>
              <button
                type="button"
                style={buttonStyle('success')}
                disabled={runSync.busy || saveRegistration.busy || configSaving}
                onClick={() => void handleRunSync()}
              >
                {runSync.busy ? 'Syncing…' : 'Sync now'}
              </button>
              <button
                type="button"
                style={buttonStyle()}
                disabled={cleanupCandidates.busy || saveRegistration.busy || configSaving}
                onClick={() => void handleCleanup()}
              >
                {cleanupCandidates.busy ? 'Preparing…' : 'Hide imported issues'}
              </button>
            </div>
          </div>
        </div>

        <SyncProgressPanel syncProgress={popup.data?.syncProgress} />
        {providerModal ? (
          <div style={modalBackdropStyle()}>
            <div style={modalPanelStyle(560)}>
              <div style={stackStyle(12)}>
                <div style={rowStyle()}>
                  <strong>{providerModal.mode === 'create' ? 'Create provider' : 'Edit provider'}</strong>
                  <span style={badgeStyle('info')}>Jira</span>
                  {providerModal.mode === 'edit' && (providerModal.draft.jiraToken || providerModal.draft.jiraTokenRef || popup.data?.providerConfig?.tokenSaved)
                    ? <span style={badgeStyle('info')}>Token already saved</span>
                    : null}
                </div>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Provider name</span>
                  <input
                    style={inputStyle()}
                    value={providerModal.draft.name}
                    placeholder="Oracle Jira"
                    onChange={(event) => setProviderModal((current) => current ? {
                      ...current,
                      draft: { ...current.draft, name: event.target.value }
                    } : null)}
                  />
                </label>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Jira base URL</span>
                  <input
                    style={inputStyle()}
                    value={providerModal.draft.jiraBaseUrl ?? ''}
                    placeholder="https://jira.example.com"
                    onChange={(event) => setProviderModal((current) => current ? {
                      ...current,
                      draft: { ...current.draft, jiraBaseUrl: event.target.value }
                    } : null)}
                  />
                </label>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Use only the Jira host, for example <code>https://jira.example.com</code>. Project keys belong on mappings.
                </div>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Jira user email</span>
                  <input
                    style={inputStyle()}
                    value={providerModal.draft.jiraUserEmail ?? ''}
                    placeholder="Optional for Basic auth Jira setups"
                    onChange={(event) => setProviderModal((current) => current ? {
                      ...current,
                      draft: { ...current.draft, jiraUserEmail: event.target.value }
                    } : null)}
                  />
                </label>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Default issue type</span>
                  <select
                    style={inputStyle()}
                    value={providerModal.draft.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE}
                    onChange={(event) => setProviderModal((current) => current ? {
                      ...current,
                      draft: { ...current.draft, defaultIssueType: event.target.value }
                    } : null)}
                  >
                    {JIRA_ISSUE_TYPE_OPTIONS.map((issueType) => (
                      <option key={issueType} value={issueType}>{issueType}</option>
                    ))}
                  </select>
                </label>
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Jira API token</span>
                  <input
                    style={inputStyle()}
                    type="password"
                    value={providerModal.token}
                    placeholder={
                      providerModal.draft.jiraToken || providerModal.draft.jiraTokenRef || popup.data?.providerConfig?.tokenSaved
                        ? 'Saved token is hidden. Enter a new token only to replace it.'
                        : 'Paste Jira API token'
                    }
                    onChange={(event) => setProviderModal((current) => current ? {
                      ...current,
                      token: event.target.value
                    } : null)}
                  />
                </label>
                <div style={rowStyle()}>
                  <button
                    type="button"
                    style={buttonStyle()}
                    onClick={() => {
                      setProviderModal(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('secondary')}
                    disabled={testConnection.busy}
                    onClick={() => void testConnection.run({
                      companyId,
                      providerId: providerModal.draft.id,
                      providerKey: 'jira',
                      config: {
                        ...providerModal.draft,
                        jiraBaseUrl: providerModal.draft.jiraBaseUrl?.trim() || undefined,
                        jiraUserEmail: providerModal.draft.jiraUserEmail?.trim() || undefined,
                        defaultIssueType: providerModal.draft.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE,
                        ...(providerModal.token.trim() ? { jiraToken: providerModal.token.trim() } : {})
                      }
                    })}
                  >
                    {testConnection.busy ? 'Testing…' : 'Test connection'}
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('primary')}
                    onClick={saveProviderModal}
                  >
                    {providerModal.mode === 'create' ? 'Add provider' : 'Save provider'}
                  </button>
                  {providerModal.mode === 'edit' ? (
                    <button
                      type="button"
                      style={buttonStyle()}
                      onClick={() => {
                        const providerIdToRemove = providerModal.draft.id;
                        setProviderDrafts((current) => current.filter((provider) => provider.id !== providerIdToRemove));
                        setRows((current) => current.map((row) => (
                          row.providerId === providerIdToRemove
                            ? { ...row, providerId: '' }
                            : row
                        )));
                        setDraftTokensByProviderId((current) => {
                          const next = { ...current };
                          delete next[providerIdToRemove];
                          return next;
                        });
                        setSelectedProviderId(providerDrafts.find((provider) => provider.id !== providerIdToRemove)?.id ?? '');
                        setProviderModal(null);
                      }}
                    >
                      Remove provider
                    </button>
                  ) : null}
                </div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>
                  Provider changes stay local until you save settings.
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {mappingModal ? (
          <div style={modalBackdropStyle()}>
            <div style={modalPanelStyle(680)}>
              <div style={stackStyle(12)}>
                <div style={rowStyle()}>
                  <strong>{mappingModal.mode === 'create' ? 'Create mapping' : 'Edit mapping'}</strong>
                  <span style={badgeStyle('info')}>Jira to Paperclip</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Provider</span>
                    <select
                      style={inputStyle()}
                      value={mappingModal.draft.providerId}
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: { ...current.draft, providerId: event.target.value }
                      } : null)}
                    >
                      <option value="">Select provider</option>
                      {(popup.data?.providers ?? []).map((provider) => (
                        <option key={provider.providerId} value={provider.providerId}>{provider.displayName}</option>
                      ))}
                    </select>
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Paperclip project</span>
                    <select
                      style={inputStyle()}
                      value={mappingModal.draft.paperclipProjectId}
                      onChange={(event) => {
                        const nextProject = (popup.data?.availableProjects ?? []).find((project) => project.id === event.target.value);
                        setMappingModal((current) => current ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            paperclipProjectId: event.target.value,
                            paperclipProjectName: nextProject?.name ?? current.draft.paperclipProjectName
                          }
                        } : null);
                      }}
                    >
                      <option value="">Select project</option>
                      {(popup.data?.availableProjects ?? []).map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Jira project key</span>
                    <input
                      style={inputStyle()}
                      value={mappingModal.draft.jiraProjectKey}
                      placeholder="GRB"
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: { ...current.draft, jiraProjectKey: event.target.value }
                      } : null)}
                    />
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>JQL override</span>
                    <input
                      style={inputStyle()}
                      value={mappingModal.draft.jiraJql}
                      placeholder="project = GRB AND statusCategory != Done ORDER BY updated DESC"
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: { ...current.draft, jiraJql: event.target.value }
                      } : null)}
                    />
                  </label>
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  JQL override behaves like an advanced filter. If left empty, the mapping uses the Jira project key plus the filters below.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <label style={checkboxLabelStyle()}>
                    <input
                      type="checkbox"
                      checked={Boolean(mappingModal.draft.filters.onlyActive)}
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: {
                          ...current.draft,
                          filters: {
                            ...current.draft.filters,
                            onlyActive: event.target.checked
                          }
                        }
                      } : null)}
                    />
                    Sync only active Jira issues
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Author</span>
                    <input
                      style={inputStyle()}
                      value={mappingModal.draft.filters.author ?? ''}
                      placeholder="Optional reporter username"
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: {
                          ...current.draft,
                          filters: {
                            ...current.draft.filters,
                            author: event.target.value
                          }
                        }
                      } : null)}
                    />
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Assignee</span>
                    <input
                      style={inputStyle()}
                      value={mappingModal.draft.filters.assignee ?? ''}
                      placeholder="Optional assignee username"
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: {
                          ...current.draft,
                          filters: {
                            ...current.draft.filters,
                            assignee: event.target.value
                          }
                        }
                      } : null)}
                    />
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Issue number greater than</span>
                    <input
                      style={inputStyle()}
                      type="number"
                      min={0}
                      value={mappingModal.draft.filters.issueNumberGreaterThan ?? ''}
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: {
                          ...current.draft,
                          filters: {
                            ...current.draft.filters,
                            issueNumberGreaterThan: event.target.value ? Number(event.target.value) : undefined
                          }
                        }
                      } : null)}
                    />
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Issue number less than</span>
                    <input
                      style={inputStyle()}
                      type="number"
                      min={0}
                      value={mappingModal.draft.filters.issueNumberLessThan ?? ''}
                      onChange={(event) => setMappingModal((current) => current ? {
                        ...current,
                        draft: {
                          ...current.draft,
                          filters: {
                            ...current.draft.filters,
                            issueNumberLessThan: event.target.value ? Number(event.target.value) : undefined
                          }
                        }
                      } : null)}
                    />
                  </label>
                </div>
                <div style={rowStyle()}>
                  <button
                    type="button"
                    style={buttonStyle()}
                    onClick={() => setMappingModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('primary')}
                    onClick={saveMappingModal}
                  >
                    {mappingModal.mode === 'create' ? 'Add mapping' : 'Save mapping'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {cleanupModal ? (
          <div style={modalBackdropStyle()}>
            <div style={modalPanelStyle(720)}>
              <div style={stackStyle(12)}>
                <div style={rowStyle()}>
                  <strong>Hide imported issues</strong>
                  <span style={badgeStyle('info')}>{cleanupModal.candidates.length} candidate{cleanupModal.candidates.length === 1 ? '' : 's'}</span>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={checkboxLabelStyle()}>
                    <input
                      type="radio"
                      name="cleanup-mode"
                      checked={cleanupModal.mode === 'all'}
                      onChange={() => setCleanupModal((current) => current ? {
                        ...current,
                        mode: 'all',
                        selectedIssueIds: current.candidates.map((candidate) => candidate.issueId)
                      } : null)}
                    />
                    All imported
                  </label>
                  <label style={checkboxLabelStyle()}>
                    <input
                      type="radio"
                      name="cleanup-mode"
                      checked={cleanupModal.mode === 'status'}
                      onChange={() => setCleanupModal((current) => current ? {
                        ...current,
                        mode: 'status',
                        status: current.status || 'backlog',
                        selectedIssueIds: current.candidates.filter((candidate) => candidate.status === (current.status || 'backlog')).map((candidate) => candidate.issueId)
                      } : null)}
                    />
                    Imported with status
                  </label>
                  {cleanupModal.mode === 'status' ? (
                    <select
                      style={inputStyle()}
                      value={cleanupModal.status}
                      onChange={(event) => setCleanupModal((current) => current ? {
                        ...current,
                        status: event.target.value,
                        selectedIssueIds: current.candidates.filter((candidate) => candidate.status === event.target.value).map((candidate) => candidate.issueId)
                      } : null)}
                    >
                      {PAPERCLIP_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{formatIssueStatus(status)}</option>
                      ))}
                    </select>
                  ) : null}
                  <label style={checkboxLabelStyle()}>
                    <input
                      type="radio"
                      name="cleanup-mode"
                      checked={cleanupModal.mode === 'custom'}
                      onChange={() => setCleanupModal((current) => current ? {
                        ...current,
                        mode: 'custom',
                        selectedIssueIds: current.candidates.map((candidate) => candidate.issueId)
                      } : null)}
                    />
                    Custom filter
                  </label>
                  {cleanupModal.mode === 'custom' ? (
                    <input
                      style={inputStyle()}
                      value={cleanupModal.customFilter}
                      placeholder="Filter by Jira key, title, or Paperclip status"
                      onChange={(event) => {
                        const nextFilter = event.target.value;
                        setCleanupModal((current) => {
                          if (!current) {
                            return null;
                          }
                          const visible = current.candidates.filter((candidate) => {
                            const term = nextFilter.trim().toLowerCase();
                            if (!term) {
                              return true;
                            }
                            return `${candidate.jiraIssueKey} ${candidate.title} ${candidate.status}`.toLowerCase().includes(term);
                          });
                          return {
                            ...current,
                            customFilter: nextFilter,
                            selectedIssueIds: visible.map((candidate) => candidate.issueId)
                          };
                        });
                      }}
                    />
                  ) : null}
                </div>
                <div style={{ fontSize: 12, opacity: 0.72 }}>
                  Select the imported issues you want to hide. This only hides them in Paperclip and leaves the upstream Jira issues unchanged.
                </div>
                <div style={{ display: 'grid', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {visibleCleanupCandidates.length === 0 ? (
                    <div style={{ fontSize: 13, opacity: 0.72 }}>
                      No imported issues match the current hide filter.
                    </div>
                  ) : visibleCleanupCandidates.map((candidate) => (
                    <label key={candidate.issueId} style={{ ...panelStyle(), ...rowStyle(), alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={cleanupModal.selectedIssueIds.includes(candidate.issueId)}
                        onChange={(event) => setCleanupModal((current) => current ? {
                          ...current,
                          selectedIssueIds: event.target.checked
                            ? [...current.selectedIssueIds, candidate.issueId]
                            : current.selectedIssueIds.filter((issueId) => issueId !== candidate.issueId)
                        } : null)}
                      />
                      <div style={{ display: 'grid', gap: 4 }}>
                        <strong>{candidate.title}</strong>
                        <div style={rowStyle()}>
                          <span style={badgeStyle('info')}>{candidate.jiraIssueKey}</span>
                          <span style={badgeStyle('local')}>{formatIssueStatus(candidate.status)}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={rowStyle()}>
                  <button
                    type="button"
                    style={buttonStyle()}
                    onClick={() => setCleanupModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('primary')}
                    disabled={cleanupModal.selectedIssueIds.length === 0}
                    onClick={() => void applyCleanupSelection()}
                  >
                    Hide selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );

  return panel;
}

export function JiraSyncSettingsPage(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';

  return companyId
    ? <SyncCenterSurface companyId={companyId} embeddedTitle="Issue Sync" />
    : <></>;
}

export function JiraSyncDashboardWidget(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const summary = usePluginData<{
    mappingCount: number;
    linkedIssueCount: number;
    syncState?: SyncProgressState;
  }>('dashboard.summary', {
    companyId
  });

  if (!companyId) {
    return <></>;
  }

  return (
    <section style={cardStyle()}>
      <div style={stackStyle(12)}>
        <div style={rowStyle()}>
          <h3 style={{ margin: 0 }}>Issue Sync</h3>
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
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          {buildSyncProgressLabel(summary.data?.syncState)}
        </div>
        <div style={{ fontSize: 12, opacity: 0.72 }}>
          Use the <strong>Sync Issues</strong> button in the toolbar to open the full sync dialog.
        </div>
      </div>
    </section>
  );
}

export function JiraSyncIssueTaskDetailView(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const issueId = context.entityId ?? '';
  const detail = usePluginData<IssueSyncPresentation>('issue.syncPresentation', {
    companyId,
    issueId
  });
  const pushIssue = useActionRunner<{ companyId: string; issueId: string }>('issue.pushToJira');
  const pullIssue = useActionRunner<{ companyId: string; issueId: string }>('issue.pullFromJira');
  const setUpstreamStatus = useActionRunner<{ companyId: string; issueId: string; transitionId: string }>('issue.setUpstreamStatus');

  if (!detail.data?.visible) {
    return <></>;
  }

  return (
    <section style={cardStyle()}>
      <div style={stackStyle(14)}>
        <div style={rowStyle()}>
          <h3 style={{ margin: 0 }}>Issue Sync</h3>
          <span style={badgeStyle(detail.data.isSynced ? 'synced' : 'local')}>
            {detail.data.isSynced ? 'Synced issue' : 'Pure Paperclip issue'}
          </span>
          {detail.data.providerKey ? (
            <span style={badgeStyle('info')}>Provider: {detail.data.providerKey}</span>
          ) : null}
          {detail.data.upstreamIssueKey ? (
            <span style={badgeStyle('info')}>{detail.data.upstreamIssueKey}</span>
          ) : null}
        </div>

        <div style={panelStyle(detail.data.isSynced ? 'synced' : 'local')}>
          <div style={stackStyle(10)}>
            <div style={{ fontSize: 13, opacity: 0.82 }}>
              {detail.data.isSynced
                ? 'This issue is linked to Jira. Paperclip workflow status stays local, while Jira status is shown separately below.'
                : 'This issue is still Paperclip-only. Create it in Jira when you want to start syncing upstream.'}
            </div>
            {detail.data.titlePrefix ? (
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Fallback synced marker: <strong>{detail.data.titlePrefix}</strong>
              </div>
            ) : null}
            {detail.data.isSynced ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div style={panelStyle()}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Upstream Jira status</div>
                  {detail.data.upstreamStatus ? (
                    <div style={stackStyle(6)}>
                      <strong>{`${detail.data.upstreamStatus.name} (${detail.data.upstreamStatus.category})`}</strong>
                      {detail.data.upstreamTransitions && detail.data.upstreamTransitions.length > 0 ? (
                        <select
                          style={inputStyle()}
                          disabled={!companyId || !issueId || setUpstreamStatus.busy}
                          value=""
                          onChange={(event) => {
                            if (!event.target.value) {
                              return;
                            }
                            void setUpstreamStatus.run({
                              companyId,
                              issueId,
                              transitionId: event.target.value
                            }).then(() => detail.refresh());
                          }}
                        >
                          <option value="">Change upstream status…</option>
                          {detail.data.upstreamTransitions.map((transition) => (
                            <option key={transition.id} value={transition.id}>{transition.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: 12, opacity: 0.72 }}>No Jira transitions available.</span>
                      )}
                    </div>
                  ) : 'Not linked yet'}
                </div>
                <div style={panelStyle()}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Upstream Jira assignee</div>
                  <strong>{detail.data.upstream?.jiraAssigneeDisplayName ?? 'Unassigned'}</strong>
                </div>
              </div>
            ) : detail.data.mapping ? (
              <div style={panelStyle()}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Target Jira project</div>
                <strong>{detail.data.mapping.jiraProjectKey}</strong>
              </div>
            ) : null}
            {detail.data.mapping ? (
              <div style={{ fontSize: 13, opacity: 0.78 }}>
                Paperclip project <strong>{detail.data.mapping.paperclipProjectName}</strong> maps to Jira project <strong>{detail.data.mapping.jiraProjectKey}</strong>.
              </div>
            ) : null}
            {detail.data.upstream ? (
              <div style={rowStyle()}>
                <span style={{ fontSize: 12, opacity: 0.75 }}>Last sync: {formatDate(detail.data.upstream.lastSyncedAt)}</span>
                <span style={{ fontSize: 12, opacity: 0.75 }}>Last pull: {formatDate(detail.data.upstream.lastPulledAt)}</span>
                <span style={{ fontSize: 12, opacity: 0.75 }}>Last push: {formatDate(detail.data.upstream.lastPushedAt)}</span>
              </div>
            ) : null}
          </div>
        </div>

        <ResultMessage
          message={pushIssue.message ?? pullIssue.message ?? setUpstreamStatus.message}
          tone={
            pushIssue.tone === 'error' || pullIssue.tone === 'error' || setUpstreamStatus.tone === 'error'
              ? 'error'
              : pushIssue.tone === 'success' || pullIssue.tone === 'success' || setUpstreamStatus.tone === 'success'
                ? 'success'
                : 'default'
          }
        />

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
              Open in Jira
            </a>
          ) : null}
          <button
            type="button"
            style={buttonStyle('primary')}
            disabled={!companyId || !issueId || pushIssue.busy}
            onClick={() => void pushIssue.run({ companyId, issueId }).then(() => detail.refresh())}
          >
            {pushIssue.busy ? 'Pushing…' : detail.data.isSynced ? 'Push issue changes' : 'Create in Jira'}
          </button>
          <button
            type="button"
            style={buttonStyle()}
            disabled={!detail.data.isSynced || !companyId || !issueId || pullIssue.busy}
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
  const annotation = usePluginData<CommentSyncPresentation>('comment.syncPresentation', {
    companyId,
    issueId,
    commentId
  });
  const pushComment = useActionRunner<{ companyId: string; issueId: string; commentId: string }>('comment.uploadToProvider');

  if (!annotation.data?.visible) {
    return <></>;
  }

  return (
    <div style={{
      ...panelStyle(annotation.data.origin === 'provider_pull' ? 'synced' : annotation.data.uploadAvailable ? 'local' : 'default'),
      display: 'grid',
      gap: 10
    }}
    >
      <div style={rowStyle()}>
        <span style={badgeStyle(annotation.data.origin === 'paperclip' ? 'local' : 'synced')}>
          {buildCommentOriginLabel(annotation.data.origin)}
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
            onClick={() => void pushComment.run({ companyId, issueId, commentId }).then(() => annotation.refresh())}
          >
            {pushComment.busy ? 'Uploading…' : 'Upload comment to Jira'}
          </button>
        </div>
      ) : null}
      {annotation.data.jiraUrl ? (
        <a
          href={annotation.data.jiraUrl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12 }}
        >
          Open in Jira
        </a>
      ) : null}
      <ResultMessage
        message={pushComment.message}
        tone={pushComment.tone === 'error' ? 'error' : pushComment.tone === 'success' ? 'success' : 'default'}
      />
    </div>
  );
}

export function JiraSyncGlobalToolbarButton(): React.JSX.Element {
  return <></>;
}

export function JiraSyncEntityToolbarButton(): React.JSX.Element {
  return <></>;
}

export function JiraSyncLauncherModal(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';

  if (!companyId) {
    return <></>;
  }

  return (
    <SyncCenterSurface
      companyId={companyId}
      scopeProjectId={context.entityType === 'project' ? context.entityId ?? undefined : undefined}
      scopeIssueId={context.entityType === 'issue' ? context.entityId ?? undefined : undefined}
      embeddedTitle="Issue Sync"
      modal
    />
  );
}
