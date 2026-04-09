import React, { useEffect, useMemo, useState } from 'react';
import { useHostContext, usePluginAction, usePluginData } from '@paperclipai/plugin-sdk/ui';

interface RepositoryMapping {
  id: string;
  repositoryUrl: string;
  paperclipProjectName: string;
  paperclipProjectId?: string;
  companyId?: string;
}

interface SyncRunState {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  checkedAt?: string;
  syncedIssuesCount?: number;
  createdIssuesCount?: number;
  skippedIssuesCount?: number;
  lastRunTrigger?: 'manual' | 'schedule' | 'retry';
}

interface GitHubSyncSettings {
  mappings: RepositoryMapping[];
  syncState: SyncRunState;
  githubTokenConfigured?: boolean;
  updatedAt?: string;
}

type ActiveTab = 'token' | 'mappings' | 'sync';
type ThemeMode = 'light' | 'dark';

interface ThemePalette {
  pageText: string;
  title: string;
  muted: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  cardDivider: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  primaryButtonBg: string;
  primaryButtonBorder: string;
  primaryButtonText: string;
  dangerButtonBg: string;
  dangerButtonBorder: string;
  dangerButtonText: string;
  tabText: string;
  tabActiveText: string;
  tabUnderline: string;
  successBg: string;
  successBorder: string;
  successText: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
}

const LIGHT_PALETTE: ThemePalette = {
  pageText: '#18181b',
  title: '#09090b',
  muted: '#71717a',
  badgeBg: '#fafafa',
  badgeBorder: '#e4e4e7',
  badgeText: '#3f3f46',
  cardBg: '#ffffff',
  cardBorder: '#e4e4e7',
  cardDivider: '#f4f4f5',
  inputBg: '#ffffff',
  inputBorder: '#d4d4d8',
  inputText: '#18181b',
  secondaryButtonBg: '#fafafa',
  secondaryButtonBorder: '#d4d4d8',
  secondaryButtonText: '#27272a',
  primaryButtonBg: '#18181b',
  primaryButtonBorder: '#18181b',
  primaryButtonText: '#fafafa',
  dangerButtonBg: '#fff1f2',
  dangerButtonBorder: '#fecdd3',
  dangerButtonText: '#be123c',
  tabText: '#71717a',
  tabActiveText: '#18181b',
  tabUnderline: '#18181b',
  successBg: '#f0fdf4',
  successBorder: '#bbf7d0',
  successText: '#166534',
  errorBg: '#fff1f2',
  errorBorder: '#fecdd3',
  errorText: '#be123c'
};

const DARK_PALETTE: ThemePalette = {
  pageText: '#f5f5f5',
  title: '#fafafa',
  muted: '#a1a1aa',
  badgeBg: 'rgba(24, 24, 27, 0.9)',
  badgeBorder: 'rgba(63, 63, 70, 1)',
  badgeText: '#d4d4d8',
  cardBg: 'rgba(10, 10, 11, 0.96)',
  cardBorder: 'rgba(63, 63, 70, 0.9)',
  cardDivider: 'rgba(39, 39, 42, 1)',
  inputBg: 'rgba(15, 15, 17, 1)',
  inputBorder: 'rgba(63, 63, 70, 1)',
  inputText: '#fafafa',
  secondaryButtonBg: 'rgba(24, 24, 27, 1)',
  secondaryButtonBorder: 'rgba(63, 63, 70, 1)',
  secondaryButtonText: '#e4e4e7',
  primaryButtonBg: '#f4f4f5',
  primaryButtonBorder: 'rgba(82, 82, 91, 1)',
  primaryButtonText: '#111113',
  dangerButtonBg: 'rgba(69, 10, 10, 0.28)',
  dangerButtonBorder: 'rgba(127, 29, 29, 0.8)',
  dangerButtonText: '#fca5a5',
  tabText: '#a1a1aa',
  tabActiveText: '#fafafa',
  tabUnderline: '#fafafa',
  successBg: 'rgba(20, 83, 45, 0.16)',
  successBorder: 'rgba(34, 197, 94, 0.25)',
  successText: '#bbf7d0',
  errorBg: 'rgba(127, 29, 29, 0.18)',
  errorBorder: 'rgba(239, 68, 68, 0.25)',
  errorText: '#fecaca'
};

