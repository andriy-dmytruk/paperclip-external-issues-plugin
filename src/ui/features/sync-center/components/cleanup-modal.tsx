import React from 'react';
import type { CleanupCandidate } from '../../../types.js';
import {
  PAPERCLIP_STATUS_OPTIONS,
  badgeStyle,
  buttonStyle,
  formatIssueStatus,
  inputStyle,
  modalBackdropStyle,
  modalPanelStyle,
  panelStyle,
  rowStyle,
  stackStyle
} from '../../../primitives.js';
import { checkboxLabelStyle } from '../../../primitives.js';

export function CleanupModal(props: {
  mode: 'all' | 'status' | 'custom';
  status: string;
  customFilter: string;
  candidates: CleanupCandidate[];
  visibleCandidates: CleanupCandidate[];
  selectedIssueIds: string[];
  onClose: () => void;
  onModeChange: (mode: 'all' | 'status' | 'custom') => void;
  onStatusChange: (status: string) => void;
  onCustomFilterChange: (value: string) => void;
  onToggleIssue: (issueId: string, checked: boolean) => void;
  onConfirm: () => void;
}): React.JSX.Element {
  return (
    <div style={modalBackdropStyle()}>
      <div style={modalPanelStyle(720)}>
        <div style={stackStyle(12)}>
          <div style={rowStyle()}>
            <strong>Hide imported issues</strong>
            <span style={badgeStyle('info')}>{props.candidates.length} candidate{props.candidates.length === 1 ? '' : 's'}</span>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={checkboxLabelStyle()}>
              <input
                type="radio"
                name="cleanup-mode"
                checked={props.mode === 'all'}
                onChange={() => props.onModeChange('all')}
              />
              All imported
            </label>
            <label style={checkboxLabelStyle()}>
              <input
                type="radio"
                name="cleanup-mode"
                checked={props.mode === 'status'}
                onChange={() => props.onModeChange('status')}
              />
              Imported with status
            </label>
            {props.mode === 'status' ? (
              <select
                style={inputStyle()}
                value={props.status}
                onChange={(event) => props.onStatusChange(event.target.value)}
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
                checked={props.mode === 'custom'}
                onChange={() => props.onModeChange('custom')}
              />
              Custom filter
            </label>
            {props.mode === 'custom' ? (
              <input
                style={inputStyle()}
                value={props.customFilter}
                placeholder="Filter by upstream key, title, or Paperclip status"
                onChange={(event) => props.onCustomFilterChange(event.target.value)}
              />
            ) : null}
          </div>
          <div style={{ fontSize: 12, opacity: 0.72 }}>
            Select the imported issues you want to hide. This only hides them in Paperclip and leaves the upstream issues unchanged.
          </div>
          <div style={{ display: 'grid', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {props.visibleCandidates.length === 0 ? (
              <div style={{ fontSize: 13, opacity: 0.72 }}>
                No imported issues match the current hide filter.
              </div>
            ) : props.visibleCandidates.map((candidate) => (
              <label key={candidate.issueId} style={{ ...panelStyle(), ...rowStyle(), alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={props.selectedIssueIds.includes(candidate.issueId)}
                  onChange={(event) => props.onToggleIssue(candidate.issueId, event.target.checked)}
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
              onClick={props.onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              style={buttonStyle('primary')}
              disabled={props.selectedIssueIds.length === 0}
              onClick={props.onConfirm}
            >
              Hide selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
