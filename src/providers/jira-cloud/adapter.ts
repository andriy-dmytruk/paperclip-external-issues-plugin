import type { Issue } from '@paperclipai/plugin-sdk';
import type { JiraIssueRecord } from '../jira/models.ts';
import type { JiraRuntimeConfig } from '../jira/api.ts';
import { jiraApiCall, jiraApiCallAllowNoContent, jiraFetchJson } from '../jira/api.ts';
import { buildJiraSearchJql, normalizeJiraIssue, normalizeJiraStatusName, plainTextToAdf, targetJiraTransitionNames } from '../jira/normalize.ts';
import { DEFAULT_JIRA_ISSUE_TYPE, type JiraCloudProviderConfig } from '../shared/config.ts';
import type { SyncProviderAdapter } from '../shared/registry.ts';
import type {
  StatusMappingRule,
  UpstreamUserReference as JiraUserReference,
  UpstreamProjectMapping as JiraMapping,
  SyncTaskFilters as JiraTaskFilters
} from '../../worker/core/models.ts';
import { DEFAULT_ISSUE_TYPE } from '../../worker/core/defaults.ts';
import { getUpstreamUserDisplayName, getUpstreamUserQueryValue, normalizeOptionalString, normalizeUpstreamUserReference } from '../../worker/core/utils.ts';

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

