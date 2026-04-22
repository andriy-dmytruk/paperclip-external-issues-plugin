import { PROVIDER_TYPE_OPTIONS, type ProviderType } from './types.ts';
export { PROVIDER_TYPE_OPTIONS };
export type { ProviderType } from './types.ts';

export interface JiraDcProviderConfig {
  id: string;
  type: 'jira_dc';
  name: string;
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
  githubApiBaseUrl?: string;
  githubToken?: string;
  githubTokenRef?: string;
  defaultRepository?: string;
}

export interface JiraCloudProviderConfig {
  id: string;
  type: 'jira_cloud';
  name: string;
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
  githubApiBaseUrl?: string;
  githubToken?: string;
  githubTokenRef?: string;
  defaultRepository?: string;
}

export interface GitHubIssuesProviderConfig {
  id: string;
  type: 'github_issues';
  name: string;
  githubApiBaseUrl?: string;
  githubToken?: string;
  githubTokenRef?: string;
  defaultRepository?: string;
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
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

  if (normalized === 'jira') {
    return 'jira_dc';
  }

  return PROVIDER_TYPE_OPTIONS.find((entry) => entry === normalized);
}

export function isJiraProviderType(value: ProviderType | string | undefined): value is 'jira_dc' | 'jira_cloud' {
  return value === 'jira_dc' || value === 'jira_cloud';
}

export function isGitHubProviderType(value: ProviderType | string | undefined): value is 'github_issues' {
  return value === 'github_issues';
}

export function getProviderTypeLabel(type: ProviderType | string | undefined): string {
  const normalized = normalizeProviderType(type);
  return normalized ? PROVIDER_TYPE_LABELS[normalized] : 'Unknown provider';
}

export function normalizeProviderConfig(
  value: unknown,
  index = 0
): ProviderConfig | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as ProviderConfigInput;
  const type = normalizeProviderType(record.type);
  const name = normalizeOptionalString(record.name);
  const id = normalizeOptionalString(record.id) ?? `provider-${index + 1}`;
  if (!type || !name) {
    return null;
  }

  if (isJiraProviderType(type)) {
    return {
      id,
      type,
      name,
      ...(normalizeOptionalString(record.jiraBaseUrl) ? { jiraBaseUrl: normalizeOptionalString(record.jiraBaseUrl) } : {}),
      ...(normalizeOptionalString(record.jiraUserEmail) ? { jiraUserEmail: normalizeOptionalString(record.jiraUserEmail) } : {}),
      ...(normalizeOptionalString(record.jiraToken) ? { jiraToken: normalizeOptionalString(record.jiraToken) } : {}),
      ...(normalizeOptionalString(record.jiraTokenRef) ? { jiraTokenRef: normalizeOptionalString(record.jiraTokenRef) } : {}),
      ...(normalizeOptionalString(record.defaultIssueType)
        ? { defaultIssueType: normalizeOptionalString(record.defaultIssueType) }
        : {})
    };
  }

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

export function normalizeProviderConfigs(value: unknown): ProviderConfig[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => normalizeProviderConfig(entry, index))
    .filter((entry): entry is ProviderConfig => entry !== null);
}
