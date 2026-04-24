import React from 'react';
import type { UpstreamUserReference } from '../../../assignees.js';
import type { ProviderType } from '../../../plugin-config.js';
import { getProviderTypeLabel } from '../../../plugin-config.js';
import { buttonLabel, buttonStyle, inputStyle, rowStyle, sectionCardStyle, stackStyle } from '../../../primitives.js';
import { neutralBadgeStyle, statusMappingCellStyle } from '../../shared/feature-primitives.js';
import { UpstreamUserAutocomplete } from '../../shared/shared-controls.js';
import { providerLabel, getProviderUsersPlaceholder, statusMappingHeaderCellStyle } from '../../../primitives.js';
import { UpstreamProjectFieldRow } from '../components/upstream-project-field.js';

export function EssentialTab(props: {
  companyId: string;
  activeProjectId?: string;
  selectedProvider?: {
    id: string;
    type: ProviderType;
  } | null;
  activeProjectName?: string;
  defaultProjectKey: string;
  defaultAssignee: UpstreamUserReference | null;
  scheduleFrequencyMinutes: number;
  projectPageSuggestions?: Partial<Record<ProviderType, string>>;
  activeProjectSuggestions?: Partial<Record<ProviderType, string>>;
  refreshIdentityBusy: boolean;
  setDefaultProjectKey: (value: string) => void;
  setDefaultAssignee: (value: UpstreamUserReference | null) => void;
  setScheduleFrequencyMinutes: (value: number) => void;
  refreshIdentity: (input: { companyId: string; projectId: string; providerId: string }) => Promise<{ defaultAssignee?: UpstreamUserReference | null } | null>;
  refreshSyncData: () => Promise<void>;
}): React.JSX.Element {
  return (
    <div style={{ ...sectionCardStyle(), position: 'relative', zIndex: 4 }}>
      <div style={stackStyle(14)}>
        <div style={rowStyle()}>
          <strong>Essential configuration</strong>
          <span style={neutralBadgeStyle()}>{providerLabel(props.selectedProvider?.type, getProviderTypeLabel(props.selectedProvider?.type))}</span>
        </div>
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 4,
          overflow: 'visible'
        }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <UpstreamProjectFieldRow
                companyId={props.companyId}
                providerId={props.selectedProvider?.id ?? null}
                providerType={props.selectedProvider?.type ?? null}
                value={props.defaultProjectKey}
                onChange={props.setDefaultProjectKey}
                projectPageSuggestions={props.projectPageSuggestions}
                activeProjectSuggestions={props.activeProjectSuggestions}
              />
              <tr>
                <td style={{ ...statusMappingHeaderCellStyle(), width: '34%' }}>
                  Default assignee
                </td>
                <td style={statusMappingCellStyle()}>
                  <UpstreamUserAutocomplete
                    companyId={props.companyId}
                    providerId={props.selectedProvider?.id ?? null}
                    label="Default assignee"
                    hideLabel
                    value={props.defaultAssignee}
                    disabled={!props.activeProjectId}
                    placeholder={getProviderUsersPlaceholder(props.selectedProvider?.type)}
                    trailingAction={(
                      <button
                        type="button"
                        style={buttonStyle()}
                        disabled={!props.activeProjectId || !props.selectedProvider?.id || props.refreshIdentityBusy}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          if (!props.activeProjectId || !props.selectedProvider?.id) {
                            return;
                          }
                          void props.refreshIdentity({
                            companyId: props.companyId,
                            projectId: props.activeProjectId,
                            providerId: props.selectedProvider.id
                          }).then((result) => {
                            const nextAssignee = result?.defaultAssignee ?? null;
                            props.setDefaultAssignee(nextAssignee);
                            void props.refreshSyncData();
                          });
                        }}
                      >
                        {buttonLabel('user', props.refreshIdentityBusy ? 'Loading…' : 'Current user')}
                      </button>
                    )}
                    onChange={props.setDefaultAssignee}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ ...statusMappingHeaderCellStyle(), width: '34%' }}>
                  Scheduled sync cadence (minutes)
                </td>
                <td style={statusMappingCellStyle()}>
                  <input
                    style={inputStyle()}
                    type="number"
                    min={1}
                    max={1440}
                    value={props.scheduleFrequencyMinutes}
                    disabled={!props.activeProjectId}
                    onChange={(event) => props.setScheduleFrequencyMinutes(Number(event.target.value) || 15)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
