#!/usr/bin/env node
import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { getOptionalFlag, getRequiredFlag } from './lib/args.ts';
import { resolveJiraDcArtifactPaths } from './lib/paths.ts';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const version = getRequiredFlag('--version');
const artifactPaths = resolveJiraDcArtifactPaths(packageRoot, version);
const inputPath = getOptionalFlag('--input') ?? artifactPaths.openApiPath;
const outputDir = getOptionalFlag('--output') ?? artifactPaths.clientOutputDir;

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await new Promise<void>((resolvePromise, rejectPromise) => {
  const child = spawn(
    'pnpm',
    [
      'exec',
      'openapi-generator-cli',
      'generate',
      '-g',
      'typescript-fetch',
      '-i',
      inputPath,
      '-o',
      outputDir,
      '--skip-validate-spec',
      '--additional-properties=supportsES6=true,useSingleRequestParameter=true,typescriptThreePlus=true,modelPropertyNaming=original'
    ],
    {
      cwd: packageRoot,
      stdio: 'inherit',
      env: process.env
    }
  );

  child.on('error', rejectPromise);
  child.on('exit', (code) => {
    if (code === 0) {
      resolvePromise();
      return;
    }

    rejectPromise(
      new Error(
        'openapi-generator-cli failed. If its runtime has not been initialized yet, run '
        + '`pnpm exec openapi-generator-cli version-manager set 7.16.0` once in this repo and try again.'
      )
    );
  });
});

console.log(`Generated Jira DC client ${version} in ${outputDir}`);
