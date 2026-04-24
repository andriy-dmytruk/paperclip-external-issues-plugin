import React from 'react';

export function ProviderDisabledCleanupSection(props: {
  sectionCardStyle: () => React.CSSProperties;
  stackStyle: (gap?: number) => React.CSSProperties;
  rowStyle: () => React.CSSProperties;
  buttonStyle: (tone?: 'primary' | 'secondary' | 'success') => React.CSSProperties;
  buttonLabel: (icon: any, label: string) => React.JSX.Element;
  activeProjectId?: string;
  cleanupBusy: boolean;
  onCleanup: () => void;
  bottomMessageNode: React.JSX.Element;
}): React.JSX.Element {
  return (
    <div style={props.sectionCardStyle()}>
      <div style={props.stackStyle(10)}>
        <strong>Imported issue cleanup</strong>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Cleanup stays available even when no provider is currently selected for this project.
        </div>
        <div style={props.rowStyle()}>
          <button
            type="button"
            style={props.buttonStyle()}
            disabled={!props.activeProjectId || props.cleanupBusy}
            onClick={props.onCleanup}
          >
            {props.buttonLabel('hide', props.cleanupBusy ? 'Preparing…' : 'Hide imported issues')}
          </button>
        </div>
        {props.bottomMessageNode}
      </div>
    </div>
  );
}

export function ProjectSyncActionsSection(props: {
  rowStyle: () => React.CSSProperties;
  buttonStyle: (tone?: 'primary' | 'secondary' | 'success') => React.CSSProperties;
  buttonLabel: (icon: any, label: string) => React.JSX.Element;
  activeProjectId?: string;
  saveProjectBusy: boolean;
  configSaving: boolean;
  runSyncBusy: boolean;
  cleanupBusy: boolean;
  onSave: () => void;
  onRunSync: () => void;
  onCleanup: () => void;
}): React.JSX.Element {
  return (
    <div style={{ ...props.rowStyle(), gap: 10 }}>
      <button
        type="button"
        style={props.buttonStyle('primary')}
        disabled={!props.activeProjectId || props.saveProjectBusy || props.configSaving}
        onClick={props.onSave}
      >
        {props.buttonLabel('save', props.saveProjectBusy || props.configSaving ? 'Saving…' : 'Save settings')}
      </button>
      <button
        type="button"
        style={props.buttonStyle('success')}
        disabled={!props.activeProjectId || props.runSyncBusy || props.saveProjectBusy || props.configSaving}
        onClick={props.onRunSync}
      >
        {props.buttonLabel('sync', props.runSyncBusy ? 'Syncing…' : 'Sync issues')}
      </button>
      <button
        type="button"
        style={props.buttonStyle()}
        disabled={!props.activeProjectId || props.cleanupBusy || props.saveProjectBusy}
        onClick={props.onCleanup}
      >
        {props.buttonLabel('hide', props.cleanupBusy ? 'Preparing…' : 'Hide imported issues')}
      </button>
    </div>
  );
}
