import { normalizeProviderType, type ProviderType } from '../../providers/shared/config.ts';

function normalizeIdentitySegment(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeUpstreamProviderScope(
  providerType: ProviderType | string | undefined,
  jiraProjectKey?: string,
  jiraIssueKey?: string
): string {
  const normalizedProvider = normalizeProviderType(providerType);
  const normalizedProjectKey = jiraProjectKey?.trim();
  if (normalizedProvider === 'github_issues') {
    if (normalizedProjectKey) {
      return normalizeIdentitySegment(normalizedProjectKey);
    }

    const repoFromIssueKey = jiraIssueKey?.split('#')[0]?.trim();
    if (repoFromIssueKey) {
      return normalizeIdentitySegment(repoFromIssueKey);
    }

    return 'github';
  }

  if (normalizedProjectKey) {
    return normalizeIdentitySegment(normalizedProjectKey);
  }

  const projectFromIssueKey = jiraIssueKey?.split('-')[0]?.trim();
  if (projectFromIssueKey) {
    return normalizeIdentitySegment(projectFromIssueKey);
  }

  return 'jira';
}

export function buildUpstreamIdentityKey(params: {
  providerType: ProviderType | string | undefined;
  jiraProjectKey?: string;
  jiraIssueId?: string;
  jiraIssueKey: string;
}): string {
  const normalizedProviderType = normalizeProviderType(params.providerType);
  const providerScope = normalizeUpstreamProviderScope(
    normalizedProviderType,
    params.jiraProjectKey,
    params.jiraIssueKey
  );
  const upstreamIssueIdentity = normalizeIdentitySegment(params.jiraIssueId?.trim() || params.jiraIssueKey);
  return `${normalizedProviderType}:${providerScope}:${upstreamIssueIdentity}`;
}

export function getLegacyIdentityCandidates(params: {
  providerType: ProviderType | string | undefined;
  jiraProjectKey?: string;
  jiraIssueId?: string;
  jiraIssueKey: string;
}): string[] {
  const candidates = new Set<string>();
  candidates.add(buildUpstreamIdentityKey(params));

  const normalizedProviderType = normalizeProviderType(params.providerType);
  const normalizedIssueKey = normalizeIdentitySegment(params.jiraIssueKey);
  if (normalizedProviderType === 'github_issues') {
    candidates.add(`${normalizedProviderType}:github:${normalizedIssueKey}`);
  } else {
    const projectPrefix = params.jiraIssueKey.split('-')[0]?.trim();
    if (projectPrefix) {
      candidates.add(`${normalizedProviderType}:${normalizeIdentitySegment(projectPrefix)}:${normalizedIssueKey}`);
    }
    candidates.add(`${normalizedProviderType}:jira:${normalizedIssueKey}`);
  }

  return [...candidates];
}
