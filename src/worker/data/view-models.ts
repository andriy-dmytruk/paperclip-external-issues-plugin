import {
  DEFAULT_GITHUB_API_BASE_URL,
  isJiraProviderType,
  normalizeProviderType,
  type GitHubIssuesProviderConfig,
  type JiraCloudProviderConfig,
  type JiraDcProviderConfig
} from '../../providers/shared/config.ts';
import {
  getConnectionTestStateForCompany,
  getProjectConfig,
  getProjectConnectionTestState,
  getProjectScheduleFrequencyMinutes,
  getProjectSyncState,
  inferDefaultUpstreamKeyFromMappings,
  normalizeSettings
} from '../core/settings-runtime.ts';
import { DEFAULT_ISSUE_TYPE, DEFAULT_PROVIDER_ID, SETTINGS_SCOPE } from '../core/defaults.ts';
import { loadNormalizedState } from '../core/state.ts';
import { normalizeOptionalString } from '../core/utils.ts';
import { getProjectGitHubRepository } from '../core/project-helpers.ts';
import { countImportedIssuesByProject } from './imported-issues.ts';
import {
  buildDisplayConfigSummary,
  buildProviderTypeOptions
} from './provider-status.ts';
import {
  ISSUE_LINK_ENTITY_TYPE,
  providerConfigResolver,
  providerRegistry,
  type PluginSetupContext
} from '../core/context.ts';
import { getEffectiveProjectStatusMappings } from '../providers/provider-actions.ts';

type AnyRecord = Record<string, any>;

const DEFAULT_PAPERCLIP_STATUS = 'todo';
const DEFAULT_SYNC_FREQUENCY_MINUTES = 60;

