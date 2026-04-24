import React from 'react';
import { useHostContext, usePluginData } from '@paperclipai/plugin-sdk/ui';
import type { SyncProgressState } from '../../types.js';
import { badgeStyle, buildSyncProgressLabel, cardStyle, formatDate, rowStyle, stackStyle } from '../../primitives.js';

export function JiraSyncDashboardWidget(): React.JSX.Element {
  const context = useHostContext();
  const companyId = context.companyId ?? '';
  const summary = usePluginData<{
    mappingCount: number;
    linkedIssueCount: number;
    syncState?: SyncProgressState;
  }>('dashboard.summary', {
    companyId
  });

  if (!companyId) {
    return <></>;
  }

  return (
    <section style={cardStyle()}>
      <div style={stackStyle(12)}>
        <div style={rowStyle()}>
          <h3 style={{ margin: 0 }}>External Issue Sync</h3>
          <span style={badgeStyle(summary.data?.mappingCount ? 'synced' : 'local')}>
            {summary.data?.mappingCount ? `${summary.data.mappingCount} mapping${summary.data.mappingCount === 1 ? '' : 's'}` : 'No mappings'}
          </span>
        </div>
        <div style={rowStyle()}>
          <div style={{ minWidth: 120 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Linked issues</div>
            <strong>{summary.data?.linkedIssueCount ?? 0}</strong>
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Last sync</div>
            <strong>{formatDate(summary.data?.syncState?.checkedAt)}</strong>
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          {buildSyncProgressLabel(summary.data?.syncState)}
        </div>
        <div style={{ fontSize: 12, opacity: 0.72 }}>
          Use the <strong>Sync Issues</strong> button in the toolbar to open the full sync dialog.
        </div>
      </div>
    </section>
  );
}
