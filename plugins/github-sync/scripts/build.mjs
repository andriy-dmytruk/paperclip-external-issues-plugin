#!/usr/bin/env node
import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');
const outdir = resolve(packageRoot, 'dist');

await rm(outdir, { recursive: true, force: true });
await mkdir(resolve(outdir, 'ui'), { recursive: true });

const sharedOptions = {
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  packages: 'external',
  sourcemap: false,
  logLevel: 'info'
};

await build({
  ...sharedOptions,
  entryPoints: [resolve(packageRoot, 'src/manifest.ts')],
  outfile: resolve(outdir, 'manifest.js')
});

await build({
  ...sharedOptions,
  entryPoints: [resolve(packageRoot, 'src/worker.ts')],
  outfile: resolve(outdir, 'worker.js')
});

await build({
  ...sharedOptions,
  entryPoints: [resolve(packageRoot, 'src/ui/index.tsx')],
  outfile: resolve(outdir, 'ui/index.js'),
  jsx: 'automatic'
});

console.log('[github-sync] build complete');
