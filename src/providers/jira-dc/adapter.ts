import { DEFAULT_JIRA_ISSUE_TYPE, type JiraDcProviderConfig } from '../shared/config.ts';
import type { ProviderConnectionResult } from '../shared/types.ts';
import type { SyncProviderAdapter } from '../shared/registry.ts';

function validateJiraConfig(config: JiraDcProviderConfig) {
  if (!config.jiraBaseUrl?.trim()) {
    return { message: 'Set the Jira base URL before using this provider.' };
  }
  if (!config.jiraToken?.trim() && !config.jiraTokenRef?.trim()) {
    return { message: 'Save a Jira token or token secret reference before using this provider.' };
  }

  return null;
}

export const jiraDcProviderAdapter: SyncProviderAdapter<JiraDcProviderConfig> = {
  type: 'jira_dc',
  label: 'Jira Data Center',
  capabilities: {
    supportsProjectPicker: true,
    supportsUserSearch: true,
    supportsAssignableUsers: true,
    supportsIssueCreation: true,
    supportsComments: true,
    supportsStatusUpdates: true,
    supportsBackgroundSync: true,
    supportsCreatorLookup: true
  },
  validateConfig(config) {
    return validateJiraConfig({
      ...config,
      defaultIssueType: config.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE
    });
  },
  async testConnection(context, config): Promise<ProviderConnectionResult> {
    const tester = (context as { testJiraConnection?: (config: JiraDcProviderConfig) => Promise<ProviderConnectionResult> }).testJiraConnection;
    if (!tester) {
      return {
        status: 'error',
        message: 'Jira Data Center connection testing is not available in this context.'
      };
    }

    return await tester(config);
  },
  async listUpstreamProjects(context, config, query) {
    const lister = (context as {
      listUpstreamProjects?: (providerType: 'jira_dc', config: JiraDcProviderConfig, query?: string) => Promise<Array<{ id: string; key: string; displayName: string; url?: string }>>;
    }).listUpstreamProjects;
    if (!lister) {
      return [];
    }

    return await lister('jira_dc', config, query);
  }
};
