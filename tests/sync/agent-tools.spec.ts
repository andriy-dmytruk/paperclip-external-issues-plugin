import { strict as assert } from 'node:assert';
import test from 'node:test';

import manifest from '../../src/manifest.ts';
import plugin from '../../src/worker.ts';
import {
  createTestHarness,
  installMockFetch,
  jsonResponse,
  makeAgent,
  makeIssue,
  makeProject
} from '../helpers/plugin-test-helpers.ts';

test('sync.projectPage defaults agent issue provider access to disabled for legacy project settings', async () => {
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
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  const projectPage = await harness.getData<{
    projectSettings?: {
      agentIssueProviderAccess?: {
        enabled: boolean;
        allowedAgentIds: string[];
      };
    };
  }>('sync.projectPage', {
    companyId: 'company-1',
    projectId: 'project-1'
  });

  assert.deepEqual(projectPage.projectSettings?.agentIssueProviderAccess, {
    enabled: false,
    allowedAgentIds: []
  });
});

test('create_upstream_issue tool creates a Jira issue for an allowlisted agent', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: { comments: [] },
          assignee: { displayName: 'Paperclip Owner' },
          creator: { displayName: 'Issue Creator' },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' }
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
      issues: [makeIssue()],
      agents: [makeAgent()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      agentIssueProviderAccess: {
        enabled: true,
        allowedAgentIds: ['agent-1']
      },
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ],
      scheduleFrequencyMinutes: 15
    });

    const result = await harness.executeTool<{
      data?: { issueKey?: string };
      content?: string;
      error?: string;
    }>(
      'create_upstream_issue',
      { paperclipIssueId: 'issue-1' },
      {
        companyId: 'company-1',
        projectId: 'project-1',
        agentId: 'agent-1'
      }
    );

    const details = await harness.getData<{
      linked: boolean;
      upstream?: { issueKey?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(result.error, undefined);
    assert.equal(result.data?.issueKey, 'GRB-999');
    assert.match(result.content ?? '', /Created upstream issue GRB-999\./);
    assert.equal(details.linked, true);
    assert.equal(details.upstream?.issueKey, 'GRB-999');
  } finally {
    restoreFetch();
  }
});

test('create_upstream_issue tool routes through the GitHub provider for an allowlisted agent', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/owner/repo/issues') && init?.method === 'POST') {
      return jsonResponse({
        id: 44,
        number: 44,
        title: 'Local Paperclip issue',
        body: 'Local body',
        state: 'open',
        html_url: 'https://github.com/owner/repo/issues/44',
        user: {
          login: 'octocat'
        },
        created_at: '2026-04-21T13:03:54.000Z',
        updated_at: '2026-04-21T13:08:38.000Z'
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
      issues: [makeIssue()],
      agents: [makeAgent()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      agentIssueProviderAccess: {
        enabled: true,
        allowedAgentIds: ['agent-1']
      },
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'owner/repo',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ],
      scheduleFrequencyMinutes: 15
    });

    const result = await harness.executeTool<{
      data?: { issueKey?: string };
      error?: string;
    }>(
      'create_upstream_issue',
      { paperclipIssueId: 'issue-1' },
      {
        companyId: 'company-1',
        projectId: 'project-1',
        agentId: 'agent-1'
      }
    );

    const details = await harness.getData<{
      linked: boolean;
      upstream?: { issueKey?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(result.error, undefined);
    assert.equal(result.data?.issueKey, 'owner/repo#44');
    assert.equal(details.linked, true);
    assert.equal(details.upstream?.issueKey, 'owner/repo#44');
  } finally {
    restoreFetch();
  }
});

test('issue provider agent tools reject agents that are not allowlisted', async () => {
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
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: 'provider-default-jira',
    agentIssueProviderAccess: {
      enabled: true,
      allowedAgentIds: ['agent-2']
    },
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ],
    scheduleFrequencyMinutes: 15
  });

  const result = await harness.executeTool<{ error?: string }>(
    'create_upstream_issue',
    { paperclipIssueId: 'issue-1' },
    {
      companyId: 'company-1',
      projectId: 'project-1',
      agentId: 'agent-1'
    }
  );

  assert.match(result.error ?? '', /not allowed to use issue provider tools/i);
});

test('issue provider agent tools reject projects with access disabled, missing provider, or a mismatched run project', async () => {
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
      makeProject(),
      makeProject({
        id: 'project-2',
        name: 'Beta'
      })
    ],
    issues: [
      makeIssue(),
      makeIssue({
        id: 'issue-2',
        projectId: 'project-2',
        title: 'Other project issue'
      })
    ],
    agents: [makeAgent()]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: 'provider-default-jira',
    agentIssueProviderAccess: {
      enabled: false,
      allowedAgentIds: ['agent-1']
    },
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ],
    scheduleFrequencyMinutes: 15
  });

  const disabledResult = await harness.executeTool<{ error?: string }>(
    'create_upstream_issue',
    { paperclipIssueId: 'issue-1' },
    {
      companyId: 'company-1',
      projectId: 'project-1',
      agentId: 'agent-1'
    }
  );
  assert.match(disabledResult.error ?? '', /not enabled for this project/i);

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: null,
    agentIssueProviderAccess: {
      enabled: true,
      allowedAgentIds: ['agent-1']
    },
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ],
    scheduleFrequencyMinutes: 15
  });

  const noProviderResult = await harness.executeTool<{ error?: string }>(
    'create_upstream_issue',
    { paperclipIssueId: 'issue-1' },
    {
      companyId: 'company-1',
      projectId: 'project-1',
      agentId: 'agent-1'
    }
  );
  assert.match(noProviderResult.error ?? '', /does not have an issue provider selected/i);

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-2',
    projectName: 'Beta',
    providerId: 'provider-default-jira',
    agentIssueProviderAccess: {
      enabled: true,
      allowedAgentIds: ['agent-1']
    },
    mappings: [
      {
        jiraProjectKey: 'BET',
        paperclipProjectId: 'project-2',
        paperclipProjectName: 'Beta'
      }
    ],
    scheduleFrequencyMinutes: 15
  });

  const mismatchedProjectResult = await harness.executeTool<{ error?: string }>(
    'create_upstream_issue',
    { paperclipIssueId: 'issue-2' },
    {
      companyId: 'company-1',
      projectId: 'project-1',
      agentId: 'agent-1'
    }
  );
  assert.match(mismatchedProjectResult.error ?? '', /agent run project/i);
});
