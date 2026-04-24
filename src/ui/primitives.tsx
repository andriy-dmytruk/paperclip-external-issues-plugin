import React from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  User,
  X
} from 'lucide-react';
import type { ProviderType } from './plugin-config.js';
import { isGitHubProviderType, normalizeProviderType } from '../providers/shared/config.ts';
import { formatUpstreamUserLabel, type UpstreamUserReference } from './assignees.js';
import type {
  AssignableAgent,
  CommentSyncPresentation,
  MappingRow,
  StatusMappingRow,
  SyncProgressState
} from './types.js';

export type ButtonIconName =
  | 'add'
  | 'arrow-up'
  | 'arrow-down'
  | 'back'
  | 'close'
  | 'edit'
  | 'external'
  | 'eye'
  | 'hide'
  | 'save'
  | 'sync'
  | 'user'
  | 'settings';

type ProviderIconSize = 'sm' | 'md';

export function cardStyle(): React.CSSProperties {
  return {
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: 16,
    background: 'var(--card, transparent)',
    color: 'inherit'
  };
}

export function panelStyle(tone: 'default' | 'synced' | 'local' = 'default'): React.CSSProperties {
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

export function stackStyle(gap = 12): React.CSSProperties {
  return {
    display: 'grid',
    gap
  };
}

export function rowStyle(): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  };
}

export function renderButtonIcon(icon: ButtonIconName): React.JSX.Element {
  const iconStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    display: 'inline-block',
    flex: '0 0 auto'
  };

  if (icon === 'add') {
    return <Plus style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'arrow-up') {
    return <ArrowUp style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'arrow-down') {
    return <ArrowDown style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'back') {
    return <ArrowLeft style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'close') {
    return <X style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'external') {
    return <ExternalLink style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'eye') {
    return <Eye style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'edit') {
    return <Pencil style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'hide') {
    return <EyeOff style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'save') {
    return <Save style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'sync') {
    return <RefreshCw style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'user') {
    return <User style={iconStyle} strokeWidth={2} />;
  }

  if (icon === 'settings') {
    return <Settings style={iconStyle} strokeWidth={2} />;
  }

  return <Settings style={iconStyle} strokeWidth={2} />;
}

export function buttonLabel(icon: ButtonIconName, label: string): React.JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {renderButtonIcon(icon)}
      <span>{label}</span>
    </span>
  );
}

function providerIconStyle(size: ProviderIconSize = 'sm'): React.CSSProperties {
  const pixels = size === 'md' ? 16 : 14;
  return {
    width: pixels,
    height: pixels,
    display: 'inline-block',
    flex: '0 0 auto'
  };
}

export function renderProviderIcon(providerType?: ProviderType | string | null, size: ProviderIconSize = 'sm'): React.JSX.Element {
  if (isGitHubProviderType(normalizeProviderType(providerType))) {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style={providerIconStyle(size)}>
        <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.7 7.7 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style={providerIconStyle(size)}>
      <path d="M2 2.75a.75.75 0 0 1 .75-.75h3.5A.75.75 0 0 1 7 2.75v3.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 2 6.25v-3.5Z" fill="currentColor" opacity="0.85" />
      <path d="M9 2.75A.75.75 0 0 1 9.75 2h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 9 6.25v-3.5Z" fill="currentColor" opacity="0.55" />
      <path d="M2 9.75A.75.75 0 0 1 2.75 9h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 2 13.25v-3.5Z" fill="currentColor" opacity="0.55" />
      <path d="M9 9.75A.75.75 0 0 1 9.75 9h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 9 13.25v-3.5Z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

export function providerLabel(providerType?: ProviderType | string | null, label?: string | null, size: ProviderIconSize = 'sm'): React.JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {renderProviderIcon(providerType, size)}
      {label ? <span>{label}</span> : null}
    </span>
  );
}

export function buttonStyle(variant: 'primary' | 'secondary' | 'success' = 'secondary'): React.CSSProperties {
  const palette =
    variant === 'primary'
      ? {
          background: 'var(--foreground, #111827)',
          color: 'var(--background, #ffffff)',
          border: 'color-mix(in srgb, var(--foreground, #111827) 88%, transparent)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)'
        }
      : variant === 'success'
        ? {
            background: 'color-mix(in srgb, #16a34a 10%, var(--background, #ffffff))',
            color: 'inherit',
            border: 'color-mix(in srgb, #16a34a 28%, var(--border))',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)'
          }
        : {
            background: 'var(--background, transparent)',
            color: 'inherit',
            border: 'color-mix(in srgb, var(--border) 96%, transparent)',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)'
          };
  return {
    borderRadius: 6,
    padding: '0 12px',
    border: `1px solid ${palette.border}`,
    background: palette.background,
    color: palette.color,
    boxShadow: palette.boxShadow,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
    lineHeight: 1.2,
    minHeight: 36,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap'
  };
}

