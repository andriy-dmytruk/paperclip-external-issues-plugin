import type { ProviderConfig, JiraDcProviderConfig, JiraCloudProviderConfig, GitHubIssuesProviderConfig } from '../../providers/shared/config.ts';
import { DEFAULT_GITHUB_API_BASE_URL, isGitHubProviderType, isJiraProviderType, getProviderConfigsFromCollections } from '../../providers/shared/config.ts';
import type { ProviderType } from '../../providers/shared/types.ts';

export interface JiraProviderRuntimeConfig {
  providerId: string;
  providerName: string;
  baseUrl?: string;
  userEmail?: string;
  token?: string;
  defaultIssueType: string;
}

export interface GitHubProviderRuntimeConfig {
  providerId: string;
  providerName: string;
  apiBaseUrl: string;
  token?: string;
  defaultRepository?: string;
}

export interface ProviderDisplayConfig {
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  baseUrl?: string;
  userEmail?: string;
  defaultIssueType?: string;
  githubApiBaseUrl?: string;
  defaultRepository?: string;
  tokenSaved: boolean;
}

export type ProviderConfigRecord = Partial<ProviderConfig>;

export function getConfiguredProvidersFromConfig(value: unknown): ProviderConfig[] {
  if (!value || typeof value !== 'object') {
    return [];
  }
  const record = value as Record<string, unknown>;
  const configured = getProviderConfigsFromCollections(record);
  return configured;
}

