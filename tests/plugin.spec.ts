import { strict as assert } from 'node:assert';
import test from 'node:test';

import manifest from '../src/manifest.ts';
import plugin from '../src/worker.ts';
import { buildCommentOriginLabel, buildSyncProgressLabel } from '../src/ui/index.tsx';
import {
  createTestHarness,
  installMockFetch,
  jsonResponse,
  makeAgent,
  makeIssue,
  makeProject,
  type CommentSyncPresentation
} from './helpers/plugin-test-helpers.ts';

test('sync.runNow imports Jira issues into mapped Paperclip projects', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'PRJ-461',
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
      ],
      agents: [
        makeAgent()
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'PRJ',
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
    const providerDirectory = await harness.getData<{
      providers: Array<{ providerId: string; status?: string; healthLabel?: string; healthMessage?: string }>;
    }>('settings.providerDirectory', {
      companyId: 'company-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues.length, 1);
    assert.match(importedIssues[0]?.description ?? '', /paperclip-external-issues-plugin-upstream: PRJ-461/);
    assert.equal(importedIssues[0]?.status, 'todo');
    assert.equal(providerDirectory.providers[0]?.status, 'connected');
    assert.equal(providerDirectory.providers[0]?.healthLabel, 'Connected');
    assert.match(providerDirectory.providers[0]?.healthMessage ?? '', /Last sync succeeded/);
  } finally {
    restoreFetch();
  }
});

test('sync.runNow marks provider health as degraded when upstream search fails', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        errorMessages: ['Boom']
      }, 502);
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

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{ status: string; message?: string }>('sync.runNow', {
      companyId: 'company-1'
    });
    const providerDirectory = await harness.getData<{
      providers: Array<{ providerId: string; status?: string; healthLabel?: string; healthMessage?: string }>;
    }>('settings.providerDirectory', {
      companyId: 'company-1'
    });

    assert.equal(syncState.status, 'error');
    assert.equal(providerDirectory.providers[0]?.status, 'degraded');
    assert.equal(providerDirectory.providers[0]?.healthLabel, 'Degraded');
    assert.ok(providerDirectory.providers[0]?.healthMessage);
  } finally {
    restoreFetch();
  }
});

test('sync.runNow recreates a hidden imported Jira issue when it reappears upstream', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'PRJ-461',
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
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-hidden-sync',
          projectId: 'project-1',
          title: '[PRJ-461] Imported from Jira',
          description: 'Remote body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-461 -->',
          hiddenAt: new Date('2026-04-21T00:00:00.000Z')
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-hidden-sync',
      externalId: 'PRJ-461',
      title: 'PRJ-461',
      status: 'Backlog',
      data: {
        issueId: 'issue-hidden-sync',
        companyId: 'company-1',
        projectId: 'project-1',
        jiraIssueId: '10001',
        jiraIssueKey: 'PRJ-461',
        jiraProjectKey: 'PRJ',
        jiraUrl: 'https://jira.example.com/browse/PRJ-461',
        jiraStatusName: 'Backlog',
        jiraStatusCategory: 'To Do',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        lastPulledAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    const syncState = await harness.performAction<{
      status: string;
      importedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1'
    });

    const reloadedHiddenIssue = await harness.ctx.issues.get('issue-hidden-sync', 'company-1');
    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const visibleReplacement = importedIssues.find((issue) => issue.id !== 'issue-hidden-sync' && issue.title === '[PRJ-461] Imported from Jira');
    const issueLinks = await harness.ctx.entities.list({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      limit: 20
    });
    const newestLinkForKey = issueLinks
      .map((record) => record.data as Record<string, unknown>)
      .filter((record) => record.jiraIssueKey === 'PRJ-461')
      .sort((left, right) => Date.parse(String(right.lastSyncedAt ?? '')) - Date.parse(String(left.lastSyncedAt ?? '')))[0];

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.notEqual(reloadedHiddenIssue?.hiddenAt, null);
    assert.ok(visibleReplacement);
    assert.equal(newestLinkForKey?.issueId, visibleReplacement?.id);
  } finally {
    restoreFetch();
  }
});

