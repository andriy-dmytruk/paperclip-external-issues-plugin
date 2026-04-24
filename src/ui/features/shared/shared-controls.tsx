import React, { useEffect, useState } from 'react';
import { usePluginData } from '@paperclipai/plugin-sdk/ui';
import type { ProviderType } from '../../plugin-config.js';
import { isGitHubProviderType } from '../../../providers/shared/config.ts';
import { formatUpstreamUserLabel, formatUpstreamUserSecondary, type UpstreamUserReference } from '../../assignees.js';
import { useDebouncedValue } from '../../hooks.js';
import {
  badgeStyle,
  buildSyncProgressLabel,
  formatDate,
  formatIssueStatus,
  getProviderMappingSummaryNoun,
  inputStyle,
  panelStyle,
  progressBarStyle,
  progressFillStyle,
  rowStyle,
  stackStyle
} from '../../primitives.js';
import type { UpstreamUserSearchData, SyncProgressState, UpstreamProjectSearchData } from '../../types.js';

export function UpstreamUserAutocomplete(props: {
  companyId: string;
  providerId?: string | null;
  label: string;
  hideLabel?: boolean;
  value?: UpstreamUserReference | null;
  placeholder?: string;
  disabled?: boolean;
  dropdownMaxHeight?: number;
  hideSelectedSecondary?: boolean;
  trailingAction?: React.ReactNode;
  onChange: (user: UpstreamUserReference | null) => void;
}): React.JSX.Element {
  const [query, setQuery] = useState(formatUpstreamUserLabel(props.value));
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);
  const search = usePluginData<UpstreamUserSearchData>('sync.users.search', {
    companyId: props.companyId,
    providerId: props.providerId ?? undefined,
    query: props.providerId ? debouncedQuery : ''
  });

  useEffect(() => {
    const nextLabel = formatUpstreamUserLabel(props.value);
    if (nextLabel !== query) {
      setQuery(nextLabel);
    }
  }, [props.value]);

  const suggestions = search.data?.suggestions ?? [];
  const searchError = search.data?.errorMessage;
  const canSearch = Boolean(props.providerId && debouncedQuery.trim().length > 0 && !props.disabled);

  return (
    <label style={{ ...stackStyle(6), position: 'relative', zIndex: open ? 80 : 1 }}>
      {props.hideLabel ? null : <span style={{ fontSize: 13, fontWeight: 600 }}>{props.label}</span>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: props.trailingAction ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
        gap: 8,
        alignItems: 'start'
      }}
      >
        <input
          style={inputStyle()}
          value={query}
          disabled={props.disabled}
          placeholder={props.placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              setQuery(formatUpstreamUserLabel(props.value));
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
        {props.trailingAction}
      </div>
      {props.value && !props.hideSelectedSecondary ? (
        <div style={{ fontSize: 12, opacity: 0.72 }}>
          {formatUpstreamUserSecondary(props.value) || props.value.accountId}
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
          border: '1px solid color-mix(in srgb, var(--border) 96%, transparent)',
          boxShadow: '0 22px 44px rgba(15, 23, 42, 0.24)',
          display: 'grid',
          gap: 4,
          maxHeight: props.dropdownMaxHeight ?? 220,
          overflowY: 'auto',
          padding: 8
        }}
        >
          {search.loading ? (
            <div style={{ fontSize: 12, opacity: 0.72 }}>Searching users…</div>
          ) : searchError ? (
            <div style={{ fontSize: 12, color: 'var(--danger, #b91c1c)' }}>{searchError}</div>
          ) : suggestions.length > 0 ? suggestions.map((suggestion) => (
            <button
              key={suggestion.accountId}
              type="button"
              style={{
                borderRadius: 12,
                border: '1px solid color-mix(in srgb, var(--border) 88%, transparent)',
                background: 'transparent',
                color: 'inherit',
                padding: '8px 10px',
                textAlign: 'left',
                display: 'grid',
                gap: 2,
                cursor: 'pointer'
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                props.onChange(suggestion);
                setQuery(formatUpstreamUserLabel(suggestion));
                setOpen(false);
              }}
            >
              <span>{formatUpstreamUserLabel(suggestion)}</span>
              {formatUpstreamUserSecondary(suggestion) ? (
                <span style={{ fontSize: 12, opacity: 0.72 }}>{formatUpstreamUserSecondary(suggestion)}</span>
              ) : null}
            </button>
          )) : (
            <div style={{ fontSize: 12, opacity: 0.72 }}>No users match this search yet.</div>
          )}
        </div>
      ) : null}
    </label>
  );
}

export function UpstreamProjectAutocomplete(props: {
  companyId: string;
  providerId?: string | null;
  providerType?: ProviderType | null;
  label: string;
  hideLabel?: boolean;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}): React.JSX.Element {
  const [query, setQuery] = useState(props.value);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);
  const search = usePluginData<UpstreamProjectSearchData>('sync.upstreamProjects.search', {
    companyId: props.companyId,
    providerId: props.providerId ?? undefined,
    query: props.providerId ? debouncedQuery : ''
  });

  useEffect(() => {
    if (props.value !== query) {
      setQuery(props.value);
    }
  }, [props.value]);

  const suggestions = search.data?.suggestions ?? [];
  const searchError = search.data?.errorMessage;
  const canSearch = Boolean(props.providerId && !props.disabled);

  return (
    <label style={{ ...stackStyle(6), position: 'relative', zIndex: open ? 80 : 1 }}>
      {props.hideLabel ? null : <span style={{ fontSize: 13, fontWeight: 600 }}>{props.label}</span>}
      <input
        style={inputStyle()}
        value={query}
        disabled={props.disabled}
        placeholder={props.placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            setQuery(props.value);
          }, 120);
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
          props.onChange(nextValue);
          if (!open) {
            setOpen(true);
          }
        }}
      />
      {open && canSearch ? (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'calc(100% + 4px)',
          zIndex: 120,
          ...panelStyle(),
          background: 'var(--card, Canvas)',
          border: '1px solid color-mix(in srgb, var(--border) 96%, transparent)',
          boxShadow: '0 22px 44px rgba(15, 23, 42, 0.24)',
          display: 'grid',
          gap: 4,
          maxHeight: 220,
          overflowY: 'auto',
          padding: 8
        }}
        >
          {search.loading ? (
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              {`Searching ${getProviderMappingSummaryNoun(props.providerType)}s…`}
            </div>
          ) : searchError ? (
            <div style={{ fontSize: 12, color: 'var(--danger, #b91c1c)' }}>{searchError}</div>
          ) : suggestions.length > 0 ? suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              style={{
                borderRadius: 12,
                border: '1px solid color-mix(in srgb, var(--border) 88%, transparent)',
                background: 'transparent',
                color: 'inherit',
                padding: '8px 10px',
                textAlign: 'left',
                display: 'grid',
                gap: 2,
                cursor: 'pointer'
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                props.onChange(suggestion.key);
                setQuery(suggestion.key);
                setOpen(false);
              }}
            >
              <span>{suggestion.displayName}</span>
              <span style={{ fontSize: 12, opacity: 0.72 }}>
                {isGitHubProviderType(props.providerType) ? (suggestion.url ?? suggestion.key) : suggestion.key}
              </span>
            </button>
          )) : (
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              No {getProviderMappingSummaryNoun(props.providerType)}s match this search yet.
            </div>
          )}
        </div>
      ) : null}
    </label>
  );
}

export function ResultMessage(props: {
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

export function SyncProgressPanel(props: {
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
