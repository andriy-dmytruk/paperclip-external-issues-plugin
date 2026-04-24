import {definePlugin} from '@paperclipai/plugin-sdk';
import {createProviderRegistry} from './providers/index.ts';
import {registerIssueSyncActions} from './worker/issue-actions/index.ts';
import {registerSyncCleanupActions} from './worker/cleanup/index.ts';
import {registerIssueProviderAgentTools as registerIssueProviderAgentToolsFromCore} from './worker/agent-tools/index.ts';
import {registerSyncDataHandlers} from './worker/data/index.ts';
import {registerSyncActions} from './worker/sync-actions/index.ts';
import {registerSyncJobs} from './worker/jobs/index.ts';
import type {PluginSetupContext} from './worker/core/context.ts';
import {DEFAULT_ISSUE_TYPE, DEFAULT_PROVIDER_ID} from './worker/core/defaults.ts';
import {createProviderConfigResolver} from './worker/providers/config-resolver.ts';
createProviderConfigResolver<PluginSetupContext>({
  normalizeOptionalString: (value) => typeof value === 'string' && value.trim() ? value.trim() : undefined,
  defaultProviderId: DEFAULT_PROVIDER_ID,
  defaultIssueType: DEFAULT_ISSUE_TYPE
});
createProviderRegistry<PluginSetupContext>();

const plugin = definePlugin({
  async setup(ctx) {
    registerIssueProviderAgentToolsFromCore(ctx);

    registerSyncDataHandlers(ctx);

    registerSyncActions(ctx);

    registerIssueSyncActions(ctx);

    registerSyncCleanupActions(ctx);

    registerSyncJobs(ctx);
  },

  async onHealth() {
    return {
      status: 'ok',
      message: 'External Issue Sync plugin ready'
    };
  }
});

export default plugin;
