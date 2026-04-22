#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getOptionalFlag, getRequiredFlag } from './lib/args.ts';
import { resolveJiraDcArtifactPaths } from './lib/paths.ts';
import { convertJiraWadlToOpenApi } from './lib/wadl-openapi.ts';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const version = getRequiredFlag('--version');
const artifactPaths = resolveJiraDcArtifactPaths(packageRoot, version);
const wadlPath = getOptionalFlag('--input') ?? artifactPaths.wadlPath;
const serverUrl = getOptionalFlag('--server-url');
const sourceUrl = getOptionalFlag('--source-url')
  ?? `https://docs.atlassian.com/jira/REST/${version}/jira-rest-plugin.wadl`;

const wadlXml = await readFile(wadlPath, 'utf8');
const openApi = convertJiraWadlToOpenApi(wadlXml, {
  jiraVersion: version,
  sourceUrl,
  ...(serverUrl ? { serverUrl } : {})
});

await mkdir(dirname(artifactPaths.openApiPath), { recursive: true });
await writeFile(artifactPaths.openApiPath, `${JSON.stringify(openApi, null, 2)}\n`, 'utf8');

console.log(`Saved converted OpenAPI ${version} to ${artifactPaths.openApiPath}`);
