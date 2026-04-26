import { strict as assert } from 'node:assert';
import test from 'node:test';

import manifest from '../../src/manifest.ts';
import plugin from '../../src/worker.ts';
import { normalizeProviderConfig, serializeProviderConfigForHost } from '../../src/providers/shared/config.ts';
import {
  createTestHarness,
  installMockFetch,
  jsonResponse,
  makeProject,
  type TaskFilters
} from '../helpers/plugin-test-helpers.ts';

test('provider config serialization keeps multi-provider records typed', async () => {
  const serializedGitHub = serializeProviderConfigForHost({
    id: 'provider-github',
    type: 'github_issues',
    name: 'GitHub',
    githubApiBaseUrl: 'https://api.github.com',
    githubToken: 'token',
    defaultRepository: 'owner/repo'
  });
  const serializedJiraCloud = serializeProviderConfigForHost({
    id: 'provider-cloud',
    type: 'jira_cloud',
    name: 'Jira Cloud',
    jiraBaseUrl: 'https://example.atlassian.net',
    jiraToken: 'token',
    defaultIssueType: 'Task'
  });

  assert.equal(serializedGitHub.type, 'github_issues');
  assert.equal(normalizeProviderConfig(serializedGitHub)?.type, 'github_issues');
  assert.equal(normalizeProviderConfig({
    id: 'provider-github-fallback',
    type: 'github_issues',
    name: 'GitHub fallback',
    githubApiBaseUrl: 'https://api.github.com',
    githubToken: 'token'
  })?.type, 'github_issues');

  assert.equal(serializedJiraCloud.type, 'jira_cloud');
  assert.equal(normalizeProviderConfig(serializedJiraCloud)?.type, 'jira_cloud');
});

test('settings save keeps mappings scoped per company', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraUserEmail: 'paperclip@example.com',
      jiraTokenRef: 'secret:jira'
    }
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [
      makeProject()
    ]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 30,
    mappings: [
      {
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  const registration = await harness.getData<{
    mappings: Array<{ jiraProjectKey: string; paperclipProjectId?: string }>;
    scheduleFrequencyMinutes: number;
  }>('settings.registration', {
    companyId: 'company-1'
  });

  assert.equal(registration.mappings.length, 1);
  assert.equal(registration.mappings[0]?.jiraProjectKey, 'PRJ');
  assert.equal(registration.mappings[0]?.paperclipProjectId, 'project-1');
  assert.equal(registration.scheduleFrequencyMinutes, 30);
});

test('settings registration exposes provider-aware popup data and per-mapping filters', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [
      makeProject()
    ]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 45,
    mappings: [
      {
        providerId: 'provider-default-jira',
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha',
        filters: {
          onlyActive: true,
          author: 'alice',
          assignee: 'bob',
          issueNumberGreaterThan: 10,
          issueNumberLessThan: 20
        }
      }
    ]
  });

  const popupState = await harness.getData<{
    selectedProviderId?: string | null;
    selectedProviderKey: string;
    mappings: Array<{ providerId?: string; filters?: TaskFilters }>;
    providerConfig?: { tokenSaved?: boolean; providerName?: string };
    syncProgress?: { status: string };
    availableProjects: Array<{ id: string }>;
    providers: Array<{ providerId: string; displayName: string }>;
  }>('sync.popupState', {
    companyId: 'company-1'
  });

  const providers = await harness.getData<{
    providers: Array<{ providerId: string; providerKey: string; displayName: string; status: string }>;
  }>('sync.providers', {
    companyId: 'company-1'
  });

  assert.equal(popupState.selectedProviderKey, 'jira_dc');
  assert.equal(popupState.selectedProviderId, 'provider-default-jira');
  assert.equal(popupState.mappings[0]?.providerId, 'provider-default-jira');
  assert.equal(popupState.mappings[0]?.filters?.onlyActive, true);
  assert.deepEqual(popupState.mappings[0]?.filters?.author, {
    accountId: 'alice',
    displayName: 'alice',
    username: 'alice'
  });
  assert.deepEqual(popupState.mappings[0]?.filters?.assignee, {
    accountId: 'bob',
    displayName: 'bob',
    username: 'bob'
  });
  assert.equal(popupState.mappings[0]?.filters?.issueNumberGreaterThan, 10);
  assert.equal(popupState.mappings[0]?.filters?.issueNumberLessThan, 20);
  assert.equal(popupState.providerConfig?.tokenSaved, true);
  assert.equal(popupState.providerConfig?.providerName, 'Default Jira');
  assert.equal(popupState.syncProgress?.status, 'idle');
  assert.equal(popupState.availableProjects[0]?.id, 'project-1');
  assert.equal(popupState.providers[0]?.providerId, 'provider-default-jira');
  assert.equal(providers.providers[0]?.providerKey, 'jira_dc');
  assert.equal(providers.providers[0]?.displayName, 'Default Jira');
});

