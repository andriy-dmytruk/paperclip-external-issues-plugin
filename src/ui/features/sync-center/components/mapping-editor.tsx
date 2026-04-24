import React from 'react';
import { isGitHubProviderType } from '../../../../providers/shared/config.ts';
import { formatUpstreamUserLabel } from '../../../assignees.js';
import type { MappingRow } from '../../../types.js';
import type { ProviderType } from '../../../plugin-config.js';
import {
  buttonStyle,
  getProviderMappingSummaryNoun,
  getProviderProjectLabel,
  rowStyle,
  sectionCardStyle,
  stackStyle,
  statusMappingHeaderCellStyle
} from '../../../primitives.js';
import {
  formatMappingNumberRange,
  mappingTableMutedTextStyle,
  statusMappingCellStyle
} from '../../shared/feature-primitives.js';

function buildMappingRuleSummary(row: MappingRow, providerType?: ProviderType | null): string {
  const rules: string[] = [];
  if (!isGitHubProviderType(providerType) && row.jiraJql.trim()) {
    rules.push('Custom JQL');
  }
  if (row.filters.onlyActive) {
    rules.push('Active only');
  }
  return rules.length > 0 ? rules.join(' • ') : `All ${getProviderMappingSummaryNoun(providerType)}`;
}

export function MappingEditor(props: {
  defaultRow?: MappingRow | null;
  rows: MappingRow[];
  providerType?: ProviderType | null;
  onCreate: () => void;
  onEdit: (rowId: string) => void;
  onRemove: (rowId: string) => void;
  onToggleEnabled: (rowId: string, enabled: boolean) => void;
  onToggleDefaultEnabled: (enabled: boolean) => void;
}): React.JSX.Element {
  const allRows = [
    ...(props.defaultRow ? [{ row: props.defaultRow, isDefault: true }] : []),
    ...props.rows.map((row) => ({ row, isDefault: false }))
  ];

  return (
    <div style={stackStyle(12)}>
      {allRows.length === 0 ? (
        <div style={{ ...sectionCardStyle(), fontSize: 13, opacity: 0.72 }}>
          No mappings yet. Add one to connect this Paperclip project to an upstream issue source.
        </div>
      ) : (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 4,
          overflow: 'hidden'
        }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'color-mix(in srgb, var(--muted, #888) 10%, transparent)' }}>
                <th style={statusMappingHeaderCellStyle()}>Enabled</th>
                <th style={statusMappingHeaderCellStyle()}>{getProviderProjectLabel(props.providerType)}</th>
                <th style={statusMappingHeaderCellStyle()}>Rules</th>
                <th style={statusMappingHeaderCellStyle()}>Creator</th>
                <th style={statusMappingHeaderCellStyle()}>Assignee</th>
                <th style={statusMappingHeaderCellStyle()}>Issue Numbers</th>
                <th style={statusMappingHeaderCellStyle()}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map(({ row, isDefault }) => (
                <tr key={row.id}>
                  <td style={statusMappingCellStyle()}>
                    <input
                      type="checkbox"
                      checked={row.enabled !== false}
                      onChange={(event) => {
                        if (isDefault) {
                          props.onToggleDefaultEnabled(event.target.checked);
                          return;
                        }
                        props.onToggleEnabled(row.id, event.target.checked);
                      }}
                    />
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <div style={stackStyle(4)}>
                      <strong style={{ fontSize: 13 }}>
                        {row.jiraProjectKey || `No ${getProviderProjectLabel(props.providerType).toLowerCase()} selected`}
                      </strong>
                      {isDefault ? (
                        <div style={mappingTableMutedTextStyle()}>
                          Primary mapping managed from the Essential tab.
                        </div>
                      ) : null}
                      {!isGitHubProviderType(props.providerType) && row.jiraJql.trim() ? (
                        <div style={mappingTableMutedTextStyle()}>{row.jiraJql}</div>
                      ) : null}
                    </div>
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <span style={mappingTableMutedTextStyle()}>{buildMappingRuleSummary(row, props.providerType)}</span>
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <span style={mappingTableMutedTextStyle()}>
                      {row.filters.author ? formatUpstreamUserLabel(row.filters.author) : 'Any'}
                    </span>
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <span style={mappingTableMutedTextStyle()}>
                      {row.filters.assignee ? formatUpstreamUserLabel(row.filters.assignee) : 'Any'}
                    </span>
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <span style={mappingTableMutedTextStyle()}>{formatMappingNumberRange(row)}</span>
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {isDefault ? (
                        <span style={mappingTableMutedTextStyle()}>Managed in Essential tab</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            style={buttonStyle('secondary')}
                            onClick={() => props.onEdit(row.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={buttonStyle()}
                            onClick={() => props.onRemove(row.id)}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={rowStyle()}>
        <button
          type="button"
          style={buttonStyle()}
          onClick={props.onCreate}
        >
          Add mapping
        </button>
      </div>
    </div>
  );
}
