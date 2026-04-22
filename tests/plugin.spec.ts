import { strict as assert } from 'node:assert';
import test from 'node:test';

import { createTestHarness } from '@paperclipai/plugin-sdk/testing';

import manifest from '../src/manifest.ts';
import plugin from '../src/worker.ts';
import { normalizeProviderConfig, serializeProviderConfigForHost } from '../src/providers/shared/config.ts';
import { buildCommentOriginLabel, buildSyncProgressLabel } from '../src/ui/index.tsx';

type MockFetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type TaskFilters = {
  onlyActive?: boolean;
  author?: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
    username?: string;
  } | string;
  assignee?: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
    username?: string;
  };
  issueNumberGreaterThan?: number;
  issueNumberLessThan?: number;
};
type CommentSyncPresentation = {
  visible: boolean;
  linked: boolean;
  origin: 'paperclip' | 'provider_pull' | 'provider_push';
  providerKey?: string;
  styleTone?: 'synced' | 'local' | 'info';
  badgeLabel?: string;
  jiraIssueKey?: string;
  jiraUrl?: string;
  upstreamCommentId?: string | null;
  isEditable?: boolean;
  uploadAvailable?: boolean;
  lastSyncedAt?: string | null;
  syncMessage?: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json'
    }
  });
}

function installMockFetch(handler: MockFetchHandler): () => void {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = handler as typeof fetch;
  return () => {
    globalThis.fetch = previousFetch;
  };
}

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'project-1',
    companyId: 'company-1',
    urlKey: 'alpha',
    goalId: null,
    goalIds: [],
    goals: [],
    name: 'Alpha',
    description: null,
    status: 'planned',
    leadAgentId: null,
    targetDate: null,
    color: null,
    env: null,
    pauseReason: null,
    pausedAt: null,
    executionWorkspacePolicy: null,
    codebase: {
      workspaceId: null,
      repoUrl: null,
      repoRef: null,
      defaultRef: null,
      repoName: null,
      localFolder: null,
      managedFolder: '',
      effectiveLocalFolder: '',
      origin: 'local_folder'
    },
    workspaces: [],
    primaryWorkspace: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}

function makeIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: 'issue-1',
    companyId: 'company-1',
    projectId: 'project-1',
    projectWorkspaceId: null,
    goalId: null,
    parentId: null,
    title: 'Local Paperclip issue',
    description: 'Local body',
    status: 'todo',
    priority: 'medium',
    assigneeAgentId: null,
    assigneeUserId: null,
    checkoutRunId: null,
    executionRunId: null,
    executionAgentNameKey: null,
    executionLockedAt: null,
    createdByAgentId: null,
    createdByUserId: null,
    issueNumber: 1,
    identifier: 'PC-1',
    requestDepth: 0,
    billingCode: null,
    assigneeAdapterOverrides: null,
    executionWorkspaceId: null,
    executionWorkspacePreference: null,
    executionWorkspaceSettings: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    hiddenAt: null,
    labelIds: [],
    labels: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}

function makeAgent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agent-1',
    companyId: 'company-1',
    name: 'Atlas',
    urlKey: 'atlas',
    role: 'member',
    title: 'Engineer',
    icon: null,
    status: 'idle',
    reportsTo: null,
    capabilities: null,
    adapterType: 'openai',
    adapterConfig: {},
    runtimeConfig: {},
    budgetMonthlyCents: 0,
    spentMonthlyCents: 0,
    pauseReason: null,
    pausedAt: null,
    permissions: {
      canCreateAgents: false
    },
    lastHeartbeatAt: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as any;
}

test('manifest keeps sync launchers on project and issue surfaces only', async () => {
  assert.equal(manifest.id, 'paperclip-jira-plugin');
  assert.equal(manifest.displayName, 'Issue Sync');
  assert.ok(manifest.ui?.slots?.some((slot) => slot.type === 'settingsPage'));
  assert.ok((manifest.instanceConfigSchema as any)?.properties?.jiraToken);
  assert.deepEqual(
    (manifest.instanceConfigSchema as any)?.properties?.providers?.items?.properties?.type?.enum,
    ['jira', 'jira_dc', 'jira_cloud', 'github_issues']
  );
  assert.equal(manifest.ui?.launchers?.length, 1);
  assert.equal(manifest.ui?.launchers?.[0]?.id, 'paperclip-jira-plugin-entity-launcher');
  assert.equal(manifest.ui?.launchers?.[0]?.placementZone, 'toolbarButton');
  assert.deepEqual(manifest.ui?.launchers?.[0]?.entityTypes, ['project']);
});