test('project-first sync data contracts expose entry, project, and provider pages', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      providers: [
        {
          id: 'provider-default-jira',
          type: 'jira',
          name: 'Default Jira',
          jiraBaseUrl: 'https://jira.example.com',
          jiraTokenRef: 'secret:jira'
        }
      ]
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: 'provider-default-jira',
    scheduleFrequencyMinutes: 20,
    mappings: [
      {
        id: 'mapping-1',
        providerId: 'provider-default-jira',
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  const entryContext = await harness.getData<{
    surface: string;
    projectId?: string | null;
    projectName?: string | null;
    requiresProjectSelection: boolean;
  }>('sync.entryContext', {
    companyId: 'company-1',
    projectId: 'project-1'
  });
  const projectList = await harness.getData<{
    projects: Array<{
      projectId: string;
      projectName: string;
      providerId?: string | null;
      isConfigured?: boolean;
    }>;
  }>('sync.projectList', {
    companyId: 'company-1'
  });
  const projectPage = await harness.getData<{
    projectId: string;
    projectName: string;
    selectedProviderId?: string | null;
    showProviderSelection?: boolean;
    showHideImported?: boolean;
    showProjectSettings?: boolean;
    showSyncActions?: boolean;
    navigationContext?: { surface?: string };
  }>('sync.projectPage', {
    companyId: 'company-1',
    projectId: 'project-1'
  });
  const providerDirectory = await harness.getData<{
    providers: Array<{
      providerId: string;
      providerType: string;
      displayName: string;
      tokenSaved?: boolean;
    }>;
  }>('settings.providerDirectory', {
    companyId: 'company-1'
  });
  const providerDetail = await harness.getData<{
    mode: string;
    providerId?: string | null;
    providerType?: string;
    backTarget?: string;
    fields?: { name?: string; jiraBaseUrl?: string; defaultIssueType?: string };
    draft?: {
      id?: string;
      type?: string;
      name?: string;
      jiraBaseUrl?: string;
      defaultIssueType?: string;
    };
  }>('settings.providerDetail', {
    companyId: 'company-1',
    providerId: 'provider-default-jira'
  });

  assert.equal(entryContext.surface, 'project');
  assert.equal(entryContext.projectId, 'project-1');
  assert.equal(entryContext.projectName, 'Alpha');
  assert.equal(entryContext.requiresProjectSelection, false);
  assert.equal(projectList.projects[0]?.projectId, 'project-1');
  assert.equal(projectList.projects[0]?.projectName, 'Alpha');
  assert.equal(projectList.projects[0]?.providerId, 'provider-default-jira');
  assert.equal(projectList.projects[0]?.isConfigured, true);
  assert.equal(projectPage.projectId, 'project-1');
  assert.equal(projectPage.projectName, 'Alpha');
  assert.equal(projectPage.selectedProviderId, 'provider-default-jira');
  assert.equal(projectPage.showProviderSelection, true);
  assert.equal(projectPage.showHideImported, true);
  assert.equal(projectPage.showProjectSettings, true);
  assert.equal(projectPage.showSyncActions, true);
  assert.equal(projectPage.navigationContext?.surface, 'project');
  assert.equal(providerDirectory.providers[0]?.providerId, 'provider-default-jira');
  assert.equal(providerDirectory.providers[0]?.providerType, 'jira_dc');
  assert.equal(providerDirectory.providers[0]?.displayName, 'Default Jira');
  assert.equal(providerDirectory.providers[0]?.tokenSaved, true);
  assert.equal(providerDetail.mode, 'edit');
  assert.equal(providerDetail.providerId, 'provider-default-jira');
  assert.equal(providerDetail.providerType, 'jira_dc');
  assert.equal(providerDetail.backTarget, 'providers');
  assert.equal(providerDetail.fields?.name, 'Default Jira');
  assert.equal(providerDetail.fields?.jiraBaseUrl, 'https://jira.example.com');
  assert.equal(providerDetail.fields?.defaultIssueType, 'Task');
  assert.equal(providerDetail.draft?.id, 'provider-default-jira');
  assert.equal(providerDetail.draft?.type, 'jira_dc');
  assert.equal(providerDetail.draft?.name, 'Default Jira');
  assert.equal(providerDetail.draft?.jiraBaseUrl, 'https://jira.example.com');
});

test('sync popup excludes archived Paperclip projects from project selection', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [
      makeProject({ id: 'project-1', name: 'Alpha', archivedAt: null }),
      makeProject({ id: 'project-2', name: 'Archived', archivedAt: new Date('2026-04-20T00:00:00.000Z') })
    ]
  });

  const popupState = await harness.getData<{
    availableProjects: Array<{ id: string; name: string }>;
  }>('sync.popupState', {
    companyId: 'company-1'
  });

  assert.deepEqual(
    popupState.availableProjects.map((project) => project.id),
    ['project-1']
  );
});

