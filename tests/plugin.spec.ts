import { strict as assert } from 'node:assert';
import test from 'node:test';

import { createTestHarness } from '@paperclipai/plugin-sdk/testing';

import manifest from '../src/manifest.ts';
import plugin from '../src/worker.ts';

type MockFetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });
}

function installMockFetch(handler: MockFetchHandler): () => void {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = handler as typeof fetch;
  return () => {
    globalThis.fetch = previousFetch;
  };
}

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'project-1',
    companyId: 'company-1',
    urlKey: 'alpha',
    goalId: null,
    goalIds: [],
    goals: [],
    name: 'Alpha',
    description: null,
    status: 'planned',
    leadAgentId: null,
    targetDate: null,
    color: null,
    env: null,
    pauseReason: null,
    pausedAt: null,
    executionWorkspacePolicy: null,
    codebase: {
      workspaceId: null,
      repoUrl: null,
      repoRef: null,
      defaultRef: null,
      repoName: null,
      localFolder: null,
      managedFolder: '',
      effectiveLocalFolder: '',
      origin: 'local_folder'
    },
    workspaces: [],
    primaryWorkspace: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}

function makeIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'issue-1',
    companyId: 'company-1',
    projectId: 'project-1',
    projectWorkspaceId: null,
    goalId: null,
    parentId: null,
    title: 'Local Paperclip issue',
    description: 'Local body',
    status: 'todo',
    priority: 'medium',
    assigneeAgentId: null,
    assigneeUserId: null,
    checkoutRunId: null,
    executionRunId: null,
    executionAgentNameKey: null,
    executionLockedAt: null,
    createdByAgentId: null,
    createdByUserId: null,
    issueNumber: 1,
    identifier: 'PC-1',
    requestDepth: 0,
    billingCode: null,
    assigneeAdapterOverrides: null,
    executionWorkspaceId: null,
    executionWorkspacePreference: null,
    executionWorkspaceSettings: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    hiddenAt: null,
    labelIds: [],
    labels: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}

test('manifest exposes the Jira Sync identity and settings page', async () => {
  assert.equal(manifest.id, 'paperclip-jira-plugin');
  assert.equal(manifest.displayName, 'Jira Sync');
  assert.ok(manifest.ui?.slots?.some((slot) => slot.type === 'settingsPage'));
});

test('settings save keeps mappings scoped per company', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraUserEmail: 'paperclip@example.com',
      jiraTokenRef: 'secret:jira'
    }
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [
      makeProject()
    ]
  });

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 30,
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  const registration = await harness.getData<{
    mappings: Array<{ jiraProjectKey: string; paperclipProjectId?: string }>;
    scheduleFrequencyMinutes: number;
  }>('settings.registration', {
    companyId: 'company-1'
  });

  assert.equal(registration.mappings.length, 1);
  assert.equal(registration.mappings[0]?.jiraProjectKey, 'GRB');
  assert.equal(registration.mappings[0]?.paperclipProjectId, 'project-1');
  assert.equal(registration.scheduleFrequencyMinutes, 30);
});

test('sync.runNow imports Jira issues into mapped Paperclip projects', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-461',
            fields: {
              summary: 'Imported from Jira',
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Remote body'
                      }
                    ]
                  }
                ]
              },
              status: {
                name: 'Backlog',
                statusCategory: {
                  name: 'To Do'
                }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: {
                name: 'Task'
              }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraUserEmail: 'paperclip@example.com',
        jiraTokenRef: 'secret:jira'
      }
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [
        makeProject()
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{
      status: string;
      importedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues.length, 1);
    assert.match(importedIssues[0]?.description ?? '', /paperclip-jira-plugin-upstream: GRB-461/);
    assert.equal(importedIssues[0]?.status, 'todo');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow keeps Jira in-progress status as upstream metadata instead of mutating local status', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-462',
            fields: {
              summary: 'Imported in progress from Jira',
              description: {
                type: 'doc',
                version: 1,
                content: []
              },
              status: {
                name: 'In Progress',
                statusCategory: {
                  name: 'In Progress'
                }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: {
                name: 'Task'
              }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraUserEmail: 'paperclip@example.com',
        jiraTokenRef: 'secret:jira'
      }
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [
        makeProject()
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{
      status: string;
      importedCount?: number;
      failedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const detail = await harness.getData<{
      linked: boolean;
      localStatus?: string;
      upstream?: {
        jiraStatusName?: string;
        jiraStatusCategory?: string;
      };
    }>('issue.jiraDetails', {
      companyId: 'company-1',
      issueId: importedIssues[0]?.id ?? ''
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(syncState.failedCount, 0);
    assert.equal(importedIssues[0]?.status, 'todo');
    assert.equal(detail.linked, true);
    assert.equal(detail.localStatus, 'todo');
    assert.equal(detail.upstream?.jiraStatusName, 'In Progress');
    assert.equal(detail.upstream?.jiraStatusCategory, 'In Progress');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow preserves an existing Paperclip local status when pulling Jira updates', async () => {
  let searchCalls = 0;
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      searchCalls += 1;
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-463',
            fields: {
              summary: searchCalls === 1 ? 'Imported first pass' : 'Updated from Jira',
              description: {
                type: 'doc',
                version: 1,
                content: []
              },
              status: {
                name: 'Done',
                statusCategory: {
                  name: 'Done'
                }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: {
                name: 'Task'
              }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraUserEmail: 'paperclip@example.com',
        jiraTokenRef: 'secret:jira'
      }
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [
        makeProject()
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('sync.runNow', {
      companyId: 'company-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const importedIssue = importedIssues[0];
    assert.ok(importedIssue);

    await harness.ctx.issues.update(
      importedIssue.id,
      {
        status: 'blocked'
      },
      'company-1'
    );

    await harness.performAction('sync.runNow', {
      companyId: 'company-1'
    });

    const reloadedIssue = await harness.ctx.issues.get(importedIssue.id, 'company-1');
    const detail = await harness.getData<{
      localStatus?: string;
      upstream?: {
        jiraStatusName?: string;
      };
    }>('issue.jiraDetails', {
      companyId: 'company-1',
      issueId: importedIssue.id
    });

    assert.equal(reloadedIssue?.status, 'blocked');
    assert.equal(detail.localStatus, 'blocked');
    assert.equal(detail.upstream?.jiraStatusName, 'Done');
  } finally {
    restoreFetch();
  }
});

test('issue.pushToJira creates an upstream issue and stores link metadata', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: {
            type: 'doc',
            version: 1,
            content: []
          },
          status: {
            name: 'Backlog',
            statusCategory: {
              name: 'To Do'
            }
          },
          comment: {
            comments: []
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: {
            name: 'Task'
          }
        }
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraUserEmail: 'paperclip@example.com',
        jiraTokenRef: 'secret:jira'
      }
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [
        makeProject()
      ],
      issues: [
        makeIssue()
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const result = await harness.performAction<{
      issueKey: string;
      message: string;
    }>('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const details = await harness.getData<{
      linked: boolean;
      upstream?: {
        issueKey: string;
      };
    }>('issue.jiraDetails', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(result.issueKey, 'GRB-999');
    assert.equal(details.linked, true);
    assert.equal(details.upstream?.issueKey, 'GRB-999');
  } finally {
    restoreFetch();
  }
});
