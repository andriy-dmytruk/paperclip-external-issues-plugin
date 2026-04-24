import { definePlugin } from '@paperclipai/plugin-sdk';
import { createProviderRegistry } from '../../providers/index.ts';
import { COMMENT_LINKS_STATE_KEY, DEFAULT_ISSUE_TYPE, DEFAULT_PROVIDER_ID, ISSUE_LINK_ENTITY_TYPE } from './defaults.ts';
import { normalizeOptionalString } from './utils.ts';
import { createProviderConfigResolver } from '../providers/config-resolver.ts';
import type { UpstreamIssueLinkData } from './models.ts';

export type PluginSetupContext = Parameters<Parameters<typeof definePlugin>[0]['setup']>[0];

export const providerConfigResolver = createProviderConfigResolver<PluginSetupContext>({
  normalizeOptionalString,
  defaultProviderId: DEFAULT_PROVIDER_ID,
  defaultIssueType: DEFAULT_ISSUE_TYPE
});

export const providerRegistry = createProviderRegistry<PluginSetupContext>();

export { ISSUE_LINK_ENTITY_TYPE };
export { COMMENT_LINKS_STATE_KEY };
export type { UpstreamIssueLinkData };