test('settings.providerDetail backfills GitHub default repository from saved mappings', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      providers: [
        {
          id: 'provider-github',
          type: 'github_issues',
          name: 'GitHub',
          githubApiBaseUrl: 'https://api.github.com',
          githubToken: 'github-token'
        }
      ]
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject({ id: 'project-1', name: 'Alpha' })]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: 'provider-github',
    mappings: [
      {
        providerId: 'provider-github',
        jiraProjectKey: 'owner/repo',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  const providerDetail = await harness.getData<{
    providerType?: string;
    fields?: {
      defaultRepository?: string;
      githubApiBaseUrl?: string;
    };
  }>('settings.providerDetail', {
    companyId: 'company-1',
    providerId: 'provider-github'
  });

  assert.equal(providerDetail.providerType, 'github_issues');
  assert.equal(providerDetail.fields?.githubApiBaseUrl, 'https://api.github.com');
  assert.equal(providerDetail.fields?.defaultRepository, 'owner/repo');
});

test('sync.provider.testConnection records provider test status', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/myself')) {
      return jsonResponse({
        accountId: 'user-1',
        displayName: 'Paperclip User'
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {}
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.performAction<{
      status: string;
      message: string;
    }>('sync.provider.testConnection', {
      companyId: 'company-1',
      providerKey: 'jira',
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      }
    });

    const popupState = await harness.getData<{
      connectionTest?: { status: string; message?: string };
    }>('sync.popupState', {
      companyId: 'company-1'
    });

    assert.equal(result.status, 'success');
    assert.match(result.message, /Connected to Jira/);
    assert.equal(popupState.connectionTest?.status, 'success');
    assert.match(popupState.connectionTest?.message ?? '', /Connected to Jira/);
  } finally {
    restoreFetch();
  }
});

test('provider directory only marks the tested provider as connected', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/myself')) {
      return jsonResponse({
        accountId: 'user-1',
        displayName: 'Paperclip User'
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-jira',
            type: 'jira_dc',
            name: 'Oracle Jira',
            jiraBaseUrl: 'https://jira.example.com',
            jiraToken: 'jira-token'
          },
          {
            id: 'provider-github',
            type: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    await harness.performAction('sync.provider.testConnection', {
      companyId: 'company-1',
      providerId: 'provider-jira',
      providerKey: 'jira_dc'
    });

    const providerDirectory = await harness.getData<{
      providers: Array<{ providerId: string; status?: string; healthLabel?: string }>;
    }>('settings.providerDirectory', {
      companyId: 'company-1'
    });

    assert.equal(providerDirectory.providers.find((provider) => provider.providerId === 'provider-jira')?.status, 'connected');
    assert.equal(providerDirectory.providers.find((provider) => provider.providerId === 'provider-jira')?.healthLabel, 'Connected');
    assert.equal(providerDirectory.providers.find((provider) => provider.providerId === 'provider-github')?.status, 'not_tested');
    assert.equal(providerDirectory.providers.find((provider) => provider.providerId === 'provider-github')?.healthLabel, 'Not tested');
  } finally {
    restoreFetch();
  }
});

