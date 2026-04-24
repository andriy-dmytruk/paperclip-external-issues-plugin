import type { Issue } from '@paperclipai/plugin-sdk';
import { githubApiCall } from './api.ts';
import { getRepoReferenceFromMapping, normalizeGitHubCommentRecord, normalizeGitHubIssueRecord } from './normalize.ts';
import { getGitHubStatusCategory, getGitHubStatusName, parseGitHubTransition } from './status.ts';
import type { GitHubIssuesProviderConfig } from '../shared/config.ts';
import type { SyncProviderAdapter } from '../shared/registry.ts';
import type { GitHubProviderRuntimeConfig as GitHubConfig } from '../../worker/providers/config-resolver.ts';
import { findProjectGitHubRepository } from '../../worker/core/project-helpers.ts';
import type { JiraIssueRecord } from '../jira/models.ts';
import type {
  StatusMappingRule,
  UpstreamProjectMapping as JiraMapping,
  UpstreamUserReference as JiraUserReference
} from '../../worker/core/models.ts';

function stripIssueTitlePrefix(title: string): string {
  let next = title.trim();
  const jiraPrefixPattern = /^\[[A-Z][A-Z0-9]+-\d+\]\s*/i;
  const githubPrefixPattern = /^\[[a-z0-9_.-]+\/[a-z0-9_.-]+#\d+\]\s*/i;
  while (jiraPrefixPattern.test(next) || githubPrefixPattern.test(next)) {
    next = next
      .replace(jiraPrefixPattern, '')
      .replace(githubPrefixPattern, '')
      .trim();
  }
  return next;
}

function stripIssueMarker(description: string): string {
  return description.replace(/<!-- paperclip-external-issues-plugin-upstream: [^>]+ -->/g, '').trim();
}

function parseIssueKey(issueKey: string, config: GitHubConfig) {
  const repoMatch = issueKey.match(/^([^#]+)#(\d+)$/);
  const repo = repoMatch ? getRepoReferenceFromMapping({ jiraProjectKey: repoMatch[1] }, config) : null;
  const issueNumber = repoMatch ? Number(repoMatch[2]) : NaN;
  if (!repo || !Number.isFinite(issueNumber)) {
    throw new Error('GitHub issue key must look like owner/repo#123.');
  }
  return { repo, issueNumber };
}

function normalizeIssueRecord(value: unknown, repoFullName: string): JiraIssueRecord {
  return normalizeGitHubIssueRecord(
    value as Parameters<typeof normalizeGitHubIssueRecord>[0],
    repoFullName,
    {
      getStatusName: getGitHubStatusName,
      getStatusCategory: getGitHubStatusCategory
    }
  );
}

function getDefaultStatusMappings(): StatusMappingRule[] {
  return [{
    jiraStatus: 'Closed',
    upstreamStatus: 'Closed',
    paperclipStatus: 'done'
  }, {
    jiraStatus: 'Completed',
    upstreamStatus: 'Completed',
    paperclipStatus: 'done'
  }, {
    jiraStatus: 'Duplicate',
    upstreamStatus: 'Duplicate',
    paperclipStatus: 'done'
  }, {
    jiraStatus: 'Not planned',
    upstreamStatus: 'Not planned',
    paperclipStatus: 'cancelled'
  }];
}

export function createGitHubIssuesProviderAdapter<TContext>(): SyncProviderAdapter<GitHubIssuesProviderConfig, GitHubConfig, TContext> {
  return {
    type: 'github_issues',
    label: 'GitHub Issues',
    capabilities: {
      supportsProjectPicker: true,
      supportsUserSearch: true,
      supportsAssignableUsers: true,
      supportsIssueCreation: true,
      supportsIssueUpdate: true,
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
    },
    getDefaultStatusMappings,
    createProvider: (context, config) => ({
      capabilities: {
        supportsProjectPicker: true,
        supportsUserSearch: true,
        supportsAssignableUsers: true,
        supportsIssueCreation: true,
        supportsIssueUpdate: true,
        supportsComments: true,
        supportsStatusUpdates: true,
        supportsBackgroundSync: true,
        supportsCreatorLookup: true
      },
      label: 'GitHub Issues',
      testConnection: async () => {
        try {
          const response = await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
            await api.rest.users.getAuthenticated()
          ));
          return {
            status: 'success' as const,
            message: `Connected to GitHub as ${response.data.login}.`
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: error instanceof Error ? error.message : 'GitHub connection test failed.'
          };
        }
      },
      getDefaultProjectMappings: async ({ companyId, projectId, projectName }) => {
        const inferredRepository = await findProjectGitHubRepository(
          context as Parameters<typeof findProjectGitHubRepository>[0],
          companyId,
          projectId,
          projectName
        );
        if (!inferredRepository) {
          return [];
        }
        return [{
          id: 'mapping-1',
          enabled: true,
          jiraProjectKey: inferredRepository
        }];
      },
      searchUsers: async (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
          return [];
        }

        const response = await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.search.users({
            q: `${trimmedQuery} in:login`,
            per_page: 10
          })
        ));
        return response.data.items.map((user) => ({
          accountId: user.login,
          displayName: user.login,
          username: user.login
        }));
      },
      listUpstreamProjects: async (query) => {
        const trimmedQuery = query?.trim().toLowerCase() ?? '';
        const suggestionLimit = 20;
        const pageSize = 100;
        const maxPages = trimmedQuery ? 10 : 1;
        const seenRepoKeys = new Set<string>();
        const suggestions: Array<{ id: string; key: string; displayName: string; url?: string }> = [];

        for (let page = 1; page <= maxPages; page += 1) {
          const repositories = await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
            await api.rest.repos.listForAuthenticatedUser({
              sort: 'updated',
              per_page: pageSize,
              page,
              affiliation: 'owner,collaborator,organization_member'
            })
          ));

          const pageItems = repositories.data;
          for (const repo of pageItems) {
            const fullName = repo.full_name?.trim() ?? '';
            if (!fullName || seenRepoKeys.has(fullName.toLowerCase())) {
              continue;
            }

            const repoName = repo.name?.toLowerCase() ?? '';
            const repoUrl = repo.html_url?.toLowerCase() ?? '';
            const fullNameLower = fullName.toLowerCase();
            if (trimmedQuery && !fullNameLower.includes(trimmedQuery) && !repoName.includes(trimmedQuery) && !repoUrl.includes(trimmedQuery)) {
              continue;
            }

            seenRepoKeys.add(fullNameLower);
            suggestions.push({
              id: String(repo.id),
              key: fullName,
              displayName: fullName,
              ...(repo.html_url ? { url: repo.html_url } : {})
            });
            if (suggestions.length >= suggestionLimit) {
              break;
            }
          }

          if (suggestions.length >= suggestionLimit || pageItems.length < pageSize) {
            break;
          }
        }

        return suggestions;
      },
      resolveCurrentUser: async () => {
        try {
          const response = await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
            await api.rest.users.getAuthenticated()
          ));
          const login = response.data.login?.trim();
          if (!login) {
            return undefined;
          }
          return {
            accountId: login,
            displayName: login,
            username: login
          };
        } catch {
          return undefined;
        }
      },
      searchIssues: async (mapping, options) => {
        const repo = getRepoReferenceFromMapping(mapping as JiraMapping, config);
        if (options?.issueKey) {
          const issueNumberMatch = options.issueKey.match(/#(\d+)$/);
          if (!issueNumberMatch) {
            return [];
          }
          const issueNumber = Number(issueNumberMatch[1]);
          const [issueResponse, commentsResponse] = await Promise.all([
            githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
              await api.rest.issues.get({
                owner: repo.owner,
                repo: repo.repo,
                issue_number: issueNumber
              })
            )),
            githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
              await api.rest.issues.listComments({
                owner: repo.owner,
                repo: repo.repo,
                issue_number: issueNumber,
                per_page: 100
              })
            ))
          ]);
          const issueRecord = normalizeIssueRecord(issueResponse.data, `${repo.owner}/${repo.repo}`);
          return [{
            ...issueRecord,
            comments: commentsResponse.data.map((comment) => normalizeGitHubCommentRecord(
              comment as Parameters<typeof normalizeGitHubCommentRecord>[0]
            ))
          }];
        }

        const response = await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.issues.listForRepo({
            owner: repo.owner,
            repo: repo.repo,
            state: 'all',
            per_page: 50
          })
        ));
        return response.data
          .filter((issue) => !Object.prototype.hasOwnProperty.call(issue as Record<string, unknown>, 'pull_request'))
          .map((issue) => normalizeIssueRecord(issue, `${repo.owner}/${repo.repo}`));
      },
      createIssue: async (mapping, issue) => {
        const repo = getRepoReferenceFromMapping(mapping as JiraMapping, config);
        const response = await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.issues.create({
            owner: repo.owner,
            repo: repo.repo,
            title: stripIssueTitlePrefix((issue as Issue).title),
            body: stripIssueMarker((issue as Issue).description ?? '')
          })
        ));
        return normalizeIssueRecord(response.data, `${repo.owner}/${repo.repo}`);
      },
      updateIssue: async (issueKey, issue) => {
        const { repo, issueNumber } = parseIssueKey(issueKey, config);
        await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.issues.update({
            owner: repo.owner,
            repo: repo.repo,
            issue_number: issueNumber,
            title: stripIssueTitlePrefix((issue as Issue).title),
            body: stripIssueMarker((issue as Issue).description ?? '')
          })
        ));
      },
      syncStatusFromPaperclip: async (issueKey, status) => {
        const { repo, issueNumber } = parseIssueKey(issueKey, config);
        const transitionId =
          status === 'cancelled'
            ? 'closed:not_planned'
            : status === 'done'
              ? 'closed:completed'
              : 'open';
        const { state, stateReason } = parseGitHubTransition(transitionId);
        await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.issues.update({
            owner: repo.owner,
            repo: repo.repo,
            issue_number: issueNumber,
            state,
            ...(stateReason ? { state_reason: stateReason } : {})
          })
        ));
        return true;
      },
      listTransitions: async () => ([
        { id: 'open', name: 'Open' },
        { id: 'closed:completed', name: 'Completed' },
        { id: 'closed:not_planned', name: 'Not planned' },
        { id: 'closed:duplicate', name: 'Duplicate' }
      ]),
      transitionIssue: async (issueKey, transitionId) => {
        const { repo, issueNumber } = parseIssueKey(issueKey, config);
        const { state, stateReason } = parseGitHubTransition(transitionId);
        await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.issues.update({
            owner: repo.owner,
            repo: repo.repo,
            issue_number: issueNumber,
            state,
            ...(stateReason ? { state_reason: stateReason } : {})
          })
        ));
      },
      setAssignee: async (issueKey, assignee) => {
        const { repo, issueNumber } = parseIssueKey(issueKey, config);
        const selectedAssignee = assignee as JiraUserReference;
        const login = (selectedAssignee.username ?? selectedAssignee.accountId).trim();
        if (!login) {
          throw new Error('Select a GitHub user before updating the assignee.');
        }
        await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.issues.update({
            owner: repo.owner,
            repo: repo.repo,
            issue_number: issueNumber,
            assignees: [login]
          })
        ));
      },
      addComment: async (issueKey, body) => {
        const { repo, issueNumber } = parseIssueKey(issueKey, config);
        const response = await githubApiCall(context as Parameters<typeof githubApiCall>[0], config, async (api) => (
          await api.rest.issues.createComment({
            owner: repo.owner,
            repo: repo.repo,
            issue_number: issueNumber,
            body
          })
        ));
        return { id: String(response.data.id) };
      }
    })
  };
}
