import React, { useEffect, useState } from 'react';
import {
  useHostContext,
  usePluginAction,
  usePluginData,
  usePluginToast
} from '@paperclipai/plugin-sdk/ui';

import {
  DEFAULT_JIRA_ISSUE_TYPE,
  getProviderTypeLabel,
  hostFetchJson,
  JIRA_ISSUE_TYPE_OPTIONS,
  PROVIDER_TYPE_OPTIONS,
  usePluginConfig,
  type JiraPluginConfig,
  type JiraProviderConfig,
  type ProviderType
} from './plugin-config.js';
import {
  isGitHubProviderType,
  isJiraProviderType,
  normalizeProviderConfig
} from '../providers/shared/config.ts';
import {
  formatJiraUserLabel,
  formatJiraUserSecondary,
  type JiraUserReference
} from './assignees.js';
import {
  buildProjectPageNavigationTarget,
  buildProviderDetailNavigationTarget,
  resolveInitialSyncPage,
  type SyncEntryContext,
  type SyncPageId
} from './project-bindings.js';

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
  author?: JiraUserReference;
  assignee?: JiraUserReference;
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
};

type StatusMappingRow = {
  id: string;
  jiraStatus: string;
  paperclipStatus: string;
  assigneeAgentId?: string | null;
};

type AssignableAgent = {
  id: string;
  name: string;
  title?: string | null;
  status?: string;
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
  entryContext?: SyncEntryContext | null;
  currentPage?: SyncPageId;
  selectedProjectId?: string | null;
  selectedProjectName?: string | null;
  selectedProviderId?: string | null;
  selectedProviderKey?: string | null;
  defaultAssignee?: JiraUserReference | null;
  defaultStatus?: string;
  defaultStatusAssigneeAgentId?: string | null;
  mappings: Array<{
    id: string;
    providerId?: string;
    jiraProjectKey: string;
    jiraJql?: string;
    paperclipProjectId?: string;
    paperclipProjectName: string;
    filters?: TaskFilters;
  }>;
  availableProjects: Array<{
    id: string;
    name: string;
    providerId?: string | null;
    providerDisplayName?: string | null;
    isConfigured?: boolean;
  }>;
  providers: Array<{
    providerId: string;
    providerKey: ProviderType;
    displayName: string;
    status: string;
    configSummary?: string;
    supportsConnectionTest?: boolean;
    defaultIssueType?: string;
    tokenSaved?: boolean;
  }>;
  providerTypeOptions?: Array<{
    value: ProviderType;
    label: string;
  }>;
  providerConfig?: {
    providerId?: string | null;
    providerKey?: ProviderType | null;
    providerName?: string;
    jiraBaseUrl?: string;
    jiraUserEmail?: string;
    defaultIssueType?: string;
    tokenSaved?: boolean;
  } | null;
  projectPage?: {
    projectId: string;
    projectName: string;
    selectedProviderId?: string | null;
    showProviderSelection?: boolean;
    showHideImported?: boolean;
    showProjectSettings?: boolean;
    showSyncActions?: boolean;
    navigationContext?: {
      surface?: 'global' | 'project' | 'issue';
      requiresProjectSelection?: boolean;
    };
  } | null;
  providerDirectory?: {
    providers: Array<{
      providerId: string;
      providerType: ProviderType;
      displayName: string;
      configSummary?: string;
      tokenSaved?: boolean;
    }>;
    availableProviderTypes?: Array<{
      value: ProviderType;
      label: string;
    }>;
  } | null;
  scheduleFrequencyMinutes?: number;
  syncProgress: SyncProgressState;
  connectionTest: ConnectionTestState;
  configReady: boolean;
  configMessage: string;
  projectConfig?: {
    projectId: string;
    projectName: string;
    providerId?: string | null;
    defaultAssignee?: JiraUserReference | null;
    defaultStatus?: string;
    defaultStatusAssigneeAgentId?: string | null;
    statusMappings?: StatusMappingRow[];
    scheduleFrequencyMinutes?: number;
  } | null;
};

type ProvidersData = {
  providers: Array<{
    providerId: string;
    providerKey: ProviderType;
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
  upstreamProviderId?: string | null;
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
    jiraCreatorDisplayName?: string;
    jiraStatusName: string;
    jiraStatusCategory: string;
    lastSyncedAt?: string;
    lastPulledAt?: string;
    lastPushedAt?: string;
    source: 'jira' | 'paperclip';
  };
  upstreamComments?: Array<{
    id: string;
    body: string;
    authorDisplayName: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

type CommentSyncPresentation = {
  visible: boolean;
  linked: boolean;
  origin: 'paperclip' | 'provider_pull' | 'provider_push';
  providerKey?: ProviderType;
  jiraIssueKey?: string;
  jiraUrl?: string;
  upstreamCommentId?: string | null;
  styleTone?: 'synced' | 'local' | 'info';
  badgeLabel?: string;
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

type JiraUserSearchData = {
  suggestions: JiraUserReference[];
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
    background,
    minWidth: 0
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

type ButtonIconName = 'add' | 'arrow-up' | 'arrow-down' | 'back' | 'close' | 'external' | 'eye' | 'hide' | 'save' | 'sync' | 'user';

function renderButtonIcon(icon: ButtonIconName): React.JSX.Element {
  const iconStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    display: 'inline-block',
    flex: '0 0 auto'
  };

  if (icon === 'add') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M8 3.5v9" />
        <path d="M3.5 8h9" />
      </svg>
    );
  }

  if (icon === 'arrow-up') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M8 12.5v-9" />
        <path d="M4.5 6.5 8 3l3.5 3.5" />
      </svg>
    );
  }

  if (icon === 'arrow-down') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M8 3.5v9" />
        <path d="M4.5 9.5 8 13l3.5-3.5" />
      </svg>
    );
  }

  if (icon === 'back') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M13 8H3.5" />
        <path d="M6.5 4.5 3 8l3.5 3.5" />
      </svg>
    );
  }

  if (icon === 'close') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="m4 4 8 8" />
        <path d="m12 4-8 8" />
      </svg>
    );
  }

  if (icon === 'external') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M6 4h6v6" />
        <path d="M10.5 5.5 5 11" />
        <path d="M12 9.5v2A.5.5 0 0 1 11.5 12h-7a.5.5 0 0 1-.5-.5v-7A.5.5 0 0 1 4.5 4h2" />
      </svg>
    );
  }

  if (icon === 'eye') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M1.5 8s2.3-3.5 6.5-3.5S14.5 8 14.5 8s-2.3 3.5-6.5 3.5S1.5 8 1.5 8Z" />
        <circle cx="8" cy="8" r="1.8" />
      </svg>
    );
  }

  if (icon === 'hide') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M2 2l12 12" />
        <path d="M6.2 6.2A2.5 2.5 0 0 0 9.8 9.8" />
        <path d="M3.2 5.1A12.8 12.8 0 0 0 1.5 8s2.3 3.5 6.5 3.5c1.1 0 2.1-.2 3-.6" />
        <path d="M6.8 4.7c.4-.1.8-.2 1.2-.2 4.2 0 6.5 3.5 6.5 3.5a12 12 0 0 1-1.6 2.4" />
      </svg>
    );
  }

  if (icon === 'save') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <path d="M3.5 2.5h7l2 2v9h-9Z" />
        <path d="M5 2.5v4h5v-4" />
        <path d="M5.5 12h5" />
      </svg>
    );
  }

  if (icon === 'user') {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
        <circle cx="8" cy="5.5" r="2.5" />
        <path d="M3.5 13c.7-2 2.4-3 4.5-3s3.8 1 4.5 3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={iconStyle}>
      <path d="M8 2.5v2" />
      <path d="M8 11.5v2" />
      <path d="M2.5 8h2" />
      <path d="M11.5 8h2" />
      <path d="m4.2 4.2 1.4 1.4" />
      <path d="m10.4 10.4 1.4 1.4" />
      <path d="m10.4 5.6 1.4-1.4" />
      <path d="m4.2 11.8 1.4-1.4" />
      <circle cx="8" cy="8" r="2.2" />
    </svg>
  );
}

function buttonLabel(icon: ButtonIconName, label: string): React.JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {renderButtonIcon(icon)}
      <span>{label}</span>
    </span>
  );
}

function buttonStyle(variant: 'primary' | 'secondary' | 'success' = 'secondary'): React.CSSProperties {
  void variant;
  return {
    borderRadius: 8,
    padding: '6px 10px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
    lineHeight: 1.3
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    borderRadius: 8,
    border: '1px solid var(--border)',
    padding: '8px 10px',
    background: 'var(--card, transparent)',
    color: 'inherit',
    fontSize: 13,
    lineHeight: 1.3,
    boxSizing: 'border-box'
  };
}