const EMPTY_SETTINGS: GitHubSyncSettings = {
  mappings: [],
  syncState: {
    status: 'idle'
  }
};

function createEmptyMapping(index: number): RepositoryMapping {
  return {
    id: `mapping-${index + 1}`,
    repositoryUrl: '',
    paperclipProjectName: ''
  };
}

function getPluginIdFromLocation(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const parts = window.location.pathname.split('/').filter(Boolean);
  const pluginsIndex = parts.indexOf('plugins');
  if (pluginsIndex === -1 || pluginsIndex + 1 >= parts.length) {
    return null;
  }

  return parts[pluginsIndex + 1] ?? null;
}

function getThemeMode(): ThemeMode {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'dark';
  }

  const root = document.documentElement;
  const body = document.body;
  const candidates = [root, body].filter((node): node is HTMLElement => Boolean(node));

  for (const node of candidates) {
    const attrTheme = node.getAttribute('data-theme') || node.getAttribute('data-color-mode') || node.getAttribute('data-mode');
    if (attrTheme === 'light' || attrTheme === 'dark') {
      return attrTheme;
    }

    if (node.classList.contains('light')) {
      return 'light';
    }

    if (node.classList.contains('dark')) {
      return 'dark';
    }
  }

  const colorScheme = window.getComputedStyle(body).colorScheme || window.getComputedStyle(root).colorScheme;
  if (colorScheme === 'light' || colorScheme === 'dark') {
    return colorScheme;
  }

  const backgroundColor = window.getComputedStyle(body).backgroundColor || window.getComputedStyle(root).backgroundColor;
  const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i) || backgroundColor.match(/oklch\(([^\s]+)\s/);
  if (match) {
    if (match.length === 4) {
      const red = Number(match[1]);
      const green = Number(match[2]);
      const blue = Number(match[3]);
      const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
      return brightness > 186 ? 'light' : 'dark';
    }

    const lightness = Number(match[1]);
    if (!Number.isNaN(lightness)) {
      return lightness >= 0.7 ? 'light' : 'dark';
    }
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {})
    },
    credentials: 'same-origin',
    ...init
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Paperclip API ${response.status}: ${text || response.statusText}`);
  }

  return body as T;
}

async function resolveOrCreateProject(companyId: string, projectName: string): Promise<{ id: string; name: string }> {
  const projects = await fetchJson<Array<{ id: string; name: string }>>(`/api/companies/${companyId}/projects`);
  const existing = projects.find((project) => project.name.trim().toLowerCase() === projectName.trim().toLowerCase());
  if (existing) {
    return existing;
  }

  return fetchJson<{ id: string; name: string }>(`/api/companies/${companyId}/projects`, {
    method: 'POST',
    body: JSON.stringify({
      name: projectName.trim(),
      status: 'planned'
    })
  });
}

async function bindProjectRepo(projectId: string, repositoryUrl: string): Promise<void> {
  await fetchJson(`/api/projects/${projectId}/workspaces`, {
    method: 'POST',
    body: JSON.stringify({
      repoUrl: repositoryUrl,
      sourceType: 'git_repo',
      isPrimary: true
    })
  });
}

async function resolveOrCreateCompanySecret(companyId: string, name: string, value: string): Promise<{ id: string; name: string }> {
  const existingSecrets = await fetchJson<Array<{ id: string; name: string }>>(`/api/companies/${companyId}/secrets`);
  const existing = existingSecrets.find((secret) => secret.name.trim().toLowerCase() === name.trim().toLowerCase());
  if (existing) {
    return existing;
  }

  return fetchJson<{ id: string; name: string }>(`/api/companies/${companyId}/secrets`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      value
    })
  });
}

function buildStyles(theme: ThemePalette): Record<string, React.CSSProperties> {
  return {
    page: {
      display: 'grid',
      gap: 16,
      color: theme.pageText,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    header: {
      display: 'grid',
      gap: 8
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    },
    title: {
      margin: 0,
      fontSize: 20,
      lineHeight: 1.2,
      fontWeight: 700,
      color: theme.title
    },
    description: {
      margin: 0,
      maxWidth: 760,
      fontSize: 14,
      lineHeight: 1.6,
      color: theme.muted
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 999,
      border: `1px solid ${theme.badgeBorder}`,
      background: theme.badgeBg,
      color: theme.badgeText,
      padding: '6px 10px',
      fontSize: 12,
      fontWeight: 600
    },
    layout: {
      display: 'grid',
      gap: 16,
      gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 0.95fr)'
    },
    card: {
      borderRadius: 12,
      border: `1px solid ${theme.cardBorder}`,
      background: theme.cardBg,
      overflow: 'hidden'
    },
    cardHeader: {
      display: 'grid',
      gap: 10,
      padding: '16px 18px',
      borderBottom: `1px solid ${theme.cardDivider}`
    },
    cardTitle: {
      margin: 0,
      fontSize: 14,
      fontWeight: 600,
      color: theme.title
    },
    cardDescription: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.5,
      color: theme.muted
    },
    tabList: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      borderBottom: `1px solid ${theme.cardDivider}`,
      paddingBottom: 2,
      flexWrap: 'wrap'
    },
    tab: {
      appearance: 'none',
      border: 'none',
      background: 'transparent',
      color: theme.tabText,
      padding: '0 0 10px',
      marginBottom: -3,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      borderBottom: '2px solid transparent'
    },
    tabActive: {
      color: theme.tabActiveText,
      borderBottom: `2px solid ${theme.tabUnderline}`
    },
    cardBody: {
      display: 'grid',
      gap: 16,
      padding: 18
    },
    loading: {
      margin: 0,
      fontSize: 13,
      color: theme.muted
    },
    fieldGroup: {
      display: 'grid',
      gap: 8
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: theme.title
    },
    fieldHint: {
      margin: 0,
      fontSize: 12,
      color: theme.muted,
      lineHeight: 1.5
    },
    input: {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 10,
      border: `1px solid ${theme.inputBorder}`,
      background: theme.inputBg,
      color: theme.inputText,
      fontSize: 14,
      lineHeight: 1.4,
      padding: '10px 12px',
      outline: 'none'
    },
    tokenActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    },
    secondaryButton: {
      borderRadius: 10,
      border: `1px solid ${theme.secondaryButtonBorder}`,
      background: theme.secondaryButtonBg,
      color: theme.secondaryButtonText,
      padding: '9px 12px',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    },
    primaryButton: {
      borderRadius: 10,
      border: `1px solid ${theme.primaryButtonBorder}`,
      background: theme.primaryButtonBg,
      color: theme.primaryButtonText,
      padding: '10px 14px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    },
    dangerButton: {
      borderRadius: 10,
      border: `1px solid ${theme.dangerButtonBorder}`,
      background: theme.dangerButtonBg,
      color: theme.dangerButtonText,
      padding: '8px 10px',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'default'
    },
    validationMessageSuccess: {
      margin: 0,
      borderRadius: 10,
      border: `1px solid ${theme.successBorder}`,
      background: theme.successBg,
      color: theme.successText,
      padding: '10px 12px',
      fontSize: 13,
      lineHeight: 1.5
    },
    validationMessageError: {
      margin: 0,
      borderRadius: 10,
      border: `1px solid ${theme.errorBorder}`,
      background: theme.errorBg,
      color: theme.errorText,
      padding: '10px 12px',
      fontSize: 13,
      lineHeight: 1.5
    },
    mappingList: {
      display: 'grid',
      gap: 12
    },
    mappingCard: {
      display: 'grid',
      gap: 12,
      borderRadius: 12,
      border: `1px solid ${theme.cardDivider}`,
      background: theme.inputBg,
      padding: 14
    },
    mappingHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    },
    mappingTitle: {
      margin: 0,
      fontSize: 13,
      fontWeight: 600,
      color: theme.title
    },
    mappingMeta: {
      fontSize: 12,
      color: theme.muted
    },
    mappingFields: {
      display: 'grid',
      gap: 12,
      gridTemplateColumns: 'minmax(0, 1.15fr) minmax(220px, 0.85fr)'
    },
    footerRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    },
    metaText: {
      fontSize: 12,
      color: theme.muted
    },
    success: {
      margin: 0,
      borderRadius: 10,
      border: `1px solid ${theme.successBorder}`,
      background: theme.successBg,
      color: theme.successText,
      padding: '10px 12px',
      fontSize: 13,
      lineHeight: 1.5
    },
    sidebarStack: {
      display: 'grid',
      gap: 10
    },
    detailList: {
      display: 'grid',
      gap: 10
    },
    detailItem: {
      display: 'grid',
      gap: 4,
      paddingBottom: 10,
      borderBottom: `1px solid ${theme.cardDivider}`
    },
    detailItemLast: {
      borderBottom: 'none',
      paddingBottom: 0
    },
    detailLabel: {
      fontSize: 12,
      color: theme.muted
    },
    detailValue: {
      fontSize: 13,
      color: theme.title
    },
    syncMetrics: {
      display: 'grid',
      gap: 12,
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
    },
    metricCard: {
      display: 'grid',
      gap: 4,
      borderRadius: 12,
      border: `1px solid ${theme.cardDivider}`,
      background: theme.inputBg,
      padding: 14
    },
    metricLabel: {
      fontSize: 12,
      color: theme.muted
    },
    metricValue: {
      fontSize: 20,
      fontWeight: 700,
      color: theme.title
    }
  };
}

export function GitHubSyncSettingsPage(): React.JSX.Element {
  const hostContext = useHostContext();
  const pluginIdFromLocation = getPluginIdFromLocation();
  const settings = usePluginData<GitHubSyncSettings>('settings.registration', {});
  const saveRegistration = usePluginAction('settings.saveRegistration');
  const runSyncNow = usePluginAction('sync.runNow');
  const [form, setForm] = useState<GitHubSyncSettings>(EMPTY_SETTINGS);
  const [submitting, setSubmitting] = useState(false);
  const [runningSync, setRunningSync] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [tokenDraft, setTokenDraft] = useState('');
  const [tokenDirty, setTokenDirty] = useState(false);
  const [showSavedTokenHint, setShowSavedTokenHint] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('token');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getThemeMode());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const matcher = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => {
      setThemeMode(getThemeMode());
    };

    handleChange();
    matcher.addEventListener('change', handleChange);

    const observer = new MutationObserver(handleChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-color-mode', 'data-mode']
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-color-mode', 'data-mode']
    });

    return () => {
      matcher.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!settings.data) {
      return;
    }

    setForm({
      mappings: settings.data.mappings ?? [],
      syncState: settings.data.syncState ?? { status: 'idle' },
      githubTokenConfigured: settings.data.githubTokenConfigured,
      updatedAt: settings.data.updatedAt
    });
    setTokenDraft('');
    setTokenDirty(false);
    setShowSavedTokenHint(false);
  }, [settings.data]);

  const hasNonEmptyMappings = form.mappings.some((mapping) => mapping.repositoryUrl.trim() !== '' || mapping.paperclipProjectName.trim() !== '');

  const isDirty = useMemo(() => {
    if (!settings.data) {
      return tokenDirty || hasNonEmptyMappings;
    }

    const currentMappings = JSON.stringify(form.mappings);
    const savedMappings = JSON.stringify(settings.data.mappings ?? []);
    return tokenDirty || currentMappings !== savedMappings || (settings.data.mappings?.length ?? 0) === 0 && hasNonEmptyMappings;
  }, [form.mappings, settings.data, tokenDirty, hasNonEmptyMappings]);

  useEffect(() => {
    if (activeTab !== 'mappings') {
      return;
    }

    setForm((current) => current.mappings.length > 0 ? current : {
      ...current,
      mappings: [createEmptyMapping(0)]
    });
  }, [activeTab]);

  const theme = themeMode === 'light' ? LIGHT_PALETTE : DARK_PALETTE;
  const styles = useMemo(() => buildStyles(theme), [theme]);

  function updateMapping(mappingId: string, field: keyof RepositoryMapping, value: string) {
    setSavedMessage(null);
    setForm((current) => ({
      ...current,
      mappings: current.mappings.map((mapping) => (mapping.id === mappingId ? { ...mapping, [field]: value } : mapping))
    }));
  }

  function addMapping() {
    setSavedMessage(null);
    setForm((current) => ({
      ...current,
      mappings: [...current.mappings, createEmptyMapping(current.mappings.length)]
    }));
  }

  function removeMapping(mappingId: string) {
    setSavedMessage(null);
    setForm((current) => {
      const remaining = current.mappings.filter((mapping) => mapping.id !== mappingId);
      return {
        ...current,
        mappings: remaining.length > 0 ? remaining : [createEmptyMapping(0)]
      };
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSavedMessage(null);

    try {
      const companyId = hostContext.companyId;
      if (!companyId) {
        throw new Error('Company context is required to save mappings.');
      }

      let githubTokenRef = '';
      if (tokenDirty) {
        const secretName = `github_sync_${companyId.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`;
        const secret = await resolveOrCreateCompanySecret(companyId, secretName, tokenDraft);
        githubTokenRef = secret.id;
      }

      const resolvedMappings: RepositoryMapping[] = [];
      for (const mapping of form.mappings) {
        const repositoryUrl = mapping.repositoryUrl.trim();
        const paperclipProjectName = mapping.paperclipProjectName.trim();

        if (!repositoryUrl && !paperclipProjectName) {
          continue;
        }

        if (!paperclipProjectName) {
          throw new Error('Each mapping needs a project name before saving.');
        }

        const project = mapping.paperclipProjectId && mapping.companyId === companyId
          ? { id: mapping.paperclipProjectId, name: paperclipProjectName }
          : await resolveOrCreateProject(companyId, paperclipProjectName);

        if (repositoryUrl) {
          await bindProjectRepo(project.id, repositoryUrl);
        }

        resolvedMappings.push({
          ...mapping,
          repositoryUrl,
          paperclipProjectName: project.name,
          paperclipProjectId: project.id,
          companyId
        });
      }

      if (githubTokenRef) {
        const pluginId = pluginIdFromLocation;
        if (!pluginId) {
          throw new Error('Plugin id is required to save the token secret reference.');
        }

        await fetchJson(`/api/plugins/${pluginId}/config`, {
          method: 'POST',
          body: JSON.stringify({
            configJson: { githubTokenRef }
          })
        });
      }

      await saveRegistration({
        mappings: resolvedMappings,
        syncState: form.syncState
      });
      setForm((current) => ({
        ...current,
        mappings: resolvedMappings
      }));
      settings.refresh();
      setTokenDraft('');
      setTokenDirty(false);
      await settings.refresh();
      setShowSavedTokenHint(true);
      setSavedMessage(
        activeTab === 'token'
          ? 'GitHub token secret saved.'
          : activeTab === 'mappings'
            ? 'Mappings saved.'
            : 'Settings saved.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRunSyncNow() {
    setRunningSync(true);
    setSavedMessage(null);

    try {
      const result = await runSyncNow({}) as GitHubSyncSettings;
      setForm((current) => ({
        ...current,
        syncState: result.syncState
      }));
      settings.refresh();
    } finally {
      setRunningSync(false);
    }
  }

  const mappings = form.mappings.length > 0 ? form.mappings : [createEmptyMapping(0)];
  const actualMappingCount = settings.data?.mappings?.length ?? form.mappings.filter((mapping) => mapping.repositoryUrl.trim() !== '' || mapping.paperclipProjectName.trim() !== '').length;
  const lastUpdated = settings.data?.updatedAt
    ? new Date(settings.data.updatedAt).toLocaleString()
    : 'Not saved yet';

  return (
    <div style={styles.page}>
      <section style={styles.header}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>GitHub Sync settings</h2>
          <span style={styles.badge}>{actualMappingCount} mapping{actualMappingCount === 1 ? '' : 's'}</span>
        </div>
        <p style={styles.description}>
          Configure access to GitHub, define the repository mappings, and run or monitor synchronization.
        </p>
      </section>

      <div style={styles.layout}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Configuration</h3>
              <p style={styles.cardDescription}>Everything needed to fetch GitHub issues and import them into Paperclip.</p>
            </div>
            <div role="tablist" aria-label="GitHub Sync settings sections" style={styles.tabList}>
              <button type="button" role="tab" aria-selected={activeTab === 'token'} style={{ ...styles.tab, ...(activeTab === 'token' ? styles.tabActive : null) }} onClick={() => setActiveTab('token')}>GitHub token</button>
              <button type="button" role="tab" aria-selected={activeTab === 'mappings'} style={{ ...styles.tab, ...(activeTab === 'mappings' ? styles.tabActive : null) }} onClick={() => setActiveTab('mappings')}>Repository mappings</button>
              <button type="button" role="tab" aria-selected={activeTab === 'sync'} style={{ ...styles.tab, ...(activeTab === 'sync' ? styles.tabActive : null) }} onClick={() => setActiveTab('sync')}>Sync</button>
            </div>
          </div>
          <div style={styles.cardBody}>
            {settings.loading ? <p style={styles.loading}>Loading saved settings…</p> : null}
            <form onSubmit={handleSave} style={styles.cardBody}>
              {activeTab === 'token' ? (
                <>
                  <div style={styles.fieldGroup}>
                    <label htmlFor="github-token" style={styles.fieldLabel}>GitHub token</label>
                    <input
                      id="github-token"
                      type="password"
                      value={tokenDirty ? tokenDraft : ''}
                      onChange={(event) => {
                        setSavedMessage(null);
                        const nextValue = event.currentTarget.value;
                        setTokenDraft(nextValue);
                        setTokenDirty(true);
                        setShowSavedTokenHint(false);
                      }}
                      placeholder="ghp_..."
                      autoComplete="off"
                      style={styles.input}
                    />
                    <p style={styles.fieldHint}>{showSavedTokenHint ? 'A GitHub token secret is already configured. Type here only if you want to replace it.' : 'Saving this field creates a company secret and stores only its reference in the plugin.'}</p>
                  </div>
                  <div style={styles.tokenActions}>
                    <button type="submit" style={{ ...styles.primaryButton, ...((submitting || settings.loading || !isDirty) ? styles.buttonDisabled : null) }} disabled={submitting || settings.loading || !isDirty}>{submitting ? 'Saving…' : 'Save token'}</button>
                  </div>
                </>
              ) : null}

              {activeTab === 'mappings' ? (
                <>
                  <div style={styles.mappingList}>
                    {mappings.map((mapping, index) => (
                      <section key={mapping.id} style={styles.mappingCard}>
                        <div style={styles.mappingHeader}>
                          <div>
                            <h4 style={styles.mappingTitle}>Mapping {index + 1}</h4>
                            <span style={styles.mappingMeta}>One repository, one destination project name.</span>
                          </div>
                          <button type="button" style={styles.dangerButton} onClick={() => removeMapping(mapping.id)}>Remove</button>
                        </div>
                        <div style={styles.mappingFields}>
                          <div style={styles.fieldGroup}>
                            <label htmlFor={`repository-url-${mapping.id}`} style={styles.fieldLabel}>GitHub repository URL</label>
                            <input id={`repository-url-${mapping.id}`} type="url" value={mapping.repositoryUrl} onChange={(event) => updateMapping(mapping.id, 'repositoryUrl', event.currentTarget.value)} placeholder="https://github.com/owner/repository" autoComplete="off" style={styles.input} />
                          </div>
                          <div style={styles.fieldGroup}>
                            <label htmlFor={`project-name-${mapping.id}`} style={styles.fieldLabel}>Project name</label>
                            <input id={`project-name-${mapping.id}`} type="text" value={mapping.paperclipProjectName} onChange={(event) => updateMapping(mapping.id, 'paperclipProjectName', event.currentTarget.value)} placeholder="Engineering" autoComplete="off" style={styles.input} readOnly={Boolean(mapping.paperclipProjectId)} />
                            {mapping.paperclipProjectId ? <p style={styles.fieldHint}>Project created and linked.</p> : null}
                          </div>
                        </div>
                      </section>
                    ))}
                  </div>
                  <div style={styles.footerRow}>
                    <button type="button" style={styles.secondaryButton} onClick={addMapping}>Add mapping</button>
                    <button type="submit" style={{ ...styles.primaryButton, ...((submitting || settings.loading) ? styles.buttonDisabled : null) }} disabled={submitting || settings.loading}>{submitting ? 'Saving…' : 'Save mappings'}</button>
                  </div>
                </>
              ) : null}

              {activeTab === 'sync' ? (
                <>
                  <div style={styles.syncMetrics}>
                    <div style={styles.metricCard}>
                      <span style={styles.metricLabel}>Issues fetched</span>
                      <span style={styles.metricValue}>{form.syncState.syncedIssuesCount ?? 0}</span>
                    </div>
                    <div style={styles.metricCard}>
                      <span style={styles.metricLabel}>Issues created</span>
                      <span style={styles.metricValue}>{form.syncState.createdIssuesCount ?? 0}</span>
                    </div>
                  </div>
                  <div style={styles.fieldGroup}>
                    <span style={styles.fieldLabel}>Sync status</span>
                    <p style={styles.fieldHint}>{form.syncState.message ?? 'No sync has run yet.'}</p>
                    <p style={styles.fieldHint}>Last trigger: {form.syncState.lastRunTrigger ?? 'none'} · Last checked: {form.syncState.checkedAt ? new Date(form.syncState.checkedAt).toLocaleString() : 'never'}</p>
                  </div>
                  <div style={styles.tokenActions}>
                    <button type="button" style={{ ...styles.primaryButton, ...((runningSync || settings.loading) ? styles.buttonDisabled : null) }} onClick={handleRunSyncNow} disabled={runningSync || settings.loading}>{runningSync ? 'Running sync…' : 'Run sync now'}</button>
                  </div>
                  {form.syncState.status === 'success' && form.syncState.message ? <p style={styles.validationMessageSuccess}>{form.syncState.message}</p> : null}
                  {form.syncState.status === 'error' && form.syncState.message ? <p style={styles.validationMessageError}>{form.syncState.message}</p> : null}
                </>
              ) : null}
            </form>
            {savedMessage ? <p style={styles.success}>{savedMessage}</p> : null}
          </div>
        </section>

        <aside style={styles.sidebarStack}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Summary</h3>
              <p style={styles.cardDescription}>Current state at a glance.</p>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.detailList}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Token</span>
                  <span style={styles.detailValue}>{form.githubTokenConfigured || showSavedTokenHint ? 'Secret configured' : 'Missing'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Mappings</span>
                  <span style={styles.detailValue}>{actualMappingCount}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Last sync</span>
                  <span style={styles.detailValue}>{form.syncState.checkedAt ? new Date(form.syncState.checkedAt).toLocaleString() : 'Never'}</span>
                </div>
                <div style={{ ...styles.detailItem, ...styles.detailItemLast }}>
                  <span style={styles.detailLabel}>Last saved</span>
                  <span style={styles.detailValue}>{lastUpdated}</span>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default GitHubSyncSettingsPage;
