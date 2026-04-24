import React from 'react';
import type { ProviderType } from '../../../plugin-config.js';
import { isGitHubProviderType } from '../../../../providers/shared/config.ts';
import {
  getProviderProjectLabel,
  getProviderProjectPlaceholder,
  getSuggestedUpstreamProjectKey,
  getProviderPlatformName
} from '../../../primitives.js';
import { UpstreamProjectAutocomplete } from '../../shared/shared-controls.js';
import { mappingTableMutedTextStyle, statusMappingCellStyle } from '../../shared/feature-primitives.js';
import { statusMappingHeaderCellStyle } from '../../../primitives.js';

export function renderUpstreamProjectHint(props: {
  providerType?: ProviderType | null;
  projectPageSuggestions?: Partial<Record<ProviderType, string>>;
  activeProjectSuggestions?: Partial<Record<ProviderType, string>>;
  mappingMode?: boolean;
}): React.JSX.Element | null {
  if (!isGitHubProviderType(props.providerType)) {
    return null;
  }

  const suggestedRepository = getSuggestedUpstreamProjectKey(props.providerType, {
    suggestedUpstreamProjectKeys: props.projectPageSuggestions
  }) || getSuggestedUpstreamProjectKey(props.providerType, {
    suggestedUpstreamProjectKeys: props.activeProjectSuggestions
  });

  return (
    <div style={{ ...mappingTableMutedTextStyle(), marginTop: props.mappingMode ? 0 : 6 }}>
      {suggestedRepository
        ? `Prefilled from this Paperclip project's bound GitHub repository: ${suggestedRepository}. You can still override it here.`
        : props.mappingMode
          ? 'Use `owner/repo`. Filters below apply to the selected repository feed.'
          : `Use \`owner/repo\` for the default ${getProviderPlatformName(props.providerType)} repository.`}
    </div>
  );
}

export function UpstreamProjectFieldRow(props: {
  companyId: string;
  providerId?: string | null;
  providerType?: ProviderType | null;
  value: string;
  onChange: (value: string) => void;
  projectPageSuggestions?: Partial<Record<ProviderType, string>>;
  activeProjectSuggestions?: Partial<Record<ProviderType, string>>;
  mappingMode?: boolean;
}): React.JSX.Element {
  return (
    <tr>
      <td style={{ ...statusMappingHeaderCellStyle(), width: '34%' }}>
        {getProviderProjectLabel(props.providerType)}
      </td>
      <td style={statusMappingCellStyle()}>
        <UpstreamProjectAutocomplete
          companyId={props.companyId}
          providerId={props.providerId ?? null}
          providerType={props.providerType ?? null}
          label={getProviderProjectLabel(props.providerType)}
          hideLabel
          value={props.value}
          placeholder={getProviderProjectPlaceholder(props.providerType)}
          onChange={props.onChange}
        />
        {!props.mappingMode ? (
          renderUpstreamProjectHint({
            providerType: props.providerType,
            projectPageSuggestions: props.projectPageSuggestions,
            activeProjectSuggestions: props.activeProjectSuggestions
          })
        ) : null}
      </td>
    </tr>
  );
}