test('provider config compatibility serializer keeps multi-provider records readable through legacy host schemas', async () => {
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

  assert.equal(serializedGitHub.type, 'jira');
  assert.equal(serializedGitHub.providerKind, 'github_issues');
  assert.equal(normalizeProviderConfig(serializedGitHub)?.type, 'github_issues');
  assert.equal(normalizeProviderConfig({
    id: 'provider-github-fallback',
    type: 'jira',
    name: 'GitHub fallback',
    githubApiBaseUrl: 'https://api.github.com',
    githubToken: 'token'
  })?.type, 'github_issues');

  assert.equal(serializedJiraCloud.type, 'jira');
  assert.equal(serializedJiraCloud.providerKind, 'jira_cloud');
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

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 30,
    mappings: [
      {
        jiraProjectKey: 'GRB',
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
  assert.equal(registration.mappings[0]?.jiraProjectKey, 'GRB');
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

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 45,
    mappings: [
      {
        providerId: 'provider-default-jira',
        jiraProjectKey: 'GRB',
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
        jiraProjectKey: 'GRB',
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
    fields?: { name?: string };
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

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 15,
    mappings: [
      {
        providerId: 'provider-default-jira',
        jiraProjectKey: 'GRB',
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

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: null,
    defaultStatus: 'in_progress',
    mappings: [
      {
        id: 'mapping-none',
        jiraProjectKey: 'GRB',
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
  assert.equal(popupState.mappings[0]?.jiraProjectKey, 'GRB');
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
          jiraProjectKey: 'GRB',
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

    await harness.performAction('settings.saveRegistration', {
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

    await harness.performAction('settings.saveRegistration', {
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

test('sync.runNow imports Jira issues into mapped Paperclip projects', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-461',
            fields: {
              summary: 'Imported from Jira',
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Remote body'
                      }
                    ]
                  }
                ]
              },
              status: {
                name: 'Backlog',
                statusCategory: {
                  name: 'To Do'
                }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: {
                name: 'Task'
              }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
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
      ],
      agents: [
        makeAgent()
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{
      status: string;
      importedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const providerDirectory = await harness.getData<{
      providers: Array<{ providerId: string; status?: string; healthLabel?: string; healthMessage?: string }>;
    }>('settings.providerDirectory', {
      companyId: 'company-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues.length, 1);
    assert.match(importedIssues[0]?.description ?? '', /paperclip-jira-plugin-upstream: GRB-461/);
    assert.equal(importedIssues[0]?.status, 'todo');
    assert.equal(providerDirectory.providers[0]?.status, 'connected');
    assert.equal(providerDirectory.providers[0]?.healthLabel, 'Connected');
    assert.match(providerDirectory.providers[0]?.healthMessage ?? '', /Last sync succeeded/);
  } finally {
    restoreFetch();
  }
});

test('sync.runNow marks provider health as degraded when upstream search fails', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        errorMessages: ['Boom']
      }, 502);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
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

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{ status: string; message?: string }>('sync.runNow', {
      companyId: 'company-1'
    });
    const providerDirectory = await harness.getData<{
      providers: Array<{ providerId: string; status?: string; healthLabel?: string; healthMessage?: string }>;
    }>('settings.providerDirectory', {
      companyId: 'company-1'
    });

    assert.equal(syncState.status, 'error');
    assert.equal(providerDirectory.providers[0]?.status, 'degraded');
    assert.equal(providerDirectory.providers[0]?.healthLabel, 'Degraded');
    assert.ok(providerDirectory.providers[0]?.healthMessage);
  } finally {
    restoreFetch();
  }
});

test('sync.runNow unhides a previously hidden imported Jira issue when it reappears upstream', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-461',
            fields: {
              summary: 'Imported from Jira',
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'Remote body'
                      }
                    ]
                  }
                ]
              },
              status: {
                name: 'Backlog',
                statusCategory: {
                  name: 'To Do'
                }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: {
                name: 'Task'
              }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-hidden-sync',
          projectId: 'project-1',
          title: '[GRB-461] Imported from Jira',
          description: 'Remote body\n\n<!-- paperclip-jira-plugin-upstream: GRB-461 -->',
          hiddenAt: new Date('2026-04-21T00:00:00.000Z')
        })
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-jira-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-hidden-sync',
      externalId: 'GRB-461',
      title: 'GRB-461',
      status: 'Backlog',
      data: {
        issueId: 'issue-hidden-sync',
        companyId: 'company-1',
        projectId: 'project-1',
        jiraIssueId: '10001',
        jiraIssueKey: 'GRB-461',
        jiraProjectKey: 'GRB',
        jiraUrl: 'https://jira.example.com/browse/GRB-461',
        jiraStatusName: 'Backlog',
        jiraStatusCategory: 'To Do',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        lastPulledAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    const syncState = await harness.performAction<{
      status: string;
      updatedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1'
    });

    const reloadedIssue = await harness.ctx.issues.get('issue-hidden-sync', 'company-1');

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.updatedCount, 1);
    assert.equal(reloadedIssue?.hiddenAt, null);
    assert.equal(reloadedIssue?.title, '[GRB-461] Imported from Jira');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow matches a scoped project even when an older mapping only saved the Paperclip project name', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10021',
            key: 'GRB-480',
            fields: {
              summary: 'Imported from legacy mapping',
              description: { type: 'doc', version: 1, content: [] },
              status: {
                name: 'Backlog',
                statusCategory: { name: 'To Do' }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: { name: 'Task' }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.ctx.state.set(
      { scopeKind: 'instance', stateKey: 'paperclip-jira-plugin-settings' },
      {
        mappings: [
          {
            id: 'mapping-legacy',
            companyId: 'company-1',
            jiraProjectKey: 'GRB',
            paperclipProjectName: 'Alpha'
          }
        ]
      }
    );

    const syncState = await harness.performAction<{
      status: string;
      importedCount?: number;
      message?: string;
    }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues.length, 1);
    assert.equal(importedIssues[0]?.title, '[GRB-480] Imported from legacy mapping');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow applies the default Jira-to-Paperclip status mapping when no explicit status mapping matches', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-462',
            fields: {
              summary: 'Imported in progress from Jira',
              description: {
                type: 'doc',
                version: 1,
                content: []
              },
              status: {
                name: 'In Progress',
                statusCategory: {
                  name: 'In Progress'
                }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: {
                name: 'Task'
              }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
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

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{
      status: string;
      importedCount?: number;
      failedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const detail = await harness.getData<{
      linked: boolean;
      localStatus?: string;
      upstream?: {
        jiraStatusName?: string;
        jiraStatusCategory?: string;
      };
    }>('issue.jiraDetails', {
      companyId: 'company-1',
      issueId: importedIssues[0]?.id ?? ''
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(syncState.failedCount, 0);
    assert.equal(importedIssues[0]?.status, 'todo');
    assert.equal(detail.linked, true);
    assert.equal(detail.localStatus, 'todo');
    assert.equal(detail.upstream?.jiraStatusName, 'In Progress');
    assert.equal(detail.upstream?.jiraStatusCategory, 'In Progress');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow maps closed GitHub issues to done by default', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues?state=all&per_page=50')) {
      return jsonResponse([
        {
          id: 1,
          number: 1,
          title: 'Closed GitHub issue',
          body: 'Imported from GitHub',
          state: 'closed',
          html_url: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
          user: {
            login: 'andriy-dmytruk'
          },
          created_at: '2026-04-21T13:03:54.000Z',
          updated_at: '2026-04-21T13:08:38.000Z'
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
      projects: [makeProject()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{ status: string }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(importedIssues.length, 1);
    assert.equal(importedIssues[0]?.status, 'done');
    assert.equal(importedIssues[0]?.title, '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Closed GitHub issue');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow applies explicit Jira-to-Paperclip status mappings on imported and updated issues', async () => {
  let searchCalls = 0;
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      searchCalls += 1;
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-463',
            fields: {
              summary: searchCalls === 1 ? 'Imported first pass' : 'Updated from Jira',
              description: {
                type: 'doc',
                version: 1,
                content: []
              },
              status: {
                name: 'Done',
                statusCategory: {
                  name: 'Done'
                }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: {
                name: 'Task'
              }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
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

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('sync.runNow', {
      companyId: 'company-1'
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const importedIssue = importedIssues[0];
    assert.ok(importedIssue);

    await harness.performAction('sync.runNow', {
      companyId: 'company-1'
    });

    const reloadedIssue = await harness.ctx.issues.get(importedIssue.id, 'company-1');
    const detail = await harness.getData<{
      localStatus?: string;
      upstream?: {
        jiraStatusName?: string;
      };
    }>('issue.jiraDetails', {
      companyId: 'company-1',
      issueId: importedIssue.id
    });

    assert.equal(reloadedIssue?.status, 'done');
    assert.equal(reloadedIssue?.assigneeAgentId, 'agent-1');
    assert.equal(detail.localStatus, 'done');
    assert.equal(detail.upstream?.jiraStatusName, 'Done');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow re-imports a Jira issue into a newly selected Paperclip project instead of reusing the old project link', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10001',
            key: 'GRB-461',
            fields: {
              summary: 'Imported from Jira',
              description: { type: 'doc', version: 1, content: [] },
              status: {
                name: 'Backlog',
                statusCategory: { name: 'To Do' }
              },
              comment: { comments: [] },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: { name: 'Task' }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
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
        makeProject({ id: 'project-1', name: 'Alpha' }),
        makeProject({ id: 'project-2', name: 'Beta' })
      ],
      issues: [
        makeIssue({
          id: 'issue-old-project',
          projectId: 'project-1',
          title: '[GRB-461] Imported from Jira',
          description: '<!-- paperclip-jira-plugin-upstream: GRB-461 -->'
        })
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-jira-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-old-project',
      externalId: 'GRB-461',
      title: 'GRB-461',
      status: 'Backlog',
      data: {
        issueId: 'issue-old-project',
        companyId: 'company-1',
        projectId: 'project-1',
        jiraIssueId: '10001',
        jiraIssueKey: 'GRB-461',
        jiraProjectKey: 'GRB',
        jiraUrl: 'https://jira.example.com/browse/GRB-461',
        jiraStatusName: 'Backlog',
        jiraStatusCategory: 'To Do',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-2',
      projectName: 'Beta',
      providerId: 'provider-default-jira',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-2',
          paperclipProjectName: 'Beta'
        }
      ]
    });

    const syncState = await harness.performAction<{ status: string; importedCount?: number; updatedCount?: number }>('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-2'
    });

    const projectOneIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });
    const projectTwoIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-2'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.importedCount, 1);
    assert.equal(syncState.updatedCount, 0);
    assert.equal(projectOneIssues.length, 1);
    assert.equal(projectTwoIssues.length, 1);
    assert.equal(projectTwoIssues[0]?.title, '[GRB-461] Imported from Jira');
  } finally {
    restoreFetch();
  }
});

test('issue.pushToJira creates an upstream issue and stores link metadata', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: {
            type: 'doc',
            version: 1,
            content: []
          },
          status: {
            name: 'Backlog',
            statusCategory: {
              name: 'To Do'
            }
          },
          comment: {
            comments: []
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: {
            name: 'Task'
          }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
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
      ],
      issues: [
        makeIssue()
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const result = await harness.performAction<{
      issueKey: string;
      message: string;
    }>('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const details = await harness.getData<{
      linked: boolean;
      upstream?: {
        issueKey: string;
      };
    }>('issue.jiraDetails', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(result.issueKey, 'GRB-999');
    assert.equal(details.linked, true);
    assert.equal(details.upstream?.issueKey, 'GRB-999');
  } finally {
    restoreFetch();
  }
});

test('sync.runNow reports progress counts and prefixes synced issue titles', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/search')) {
      return jsonResponse({
        issues: [
          {
            id: '10011',
            key: 'GRB-470',
            fields: {
              summary: 'Provider aware import',
              description: { type: 'doc', version: 1, content: [] },
              status: {
                name: 'Backlog',
                statusCategory: { name: 'To Do' }
              },
              comment: {
                comments: []
              },
              updated: '2026-04-21T13:08:38.000+0000',
              created: '2026-04-21T13:03:54.000+0000',
              issuetype: { name: 'Task' }
            }
          }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const syncState = await harness.performAction<{
      status: string;
      processedCount?: number;
      totalCount?: number;
      importedCount?: number;
    }>('sync.runNow', {
      companyId: 'company-1',
      providerKey: 'jira',
      filters: {
        onlyActive: true
      }
    });

    const importedIssues = await harness.ctx.issues.list({
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(syncState.status, 'success');
    assert.equal(syncState.processedCount, 1);
    assert.equal(syncState.totalCount, 1);
    assert.equal(syncState.importedCount, 1);
    assert.equal(importedIssues[0]?.title, '[GRB-470] Provider aware import');
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation keeps local and upstream state separate and exposes open-in-jira action', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: {
            name: 'In Progress',
            statusCategory: { name: 'In Progress' }
          },
          comment: {
            comments: []
          },
          creator: {
            name: 'Issue Creator'
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
        ]
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue({ status: 'blocked' })]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const presentation = await harness.getData<{
      isSynced: boolean;
      localStatus?: string;
      upstreamIssueKey?: string | null;
      titlePrefix?: string | null;
      openInProviderUrl?: string | null;
      upstreamStatus?: { name: string; category: string };
      upstream?: { jiraCreatorDisplayName?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const reloadedIssue = await harness.ctx.issues.get('issue-1', 'company-1');

    assert.equal(presentation.isSynced, true);
    assert.equal(presentation.localStatus, 'blocked');
    assert.equal(presentation.upstreamIssueKey, 'GRB-999');
    assert.equal(presentation.titlePrefix, '[GRB-999]');
    assert.equal(presentation.upstreamStatus?.name, 'In Progress');
    assert.equal(presentation.upstreamStatus?.category, 'In Progress');
    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'Issue Creator');
    assert.equal(presentation.openInProviderUrl, 'https://jira.example.com/browse/GRB-999');
    assert.equal(reloadedIssue?.title, '[GRB-999] Local Paperclip issue');
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamAssignee updates the Jira assignee and refreshes upstream metadata', async () => {
  let assigned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: { comments: [] },
          assignee: assigned
            ? { displayName: 'New Owner' }
            : { displayName: 'Paperclip Owner' },
          creator: { displayName: 'Issue Creator' },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/assignee') && init?.method === 'PUT') {
      assigned = true;
      return new Response(null, { status: 204 });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions')) {
      return jsonResponse({
        transitions: []
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()],
      agents: [makeAgent()]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const result = await harness.performAction<{ message: string }>('issue.setUpstreamAssignee', {
      companyId: 'company-1',
      params: {
        companyId: 'company-1',
        issueId: 'issue-1',
        assignee: {
          accountId: 'new-owner',
          displayName: 'New Owner',
          username: 'new-owner'
        }
      }
    } as any);

    const presentation = await harness.getData<{
      upstream?: { jiraAssigneeDisplayName?: string; jiraCreatorDisplayName?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.match(result.message, /Updated upstream assignee to New Owner/);
    assert.equal(presentation.upstream?.jiraAssigneeDisplayName, 'New Owner');
    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'Issue Creator');
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamAssignee surfaces GitHub assignment validation failures', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1') && init?.method === 'PATCH') {
      return jsonResponse({
        message: 'Validation Failed',
        errors: [{
          field: 'assignees',
          code: 'invalid',
          message: 'Could not resolve to a user with access to this repository.'
        }]
      }, 422);
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
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-jira-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-jira-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      status: 'Open',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-github',
        jiraIssueId: '1',
        jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
        jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
        jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        jiraStatusName: 'Open',
        jiraStatusCategory: 'Open',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    await assert.rejects(
      async () => await harness.performAction('issue.setUpstreamAssignee', {
        companyId: 'company-1',
        params: {
          companyId: 'company-1',
          issueId: 'issue-1',
          assignee: {
            accountId: 'andriy-dmytruk',
            displayName: 'andriy-dmytruk',
            username: 'andriy-dmytruk'
          }
        }
      } as any),
      /GitHub request failed \(422\).*assignees: invalid: Could not resolve to a user with access to this repository\..*selected assignee cannot be assigned to this repository/i
    );
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamStatus transitions the Jira issue and refreshes upstream metadata', async () => {
  let transitioned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: transitioned
            ? { name: 'Done', statusCategory: { name: 'Done' } }
            : { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: {
            comments: []
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions') && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions') && init?.method === 'POST') {
      transitioned = true;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      defaultStatus: 'todo',
      statusMappings: [
        {
          jiraStatus: 'Done',
          paperclipStatus: 'done',
          assigneeAgentId: 'agent-1'
        }
      ],
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const result = await harness.performAction<{ message: string }>('issue.setUpstreamStatus', {
      companyId: 'company-1',
      issueId: 'issue-1',
      transitionId: '31'
    });

    const presentation = await harness.getData<{
      upstreamStatus?: { name: string; category: string };
      upstream?: { jiraAssigneeDisplayName?: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.match(result.message, /Updated upstream status to Done/);
    assert.equal(presentation.upstreamStatus?.name, 'Done');
    assert.equal(presentation.upstreamStatus?.category, 'Done');
    assert.equal(presentation.upstream?.jiraAssigneeDisplayName, 'Paperclip Owner');
    const reloadedIssue = await harness.ctx.issues.get('issue-1', 'company-1');
    assert.equal(reloadedIssue?.status, 'done');
    assert.equal(reloadedIssue?.assigneeAgentId, 'agent-1');
  } finally {
    restoreFetch();
  }
});

test('issue.setUpstreamStatus tolerates the Paperclip 204 bridge response bug', async () => {
  let transitioned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: transitioned
            ? { name: 'Done', statusCategory: { name: 'Done' } }
            : { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: {
            comments: []
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions') && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions') && init?.method === 'POST') {
      transitioned = true;
      throw new Error('Response constructor: Invalid response status code 204');
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const result = await harness.performAction<{ message: string }>('issue.setUpstreamStatus', {
      companyId: 'company-1',
      issueId: 'issue-1',
      transitionId: '31'
    });

    const presentation = await harness.getData<{
      isSynced: boolean;
      upstreamStatus?: { name: string; category: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.match(result.message, /Updated upstream status to Done/);
    assert.equal(presentation.isSynced, true);
    assert.equal(presentation.upstreamStatus?.name, 'Done');
    assert.equal(presentation.upstreamStatus?.category, 'Done');
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation and upstream status action recover a missing link entity from the Jira marker', async () => {
  let transitioned = false;
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue/GRB-318?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10318',
        key: 'GRB-318',
        fields: {
          summary: 'Recovered sync issue',
          description: { type: 'doc', version: 1, content: [] },
          status: transitioned
            ? { name: 'Done', statusCategory: { name: 'Done' } }
            : { name: 'Backlog', statusCategory: { name: 'To Do' } },
          comment: { comments: [] },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' },
          assignee: { displayName: 'Recovered User' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-318/transitions') && (!init?.method || init.method === 'GET')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-318/transitions') && init?.method === 'POST') {
      transitioned = true;
      return new Response(null, { status: 204 });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-recover-link',
          projectId: 'project-1',
          title: '[GRB-318] Recovered sync issue',
          description: 'Recovered body\n\n<!-- paperclip-jira-plugin-upstream: GRB-318 -->'
        })
      ]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    const presentation = await harness.getData<{
      isSynced: boolean;
      upstreamIssueKey?: string | null;
      upstreamStatus?: { name: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-recover-link'
    });

    const transitionResult = await harness.performAction<{ message: string }>('issue.setUpstreamStatus', {
      companyId: 'company-1',
      issueId: 'issue-recover-link',
      transitionId: '31'
    });

    const refreshedPresentation = await harness.getData<{
      isSynced: boolean;
      upstreamStatus?: { name: string };
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-recover-link'
    });

    assert.equal(presentation.isSynced, true);
    assert.equal(presentation.upstreamIssueKey, 'GRB-318');
    assert.equal(presentation.upstreamStatus?.name, 'Backlog');
    assert.match(transitionResult.message, /Updated upstream status to Done/);
    assert.equal(refreshedPresentation.isSynced, true);
    assert.equal(refreshedPresentation.upstreamStatus?.name, 'Done');
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation resolves the correct link when the host ignores entity scope filters', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [
      makeIssue({
        id: 'issue-1',
        projectId: 'project-1',
        title: '[GRB-161] First imported issue',
        description: 'Body\n\n<!-- paperclip-jira-plugin-upstream: GRB-161 -->'
      }),
      makeIssue({
        id: 'issue-2',
        projectId: 'project-1',
        title: '[GRB-221] Second imported issue',
        description: 'Body\n\n<!-- paperclip-jira-plugin-upstream: GRB-221 -->'
      })
    ]
  });

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    projectId: 'project-1',
    projectName: 'Alpha',
    providerId: 'provider-default-jira',
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-jira-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-1',
    externalId: 'GRB-161:issue-1',
    title: 'GRB-161',
    status: 'Backlog',
    data: {
      issueId: 'issue-1',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10001',
      jiraIssueKey: 'GRB-161',
      jiraProjectKey: 'GRB',
      jiraUrl: 'https://jira.example.com/browse/GRB-161',
      jiraStatusName: 'Backlog',
      jiraStatusCategory: 'To Do',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });
  await harness.ctx.entities.upsert({
    entityType: 'paperclip-jira-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-2',
    externalId: 'GRB-221:issue-2',
    title: 'GRB-221',
    status: 'In Progress',
    data: {
      issueId: 'issue-2',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10002',
      jiraIssueKey: 'GRB-221',
      jiraProjectKey: 'GRB',
      jiraUrl: 'https://jira.example.com/browse/GRB-221',
      jiraStatusName: 'In Progress',
      jiraStatusCategory: 'In Progress',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });

  const originalList = harness.ctx.entities.list.bind(harness.ctx.entities);
  harness.ctx.entities.list = async (query) => {
    const degradedQuery = query.entityType
      ? { entityType: query.entityType, limit: query.limit }
      : { limit: query.limit };
    return await originalList(degradedQuery as typeof query);
  };

  const presentation = await harness.getData<{
    isSynced: boolean;
    upstreamIssueKey?: string | null;
    upstreamStatus?: { name: string };
  }>('issue.syncPresentation', {
    companyId: 'company-1',
    issueId: 'issue-2'
  });

  assert.equal(presentation.isSynced, true);
  assert.equal(presentation.upstreamIssueKey, 'GRB-221');
  assert.equal(presentation.upstreamStatus?.name, 'In Progress');
});

test('comment sync presentation marks fetched comments and local comments separately', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: {
            name: 'Backlog',
            statusCategory: { name: 'To Do' }
          },
          comment: {
            comments: [
              {
                id: 'comment-remote-1',
                body: {
                  type: 'doc',
                  version: 1,
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Fetched Jira comment' }]
                    }
                  ]
                },
                author: { displayName: 'Jira User' },
                created: '2026-04-21T13:03:54.000+0000',
                updated: '2026-04-21T13:03:54.000+0000'
              }
            ]
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions')) {
      return jsonResponse({
        transitions: [
          { id: '31', name: 'Done' },
          { id: '41', name: 'Backlog' }
        ]
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/comment') && init?.method === 'POST') {
      return jsonResponse({
        id: 'comment-remote-2'
      }, 201);
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    await harness.performAction('issue.pullFromJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const comments = await harness.ctx.issues.listComments('issue-1', 'company-1');
    const fetchedComment = comments.find((comment) => comment.body.includes('Fetched Jira comment'));
    assert.ok(fetchedComment);

    const localComment = await harness.ctx.issues.createComment('issue-1', 'Local comment to upload', 'company-1');

    const fetchedPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: fetchedComment.id
    });
    const localPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: localComment.id
    });
    const uploadResult = await harness.performAction<{
      upstreamCommentId?: string;
      message: string;
    }>('comment.uploadToProvider', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: localComment.id
    });

    const uploadedPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: localComment.id
    });

    assert.equal(fetchedPresentation.origin, 'provider_pull');
    assert.equal(fetchedPresentation.styleTone, 'synced');
    assert.equal(fetchedPresentation.badgeLabel, 'Imported');
    assert.equal(fetchedPresentation.uploadAvailable, false);
    assert.equal(localPresentation.origin, 'paperclip');
    assert.equal(localPresentation.styleTone, 'local');
    assert.equal(localPresentation.badgeLabel, 'Local only');
    assert.equal(localPresentation.uploadAvailable, true);
    assert.equal(uploadResult.upstreamCommentId, 'comment-remote-2');
    assert.equal(uploadedPresentation.origin, 'provider_push');
    assert.equal(uploadedPresentation.styleTone, 'info');
    assert.equal(uploadedPresentation.badgeLabel, 'Published upstream');
    assert.equal(uploadedPresentation.uploadAvailable, false);
  } finally {
    restoreFetch();
  }
});

test('issue.comment.submit always publishes synced issue comments to Jira', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue/GRB-999/comment') && init?.method === 'POST') {
      return jsonResponse({
        id: 'comment-remote-99'
      }, 201);
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
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[GRB-999] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-jira-plugin-upstream: GRB-999 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-default-jira',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-default-jira',
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-jira-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'GRB-999',
      title: 'GRB-999',
      status: 'Backlog',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-default-jira',
        jiraIssueId: '10002',
        jiraIssueKey: 'GRB-999',
        jiraProjectKey: 'GRB',
        jiraUrl: 'https://jira.example.com/browse/GRB-999',
        jiraStatusName: 'Backlog',
        jiraStatusCategory: 'To Do',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    const publishResult = await harness.performAction<{
      commentId: string;
      publishedUpstream: boolean;
      upstreamCommentId?: string | null;
      message: string;
    }>('issue.comment.submit', {
      companyId: 'company-1',
      params: {
        companyId: 'company-1',
        issueId: 'issue-1',
        body: 'Publish this upstream too'
      }
    } as any);

    const publishedPresentation = await harness.getData<CommentSyncPresentation>('comment.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1',
      commentId: publishResult.commentId
    });

    const comments = await harness.ctx.issues.listComments('issue-1', 'company-1');
    assert.equal(comments.length, 1);
    assert.equal(publishResult.publishedUpstream, true);
    assert.equal(publishResult.upstreamCommentId, 'comment-remote-99');
    assert.match(publishResult.message, /published it to Jira/);
    assert.equal(publishedPresentation.origin, 'provider_push');
    assert.equal(publishedPresentation.badgeLabel, 'Published upstream');
    assert.equal(publishedPresentation.upstreamCommentId, 'comment-remote-99');
    assert.equal(publishedPresentation.uploadAvailable, false);
  } finally {
    restoreFetch();
  }
});

test('issue.comment.submit preserves the local comment and surfaces GitHub permission failures', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1/comments') && init?.method === 'POST') {
      return jsonResponse({
        message: 'Resource not accessible by personal access token'
      }, 403);
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
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-jira-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-jira-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      status: 'Open',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-github',
        jiraIssueId: '1',
        jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
        jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
        jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        jiraStatusName: 'Open',
        jiraStatusCategory: 'Open',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    await assert.rejects(
      async () => await harness.performAction('issue.comment.submit', {
        companyId: 'company-1',
        params: {
          companyId: 'company-1',
          issueId: 'issue-1',
          body: 'Publish this upstream too'
        }
      } as any),
      /Created the comment in Paperclip, but GitHub publishing failed: GitHub request failed \(403\)\. Resource not accessible by personal access token.*Personal Access Token can write issues for this repository/i
    );

    const comments = await harness.ctx.issues.listComments('issue-1', 'company-1');
    assert.equal(comments.length, 1);
    assert.equal(comments[0]?.body, 'Publish this upstream too');
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation loads GitHub upstream comments', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1')) {
      return jsonResponse({
        id: 1,
        number: 1,
        title: 'GitHub issue',
        body: 'Imported from GitHub',
        state: 'open',
        html_url: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        assignees: [{ login: 'andriy-dmytruk' }],
        user: { login: 'octocat' },
        created_at: '2026-04-21T13:03:54.000Z',
        updated_at: '2026-04-21T13:08:38.000Z'
      });
    }
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1/comments?per_page=100')) {
      return jsonResponse([
        {
          id: 101,
          body: 'First GitHub comment',
          user: { login: 'commenter-one' },
          created_at: '2026-04-21T13:10:00.000Z',
          updated_at: '2026-04-21T13:10:00.000Z'
        },
        {
          id: 102,
          body: 'Second GitHub comment',
          user: { login: 'commenter-two' },
          created_at: '2026-04-21T13:11:00.000Z',
          updated_at: '2026-04-21T13:11:00.000Z'
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
      projects: [makeProject()],
      issues: [
        makeIssue({
          id: 'issue-1',
          title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1] Local Paperclip issue',
          description: 'Local body\n\n<!-- paperclip-jira-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1 -->'
        })
      ]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.ctx.entities.upsert({
      entityType: 'paperclip-jira-plugin.issue-link',
      scopeKind: 'issue',
      scopeId: 'issue-1',
      externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
      status: 'Open',
      data: {
        issueId: 'issue-1',
        companyId: 'company-1',
        projectId: 'project-1',
        providerId: 'provider-github',
        jiraIssueId: '1',
        jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1',
        jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
        jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
        jiraStatusName: 'Open',
        jiraStatusCategory: 'Open',
        lastSyncedAt: '2026-04-21T13:08:38.000Z',
        source: 'jira'
      }
    });

    const presentation = await harness.getData<{
      upstream?: {
        jiraCreatorDisplayName?: string;
      };
      upstreamComments?: Array<{ id: string; authorDisplayName: string; body: string }>;
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'octocat');
    assert.deepEqual(presentation.upstreamComments ?? [], [
      {
        id: '101',
        authorDisplayName: 'commenter-one',
        body: 'First GitHub comment',
        createdAt: '2026-04-21T13:10:00.000Z',
        updatedAt: '2026-04-21T13:10:00.000Z'
      },
      {
        id: '102',
        authorDisplayName: 'commenter-two',
        body: 'Second GitHub comment',
        createdAt: '2026-04-21T13:11:00.000Z',
        updatedAt: '2026-04-21T13:11:00.000Z'
      }
    ]);
  } finally {
    restoreFetch();
  }
});

