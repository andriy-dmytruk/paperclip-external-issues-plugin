import {realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {definePlugin, runWorker} from '@paperclipai/plugin-sdk';
import {createProviderRegistry} from './providers/index.ts';
import {registerIssueSyncActions} from './worker/issue-actions/index.ts';
import {registerSyncCleanupActions} from './worker/cleanup/index.ts';
import {registerIssueProviderAgentTools as registerIssueProviderAgentToolsFromCore} from './worker/agent-tools/index.ts';
import {registerSyncDataHandlers} from './worker/data/index.ts';
import {registerSyncActions} from './worker/sync-actions/index.ts';
import {registerSyncJobs} from './worker/jobs/index.ts';
import type {PluginSetupContext} from './worker/core/context.ts';
import {normalizeOptionalString} from './worker/core/utils.ts';
import {DEFAULT_ISSUE_TYPE, DEFAULT_PROVIDER_ID} from './worker/core/defaults.ts';
import {createProviderConfigResolver} from './worker/providers/config-resolver.ts';
createProviderConfigResolver<PluginSetupContext>({
  normalizeOptionalString,
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

export function shouldStartWorkerHost(entrypointUrl: string, argvEntry?: string): boolean {
  const argvEntryPath = normalizeOptionalString(argvEntry);
  if (!argvEntryPath) {
    return true;
  }

  try {
    const workerEntrypointPath = realpathSync(fileURLToPath(entrypointUrl));
    return workerEntrypointPath === realpathSync(argvEntryPath);
  } catch {
    return false;
  }
}

export default plugin;

if (shouldStartWorkerHost(import.meta.url, process.argv[1])) {
  runWorker(plugin, import.meta.url);
}
