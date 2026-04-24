import { strict as assert } from 'node:assert';
import test from 'node:test';

import { loadNormalizedState, saveStateWithUpdatedAt } from '../../src/worker/core/state.ts';

test('loadNormalizedState reads state through the provided normalize function', async () => {
  const ctx = {
    state: {
      async get() {
        return { value: ' raw-value ' };
      }
    }
  };

  const result = await loadNormalizedState(
    ctx,
    { scopeKind: 'instance', stateKey: 'sync-settings' },
    (value) => ((value as { value: string }).value.trim())
  );

  assert.equal(result, 'raw-value');
});

test('saveStateWithUpdatedAt persists payload and adds updatedAt timestamp', async () => {
  const calls: unknown[] = [];
  const ctx = {
    state: {
      async get() {
        return null;
      },
      async set(scope: unknown, value: unknown) {
        calls.push({ scope, value });
      }
    }
  };

  await saveStateWithUpdatedAt(
    ctx,
    { scopeKind: 'instance', stateKey: 'sync-settings' },
    { mappings: [] as unknown[] }
  );

  assert.equal(calls.length, 1);
  const record = calls[0] as {
    scope: { scopeKind: string; stateKey: string };
    value: { mappings: unknown[]; updatedAt?: string };
  };
  assert.deepEqual(record.scope, { scopeKind: 'instance', stateKey: 'sync-settings' });
  assert.deepEqual(record.value.mappings, []);
  assert.equal(typeof record.value.updatedAt, 'string');
  assert.ok(!Number.isNaN(Date.parse(record.value.updatedAt ?? '')));
});
