import { jiraDcProviderAdapter } from './jira-dc/adapter.ts';
import { jiraCloudProviderAdapter } from './jira-cloud/adapter.ts';
import { githubIssuesProviderAdapter } from './github-issues/adapter.ts';
import { ProviderRegistry } from './shared/registry.ts';

export function createProviderRegistry(): ProviderRegistry {
  const registry = new ProviderRegistry();
  registry.register(jiraDcProviderAdapter);
  registry.register(jiraCloudProviderAdapter);
  registry.register(githubIssuesProviderAdapter);
  return registry;
}
