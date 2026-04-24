import React from 'react';
import type { UpstreamUserReference } from '../../../assignees.js';
import type { MappingRow } from '../../../types.js';
import type { ProviderType } from '../../../plugin-config.js';
import { sectionCardStyle, stackStyle } from '../../../primitives.js';
import { MappingEditor } from '../components/mapping-editor.js';

export function MappingsTab(props: {
  activeProjectId?: string;
  activeProjectName?: string;
  selectedProviderId?: string;
  selectedProviderType?: ProviderType | null;
  defaultMappingEnabled: boolean;
  defaultProjectKey: string;
  defaultAssignee: UpstreamUserReference | null;
  rows: MappingRow[];
  onCreate: () => void;
  onEdit: (rowId: string) => void;
  onRemove: (rowId: string) => void;
  onToggleEnabled: (rowId: string, enabled: boolean) => void;
  onToggleDefaultEnabled: (enabled: boolean) => void;
}): React.JSX.Element {
  return (
    <div style={sectionCardStyle()}>
      <div style={stackStyle(12)}>
        <div style={stackStyle(4)}>
          <strong>Project mappings</strong>
          <div style={{ fontSize: 12, opacity: 0.74 }}>
            The default mapping is managed from the Essential tab. Add extra rows here only for additional filters or upstream feeds.
          </div>
        </div>
        <MappingEditor
          defaultRow={{
            id: 'mapping-default',
            providerId: props.selectedProviderId ?? '',
            enabled: props.defaultMappingEnabled,
            jiraProjectKey: props.defaultProjectKey,
            jiraJql: '',
            paperclipProjectId: props.activeProjectId ?? '',
            paperclipProjectName: props.activeProjectName ?? '',
            filters: {
              onlyActive: true,
              ...(props.defaultAssignee ? { assignee: props.defaultAssignee } : {})
            }
          }}
          rows={props.rows}
          providerType={props.selectedProviderType ?? null}
          onCreate={props.onCreate}
          onEdit={props.onEdit}
          onRemove={props.onRemove}
          onToggleEnabled={props.onToggleEnabled}
          onToggleDefaultEnabled={props.onToggleDefaultEnabled}
        />
      </div>
    </div>
  );
}
