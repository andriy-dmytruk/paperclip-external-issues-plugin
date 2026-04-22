import { useEffect, useState } from 'react';
import {
  DEFAULT_JIRA_ISSUE_TYPE,
  PROVIDER_TYPE_OPTIONS,
  getProviderTypeLabel,
  type ProviderConfig,
  type ProviderType
} from '../providers/shared/config.ts';
export {
  DEFAULT_JIRA_ISSUE_TYPE,
  PROVIDER_TYPE_OPTIONS,
  getProviderTypeLabel
} from '../providers/shared/config.ts';
export type { ProviderType } from '../providers/shared/config.ts';

const PLUGIN_ID = 'paperclip-jira-plugin';

export const JIRA_ISSUE_TYPE_OPTIONS = ['Task', 'Bug', 'Story', 'Epic', 'Sub-task'] as const;

export interface ProviderDirectoryEntry {
  providerId: string;
  providerType: ProviderType;
  displayName: string;
  configSummary?: string;
  tokenSaved?: boolean;
}

export type JiraProviderConfig = ProviderConfig & {
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
  githubApiBaseUrl?: string;
  githubToken?: string;
  githubTokenRef?: string;
  defaultRepository?: string;
};

export interface JiraPluginConfig {
  providers?: JiraProviderConfig[];
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
}

export function hostFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  return fetch(path, {
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed: ${response.status}`);
    }
    return await response.json() as T;
  });
}

export function usePluginConfig() {
  const [configJson, setConfigJson] = useState<JiraPluginConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    hostFetchJson<{ configJson?: JiraPluginConfig | null } | null>(`/api/plugins/${PLUGIN_ID}/config`)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setConfigJson(result?.configJson ?? {});
        setError(null);
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : String(nextError));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(nextConfig: JiraPluginConfig) {
    setSaving(true);
    try {
      await hostFetchJson(`/api/plugins/${PLUGIN_ID}/config`, {
        method: 'POST',
        body: JSON.stringify({ configJson: nextConfig })
      });
      setConfigJson(nextConfig);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      throw nextError;
    } finally {
      setSaving(false);
    }
  }

  return {
    configJson,
    setConfigJson,
    loading,
    saving,
    error,
    save
  };
}