async function loadSettingsRegistrationData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string,
  issueId?: string
): Promise<AnyRecord> {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const projects = companyId ? await ctx.projects.list({ companyId }) : [];
  const visibleProjects = projects.filter((project) => !project.archivedAt);
  const importedCountsByProjectId = await countImportedIssuesByProject(ctx, ISSUE_LINK_ENTITY_TYPE, companyId);
  const providers = await providerConfigResolver.getAvailableProviders(ctx);
  const providerSummaries = await Promise.all(providers.map(async (provider) => {
    const config = await providerConfigResolver.getProviderDisplayConfig(ctx, provider.id);
    const configSummary = buildDisplayConfigSummary(config);
    const connectionTest = getConnectionTestStateForCompany(settings, companyId, provider.id);
    const healthStatus =
      connectionTest.status === 'success'
        ? 'connected'
        : connectionTest.status === 'error'
          ? 'degraded'
          : configSummary.ready
            ? 'not_tested'
            : 'needs_config';
    return {
      providerId: provider.id,
      providerKey: provider.type,
      displayName: provider.name,
      status: healthStatus,
      healthLabel:
        healthStatus === 'connected'
          ? 'Connected'
          : healthStatus === 'degraded'
            ? 'Degraded'
            : healthStatus === 'not_tested'
              ? 'Not tested'
              : 'Needs config',
      healthMessage: connectionTest.message,
      configSummary: configSummary.message,
      supportsConnectionTest: true,
      defaultIssueType: config.defaultIssueType,
      tokenSaved: config.tokenSaved
    };
  }));
  const derivedIssue = companyId && issueId ? await ctx.issues.get(issueId, companyId) : null;
  const fallbackProjectId =
    normalizeOptionalString(projectId)
    ?? derivedIssue?.projectId
    ?? (visibleProjects.length === 1 ? visibleProjects[0]?.id : undefined);
  const selectedProject = fallbackProjectId ? visibleProjects.find((project) => project.id === fallbackProjectId) ?? null : null;
  const selectedProjectGitHubRepository = selectedProject ? getProjectGitHubRepository(selectedProject) : undefined;
  const projectConfig = selectedProject
    ? getProjectConfig(settings, companyId ?? '', selectedProject.id, selectedProject.name)
    : null;
  const selectedProviderId = projectConfig?.providerId ?? null;
  const selectedProviderConfig = selectedProviderId ? await providerConfigResolver.getProviderDisplayConfig(ctx, selectedProviderId) : null;
  const selectedProviderSummary = selectedProviderConfig ? buildDisplayConfigSummary(selectedProviderConfig) : null;
  const selectedProviderType = selectedProviderConfig?.providerType ?? null;
  const effectiveStatusMappings = await getEffectiveProjectStatusMappings(ctx, projectConfig);
  const selectedMappings = (projectConfig?.mappings ?? []).map((mapping) => ({
    id: mapping.id,
    providerId: projectConfig?.providerId,
    enabled: mapping.enabled !== false,
    jiraProjectKey: mapping.jiraProjectKey,
    ...(mapping.jiraJql ? { jiraJql: mapping.jiraJql } : {}),
    paperclipProjectId: projectConfig?.projectId,
    paperclipProjectName: projectConfig?.projectName,
    ...(mapping.filters ? { filters: mapping.filters } : {})
  }));
  const agentIssueProviderAccess = projectConfig?.agentIssueProviderAccess ?? {
    enabled: false,
    allowedAgentIds: []
  };
  const entrySurface = issueId ? 'issue' : selectedProject ? 'project' : 'global';
  const requiresProjectSelection = !selectedProject;
  const providerTypeOptions = buildProviderTypeOptions(providerRegistry.list());

  return {
    entryContext: {
      surface: entrySurface,
      projectId: selectedProject?.id ?? fallbackProjectId ?? null,
      issueId: issueId ?? null,
      projectName: selectedProject?.name ?? null,
      requiresProjectSelection
    },
    currentPage: requiresProjectSelection ? 'projects' : 'project',
    selectedProjectId: selectedProject?.id ?? null,
    selectedProjectName: selectedProject?.name ?? null,
    mappings: selectedMappings,
    filters: selectedMappings[0]?.filters ?? {},
    providers: providerSummaries,
    providerTypeOptions,
    selectedProviderId,
    selectedProviderKey: selectedProviderType,
    connectionTest: getProjectConnectionTestState(settings, companyId, selectedProject?.id, selectedProviderId ?? undefined),
    syncState: getProjectSyncState(settings, companyId, selectedProject?.id),
    scheduleFrequencyMinutes: projectConfig?.scheduleFrequencyMinutes ?? getProjectScheduleFrequencyMinutes(settings, companyId, selectedProject?.id),
    defaultAssignee: projectConfig?.defaultAssignee ?? null,
    defaultStatus: projectConfig?.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
    defaultStatusAssigneeAgentId: projectConfig?.defaultStatusAssigneeAgentId ?? null,
    statusMappings: effectiveStatusMappings,
    availableProjects: visibleProjects.map((project) => {
      const projectSettings = getProjectConfig(settings, companyId ?? '', project.id, project.name);
      return {
        id: project.id,
        name: project.name,
        providerId: projectSettings?.providerId ?? null,
        providerDisplayName: providerSummaries.find((provider) => provider.providerId === projectSettings?.providerId)?.displayName ?? null,
        isConfigured: Boolean(projectSettings?.providerId),
        hasImportedIssues: (importedCountsByProjectId[project.id] ?? 0) > 0,
        suggestedUpstreamProjectKeys: getProjectGitHubRepository(project)
          ? { github_issues: getProjectGitHubRepository(project) }
          : undefined
      };
    }),
    configReady: Boolean(projectConfig?.providerId) && (selectedProviderSummary?.ready ?? false),
    configMessage:
      !selectedProject
        ? 'Choose a Paperclip project to configure issue sync.'
        : projectConfig?.providerId
          ? (selectedProviderSummary?.message ?? 'Provider is ready.')
          : 'Select a provider to connect this Paperclip project to an upstream tracker.',
    projectConfig: selectedProject
      ? {
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          providerId: projectConfig?.providerId ?? null,
          agentIssueProviderAccess,
          defaultAssignee: projectConfig?.defaultAssignee ?? null,
          defaultStatus: projectConfig?.defaultStatus ?? DEFAULT_PAPERCLIP_STATUS,
          defaultStatusAssigneeAgentId: projectConfig?.defaultStatusAssigneeAgentId ?? null,
          statusMappings: effectiveStatusMappings,
          scheduleFrequencyMinutes: projectConfig?.scheduleFrequencyMinutes ?? DEFAULT_SYNC_FREQUENCY_MINUTES,
          mappings: selectedMappings,
          suggestedUpstreamProjectKeys: selectedProjectGitHubRepository
            ? { github_issues: selectedProjectGitHubRepository }
            : undefined
        }
      : null,
    projectPage: selectedProject
      ? {
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          selectedProviderId: projectConfig?.providerId ?? null,
          agentIssueProviderAccess,
          suggestedUpstreamProjectKeys: selectedProjectGitHubRepository
            ? { github_issues: selectedProjectGitHubRepository }
            : undefined,
          showProviderSelection: true,
          showHideImported: true,
          showProjectSettings: Boolean(projectConfig?.providerId),
          showSyncActions: Boolean(projectConfig?.providerId),
          navigationContext: {
            surface: entrySurface,
            requiresProjectSelection
          }
        }
      : null,
    providerDirectory: {
      providers: providerSummaries.map((provider) => ({
        providerId: provider.providerId,
        providerType: provider.providerKey,
        displayName: provider.displayName,
        status: provider.status,
        healthLabel: provider.healthLabel,
        healthMessage: provider.healthMessage,
        configSummary: provider.configSummary,
        tokenSaved: provider.tokenSaved
      })),
      availableProviderTypes: providerTypeOptions
    },
    updatedAt: settings.updatedAt
  };
}

