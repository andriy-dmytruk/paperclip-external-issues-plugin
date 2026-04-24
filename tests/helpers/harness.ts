import { createTestHarness as createBaseTestHarness } from '@paperclipai/plugin-sdk/testing';

export type MockFetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });
}

export function installMockFetch(handler: MockFetchHandler): () => void {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = handler as typeof fetch;
  return () => {
    globalThis.fetch = previousFetch;
  };
}

function normalizeTestConfig(config: unknown): unknown {
  if (!config || typeof config !== 'object') {
    return config;
  }
  const record = config as Record<string, unknown>;
  if (Array.isArray(record.jiraDcProviders) || Array.isArray(record.jiraCloudProviders) || Array.isArray(record.githubProviders)) {
    return config;
  }

  const legacyProviders = Array.isArray(record.providers) ? record.providers : [];
  if (legacyProviders.length > 0) {
    const normalizeLegacyProviderType = (provider: unknown): string | undefined => {
      if (!provider || typeof provider !== 'object') {
        return undefined;
      }
      const record = provider as Record<string, unknown>;
      if (typeof record.type === 'string' && record.type !== 'jira') {
        return record.type;
      }
      if (typeof record.providerKind === 'string') {
        return record.providerKind;
      }
      return typeof record.type === 'string' ? record.type : undefined;
    };
    const jiraDcProviders = legacyProviders.filter((provider) => {
      const type = normalizeLegacyProviderType(provider);
      return type === 'jira_dc' || type === 'jira';
    });
    const jiraCloudProviders = legacyProviders.filter((provider) => {
      return normalizeLegacyProviderType(provider) === 'jira_cloud';
    });
    const githubProviders = legacyProviders.filter((provider) => {
      return normalizeLegacyProviderType(provider) === 'github_issues';
    });
    return {
      ...record,
      jiraDcProviders,
      jiraCloudProviders,
      githubProviders
    };
  }

  if (typeof record.jiraBaseUrl === 'string' || typeof record.jiraToken === 'string' || typeof record.jiraTokenRef === 'string') {
    return {
      ...record,
      jiraDcProviders: [
        {
          id: 'provider-default-jira',
          type: 'jira_dc',
          name: 'Default Jira',
          jiraBaseUrl: record.jiraBaseUrl,
          jiraUserEmail: record.jiraUserEmail,
          jiraToken: record.jiraToken,
          jiraTokenRef: record.jiraTokenRef,
          defaultIssueType: record.defaultIssueType
        }
      ]
    };
  }

  return config;
}

export const createTestHarness: typeof createBaseTestHarness = (...args) => {
  const nextArgs = [...args] as Parameters<typeof createBaseTestHarness>;
  if (nextArgs[0] && typeof nextArgs[0] === 'object') {
    const options = nextArgs[0] as unknown as Record<string, unknown>;
    nextArgs[0] = {
      ...options,
      config: normalizeTestConfig(options.config)
    } as Parameters<typeof createBaseTestHarness>[0];
  }
  return createBaseTestHarness(...nextArgs);
};