test('issue sync presentation falls back to reporter when Jira creator is not present', async () => {
  const restoreFetch = installMockFetch(async (input, init) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/rest/api/2/issue') && init?.method === 'POST') {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999'
      }, 201);
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999?fields=summary,description,status,comment,updated,created,issuetype,assignee,creator,reporter')) {
      return jsonResponse({
        id: '10002',
        key: 'GRB-999',
        fields: {
          summary: 'Local Paperclip issue',
          description: { type: 'doc', version: 1, content: [] },
          status: {
            name: 'In Progress',
            statusCategory: { name: 'In Progress' }
          },
          comment: {
            comments: []
          },
          reporter: {
            displayName: 'Issue Reporter'
          },
          assignee: {
            displayName: 'Paperclip Owner'
          },
          updated: '2026-04-21T13:08:38.000+0000',
          created: '2026-04-21T13:03:54.000+0000',
          issuetype: { name: 'Task' }
        }
      });
    }
    if (url.endsWith('/rest/api/2/issue/GRB-999/transitions')) {
      return jsonResponse({
        transitions: []
      });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  try {
    const harness = createTestHarness({
      manifest,
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        jiraToken: 'jira-token'
      } as any
    });
    await plugin.definition.setup(harness.ctx);

    harness.seed({
      projects: [makeProject()],
      issues: [makeIssue()]
    });

    await harness.performAction('settings.saveRegistration', {
      companyId: 'company-1',
      mappings: [
        {
          jiraProjectKey: 'GRB',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('issue.pushToJira', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    const presentation = await harness.getData<{
      upstream?: {
        jiraCreatorDisplayName?: string;
      };
      upstreamComments?: Array<{ id: string }>;
    }>('issue.syncPresentation', {
      companyId: 'company-1',
      issueId: 'issue-1'
    });

    assert.equal(presentation.upstream?.jiraCreatorDisplayName, 'Issue Reporter');
    assert.deepEqual(presentation.upstreamComments ?? [], []);
  } finally {
    restoreFetch();
  }
});

test('sync.findCleanupCandidates includes legacy untouched Jira imports across local Paperclip statuses', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [
      makeIssue({
        id: 'issue-legacy-import',
        title: '[GRB-777] Legacy imported Jira issue',
        description: 'Imported body\n\n<!-- paperclip-jira-plugin-upstream: GRB-777 -->',
        status: 'backlog'
      })
    ]
  });

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    scheduleFrequencyMinutes: 15,
    mappings: [
      {
        providerId: 'provider-default-jira',
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-jira-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-legacy-import',
    externalId: 'GRB-777',
    title: 'GRB-777',
    status: 'Backlog',
    data: {
      issueId: 'issue-legacy-import',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10077',
      jiraIssueKey: 'GRB-777',
      jiraProjectKey: 'GRB',
      jiraUrl: 'https://jira.example.com/browse/GRB-777',
      jiraStatusName: 'Backlog',
      jiraStatusCategory: 'To Do',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      lastPulledAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });

  const result = await harness.performAction<{
    count: number;
    candidates: Array<{ issueId: string; jiraIssueKey: string; status: string }>;
  }>('sync.findCleanupCandidates', {
    companyId: 'company-1'
  });

  assert.equal(result.count, 1);
  assert.equal(result.candidates[0]?.issueId, 'issue-legacy-import');
  assert.equal(result.candidates[0]?.jiraIssueKey, 'GRB-777');
  assert.equal(result.candidates[0]?.status, 'backlog');
});

test('sync.findCleanupCandidates ignores hidden imported issues', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [
      makeIssue({
        id: 'issue-hidden-import',
        title: '[GRB-778] Hidden imported Jira issue',
        description: 'Imported body\n\n<!-- paperclip-jira-plugin-upstream: GRB-778 -->',
        hiddenAt: new Date('2026-04-21T00:00:00.000Z'),
        status: 'backlog'
      })
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-jira-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-hidden-import',
    externalId: 'GRB-778',
    title: 'GRB-778',
    status: 'Backlog',
    data: {
      issueId: 'issue-hidden-import',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10078',
      jiraIssueKey: 'GRB-778',
      jiraProjectKey: 'GRB',
      jiraUrl: 'https://jira.example.com/browse/GRB-778',
      jiraStatusName: 'Backlog',
      jiraStatusCategory: 'To Do',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      lastPulledAt: '2026-04-21T13:08:38.000Z',
      source: 'jira'
    }
  });

  const result = await harness.performAction<{
    count: number;
    candidates: Array<{ issueId: string }>;
  }>('sync.findCleanupCandidates', {
    companyId: 'company-1'
  });

  assert.equal(result.count, 0);
  assert.equal(result.candidates.length, 0);
});

