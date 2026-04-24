import { strict as assert } from 'node:assert';
import test from 'node:test';

import { buildUpstreamIdentityKey, getLegacyIdentityCandidates, normalizeUpstreamProviderScope } from '../../src/worker/sync/identity.ts';
import { buildLinkIdentityCandidates, getLinkIdentityMetadata } from '../../src/worker/sync/reconcile.ts';

test('buildUpstreamIdentityKey is deterministic across case and whitespace', () => {
  const first = buildUpstreamIdentityKey({
    providerType: 'jira_dc',
    jiraProjectKey: ' GRB ',
    jiraIssueId: ' 10002 ',
    jiraIssueKey: 'grb-52'
  });
  const second = buildUpstreamIdentityKey({
    providerType: 'jira_dc',
    jiraProjectKey: 'grb',
    jiraIssueId: '10002',
    jiraIssueKey: 'GRB-52'
  });

  assert.equal(first, second);
  assert.equal(first, 'jira_dc:grb:10002');
});

test('getLegacyIdentityCandidates includes explicit and fallback forms', () => {
  const candidates = getLegacyIdentityCandidates({
    providerType: 'jira_dc',
    jiraProjectKey: 'GRB',
    jiraIssueId: '10002',
    jiraIssueKey: 'GRB-52'
  });

  assert.ok(candidates.includes('jira_dc:grb:10002'));
  assert.ok(candidates.includes('jira_dc:grb:grb-52'));
  assert.ok(candidates.includes('jira_dc:jira:grb-52'));
});

test('reconcile metadata normalizes provider scope and identity key', () => {
  const metadata = getLinkIdentityMetadata({
    providerType: 'github_issues',
    jiraProjectKey: ' Andriy-Dmytruk/andriy-dmytruk.github.io ',
    jiraIssueId: '4',
    jiraIssueKey: 'andriy-dmytruk/andriy-dmytruk.github.io#4'
  });

  assert.equal(metadata.upstreamProviderType, 'github_issues');
  assert.equal(metadata.upstreamProviderScope, 'andriy-dmytruk/andriy-dmytruk.github.io');
  assert.equal(metadata.upstreamIdentityKey, 'github_issues:andriy-dmytruk/andriy-dmytruk.github.io:4');
});

test('buildLinkIdentityCandidates prefers persisted upstreamIdentityKey and lowercases it', () => {
  const candidates = buildLinkIdentityCandidates({
    upstreamIdentityKey: 'GitHub_Issues:Repo/Name:4',
    upstreamProviderType: 'github_issues',
    jiraProjectKey: 'Repo/Name',
    jiraIssueId: '4',
    jiraIssueKey: 'repo/name#4'
  });

  assert.deepEqual(candidates, ['github_issues:repo/name:4']);
});

test('normalizeUpstreamProviderScope derives sensible fallback scope', () => {
  assert.equal(normalizeUpstreamProviderScope('github_issues', undefined, 'owner/repo#12'), 'owner/repo');
  assert.equal(normalizeUpstreamProviderScope('jira_dc', undefined, 'GRB-12'), 'grb');
});
