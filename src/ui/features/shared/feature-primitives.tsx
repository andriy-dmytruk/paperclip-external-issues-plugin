import React from 'react';
import { badgeStyle } from '../../primitives.js';
import { isGitHubProviderType } from '../../../providers/shared/config.ts';
import type { MappingRow } from '../../types.js';
import type { ProviderType } from '../../plugin-config.js';

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
    borderRadius: 16,
    padding: 16,
    background: 'color-mix(in srgb, currentColor 2%, var(--card, transparent))',
    minWidth: 0,
    display: 'grid',
    gap: 10
  };
}

export function tabListStyle(): React.CSSProperties {
  return {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  };
}

export function tabButtonStyle(selected = false): React.CSSProperties {
  return {
    borderRadius: 999,
    padding: '7px 12px',
    border: '1px solid var(--border)',
    background: selected ? 'color-mix(in srgb, currentColor 8%, transparent)' : 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: selected ? 600 : 500
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
