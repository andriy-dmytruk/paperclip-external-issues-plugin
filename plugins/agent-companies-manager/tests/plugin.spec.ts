import { strict as assert } from 'node:assert';
import test from 'node:test';

import manifest from '../src/manifest.ts';
import { listAgentCompanies } from '../src/worker.ts';

test('manifest exposes Paperclip plugin metadata', () => {
  assert.equal(manifest.id, 'agent-companies-manager');
  assert.equal(manifest.apiVersion, 1);
  assert.equal(manifest.entrypoints.worker, './dist/worker.js');
});

test('worker returns scaffold seed companies', async () => {
  const companies = await listAgentCompanies();

  assert.equal(companies.length, 2);
  assert.equal(companies[0]?.name, 'Acme Ops');
});