export async function buildSettingsRegistrationData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string,
  issueId?: string
): Promise<AnyRecord> {
  return loadSettingsRegistrationData(ctx, companyId, projectId, issueId);
}

export async function buildProjectToolbarStateData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string
): Promise<AnyRecord> {
  if (!companyId || !projectId) {
    return {
      configured: false,
      syncFailed: false,
      providerType: null,
      providerName: null
    };
  }

  const settingsData = await loadSettingsRegistrationData(ctx, companyId, projectId);
  const providerId = normalizeOptionalString(settingsData.selectedProviderId);
  const providerType = normalizeProviderType(settingsData.selectedProviderKey);
  const providerName = Array.isArray(settingsData.providers)
    ? (settingsData.providers as AnyRecord[]).find((provider) => normalizeOptionalString(provider.providerId) === providerId)?.displayName
    : undefined;
  const syncStateRecord =
    settingsData.syncState && typeof settingsData.syncState === 'object'
      ? settingsData.syncState as AnyRecord
      : {};

  return {
    configured: Boolean(providerId) && settingsData.configReady === true,
    syncFailed: normalizeOptionalString(syncStateRecord.status) === 'error',
    syncStatus: normalizeOptionalString(syncStateRecord.status) ?? 'idle',
    providerType,
    providerName: normalizeOptionalString(providerName),
    projectId
  };
}

export async function buildSyncProvidersData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<AnyRecord> {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const providers = await providerConfigResolver.getAvailableProviders(ctx);

  return {
    providers: await Promise.all(providers.map(async (provider) => {
      const config = await providerConfigResolver.getProviderDisplayConfig(ctx, provider.id);
      const configSummary = buildDisplayConfigSummary(config);
      const providerConnectionTest = getConnectionTestStateForCompany(settings, companyId, provider.id);
      const healthStatus =
        providerConnectionTest.status === 'success'
          ? 'connected'
          : providerConnectionTest.status === 'error'
            ? 'degraded'
            : configSummary.ready
              ? 'not_tested'
              : 'needs_config';
      return {
        providerId: provider.id,
        providerKey: provider.type,
        displayName: provider.name,
        status: healthStatus,
        healthLabel:
          healthStatus === 'connected'
            ? 'Connected'
            : healthStatus === 'degraded'
              ? 'Degraded'
              : healthStatus === 'not_tested'
                ? 'Not tested'
                : 'Needs config',
        healthMessage: providerConnectionTest.message,
        configSummary: configSummary.message,
        supportsConnectionTest: true,
        tokenSaved: config.tokenSaved
      };
    }))
  };
}

export async function buildSyncEntryContextData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string,
  issueId?: string
): Promise<AnyRecord> {
  const settingsData = await loadSettingsRegistrationData(ctx, companyId, projectId, issueId);
  return settingsData.entryContext ?? {};
}

