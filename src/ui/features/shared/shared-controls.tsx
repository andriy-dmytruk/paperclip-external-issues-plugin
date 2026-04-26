import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePluginData } from '@paperclipai/plugin-sdk/ui';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { ProviderType } from '../../plugin-config.js';
import { isGitHubProviderType } from '../../../providers/shared/config.ts';
import { formatUpstreamUserLabel, formatUpstreamUserSecondary, type UpstreamUserReference } from '../../assignees.js';
import { useDebouncedValue } from '../../hooks.js';
import {
  badgeStyle,
  formatDate,
  formatIssueStatus,
  getProviderMappingSummaryNoun,
  inputStyle,
  panelStyle,
  rowStyle,
  stackStyle
} from '../../primitives.js';
import type { UpstreamUserSearchData, SyncProgressState, UpstreamProjectSearchData } from '../../types.js';

function getCustomProjectSelectionLabel(providerType?: ProviderType | null): string {
  return isGitHubProviderType(providerType) ? 'Custom repository' : 'Custom project key';
}

function getCurrentProjectSelectionLabel(providerType?: ProviderType | null): string {
  return isGitHubProviderType(providerType) ? 'Current repository' : 'Current project key';
}

function selectorTriggerStyle(disabled?: boolean): React.CSSProperties {
  return {
    width: '100%',
    minHeight: 36,
    height: 36,
    borderRadius: 6,
    border: '1px solid color-mix(in srgb, var(--border) 96%, transparent)',
    background: 'var(--background, var(--card, transparent))',
    color: 'inherit',
    padding: '0 12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    fontSize: 14,
    lineHeight: 1.35,
    textAlign: 'left',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxSizing: 'border-box'
  };
}

function selectorPopoverStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 'calc(100% + 6px)',
    zIndex: 120,
    background: 'var(--card, Canvas)',
    border: '1px solid color-mix(in srgb, var(--border) 96%, transparent)',
    borderRadius: 6,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.14)',
    overflow: 'hidden'
  };
}

function selectorSearchRowStyle(): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderBottom: '1px solid color-mix(in srgb, var(--border) 92%, transparent)'
  };
}

