import React from 'react';
import type { MappingRow } from '../../../types.js';
import type { ProviderType } from '../../../plugin-config.js';
import { isGitHubProviderType } from '../../../../providers/shared/config.ts';
import {
  buttonStyle,
  checkboxLabelStyle,
  inputStyle,
  modalBackdropStyle,
  modalPanelStyle,
  providerLabel,
  rowStyle,
  stackStyle,
  statusMappingHeaderCellStyle,
  getProviderPlatformName,
  getProviderUsersPlaceholder
} from '../../../primitives.js';
import { statusMappingCellStyle } from '../../shared/feature-primitives.js';
import { UpstreamUserAutocomplete } from '../../shared/shared-controls.js';
import { UpstreamProjectFieldRow, renderUpstreamProjectHint } from './upstream-project-field.js';

export function MappingModal(props: {
  companyId: string;
  providerId?: string | null;
  providerType?: ProviderType | null;
  draft: MappingRow;
  mode: 'create' | 'edit';
  projectPageSuggestions?: Partial<Record<ProviderType, string>>;
  activeProjectSuggestions?: Partial<Record<ProviderType, string>>;
  onClose: () => void;
  onChange: (updater: (current: MappingRow) => MappingRow) => void;
  onSave: () => void;
}): React.JSX.Element {
  return (
    <div style={modalBackdropStyle()}>
      <div style={modalPanelStyle(680)}>
        <div style={stackStyle(12)}>
          <div style={rowStyle()}>
            <strong>{props.mode === 'create' ? 'Create mapping' : 'Edit mapping'}</strong>
            <span style={{
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
            }}
            >
              {providerLabel(props.providerType, getProviderPlatformName(props.providerType))}
            </span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.76 }}>
            Define one upstream source plus the filters that should apply when this project syncs.
          </div>
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'visible'
          }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <UpstreamProjectFieldRow
                  companyId={props.companyId}
                  providerId={props.providerId ?? null}
                  providerType={props.providerType ?? null}
                  value={props.draft.jiraProjectKey}
                  onChange={(value) => props.onChange((current) => ({ ...current, jiraProjectKey: value }))}
                  projectPageSuggestions={props.projectPageSuggestions}
                  activeProjectSuggestions={props.activeProjectSuggestions}
                  mappingMode
                />
                {!isGitHubProviderType(props.providerType) ? (
                  <tr>
                    <td style={{ ...statusMappingHeaderCellStyle(), width: '34%', borderBottom: '1px solid var(--border)' }}>
                      JQL override
                    </td>
                    <td style={statusMappingCellStyle()}>
                      <input
                        style={inputStyle()}
                        value={props.draft.jiraJql}
                        placeholder="project = PRJ AND statusCategory != Done ORDER BY updated DESC"
                        onChange={(event) => props.onChange((current) => ({ ...current, jiraJql: event.target.value }))}
                      />
                      <div style={{ fontSize: 12, opacity: 0.72, lineHeight: 1.4, marginTop: 8 }}>
                        If left empty, the mapping uses the project key and filters below.
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          {renderUpstreamProjectHint({
            providerType: props.providerType,
            projectPageSuggestions: props.projectPageSuggestions,
            activeProjectSuggestions: props.activeProjectSuggestions,
            mappingMode: true
          })}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'visible'
          }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ ...statusMappingHeaderCellStyle(), width: '34%', borderBottom: '1px solid var(--border)' }}>
                    Rules
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <label style={checkboxLabelStyle()}>
                      <input
                        type="checkbox"
                        checked={Boolean(props.draft.filters.onlyActive)}
                        onChange={(event) => props.onChange((current) => ({
                          ...current,
                          filters: {
                            ...current.filters,
                            onlyActive: event.target.checked
                          }
                        }))}
                      />J
                      {`Sync only active ${getProviderPlatformName(props.providerType)} issues`}
                    </label>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...statusMappingHeaderCellStyle(), width: '34%', borderBottom: '1px solid var(--border)' }}>
                    Creator
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <UpstreamUserAutocomplete
                      companyId={props.companyId}
                      providerId={props.providerId ?? null}
                      label="Creator"
                      hideLabel
                      value={props.draft.filters.author ?? null}
                      placeholder={getProviderUsersPlaceholder(props.providerType)}
                      onChange={(user) => props.onChange((current) => ({
                        ...current,
                        filters: {
                          ...current.filters,
                          author: user ?? undefined
                        }
                      }))}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...statusMappingHeaderCellStyle(), width: '34%', borderBottom: '1px solid var(--border)' }}>
                    Assignee
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <UpstreamUserAutocomplete
                      companyId={props.companyId}
                      providerId={props.providerId ?? null}
                      label="Assignee"
                      hideLabel
                      value={props.draft.filters.assignee ?? null}
                      placeholder={getProviderUsersPlaceholder(props.providerType)}
                      onChange={(user) => props.onChange((current) => ({
                        ...current,
                        filters: {
                          ...current.filters,
                          assignee: user ?? undefined
                        }
                      }))}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...statusMappingHeaderCellStyle(), width: '34%', borderBottom: '1px solid var(--border)' }}>
                    Issue numbers
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                      <label style={stackStyle(6)}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>From</span>
                        <input
                          style={inputStyle()}
                          type="number"
                          min={0}
                          value={props.draft.filters.issueNumberGreaterThan ?? ''}
                          onChange={(event) => props.onChange((current) => ({
                            ...current,
                            filters: {
                              ...current.filters,
                              issueNumberGreaterThan: event.target.value ? Number(event.target.value) : undefined
                            }
                          }))}
                        />
                      </label>
                      <label style={stackStyle(6)}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>To</span>
                        <input
                          style={inputStyle()}
                          type="number"
                          min={0}
                          value={props.draft.filters.issueNumberLessThan ?? ''}
                          onChange={(event) => props.onChange((current) => ({
                            ...current,
                            filters: {
                              ...current.filters,
                              issueNumberLessThan: event.target.value ? Number(event.target.value) : undefined
                            }
                          }))}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={rowStyle()}>
            <button
              type="button"
              style={buttonStyle()}
              onClick={props.onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              style={buttonStyle('primary')}
              onClick={props.onSave}
            >
              {props.mode === 'create' ? 'Add mapping' : 'Save mapping'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