function stripIssueTitlePrefix(title: string): string {
  let next = title.trim();
  const jiraPrefixPattern = /^\[[A-Z][A-Z0-9]+-\d+\]\s*/i;
  const githubPrefixPattern = /^\[[a-z0-9_.-]+\/[a-z0-9_.-]+#\d+\]\s*/i;
  while (jiraPrefixPattern.test(next) || githubPrefixPattern.test(next)) {
    next = next.replace(jiraPrefixPattern, '').replace(githubPrefixPattern, '').trim();
  }
  return next;
}

function stripIssueMarker(description: string): string {
  return description.replace(/<!-- paperclip-external-issues-plugin-upstream: [^>]+ -->/g, '').trim();
}

function getDefaultStatusMappings(): StatusMappingRule[] {
  return [{
    jiraStatus: 'Closed',
    upstreamStatus: 'Closed',
    paperclipStatus: 'done'
  }, {
    jiraStatus: 'Done',
    upstreamStatus: 'Done',
    paperclipStatus: 'done'
  }];
}

export function createJiraCloudProviderAdapter<TContext>(): SyncProviderAdapter<JiraCloudProviderConfig, JiraRuntimeConfig & { defaultIssueType: string }, TContext> {
  const normalizeDeps = {
    normalizeOptionalString,
    getUpstreamUserDisplayName,
    getUpstreamUserQueryValue,
    defaultIssueType: DEFAULT_ISSUE_TYPE
  };

  const listTransitions = async (
    context: TContext,
    config: JiraRuntimeConfig & { defaultIssueType: string },
    issueKey: string
  ): Promise<Array<{ id: string; name: string }>> => {
    const response = await jiraApiCall(context as Parameters<typeof jiraApiCall>[0], config, async (api) => (
      await api.getTransitions({ issueIdOrKey: issueKey })
    ));
    const transitions = Array.isArray(response.transitions) ? response.transitions : [];
    return transitions
      .map((entry: unknown) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const record = entry as Record<string, unknown>;
        const id = normalizeOptionalString(record.id);
        const name = normalizeOptionalString(record.name);
        return id && name ? { id, name } : null;
      })
      .filter((entry): entry is { id: string; name: string } => entry !== null);
  };

  const searchIssues = async (
    context: TContext,
    config: JiraRuntimeConfig & { defaultIssueType: string },
    mapping: JiraMapping,
    options?: { issueKey?: string; filters?: JiraTaskFilters }
  ): Promise<JiraIssueRecord[]> => {
    if (options?.issueKey) {
      const issueKey = options.issueKey;
      try {
        const issueResponse = await jiraApiCall(context as Parameters<typeof jiraApiCall>[0], config, async (api) => (
          await api.getIssue({
            issueIdOrKey: issueKey,
            fields: 'summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter'
          })
        ));
        const issue = normalizeJiraIssue(issueResponse, config, normalizeDeps);
        if (issue) {
          return [issue];
        }
      } catch {
        // fallback to search endpoint below
      }
    }

    const jql = options?.issueKey
      ? `issuekey = ${options.issueKey} ORDER BY updated DESC`
      : buildJiraSearchJql(mapping, options?.filters, normalizeDeps);

    const response = await jiraApiCall(context as Parameters<typeof jiraApiCall>[0], config, async (api) => (
      await api.searchUsingSearchRequest({
        requestBody: {
          jql,
          maxResults: options?.issueKey ? 1 : 50,
          fields: ['summary', 'description', 'status', 'comment', 'updated', 'created', 'issuetype', 'assignee', 'creator', 'reporter']
        }
      })
    ));
    const issues = Array.isArray(response.issues) ? response.issues : [];
    return issues
      .map((entry) => normalizeJiraIssue(entry, config, normalizeDeps))
      .filter((entry): entry is JiraIssueRecord => entry !== null);
  };

  return {
    type: 'jira_cloud',
    label: 'Jira Cloud',
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
      return validateJiraCloudConfig({
        ...config,
        defaultIssueType: config.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE
      });
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
      label: 'Jira Cloud',
      testConnection: async () => {
        try {
          await jiraFetchJson(context as Parameters<typeof jiraFetchJson>[0], config, '/api/2/myself');
          return {
            status: 'success' as const,
            message: `Connected to Jira at ${config.baseUrl ?? 'the configured instance'}.`
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: error instanceof Error ? error.message : 'Jira connection test failed.'
          };
        }
      },
      searchUsers: async (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
          return [];
        }

        const attempts = [
          async () => await jiraFetchJson<unknown[]>(
            context as Parameters<typeof jiraFetchJson>[0],
            config,
            `/api/2/user/search?query=${encodeURIComponent(trimmedQuery)}`
          ),
          async () => await jiraFetchJson<unknown[]>(
            context as Parameters<typeof jiraFetchJson>[0],
            config,
            `/api/2/user/search?username=${encodeURIComponent(trimmedQuery)}`
          ),
          async () => await jiraFetchJson<unknown>(
            context as Parameters<typeof jiraFetchJson>[0],
            config,
            `/api/2/groupuserpicker?query=${encodeURIComponent(trimmedQuery)}`
          )
        ];

        for (const attempt of attempts) {
          try {
            const response = await attempt();
            const rawCandidates = Array.isArray(response) ? response : [response];
            const candidates = rawCandidates.flatMap((candidate) => {
              if (Array.isArray(candidate)) {
                return candidate;
              }
              const record = candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : null;
              if (!record) {
                return [];
              }
              const pickerUsersValue = record.users;
              const pickerUsersRecord = pickerUsersValue && typeof pickerUsersValue === 'object'
                ? pickerUsersValue as Record<string, unknown>
                : null;
              const pickerUsers = Array.isArray(pickerUsersRecord?.users)
                ? pickerUsersRecord.users
                : Array.isArray(record.users)
                  ? record.users
                  : Array.isArray(record.items)
                    ? record.items
                    : [];
              return pickerUsers.length > 0 ? pickerUsers : [record];
            });
            const suggestions = candidates
              .map((entry) => normalizeUpstreamUserReference(entry))
              .filter((entry): entry is JiraUserReference => entry !== undefined)
              .filter((entry, index, all) => all.findIndex((candidate) => candidate.accountId === entry.accountId) === index);
            if (suggestions.length > 0) {
              return suggestions;
            }
          } catch {
            // continue fallback
          }
        }

        try {
          const exactUser = await jiraApiCall(context as Parameters<typeof jiraApiCall>[0], config, async (api) => (
            await api.getUser({ username: trimmedQuery })
          ));
          const normalized = normalizeUpstreamUserReference(exactUser);
          if (normalized) {
            return [normalized];
          }
        } catch {
          // ignore exact match failures
        }

        return [];
      },
      listUpstreamProjects: async (query) => {
        const trimmedQuery = query?.trim().toLowerCase() ?? '';
        const response = await jiraApiCall(context as Parameters<typeof jiraApiCall>[0], config, async (api) => (
          await api.getAllProjects({ includeArchived: false })
        ));
        const projects = Array.isArray(response) ? response : [];

        return projects
          .map((entry) => {
            if (!entry || typeof entry !== 'object') {
              return null;
            }
            const record = entry as Record<string, unknown>;
            const key = normalizeOptionalString(record.key);
            if (!key) {
              return null;
            }
            const name = normalizeOptionalString(record.name) ?? key;
            const url = normalizeOptionalString(record.self)
              ?? (config.baseUrl ? `${config.baseUrl}/projects/${key}` : undefined);
            if (trimmedQuery && !key.toLowerCase().includes(trimmedQuery) && !name.toLowerCase().includes(trimmedQuery)) {
              return null;
            }
            return { id: key, key, displayName: name, ...(url ? { url } : {}) };
          })
          .filter((entry): entry is { id: string; key: string; displayName: string; url?: string } => entry !== null)
          .slice(0, 50);
      },
      resolveCurrentUser: async () => {
        try {
          const response = await jiraFetchJson<unknown>(
            context as Parameters<typeof jiraFetchJson>[0],
            config,
            '/api/2/myself'
          );
          return normalizeUpstreamUserReference(response);
        } catch {
          return undefined;
        }
      },
      searchIssues: async (mapping, options) => await searchIssues(
        context,
        config,
        mapping as JiraMapping,
        options as { issueKey?: string; filters?: JiraTaskFilters } | undefined
      ),
      createIssue: async (mapping, issue) => {
        const createResponse = await jiraApiCall(context as Parameters<typeof jiraApiCall>[0], config, async (api) => (
          await api.createIssue({
            requestBody: {
              fields: {
                project: { key: (mapping as JiraMapping).jiraProjectKey },
                summary: stripIssueTitlePrefix((issue as Issue).title),
                description: plainTextToAdf(stripIssueMarker((issue as Issue).description ?? '')),
                issuetype: { name: config.defaultIssueType }
              }
            }
          })
        ));
        const createdKey = normalizeOptionalString((createResponse as { key?: unknown }).key);
        if (!createdKey) {
          throw new Error('Jira did not return the created issue key.');
        }

        const [createdIssue] = await searchIssues(context, config, mapping as JiraMapping, { issueKey: createdKey });
        if (!createdIssue) {
          throw new Error(`Jira created ${createdKey}, but the plugin could not reload it.`);
        }
        return createdIssue;
      },
      updateIssue: async (issueKey, issue) => {
        await jiraApiCallAllowNoContent(context as Parameters<typeof jiraApiCallAllowNoContent>[0], config, async (api) => {
          await api.editIssueRaw({
            issueIdOrKey: issueKey,
            requestBody: {
              fields: {
                summary: stripIssueTitlePrefix((issue as Issue).title),
                description: plainTextToAdf(stripIssueMarker((issue as Issue).description ?? ''))
              }
            }
          });
        });
      },
      syncStatusFromPaperclip: async (issueKey, status) => {
        const transitions = await listTransitions(context, config, issueKey);
        const targetNames = targetJiraTransitionNames(status as Issue['status']);
        const transition = transitions.find((entry) => targetNames.includes(normalizeJiraStatusName(entry.name)));
        if (!transition) {
          return false;
        }
        await jiraApiCallAllowNoContent(context as Parameters<typeof jiraApiCallAllowNoContent>[0], config, async (api) => {
          await api.doTransitionRaw({
            issueIdOrKey: issueKey,
            requestBody: { transition: { id: transition.id } }
          });
        });
        return true;
      },
      listTransitions: async (issueKey) => await listTransitions(context, config, issueKey),
      transitionIssue: async (issueKey, transitionId) => {
        await jiraApiCallAllowNoContent(context as Parameters<typeof jiraApiCallAllowNoContent>[0], config, async (api) => {
          await api.doTransitionRaw({
            issueIdOrKey: issueKey,
            requestBody: { transition: { id: transitionId } }
          });
        });
      },
      setAssignee: async (issueKey, assignee) => {
        const selectedAssignee = assignee as JiraUserReference;
        const attempts = [
          { requestBody: { name: selectedAssignee.username ?? selectedAssignee.accountId } },
          { requestBody: { accountId: selectedAssignee.accountId } },
          { requestBody: { name: selectedAssignee.accountId } }
        ];
        let lastError: unknown;
        for (const attempt of attempts) {
          try {
            await jiraApiCallAllowNoContent(context as Parameters<typeof jiraApiCallAllowNoContent>[0], config, async (api) => {
              await api.assignRaw({
                issueIdOrKey: issueKey,
                requestBody: attempt.requestBody
              });
            });
            return;
          } catch (error) {
            lastError = error;
          }
        }
        throw lastError instanceof Error ? lastError : new Error('Failed to update the Jira assignee.');
      },
      addComment: async (issueKey, body) => {
        const payloads = [{ body }, { body: plainTextToAdf(body) }];
        let lastError: unknown;
        for (const payload of payloads) {
          try {
            const response = await jiraApiCall(context as Parameters<typeof jiraApiCall>[0], config, async (api) => (
              await api.addComment({
                issueIdOrKey: issueKey,
                requestBody: payload
              })
            ));
            const id = normalizeOptionalString((response as { id?: unknown }).id);
            if (!id) {
              throw new Error('Jira did not return the created comment id.');
            }
            return { id };
          } catch (error) {
            lastError = error;
          }
        }
        throw lastError instanceof Error ? lastError : new Error('Failed to add a Jira comment.');
      }
    })
  };
}