test('sync.runNow matches a scoped project even when an older mapping only saved the Paperclip project name', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10021',
            key: 'PRJ-480',
            fields: {
              summary: 'Imported from legacy mapping',
              description: { type: 'doc', version: 1, content: [] },
              status: {
                name: 'Backlog',
                statusCategory: { name: 'To Do' }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: { name: 'Task' }
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
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.ctx.state.set(
      { scopeKind: 'instance', stateKey: 'paperclip-external-issues-plugin-settings' },
      {
        mappings: [
          {
            id: 'mapping-legacy',
            companyId: 'company-1',
            jiraProjectKey: 'PRJ',
            paperclipProjectName: 'Alpha'
          }
        ]
      }
    );

    const syncState = await harness.performAction<{
      status: string;
      importedCount?: number;
      message?: string;
    }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues.length, 1);
    assert.equal(importedIssues[0]?.title, '[PRJ-480] Imported from legacy mapping');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow applies the default Jira-to-Paperclip status mapping when no explicit status mapping matches', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'PRJ-462',
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

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
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
    }>('issue.syncPresentation', {
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

test('sync.runNow maps GitHub closed reasons to done by default', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues?state=all&per_page=50')) {
      return jsonResponse([
        {
          id: 1,
          number: 1,
          title: 'Closed GitHub issue',
          body: 'Imported from GitHub',
          state: 'closed',
          state_reason: 'duplicate',
          html_url: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
          user: {
            login: 'andriy-dmytruk'
          },
          created_at: '2026-04-21T13:03:54.000Z',
          updated_at: '2026-04-21T13:08:38.000Z'
        }
      ]);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{ status: string }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const presentation = await harness.getData<{
      upstreamStatus?: { name: string; category: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: importedIssues[0]?.id ?? ''
    });

    assert.equal(syncState.status, 'success');
    assert.equal(importedIssues.length, 1);
    assert.equal(importedIssues[0]?.status, 'done');
    assert.equal(importedIssues[0]?.title, '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Closed GitHub issue');
    assert.equal(presentation.upstreamStatus?.name, 'Duplicate');
    assert.equal(presentation.upstreamStatus?.category, 'Done');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow does not duplicate GitHub title prefixes when upstream title already includes one', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/owner/repo/issues?state=all&per_page=50')) {
      return jsonResponse([
        {
          id: 4,
          number: 4,
          title: '[owner/repo#4] Test issue 4',
          body: 'Imported from GitHub',
          state: 'open',
          html_url: 'https://github.com/owner/repo/issues/4',
          user: {
            login: 'octocat'
          },
          created_at: '2026-04-21T13:03:54.000Z',
          updated_at: '2026-04-21T13:08:38.000Z'
        }
      ]);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token',
            defaultRepository: 'owner/repo',
            defaultIssueType: 'Task'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject({ id: 'project-1', name: 'Alpha' })]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      mappings: [
        {
          providerId: 'provider-github',
          jiraProjectKey: 'owner/repo',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{ status: string }>('sync.runNow', {
      companyId: 'company-1'
    });
    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(importedIssues[0]?.title, '[owner/repo#4] Test issue 4');
  } finally {
    restoreFetch();
  }
});

test('sync.projectPage exposes the bound GitHub repository as the suggested GitHub mapping', async () => {
  const harness = createTestHarness({
    manifest
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [
      makeProject({
        primaryWorkspace: {
          id: 'workspace-1',
          repoUrl: 'https://github.com/owner/repo',
          sourceType: 'github',
          isPrimary: true
        },
        workspaces: [
          {
            id: 'workspace-1',
            repoUrl: 'https://github.com/owner/repo',
            sourceType: 'github',
            isPrimary: true
          }
        ]
      })
    ]
  });

  const projectPage = await harness.getData<{
    suggestedUpstreamProjectKeys?: Record<string, string>;
  }>('sync.projectPage', {
    companyId: 'company-1',
    projectId: 'project-1'
  });

  assert.equal(projectPage.suggestedUpstreamProjectKeys?.github_issues, 'owner/repo');
});

test('sync.project.save infers a GitHub repository mapping from the Paperclip project binding', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/owner/repo/issues?state=all&per_page=50')) {
      return jsonResponse([
        {
          id: 1,
          number: 1,
          title: 'Imported from bound repo',
          body: 'Imported from GitHub',
          state: 'open',
          html_url: 'https://github.com/owner/repo/issues/1',
          user: {
            login: 'octocat'
          },
          created_at: '2026-04-21T13:03:54.000Z',
          updated_at: '2026-04-21T13:08:38.000Z'
        }
      ]);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [
        makeProject({
          primaryWorkspace: {
            id: 'workspace-1',
            repoUrl: 'https://github.com/owner/repo',
            sourceType: 'github',
            isPrimary: true
          },
          workspaces: [
            {
              id: 'workspace-1',
              repoUrl: 'https://github.com/owner/repo',
              sourceType: 'github',
              isPrimary: true
            }
          ]
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: []
    });

    const projectPage = await harness.getData<{
      mappings: Array<{ jiraProjectKey: string }>;
    }>('sync.projectPage', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    const syncState = await harness.performAction<{ status: string; importedCount?: number }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(projectPage.mappings[0]?.jiraProjectKey, 'owner/repo');
    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues[0]?.title, '[owner/repo#1] Imported from bound repo');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow applies explicit Jira-to-Paperclip status mappings on imported and updated issues', async () => {
  let searchCalls = 0;
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      searchCalls += 1;
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'PRJ-463',
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

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'PRJ',
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

    await harness.performAction('sync.runNow', {
      companyId: 'company-1'
    });

    const reloadedIssue = await harness.ctx.issues.get(importedIssue.id, 'company-1');
    const detail = await harness.getData<{
      localStatus?: string;
      upstream?: {
        jiraStatusName?: string;
      };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: importedIssue.id
    });

    assert.equal(reloadedIssue?.status, 'done');
    assert.equal(reloadedIssue?.assigneeAgentId, 'agent-1');
    assert.equal(detail.localStatus, 'done');
    assert.equal(detail.upstream?.jiraStatusName, 'Done');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow re-imports a Jira issue into a newly selected Paperclip project instead of reusing the old project link', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'PRJ-461',
            fields: {
              summary: 'Imported from Jira',
              description: { type: 'doc', version: 1, content: [] },
              status: {
                name: 'Backlog',
                statusCategory: { name: 'To Do' }
              },
              comment: { comments: [] },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: { name: 'Task' }
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
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [
        makeProject({ id: 'project-1', name: 'Alpha' }),
        makeProject({ id: 'project-2', name: 'Beta' })
      ],
      issues: [
        makeIssue({
          id: 'issue-old-project',
          projectId: 'project-1',
          title: '[PRJ-461] Imported from Jira',
          description: '<!-- paperclip-external-issues-plugin-upstream: PRJ-461 -->'
        })
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-old-project',
      externalId: 'PRJ-461',
      title: 'PRJ-461',
      status: 'Backlog',
      data: {
        issueId: 'issue-old-project',
        companyId: 'company-1',
        projectId: 'project-1',
        jiraIssueId: '10001',
        jiraIssueKey: 'PRJ-461',
        jiraProjectKey: 'PRJ',
        jiraUrl: 'https://jira.example.com/browse/PRJ-461',
        jiraStatusName: 'Backlog',
        jiraStatusCategory: 'To Do',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-2',
      projectName: 'Beta',
      providerId: 'provider-default-jira',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-2',
          paperclipProjectName: 'Beta'
        }
      ]
    });

    const syncState = await harness.performAction<{ status: string; importedCount?: number; updatedCount?: number }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-2'
    });

    const projectOneIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const projectTwoIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-2'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(syncState.updatedCount, 0);
    assert.equal(projectOneIssues.length, 1);
    assert.equal(projectTwoIssues.length, 1);
    assert.equal(projectTwoIssues[0]?.title, '[PRJ-461] Imported from Jira');
  } finally {
    restoreFetch();
  }
});