export function createProviderConfigResolver<TContext extends {
  config: { get(): Promise<unknown> };
  secrets: { resolve(ref: string): Promise<string | undefined> };
}>(deps: {
  normalizeOptionalString(value: unknown): string | undefined;
  defaultProviderId: string;
  defaultIssueType: string;
}) {
  const getAvailableProviders = async (ctx: TContext): Promise<ProviderConfig[]> => (
    getConfiguredProvidersFromConfig(await ctx.config.get())
  );

  const resolveJiraProviderConfig = async (
    ctx: TContext,
    providerId?: string,
    overrides?: ProviderConfigRecord
  ): Promise<JiraProviderRuntimeConfig> => {
    const providers = await getAvailableProviders(ctx);
    const matchedProvider =
      (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
      ?? providers[0]
      ?? {
        id: providerId ?? deps.defaultProviderId,
        type: 'jira_dc' as const,
        name: 'Default Jira'
      };
    const config = {
      ...matchedProvider,
      ...(overrides ?? {})
    };
    if (!isJiraProviderType(config.type)) {
      throw new Error(`Provider ${config.name} does not use Jira transport.`);
    }
    const jiraConfig = config as JiraDcProviderConfig | JiraCloudProviderConfig;
    const baseUrl = deps.normalizeOptionalString(jiraConfig.jiraBaseUrl)?.replace(/\/+$/, '');
    const userEmail = deps.normalizeOptionalString(jiraConfig.jiraUserEmail);
    const tokenRef = deps.normalizeOptionalString(jiraConfig.jiraTokenRef);
    const inlineToken = deps.normalizeOptionalString(jiraConfig.jiraToken);
    const token = inlineToken ?? (tokenRef ? await ctx.secrets.resolve(tokenRef) : undefined);

    return {
      providerId: deps.normalizeOptionalString(config.id) ?? matchedProvider.id,
      providerName: deps.normalizeOptionalString(config.name) ?? matchedProvider.name,
      ...(baseUrl ? { baseUrl } : {}),
      ...(userEmail ? { userEmail } : {}),
      ...(token ? { token } : {}),
      defaultIssueType: deps.normalizeOptionalString(jiraConfig.defaultIssueType) ?? deps.defaultIssueType
    };
  };

  const resolveGitHubProviderConfig = async (
    ctx: TContext,
    providerId?: string,
    overrides?: ProviderConfigRecord
  ): Promise<GitHubProviderRuntimeConfig> => {
    const providers = await getAvailableProviders(ctx);
    const matchedProvider =
      (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
      ?? providers[0]
      ?? {
        id: providerId ?? 'provider-default-github',
        type: 'github_issues' as const,
        name: 'Default GitHub'
      };
    const config = {
      ...matchedProvider,
      ...(overrides ?? {})
    };
    if (!isGitHubProviderType(config.type)) {
      throw new Error(`Provider ${config.name} does not use GitHub transport.`);
    }

    const githubConfig = config as GitHubIssuesProviderConfig;
    const tokenRef = deps.normalizeOptionalString(githubConfig.githubTokenRef);
    const inlineToken = deps.normalizeOptionalString(githubConfig.githubToken);
    const token = inlineToken ?? (tokenRef ? await ctx.secrets.resolve(tokenRef) : undefined);
    return {
      providerId: deps.normalizeOptionalString(githubConfig.id) ?? matchedProvider.id,
      providerName: deps.normalizeOptionalString(githubConfig.name) ?? matchedProvider.name,
      apiBaseUrl: deps.normalizeOptionalString(githubConfig.githubApiBaseUrl) ?? DEFAULT_GITHUB_API_BASE_URL,
      ...(token ? { token } : {}),
      ...(deps.normalizeOptionalString(githubConfig.defaultRepository)
        ? { defaultRepository: deps.normalizeOptionalString(githubConfig.defaultRepository) }
        : {})
    };
  };

  const getProviderDisplayConfig = async (
    ctx: TContext,
    providerId?: string,
    overrides?: ProviderConfigRecord
  ): Promise<ProviderDisplayConfig> => {
    const providers = await getAvailableProviders(ctx);
    const matchedProvider =
      (providerId ? providers.find((provider) => provider.id === providerId) : providers[0])
      ?? providers[0]
      ?? {
        id: providerId ?? deps.defaultProviderId,
        type: 'jira_dc' as const,
        name: 'Default Jira'
      };
    const config = {
      ...matchedProvider,
      ...(overrides ?? {})
    };
    if (isJiraProviderType(config.type)) {
      const jiraConfig = config as JiraDcProviderConfig | JiraCloudProviderConfig;
      const baseUrl = deps.normalizeOptionalString(jiraConfig.jiraBaseUrl)?.replace(/\/+$/, '');
      const userEmail = deps.normalizeOptionalString(jiraConfig.jiraUserEmail);
      const inlineToken = deps.normalizeOptionalString(jiraConfig.jiraToken);
      const tokenRef = deps.normalizeOptionalString(jiraConfig.jiraTokenRef);

      return {
        providerId: deps.normalizeOptionalString(config.id) ?? matchedProvider.id,
        providerName: deps.normalizeOptionalString(config.name) ?? matchedProvider.name,
        providerType: config.type,
        ...(baseUrl ? { baseUrl } : {}),
        ...(userEmail ? { userEmail } : {}),
        defaultIssueType: deps.normalizeOptionalString(jiraConfig.defaultIssueType) ?? deps.defaultIssueType,
        tokenSaved: Boolean(inlineToken || tokenRef)
      };
    }

    const githubConfig = config as GitHubIssuesProviderConfig;
    const githubApiBaseUrl = deps.normalizeOptionalString(githubConfig.githubApiBaseUrl) ?? DEFAULT_GITHUB_API_BASE_URL;
    const githubToken = deps.normalizeOptionalString(githubConfig.githubToken);
    const githubTokenRef = deps.normalizeOptionalString(githubConfig.githubTokenRef);
    return {
      providerId: deps.normalizeOptionalString(githubConfig.id) ?? matchedProvider.id,
      providerName: deps.normalizeOptionalString(githubConfig.name) ?? matchedProvider.name,
      providerType: 'github_issues',
      githubApiBaseUrl,
      ...(deps.normalizeOptionalString(githubConfig.defaultRepository)
        ? { defaultRepository: deps.normalizeOptionalString(githubConfig.defaultRepository) }
        : {}),
      tokenSaved: Boolean(githubToken || githubTokenRef)
    };
  };

  return {
    getAvailableProviders,
    resolveJiraProviderConfig,
    resolveGitHubProviderConfig,
    getProviderDisplayConfig
  };
}
