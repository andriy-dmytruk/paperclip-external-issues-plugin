import { createJiraDcProviderAdapter } from './jira-dc/adapter.ts';
import { createJiraCloudProviderAdapter } from './jira-cloud/adapter.ts';
import { createGitHubIssuesProviderAdapter } from './github-issues/adapter.ts';
import { ProviderRegistry } from './shared/registry.ts';

export function createProviderRegistry<TContext>(): ProviderRegistry<TContext> {
  const registry = new ProviderRegistry<TContext>();
  registry.register(createJiraDcProviderAdapter<TContext>());
  registry.register(createJiraCloudProviderAdapter<TContext>());
  registry.register(createGitHubIssuesProviderAdapter<TContext>());
  return registry;
}
