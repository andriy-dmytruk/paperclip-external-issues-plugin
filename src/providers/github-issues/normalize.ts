import { parseRepositoryReference } from './repository.ts';
import type { JiraCommentRecord, JiraIssueRecord } from '../jira/models.ts';

interface GitHubConfigLike {
  defaultRepository?: string;
}

interface GitHubMappingLike {
  jiraProjectKey: string;
}

export function getRepoReferenceFromMapping(
  mapping: GitHubMappingLike,
  config?: GitHubConfigLike
): { owner: string; repo: string; url: string } {
  const parsed = parseRepositoryReference(mapping.jiraProjectKey)
    ?? (config?.defaultRepository ? parseRepositoryReference(config.defaultRepository) : null);
  if (!parsed) {
    throw new Error(`GitHub repository mapping "${mapping.jiraProjectKey}" must be owner/repo.`);
  }
  return parsed;
}

export function normalizeGitHubIssueRecord(
  value: {
    id: number;
    number: number;
    title: string;
    body?: string | null;
    state?: string;
    state_reason?: string | null;
    html_url?: string;
    assignees?: Array<{ login?: string | null }> | null;
    user?: { login?: string | null } | null;
    created_at?: string;
    updated_at?: string;
  },
  repoFullName: string,
  deps: {
    getStatusName(state?: string, stateReason?: string | null): string;
    getStatusCategory(state?: string, stateReason?: string | null): string;
  }
): JiraIssueRecord {
  const assigneeDisplayName = value.assignees?.[0]?.login ?? undefined;
  const creatorDisplayName = value.user?.login ?? undefined;
  const issueKey = `${repoFullName}#${value.number}`;
  return {
    id: String(value.id),
    key: issueKey,
    summary: value.title,
    description: value.body ?? '',
    ...(assigneeDisplayName ? { assigneeDisplayName } : {}),
    ...(creatorDisplayName ? { creatorDisplayName } : {}),
    statusName: deps.getStatusName(value.state, value.state_reason),
    statusCategory: deps.getStatusCategory(value.state, value.state_reason),
    updatedAt: value.updated_at ?? new Date().toISOString(),
    createdAt: value.created_at ?? new Date().toISOString(),
    issueType: 'Issue',
    url: value.html_url ?? `https://github.com/${repoFullName}/issues/${value.number}`,
    comments: []
  };
}

export function normalizeGitHubCommentRecord(
  value: {
    id: number;
    body?: string | null;
    user?: { login?: string | null } | null;
    created_at?: string;
    updated_at?: string;
  }
): JiraCommentRecord {
  return {
    id: String(value.id),
    body: value.body ?? '',
    authorDisplayName: value.user?.login ?? 'GitHub user',
    createdAt: value.created_at ?? new Date().toISOString(),
    updatedAt: value.updated_at ?? new Date().toISOString()
  };
}