function checkboxLabelStyle(): React.CSSProperties {
  return {
    ...rowStyle(),
    fontSize: 13,
    fontWeight: 600
  };
}

function statusMappingHeaderCellStyle(): React.CSSProperties {
  return {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 700,
    opacity: 0.82,
    borderBottom: '1px solid var(--border)'
  };
}

function statusMappingCellStyle(): React.CSSProperties {
  return {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'top'
  };
}

function badgeStyle(tone: 'local' | 'synced' | 'info' | 'error'): React.CSSProperties {
  const palette =
    tone === 'synced'
      ? {
          background: 'color-mix(in srgb, #16a34a 12%, transparent)',
          color: 'color-mix(in srgb, #22c55e 78%, currentColor)',
          border: 'color-mix(in srgb, #16a34a 34%, var(--border))'
        }
      : tone === 'local'
        ? {
            background: 'color-mix(in srgb, #d97706 12%, transparent)',
            color: 'color-mix(in srgb, #f59e0b 76%, currentColor)',
            border: 'color-mix(in srgb, #d97706 34%, var(--border))'
          }
        : tone === 'error'
          ? {
              background: 'color-mix(in srgb, #dc2626 12%, transparent)',
              color: 'color-mix(in srgb, #f87171 76%, currentColor)',
              border: 'color-mix(in srgb, #dc2626 34%, var(--border))'
            }
          : {
              background: 'color-mix(in srgb, #2563eb 12%, transparent)',
              color: 'color-mix(in srgb, #60a5fa 76%, currentColor)',
              border: 'color-mix(in srgb, #2563eb 34%, var(--border))'
            };

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

function formatAgentOptionLabel(agent: AssignableAgent): string {
  return agent.title ? `${agent.name} (${agent.title})` : agent.name;
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
    return config.providers
      .map((provider, index) => normalizeProviderConfig({
        ...provider,
        id: provider.id || `provider-${index + 1}`,
        name: provider.name || `Provider ${index + 1}`
      }, index))
      .filter((provider): provider is JiraProviderConfig => provider !== null);
  }

  if (!hasLegacyProviderConfig(config)) {
    return [];
  }

  return [{
    id: 'provider-default-jira',
    type: 'jira_dc',
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
    type: 'jira_dc',
    name: '',
    defaultIssueType: DEFAULT_JIRA_ISSUE_TYPE
  };
}

function getProviderBaseUrl(provider: JiraProviderConfig | null | undefined): string {
  return provider && isJiraProviderType(provider.type) ? (provider.jiraBaseUrl ?? '') : '';
}

function getProviderUserEmail(provider: JiraProviderConfig | null | undefined): string {
  return provider && isJiraProviderType(provider.type) ? (provider.jiraUserEmail ?? '') : '';
}

function getProviderDefaultIssueType(provider: JiraProviderConfig | null | undefined): string {
  return provider && isJiraProviderType(provider.type) ? (provider.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE) : DEFAULT_JIRA_ISSUE_TYPE;
}

function getProviderTokenRef(provider: JiraProviderConfig | null | undefined): string | undefined {
  if (!provider) {
    return undefined;
  }

  return isJiraProviderType(provider.type) ? provider.jiraTokenRef : provider.githubTokenRef;
}

function getProviderToken(provider: JiraProviderConfig | null | undefined): string | undefined {
  if (!provider) {
    return undefined;
  }

  return isJiraProviderType(provider.type) ? provider.jiraToken : provider.githubToken;
}

function getProviderApiBase(provider: JiraProviderConfig | null | undefined): string {
  if (!provider) {
    return '';
  }

  return isJiraProviderType(provider.type)
    ? (provider.jiraBaseUrl ?? '')
    : (provider.githubApiBaseUrl ?? '');
}

function normalizeUpstreamProjectKey(value: string, providerType?: ProviderType): string {
  const trimmed = value.trim();
  return isGitHubProviderType(providerType) ? trimmed : trimmed.toUpperCase();
}

function createEmptyMappingRow(providerId = '', defaultAssignee?: JiraUserReference | null): MappingRow {
  return {
    id: `mapping-${Math.random().toString(36).slice(2, 10)}`,
    providerId,
    jiraProjectKey: '',
    jiraJql: '',
    paperclipProjectId: '',
    paperclipProjectName: '',
    filters: {
      onlyActive: true,
      ...(defaultAssignee ? { assignee: defaultAssignee } : {})
    }
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

function pageCardStyle(selected = false): React.CSSProperties {
  return {
    ...panelStyle(selected ? 'synced' : 'default'),
    display: 'grid',
    gap: 10,
    cursor: 'pointer',
    textAlign: 'left'
  };
}

function describeMappingFilters(row: MappingRow): string[] {
  const labels: string[] = [];
  if (row.filters.onlyActive) {
    labels.push('Active only');
  }
  if (row.filters.author) {
    labels.push(`Creator: ${formatJiraUserLabel(row.filters.author)}`);
  }
  if (row.filters.assignee) {
    labels.push(`Assignee: ${formatJiraUserLabel(row.filters.assignee)}`);
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

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, value]);

  return debounced;
}

function JiraUserAutocomplete(props: {
  companyId: string;
  providerId?: string | null;
  label: string;
  value?: JiraUserReference | null;
  placeholder?: string;
  disabled?: boolean;
  onChange: (user: JiraUserReference | null) => void;
}): React.JSX.Element {
  const [query, setQuery] = useState(formatJiraUserLabel(props.value));
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);
  const search = usePluginData<JiraUserSearchData>('sync.users.search', {
    companyId: props.companyId,
    providerId: props.providerId ?? undefined,
    query: props.providerId ? debouncedQuery : ''
  });

  useEffect(() => {
    const nextLabel = formatJiraUserLabel(props.value);
    if (nextLabel !== query) {
      setQuery(nextLabel);
    }
  }, [props.value]);

  const suggestions = search.data?.suggestions ?? [];
  const canSearch = Boolean(props.providerId && debouncedQuery.trim().length > 0 && !props.disabled);

  return (
    <label style={{ ...stackStyle(6), position: 'relative', zIndex: open ? 80 : 1 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{props.label}</span>
      <input
        style={inputStyle()}
        value={query}
        disabled={props.disabled}
        placeholder={props.placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            setQuery(formatJiraUserLabel(props.value));
          }, 120);
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
          if (!open) {
            setOpen(true);
          }
        }}
      />
      {props.value ? (
        <div style={{ fontSize: 12, opacity: 0.72 }}>
          {formatJiraUserSecondary(props.value) || props.value.accountId}
        </div>
      ) : null}
      {open && canSearch ? (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'calc(100% + 4px)',
          zIndex: 120,
          ...panelStyle(),
          background: 'var(--card, Canvas)',
          border: '1px solid var(--border)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.22)',
          display: 'grid',
          gap: 6,
          maxHeight: 220,
          overflowY: 'auto'
        }}
        >
          {search.loading ? (
            <div style={{ fontSize: 12, opacity: 0.72 }}>Searching Jira users…</div>
          ) : suggestions.length > 0 ? suggestions.map((suggestion) => (
            <button
              key={suggestion.accountId}
              type="button"
              style={{
                ...buttonStyle(),
                textAlign: 'left',
                justifyContent: 'flex-start',
                display: 'grid',
                gap: 2
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                props.onChange(suggestion);
                setQuery(formatJiraUserLabel(suggestion));
                setOpen(false);
              }}
            >
              <span>{formatJiraUserLabel(suggestion)}</span>
              {formatJiraUserSecondary(suggestion) ? (
                <span style={{ fontSize: 12, opacity: 0.72 }}>{formatJiraUserSecondary(suggestion)}</span>
              ) : null}
            </button>
          )) : (
            <div style={{ fontSize: 12, opacity: 0.72 }}>No Jira users match this search yet.</div>
          )}
        </div>
      ) : null}
    </label>
  );
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
  currentProjectName?: string;
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
          No mappings yet. Add one to connect this Paperclip project to an upstream Jira project.
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
                {props.currentProjectName ? (
                  <span style={badgeStyle('synced')}>{props.currentProjectName}</span>
                ) : null}
              </div>
              <div style={{ fontSize: 13, opacity: 0.84 }}>
                <strong>{row.jiraProjectKey || 'No Jira project key'}</strong>
                {' '}into{' '}
                <strong>{props.currentProjectName || row.paperclipProjectName || 'No Paperclip project selected'}</strong>
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
  settingsOnly?: boolean;
}): React.JSX.Element {
  const companyId = props.companyId;
  const toast = usePluginToast();
  const entryContext = usePluginData<SyncEntryContext>('sync.entryContext', {
    companyId,
    projectId: props.scopeProjectId,
    issueId: props.scopeIssueId
  });
  const projectList = usePluginData<{
    projects: Array<{
      projectId: string;
      projectName: string;
      providerId?: string | null;
      providerDisplayName?: string | null;
      hasImportedIssues?: boolean;
      isConfigured?: boolean;
    }>;
  }>('sync.projectList', { companyId });
  const [selectedProjectId, setSelectedProjectId] = useState<string>(props.scopeProjectId ?? '');
  const [currentPage, setCurrentPage] = useState<SyncPageId | undefined>(
    props.settingsOnly ? 'providers' : props.scopeProjectId ? 'project' : undefined
  );
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedProviderDetailId, setSelectedProviderDetailId] = useState<string | null>(null);
  const activeProjectId = props.scopeProjectId ?? selectedProjectId;
  const projectPage = usePluginData<{
    projectId: string;
    projectName: string;
    selectedProviderId?: string | null;
    showProviderSelection?: boolean;
    showHideImported?: boolean;
    showProjectSettings?: boolean;
    showSyncActions?: boolean;
    availableProviders?: Array<{
      providerId: string;
      providerKey: ProviderType;
      displayName: string;
      status: string;
      configSummary?: string;
      supportsConnectionTest?: boolean;
      defaultIssueType?: string;
      tokenSaved?: boolean;
    }>;
    providerSummary?: {
      providerId?: string | null;
      providerKey?: ProviderType | null;
      providerName?: string;
      jiraBaseUrl?: string;
      jiraUserEmail?: string;
      defaultIssueType?: string;
      githubApiBaseUrl?: string;
      defaultRepository?: string;
      tokenSaved?: boolean;
    } | null;
    projectSettings?: {
      projectId: string;
      projectName: string;
      providerId?: string | null;
      defaultAssignee?: JiraUserReference | null;
      defaultStatus?: string;
      defaultStatusAssigneeAgentId?: string | null;
      statusMappings?: StatusMappingRow[];
      scheduleFrequencyMinutes?: number;
    } | null;
    navigationContext?: SyncEntryContext | null;
    mappings: Array<{
      id: string;
      providerId?: string;
      jiraProjectKey: string;
      jiraJql?: string;
      paperclipProjectId?: string;
      paperclipProjectName: string;
      filters?: TaskFilters;
    }>;
    syncProgress?: SyncProgressState;
    connectionTest?: ConnectionTestState;
  }>('sync.projectPage', {
    companyId,
    projectId: activeProjectId || undefined,
    issueId: props.scopeIssueId
  });
  const providerDirectory = usePluginData<{
    providers: Array<{
      providerId: string;
      providerType: ProviderType;
      displayName: string;
      configSummary?: string;
      tokenSaved?: boolean;
    }>;
    availableProviderTypes?: Array<{
      value: ProviderType;
      label: string;
    }>;
  }>('settings.providerDirectory', { companyId });
  const providerDetail = usePluginData<{
    mode: 'create' | 'edit';
    providerId?: string | null;
    providerType?: ProviderType;
    fields?: {
      name?: string;
      jiraBaseUrl?: string;
      jiraUserEmail?: string;
      defaultIssueType?: string;
      githubApiBaseUrl?: string;
      defaultRepository?: string;
    };
    tokenSaved?: boolean;
    backTarget?: string;
    availableProviderTypes?: Array<{
      value: ProviderType;
      label: string;
    }>;
  }>('settings.providerDetail', {
    companyId,
    providerId: selectedProviderDetailId ?? undefined
  });
  const saveProject = useActionRunner<{
    companyId: string;
    projectId?: string;
    projectName?: string;
    providerId?: string | null;
    defaultAssignee?: JiraUserReference | null;
    defaultStatus?: string;
    defaultStatusAssigneeAgentId?: string | null;
    statusMappings?: Array<{
      jiraStatus: string;
      paperclipStatus: string;
      assigneeAgentId?: string | null;
    }>;
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
  }>('sync.project.save');
  const testConnection = useActionRunner<{
    companyId: string;
    projectId?: string;
    providerId?: string;
    providerKey?: ProviderType;
    config: JiraProviderConfig;
  }>('sync.provider.testConnection');
  const refreshIdentity = useActionRunner<{
    companyId: string;
    projectId: string;
    providerId: string;
  }>('sync.project.refreshIdentity');
  const runSync = useActionRunner<{
    companyId: string;
    providerKey?: ProviderType;
    projectId?: string;
    issueId?: string;
  }>('sync.runNow');
  const cleanupCandidates = useActionRunner<{ companyId: string; projectId?: string }>('sync.findCleanupCandidates');
  const { configJson, saving: configSaving, error: configError, save } = usePluginConfig();
  const [scheduleFrequencyMinutes, setScheduleFrequencyMinutes] = useState(15);
  const [defaultAssignee, setDefaultAssignee] = useState<JiraUserReference | null>(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [defaultStatusAssigneeAgentId, setDefaultStatusAssigneeAgentId] = useState('');
  const [statusMappings, setStatusMappings] = useState<StatusMappingRow[]>([]);
  const [assignableAgents, setAssignableAgents] = useState<AssignableAgent[]>([]);
  const [assignableAgentsError, setAssignableAgentsError] = useState<string | null>(null);
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [rowsDirty, setRowsDirty] = useState(false);
  const [draftTokensByProviderId, setDraftTokensByProviderId] = useState<Record<string, string>>({});
  const [providerDraft, setProviderDraft] = useState<JiraProviderConfig | null>(null);
  const [providerDraftToken, setProviderDraftToken] = useState('');
  const [newProviderType, setNewProviderType] = useState<ProviderType>(PROVIDER_TYPE_OPTIONS[0]);
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
  const activeProject = projectList.data?.projects?.find((project) => project.projectId === activeProjectId);
  const selectedProvider = configuredProviders.find((provider) => provider.id === selectedProviderId) ?? null;
  const selectedProviderToken = selectedProvider ? draftTokensByProviderId[selectedProvider.id] ?? '' : '';
  const selectedProviderStatus = projectPage.data?.availableProviders?.find((provider) => provider.providerId === selectedProvider?.id) ?? null;
  const providerEnabled = Boolean(selectedProviderId && selectedProvider);
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
    const nextSelectedProjectId = props.scopeProjectId ?? entryContext.data?.projectId ?? '';
    if (nextSelectedProjectId && nextSelectedProjectId !== selectedProjectId) {
      setSelectedProjectId(nextSelectedProjectId);
    }
  }, [entryContext.data?.projectId, props.scopeProjectId, selectedProjectId]);

  useEffect(() => {
    if (currentPage) {
      return;
    }

    if (entryContext.data) {
      setCurrentPage(props.settingsOnly ? 'providers' : resolveInitialSyncPage(entryContext.data));
    }
  }, [currentPage, entryContext.data, props.settingsOnly]);

  useEffect(() => {
    const nextSelectedProviderId = projectPage.data?.selectedProviderId ?? '';
    if (nextSelectedProviderId !== selectedProviderId) {
      setSelectedProviderId(nextSelectedProviderId);
    }
  }, [projectPage.data?.selectedProviderId, selectedProviderId]);

  useEffect(() => {
    let cancelled = false;

    hostFetchJson<AssignableAgent[]>(`/api/companies/${companyId}/agents`)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setAssignableAgents(
          (result ?? [])
            .filter((agent) => agent.status !== 'terminated')
            .sort((left, right) => left.name.localeCompare(right.name))
        );
        setAssignableAgentsError(null);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setAssignableAgents([]);
        setAssignableAgentsError(error instanceof Error ? error.message : 'Could not load Paperclip agents.');
      });

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    const nextProjectPage = projectPage.data;
    if (!nextProjectPage) {
      return;
    }

    setScheduleFrequencyMinutes(nextProjectPage.projectSettings?.scheduleFrequencyMinutes ?? 15);
    setDefaultAssignee(nextProjectPage.projectSettings?.defaultAssignee ?? null);
    setDefaultStatus(nextProjectPage.projectSettings?.defaultStatus ?? 'todo');
    setDefaultStatusAssigneeAgentId(nextProjectPage.projectSettings?.defaultStatusAssigneeAgentId ?? '');
    setStatusMappings(
      (nextProjectPage.projectSettings?.statusMappings ?? []).map((mapping, index) => ({
        id: mapping.id ?? `status-mapping-${index + 1}`,
        jiraStatus: mapping.jiraStatus ?? '',
        paperclipStatus: mapping.paperclipStatus ?? 'todo',
        assigneeAgentId: mapping.assigneeAgentId ?? ''
      }))
    );
    setRows(
      nextProjectPage.mappings.length > 0
        ? nextProjectPage.mappings.map((mapping) => ({
            id: mapping.id,
            providerId: mapping.providerId ?? (nextProjectPage.selectedProviderId ?? ''),
            jiraProjectKey: mapping.jiraProjectKey,
            jiraJql: mapping.jiraJql ?? '',
            paperclipProjectId: mapping.paperclipProjectId ?? '',
            paperclipProjectName: mapping.paperclipProjectName,
            filters: {
              onlyActive: mapping.filters?.onlyActive ?? true,
              author: mapping.filters?.author ?? undefined,
              assignee: mapping.filters?.assignee ?? undefined,
              issueNumberGreaterThan: mapping.filters?.issueNumberGreaterThan,
              issueNumberLessThan: mapping.filters?.issueNumberLessThan
            }
          }))
        : []
    );
    setRowsDirty(false);
  }, [activeProjectId, projectPage.data]);

  useEffect(() => {
    if (currentPage !== 'provider-detail') {
      return;
    }

    const detailFields = providerDetail.data?.fields;
    const existingProvider = selectedProviderDetailId
      ? configuredProviders.find((provider) => provider.id === selectedProviderDetailId) ?? null
      : null;
    setProviderDraft({
      ...(existingProvider ?? createEmptyProviderDraft()),
      id: existingProvider?.id ?? selectedProviderDetailId ?? createProviderId(),
      type: providerDetail.data?.providerType ?? existingProvider?.type ?? newProviderType,
      name: detailFields?.name ?? existingProvider?.name ?? '',
      ...(isGitHubProviderType(providerDetail.data?.providerType ?? existingProvider?.type ?? newProviderType)
        ? {
            githubApiBaseUrl: detailFields?.githubApiBaseUrl ?? (existingProvider && isGitHubProviderType(existingProvider.type) ? existingProvider.githubApiBaseUrl : '') ?? '',
            defaultRepository: detailFields?.defaultRepository ?? (existingProvider && isGitHubProviderType(existingProvider.type) ? existingProvider.defaultRepository : '') ?? ''
          }
        : {
            jiraBaseUrl: detailFields?.jiraBaseUrl ?? getProviderBaseUrl(existingProvider) ?? '',
            jiraUserEmail: detailFields?.jiraUserEmail ?? getProviderUserEmail(existingProvider) ?? '',
            defaultIssueType: detailFields?.defaultIssueType ?? getProviderDefaultIssueType(existingProvider)
          })
    });
    setProviderDraftToken('');
  }, [configuredProviders, currentPage, newProviderType, providerDetail.data, selectedProviderDetailId]);

  function openCreateMappingModal() {
    if (!activeProjectId) {
      setLocalResult({
        message: 'Choose a Paperclip project before adding mappings.',
        tone: 'error'
      });
      return;
    }
    setMappingModal({
      mode: 'create',
      draft: {
        ...createEmptyMappingRow(selectedProvider?.id ?? '', defaultAssignee),
        paperclipProjectId: activeProjectId,
        paperclipProjectName: activeProject?.projectName ?? projectPage.data?.projectName ?? ''
      }
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
      jiraProjectKey: normalizeUpstreamProjectKey(mappingModal.draft.jiraProjectKey, selectedProvider?.type),
      jiraJql: mappingModal.draft.jiraJql,
      paperclipProjectId: activeProjectId,
      paperclipProjectName: activeProject?.projectName ?? projectPage.data?.projectName ?? mappingModal.draft.paperclipProjectName,
      filters: { ...mappingModal.draft.filters }
    };

    setRows((current) => (
      mappingModal.mode === 'create'
        ? [...current, nextRow]
        : current.map((row) => row.id === nextRow.id ? nextRow : row)
    ));
    setRowsDirty(true);
    setMappingModal(null);
  }

  async function refreshSyncData() {
    await Promise.all([
      entryContext.refresh(),
      projectList.refresh(),
      projectPage.refresh(),
      providerDirectory.refresh(),
      providerDetail.refresh()
    ]);
  }

  async function persistProjectSettings(nextProviderId?: string | null): Promise<boolean> {
    if (!activeProjectId || !activeProject?.projectName) {
      setLocalResult({
        message: 'Choose a Paperclip project before saving sync settings.',
        tone: 'error'
      });
      return false;
    }

    const persistedMappings = projectPage.data?.mappings ?? [];
    const persistedSelectedProviderId = projectPage.data?.selectedProviderId ?? '';
    const effectiveRows = !rowsDirty && rows.length === 0 && persistedMappings.length > 0
      ? persistedMappings.map((mapping) => ({
          id: mapping.id,
          providerId: mapping.providerId ?? persistedSelectedProviderId,
          jiraProjectKey: mapping.jiraProjectKey,
          jiraJql: mapping.jiraJql ?? '',
          paperclipProjectId: mapping.paperclipProjectId ?? activeProjectId,
          paperclipProjectName: mapping.paperclipProjectName || activeProject.projectName,
          filters: {
            onlyActive: mapping.filters?.onlyActive ?? true,
            author: mapping.filters?.author ?? undefined,
            assignee: mapping.filters?.assignee ?? undefined,
            issueNumberGreaterThan: mapping.filters?.issueNumberGreaterThan,
            issueNumberLessThan: mapping.filters?.issueNumberLessThan
          }
        }))
      : rows;

    try {
      await saveProject.run({
        companyId,
        projectId: activeProjectId,
        projectName: activeProject.projectName,
        providerId: nextProviderId !== undefined ? nextProviderId : (selectedProvider?.id ?? null),
        defaultAssignee,
        defaultStatus,
        defaultStatusAssigneeAgentId: defaultStatusAssigneeAgentId || null,
        statusMappings: statusMappings
          .filter((row) => row.jiraStatus.trim())
          .map((row) => ({
            jiraStatus: row.jiraStatus.trim(),
            paperclipStatus: row.paperclipStatus,
            assigneeAgentId: row.assigneeAgentId || null
          })),
        scheduleFrequencyMinutes,
        mappings: effectiveRows
          .filter((row) => row.jiraProjectKey.trim())
          .map((row) => ({
            id: row.id,
            providerId: selectedProvider?.id ?? row.providerId.trim(),
            jiraProjectKey: row.jiraProjectKey.trim().toUpperCase(),
            jiraJql: row.jiraJql.trim() || undefined,
            paperclipProjectId: activeProjectId,
            paperclipProjectName: activeProject.projectName,
            filters: {
              ...(row.filters.onlyActive ? { onlyActive: true } : {}),
              ...(row.filters.author ? { author: row.filters.author } : {}),
              ...(row.filters.assignee ? { assignee: row.filters.assignee } : {}),
              ...(typeof row.filters.issueNumberGreaterThan === 'number' ? { issueNumberGreaterThan: row.filters.issueNumberGreaterThan } : {}),
              ...(typeof row.filters.issueNumberLessThan === 'number' ? { issueNumberLessThan: row.filters.issueNumberLessThan } : {})
            }
          }))
      });
      setLocalResult({
        message: 'Saved project sync settings.',
        tone: 'success'
      });
      setRowsDirty(false);
      await refreshSyncData();
      return true;
    } catch (error) {
      setLocalResult({
        message: error instanceof Error ? error.message : 'Could not save project sync settings.',
        tone: 'error'
      });
      return false;
    }
  }

  async function handleProviderSelection(nextProviderId: string) {
    setSelectedProviderId(nextProviderId);
    if (!activeProjectId || !activeProject) {
      return;
    }

    await persistProjectSettings(nextProviderId || null);
  }

  async function handleDisableSync() {
    if (!activeProjectId || !activeProject) {
      return;
    }

    setSelectedProviderId('');
    const saved = await persistProjectSettings(null);
    if (!saved) {
      return;
    }
    setLocalResult({
      message: 'Syncing is disabled for this project.',
      tone: 'success'
    });
  }

  async function handleSaveProviderDefinition() {
    if (!providerDraft) {
      return;
    }

    const nextProvider: JiraProviderConfig = {
      ...providerDraft,
      id: providerDraft.id || createProviderId(),
      type: providerDraft.type ?? 'jira_dc',
      name: providerDraft.name.trim()
    };
    if (isJiraProviderType(nextProvider.type)) {
      Object.assign(nextProvider, {
        jiraBaseUrl: providerDraft.jiraBaseUrl?.trim() || undefined,
        jiraUserEmail: providerDraft.jiraUserEmail?.trim() || undefined,
        defaultIssueType: providerDraft.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE
      });
    } else {
      Object.assign(nextProvider, {
        githubApiBaseUrl: providerDraft.githubApiBaseUrl?.trim() || undefined,
        defaultRepository: providerDraft.defaultRepository?.trim() || undefined
      });
    }
    if (!nextProvider.name) {
      setLocalResult({
        message: 'Provider name is required.',
        tone: 'error'
      });
      return;
    }

    const existingProvider = configuredProviders.find((entry) => entry.id === nextProvider.id);
    const replacementToken = providerDraftToken.trim();
    const tokenRef = getProviderTokenRef(existingProvider)?.trim() || undefined;
    const nextProviders = [
      ...configuredProviders.filter((provider) => provider.id !== nextProvider.id),
      {
        ...nextProvider,
        ...(replacementToken
          ? (isJiraProviderType(nextProvider.type)
              ? { jiraToken: replacementToken, jiraTokenRef: undefined }
              : { githubToken: replacementToken, githubTokenRef: undefined })
          : tokenRef
            ? (isJiraProviderType(nextProvider.type) ? { jiraTokenRef: tokenRef } : { githubTokenRef: tokenRef })
            : getProviderToken(existingProvider)
              ? (isJiraProviderType(nextProvider.type)
                  ? { jiraToken: getProviderToken(existingProvider) }
                  : { githubToken: getProviderToken(existingProvider) })
              : {})
      }
    ];

    const nextConfig: JiraPluginConfig = {
      ...configJson,
      providers: nextProviders,
      jiraBaseUrl: undefined,
      jiraUserEmail: undefined,
      jiraToken: undefined,
      jiraTokenRef: undefined,
      defaultIssueType: undefined
    };

    try {
      await save(nextConfig);
      setDraftTokensByProviderId((current) => {
        if (!replacementToken) {
          return current;
        }
        return {
          ...current,
          [nextProvider.id]: replacementToken
        };
      });
      setSelectedProviderDetailId(nextProvider.id);
      setLocalResult({
        message: `Saved ${nextProvider.name}.`,
        tone: 'success'
      });
      await refreshSyncData();
      setCurrentPage('providers');
    } catch (error) {
      setLocalResult({
        message: error instanceof Error ? error.message : 'Could not save provider.',
        tone: 'error'
      });
    }
  }

  async function handleDeleteProviderDefinition() {
    if (!providerDraft) {
      return;
    }

    const nextConfig: JiraPluginConfig = {
      ...configJson,
      providers: configuredProviders.filter((provider) => provider.id !== providerDraft.id),
      jiraBaseUrl: undefined,
      jiraUserEmail: undefined,
      jiraToken: undefined,
      jiraTokenRef: undefined,
      defaultIssueType: undefined
    };

    try {
      await save(nextConfig);
      setDraftTokensByProviderId((current) => {
        const next = { ...current };
        delete next[providerDraft.id];
        return next;
      });
      if (selectedProviderId === providerDraft.id) {
        setSelectedProviderId('');
        if (activeProjectId && activeProject) {
          await persistProjectSettings(null);
        }
      }
      setLocalResult({
        message: 'Removed provider.',
        tone: 'success'
      });
      setSelectedProviderDetailId(null);
      setCurrentPage('providers');
      await refreshSyncData();
    } catch (error) {
      setLocalResult({
        message: error instanceof Error ? error.message : 'Could not remove provider.',
        tone: 'error'
      });
    }
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
      projectId: activeProjectId || undefined,
      providerId: selectedProvider.id,
      providerKey: selectedProvider.type,
      config: isJiraProviderType(selectedProvider.type)
        ? {
            ...selectedProvider,
            jiraBaseUrl: selectedProvider.jiraBaseUrl?.trim() || undefined,
            jiraUserEmail: selectedProvider.jiraUserEmail?.trim() || undefined,
            defaultIssueType: selectedProvider.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE,
            ...(selectedProviderToken.trim() ? { jiraToken: selectedProviderToken.trim(), jiraTokenRef: undefined } : {}),
            ...(selectedProvider.jiraTokenRef?.trim() ? { jiraTokenRef: selectedProvider.jiraTokenRef.trim() } : {})
          }
        : {
            ...selectedProvider,
            githubApiBaseUrl: selectedProvider.githubApiBaseUrl?.trim() || undefined,
            defaultRepository: selectedProvider.defaultRepository?.trim() || undefined,
            ...(selectedProviderToken.trim() ? { githubToken: selectedProviderToken.trim(), githubTokenRef: undefined } : {}),
            ...(selectedProvider.githubTokenRef?.trim() ? { githubTokenRef: selectedProvider.githubTokenRef.trim() } : {})
          }
    });
    await refreshSyncData();
  }

  async function handleRunSync() {
    const saved = await persistProjectSettings();
    if (!saved || !activeProjectId) {
      return;
    }
    await runSync.run({
      companyId,
      projectId: activeProjectId,
      ...(selectedProvider?.type ? { providerKey: selectedProvider.type } : {}),
      ...(props.scopeIssueId ? { issueId: props.scopeIssueId } : {})
    });
    await refreshSyncData();
  }

  async function handleCleanup() {
    if (!activeProjectId) {
      return;
    }
    const result = await cleanupCandidates.run({ companyId, projectId: activeProjectId }) as {
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
    await refreshSyncData();
  }

  function openProject(projectId: string) {
    setSelectedProjectId(projectId);
    setCurrentPage('project');
  }

  function openProviderDirectoryPage() {
    setSelectedProviderDetailId(null);
    setCurrentPage('providers');
  }

  function openProviderDetailPage(providerId?: string) {
    setSelectedProviderDetailId(providerId ?? null);
    setCurrentPage('provider-detail');
  }

  const headerTitle =
    currentPage === 'projects'
      ? (props.embeddedTitle ?? 'Issue Sync')
        : currentPage === 'project'
          ? (projectPage.data?.projectName ?? activeProject?.projectName ?? 'Project Sync')
        : currentPage === 'providers'
          ? (props.embeddedTitle ?? 'Providers')
          : providerDetail.data?.mode === 'edit'
            ? 'Edit Provider'
            : 'New Provider';
  const headerSubtitle =
    currentPage === 'projects'
      ? 'Choose a Paperclip project first, then configure sync inside that dedicated project page.'
      : currentPage === 'project'
        ? 'Provider selection comes first. Project-specific sync settings appear only after a provider is chosen.'
        : currentPage === 'providers'
          ? 'Manage reusable upstream providers separately from individual project sync settings.'
          : 'Use the same modal shell with Back navigation instead of stacking nested popups.';
  const message =
    configError
    || localResult?.message
    || saveProject.message
    || testConnection.message
    || refreshIdentity.message
    || runSync.message
    || cleanupCandidates.message
    || projectPage.data?.connectionTest?.message;
  const messageTone =
    configError
    || localResult?.tone === 'error'
    || saveProject.tone === 'error'
    || testConnection.tone === 'error'
    || refreshIdentity.tone === 'error'
    || runSync.tone === 'error'
    || cleanupCandidates.tone === 'error'
    || projectPage.data?.connectionTest?.status === 'error'
      ? 'error'
      : localResult?.tone === 'success'
        || saveProject.tone === 'success'
        || testConnection.tone === 'success'
        || refreshIdentity.tone === 'success'
        || runSync.tone === 'success'
        || cleanupCandidates.tone === 'success'
        || projectPage.data?.connectionTest?.status === 'success'
          ? 'success'
          : 'default';

  const panel = (
    <section style={{
      ...(props.modal
        ? {
            ...cardStyle(),
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
            <h3 style={{ margin: 0 }}>{headerTitle}</h3>
            <span style={{ fontSize: 13, opacity: 0.78 }}>
              {headerSubtitle}
            </span>
          </div>
          {currentPage === 'project' && activeProject ? (
            <span style={badgeStyle(activeProject.isConfigured ? 'synced' : 'local')}>
              {activeProject.isConfigured ? 'Configured' : 'Needs provider'}
            </span>
          ) : null}
        </div>

        <div style={rowStyle()}>
          {currentPage === 'project' && (!props.scopeProjectId || entryContext.data?.requiresProjectSelection) ? (
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => setCurrentPage('projects')}
            >
              {buttonLabel('back', 'Back')}
            </button>
          ) : null}
          {currentPage === 'providers' && !props.settingsOnly ? (
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => setCurrentPage(activeProjectId ? 'project' : resolveInitialSyncPage(entryContext.data ?? {
                surface: 'global',
                requiresProjectSelection: true
              }))}
            >
              {buttonLabel('back', 'Back')}
            </button>
          ) : null}
          {currentPage === 'provider-detail' ? (
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => setCurrentPage('providers')}
            >
              {buttonLabel('back', 'Back')}
            </button>
          ) : null}
        </div>

        <ResultMessage message={message} tone={messageTone} />

        {currentPage === 'projects' ? (
          <div style={stackStyle(12)}>
            {(projectList.data?.projects ?? []).length === 0 ? (
              <div style={panelStyle()}>
                No Paperclip projects are available for sync yet.
              </div>
            ) : (projectList.data?.projects ?? []).map((project) => (
              <button
                key={project.projectId}
                type="button"
                style={pageCardStyle(project.projectId === activeProjectId)}
                onClick={() => void openProject(project.projectId)}
                data-navigation-target={buildProjectPageNavigationTarget(project.projectId)}
              >
                <div style={rowStyle()}>
                  <strong>{project.projectName}</strong>
                  <span style={badgeStyle(project.isConfigured ? 'synced' : 'local')}>
                    {project.isConfigured ? 'Configured' : 'Choose provider'}
                  </span>
                  {project.hasImportedIssues ? (
                    <span style={badgeStyle('info')}>Imported issues present</span>
                  ) : null}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {project.providerDisplayName
                    ? `Current provider: ${project.providerDisplayName}`
                    : 'No provider selected yet.'}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {currentPage === 'project' ? (
          <div style={stackStyle(14)}>
            <div style={panelStyle()}>
              <div style={stackStyle(12)}>
                <div style={rowStyle()}>
                  <strong>Provider</strong>
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
                <label style={stackStyle(6)}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Saved provider</span>
                  <select
                    style={inputStyle()}
                    value={selectedProviderId}
                    disabled={!activeProjectId}
                    onChange={(event) => void handleProviderSelection(event.target.value)}
                  >
                    <option value="">None</option>
                    {configuredProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>{provider.name || 'Untitled provider'}</option>
                    ))}
                  </select>
                </label>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {providerEnabled
                    ? (selectedProviderStatus?.configSummary ?? 'This provider is ready for project sync.')
                    : 'Select a provider when you want to enable sync. Imported-issue cleanup stays available even when syncing is disabled.'}
                </div>
                {providerEnabled ? (
                  <div style={rowStyle()}>
                    <button
                      type="button"
                      style={buttonStyle()}
                      disabled={!activeProjectId || saveProject.busy}
                      onClick={() => void handleDisableSync()}
                    >
                      {buttonLabel('close', saveProject.busy ? 'Disabling…' : 'Disable syncing')}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {!providerEnabled ? (
              <div style={panelStyle()}>
                <div style={stackStyle(10)}>
                  <strong>Imported issue cleanup</strong>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Cleanup stays available even when no provider is currently selected for this project.
                  </div>
                  <div style={rowStyle()}>
                    <button
                      type="button"
                      style={buttonStyle()}
                      disabled={!activeProjectId || cleanupCandidates.busy}
                      onClick={() => void handleCleanup()}
                    >
                      {buttonLabel('hide', cleanupCandidates.busy ? 'Preparing…' : 'Hide imported issues')}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {providerEnabled ? (
              <>
                <div style={{ ...panelStyle(), position: 'relative', zIndex: 4 }}>
                  <div style={stackStyle(12)}>
                    <div style={rowStyle()}>
                      <strong>Project defaults</strong>
                      <span style={badgeStyle('info')}>{getProviderTypeLabel(selectedProvider?.type)}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      <JiraUserAutocomplete
                        companyId={companyId}
                        providerId={selectedProvider?.id ?? null}
                        label="Default assignee"
                        value={defaultAssignee}
                        disabled={!activeProjectId}
                        placeholder="Search Jira users"
                        onChange={setDefaultAssignee}
                      />
                    </div>
                    <div style={rowStyle()}>
                      <button
                        type="button"
                        style={buttonStyle()}
                        disabled={!activeProjectId || !selectedProvider?.id || refreshIdentity.busy}
                        onClick={() => {
                          if (!activeProjectId || !selectedProvider?.id) {
                            return;
                          }
                          void refreshIdentity.run({
                            companyId,
                            projectId: activeProjectId,
                            providerId: selectedProvider.id
                          }).then((result) => {
                            const nextAssignee = (result as { defaultAssignee?: JiraUserReference | null }).defaultAssignee ?? null;
                            setDefaultAssignee(nextAssignee);
                            void refreshSyncData();
                          });
                        }}
                      >
                        {buttonLabel('user', refreshIdentity.busy ? 'Loading Jira user…' : 'Use current Jira user')}
                      </button>
                    </div>
                    <label style={stackStyle(6)}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Scheduled sync cadence (minutes)</span>
                      <input
                        style={inputStyle()}
                        type="number"
                        min={1}
                        max={1440}
                        value={scheduleFrequencyMinutes}
                        disabled={!activeProjectId}
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
                      currentProjectName={activeProject?.projectName ?? projectPage.data?.projectName ?? undefined}
                      providers={(projectPage.data?.availableProviders ?? []).map((provider) => ({
                        providerId: provider.providerId,
                        displayName: provider.displayName
                      }))}
                      onCreate={openCreateMappingModal}
                      onEdit={openEditMappingModal}
                      onRemove={(rowId) => {
                        setRows((current) => current.filter((row) => row.id !== rowId));
                        setRowsDirty(true);
                      }}
                    />
                  </div>
                </div>

                <div style={panelStyle()}>
                  <div style={stackStyle(12)}>
                    <div style={stackStyle(4)}>
                      <strong>Upstream to Paperclip status mapping</strong>
                      <div style={{ fontSize: 12, opacity: 0.74 }}>
                        Jira status changes can update the local Paperclip status and optionally assign a Paperclip agent.
                      </div>
                    </div>
                    <div style={{
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      overflow: 'hidden'
                    }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'color-mix(in srgb, var(--muted, #888) 10%, transparent)' }}>
                            <th style={statusMappingHeaderCellStyle()}>Jira Status</th>
                            <th style={statusMappingHeaderCellStyle()}>Paperclip Status</th>
                            <th style={statusMappingHeaderCellStyle()}>Assign Agent</th>
                            <th style={statusMappingHeaderCellStyle()}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={statusMappingCellStyle()}>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>Default</span>
                            </td>
                            <td style={statusMappingCellStyle()}>
                              <select
                                style={inputStyle()}
                                value={defaultStatus}
                                disabled={!activeProjectId}
                                onChange={(event) => setDefaultStatus(event.target.value)}
                              >
                                {PAPERCLIP_STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>{formatIssueStatus(status)}</option>
                                ))}
                              </select>
                            </td>
                            <td style={statusMappingCellStyle()}>
                              <select
                                style={inputStyle()}
                                value={defaultStatusAssigneeAgentId}
                                disabled={!activeProjectId}
                                onChange={(event) => setDefaultStatusAssigneeAgentId(event.target.value)}
                              >
                                <option value="">None</option>
                                {assignableAgents.map((agent) => (
                                  <option key={agent.id} value={agent.id}>{formatAgentOptionLabel(agent)}</option>
                                ))}
                              </select>
                            </td>
                            <td style={statusMappingCellStyle()}>
                              <span style={{ fontSize: 12, opacity: 0.72 }}>Fallback</span>
                            </td>
                          </tr>
                          {statusMappings.map((mapping) => (
                            <tr key={mapping.id}>
                              <td style={statusMappingCellStyle()}>
                                <input
                                  style={inputStyle()}
                                  value={mapping.jiraStatus}
                                  placeholder="Jira status name"
                                  onChange={(event) => setStatusMappings((current) => current.map((entry) => (
                                    entry.id === mapping.id
                                      ? { ...entry, jiraStatus: event.target.value }
                                      : entry
                                  )))}
                                />
                              </td>
                              <td style={statusMappingCellStyle()}>
                                <select
                                  style={inputStyle()}
                                  value={mapping.paperclipStatus}
                                  onChange={(event) => setStatusMappings((current) => current.map((entry) => (
                                    entry.id === mapping.id
                                      ? { ...entry, paperclipStatus: event.target.value }
                                      : entry
                                  )))}
                                >
                                  {PAPERCLIP_STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>{formatIssueStatus(status)}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={statusMappingCellStyle()}>
                                <select
                                  style={inputStyle()}
                                  value={mapping.assigneeAgentId ?? ''}
                                  onChange={(event) => setStatusMappings((current) => current.map((entry) => (
                                    entry.id === mapping.id
                                      ? { ...entry, assigneeAgentId: event.target.value }
                                      : entry
                                  )))}
                                >
                                  <option value="">None</option>
                                  {assignableAgents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>{formatAgentOptionLabel(agent)}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={statusMappingCellStyle()}>
                                <button
                                  type="button"
                                  style={buttonStyle()}
                                  onClick={() => setStatusMappings((current) => current.filter((entry) => entry.id !== mapping.id))}
                                >
                                  {buttonLabel('close', 'Remove')}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {assignableAgentsError ? (
                      <div style={{ fontSize: 12, color: 'var(--danger-text, #dc2626)' }}>
                        Could not load Paperclip agents right now. {assignableAgentsError}
                      </div>
                    ) : null}
                    <div style={rowStyle()}>
                      <button
                        type="button"
                        style={buttonStyle()}
                        onClick={() => setStatusMappings((current) => [...current, {
                          id: `status-mapping-${Date.now()}`,
                          jiraStatus: '',
                          paperclipStatus: defaultStatus,
                          assigneeAgentId: ''
                        }])}
                      >
                        {buttonLabel('add', 'Add status mapping')}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={stackStyle(8)}>
                  <div style={{ fontSize: 12, opacity: 0.72 }}>
                    Sync saves this project’s settings first and then runs against the currently selected provider.
                  </div>
                  <div style={rowStyle()}>
                    <button
                      type="button"
                      style={buttonStyle('primary')}
                      disabled={!activeProjectId || saveProject.busy || configSaving}
                      onClick={() => void persistProjectSettings()}
                    >
                      {buttonLabel('save', saveProject.busy || configSaving ? 'Saving…' : 'Save settings')}
                    </button>
                    <button
                      type="button"
                      style={buttonStyle('success')}
                      disabled={!activeProjectId || runSync.busy || saveProject.busy || configSaving}
                      onClick={() => void handleRunSync()}
                    >
                      {buttonLabel('sync', runSync.busy ? 'Syncing…' : 'Sync issues')}
                    </button>
                    <button
                      type="button"
                      style={buttonStyle()}
                      disabled={!activeProjectId || cleanupCandidates.busy || saveProject.busy}
                      onClick={() => void handleCleanup()}
                    >
                      {buttonLabel('hide', cleanupCandidates.busy ? 'Preparing…' : 'Hide imported issues')}
                    </button>
                  </div>
                </div>

                <SyncProgressPanel syncProgress={projectPage.data?.syncProgress} />
              </>
            ) : null}
          </div>
        ) : null}

        {currentPage === 'providers' ? (
          <div style={stackStyle(12)}>
            <div style={panelStyle()}>
              <div style={stackStyle(12)}>
                <div style={rowStyle()}>
                  <div style={{ fontSize: 13, opacity: 0.8, flex: '1 1 240px' }}>
                    Providers are reusable connections. Choose one to review it, or create a new one.
                  </div>
                  <button
                    type="button"
                    style={buttonStyle('primary')}
                    onClick={() => {
                      setSelectedProviderDetailId(null);
                      openProviderDetailPage();
                    }}
                  >
                    {buttonLabel('add', 'Create provider')}
                  </button>
                </div>
              </div>
            </div>

            {(providerDirectory.data?.providers ?? []).length === 0 ? (
              <div style={panelStyle()}>
                No providers saved yet. Add one here, then attach it from an individual project page.
              </div>
            ) : (providerDirectory.data?.providers ?? []).map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                style={pageCardStyle(provider.providerId === selectedProviderId)}
                onClick={() => openProviderDetailPage(provider.providerId)}
                data-navigation-target={buildProviderDetailNavigationTarget(provider.providerId)}
              >
                <div style={rowStyle()}>
                  <strong>{provider.displayName}</strong>
                  <span style={badgeStyle('info')}>{getProviderTypeLabel(provider.providerType)}</span>
                  {provider.tokenSaved ? <span style={badgeStyle('synced')}>Token saved</span> : null}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {provider.configSummary ?? 'Open to review connection details.'}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {currentPage === 'provider-detail' && providerDraft ? (
          <div style={panelStyle()}>
            <div style={stackStyle(12)}>
              <div style={rowStyle()}>
                <strong>{providerDetail.data?.mode === 'edit' ? 'Edit provider' : 'Create provider'}</strong>
                <span style={badgeStyle('info')}>{getProviderTypeLabel(providerDraft.type)}</span>
                {providerDetail.data?.tokenSaved ? <span style={badgeStyle('synced')}>Token already saved</span> : null}
              </div>
              <label style={stackStyle(6)}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Provider type</span>
                <select
                  style={inputStyle()}
                  value={providerDraft.type}
                  onChange={(event) => setProviderDraft((current) => current ? {
                    ...current,
                    type: event.target.value as ProviderType
                  } : null)}
                >
                  {(providerDetail.data?.availableProviderTypes ?? providerDirectory.data?.availableProviderTypes ?? []).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label style={stackStyle(6)}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Provider name</span>
                <input
                  style={inputStyle()}
                  value={providerDraft.name}
                  placeholder="Oracle Jira"
                  onChange={(event) => setProviderDraft((current) => current ? {
                    ...current,
                    name: event.target.value
                  } : null)}
                />
              </label>
              {isJiraProviderType(providerDraft.type) ? (
                <>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Jira base URL</span>
                    <input
                      style={inputStyle()}
                      value={providerDraft.jiraBaseUrl ?? ''}
                      placeholder="https://jira.example.com"
                      onChange={(event) => setProviderDraft((current) => current ? {
                        ...current,
                        jiraBaseUrl: event.target.value
                      } : null)}
                    />
                  </label>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Use only the Jira host. Project keys belong on project mappings, not on the provider record.
                  </div>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Jira user email</span>
                    <input
                      style={inputStyle()}
                      value={providerDraft.jiraUserEmail ?? ''}
                      placeholder="Optional for Basic auth Jira setups"
                      onChange={(event) => setProviderDraft((current) => current ? {
                        ...current,
                        jiraUserEmail: event.target.value
                      } : null)}
                    />
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Default issue type</span>
                    <select
                      style={inputStyle()}
                      value={providerDraft.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE}
                      onChange={(event) => setProviderDraft((current) => current ? {
                        ...current,
                        defaultIssueType: event.target.value
                      } : null)}
                    >
                      {JIRA_ISSUE_TYPE_OPTIONS.map((issueType) => (
                        <option key={issueType} value={issueType}>{issueType}</option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>GitHub API base URL</span>
                    <input
                      style={inputStyle()}
                      value={providerDraft.githubApiBaseUrl ?? ''}
                      placeholder="https://api.github.com"
                      onChange={(event) => setProviderDraft((current) => current ? {
                        ...current,
                        githubApiBaseUrl: event.target.value
                      } : null)}
                    />
                  </label>
                  <label style={stackStyle(6)}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Default repository</span>
                    <input
                      style={inputStyle()}
                      value={providerDraft.defaultRepository ?? ''}
                      placeholder="owner/repo"
                      onChange={(event) => setProviderDraft((current) => current ? {
                        ...current,
                        defaultRepository: event.target.value
                      } : null)}
                    />
                  </label>
                </>
              )}
              <label style={stackStyle(6)}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {isJiraProviderType(providerDraft.type) ? 'Jira API token' : 'GitHub token'}
                </span>
                <input
                  style={inputStyle()}
                  type="password"
                  value={providerDraftToken}
                  placeholder={
                    providerDetail.data?.tokenSaved
                      ? 'Saved token is hidden. Enter a new token only to replace it.'
                      : (isJiraProviderType(providerDraft.type) ? 'Paste Jira API token' : 'Paste GitHub token')
                  }
                  onChange={(event) => setProviderDraftToken(event.target.value)}
                />
              </label>
              <div style={rowStyle()}>
                <button
                  type="button"
                  style={buttonStyle('secondary')}
                  disabled={testConnection.busy}
                  onClick={() => void testConnection.run({
                    companyId,
                    providerId: providerDraft.id,
                    providerKey: providerDraft.type,
                    config: isJiraProviderType(providerDraft.type)
                      ? {
                          ...providerDraft,
                          jiraBaseUrl: providerDraft.jiraBaseUrl?.trim() || undefined,
                          jiraUserEmail: providerDraft.jiraUserEmail?.trim() || undefined,
                          defaultIssueType: providerDraft.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE,
                          ...(providerDraftToken.trim() ? { jiraToken: providerDraftToken.trim() } : {})
                        }
                      : {
                          ...providerDraft,
                          githubApiBaseUrl: providerDraft.githubApiBaseUrl?.trim() || undefined,
                          defaultRepository: providerDraft.defaultRepository?.trim() || undefined,
                          ...(providerDraftToken.trim() ? { githubToken: providerDraftToken.trim() } : {})
                        }
                  })}
                >
                  {buttonLabel('sync', testConnection.busy ? 'Testing…' : 'Test connection')}
                </button>
                <button
                  type="button"
                  style={buttonStyle('primary')}
                  disabled={configSaving}
                  onClick={() => void handleSaveProviderDefinition()}
                >
                  {buttonLabel('save', configSaving ? 'Saving…' : 'Save provider')}
                </button>
                {providerDetail.data?.mode === 'edit' ? (
                  <button
                    type="button"
                    style={buttonStyle()}
                    onClick={() => void handleDeleteProviderDefinition()}
                  >
                    {buttonLabel('close', 'Remove provider')}
                  </button>
                ) : null}
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
                  <div style={panelStyle()}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Provider</div>
                    <strong>{selectedProvider?.name || 'No provider selected'}</strong>
                  </div>
                  <div style={panelStyle()}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Paperclip project</div>
                    <strong>{activeProject?.projectName ?? projectPage.data?.projectName ?? 'No project selected'}</strong>
                  </div>
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
                  <JiraUserAutocomplete
                    companyId={companyId}
                    providerId={selectedProvider?.id ?? null}
                    label="Creator"
                    value={mappingModal.draft.filters.author ?? null}
                    placeholder="Search Jira users"
                    onChange={(user) => setMappingModal((current) => current ? {
                      ...current,
                      draft: {
                        ...current.draft,
                        filters: {
                          ...current.draft.filters,
                          author: user ?? undefined
                        }
                      }
                    } : null)}
                  />
                  <JiraUserAutocomplete
                    companyId={companyId}
                    providerId={selectedProvider?.id ?? null}
                    label="Assignee"
                    value={mappingModal.draft.filters.assignee ?? null}
                    placeholder="Search Jira users"
                    onChange={(user) => setMappingModal((current) => current ? {
                      ...current,
                      draft: {
                        ...current.draft,
                        filters: {
                          ...current.draft.filters,
                          assignee: user ?? undefined
                        }
                      }
                    } : null)}
                  />
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
    ? <SyncCenterSurface companyId={companyId} embeddedTitle="Providers" settingsOnly />
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
  const setUpstreamAssignee = useActionRunner<{
    companyId: string;
    issueId: string;
    assignee: JiraUserReference | null;
  }>('issue.setUpstreamAssignee');
  const submitComment = useActionRunner<{
    companyId: string;
    issueId: string;
    body: string;
  }>('issue.comment.submit');
  const [commentBody, setCommentBody] = useState('');
  const [upstreamAssigneeDraft, setUpstreamAssigneeDraft] = useState<JiraUserReference | null>(null);
  const [showUpstreamComments, setShowUpstreamComments] = useState(false);

  useEffect(() => {
    setUpstreamAssigneeDraft(null);
  }, [detail.data?.issueId, detail.data?.upstream?.jiraAssigneeDisplayName, detail.data?.upstreamProviderId]);

  useEffect(() => {
    setShowUpstreamComments(false);
  }, [detail.data?.issueId, detail.data?.upstreamIssueKey]);

  if (!detail.data?.visible) {
    return <></>;
  }

  return (
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
                          <option value="">{`${detail.data.upstreamStatus.name} (${detail.data.upstreamStatus.category})`}</option>
                          {detail.data.upstreamTransitions.map((transition) => (
                            <option key={transition.id} value={transition.id}>{transition.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: 13 }}>{`${detail.data.upstreamStatus.name} (${detail.data.upstreamStatus.category})`}</span>
                      )}
                    </div>
                  ) : 'Not linked yet'}
                </div>
                <div style={panelStyle()}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Upstream Jira assignee</div>
                  <div style={stackStyle(8)}>
                    <JiraUserAutocomplete
                      companyId={companyId}
                      providerId={detail.data.upstreamProviderId ?? null}
                      label="Assignee"
                      value={upstreamAssigneeDraft}
                      disabled={!companyId || !issueId || !detail.data.upstreamProviderId || setUpstreamAssignee.busy}
                      placeholder={detail.data.upstream?.jiraAssigneeDisplayName ?? 'Search Jira users'}
                      onChange={(user) => {
                        setUpstreamAssigneeDraft(user);
                        if (!user) {
                          return;
                        }
                        void setUpstreamAssignee.run({
                          companyId,
                          issueId,
                          assignee: user
                        }).then(() => detail.refresh());
                      }}
                    />
                    <span style={{ fontSize: 12, opacity: 0.72 }}>
                      Current: {detail.data.upstream?.jiraAssigneeDisplayName ?? 'Unassigned'}
                    </span>
                  </div>
                </div>
                <div style={panelStyle()}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Upstream Jira creator</div>
                  <strong>{detail.data.upstream?.jiraCreatorDisplayName ?? 'Unknown'}</strong>
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
          message={pushIssue.message ?? pullIssue.message ?? setUpstreamStatus.message ?? setUpstreamAssignee.message ?? submitComment.message}
          tone={
            pushIssue.tone === 'error' || pullIssue.tone === 'error' || setUpstreamStatus.tone === 'error' || setUpstreamAssignee.tone === 'error' || submitComment.tone === 'error'
              ? 'error'
              : pushIssue.tone === 'success' || pullIssue.tone === 'success' || setUpstreamStatus.tone === 'success' || setUpstreamAssignee.tone === 'success' || submitComment.tone === 'success'
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
              {buttonLabel('external', 'Open in Jira')}
            </a>
          ) : null}
          <button
            type="button"
            style={buttonStyle('primary')}
            disabled={!companyId || !issueId || pushIssue.busy}
            onClick={() => void pushIssue.run({ companyId, issueId }).then(() => detail.refresh())}
          >
            {buttonLabel(
              'arrow-up',
              pushIssue.busy
                ? (detail.data.isSynced ? 'Syncing upstream…' : 'Creating upstream…')
                : detail.data.isSynced
                  ? 'Sync changes upstream'
                  : 'Create upstream issue'
            )}
          </button>
          <button
            type="button"
            style={buttonStyle()}
            disabled={!detail.data.isSynced || !companyId || !issueId || pullIssue.busy}
            onClick={() => void pullIssue.run({ companyId, issueId }).then(() => detail.refresh())}
          >
            {buttonLabel('arrow-down', pullIssue.busy ? 'Pulling…' : 'Pull from Jira')}
          </button>
        </div>

        {detail.data.isSynced ? (
          <div style={panelStyle('default')}>
            <div style={stackStyle(12)}>
              <div style={rowStyle()}>
                <strong>Jira comments</strong>
                <span style={{ fontSize: 12, opacity: 0.72 }}>
                  {detail.data.upstreamComments?.length ?? 0} total
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
                      <div key={comment.id} style={panelStyle()}>
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
                      No Jira comments are available yet.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {detail.data.isSynced ? (
          <div style={panelStyle('default')}>
            <div style={stackStyle(12)}>
              <div style={rowStyle()}>
                <strong>Post new comment</strong>
                <span style={{ fontSize: 12, opacity: 0.72 }}>Posts to Jira</span>
              </div>
              <textarea
                style={{
                  ...inputStyle(),
                  minHeight: 108,
                  resize: 'vertical'
                }}
                value={commentBody}
                placeholder="Add a comment to this Jira issue"
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
                    }).then(() => {
                      setCommentBody('');
                      void detail.refresh();
                    });
                  }}
                >
                  {buttonLabel('arrow-up', submitComment.busy ? 'Posting…' : 'Post comment')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
    </div>
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
          {annotation.data.badgeLabel ?? buildCommentOriginLabel(annotation.data.origin)}
        </span>
        <span style={{ fontSize: 12, opacity: 0.78 }}>
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
            {buttonLabel('arrow-up', pushComment.busy ? 'Uploading…' : 'Upload comment to Jira')}
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
          {buttonLabel('external', 'Open in Jira')}
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