function selectorOptionStyle(selected: boolean, highlighted: boolean): React.CSSProperties {
  return {
    width: '100%',
    border: 'none',
    background: highlighted ? 'color-mix(in srgb, currentColor 8%, transparent)' : 'transparent',
    color: 'inherit',
    borderRadius: 6,
    padding: '10px 12px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontSize: 14,
    lineHeight: 1.35
  };
}

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
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncedQuery = useDebouncedValue(query, 250);
  const search = usePluginData<UpstreamUserSearchData>('sync.users.search', {
    companyId: props.companyId,
    providerId: props.providerId ?? undefined,
    query: props.providerId && open && debouncedQuery.trim().length > 0 ? debouncedQuery : ''
  });

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const suggestions = search.data?.suggestions ?? [];
  const searchError = search.data?.errorMessage;
  const canSearch = Boolean(props.providerId && !props.disabled);
  const selectedAccountId = props.value?.accountId ?? '';
  const selectedLabel = formatUpstreamUserLabel(props.value);
  const selectedSecondary = formatUpstreamUserSecondary(props.value);

  const options = useMemo(() => {
    const items: Array<{
      key: string;
      user: UpstreamUserReference | null;
      label: string;
      secondary?: string;
    }> = [{
      key: '__none__',
      user: null,
      label: 'No assignee'
    }];

    if (props.value) {
      items.push({
        key: props.value.accountId,
        user: props.value,
        label: selectedLabel,
        secondary: selectedSecondary || undefined
      });
    }

    for (const suggestion of suggestions) {
      if (items.some((item) => item.key === suggestion.accountId)) {
        continue;
      }
      items.push({
        key: suggestion.accountId,
        user: suggestion,
        label: formatUpstreamUserLabel(suggestion),
        secondary: formatUpstreamUserSecondary(suggestion) || undefined
      });
    }

    return items;
  }, [props.value, selectedLabel, selectedSecondary, suggestions]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setHighlightedIndex(0);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [open]);

  function commitSelection(user: UpstreamUserReference | null) {
    props.onChange(user);
    setOpen(false);
    setQuery('');
  }

  return (
    <label ref={containerRef} style={{ ...stackStyle(6), position: 'relative', zIndex: open ? 80 : 1 }}>
      {props.hideLabel ? null : <span style={{ fontSize: 13, fontWeight: 600 }}>{props.label}</span>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: props.trailingAction ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
        gap: 8,
        alignItems: 'start'
      }}
      >
        <button
          type="button"
          style={selectorTriggerStyle(props.disabled)}
          disabled={props.disabled}
          onClick={() => {
            if (!props.disabled) {
              setOpen((current) => !current);
            }
          }}
          onKeyDown={(event) => {
            if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && !props.disabled) {
              event.preventDefault();
              setOpen(true);
            }
            if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
        >
          <span style={{
            minWidth: 0,
            flex: '1 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: props.value ? 'inherit' : 'color-mix(in srgb, currentColor 56%, transparent)'
          }}
          >
            {props.value ? selectedLabel : (props.placeholder ?? 'Select assignee')}
          </span>
          <ChevronDown size={15} style={{ opacity: 0.55, flex: '0 0 auto' }} />
        </button>
        {props.trailingAction}
      </div>
      {open ? (
        <div style={selectorPopoverStyle()}>
          <div style={selectorSearchRowStyle()}>
            <Search size={15} style={{ opacity: 0.5, flex: '0 0 auto' }} />
            <input
              ref={inputRef}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                padding: 0,
                fontSize: 14,
                lineHeight: 1.35,
                outline: 'none'
              }}
              value={query}
              placeholder={props.placeholder ?? 'Search users...'}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setHighlightedIndex((current) => (
                    options.length === 0 ? 0 : (current + 1) % options.length
                  ));
                  return;
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setHighlightedIndex((current) => (
                    options.length === 0 ? 0 : (current <= 0 ? options.length - 1 : current - 1)
                  ));
                  return;
                }
                if (event.key === 'Enter') {
                  event.preventDefault();
                  const option = options[highlightedIndex] ?? options[0];
                  if (option) {
                    commitSelection(option.user);
                  }
                  return;
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
            />
          </div>
          <div style={{
            maxHeight: props.dropdownMaxHeight ?? 240,
            overflowY: 'auto',
            padding: 4
          }}
          >
            {!canSearch ? (
              <div style={{ padding: '10px 12px', fontSize: 12, opacity: 0.72 }}>
                Select a provider before searching users.
              </div>
            ) : search.loading ? (
              <div style={{ padding: '10px 12px', fontSize: 12, opacity: 0.72 }}>Searching assignees…</div>
            ) : searchError ? (
              <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--danger, #b91c1c)' }}>{searchError}</div>
            ) : options.length > 0 ? options.map((option, index) => {
              const isSelected = option.user ? option.user.accountId === selectedAccountId : !props.value;
              const isHighlighted = highlightedIndex === index;
              return (
                <button
                  key={option.key}
                  type="button"
                  style={selectorOptionStyle(isSelected, isHighlighted)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commitSelection(option.user)}
                >
                  <span style={{ minWidth: 0, display: 'grid', gap: 2, flex: '1 1 auto' }}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {option.label}
                    </span>
                    {option.secondary ? (
                      <span style={{ fontSize: 12, opacity: 0.62, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {option.secondary}
                      </span>
                    ) : null}
                  </span>
                  <Check size={15} style={{ opacity: isSelected ? 0.85 : 0, flex: '0 0 auto' }} />
                </button>
              );
            }) : (
              <div style={{ padding: '10px 12px', fontSize: 12, opacity: 0.72 }}>No assignees found.</div>
            )}
          </div>
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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncedQuery = useDebouncedValue(query, 250);
  const search = usePluginData<UpstreamProjectSearchData>('sync.upstreamProjects.search', {
    companyId: props.companyId,
    providerId: props.providerId ?? undefined,
    query: props.providerId && open ? debouncedQuery : ''
  });

  useEffect(() => {
    if (!open && props.value !== query) {
      setQuery(props.value);
    }
  }, [open, props.value, query]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
      setQuery(props.value);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open, props.value]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setHighlightedIndex(0);
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [open]);

  const suggestions = search.data?.suggestions ?? [];
  const searchError = search.data?.errorMessage;
  const canSearch = Boolean(props.providerId && !props.disabled);
  const normalizedQuery = query.trim();
  const selectedKey = props.value.trim().toLowerCase();

  const options = useMemo(() => {
    const items: Array<{
      key: string;
      value: string;
      label: string;
      secondary?: string;
      custom?: boolean;
    }> = [];

    for (const suggestion of suggestions) {
      const suggestionValue = suggestion.key.trim();
      const optionKey = suggestionValue.toLowerCase();
      if (items.some((item) => item.key === optionKey || item.value.toLowerCase() === optionKey)) {
        continue;
      }
      items.push({
        key: optionKey,
        value: suggestionValue,
        label: isGitHubProviderType(props.providerType)
          ? (suggestion.displayName || suggestionValue)
          : suggestionValue,
        secondary: isGitHubProviderType(props.providerType)
          ? (suggestion.url ?? suggestionValue)
          : (suggestion.displayName && suggestion.displayName !== suggestionValue ? suggestion.displayName : undefined)
      });
    }

    if (
      normalizedQuery.length > 0
      && !items.some((item) => item.value.toLowerCase() === normalizedQuery.toLowerCase())
    ) {
      items.unshift({
        key: `__custom__:${normalizedQuery.toLowerCase()}`,
        value: normalizedQuery,
        label: normalizedQuery,
        secondary: getCustomProjectSelectionLabel(props.providerType),
        custom: true
      });
    }

    if (props.value.trim() && !items.some((item) => item.value.toLowerCase() === selectedKey)) {
      items.unshift({
        key: selectedKey,
        value: props.value.trim(),
        label: props.value.trim(),
        secondary: getCurrentProjectSelectionLabel(props.providerType)
      });
    }

    return items;
  }, [normalizedQuery, props.providerType, props.value, selectedKey, suggestions]);

  function commitSelection(value: string) {
    props.onChange(value);
    setQuery(value);
    setOpen(false);
  }

  return (
    <label ref={containerRef} style={{ ...stackStyle(6), position: 'relative', zIndex: open ? 80 : 1 }}>
      {props.hideLabel ? null : <span style={{ fontSize: 13, fontWeight: 600 }}>{props.label}</span>}
      <button
        type="button"
        style={selectorTriggerStyle(props.disabled)}
        disabled={props.disabled}
        onClick={() => {
          if (!props.disabled) {
            setQuery(props.value);
            setOpen((current) => !current);
          }
        }}
        onKeyDown={(event) => {
          if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && !props.disabled) {
            event.preventDefault();
            setQuery(props.value);
            setOpen(true);
          }
          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      >
        <span style={{
          minWidth: 0,
          flex: '1 1 auto',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: props.value ? 'inherit' : 'color-mix(in srgb, currentColor 56%, transparent)'
        }}
        >
          {props.value || props.placeholder}
        </span>
        <ChevronDown size={15} style={{ opacity: 0.55, flex: '0 0 auto' }} />
      </button>
      {open ? (
        <div style={selectorPopoverStyle()}>
          <div style={selectorSearchRowStyle()}>
            <Search size={15} style={{ opacity: 0.5, flex: '0 0 auto' }} />
            <input
              ref={inputRef}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                padding: 0,
                fontSize: 14,
                lineHeight: 1.35,
                outline: 'none'
              }}
              value={query}
              placeholder={props.placeholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setHighlightedIndex((current) => (
                    options.length === 0 ? 0 : (current + 1) % options.length
                  ));
                  return;
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setHighlightedIndex((current) => (
                    options.length === 0 ? 0 : (current <= 0 ? options.length - 1 : current - 1)
                  ));
                  return;
                }
                if (event.key === 'Enter') {
                  event.preventDefault();
                  const option = options[highlightedIndex] ?? (normalizedQuery ? {
                    value: normalizedQuery
                  } : null);
                  if (option?.value) {
                    commitSelection(option.value);
                  }
                  return;
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setOpen(false);
                  setQuery(props.value);
                }
              }}
            />
          </div>
          <div style={{
            maxHeight: 240,
            overflowY: 'auto',
            padding: 4
          }}
          >
            {!canSearch ? (
              <div style={{ padding: '10px 12px', fontSize: 12, opacity: 0.72 }}>
                Select a provider before searching {getProviderMappingSummaryNoun(props.providerType)}s.
              </div>
            ) : search.loading ? (
              <div style={{ padding: '10px 12px', fontSize: 12, opacity: 0.72 }}>
                {`Searching ${getProviderMappingSummaryNoun(props.providerType)}s…`}
              </div>
            ) : searchError ? (
              <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--danger, #b91c1c)' }}>{searchError}</div>
            ) : options.length > 0 ? options.map((option, index) => {
              const isSelected = option.value.trim().toLowerCase() === selectedKey;
              const isHighlighted = highlightedIndex === index;
              return (
                <button
                  key={option.key}
                  type="button"
                  style={selectorOptionStyle(isSelected, isHighlighted)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commitSelection(option.value)}
                >
                  <span style={{ minWidth: 0, display: 'grid', gap: 2, flex: '1 1 auto' }}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {option.label}
                    </span>
                    {option.secondary ? (
                      <span style={{ fontSize: 12, opacity: 0.62, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {option.secondary}
                      </span>
                    ) : null}
                  </span>
                  <Check size={15} style={{ opacity: isSelected ? 0.85 : 0, flex: '0 0 auto' }} />
                </button>
              );
            }) : (
              <div style={{ padding: '10px 12px', fontSize: 12, opacity: 0.72 }}>
                No {getProviderMappingSummaryNoun(props.providerType)}s match this search yet.
              </div>
            )}
          </div>
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
      borderRadius: 4,
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
  pending?: boolean;
  pendingLabel?: string;
}): React.JSX.Element {
  const syncProgress = props.pending
    ? {
        ...(props.syncProgress ?? {}),
        status: 'running' as const,
        message: props.pendingLabel ?? 'Sync started.'
      }
    : props.syncProgress;

  if (!syncProgress) {
    return <></>;
  }

  const isRunning = syncProgress.status === 'running';
  const isSuccess = syncProgress.status === 'success';
  const isError = syncProgress.status === 'error';
  const processedCount = syncProgress.processedCount ?? 0;
  const totalCount = syncProgress.totalCount ?? 0;
  const hasKnownProgress = totalCount > 0;
  const progressPercent = hasKnownProgress
    ? Math.max(0, Math.min(100, Math.round((processedCount / totalCount) * 100)))
    : null;
  const summaryText =
    isRunning
      ? (
          hasKnownProgress
            ? `${processedCount} of ${totalCount} issues processed`
            : (syncProgress.message ?? props.pendingLabel ?? 'Sync started.')
        )
      : isError
        ? (syncProgress.message ?? 'Sync failed.')
        : null;
  const stats = [
    { label: 'Imported', value: syncProgress.importedCount ?? 0 },
    { label: 'Updated', value: syncProgress.updatedCount ?? 0 },
    { label: 'Skipped', value: syncProgress.skippedCount ?? 0 },
    { label: 'Failed', value: syncProgress.failedCount ?? 0 }
  ];
  const showStats = isRunning || isSuccess || isError;
  const titleText = isRunning
    ? 'Sync Started'
    : isSuccess
      ? 'Sync Success'
      : isError
        ? 'Sync Failed'
        : 'Ready';

  return (
    <div style={panelStyle(isSuccess ? 'synced' : isError ? 'local' : 'default')}>
      <div style={stackStyle(6)}>
        <div style={{ ...rowStyle(), justifyContent: 'space-between', gap: 12 }}>
          <strong>{titleText}</strong>
          {isRunning || isSuccess || isError ? (
            <span style={badgeStyle(
              isSuccess
                ? 'synced'
                : isError
                  ? 'error'
                  : 'info'
            )}
            >
              {isRunning ? 'In progress' : isSuccess ? 'Completed' : 'Needs attention'}
            </span>
          ) : null}
        </div>
        {summaryText ? (
          <div style={{
            fontSize: 13,
            opacity: 0.84,
            color: isRunning ? 'color-mix(in srgb, #2563eb 72%, currentColor)' : undefined
          }}
          >
            {summaryText}
          </div>
        ) : null}
        {isRunning && progressPercent !== null ? (
          <div style={{ ...rowStyle(), gap: 10 }}>
            <div style={{
              width: 'min(220px, 100%)',
              height: 6,
              borderRadius: 999,
              background: 'color-mix(in srgb, currentColor 10%, transparent)',
              overflow: 'hidden'
            }}
            >
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: 999,
                background: 'var(--foreground, #111827)',
                transition: 'width 180ms ease'
              }}
              />
            </div>
            <span style={{ fontSize: 12, opacity: 0.7 }}>{progressPercent}%</span>
          </div>
        ) : null}
        {showStats || Boolean(syncProgress.checkedAt) ? (
          <div style={{ ...rowStyle(), gap: 8 }}>
            {showStats ? stats.map((stat) => (
              <span
                key={stat.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  padding: '3px 8px',
                  borderRadius: 999,
                  border: '1px solid color-mix(in srgb, var(--border) 92%, transparent)',
                  background: 'var(--background, var(--card, transparent))'
                }}
              >
                <span style={{ opacity: 0.68 }}>{stat.label}</span>
                <strong style={{ fontSize: 12 }}>{stat.value}</strong>
              </span>
            )) : null}
            {syncProgress.checkedAt ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  padding: '3px 8px',
                  borderRadius: 999,
                  border: '1px solid color-mix(in srgb, var(--border) 92%, transparent)',
                  background: 'var(--background, var(--card, transparent))'
                }}
              >
                <span style={{ opacity: 0.68 }}>{isRunning ? 'Started' : 'Last sync'}</span>
                <strong style={{ fontSize: 12 }}>{formatDate(syncProgress.checkedAt)}</strong>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