test('issue.pushToUpstream creates an upstream issue and stores link metadata', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999',
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
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: {
            name: 'Task'
          }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
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
      ],
      issues: [
        makeIssue()
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const result = await harness.performAction<{
      issueKey: string;
      message: string;
    }>('issue.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const details = await harness.getData<{
      linked: boolean;
      upstream?: {
        issueKey: string;
      };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(result.issueKey, 'PRJ-999');
    assert.equal(details.linked, true);
    assert.equal(details.upstream?.issueKey, 'PRJ-999');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow reports progress counts and prefixes synced issue titles', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10011',
            key: 'PRJ-470',
            fields: {
              summary: 'Provider aware import',
              description: { type: 'doc', version: 1, content: [] },
              status: {
                name: 'Backlog',
                statusCategory: { name: 'To Do' }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: { name: 'Task' }
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
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{
      status: string;
      processedCount?: number;
      totalCount?: number;
      importedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1',
      providerKey: 'jira',
      filters: {
        onlyActive: true
      }
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.processedCount, 1);
    assert.equal(syncState.totalCount, 1);
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues[0]?.title, '[PRJ-470] Provider aware import');
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation keeps local and upstream state separate and exposes open-in-jira action', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: {
            name: 'In Progress',
            statusCategory: { name: 'In Progress' }
          },
          comment: {
            comments: []
          },
          creator: {
            name: 'Issue Creator'
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
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
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue({ status: 'blocked' })]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const presentation = await harness.getData<{
      isSynced: boolean;
      localStatus?: string;
      upstreamIssueKey?: string | null;
      titlePrefix?: string | null;
      openInProviderUrl?: string | null;
      upstreamStatus?: { name: string; category: string };
      upstream?: { jiraCreatorDisplayName?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const reloadedIssue = await harness.ctx.issues.get('issue-1', 'company-1');

    assert.equal(presentation.isSynced, true);
    assert.equal(presentation.localStatus, 'blocked');
    assert.equal(presentation.upstreamIssueKey, 'PRJ-999');
    assert.equal(presentation.titlePrefix, '[PRJ-999]');
    assert.equal(presentation.upstreamStatus?.name, 'In Progress');
    assert.equal(presentation.upstreamStatus?.category, 'In Progress');
    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'Issue Creator');
    assert.equal(presentation.openInProviderUrl, 'https://jira.example.com/browse/PRJ-999');
    assert.equal(reloadedIssue?.title, '[PRJ-999] Local Paperclip issue');
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamAssignee updates the Jira assignee and refreshes upstream metadata', async () => {
  let assigned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: { comments: [] },
          assignee: assigned
            ? { displayName: 'New Owner' }
            : { displayName: 'Paperclip Owner' },
          creator: { displayName: 'Issue Creator' },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/assignee') && init?.method === 'PUT') {
      assigned = true;
      return new Response(null, { status: 204 });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions')) {
      return jsonResponse({
        transitions: []
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()],
      agents: [makeAgent()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const result = await harness.performAction<{ message: string }>('issue.setUpstreamAssignee', {
      companyId: 'company-1',
      params: {
        companyId: 'company-1',
        issueId: 'issue-1',
        assignee: {
          accountId: 'new-owner',
          displayName: 'New Owner',
          username: 'new-owner'
        }
      }
    } as any);

    const presentation = await harness.getData<{
      upstream?: { jiraAssigneeDisplayName?: string; jiraCreatorDisplayName?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.match(result.message, /Updated upstream assignee to New Owner/);
    assert.equal(presentation.upstream?.jiraAssigneeDisplayName, 'New Owner');
    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'Issue Creator');
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamAssignee surfaces GitHub assignment validation failures', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1') && init?.method === 'PATCH') {
      return jsonResponse({
        message: 'Validation Failed',
        errors: [{
          field: 'assignees',
          code: 'invalid',
          message: 'Could not resolve to a user with access to this repository.'
        }]
      }, 422);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-external-issues-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      status: 'Open',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-github',
        jiraIssueId: '1',
        jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
        jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
        jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        jiraStatusName: 'Open',
        jiraStatusCategory: 'Open',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    await assert.rejects(
      async () => await harness.performAction('issue.setUpstreamAssignee', {
        companyId: 'company-1',
        params: {
          companyId: 'company-1',
          issueId: 'issue-1',
          assignee: {
            accountId: 'andriy-dmytruk',
            displayName: 'andriy-dmytruk',
            username: 'andriy-dmytruk'
          }
        }
      } as any),
      /GitHub request failed \(422\).*assignees: invalid: Could not resolve to a user with access to this repository\..*selected assignee cannot be assigned to this repository/i
    );
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamStatus transitions the Jira issue and refreshes upstream metadata', async () => {
  let transitioned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: transitioned
            ? { name: 'Done', statusCategory: { name: 'Done' } }
            : { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: {
            comments: []
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions') && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions') && init?.method === 'POST') {
      transitioned = true;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const result = await harness.performAction<{ message: string }>('issue.setUpstreamStatus', {
      companyId: 'company-1',
      issueId: 'issue-1',
      transitionId: '31'
    });

    const presentation = await harness.getData<{
      upstreamStatus?: { name: string; category: string };
      upstream?: { jiraAssigneeDisplayName?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.match(result.message, /Updated upstream status to Done/);
    assert.equal(presentation.upstreamStatus?.name, 'Done');
    assert.equal(presentation.upstreamStatus?.category, 'Done');
    assert.equal(presentation.upstream?.jiraAssigneeDisplayName, 'Paperclip Owner');
    const reloadedIssue = await harness.ctx.issues.get('issue-1', 'company-1');
    assert.equal(reloadedIssue?.status, 'done');
    assert.equal(reloadedIssue?.assigneeAgentId, 'agent-1');
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamStatus tolerates the Paperclip 204 bridge response bug', async () => {
  let transitioned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: transitioned
            ? { name: 'Done', statusCategory: { name: 'Done' } }
            : { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: {
            comments: []
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions') && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions') && init?.method === 'POST') {
      transitioned = true;
      throw new Error('Response constructor: Invalid response status code 204');
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const result = await harness.performAction<{ message: string }>('issue.setUpstreamStatus', {
      companyId: 'company-1',
      issueId: 'issue-1',
      transitionId: '31'
    });

    const presentation = await harness.getData<{
      isSynced: boolean;
      upstreamStatus?: { name: string; category: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.match(result.message, /Updated upstream status to Done/);
    assert.equal(presentation.isSynced, true);
    assert.equal(presentation.upstreamStatus?.name, 'Done');
    assert.equal(presentation.upstreamStatus?.category, 'Done');
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamStatus supports GitHub close reasons', async () => {
  let receivedUpdate:
    | {
      state?: string;
      state_reason?: string;
    }
    | undefined;

  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1') && init?.method === 'PATCH') {
      receivedUpdate = JSON.parse(String(init.body ?? '{}')) as {
        state?: string;
        state_reason?: string;
      };
      return jsonResponse({
        id: 1,
        number: 1,
        title: 'GitHub issue',
        body: 'Imported from GitHub',
        state: receivedUpdate.state,
        state_reason: receivedUpdate.state_reason,
        html_url: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        assignees: [{ login: 'andriy-dmytruk' }],
        user: { login: 'octocat' },
        created_at: '2026-04-21T13:03:54.000Z',
        updated_at: '2026-04-21T13:08:38.000Z'
      });
    }
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1') && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        id: 1,
        number: 1,
        title: 'GitHub issue',
        body: 'Imported from GitHub',
        state: 'closed',
        state_reason: 'duplicate',
        html_url: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        assignees: [{ login: 'andriy-dmytruk' }],
        user: { login: 'octocat' },
        created_at: '2026-04-21T13:03:54.000Z',
        updated_at: '2026-04-21T13:08:38.000Z'
      });
    }
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1/comments?per_page=100')) {
      return jsonResponse([]);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-external-issues-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      status: 'Open',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-github',
        jiraIssueId: '1',
        jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
        jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
        jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        jiraStatusName: 'Open',
        jiraStatusCategory: 'Open',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    const result = await harness.performAction<{ message: string }>('issue.setUpstreamStatus', {
      companyId: 'company-1',
      issueId: 'issue-1',
      transitionId: 'closed:duplicate'
    });

    const presentation = await harness.getData<{
      upstreamStatus?: { name: string; category: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });
    const reloadedIssue = await harness.ctx.issues.get('issue-1', 'company-1');

    assert.deepEqual(receivedUpdate, {
      state: 'closed',
      state_reason: 'duplicate'
    });
    assert.match(result.message, /Updated upstream status to Duplicate/);
    assert.equal(presentation.upstreamStatus?.name, 'Duplicate');
    assert.equal(presentation.upstreamStatus?.category, 'Done');
    assert.equal(reloadedIssue?.status, 'done');
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation and upstream status action do not recover a missing link entity from markers', async () => {
  let transitioned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue/PRJ-318?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10318',
        key: 'PRJ-318',
        fields: {
          summary: 'Recovered sync issue',
          description: { type: 'doc', version: 1, content: [] },
          status: transitioned
            ? { name: 'Done', statusCategory: { name: 'Done' } }
            : { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: { comments: [] },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' },
          assignee: { displayName: 'Recovered User' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-318/transitions') && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-318/transitions') && init?.method === 'POST') {
      transitioned = true;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-recover-link',
          projectId: 'project-1',
          title: '[PRJ-318] Recovered sync issue',
          description: 'Recovered body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-318 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const presentation = await harness.getData<{
      isSynced: boolean;
      upstreamIssueKey?: string | null;
      upstreamStatus?: { name: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-recover-link'
    });

    const refreshedPresentation = await harness.getData<{
      isSynced: boolean;
      upstreamStatus?: { name: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-recover-link'
    });

    await assert.rejects(
      async () => await harness.performAction('issue.setUpstreamStatus', {
        companyId: 'company-1',
        issueId: 'issue-recover-link',
        transitionId: '31'
      }),
      /not linked to an upstream issue yet/
    );

    assert.equal(presentation.isSynced, false);
    assert.equal(presentation.upstreamIssueKey, null);
    assert.equal(presentation.upstreamStatus, undefined);
    assert.equal(refreshedPresentation.isSynced, false);
    assert.equal(refreshedPresentation.upstreamStatus, undefined);
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation resolves the correct link when the host ignores entity scope filters', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [
      makeIssue({
        id: 'issue-1',
        projectId: 'project-1',
        title: '[PRJ-161] First imported issue',
        description: 'Body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-161 -->'
      }),
      makeIssue({
        id: 'issue-2',
        projectId: 'project-1',
        title: '[PRJ-221] Second imported issue',
        description: 'Body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-221 -->'
      })
    ]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: 'provider-default-jira',
    mappings: [
      {
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-external-issues-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-1',
    externalId: 'PRJ-161:issue-1',
    title: 'PRJ-161',
    status: 'Backlog',
    data: {
      issueId: 'issue-1',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10001',
      jiraIssueKey: 'PRJ-161',
      jiraProjectKey: 'PRJ',
      jiraUrl: 'https://jira.example.com/browse/PRJ-161',
      jiraStatusName: 'Backlog',
      jiraStatusCategory: 'To Do',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });
  await harness.ctx.entities.upsert({
    entityType: 'paperclip-external-issues-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-2',
    externalId: 'PRJ-221:issue-2',
    title: 'PRJ-221',
    status: 'In Progress',
    data: {
      issueId: 'issue-2',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10002',
      jiraIssueKey: 'PRJ-221',
      jiraProjectKey: 'PRJ',
      jiraUrl: 'https://jira.example.com/browse/PRJ-221',
      jiraStatusName: 'In Progress',
      jiraStatusCategory: 'In Progress',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });

  const originalList = harness.ctx.entities.list.bind(harness.ctx.entities);
  harness.ctx.entities.list = async (query) => {
    const degradedQuery = query.entityType
      ? { entityType: query.entityType, limit: query.limit }
      : { limit: query.limit };
    return await originalList(degradedQuery as typeof query);
  };

  const presentation = await harness.getData<{
    isSynced: boolean;
    upstreamIssueKey?: string | null;
    upstreamStatus?: { name: string };
  }>('issue.syncPresentation', {
    companyId: 'company-1',
    issueId: 'issue-2'
  });

  assert.equal(presentation.isSynced, true);
  assert.equal(presentation.upstreamIssueKey, 'PRJ-221');
  assert.equal(presentation.upstreamStatus?.name, 'In Progress');
});

test('comment sync presentation marks fetched comments and local comments separately', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: {
            name: 'Backlog',
            statusCategory: { name: 'To Do' }
          },
          comment: {
            comments: [
              {
                id: 'comment-remote-1',
                body: {
                  type: 'doc',
                  version: 1,
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Fetched Jira comment' }]
                    }
                  ]
                },
                author: { displayName: 'Jira User' },
                created: '2026-04-21T13:03:54.000+0000',
                updated: '2026-04-21T13:03:54.000+0000'
              }
            ]
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/comment') && init?.method === 'POST') {
      return jsonResponse({
        id: 'comment-remote-2'
      }, 201);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    await harness.performAction('issue.pullFromUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const comments = await harness.ctx.issues.listComments('issue-1', 'company-1');
    const fetchedComment = comments.find((comment) => comment.body.includes('Fetched Jira comment'));
    assert.ok(fetchedComment);

    const localComment = await harness.ctx.issues.createComment('issue-1', 'Local comment to upload', 'company-1');

    const fetchedPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: fetchedComment.id
    });
    const localPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: localComment.id
    });
    const uploadResult = await harness.performAction<{
      upstreamCommentId?: string;
      message: string;
    }>('comment.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: localComment.id
    });

    const uploadedPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: localComment.id
    });

    assert.equal(fetchedPresentation.origin, 'provider_pull');
    assert.equal(fetchedPresentation.styleTone, 'synced');
    assert.equal(fetchedPresentation.badgeLabel, 'Imported');
    assert.equal(fetchedPresentation.uploadAvailable, false);
    assert.equal(localPresentation.origin, 'paperclip');
    assert.equal(localPresentation.styleTone, 'local');
    assert.equal(localPresentation.badgeLabel, 'Local only');
    assert.equal(localPresentation.uploadAvailable, true);
    assert.equal(uploadResult.upstreamCommentId, 'comment-remote-2');
    assert.equal(uploadedPresentation.origin, 'provider_push');
    assert.equal(uploadedPresentation.styleTone, 'info');
    assert.equal(uploadedPresentation.badgeLabel, 'Published upstream');
    assert.equal(uploadedPresentation.uploadAvailable, false);
  } finally {
    restoreFetch();
  }
});

