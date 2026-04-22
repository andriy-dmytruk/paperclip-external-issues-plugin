import type { SyncProviderAdapter } from '../shared/registry.ts';
import type { GitHubIssuesProviderConfig } from '../shared/config.ts';

export const githubIssuesProviderAdapter: SyncProviderAdapter<GitHubIssuesProviderConfig> = {
  type: 'github_issues',
  label: 'GitHub Issues',
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
    if (!config.githubToken?.trim() && !config.githubTokenRef?.trim()) {
      return { message: 'Save a GitHub token or token secret reference before using this provider.' };
    }

    return null;
  }
};