test('sync.findCleanupCandidates includes untouched imported GitHub issues', async () => {
  const restoreFetch = installMockFetch(async (input) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.endsWith('/repos/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues?state=all&per_page=50')) {
      return jsonResponse([
        {
          id: 1,
          number: 1,
          title: 'Imported GitHub issue',
          body: 'Imported from GitHub',
          state: 'open',
          html_url: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/1',
          user: {
            login: 'andriy-dmytruk'
          },
          created_at: '2026-04-21T13:03:54.000Z',
          updated_at: '2026-04-21T13:08:38.000Z'
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
      projects: [makeProject()]
    });

    await harness.performAction('sync.project.save', {
      companyId: 'company-1',
      projectId: 'project-1',
      projectName: 'Alpha',
      providerId: 'provider-github',
      scheduleFrequencyMinutes: 15,
      mappings: [
        {
          id: 'mapping-1',
          providerId: 'provider-github',
          jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
          paperclipProjectId: 'project-1',
          paperclipProjectName: 'Alpha'
        }
      ]
    });

    await harness.performAction('sync.runNow', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    const result = await harness.performAction<{
      count: number;
      candidates: Array<{ issueId: string; jiraIssueKey: string; status: string }>;
    }>('sync.findCleanupCandidates', {
      companyId: 'company-1',
      projectId: 'project-1'
    });

    assert.equal(result.count, 1);
    assert.equal(result.candidates[0]?.jiraIssueKey, 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#1');
    assert.equal(result.candidates[0]?.status, 'todo');
  } finally {
    restoreFetch();
  }
});

test('sync.findCleanupCandidates still includes imported GitHub issues after local sync activity', async () => {
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
    projects: [makeProject()],
    issues: [
      makeIssue({
        id: 'issue-github-import',
        title: '[ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2] Imported GitHub issue with local edits',
        description: 'Locally tweaked body\n\n<!-- paperclip-jira-plugin-upstream: ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2 -->',
        status: 'in_progress'
      })
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-jira-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-github-import',
    externalId: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
    title: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
    status: 'Open',
    data: {
      issueId: 'issue-github-import',
      companyId: 'company-1',
      projectId: 'project-1',
      providerId: 'provider-github',
      jiraIssueId: '2',
      jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
      jiraProjectKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO',
      jiraUrl: 'https://github.com/ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO/issues/2',
      jiraStatusName: 'Open',
      jiraStatusCategory: 'Open',
      lastSyncedAt: '2026-04-21T13:08:38.000Z',
      lastPulledAt: '2026-04-21T13:08:38.000Z',
      lastPushedAt: '2026-04-21T13:10:00.000Z',
      source: 'jira',
      importedTitleHash: 'stale-title-hash',
      importedDescriptionHash: 'stale-description-hash'
    }
  });

  await harness.ctx.state.set({
    scopeKind: 'issue',
    scopeId: 'issue-github-import',
    stateKey: 'paperclip-jira-plugin-comment-links'
  }, {
    'comment-1': {
      commentId: 'comment-1',
      issueId: 'issue-github-import',
      companyId: 'company-1',
      jiraIssueKey: 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2',
      jiraCommentId: '200',
      direction: 'push',
      lastSyncedAt: '2026-04-21T13:11:00.000Z'
    }
  });

  const result = await harness.performAction<{
    count: number;
    candidates: Array<{ issueId: string; jiraIssueKey: string; status: string }>;
  }>('sync.findCleanupCandidates', {
    companyId: 'company-1',
    projectId: 'project-1'
  });

  assert.equal(result.count, 1);
  assert.equal(result.candidates[0]?.issueId, 'issue-github-import');
  assert.equal(result.candidates[0]?.jiraIssueKey, 'ANDRIY-DMYTRUK/ANDRIY-DMYTRUK.GITHUB.IO#2');
  assert.equal(result.candidates[0]?.status, 'in_progress');
});

test('issue sync presentation keeps a mapped local issue unsynced until it is linked', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [makeIssue()]
  });

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  const presentation = await harness.getData<{
    visible: boolean;
    isSynced: boolean;
    linked?: boolean;
    upstreamIssueKey?: string | null;
    openInProviderUrl?: string | null;
    upstreamStatus?: { name: string; category: string };
    mapping?: { jiraProjectKey: string };
  }>('issue.syncPresentation', {
    companyId: 'company-1',
    issueId: 'issue-1'
  });

  assert.equal(presentation.visible, true);
  assert.equal(presentation.isSynced, false);
  assert.equal(presentation.linked, false);
  assert.equal(presentation.upstreamIssueKey, null);
  assert.equal(presentation.openInProviderUrl, null);
  assert.equal(presentation.upstreamStatus, undefined);
  assert.equal(presentation.mapping?.jiraProjectKey, 'GRB');
});