test('issue.comment.submit always publishes synced issue comments to Jira', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue/PRJ-999/comment') && init?.method === 'POST') {
      return jsonResponse({
        id: 'comment-remote-99'
      }, 201);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-default-jira',
            type: 'jira',
            name: 'Default Jira',
            jiraBaseUrl: 'https://jira.example.com',
            jiraToken: 'jira-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[PRJ-999] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-999 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-default-jira',
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'PRJ-999',
      title: 'PRJ-999',
      status: 'Backlog',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-default-jira',
        jiraIssueId: '10002',
        jiraIssueKey: 'PRJ-999',
        jiraProjectKey: 'PRJ',
        jiraUrl: 'https://jira.example.com/browse/PRJ-999',
        jiraStatusName: 'Backlog',
        jiraStatusCategory: 'To Do',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    const publishResult = await harness.performAction<{
      commentId: string;
      publishedUpstream: boolean;
      upstreamCommentId?: string | null;
      message: string;
    }>('issue.comment.submit', {
      companyId: 'company-1',
      params: {
        companyId: 'company-1',
        issueId: 'issue-1',
        body: 'Publish this upstream too'
      }
    } as any);

    const publishedPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: publishResult.commentId
    });

    const comments = await harness.ctx.issues.listComments('issue-1', 'company-1');
    assert.equal(comments.length, 1);
    assert.equal(publishResult.publishedUpstream, true);
    assert.equal(publishResult.upstreamCommentId, 'comment-remote-99');
    assert.match(publishResult.message, /published it to Jira/);
    assert.equal(publishedPresentation.origin, 'provider_push');
    assert.equal(publishedPresentation.badgeLabel, 'Published upstream');
    assert.equal(publishedPresentation.upstreamCommentId, 'comment-remote-99');
    assert.equal(publishedPresentation.uploadAvailable, false);
  } finally {
    restoreFetch();
  }
});