test('settings and popup data do not resolve Jira secrets just to render provider state', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      providers: [
        {
          id: 'provider-default-jira',
          type: 'jira',
          name: 'Default Jira',
          jiraBaseUrl: 'https://jira.example.com',
          jiraTokenRef: 'secret:jira'
        }
      ]
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  let resolveCalls = 0;
  harness.ctx.secrets.resolve = async () => {
    resolveCalls += 1;
    return 'jira-token';
  };

  harness.seed({
    projects: [makeProject()]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 15,
    mappings: [
      {
        providerId: 'provider-default-jira',
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  await harness.getData('sync.providers', { companyId: 'company-1' });
  await harness.getData('sync.popupState', {
    companyId: 'company-1',
    providerId: 'provider-default-jira'
  });

  assert.equal(resolveCalls, 0);
});

test('project-scoped settings persist provider none without falling back to the first Jira provider', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      providers: [
        {
          id: 'provider-default-jira',
          type: 'jira',
          name: 'Default Jira',
          jiraBaseUrl: 'https://jira.example.com',
          jiraTokenRef: 'secret:jira'
        }
      ]
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: null,
    defaultStatus: 'in_progress',
    mappings: [
      {
        id: 'mapping-none',
        jiraProjectKey: 'PRJ',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha',
        filters: {
          onlyActive: true
        }
      }
    ]
  });

  const popupState = await harness.getData<{
    selectedProviderId?: string | null;
    selectedProviderKey?: string | null;
    configReady?: boolean;
    projectConfig?: {
      providerId?: string | null;
    } | null;
    mappings: Array<{ jiraProjectKey: string }>;
  }>('sync.popupState', {
    companyId: 'company-1',
    projectId: 'project-1'
  });

  assert.equal(popupState.selectedProviderId, null);
  assert.equal(popupState.selectedProviderKey, null);
  assert.equal(popupState.configReady, false);
  assert.equal(popupState.projectConfig?.providerId ?? null, null);
  assert.equal(popupState.mappings.length, 1);
  assert.equal(popupState.mappings[0]?.jiraProjectKey, 'PRJ');
});

test('sync.runNow refuses to sync a project whose provider is explicitly none', async () => {
  let searchCalled = false;
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      searchCalled = true;
      return jsonResponse({ issues: [] });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-default-jira',
            type: 'jira',
            name: 'Default Jira',
            jiraBaseUrl: 'https://jira.example.com',
            jiraToken: 'jira-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: null,
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-none',
          jiraProjectKey: 'PRJ',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const result = await harness.performAction<{
      status: string;
      message?: string;
    }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(result.status, 'error');
    assert.match(result.message ?? '', /Select a provider before running sync/);
    assert.equal(searchCalled, false);
  } finally {
    restoreFetch();
  }
});

test('sync.projectToolbarState stays neutral when provider is none even if last sync attempt failed', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      providers: [
        {
          id: 'provider-default-jira',
          type: 'jira',
          name: 'Default Jira',
          jiraBaseUrl: 'https://jira.example.com',
          jiraToken: 'jira-token'
        }
      ]
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()]
  });

  await harness.performAction('sync.project.save', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: null,
    mappings: []
  });

  await harness.performAction('sync.runNow', {
    companyId: 'company-1',
    projectId: 'project-1'
  });

  const toolbarState = await harness.getData<{
    configured: boolean;
    syncFailed?: boolean;
    syncStatus?: string;
  }>('sync.projectToolbarState', {
    companyId: 'company-1',
    projectId: 'project-1'
  });

  assert.equal(toolbarState.configured, false);
  assert.equal(toolbarState.syncFailed, false);
  assert.equal(toolbarState.syncStatus, 'idle');
});

