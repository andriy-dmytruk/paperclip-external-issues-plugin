import { strict as assert } from 'node:assert';
import test from 'node:test';

import manifest from '../../src/manifest.ts';

test('manifest keeps project sync mounted through a toolbar slot', async () => {
  assert.equal(manifest.id, 'paperclip-external-issues-plugin');
  assert.equal(manifest.displayName, 'External Issue Sync');
  assert.ok(manifest.ui?.slots?.some((slot) => slot.type === 'settingsPage'));
  assert.ok(manifest.ui?.slots?.some((slot) => slot.id === 'paperclip-external-issues-plugin-project-sync-toolbar-button'));
  assert.ok((manifest.instanceConfigSchema as any)?.properties?.jiraDcProviders);
  assert.ok((manifest.instanceConfigSchema as any)?.properties?.jiraCloudProviders);
  assert.ok((manifest.instanceConfigSchema as any)?.properties?.githubProviders);
  assert.equal(manifest.ui?.launchers?.length ?? 0, 0);
});

test('manifest registers provider-agnostic issue provider agent tools', async () => {
  assert.ok(manifest.capabilities.includes('agent.tools.register'));
  assert.deepEqual(
    manifest.tools?.map((tool) => tool.name),
    [
      'get_upstream_issue',
      'list_upstream_comments',
      'add_upstream_comment',
      'set_upstream_status',
      'set_upstream_assignee',
      'search_upstream_users',
      'create_upstream_issue'
    ]
  );
});
