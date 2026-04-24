import { PROVIDER_TYPE_OPTIONS, type ProviderType } from './types.ts';

export { PROVIDER_TYPE_OPTIONS };
export type { ProviderType } from './types.ts';

export interface BaseProviderConfig {
  id: string;
  type: ProviderType;
  name: string;
}

export interface JiraDcProviderConfig extends BaseProviderConfig {
  type: 'jira_dc';
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
}

export interface JiraCloudProviderConfig extends BaseProviderConfig {
  type: 'jira_cloud';
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
}

export interface GitHubIssuesProviderConfig extends BaseProviderConfig {
  type: 'github_issues';
  githubApiBaseUrl?: string;
  githubToken?: string;
  githubTokenRef?: string;
  defaultRepository?: string;
}

export type ProviderConfig =
  | JiraDcProviderConfig
  | JiraCloudProviderConfig
  | GitHubIssuesProviderConfig;

export type ProviderConfigInput = Partial<ProviderConfig> & Record<string, unknown>;

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  jira_dc: 'Jira Data Center',
  jira_cloud: 'Jira Cloud',
  github_issues: 'GitHub Issues'
};

export const DEFAULT_JIRA_ISSUE_TYPE = 'Task';
export const DEFAULT_GITHUB_API_BASE_URL = 'https://api.github.com';

export const PROVIDER_CONFIG_COLLECTION_KEYS = {
  jiraDc: 'jiraDcProviders',
  jiraCloud: 'jiraCloudProviders',
  github: 'githubProviders'
} as const;

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeProviderType(value: unknown): ProviderType | undefined {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    return undefined;
  }

  return PROVIDER_TYPE_OPTIONS.find((entry) => entry === normalized);
}

export function isJiraProviderType(value: ProviderType | string | null | undefined): value is 'jira_dc' | 'jira_cloud' {
  return value === 'jira_dc' || value === 'jira_cloud';
}

export function isGitHubProviderType(value: ProviderType | string | null | undefined): value is 'github_issues' {
  return value === 'github_issues';
}

export function getProviderTypeLabel(type: ProviderType | string | null | undefined): string {
  const normalized = normalizeProviderType(type);
  return normalized ? PROVIDER_TYPE_LABELS[normalized] : 'Unknown provider';
}

function normalizeProviderConfigByType(
  value: unknown,
  type: ProviderType,
  index: number
): ProviderConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as ProviderConfigInput;
  const name = normalizeOptionalString(record.name);
  const id = normalizeOptionalString(record.id) ?? `provider-${index + 1}`;
  if (!name) {
    return null;
  }

  if (type === 'github_issues') {
    return {
      id,
      type: 'github_issues',
      name,
      ...(normalizeOptionalString(record.githubApiBaseUrl)
        ? { githubApiBaseUrl: normalizeOptionalString(record.githubApiBaseUrl) }
        : {}),
      ...(normalizeOptionalString(record.githubToken) ? { githubToken: normalizeOptionalString(record.githubToken) } : {}),
      ...(normalizeOptionalString(record.githubTokenRef) ? { githubTokenRef: normalizeOptionalString(record.githubTokenRef) } : {}),
      ...(normalizeOptionalString(record.defaultRepository)
        ? { defaultRepository: normalizeOptionalString(record.defaultRepository) }
        : {})
    };
  }

  const jiraBase: Omit<JiraDcProviderConfig, 'type'> = {
    id,
    name,
    ...(normalizeOptionalString(record.jiraBaseUrl) ? { jiraBaseUrl: normalizeOptionalString(record.jiraBaseUrl) } : {}),
    ...(normalizeOptionalString(record.jiraUserEmail) ? { jiraUserEmail: normalizeOptionalString(record.jiraUserEmail) } : {}),
    ...(normalizeOptionalString(record.jiraToken) ? { jiraToken: normalizeOptionalString(record.jiraToken) } : {}),
    ...(normalizeOptionalString(record.jiraTokenRef) ? { jiraTokenRef: normalizeOptionalString(record.jiraTokenRef) } : {}),
    ...(normalizeOptionalString(record.defaultIssueType)
      ? { defaultIssueType: normalizeOptionalString(record.defaultIssueType) }
      : {})
  };

  return type === 'jira_cloud'
    ? { ...jiraBase, type: 'jira_cloud' }
    : { ...jiraBase, type: 'jira_dc' };
}

export function normalizeProviderConfig(
  value: unknown,
  index = 0
): ProviderConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as ProviderConfigInput;
  const inferredType = normalizeProviderType(record.type);
  if (!inferredType) {
    return null;
  }

  return normalizeProviderConfigByType(record, inferredType, index);
}

function normalizeProviderConfigsForType(
  value: unknown,
  type: ProviderType,
  offset = 0
): ProviderConfig[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => normalizeProviderConfigByType(entry, type, offset + index))
    .filter((entry): entry is ProviderConfig => entry !== null);
}

export function normalizeProviderConfigs(value: unknown): ProviderConfig[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => normalizeProviderConfig(entry, index))
    .filter((entry): entry is ProviderConfig => entry !== null);
}

export function getProviderConfigsFromCollections(value: unknown): ProviderConfig[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const record = value as Record<string, unknown>;
  const jiraDcProviders = normalizeProviderConfigsForType(record[PROVIDER_CONFIG_COLLECTION_KEYS.jiraDc], 'jira_dc', 0);
  const jiraCloudProviders = normalizeProviderConfigsForType(
    record[PROVIDER_CONFIG_COLLECTION_KEYS.jiraCloud],
    'jira_cloud',
    jiraDcProviders.length
  );
  const githubProviders = normalizeProviderConfigsForType(
    record[PROVIDER_CONFIG_COLLECTION_KEYS.github],
    'github_issues',
    jiraDcProviders.length + jiraCloudProviders.length
  );
  const merged = [...jiraDcProviders, ...jiraCloudProviders, ...githubProviders];
  if (merged.length > 0) {
    return merged;
  }
  return [];
}

export function serializeProviderConfigForHost(config: ProviderConfig): ProviderConfig {
  return { ...config };
}
