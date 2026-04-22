import { resolve } from 'node:path';

export interface JiraDcArtifactPaths {
  version: string;
  artifactDir: string;
  wadlPath: string;
  openApiPath: string;
  clientOutputDir: string;
}

export function resolveJiraDcArtifactPaths(packageRoot: string, version: string): JiraDcArtifactPaths {
  const artifactDir = resolve(packageRoot, 'vendor', 'jira-dc', version);
  return {
    version,
    artifactDir,
    wadlPath: resolve(artifactDir, 'jira-rest-plugin.wadl'),
    openApiPath: resolve(artifactDir, 'openapi.json'),
    clientOutputDir: resolve(packageRoot, 'generated', 'jira-dc-client', version)
  };
}