export function iconButtonStyle(): React.CSSProperties {
  return {
    borderRadius: 6,
    width: 36,
    height: 36,
    border: '1px solid color-mix(in srgb, var(--border) 92%, transparent)',
    background: 'var(--background, transparent)',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
    flex: '0 0 auto'
  };
}

export function toolbarButtonStyle(): React.CSSProperties {
  return {
    borderRadius: 6,
    minHeight: 36,
    height: 36,
    padding: '0 12px',
    border: '1px solid var(--border)',
    background: 'var(--background, transparent)',
    color: 'inherit',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1.2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)'
  };
}

export function toolbarIconButtonStyle(): React.CSSProperties {
  return {
    borderRadius: 6,
    width: 36,
    minWidth: 36,
    height: 36,
    border: '1px solid var(--border)',
    background: 'var(--background, transparent)',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
    flex: '0 0 auto'
  };
}

export function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    borderRadius: 6,
    border: '1px solid color-mix(in srgb, var(--border) 96%, transparent)',
    padding: '0 12px',
    background: 'var(--background, var(--card, transparent))',
    color: 'inherit',
    fontSize: 14,
    lineHeight: 1.3,
    boxSizing: 'border-box',
    minHeight: 36,
    height: 36
  };
}

export function checkboxLabelStyle(): React.CSSProperties {
  return {
    ...rowStyle(),
    fontSize: 13,
    fontWeight: 600
  };
}

export function statusMappingHeaderCellStyle(): React.CSSProperties {
  return {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 700,
    opacity: 0.82,
    borderBottom: '1px solid var(--border)'
  };
}

export function statusMappingCellStyle(): React.CSSProperties {
  return {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'top'
  };
}

export function mappingTableMutedTextStyle(): React.CSSProperties {
  return {
    fontSize: 12,
    opacity: 0.72,
    lineHeight: 1.4
  };
}

export function badgeStyle(tone: 'local' | 'synced' | 'info' | 'error'): React.CSSProperties {
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

export function neutralBadgeStyle(): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    border: '1px solid var(--border)',
    background: 'color-mix(in srgb, currentColor 8%, transparent)',
    color: 'inherit',
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 700,
    opacity: 0.88
  };
}

export function metricCardStyle(): React.CSSProperties {
  return {
    border: '1px solid color-mix(in srgb, var(--border) 88%, transparent)',
    borderRadius: 4,
    padding: 16,
    background: 'var(--background, var(--card, transparent))',
    minWidth: 0,
    display: 'grid',
    gap: 10
  };
}

export function sectionCardStyle(): React.CSSProperties {
  return {
    border: '1px solid color-mix(in srgb, var(--border) 94%, transparent)',
    borderRadius: 4,
    padding: 20,
    background: 'var(--background, var(--card, transparent))',
    minWidth: 0
  };
}

export function tabListStyle(): React.CSSProperties {
  return {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    borderBottom: '1px solid color-mix(in srgb, var(--border) 94%, transparent)',
    alignItems: 'flex-end'
  };
}

export function tabButtonStyle(selected = false): React.CSSProperties {
  return {
    borderRadius: 0,
    padding: '0 0 10px',
    border: 'none',
    borderBottom: selected ? '2px solid currentColor' : '2px solid transparent',
    marginBottom: -1,
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: 13,
    lineHeight: 1.2,
    fontWeight: selected ? 600 : 500,
    opacity: selected ? 1 : 0.72
  };
}

export function healthBadgeStyle(status?: string | null): React.CSSProperties {
  if (status === 'connected') {
    return badgeStyle('synced');
  }
  if (status === 'degraded') {
    return badgeStyle('error');
  }
  if (status === 'needs_config') {
    return badgeStyle('local');
  }
  return neutralBadgeStyle();
}

export function progressBarStyle(progressPercent: number): React.CSSProperties {
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

export function progressFillStyle(progressPercent: number): React.CSSProperties {
  return {
    width: `${Math.max(0, Math.min(100, progressPercent))}%`,
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #2563eb, #22c55e)',
    transition: 'width 180ms ease'
  };
}

function isSameLocalDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return 'Never';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  if (isSameLocalDay(date, now)) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  return date.toLocaleString();
}

