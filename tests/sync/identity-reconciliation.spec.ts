import { strict as assert } from 'node:assert';
import test from 'node:test';

import { normalizeGitHubIssueRecord } from '../../src/providers/github-issues/normalize.ts';
import { normalizeJiraIssue } from '../../src/providers/jira/normalize.ts';
import { buildLinkIdentityCandidates, getLinkIdentityMetadata } from '../../src/worker/sync/reconcile.ts';

test('Jira issues get a globally unique upstream id that includes the Jira base URL', () => {
  const issue = normalizeJiraIssue(
    {
      id: '10002',
      key: 'PRJ-52',
      fields: {
        summary: 'Test issue',
        description: 'Body',
        status: { name: 'To Do', statusCategory: { name: 'To Do' } },
        comment: { comments: [] },
        updated: '2026-04-24T10:00:00.000Z',
        created: '2026-04-23T10:00:00.000Z',
        issuetype: { name: 'Task' }
      }
    },
    {
      providerId: 'provider-1',
      providerName: 'Jira',
      baseUrl: 'https://jira.example.com',
      defaultIssueType: 'Task'
    },
    {
      normalizeOptionalString: (value) => typeof value === 'string' ? value.trim() || undefined : undefined,
      getUpstreamUserDisplayName: () => undefined,
      getUpstreamUserQueryValue: () => undefined,
      defaultIssueType: 'Task'
    }
  );

  assert.equal(issue?.uniqueUpstreamId, 'jira:https://jira.example.com:10002');
});

test('GitHub issues get a globally unique upstream id that includes host and repository', () => {
  const issue = normalizeGitHubIssueRecord(
    {
      id: 4,
      number: 4,
      title: 'Test issue',
      body: 'Body',
      state: 'open',
      html_url: 'https://github.com/Andriy-Dmytruk/andriy-dmytruk.github.io/issues/4',
      created_at: '2026-04-23T10:00:00.000Z',
      updated_at: '2026-04-24T10:00:00.000Z'
    },
    'Andriy-Dmytruk/andriy-dmytruk.github.io',
    {
      getStatusName: () => 'Open',
      getStatusCategory: () => 'To Do',
      apiBaseUrl: 'https://api.github.com'
    }
  );

  assert.equal(issue.uniqueUpstreamId, 'github:api.github.com:andriy-dmytruk/andriy-dmytruk.github.io#4');
});

test('reconcile metadata stores only the unique upstream id', () => {
  const metadata = getLinkIdentityMetadata({
    uniqueUpstreamId: 'GitHub:API.GITHUB.COM:Repo/Name#4'
  });

  assert.deepEqual(metadata, {
    uniqueUpstreamId: 'github:api.github.com:repo/name#4'
  });
});

test('buildLinkIdentityCandidates prefers the persisted unique upstream id', () => {
  const candidates = buildLinkIdentityCandidates({
    uniqueUpstreamId: 'GitHub:API.GITHUB.COM:Repo/Name#4'
  });

  assert.deepEqual(candidates, ['github:api.github.com:repo/name#4']);
});
