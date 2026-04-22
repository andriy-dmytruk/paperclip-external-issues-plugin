import { useEffect, useState } from 'react';

const PLUGIN_ID = 'paperclip-jira-plugin';

export const DEFAULT_JIRA_ISSUE_TYPE = 'Task';
export const JIRA_ISSUE_TYPE_OPTIONS = ['Task', 'Bug', 'Story', 'Epic', 'Sub-task'] as const;
export const PROVIDER_TYPE_OPTIONS = ['jira'] as const;
export type ProviderType = (typeof PROVIDER_TYPE_OPTIONS)[number];
export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  jira: 'Jira'
};

export interface ProviderDirectoryEntry {
  providerId: string;
  providerType: ProviderType;
  displayName: string;
  configSummary?: string;
  tokenSaved?: boolean;
}

export interface JiraProviderConfig {
  id: string;
  type: ProviderType;
  name: string;
  jiraBaseUrl?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
  jiraTokenRef?: string;
  defaultIssueType?: string;
}

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

export function getProviderTypeLabel(type: ProviderType | string | undefined): string {
  if (type === 'jira') {
    return PROVIDER_TYPE_LABELS.jira;
  }

  return 'Unknown provider';
}