export function formatUpstreamStatusLabel(
  providerType: ProviderType | string | null | undefined,
  upstreamStatus?: {
    name: string;
    category: string;
  } | null
): string {
  if (!upstreamStatus) {
    return 'Not linked';
  }

  if (isGitHubProviderType(providerType)) {
    return upstreamStatus.name;
  }

  const normalizedName = upstreamStatus.name.trim().toLowerCase();
  const normalizedCategory = upstreamStatus.category.trim().toLowerCase();
  if (!upstreamStatus.category.trim() || normalizedName === normalizedCategory) {
    return upstreamStatus.name;
  }

  return `${upstreamStatus.name} (${upstreamStatus.category})`;
}

export function shouldShowProviderHealthMessage(status?: string | null): boolean {
  return status === 'degraded' || status === 'needs_config' || status === 'error';
}

export function formatMappingNumberRange(row: MappingRow): string {
  const greaterThan = row.filters.issueNumberGreaterThan;
  const lessThan = row.filters.issueNumberLessThan;
  if (typeof greaterThan === 'number' && typeof lessThan === 'number') {
    return `${greaterThan + 1} to ${lessThan - 1}`;
  }
  if (typeof greaterThan === 'number') {
    return `After ${greaterThan}`;
  }
  if (typeof lessThan === 'number') {
    return `Before ${lessThan}`;
  }
  return 'Any';
}

export function buildMappingRuleSummary(row: MappingRow, providerType?: ProviderType | null): string {
  const rules: string[] = [];
  if (!isGitHubProviderType(providerType) && row.jiraJql.trim()) {
    rules.push('Custom JQL');
  }
  if (row.filters.onlyActive) {
    rules.push('Active only');
  }
  return rules.length > 0 ? rules.join(' • ') : `All ${getProviderMappingSummaryNoun(providerType)}`;
}

