import { DEFAULT_JIRA_ISSUE_TYPE, type JiraCloudProviderConfig } from '../shared/config.ts';
import type { ProviderConnectionResult } from '../shared/types.ts';
import type { SyncProviderAdapter } from '../shared/registry.ts';

function validateJiraCloudConfig(config: JiraCloudProviderConfig) {
  if (!config.jiraBaseUrl?.trim()) {
    return { message: 'Set the Jira Cloud base URL before using this provider.' };
  }
  if (!config.jiraUserEmail?.trim()) {
    return { message: 'Set the Jira Cloud user email before using this provider.' };
  }
  if (!config.jiraToken?.trim() && !config.jiraTokenRef?.trim()) {
    return { message: 'Save a Jira Cloud API token or token secret reference before using this provider.' };
  }

  return null;
}

export const jiraCloudProviderAdapter: SyncProviderAdapter<JiraCloudProviderConfig> = {
  type: 'jira_cloud',
  label: 'Jira Cloud',
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
    return validateJiraCloudConfig({
      ...config,
      defaultIssueType: config.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE
    });
  },
  async testConnection(context, config): Promise<ProviderConnectionResult> {
    const tester = (context as { testJiraConnection?: (config: JiraCloudProviderConfig) => Promise<ProviderConnectionResult> }).testJiraConnection;
    if (!tester) {
      return {
        status: 'error',
        message: 'Jira Cloud connection testing is not available in this context.'
      };
    }

    return await tester(config);
  },
  async listUpstreamProjects(context, config, query) {
    const lister = (context as {
      listUpstreamProjects?: (providerType: 'jira_cloud', config: JiraCloudProviderConfig, query?: string) => Promise<Array<{ id: string; key: string; displayName: string; url?: string }>>;
    }).listUpstreamProjects;
    if (!lister) {
      return [];
    }

    return await lister('jira_cloud', config, query);
  }
};
