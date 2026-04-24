import { DEFAULT_GITHUB_API_BASE_URL } from '../../providers/shared/config.ts';
import type { ProviderType } from '../../providers/shared/types.ts';
import type {
  GitHubProviderRuntimeConfig as GitHubConfig,
  JiraProviderRuntimeConfig as JiraConfig,
  ProviderDisplayConfig
} from '../providers/config-resolver.ts';

export function isConfigReady(config: JiraConfig): boolean {
  return Boolean(config.baseUrl && config.token);
}

export function buildConfigSummary(config: JiraConfig): { ready: boolean; message: string } {
  if (isConfigReady(config)) {
    return {
      ready: true,
      message: `${config.providerName} is configured for ${config.baseUrl}.`
    };
  }

  return {
    ready: false,
    message: `Set the Jira base URL and token for ${config.providerName}. jiraUserEmail is optional and is only needed for Jira environments that require Basic auth instead of Bearer token auth.`
  };
}

export function buildDisplayConfigSummary(config: ProviderDisplayConfig): { ready: boolean; message: string } {
  if (config.providerType === 'github_issues') {
    if (config.tokenSaved) {
      return {
        ready: true,
        message: config.defaultRepository
          ? `Repository: ${config.defaultRepository}`
          : `API: ${config.githubApiBaseUrl ?? DEFAULT_GITHUB_API_BASE_URL}`
      };
    }

    return {
      ready: false,
      message: 'Token required'
    };
  }

  if (config.baseUrl && config.tokenSaved) {
    return {
      ready: true,
      message: config.baseUrl
    };
  }

  return {
    ready: false,
    message: 'Base URL and token required'
  };
}

export function isGitHubConfigReady(config: GitHubConfig): boolean {
  return Boolean(config.apiBaseUrl && config.token);
}

export function buildGitHubConfigSummary(config: GitHubConfig): { ready: boolean; message: string } {
  if (isGitHubConfigReady(config)) {
    return {
      ready: true,
      message: `${config.providerName} is configured for ${config.apiBaseUrl}.`
    };
  }

  return {
    ready: false,
    message: `Set a GitHub token for ${config.providerName}.`
  };
}

export function buildProviderTypeOptions(
  adapters: Array<{ type: ProviderType; label: string }>
): Array<{ value: ProviderType; label: string }> {
  return adapters.map((adapter) => ({
    value: adapter.type,
    label: adapter.label
  }));
}