export function formatIssueStatus(value?: string | null): string {
  if (!value) {
    return 'Unknown';
  }

  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatAgentOptionLabel(agent: AssignableAgent): string {
  return agent.title ? `${agent.name} (${agent.title})` : agent.name;
}

export const PAPERCLIP_STATUS_OPTIONS = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'] as const;

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

export function buildCommentOriginLabel(
  origin: CommentSyncPresentation['origin'],
  providerKey?: ProviderType | string | null
): string {
  const platform = getProviderPlatformName(providerKey);
  if (origin === 'provider_pull') {
    return `Fetched from ${platform}`;
  }
  if (origin === 'provider_push') {
    return `Uploaded to ${platform}`;
  }
  return 'Local Paperclip comment';
}

export function normalizeUpstreamProjectKey(value: string, providerType?: ProviderType): string {
  const trimmed = value.trim();
  return isGitHubProviderType(providerType) ? trimmed : trimmed.toUpperCase();
}

export function getProviderPlatformName(providerType?: ProviderType | string | null): string {
  const normalized = normalizeProviderType(providerType);
  return isGitHubProviderType(normalized) ? 'GitHub' : 'Jira';
}

export function getProviderProjectLabel(providerType?: ProviderType | string | null): string {
  const normalized = normalizeProviderType(providerType);
  return isGitHubProviderType(normalized) ? 'GitHub repository (owner/repo)' : 'Jira project key';
}

export function getProviderProjectPlaceholder(providerType?: ProviderType | string | null): string {
  const normalized = normalizeProviderType(providerType);
  return isGitHubProviderType(normalized) ? 'owner/repo' : 'PRJ';
}

export function getSuggestedUpstreamProjectKey(
  providerType: ProviderType | string | null | undefined,
  source?: {
    suggestedUpstreamProjectKeys?: Partial<Record<ProviderType, string>> | Record<string, string>;
  } | null
): string {
  const normalized = normalizeProviderType(providerType);
  if (!normalized) {
    return '';
  }

  const suggestedValue = source?.suggestedUpstreamProjectKeys?.[normalized];
  return typeof suggestedValue === 'string' ? suggestedValue.trim() : '';
}

export function getProviderStatusLabel(providerType?: ProviderType | string | null): string {
  return `${getProviderPlatformName(providerType)} issue status`;
}

export function getDefaultStatusMappingRowsForProviderType(providerType?: ProviderType | string | null): StatusMappingRow[] {
  if (isGitHubProviderType(normalizeProviderType(providerType))) {
    return [{
      id: 'status-mapping-default-closed',
      jiraStatus: 'Closed',
      paperclipStatus: 'done',
      assigneeAgentId: ''
    }, {
      id: 'status-mapping-default-completed',
      jiraStatus: 'Completed',
      paperclipStatus: 'done',
      assigneeAgentId: ''
    }, {
      id: 'status-mapping-default-duplicate',
      jiraStatus: 'Duplicate',
      paperclipStatus: 'done',
      assigneeAgentId: ''
    }, {
      id: 'status-mapping-default-not-planned',
      jiraStatus: 'Not planned',
      paperclipStatus: 'cancelled',
      assigneeAgentId: ''
    }];
  }

  return [{
    id: 'status-mapping-default-closed',
    jiraStatus: 'Closed',
    paperclipStatus: 'done',
    assigneeAgentId: ''
  }, {
    id: 'status-mapping-default-done',
    jiraStatus: 'Done',
    paperclipStatus: 'done',
    assigneeAgentId: ''
  }];
}

export function getProviderUsersPlaceholder(providerType?: ProviderType | string | null): string {
  return `Search ${getProviderPlatformName(providerType)} users`;
}

export function getProviderMappingSummaryNoun(providerType?: ProviderType | string | null): string {
  return isGitHubProviderType(normalizeProviderType(providerType)) ? 'repository feed' : 'project feed';
}

export function getOpenInProviderLabel(providerType?: ProviderType | string | null): string {
  return `Open in ${getProviderPlatformName(providerType)}`;
}

export function getPullFromProviderLabel(providerType?: ProviderType | string | null, busy?: boolean): string {
  const platform = getProviderPlatformName(providerType);
  return busy ? 'Pulling…' : `Pull from ${platform}`;
}

export function getProviderCommentsLabel(providerType?: ProviderType | string | null): string {
  return `${getProviderPlatformName(providerType)} comments`;
}

export function getProviderPostsLabel(providerType?: ProviderType | string | null): string {
  return `Posts to ${getProviderPlatformName(providerType)}`;
}

export function getProviderCommentPlaceholder(providerType?: ProviderType | string | null): string {
  return `Add a comment to this ${getProviderPlatformName(providerType)} issue`;
}

export function getProviderIssueSelectValue(
  providerType: ProviderType | string | null | undefined,
  statusName?: string | null
): string {
  if (!isGitHubProviderType(normalizeProviderType(providerType))) {
    return '';
  }

  return String(statusName).toLowerCase() === 'closed' ? 'closed' : 'open';
}

export function formatProviderHealthLabel(status?: string, fallback?: string): string {
  if (fallback) {
    return fallback;
  }
  if (status === 'connected') {
    return 'Connected';
  }
  if (status === 'degraded') {
    return 'Degraded';
  }
  if (status === 'needs_config') {
    return 'Needs config';
  }
  return 'Not tested';
}

export function createEmptyMappingRow(providerId = '', defaultAssignee?: UpstreamUserReference | null): MappingRow {
  return {
    id: `mapping-${Math.random().toString(36).slice(2, 10)}`,
    providerId,
    enabled: true,
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

export function modalBackdropStyle(): React.CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    background: 'color-mix(in srgb, #111827 34%, transparent)',
    display: 'grid',
    placeItems: 'center',
    padding: 20,
    zIndex: 9999
  };
}

export function modalPanelStyle(width = 560): React.CSSProperties {
  return {
    border: '1px solid color-mix(in srgb, var(--border) 94%, transparent)',
    borderRadius: 4,
    background: 'var(--background, var(--card, Canvas))',
    color: 'inherit',
    width: `min(100%, ${width}px)`,
    maxHeight: 'min(86vh, 900px)',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(15, 23, 42, 0.18)'
  };
}

export function modalHeaderStyle(): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '18px 22px',
    borderBottom: '1px solid color-mix(in srgb, var(--border) 94%, transparent)',
    background: 'color-mix(in srgb, var(--background, white) 92%, var(--card, transparent) 8%)'
  };
}

export function modalBodyStyle(): React.CSSProperties {
  return {
    padding: 22,
    overflowY: 'auto',
    maxHeight: 'calc(min(86vh, 900px) - 78px)'
  };
}

export function pageCardStyle(selected = false): React.CSSProperties {
  return {
    ...(selected ? {
      ...sectionCardStyle(),
      border: '1px solid color-mix(in srgb, #16a34a 34%, var(--border))',
      background: 'color-mix(in srgb, #16a34a 5%, var(--card, transparent))'
    } : sectionCardStyle()),
    display: 'grid',
    gap: 10,
    cursor: 'pointer',
    textAlign: 'left'
  };
}
