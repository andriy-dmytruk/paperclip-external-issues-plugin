import React from 'react';

type AnyRecord = Record<string, any>;

export function ProjectProviderSelectionSection(props: {
  sectionCardStyle: () => React.CSSProperties;
  stackStyle: (gap?: number) => React.CSSProperties;
  rowStyle: () => React.CSSProperties;
  buttonStyle: (tone?: 'primary' | 'secondary' | 'success') => React.CSSProperties;
  inputStyle: () => React.CSSProperties;
  buttonLabel: (icon: any, label: string) => React.JSX.Element;
  healthBadgeStyle: (status?: string) => React.CSSProperties;
  formatProviderHealthLabel: (status?: string, fallback?: string) => string;
  shouldShowProviderHealthMessage: (status?: string | null) => boolean;
  selectedProviderStatus?: AnyRecord | null;
  configuredProviders: Array<{ id: string; name: string }>;
  selectedProviderId: string;
  selectedProvider?: { id: string; type?: string } | null;
  providerEnabled: boolean;
  activeProjectId?: string;
  saveProjectBusy: boolean;
  onProviderSelection: (providerId: string) => void;
  onCreateProvider: () => void;
  onEditProvider: () => void;
  onDisableSync: () => void;
}): React.JSX.Element {
  return (
    <div style={props.sectionCardStyle()}>
      <div style={props.stackStyle(12)}>
        <div style={props.rowStyle()}>
          <strong>Provider</strong>
          {props.selectedProviderStatus ? (
            <span style={props.healthBadgeStyle(props.selectedProviderStatus.status)}>
              {props.formatProviderHealthLabel(props.selectedProviderStatus.status, props.selectedProviderStatus.healthLabel)}
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <select
            style={{ ...props.inputStyle(), flex: '1 1 280px', minWidth: 220 }}
            value={props.selectedProviderId}
            disabled={!props.activeProjectId}
            onChange={(event) => props.onProviderSelection(event.target.value)}
          >
            <option value="">None</option>
            {props.configuredProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name || 'Untitled provider'}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={props.buttonStyle()}
              onClick={props.onCreateProvider}
            >
              {props.buttonLabel('add', 'Create provider')}
            </button>
            <button
              type="button"
              style={props.buttonStyle()}
              disabled={!props.selectedProvider}
              onClick={props.onEditProvider}
            >
              {props.buttonLabel('save', 'Edit provider')}
            </button>
            <button
              type="button"
              style={props.buttonStyle()}
              disabled={!props.providerEnabled || !props.activeProjectId || props.saveProjectBusy}
              onClick={props.onDisableSync}
            >
              {props.buttonLabel('close', props.saveProjectBusy ? 'Disabling…' : 'Disable syncing')}
            </button>
          </div>
        </div>
        {!props.providerEnabled ? (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Select a provider when you want to enable sync. Imported-issue cleanup stays available even when syncing is disabled.
          </div>
        ) : null}
        {props.providerEnabled && props.shouldShowProviderHealthMessage(props.selectedProviderStatus?.status) && props.selectedProviderStatus?.healthMessage ? (
          <div style={{ fontSize: 12, opacity: 0.72 }}>
            {props.selectedProviderStatus.healthMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