test('issue sync presentation ignores stale Jira link metadata when the issue no longer carries Jira markers', async () => {
  const harness = createTestHarness({
    manifest,
    config: {
      jiraBaseUrl: 'https://jira.example.com',
      jiraToken: 'jira-token'
    } as any
  });
  await plugin.definition.setup(harness.ctx);

  harness.seed({
    projects: [makeProject()],
    issues: [
      makeIssue({
        id: 'issue-stale-link',
        title: 'test',
        description: ''
      })
    ]
  });

  await harness.performAction('settings.saveRegistration', {
    companyId: 'company-1',
    mappings: [
      {
        jiraProjectKey: 'GRB',
        paperclipProjectId: 'project-1',
        paperclipProjectName: 'Alpha'
      }
    ]
  });

  await harness.ctx.entities.upsert({
    entityType: 'paperclip-jira-plugin.issue-link',
    scopeKind: 'issue',
    scopeId: 'issue-stale-link',
    externalId: 'GRB-461',
    title: 'GRB-461',
    status: 'In Review',
    data: {
      issueId: 'issue-stale-link',
      companyId: 'company-1',
      projectId: 'project-1',
      jiraIssueId: '10001',
      jiraIssueKey: 'GRB-461',
      jiraProjectKey: 'GRB',
      jiraUrl: 'https://jira.example.com/browse/GRB-461',
      jiraAssigneeDisplayName: 'Andriy Dmytruk',
      jiraStatusName: 'In Review',
      jiraStatusCategory: 'In Progress',
      lastSyncedAt: '2026-04-21T17:50:14.000Z',
      lastPulledAt: '2026-04-21T17:50:14.000Z',
      source: 'jira'
    }
  });

  const presentation = await harness.getData<{
    visible: boolean;
    isSynced: boolean;
    upstreamIssueKey?: string | null;
    openInProviderUrl?: string | null;
    upstreamStatus?: { name: string; category: string };
  }>('issue.syncPresentation', {
    companyId: 'company-1',
    issueId: 'issue-stale-link'
  });

  assert.equal(presentation.visible, true);
  assert.equal(presentation.isSynced, false);
  assert.equal(presentation.upstreamIssueKey, null);
  assert.equal(presentation.openInProviderUrl, null);
  assert.equal(presentation.upstreamStatus, undefined);
});

test('ui helper labels describe sync progress and comment origin', async () => {
  assert.equal(
    buildSyncProgressLabel({
      status: 'running',
      processedCount: 2,
      totalCount: 5
    }),
    '2 of 5 issues processed'
  );
  assert.equal(buildCommentOriginLabel('provider_pull'), 'Fetched from Jira');
  assert.equal(buildCommentOriginLabel('provider_pull', 'github_issues'), 'Fetched from GitHub');
  assert.equal(buildCommentOriginLabel('paperclip'), 'Local Paperclip comment');
});
