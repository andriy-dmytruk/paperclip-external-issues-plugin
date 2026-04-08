#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const [, , pluginName, ...restArgs] = process.argv;

if (!pluginName) {
  console.error('Usage: pnpm plugin:create <npm-package-name> [-- <extra scaffold args>]');
  process.exit(1);
}

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, 'plugins');
const scaffoldEntrypoint = path.join(
  repoRoot,
  'vendor',
  'paperclip',
  'packages',
  'plugins',
  'create-paperclip-plugin',
  'dist',
  'index.js'
);

if (!existsSync(scaffoldEntrypoint)) {
  console.error([
    'Missing scaffold CLI at:',
    `  ${scaffoldEntrypoint}`,
    '',
    'Build or vendor the Paperclip scaffold package, then rerun:',
    '  pnpm plugin:create <npm-package-name>',
    '',
    'Expected source repo layout:',
    '  vendor/paperclip/packages/plugins/create-paperclip-plugin/dist/index.js'
  ].join('\n'));
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [scaffoldEntrypoint, pluginName, '--output', outputDir, ...restArgs],
  {
    stdio: 'inherit',
    cwd: repoRoot
  }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
