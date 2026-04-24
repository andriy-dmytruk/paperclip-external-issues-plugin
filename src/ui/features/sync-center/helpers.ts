import {
  DEFAULT_JIRA_ISSUE_TYPE,
  type JiraPluginConfig,
  type JiraProviderConfig,
  type ProviderType
} from '../../plugin-config.js';
import {
  isGitHubProviderType,
  isJiraProviderType,
  normalizeProviderConfig
} from '../../../providers/shared/config.ts';

export function buildConfiguredProviders(config: JiraPluginConfig): JiraProviderConfig[] {
  const merged = [
    ...(Array.isArray(config.jiraDcProviders) ? config.jiraDcProviders : []),
    ...(Array.isArray(config.jiraCloudProviders) ? config.jiraCloudProviders : []),
    ...(Array.isArray(config.githubProviders) ? config.githubProviders : [])
  ];
  if (merged.length > 0) {
    return merged
      .map((provider, index) => normalizeProviderConfig({
        ...provider,
        id: provider.id || `provider-${index + 1}`,
        name: provider.name || `Provider ${index + 1}`
      }, index))
      .filter((provider): provider is JiraProviderConfig => provider !== null);
  }
  return [];
}

export function splitProviderConfigCollections(providers: JiraProviderConfig[]): Pick<JiraPluginConfig, 'jiraDcProviders' | 'jiraCloudProviders' | 'githubProviders'> {
  return {
    jiraDcProviders: providers.filter((provider) => provider.type === 'jira_dc'),
    jiraCloudProviders: providers.filter((provider) => provider.type === 'jira_cloud'),
    githubProviders: providers.filter((provider) => provider.type === 'github_issues')
  };
}

export function createProviderId(): string {
  return `provider-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyProviderDraft(type: ProviderType = 'jira_dc'): JiraProviderConfig {
  return {
    id: createProviderId(),
    type,
    name: '',
    ...(isGitHubProviderType(type)
      ? { githubApiBaseUrl: 'https://api.github.com' }
      : { defaultIssueType: DEFAULT_JIRA_ISSUE_TYPE })
  };
}

export function getProviderTokenRef(provider: JiraProviderConfig | null | undefined): string | undefined {
  if (!provider) {
    return undefined;
  }

  return isJiraProviderType(provider.type) ? provider.jiraTokenRef : provider.githubTokenRef;
}

export function getProviderToken(provider: JiraProviderConfig | null | undefined): string | undefined {
  if (!provider) {
    return undefined;
  }

  return isJiraProviderType(provider.type) ? provider.jiraToken : provider.githubToken;
}

export function getProviderApiBase(provider: JiraProviderConfig | null | undefined): string {
  if (!provider) {
    return '';
  }

  return isJiraProviderType(provider.type)
    ? (provider.jiraBaseUrl ?? '')
    : (provider.githubApiBaseUrl ?? '');
}

export function formatProviderHealthLabel(status?: string, fallback?: string): string {
  if (fallback) {
    return fallback;
  }
  if (status === 'connected') {
    return 'Connected';
  }
  if (status === 'degraded') {
    return 'Degraded';
  }
  if (status === 'needs_config') {
    return 'Needs config';
  }
  return 'Not tested';
}

export async function hideIssuesInPaperclip(issueIds: string[]): Promise<string[]> {
  const failedIssueIds: string[] = [];
  const hiddenAtIso = new Date().toISOString();

  for (const issueId of issueIds) {
    try {
      const response = await globalThis.fetch(`/api/issues/${encodeURIComponent(issueId)}`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          hidden: true,
          hiddenAt: hiddenAtIso
        })
      });
      if (!response.ok) {
        failedIssueIds.push(issueId);
      }
    } catch {
      failedIssueIds.push(issueId);
    }
  }

  return failedIssueIds;
}