export async function buildSyncProjectListData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<AnyRecord> {
  const settingsData = await loadSettingsRegistrationData(ctx, companyId);
  return {
    projects: Array.isArray(settingsData.availableProjects)
      ? settingsData.availableProjects.map((project: AnyRecord) => ({
          projectId: normalizeOptionalString(project.id) ?? '',
          projectName: normalizeOptionalString(project.name) ?? '',
          providerId: normalizeOptionalString(project.providerId) ?? null,
          providerDisplayName: normalizeOptionalString(project.providerDisplayName) ?? null,
          hasImportedIssues: project.hasImportedIssues === true,
          isConfigured: project.isConfigured === true,
          suggestedUpstreamProjectKeys:
            project.suggestedUpstreamProjectKeys && typeof project.suggestedUpstreamProjectKeys === 'object'
              ? project.suggestedUpstreamProjectKeys as Record<string, string>
              : undefined
        }))
      : []
  };
}

export async function buildSyncProjectPageData(
  ctx: PluginSetupContext,
  companyId?: string,
  projectId?: string,
  issueId?: string
): Promise<AnyRecord> {
  const settingsData = await loadSettingsRegistrationData(ctx, companyId, projectId, issueId);
  const projectPage = settingsData.projectPage as AnyRecord | null | undefined;
  return {
    ...(projectPage ?? {}),
    availableProviders: settingsData.providers ?? [],
    providerSummary: settingsData.providerConfig ?? null,
    projectSettings: settingsData.projectConfig ?? null,
    navigationContext: settingsData.entryContext ?? null,
    selectedProviderId: settingsData.selectedProviderId ?? null,
    showProviderSelection: Boolean(projectPage?.showProviderSelection ?? settingsData.selectedProjectId),
    showHideImported: Boolean(projectPage?.showHideImported ?? settingsData.selectedProjectId),
    showProjectSettings: Boolean(projectPage?.showProjectSettings),
    showSyncActions: Boolean(projectPage?.showSyncActions),
    mappings: settingsData.mappings ?? [],
    syncProgress: settingsData.syncState ?? { status: 'idle' },
    connectionTest: settingsData.connectionTest ?? { status: 'idle' }
  };
}

export async function buildProviderDirectoryData(
  ctx: PluginSetupContext,
  companyId?: string
): Promise<AnyRecord> {
  const settingsData = await loadSettingsRegistrationData(ctx, companyId);
  return settingsData.providerDirectory ?? {};
}

