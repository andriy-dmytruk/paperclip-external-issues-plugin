#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getOptionalFlag, getRequiredFlag } from './lib/args.ts';
import { resolveJiraDcArtifactPaths } from './lib/paths.ts';
import { convertJiraWadlToOpenApi } from './lib/wadl-openapi.ts';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const version = getRequiredFlag('--version');
const sourceUrl = getOptionalFlag('--source-url')
  ?? `https://docs.atlassian.com/jira/REST/${version}/jira-rest-plugin.wadl`;
const serverUrl = getOptionalFlag('--server-url');
const artifactPaths = resolveJiraDcArtifactPaths(packageRoot, version);

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Could not download Jira WADL from ${sourceUrl} (${response.status}).`);
}

const wadlXml = await response.text();
const openApi = convertJiraWadlToOpenApi(wadlXml, {
  jiraVersion: version,
  sourceUrl,
  ...(serverUrl ? { serverUrl } : {})
});

await mkdir(artifactPaths.artifactDir, { recursive: true });
await writeFile(artifactPaths.wadlPath, wadlXml, 'utf8');
await writeFile(artifactPaths.openApiPath, `${JSON.stringify(openApi, null, 2)}\n`, 'utf8');

console.log(`Saved Jira DC WADL ${version} to ${artifactPaths.wadlPath}`);
console.log(`Saved converted OpenAPI ${version} to ${artifactPaths.openApiPath}`);
