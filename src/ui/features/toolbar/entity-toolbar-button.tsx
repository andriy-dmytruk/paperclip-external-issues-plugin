import React, { useEffect, useState } from 'react';
import { useHostContext, usePluginData, usePluginToast } from '@paperclipai/plugin-sdk/ui';
import { useActionRunner } from '../../hooks.js';
import { getProviderTypeLabel } from '../../plugin-config.js';
import {
  buttonStyle,
  iconButtonStyle,
  modalBackdropStyle,
  modalPanelStyle,
  renderButtonIcon,
  renderProviderIcon
} from '../../primitives.js';
import type { ProjectToolbarState } from '../../types.js';
import { SyncCenterSurface } from '../sync-center/sync-center-surface.js';

export function JiraSyncEntityToolbarButton(): React.JSX.Element {
  const context = useHostContext();
  const toast = usePluginToast();
  const companyId = context.companyId ?? '';
  const projectId = context.entityType === 'project' ? context.entityId ?? '' : '';
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const toolbarState = usePluginData<ProjectToolbarState>('sync.projectToolbarState', {
    companyId,
    projectId: projectId || undefined
  });
  const runSync = useActionRunner<{
    companyId: string;
    projectId?: string;
  }>('sync.runNow');

  if (!companyId || !projectId) {
    return <></>;
  }

  const configured = toolbarState.data?.configured === true;
  const providerType = toolbarState.data?.providerType ?? null;
  const syncStatus = toolbarState.data?.syncStatus ?? 'idle';
  const configureLabel = configured
    ? `Configure ${getProviderTypeLabel(providerType)}`
    : 'Configure External Issue Sync';
  const dotColor = syncStatus === 'success'
    ? '#16a34a'
    : syncStatus === 'error'
      ? '#dc2626'
      : 'color-mix(in srgb, currentColor 36%, transparent)';

  useEffect(() => {
    if (!configModalOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConfigModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [configModalOpen]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
      <button
        type="button"
        style={{
          ...buttonStyle('secondary'),
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap'
        }}
        title="Open project-specific external issue sync settings."
        onClick={() => {
          setConfigModalOpen(true);
        }}
      >
        {configured
          ? renderProviderIcon(providerType)
          : renderButtonIcon('settings')}
        <span>{configureLabel}</span>
        <span
          aria-hidden="true"
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: dotColor,
            border: '1px solid color-mix(in srgb, var(--border) 72%, transparent)',
            flex: '0 0 auto'
          }}
        />
      </button>
      <button
        type="button"
        style={iconButtonStyle()}
        title="Sync issues now"
        aria-label="Sync issues now"
        disabled={runSync.busy || !configured}
        onClick={() => {
          if (!configured) {
            toast({
              title: 'External Issue Sync',
              body: 'Configure a provider first, then sync from this button.'
            });
            return;
          }
          void runSync.run({
            companyId,
            projectId
          }).then(() => {
            void toolbarState.refresh();
          });
        }}
      >
        {renderButtonIcon('sync')}
      </button>
      {configModalOpen ? (
        <div
          style={modalBackdropStyle()}
          onClick={() => setConfigModalOpen(false)}
        >
          <div
            style={{ ...modalPanelStyle(980), padding: 0, position: 'relative', overflow: 'hidden' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              style={{ ...iconButtonStyle(), position: 'absolute', top: 10, right: 10, zIndex: 2 }}
              aria-label="Close sync configuration"
              title="Close"
              onClick={() => setConfigModalOpen(false)}
            >
              {renderButtonIcon('close')}
            </button>
            <div style={{ padding: 12 }}>
              <SyncCenterSurface
                companyId={companyId}
                scopeProjectId={projectId}
                embeddedTitle="External Issue Sync"
                modal
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