test('sync.project.refreshIdentity returns a structured Jira user reference', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/myself')) {
      return jsonResponse({
        accountId: 'user-123',
        displayName: 'Paperclip User',
        emailAddress: 'paperclip@example.com'
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-default-jira',
            type: 'jira',
            name: 'Default Jira',
            jiraBaseUrl: 'https://jira.example.com',
            jiraToken: 'jira-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      mappings: []
    });

    const result = await harness.performAction<{
      defaultAssignee?: {
        accountId: string;
        displayName: string;
        emailAddress?: string;
      } | null;
    }>('sync.project.refreshIdentity', {
      companyId: 'company-1',
      projectId: 'project-1',
      providerId: 'provider-default-jira'
    });

    assert.deepEqual(result.defaultAssignee, {
      accountId: 'user-123',
      displayName: 'Paperclip User',
      emailAddress: 'paperclip@example.com'
    });
  } finally {
    restoreFetch();
  }
});

test('sync.project.refreshIdentity returns a structured GitHub user reference', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/user')) {
      return jsonResponse({
        login: 'andriy-dmytruk'
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-github',
            type: 'jira',
            providerKind: 'github_issues',
            name: 'GitHub',
            githubApiBaseUrl: 'https://api.github.com',
            githubToken: 'github-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      mappings: []
    });

    const result = await harness.performAction<{
      defaultAssignee?: {
        accountId: string;
        displayName: string;
        username?: string;
      } | null;
      message?: string;
    }>('sync.project.refreshIdentity', {
      companyId: 'company-1',
      projectId: 'project-1',
      providerId: 'provider-github'
    });

    assert.deepEqual(result.defaultAssignee, {
      accountId: 'andriy-dmytruk',
      displayName: 'andriy-dmytruk',
      username: 'andriy-dmytruk'
    });
    assert.match(result.message ?? '', /Loaded GitHub user/);
  } finally {
    restoreFetch();
  }
});

test('sync.users.search returns normalized Jira user suggestions for autocomplete', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/rest/api/2/user/search?')) {
      return jsonResponse([
        {
          accountId: 'user-123',
          displayName: 'Paperclip User',
          emailAddress: 'paperclip@example.com'
        },
        {
          name: 'legacy-user',
          displayName: 'Legacy Jira User'
        }
      ]);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-default-jira',
            type: 'jira',
            name: 'Default Jira',
            jiraBaseUrl: 'https://jira.example.com',
            jiraToken: 'jira-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.getData<{
      suggestions: Array<{
        accountId: string;
        displayName: string;
        emailAddress?: string;
        username?: string;
      }>;
    }>('sync.users.search', {
      companyId: 'company-1',
      providerId: 'provider-default-jira',
      query: 'paper'
    });

    assert.deepEqual(result.suggestions, [
      {
        accountId: 'user-123',
        displayName: 'Paperclip User',
        emailAddress: 'paperclip@example.com'
      },
      {
        accountId: 'legacy-user',
        displayName: 'Legacy Jira User',
        username: 'legacy-user'
      }
    ]);
  } finally {
    restoreFetch();
  }
});

test('sync.users.search falls back across Jira user search variants and never bubbles a provider-switch error', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/rest/api/2/user/search?query=')) {
      return new Response('Query search disabled', { status: 404 });
    }
    if (url.includes('/rest/api/2/user/search?username=')) {
      return new Response('Username search disabled', { status: 403 });
    }
    if (url.includes('/rest/api/2/groupuserpicker?')) {
      return jsonResponse({
        users: {
          users: [
            {
              key: 'legacy-user',
              displayName: 'Legacy Jira User',
              emailAddress: 'legacy@example.com'
            }
          ]
        }
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        providers: [
          {
            id: 'provider-default-jira',
            type: 'jira',
            name: 'Default Jira',
            jiraBaseUrl: 'https://jira.example.com',
            jiraToken: 'jira-token'
          }
        ]
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    const result = await harness.getData<{
      suggestions: Array<{
        accountId: string;
        displayName: string;
        emailAddress?: string;
      }>;
    }>('sync.users.search', {
      companyId: 'company-1',
      providerId: 'provider-default-jira',
      query: 'legacy'
    });

    assert.deepEqual(result.suggestions, [
      {
        accountId: 'legacy-user',
        displayName: 'Legacy Jira User',
        emailAddress: 'legacy@example.com',
        username: 'legacy-user'
      }
    ]);
  } finally {
    restoreFetch();
  }
});
