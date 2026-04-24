import { strict as assert } from 'node:assert';
import test from 'node:test';

import manifest from '../../src/manifest.ts';
import plugin from '../../src/worker.ts';
import { createTestHarness, installMockFetch, jsonResponse, makeIssue, makeProject } from '../helpers/plugin-test-helpers.ts';

test('sync.findCleanupCandidates includes legacy untouched Jira imports across local Paperclip statuses', async () => {
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
        id: 'issue-legacy-import',
        title: '[PRJ-777] Legacy imported Jira issue',
        description: 'Imported body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-777 -->',
        status: 'backlog'
      })
    ]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 15,
    mappings: [
      {
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
    scopeId: 'issue-legacy-import',
    externalId: 'PRJ-777',
    title: 'PRJ-777',
    status: 'Backlog',
    data: {
      issueId: 'issue-legacy-import',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10077',
      jiraIssueKey: 'PRJ-777',
      jiraProjectKey: 'PRJ',
      jiraUrl: 'https://jira.example.com/browse/PRJ-777',
      jiraStatusName: 'Backlog',
      jiraStatusCategory: 'To Do',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      lastPulledAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });

  const result = await harness.performAction<{
    count: number;
    candidates: Array<{ issueId: string; jiraIssueKey: string; status: string }>;
  }>('sync.findCleanupCandidates', {
    companyId: 'company-1'
  });

  assert.equal(result.count, 1);
  assert.equal(result.candidates[0]?.issueId, 'issue-legacy-import');
  assert.equal(result.candidates[0]?.jiraIssueKey, 'PRJ-777');
  assert.equal(result.candidates[0]?.status, 'backlog');
});

test('sync.findCleanupCandidates ignores hidden imported issues', async () => {
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
        id: 'issue-hidden-import',
        title: '[PRJ-778] Hidden imported Jira issue',
        description: 'Imported body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-778 -->',
        hidden: true,
        status: 'backlog'
      })
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-external-issues-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-hidden-import',
    externalId: 'PRJ-778',
    title: 'PRJ-778',
    status: 'Backlog',
    data: {
      issueId: 'issue-hidden-import',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10078',
      jiraIssueKey: 'PRJ-778',
      jiraProjectKey: 'PRJ',
      jiraUrl: 'https://jira.example.com/browse/PRJ-778',
      jiraStatusName: 'Backlog',
      jiraStatusCategory: 'To Do',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      lastPulledAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });

  const result = await harness.performAction<{
    count: number;
    candidates: Array<{ issueId: string }>;
  }>('sync.findCleanupCandidates', {
    companyId: 'company-1'
  });

  assert.equal(result.count, 0);
  assert.equal(result.candidates.length, 0);
});

test('sync.cleanupImportedIssues accepts selected issues without mutating issue visibility directly', async () => {
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
        id: 'issue-cleanup-import',
        title: '[PRJ-779] Cleanup imported Jira issue',
        description: 'Imported body\n\n<!-- paperclip-external-issues-plugin-upstream: PRJ-779 -->',
        hiddenAt: null,
        status: 'backlog'
      })
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-external-issues-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-cleanup-import',
    externalId: 'PRJ-779',
    title: 'PRJ-779',
    status: 'Backlog',
    data: {
      issueId: 'issue-cleanup-import',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10079',
      jiraIssueKey: 'PRJ-779',
      jiraProjectKey: 'PRJ',
      jiraUrl: 'https://jira.example.com/browse/PRJ-779',
      jiraStatusName: 'Backlog',
      jiraStatusCategory: 'To Do',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      lastPulledAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });

  const beforeCleanup = await harness.performAction<{
    count: number;
    candidates: Array<{ issueId: string }>;
  }>('sync.findCleanupCandidates', {
    companyId: 'company-1',
    projectId: 'project-1'
  });
  assert.equal(beforeCleanup.count, 1);

  const cleanupResult = await harness.performAction<{ count: number; message: string }>('sync.cleanupImportedIssues', {
    companyId: 'company-1',
    projectId: 'project-1',
    issueIds: ['issue-cleanup-import']
  });
  assert.equal(cleanupResult.count, 1);
  assert.match(cleanupResult.message, /Selected 1 imported issue/);

  const reloadedIssue = await harness.ctx.issues.get('issue-cleanup-import', 'company-1');
  assert.equal(reloadedIssue?.hiddenAt, null);
  assert.notEqual((reloadedIssue as unknown as Record<string, unknown>)?.hidden, true);
});

test('sync.findCleanupCandidates includes untouched imported GitHub issues', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues?state=all&per_page=50')) {
      return jsonResponse([
        {
          id: 1,
          number: 1,
          title: 'Imported GitHub issue',
          body: 'Imported from GitHub',
          state: 'open',
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

    await harness.performAction('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    const result = await harness.performAction<{
      count: number;
      candidates: Array<{ issueId: string; jiraIssueKey: string; status: string }>;
    }>('sync.findCleanupCandidates', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(result.count, 1);
    assert.equal(result.candidates[0]?.jiraIssueKey, 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1');
    assert.equal(result.candidates[0]?.status, 'todo');
  } finally {
    restoreFetch();
  }
});

test('sync.findCleanupCandidates still includes imported GitHub issues after local sync activity', async () => {
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
        id: 'issue-github-import',
        title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2] Imported GitHub issue with local edits',
        description: 'Locally tweaked body\n\n<!-- paperclip-external-issues-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2 -->',
        status: 'in_progress'
      })
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-external-issues-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-github-import',
    externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
    title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
    status: 'Open',
    data: {
      issueId: 'issue-github-import',
      companyId: 'company-1',
      projectId: 'project-1',
      providerId: 'provider-github',
      jiraIssueId: '2',
      jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
      jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
      jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/2',
      jiraStatusName: 'Open',
      jiraStatusCategory: 'Open',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      lastPulledAt: '2026-04-21T13:08:38.000Z',
      lastPushedAt: '2026-04-21T13:10:00.000Z',
      source: 'jira',
      importedTitleHash: 'stale-title-hash',
      importedDescriptionHash: 'stale-description-hash'
    }
  });

  await harness.ctx.state.set({
    scopeKind: 'issue',
    scopeId: 'issue-github-import',
    stateKey: 'paperclip-external-issues-plugin-comment-links'
  }, {
    'comment-1': {
      commentId: 'comment-1',
      issueId: 'issue-github-import',
      companyId: 'company-1',
      jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
      jiraCommentId: '200',
      direction: 'push',
      lastSyncedAt: '2026-04-21T13:11:00.000Z'
    }
  });

  const result = await harness.performAction<{
    count: number;
    candidates: Array<{ issueId: string; jiraIssueKey: string; status: string }>;
  }>('sync.findCleanupCandidates', {
    companyId: 'company-1',
    projectId: 'project-1'
  });

  assert.equal(result.count, 1);
  assert.equal(result.candidates[0]?.issueId, 'issue-github-import');
  assert.equal(result.candidates[0]?.jiraIssueKey, 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2');
  assert.equal(result.candidates[0]?.status, 'in_progress');
});
