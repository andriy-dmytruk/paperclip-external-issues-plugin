import React from 'react';
import type { AssignableAgent, StatusMappingRow } from '../../../types.js';
import type { ProviderType } from '../../../plugin-config.js';
import {
  PAPERCLIP_STATUS_OPTIONS,
  buttonLabel,
  buttonStyle,
  formatIssueStatus,
  getProviderPlatformName,
  getProviderStatusLabel,
  inputStyle,
  rowStyle,
  sectionCardStyle,
  stackStyle,
  statusMappingHeaderCellStyle
} from '../../../primitives.js';
import { statusMappingCellStyle } from '../../shared/feature-primitives.js';

function formatAgentOptionLabel(agent: AssignableAgent): string {
  return agent.title ? `${agent.name} (${agent.title})` : agent.name;
}

export function StatusMappingTab(props: {
  providerType?: ProviderType | null;
  activeProjectId?: string;
  defaultStatus: string;
  defaultStatusAssigneeAgentId: string;
  statusMappings: StatusMappingRow[];
  assignableAgents: AssignableAgent[];
  assignableAgentsError?: string | null;
  setDefaultStatus: (value: string) => void;
  setDefaultStatusAssigneeAgentId: (value: string) => void;
  setStatusMappings: (updater: (current: StatusMappingRow[]) => StatusMappingRow[]) => void;
}): React.JSX.Element {
  return (
    <div style={sectionCardStyle()}>
      <div style={stackStyle(12)}>
        <div style={stackStyle(4)}>
          <strong>Upstream to Paperclip status mapping</strong>
          <div style={{ fontSize: 12, opacity: 0.74 }}>
            {getProviderPlatformName(props.providerType)} issue status changes can update the local Paperclip status and optionally assign a Paperclip agent.
          </div>
        </div>
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 4,
          overflow: 'hidden'
        }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'color-mix(in srgb, var(--muted, #888) 10%, transparent)' }}>
                <th style={statusMappingHeaderCellStyle()}>{getProviderStatusLabel(props.providerType)}</th>
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
                    value={props.defaultStatus}
                    disabled={!props.activeProjectId}
                    onChange={(event) => props.setDefaultStatus(event.target.value)}
                  >
                    {PAPERCLIP_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{formatIssueStatus(status)}</option>
                    ))}
                  </select>
                </td>
                <td style={statusMappingCellStyle()}>
                  <select
                    style={inputStyle()}
                    value={props.defaultStatusAssigneeAgentId}
                    disabled={!props.activeProjectId}
                    onChange={(event) => props.setDefaultStatusAssigneeAgentId(event.target.value)}
                  >
                    <option value="">None</option>
                    {props.assignableAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{formatAgentOptionLabel(agent)}</option>
                    ))}
                  </select>
                </td>
                <td style={statusMappingCellStyle()}>
                  <span style={{ fontSize: 12, opacity: 0.72 }}>Fallback</span>
                </td>
              </tr>
              {props.statusMappings.map((mapping) => (
                <tr key={mapping.id}>
                  <td style={statusMappingCellStyle()}>
                    <input
                      style={inputStyle()}
                      value={mapping.jiraStatus}
                      placeholder={getProviderStatusLabel(props.providerType)}
                      onChange={(event) => props.setStatusMappings((current) => current.map((entry) => (
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
                      onChange={(event) => props.setStatusMappings((current) => current.map((entry) => (
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
                      onChange={(event) => props.setStatusMappings((current) => current.map((entry) => (
                        entry.id === mapping.id
                          ? { ...entry, assigneeAgentId: event.target.value }
                          : entry
                      )))}
                    >
                      <option value="">None</option>
                      {props.assignableAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>{formatAgentOptionLabel(agent)}</option>
                      ))}
                    </select>
                  </td>
                  <td style={statusMappingCellStyle()}>
                    <button
                      type="button"
                      style={buttonStyle()}
                      onClick={() => props.setStatusMappings((current) => current.filter((entry) => entry.id !== mapping.id))}
                    >
                      {buttonLabel('close', 'Remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {props.assignableAgentsError ? (
          <div style={{ fontSize: 12, color: 'var(--danger-text, #dc2626)' }}>
            Could not load Paperclip agents right now. {props.assignableAgentsError}
          </div>
        ) : null}
        <div style={rowStyle()}>
          <button
            type="button"
            style={buttonStyle()}
            onClick={() => props.setStatusMappings((current) => [...current, {
              id: `status-mapping-${Date.now()}`,
              jiraStatus: '',
              paperclipStatus: props.defaultStatus,
              assigneeAgentId: ''
            }])}
          >
            {buttonLabel('add', 'Add status mapping')}
          </button>
        </div>
      </div>
    </div>
  );
}