export async function buildProviderDetailData(
  ctx: PluginSetupContext,
  companyId?: string,
  providerId?: string
): Promise<AnyRecord> {
  const settings = await loadNormalizedState(ctx, SETTINGS_SCOPE, normalizeSettings);
  const providers = await providerConfigResolver.getAvailableProviders(ctx);
  const selectedProvider = providerId ? providers.find((provider) => provider.id === providerId) ?? null : null;
  const config = selectedProvider ? await providerConfigResolver.getProviderDisplayConfig(ctx, selectedProvider.id) : null;
  const inferredDefaultUpstreamKey = selectedProvider
    ? inferDefaultUpstreamKeyFromMappings(settings, companyId, selectedProvider.id, selectedProvider.type)
    : null;
  const draftProvider =
    selectedProvider
      ? (isJiraProviderType(selectedProvider.type)
          ? {
              id: selectedProvider.id,
              type: selectedProvider.type,
              name: selectedProvider.name,
              jiraBaseUrl: (selectedProvider as JiraDcProviderConfig | JiraCloudProviderConfig).jiraBaseUrl ?? '',
              jiraUserEmail: (selectedProvider as JiraDcProviderConfig | JiraCloudProviderConfig).jiraUserEmail ?? '',
              defaultIssueType: (selectedProvider as JiraDcProviderConfig | JiraCloudProviderConfig).defaultIssueType ?? DEFAULT_ISSUE_TYPE
            }
          : {
              id: selectedProvider.id,
              type: 'github_issues' as const,
              name: selectedProvider.name,
              githubApiBaseUrl: (selectedProvider as GitHubIssuesProviderConfig).githubApiBaseUrl ?? DEFAULT_GITHUB_API_BASE_URL,
              defaultRepository: (selectedProvider as GitHubIssuesProviderConfig).defaultRepository ?? inferredDefaultUpstreamKey ?? ''
            })
      : {
          id: providerId ?? DEFAULT_PROVIDER_ID,
          type: 'jira_dc' as const,
          name: '',
          jiraBaseUrl: '',
          jiraUserEmail: '',
          defaultIssueType: DEFAULT_ISSUE_TYPE
        };
  const draftRecord = draftProvider as AnyRecord;
  const draftName = normalizeOptionalString(draftRecord.name) ?? '';
  const draftJiraBaseUrl = normalizeOptionalString(draftRecord.jiraBaseUrl) ?? '';
  const draftJiraUserEmail = normalizeOptionalString(draftRecord.jiraUserEmail) ?? '';
  const draftDefaultIssueType = normalizeOptionalString(draftRecord.defaultIssueType) ?? DEFAULT_ISSUE_TYPE;
  const draftGitHubApiBaseUrl = normalizeOptionalString(draftRecord.githubApiBaseUrl) ?? DEFAULT_GITHUB_API_BASE_URL;
  const draftDefaultRepository = normalizeOptionalString(draftRecord.defaultRepository) ?? '';
  const connectionTest = selectedProvider ? getConnectionTestStateForCompany(settings, companyId, selectedProvider.id) : { status: 'idle' as const };

  return {
    mode: selectedProvider ? 'edit' : 'create',
    providerId: selectedProvider?.id ?? null,
    providerType: selectedProvider?.type ?? 'jira_dc',
    draft: draftProvider,
    fields: selectedProvider
      ? (isJiraProviderType(selectedProvider.type)
          ? {
              name: draftName,
              jiraBaseUrl: draftJiraBaseUrl,
              jiraUserEmail: draftJiraUserEmail,
              defaultIssueType: draftDefaultIssueType
            }
          : {
              name: draftName,
              githubApiBaseUrl: draftGitHubApiBaseUrl,
              defaultRepository: draftDefaultRepository
            })
      : {
          name: draftName,
          jiraBaseUrl: draftJiraBaseUrl,
          jiraUserEmail: draftJiraUserEmail,
          defaultIssueType: draftDefaultIssueType,
          githubApiBaseUrl: draftGitHubApiBaseUrl,
          defaultRepository: draftDefaultRepository
        },
    tokenSaved: Boolean(config?.tokenSaved),
    healthStatus:
      connectionTest.status === 'success'
        ? 'connected'
        : connectionTest.status === 'error'
          ? 'degraded'
          : config && buildDisplayConfigSummary(config).ready
            ? 'not_tested'
            : 'needs_config',
    healthMessage: connectionTest.message,
    backTarget: companyId ? 'providers' : 'settings',
    availableProviderTypes: buildProviderTypeOptions(providerRegistry.list())
  };
}

export async function buildSyncPopupState(
  ctx: PluginSetupContext,
  companyId?: string,
  providerId?: string,
  projectId?: string,
  issueId?: string
): Promise<AnyRecord> {
  const settingsData = await loadSettingsRegistrationData(ctx, companyId, projectId, issueId);
  const selectedProviderId =
    normalizeOptionalString(providerId)
    ?? normalizeOptionalString(settingsData.selectedProviderId)
    ?? undefined;
  const config = selectedProviderId ? await providerConfigResolver.getProviderDisplayConfig(ctx, selectedProviderId) : null;
  const selectedProviderType = config?.providerType ?? null;

  return {
    ...settingsData,
    selectedProviderId: selectedProviderId ?? null,
    selectedProviderKey: selectedProviderType,
    providerConfig: selectedProviderId
      ? {
          providerKey: selectedProviderType,
          providerId: selectedProviderId,
          providerName: config?.providerName ?? '',
          jiraBaseUrl: config?.baseUrl ?? '',
          jiraUserEmail: config?.userEmail ?? '',
          defaultIssueType: config?.defaultIssueType ?? DEFAULT_ISSUE_TYPE,
          githubApiBaseUrl: config?.githubApiBaseUrl ?? DEFAULT_GITHUB_API_BASE_URL,
          defaultRepository: config?.defaultRepository ?? '',
          tokenSaved: Boolean(config?.tokenSaved)
        }
      : null,
    filters: settingsData.filters ?? {},
    syncProgress: settingsData.syncState ?? { status: 'idle' },
    connectionTest: settingsData.connectionTest ?? { status: 'idle' }
  };
}
