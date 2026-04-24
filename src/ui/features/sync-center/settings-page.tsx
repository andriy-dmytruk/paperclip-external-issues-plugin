import React from 'react';
import { useHostContext } from '@paperclipai/plugin-sdk/ui';
import { SyncCenterSurface } from './sync-center-surface.js';

export function JiraSyncSettingsPage(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';

  return companyId
    ? <SyncCenterSurface companyId={companyId} embeddedTitle="Providers" settingsOnly />
    : <></>;
}
