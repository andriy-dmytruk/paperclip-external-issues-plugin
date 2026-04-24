import React from 'react';
import type { AssignableAgent } from '../../../types.js';
import { panelStyle, rowStyle, sectionCardStyle, stackStyle } from '../../../primitives.js';

function formatAgentOptionLabel(agent: AssignableAgent): string {
  return agent.title ? `${agent.name} (${agent.title})` : agent.name;
}

export function AgentAccessTab(props: {
  enabled: boolean;
  allowedAgentIds: string[];
  assignableAgents: AssignableAgent[];
  assignableAgentsLoading: boolean;
  assignableAgentsError?: string | null;
  setEnabled: (enabled: boolean) => void;
  setAllowedAgentIds: (updater: (current: string[]) => string[]) => void;
}): React.JSX.Element {
  return (
    <div style={sectionCardStyle()}>
      <div style={stackStyle(12)}>
        <div style={stackStyle(4)}>
          <strong>Agent access</strong>
          <div style={{ fontSize: 12, opacity: 0.74 }}>
            Let selected Paperclip agents use issue-provider tools for this project only. Access stays scoped to this project and its current provider.
          </div>
        </div>
        <label style={{ ...rowStyle(), alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={props.enabled}
            onChange={(event) => {
              const enabled = event.target.checked;
              props.setEnabled(enabled);
              if (!enabled) {
                props.setAllowedAgentIds(() => []);
              }
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Allow agents to use issue provider tools for this project
          </span>
        </label>
        <div
          style={{
            ...panelStyle(),
            opacity: props.enabled ? 1 : 0.68
          }}
        >
          <div style={stackStyle(8)}>
            <div style={{ fontSize: 12, opacity: 0.74 }}>Allowed agents</div>
            {props.assignableAgents.length > 0 ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {props.assignableAgents.map((agent) => {
                  const checked = props.allowedAgentIds.includes(agent.id);
                  return (
                    <label
                      key={agent.id}
                      style={{ ...rowStyle(), alignItems: 'center', cursor: props.enabled ? 'pointer' : 'default' }}
                    >
                      <input
                        type="checkbox"
                        disabled={!props.enabled}
                        checked={checked}
                        onChange={(event) => {
                          const nextChecked = event.target.checked;
                          props.setAllowedAgentIds((current) => (
                            nextChecked
                              ? [...current, agent.id].filter((value, index, values) => values.indexOf(value) === index)
                              : current.filter((value) => value !== agent.id)
                          ));
                        }}
                      />
                      <span style={{ fontSize: 13 }}>{formatAgentOptionLabel(agent)}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 12, opacity: 0.74 }}>
                {props.assignableAgentsLoading ? 'Loading Paperclip agents…' : 'No active Paperclip agents are available yet.'}
              </div>
            )}
          </div>
        </div>
        {props.assignableAgentsError ? (
          <div style={{ fontSize: 12, color: 'var(--danger-text, #dc2626)' }}>
            Could not load Paperclip agents right now. {props.assignableAgentsError}
          </div>
        ) : null}
      </div>
    </div>
  );
}