test('issue.comment.submit preserves the local comment and surfaces GitHub permission failures', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1/comments') && init?.method === 'POST') {
      return jsonResponse({
        message: 'Resource not accessible by personal access token'
      }, 403);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-external-issues-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      status: 'Open',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-github',
        jiraIssueId: '1',
        jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
        jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
        jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        jiraStatusName: 'Open',
        jiraStatusCategory: 'Open',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    await assert.rejects(
      async () => await harness.performAction('issue.comment.submit', {
        companyId: 'company-1',
        params: {
          companyId: 'company-1',
          issueId: 'issue-1',
          body: 'Publish this upstream too'
        }
      } as any),
      /Created the comment in Paperclip, but GitHub publishing failed: GitHub request failed \(403\)\. Resource not accessible by personal access token.*Personal Access Token can write issues for this repository/i
    );

    const comments = await harness.ctx.issues.listComments('issue-1', 'company-1');
    assert.equal(comments.length, 1);
    assert.equal(comments[0]?.body, 'Publish this upstream too');
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation loads GitHub upstream comments', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1')) {
      return jsonResponse({
        id: 1,
        number: 1,
        title: 'GitHub issue',
        body: 'Imported from GitHub',
        state: 'open',
        html_url: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        assignees: [{ login: 'andriy-dmytruk' }],
        user: { login: 'octocat' },
        created_at: '2026-04-21T13:03:54.000Z',
        updated_at: '2026-04-21T13:08:38.000Z'
      });
    }
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1/comments?per_page=100')) {
      return jsonResponse([
        {
          id: 101,
          body: 'First GitHub comment',
          user: { login: 'commenter-one' },
          created_at: '2026-04-21T13:10:00.000Z',
          updated_at: '2026-04-21T13:10:00.000Z'
        },
        {
          id: 102,
          body: 'Second GitHub comment',
          user: { login: 'commenter-two' },
          created_at: '2026-04-21T13:11:00.000Z',
          updated_at: '2026-04-21T13:11:00.000Z'
        }
      ]);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-external-issues-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-external-issues-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      status: 'Open',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-github',
        jiraIssueId: '1',
        jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
        jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
        jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        jiraStatusName: 'Open',
        jiraStatusCategory: 'Open',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    const presentation = await harness.getData<{
      upstream?: {
        jiraCreatorDisplayName?: string;
      };
      upstreamComments?: Array<{ id: string; authorDisplayName: string; body: string }>;
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'octocat');
    assert.deepEqual(presentation.upstreamComments ?? [], [
      {
        id: '101',
        authorDisplayName: 'commenter-one',
        body: 'First GitHub comment',
        createdAt: '2026-04-21T13:10:00.000Z',
        updatedAt: '2026-04-21T13:10:00.000Z'
      },
      {
        id: '102',
        authorDisplayName: 'commenter-two',
        body: 'Second GitHub comment',
        createdAt: '2026-04-21T13:11:00.000Z',
        updatedAt: '2026-04-21T13:11:00.000Z'
      }
    ]);
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation falls back to reporter when Jira creator is not present', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'PRJ-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: {
            name: 'In Progress',
            statusCategory: { name: 'In Progress' }
          },
          comment: {
            comments: []
          },
          reporter: {
            displayName: 'Issue Reporter'
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/PRJ-999/transitions')) {
      return jsonResponse({
        transitions: []
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToUpstream', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const presentation = await harness.getData<{
      upstream?: {
        jiraCreatorDisplayName?: string;
      };
      upstreamComments?: Array<{ id: string }>;
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'Issue Reporter');
    assert.deepEqual(presentation.upstreamComments ?? [], []);
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation keeps a mapped local issue unsynced until it is linked', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [makeIssue()]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    mappings: [
      {
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  const presentation = await harness.getData<{
    visible: boolean;
    isSynced: boolean;
    linked?: boolean;
    upstreamIssueKey?: string | null;
    openInProviderUrl?: string | null;
    upstreamStatus?: { name: string; category: string };
    mapping?: { jiraProjectKey: string };
  }>('issue.syncPresentation', {
    companyId: 'company-1',
    issueId: 'issue-1'
  });

  assert.equal(presentation.visible, true);
  assert.equal(presentation.isSynced, false);
  assert.equal(presentation.linked, false);
  assert.equal(presentation.upstreamIssueKey, null);
  assert.equal(presentation.openInProviderUrl, null);
  assert.equal(presentation.upstreamStatus, undefined);
  assert.equal(presentation.mapping?.jiraProjectKey, 'PRJ');
});

test('issue sync presentation uses persisted link metadata even when markers are missing', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [
      makeIssue({
        id: 'issue-stale-link',
        title: 'test',
        description: ''
      })
    ]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    mappings: [
      {
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-external-issues-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-stale-link',
    externalId: 'PRJ-461',
    title: 'PRJ-461',
    status: 'In Review',
    data: {
      issueId: 'issue-stale-link',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10001',
      jiraIssueKey: 'PRJ-461',
      jiraProjectKey: 'PRJ',
      jiraUrl: 'https://jira.example.com/browse/PRJ-461',
      jiraAssigneeDisplayName: 'Andriy Dmytruk',
      jiraStatusName: 'In Review',
      jiraStatusCategory: 'In Progress',
      lastSyncedAt: '2026-04-21T17:50:14.000Z',
      lastPulledAt: '2026-04-21T17:50:14.000Z',
      source: 'jira'
    }
  });

  const presentation = await harness.getData<{
    visible: boolean;
    isSynced: boolean;
    upstreamIssueKey?: string | null;
    openInProviderUrl?: string | null;
    upstreamStatus?: { name: string; category: string };
  }>('issue.syncPresentation', {
    companyId: 'company-1',
    issueId: 'issue-stale-link'
  });

  assert.equal(presentation.visible, true);
  assert.equal(presentation.isSynced, true);
  assert.equal(presentation.upstreamIssueKey, 'PRJ-461');
  assert.equal(presentation.openInProviderUrl, 'https://jira.example.com/browse/PRJ-461');
  assert.deepEqual(presentation.upstreamStatus, {
    name: 'In Review',
    category: 'In Progress'
  });
});

test('ui helper labels describe sync progress and comment origin', async () => {
  assert.equal(
    buildSyncProgressLabel({
      status: 'running',
      processedCount: 2,
      totalCount: 5
    }),
    '2 of 5 issues processed'
  );
  assert.equal(buildCommentOriginLabel('provider_pull'), 'Fetched from Jira');
  assert.equal(buildCommentOriginLabel('provider_pull', 'github_issues'), 'Fetched from GitHub');
  assert.equal(buildCommentOriginLabel('paperclip'), 'Local Paperclip comment');
});
