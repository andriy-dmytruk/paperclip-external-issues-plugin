import { useEffect, useState } from 'react';
import { usePluginData, usePluginToast } from '@paperclipai/plugin-sdk/ui';
import {
  DEFAULT_JIRA_ISSUE_TYPE,
  PROVIDER_TYPE_OPTIONS,
  usePluginConfig,
  type JiraPluginConfig,
  type JiraProviderConfig,
  type ProviderType
} from '../../plugin-config.js';
import { isJiraProviderType } from '../../../providers/shared/config.ts';
import type { UpstreamUserReference } from '../../assignees.js';
import { useActionRunner } from '../../hooks.js';
import {
  resolveInitialSyncPage,
  type SyncEntryContext,
  type SyncPageId
} from '../../project-bindings.js';
import {
  createEmptyMappingRow,
  getDefaultStatusMappingRowsForProviderType,
  getProviderProjectLabel,
  getSuggestedUpstreamProjectKey,
  normalizeUpstreamProjectKey
} from '../../primitives.js';
import type {
  AgentIssueProviderAccess,
  AssignableAgent,
  CleanupCandidate,
  ConnectionTestState,
  MappingRow,
  ProjectSettingsTabId,
  StatusMappingRow,
  SyncProgressState,
  TaskFilters
} from '../../types.js';
import {
  buildConfiguredProviders,
  createProviderId,
  createEmptyProviderDraft,
  getProviderToken,
  getProviderTokenRef,
  hideIssuesInPaperclip,
  splitProviderConfigCollections
} from './helpers.js';

type ProjectSummary = {
  projectId: string;
  projectName: string;
  providerId?: string | null;
  providerDisplayName?: string | null;
  hasImportedIssues?: boolean;
  isConfigured?: boolean;
  suggestedUpstreamProjectKeys?: Partial<Record<ProviderType, string>>;
};

type AvailableProviderSummary = {
  providerId: string;
  providerKey: ProviderType;
  displayName: string;
  status: string;
  healthLabel?: string;
  healthMessage?: string;
  configSummary?: string;
  supportsConnectionTest?: boolean;
  defaultIssueType?: string;
  tokenSaved?: boolean;
};

type PersistedMapping = {
  id: string;
  providerId?: string;
  enabled?: boolean;
  jiraProjectKey: string;
  jiraJql?: string;
  paperclipProjectId?: string;
  paperclipProjectName: string;
  filters?: TaskFilters;
};

type ProjectSettingsData = {
  projectId: string;
  projectName: string;
  providerId?: string | null;
  agentIssueProviderAccess?: AgentIssueProviderAccess;
  defaultAssignee?: UpstreamUserReference | null;
  defaultStatus?: string;
  defaultStatusAssigneeAgentId?: string | null;
  statusMappings?: StatusMappingRow[];
  scheduleFrequencyMinutes?: number;
  mappings?: PersistedMapping[];
  suggestedUpstreamProjectKeys?: Partial<Record<ProviderType, string>>;
};

type ProjectPageData = {
  projectId: string;
  projectName: string;
  selectedProviderId?: string | null;
  showProviderSelection?: boolean;
  showHideImported?: boolean;
  showProjectSettings?: boolean;
  showSyncActions?: boolean;
  availableProviders?: AvailableProviderSummary[];
  providerSummary?: {
    providerId?: string | null;
    providerKey?: ProviderType | null;
    providerName?: string;
    jiraBaseUrl?: string;
    jiraUserEmail?: string;
    defaultIssueType?: string;
    githubApiBaseUrl?: string;
    defaultRepository?: string;
    tokenSaved?: boolean;
  } | null;
  projectSettings?: ProjectSettingsData | null;
  navigationContext?: SyncEntryContext | null;
  suggestedUpstreamProjectKeys?: Partial<Record<ProviderType, string>>;
  mappings: PersistedMapping[];
  syncProgress?: SyncProgressState;
  connectionTest?: ConnectionTestState;
};

type ProviderDirectoryData = {
  providers: Array<{
    providerId: string;
    providerType: ProviderType;
    displayName: string;
    status?: string;
    healthLabel?: string;
    healthMessage?: string;
    configSummary?: string;
    tokenSaved?: boolean;
  }>;
  availableProviderTypes?: Array<{
    value: ProviderType;
    label: string;
  }>;
};

type ProviderDetailData = {
  mode: 'create' | 'edit';
  providerId?: string | null;
  providerType?: ProviderType;
  draft?: JiraProviderConfig;
  fields?: {
    name?: string;
    jiraBaseUrl?: string;
    jiraUserEmail?: string;
    defaultIssueType?: string;
    githubApiBaseUrl?: string;
    defaultRepository?: string;
  };
  tokenSaved?: boolean;
  healthStatus?: string;
  healthMessage?: string;
  backTarget?: string;
  availableProviderTypes?: Array<{
    value: ProviderType;
    label: string;
  }>;
};

export function useSyncCenterController(props: {
  companyId: string;
  scopeProjectId?: string;
  scopeIssueId?: string;
  embeddedTitle?: string;
  modal?: boolean;
  settingsOnly?: boolean;
}) {
  const companyId = props.companyId;
  const toast = usePluginToast();
  const entryContext = usePluginData<SyncEntryContext>('sync.entryContext', {
    companyId,
    projectId: props.scopeProjectId,
    issueId: props.scopeIssueId
  });
  const projectList = usePluginData<{ projects: ProjectSummary[] }>('sync.projectList', { companyId });
  const [selectedProjectId, setSelectedProjectId] = useState<string>(props.scopeProjectId ?? '');
  const [currentPage, setCurrentPage] = useState<SyncPageId | undefined>(
    props.settingsOnly ? 'providers' : props.scopeProjectId ? 'project' : undefined
  );
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedProviderDetailId, setSelectedProviderDetailId] = useState<string | null>(null);
  const activeProjectId = props.scopeProjectId ?? selectedProjectId;
  const projectPage = usePluginData<ProjectPageData>('sync.projectPage', {
    companyId,
    projectId: activeProjectId || undefined,
    issueId: props.scopeIssueId
  });
  const providerDirectory = usePluginData<ProviderDirectoryData>('settings.providerDirectory', { companyId });
  const providerDetail = usePluginData<ProviderDetailData>('settings.providerDetail', {
    companyId,
    providerId: selectedProviderDetailId ?? undefined
  });
  const assignableAgentsData = usePluginData<{ agents: AssignableAgent[] }>('sync.assignableAgents', { companyId });
  const saveProject = useActionRunner<{
    companyId: string;
    projectId?: string;
    projectName?: string;
    providerId?: string | null;
    agentIssueProviderAccess?: AgentIssueProviderAccess;
    defaultAssignee?: UpstreamUserReference | null;
    defaultStatus?: string;
    defaultStatusAssigneeAgentId?: string | null;
    statusMappings?: Array<{
      jiraStatus: string;
      paperclipStatus: string;
      assigneeAgentId?: string | null;
    }>;
    scheduleFrequencyMinutes: number;
    mappings: Array<{
      id?: string;
      providerId?: string;
      enabled?: boolean;
      jiraProjectKey: string;
      jiraJql?: string;
      paperclipProjectId?: string;
      paperclipProjectName: string;
      filters?: TaskFilters;
    }>;
  }>('sync.project.save');
  const testConnection = useActionRunner<{
    companyId: string;
    projectId?: string;
    providerId?: string;
    providerKey?: ProviderType;
    config: JiraProviderConfig;
  }>('sync.provider.testConnection');
  const refreshIdentity = useActionRunner<{
    companyId: string;
    projectId: string;
    providerId: string;
  }>('sync.project.refreshIdentity');
  const runSync = useActionRunner<{
    companyId: string;
    providerKey?: ProviderType;
    projectId?: string;
    issueId?: string;
  }>('sync.runNow');
  const cleanupCandidates = useActionRunner<{ companyId: string; projectId?: string }>('sync.findCleanupCandidates');
  const cleanupImportedIssues = useActionRunner<{ companyId: string; issueIds: string[] }>('sync.cleanupImportedIssues');
  const { configJson, saving: configSaving, error: configError, save } = usePluginConfig();
  const [scheduleFrequencyMinutes, setScheduleFrequencyMinutes] = useState(15);
  const [defaultAssignee, setDefaultAssignee] = useState<UpstreamUserReference | null>(null);
  const [defaultProjectKey, setDefaultProjectKey] = useState('');
  const [defaultMappingEnabled, setDefaultMappingEnabled] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [defaultStatusAssigneeAgentId, setDefaultStatusAssigneeAgentId] = useState('');
  const [statusMappings, setStatusMappings] = useState<StatusMappingRow[]>([]);
  const [agentIssueProviderAccessEnabled, setAgentIssueProviderAccessEnabled] = useState(false);
  const [allowedAgentIds, setAllowedAgentIds] = useState<string[]>([]);
  const [rows, setRows] = useState<MappingRow[]>([]);
  const [rowsDirty, setRowsDirty] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState<ProjectSettingsTabId>('essential');
  const [draftTokensByProviderId, setDraftTokensByProviderId] = useState<Record<string, string>>({});
  const [providerDraft, setProviderDraft] = useState<JiraProviderConfig | null>(null);
  const [providerDraftToken, setProviderDraftToken] = useState('');
  const [providerDraftSourceKey, setProviderDraftSourceKey] = useState<string | null>(null);
  const [newProviderType, setNewProviderType] = useState<ProviderType>(PROVIDER_TYPE_OPTIONS[0]);
  const [mappingModal, setMappingModal] = useState<{
    mode: 'create' | 'edit';
    draft: MappingRow;
  } | null>(null);
  const [cleanupModal, setCleanupModal] = useState<{
    mode: 'all' | 'status' | 'custom';
    status: string;
    customFilter: string;
    candidates: CleanupCandidate[];
    selectedIssueIds: string[];
  } | null>(null);
  const [localResult, setLocalResult] = useState<{ message: string; tone: 'default' | 'success' | 'error' } | null>(null);
  const configuredProviders = buildConfiguredProviders(configJson);
  const activeProject = projectList.data?.projects?.find((project) => project.projectId === activeProjectId);
  const selectedProvider = configuredProviders.find((provider) => provider.id === selectedProviderId) ?? null;
  const selectedProviderToken = selectedProvider ? draftTokensByProviderId[selectedProvider.id] ?? '' : '';
  const selectedProviderStatus = projectPage.data?.availableProviders?.find((provider) => provider.providerId === selectedProvider?.id) ?? null;
  const providerEnabled = Boolean(selectedProviderId && selectedProvider);
  const assignableAgents = assignableAgentsData.data?.agents ?? [];
  const assignableAgentsError = assignableAgentsData.error?.message ?? null;
  const visibleCleanupCandidates = cleanupModal
    ? cleanupModal.candidates.filter((candidate) => {
        if (cleanupModal.mode === 'all') {
          return true;
        }
        if (cleanupModal.mode === 'status') {
          return candidate.status === cleanupModal.status;
        }
        const term = cleanupModal.customFilter.trim().toLowerCase();
        if (!term) {
          return true;
        }
        return `${candidate.jiraIssueKey} ${candidate.title} ${candidate.status}`.toLowerCase().includes(term);
      })
    : [];

  useEffect(() => {
    const nextSelectedProjectId = props.scopeProjectId ?? entryContext.data?.projectId ?? '';
    if (nextSelectedProjectId && nextSelectedProjectId !== selectedProjectId) {
      setSelectedProjectId(nextSelectedProjectId);
    }
  }, [entryContext.data?.projectId, props.scopeProjectId, selectedProjectId]);

  useEffect(() => {
    if (currentPage) {
      return;
    }

    if (entryContext.data) {
      setCurrentPage(props.settingsOnly ? 'providers' : resolveInitialSyncPage(entryContext.data));
    }
  }, [currentPage, entryContext.data, props.settingsOnly]);

  useEffect(() => {
    const nextSelectedProviderId = projectPage.data?.selectedProviderId ?? '';
    if (nextSelectedProviderId !== selectedProviderId) {
      setSelectedProviderId(nextSelectedProviderId);
    }
  }, [projectPage.data?.selectedProviderId, selectedProviderId]);

  useEffect(() => {
    const nextProjectPage = projectPage.data;
    if (!nextProjectPage) {
      return;
    }

    setScheduleFrequencyMinutes(nextProjectPage.projectSettings?.scheduleFrequencyMinutes ?? 15);
    setDefaultAssignee(nextProjectPage.projectSettings?.defaultAssignee ?? null);
    setDefaultProjectKey(
      nextProjectPage.projectSettings?.mappings?.[0]?.jiraProjectKey
      ?? nextProjectPage.mappings?.[0]?.jiraProjectKey
      ?? getSuggestedUpstreamProjectKey(selectedProvider?.type, nextProjectPage)
      ?? getSuggestedUpstreamProjectKey(selectedProvider?.type, activeProject)
      ?? ''
    );
    setDefaultMappingEnabled(
      nextProjectPage.projectSettings?.mappings?.[0]?.enabled
      ?? nextProjectPage.mappings?.[0]?.enabled
      ?? true
    );
    setDefaultStatus(nextProjectPage.projectSettings?.defaultStatus ?? 'todo');
    setDefaultStatusAssigneeAgentId(nextProjectPage.projectSettings?.defaultStatusAssigneeAgentId ?? '');
    setAgentIssueProviderAccessEnabled(nextProjectPage.projectSettings?.agentIssueProviderAccess?.enabled ?? false);
    setAllowedAgentIds(nextProjectPage.projectSettings?.agentIssueProviderAccess?.allowedAgentIds ?? []);
    setStatusMappings(
      (nextProjectPage.projectSettings?.statusMappings ?? []).map((mapping, index) => ({
        id: mapping.id ?? `status-mapping-${index + 1}`,
        jiraStatus: mapping.jiraStatus ?? '',
        paperclipStatus: mapping.paperclipStatus ?? 'todo',
        assigneeAgentId: mapping.assigneeAgentId ?? ''
      }))
    );
    setRows(
      nextProjectPage.mappings.length > 1
        ? nextProjectPage.mappings.slice(1).map((mapping) => ({
            id: mapping.id,
            providerId: mapping.providerId ?? (nextProjectPage.selectedProviderId ?? ''),
            enabled: mapping.enabled !== false,
            jiraProjectKey: mapping.jiraProjectKey,
            jiraJql: mapping.jiraJql ?? '',
            paperclipProjectId: mapping.paperclipProjectId ?? '',
            paperclipProjectName: mapping.paperclipProjectName,
            filters: {
              onlyActive: mapping.filters?.onlyActive ?? true,
              author: mapping.filters?.author ?? undefined,
              assignee: mapping.filters?.assignee ?? undefined,
              issueNumberGreaterThan: mapping.filters?.issueNumberGreaterThan,
              issueNumberLessThan: mapping.filters?.issueNumberLessThan
            }
          }))
        : []
    );
    setRowsDirty(false);
  }, [activeProject, projectPage.data, selectedProvider?.type]);

  useEffect(() => {
    if (currentPage !== 'provider-detail') {
      return;
    }

    if (selectedProviderDetailId) {
      const detailDraft = providerDetail.data?.draft;
      const detailMatches = providerDetail.data?.providerId === selectedProviderDetailId;
      if (!detailDraft || !detailMatches) {
        return;
      }

      const nextSourceKey = `edit:${selectedProviderDetailId}`;
      if (providerDraftSourceKey === nextSourceKey && providerDraft) {
        return;
      }

      setProviderDraft({
        ...detailDraft,
        id: detailDraft.id || selectedProviderDetailId,
        type: detailDraft.type ?? providerDetail.data?.providerType ?? 'jira_dc',
        name: detailDraft.name ?? ''
      });
      setProviderDraftToken('');
      setProviderDraftSourceKey(nextSourceKey);
      return;
    }

    const nextSourceKey = `new:${newProviderType}`;
    if (providerDraftSourceKey === nextSourceKey && providerDraft) {
      return;
    }
    setProviderDraft(createEmptyProviderDraft(newProviderType));
    setProviderDraftToken('');
    setProviderDraftSourceKey(nextSourceKey);
  }, [currentPage, newProviderType, providerDetail.data, providerDraft, providerDraftSourceKey, selectedProviderDetailId]);

  function openCreateMappingModal() {
    if (!activeProjectId) {
      setLocalResult({
        message: 'Choose a Paperclip project before adding mappings.',
        tone: 'error'
      });
      return;
    }
    setMappingModal({
      mode: 'create',
      draft: {
        ...createEmptyMappingRow(selectedProvider?.id ?? '', defaultAssignee),
        jiraProjectKey: defaultProjectKey
          || getSuggestedUpstreamProjectKey(selectedProvider?.type, projectPage.data)
          || getSuggestedUpstreamProjectKey(selectedProvider?.type, activeProject),
        paperclipProjectId: activeProjectId,
        paperclipProjectName: activeProject?.projectName ?? projectPage.data?.projectName ?? ''
      }
    });
  }

  function openEditMappingModal(rowId: string) {
    const row = rows.find((entry) => entry.id === rowId);
    if (!row) {
      return;
    }

    setMappingModal({
      mode: 'edit',
      draft: {
        ...row,
        filters: { ...row.filters }
      }
    });
  }

  function saveMappingModal() {
    if (!mappingModal) {
      return;
    }

    const nextRow: MappingRow = {
      ...mappingModal.draft,
      enabled: mappingModal.draft.enabled !== false,
      jiraProjectKey: normalizeUpstreamProjectKey(mappingModal.draft.jiraProjectKey, selectedProvider?.type),
      jiraJql: mappingModal.draft.jiraJql,
      paperclipProjectId: activeProjectId,
      paperclipProjectName: activeProject?.projectName ?? projectPage.data?.projectName ?? mappingModal.draft.paperclipProjectName,
      filters: { ...mappingModal.draft.filters }
    };

    setRows((current) => (
      mappingModal.mode === 'create'
        ? [...current, nextRow]
        : current.map((row) => row.id === nextRow.id ? nextRow : row)
    ));
    setRowsDirty(true);
    setMappingModal(null);
  }

  async function refreshSyncData() {
    await Promise.all([
      entryContext.refresh(),
      projectList.refresh(),
      projectPage.refresh(),
      providerDirectory.refresh(),
      providerDetail.refresh()
    ]);
  }

  async function persistProjectSettings(
    nextProviderId?: string | null,
    options?: {
      allowEmptyDefaultProjectKey?: boolean;
      resetProviderSpecificSettings?: boolean;
    }
  ): Promise<boolean> {
    if (!activeProjectId || !activeProject?.projectName) {
      setLocalResult({
        message: 'Choose a Paperclip project before saving sync settings.',
        tone: 'error'
      });
      return false;
    }
    const effectiveProviderId = nextProviderId !== undefined ? nextProviderId : (selectedProvider?.id ?? null);
    const effectiveProvider = configuredProviders.find((provider) => provider.id === effectiveProviderId) ?? selectedProvider;
    if (effectiveProviderId && !defaultProjectKey.trim() && !options?.allowEmptyDefaultProjectKey) {
      setLocalResult({
        message: `${getProviderProjectLabel(effectiveProvider?.type)} is required before saving project sync settings.`,
        tone: 'error'
      });
      setActiveProjectTab('essential');
      return false;
    }

    const persistedMappings = projectPage.data?.mappings ?? [];
    const persistedSelectedProviderId = projectPage.data?.selectedProviderId ?? '';
    const shouldResetProviderSpecificSettings = Boolean(options?.resetProviderSpecificSettings);
    const effectiveDefaultAssignee = shouldResetProviderSpecificSettings ? null : defaultAssignee;
    const effectiveDefaultStatusAssigneeAgentId = shouldResetProviderSpecificSettings ? '' : defaultStatusAssigneeAgentId;
    const effectiveStatusMappings = shouldResetProviderSpecificSettings
      ? getDefaultStatusMappingRowsForProviderType(effectiveProvider?.type)
      : statusMappings;
    const effectiveRowsFromState = shouldResetProviderSpecificSettings ? [] : rows;
    const persistedAdditionalRows = persistedMappings.slice(1);
    const effectiveAdditionalRows = !rowsDirty && effectiveRowsFromState.length === 0 && persistedAdditionalRows.length > 0
      ? persistedAdditionalRows.map((mapping) => ({
          id: mapping.id,
          providerId: mapping.providerId ?? persistedSelectedProviderId,
          enabled: mapping.enabled !== false,
          jiraProjectKey: mapping.jiraProjectKey,
          jiraJql: mapping.jiraJql ?? '',
          paperclipProjectId: mapping.paperclipProjectId ?? activeProjectId,
          paperclipProjectName: mapping.paperclipProjectName || activeProject.projectName,
          filters: {
            onlyActive: mapping.filters?.onlyActive ?? true,
            author: mapping.filters?.author ?? undefined,
            assignee: mapping.filters?.assignee ?? undefined,
            issueNumberGreaterThan: mapping.filters?.issueNumberGreaterThan,
            issueNumberLessThan: mapping.filters?.issueNumberLessThan
          }
        }))
      : effectiveRowsFromState;
    const defaultMappingId = persistedMappings[0]?.id ?? 'mapping-1';
    const defaultMapping: MappingRow | null = effectiveProviderId && defaultProjectKey.trim()
      ? {
          id: defaultMappingId,
          providerId: effectiveProviderId,
          enabled: defaultMappingEnabled,
          jiraProjectKey: normalizeUpstreamProjectKey(defaultProjectKey, effectiveProvider?.type),
          jiraJql: '',
          paperclipProjectId: activeProjectId,
          paperclipProjectName: activeProject.projectName,
          filters: {
            onlyActive: true,
            ...(effectiveDefaultAssignee ? { assignee: effectiveDefaultAssignee } : {})
          }
        }
      : null;
    const effectiveRows = [
      ...(defaultMapping ? [defaultMapping] : []),
      ...effectiveAdditionalRows
    ];

    try {
      await saveProject.run({
        companyId,
        projectId: activeProjectId,
        projectName: activeProject.projectName,
        providerId: effectiveProviderId,
        agentIssueProviderAccess: {
          enabled: agentIssueProviderAccessEnabled,
          allowedAgentIds
        },
        defaultAssignee: effectiveDefaultAssignee,
        defaultStatus,
        defaultStatusAssigneeAgentId: effectiveDefaultStatusAssigneeAgentId || null,
        statusMappings: effectiveStatusMappings
          .filter((row) => row.jiraStatus.trim())
          .map((row) => ({
            jiraStatus: row.jiraStatus.trim(),
            paperclipStatus: row.paperclipStatus,
            assigneeAgentId: row.assigneeAgentId || null
          })),
        scheduleFrequencyMinutes,
        mappings: effectiveRows
          .filter((row) => row.jiraProjectKey.trim())
          .map((row) => ({
            id: row.id,
            providerId: effectiveProvider?.id ?? row.providerId.trim(),
            enabled: row.enabled !== false,
            jiraProjectKey: normalizeUpstreamProjectKey(row.jiraProjectKey, effectiveProvider?.type),
            jiraJql: row.jiraJql.trim() || undefined,
            paperclipProjectId: activeProjectId,
            paperclipProjectName: activeProject.projectName,
            filters: {
              ...(row.filters.onlyActive ? { onlyActive: true } : {}),
              ...(row.filters.author ? { author: row.filters.author } : {}),
              ...(row.filters.assignee ? { assignee: row.filters.assignee } : {}),
              ...(typeof row.filters.issueNumberGreaterThan === 'number' ? { issueNumberGreaterThan: row.filters.issueNumberGreaterThan } : {}),
              ...(typeof row.filters.issueNumberLessThan === 'number' ? { issueNumberLessThan: row.filters.issueNumberLessThan } : {})
            }
          }))
      });
      setLocalResult({
        message: 'Saved project sync settings.',
        tone: 'success'
      });
      setRowsDirty(false);
      await refreshSyncData();
      return true;
    } catch (error) {
      setLocalResult({
        message: error instanceof Error ? error.message : 'Could not save project sync settings.',
        tone: 'error'
      });
      return false;
    }
  }

  async function handleProviderSelection(nextProviderId: string) {
    const previousProvider = configuredProviders.find((provider) => provider.id === selectedProviderId) ?? null;
    const nextProvider = configuredProviders.find((provider) => provider.id === nextProviderId) ?? null;
    const providerTypeChanged = Boolean(
      previousProvider
      && nextProvider
      && previousProvider.type !== nextProvider.type
    );
    const nextDefaultProjectKey = defaultProjectKey.trim()
      || getSuggestedUpstreamProjectKey(nextProvider?.type, projectPage.data)
      || getSuggestedUpstreamProjectKey(nextProvider?.type, activeProject);
    setSelectedProviderId(nextProviderId);
    if (providerTypeChanged) {
      setDefaultAssignee(null);
      setDefaultStatus('todo');
      setDefaultStatusAssigneeAgentId('');
      setStatusMappings(getDefaultStatusMappingRowsForProviderType(nextProvider?.type));
      setRows([]);
      setRowsDirty(true);
    }
    if (!defaultProjectKey.trim() && nextDefaultProjectKey) {
      setDefaultProjectKey(nextDefaultProjectKey);
    }
    if (!activeProjectId || !activeProject) {
      return;
    }
    await persistProjectSettings(nextProviderId || null, {
      allowEmptyDefaultProjectKey: true,
      resetProviderSpecificSettings: providerTypeChanged
    });
  }

  async function handleDisableSync() {
    if (!activeProjectId || !activeProject) {
      return;
    }

    setSelectedProviderId('');
    const saved = await persistProjectSettings(null);
    if (!saved) {
      return;
    }
    setLocalResult({
      message: 'Syncing is disabled for this project.',
      tone: 'success'
    });
  }

  async function handleSaveProviderDefinition() {
    if (!providerDraft) {
      return;
    }

    const nextProvider: JiraProviderConfig = {
      ...providerDraft,
      id: providerDraft.id || createProviderId(),
      type: providerDraft.type ?? 'jira_dc',
      name: providerDraft.name.trim()
    };
    if (isJiraProviderType(nextProvider.type)) {
      Object.assign(nextProvider, {
        jiraBaseUrl: providerDraft.jiraBaseUrl?.trim() || undefined,
        jiraUserEmail: providerDraft.jiraUserEmail?.trim() || undefined,
        defaultIssueType: providerDraft.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE
      });
    } else {
      Object.assign(nextProvider, {
        githubApiBaseUrl: providerDraft.githubApiBaseUrl?.trim() || undefined,
        defaultRepository: providerDraft.defaultRepository?.trim() || undefined
      });
    }
    if (!nextProvider.name) {
      setLocalResult({
        message: 'Provider name is required.',
        tone: 'error'
      });
      return;
    }

    const existingProvider = configuredProviders.find((entry) => entry.id === nextProvider.id);
    const replacementToken = providerDraftToken.trim();
    const tokenRef = getProviderTokenRef(existingProvider)?.trim() || undefined;
    const nextProviders = [
      ...configuredProviders.filter((provider) => provider.id !== nextProvider.id),
      {
        ...nextProvider,
        ...(replacementToken
          ? (isJiraProviderType(nextProvider.type)
              ? { jiraToken: replacementToken, jiraTokenRef: undefined }
              : { githubToken: replacementToken, githubTokenRef: undefined })
          : tokenRef
            ? (isJiraProviderType(nextProvider.type) ? { jiraTokenRef: tokenRef } : { githubTokenRef: tokenRef })
            : getProviderToken(existingProvider)
              ? (isJiraProviderType(nextProvider.type)
                  ? { jiraToken: getProviderToken(existingProvider) }
                  : { githubToken: getProviderToken(existingProvider) })
              : {})
      }
    ];

    const nextConfig: JiraPluginConfig = {
      ...configJson,
      ...splitProviderConfigCollections(nextProviders)
    };

    try {
      await save(nextConfig);
      setDraftTokensByProviderId((current) => {
        if (!replacementToken) {
          return current;
        }
        return {
          ...current,
          [nextProvider.id]: replacementToken
        };
      });
      setSelectedProviderDetailId(nextProvider.id);
      setLocalResult({
        message: `Saved ${nextProvider.name}.`,
        tone: 'success'
      });
      await refreshSyncData();
      setCurrentPage('providers');
    } catch (error) {
      setLocalResult({
        message: error instanceof Error ? error.message : 'Could not save provider.',
        tone: 'error'
      });
    }
  }

  async function handleDeleteProviderDefinition() {
    if (!providerDraft) {
      return;
    }

    const nextConfig: JiraPluginConfig = {
      ...configJson,
      ...splitProviderConfigCollections(configuredProviders.filter((provider) => provider.id !== providerDraft.id))
    };

    try {
      await save(nextConfig);
      setDraftTokensByProviderId((current) => {
        const next = { ...current };
        delete next[providerDraft.id];
        return next;
      });
      if (selectedProviderId === providerDraft.id) {
        setSelectedProviderId('');
        if (activeProjectId && activeProject) {
          await persistProjectSettings(null);
        }
      }
      setLocalResult({
        message: 'Removed provider.',
        tone: 'success'
      });
      setSelectedProviderDetailId(null);
      setCurrentPage('providers');
      await refreshSyncData();
    } catch (error) {
      setLocalResult({
        message: error instanceof Error ? error.message : 'Could not remove provider.',
        tone: 'error'
      });
    }
  }

  async function handleRunSync() {
    const saved = await persistProjectSettings();
    if (!saved || !activeProjectId) {
      return;
    }
    await runSync.run({
      companyId,
      projectId: activeProjectId,
      ...(selectedProvider?.type ? { providerKey: selectedProvider.type } : {}),
      ...(props.scopeIssueId ? { issueId: props.scopeIssueId } : {})
    });
    await refreshSyncData();
  }

  async function handleCleanup() {
    if (!activeProjectId) {
      return;
    }
    const result = await cleanupCandidates.run({ companyId, projectId: activeProjectId }) as {
      candidates?: CleanupCandidate[];
      count?: number;
      message?: string;
    };
    const candidates = result.candidates ?? [];
    setCleanupModal({
      mode: 'all',
      status: 'backlog',
      customFilter: '',
      candidates,
      selectedIssueIds: candidates.map((candidate) => candidate.issueId)
    });
  }

  async function applyCleanupSelection() {
    if (!cleanupModal) {
      return;
    }

    const selectedIssueIds = cleanupModal.selectedIssueIds;
    const nativeHideFailures = await hideIssuesInPaperclip(selectedIssueIds);

    await cleanupImportedIssues.run({
      companyId,
      issueIds: selectedIssueIds
    });

    const message = nativeHideFailures.length === 0
      ? `Hid ${selectedIssueIds.length} imported issue${selectedIssueIds.length === 1 ? '' : 's'} in Paperclip.`
      : `Hidden ${selectedIssueIds.length} imported issue${selectedIssueIds.length === 1 ? '' : 's'} from sync. ${nativeHideFailures.length} could not be hidden in Paperclip UI.`;
    setCleanupModal(null);
    setLocalResult({
      message,
      tone: nativeHideFailures.length === 0 ? 'success' : 'error'
    });
    toast({
      title: 'External Issue Sync',
      body: message,
      tone: nativeHideFailures.length === 0 ? 'success' : 'error'
    });
    await refreshSyncData();
  }

  function openProject(projectId: string) {
    setSelectedProjectId(projectId);
    setCurrentPage('project');
  }

  function openProviderDirectoryPage() {
    setProviderDraft(null);
    setSelectedProviderDetailId(null);
    setCurrentPage('providers');
  }

  function openCreateProviderPage() {
    setProviderDraft(createEmptyProviderDraft(newProviderType));
    setProviderDraftToken('');
    setProviderDraftSourceKey(`new:${newProviderType}`);
    setSelectedProviderDetailId(null);
    setCurrentPage('provider-detail');
  }

  function openProviderDetailPage(providerId?: string) {
    if (providerId) {
      setProviderDraft(null);
    }
    setProviderDraftSourceKey(null);
    setSelectedProviderDetailId(providerId ?? null);
    setCurrentPage('provider-detail');
  }

  const headerTitle =
    currentPage === 'projects'
      ? (props.embeddedTitle ?? 'External Issue Sync')
      : currentPage === 'project'
        ? (projectPage.data?.projectName ?? activeProject?.projectName ?? 'Project Sync')
        : currentPage === 'providers'
          ? (props.embeddedTitle ?? 'Providers')
          : providerDetail.data?.mode === 'edit'
            ? 'Edit Provider'
            : 'New Provider';
  const headerSubtitle =
    currentPage === 'projects'
      ? 'Choose a Paperclip project first, then configure sync inside that dedicated project page.'
      : currentPage === 'project'
        ? 'Provider selection comes first. Project-specific sync settings appear only after a provider is chosen.'
        : currentPage === 'providers'
          ? 'Manage reusable upstream providers separately from individual project sync settings.'
          : 'Use the same modal shell with Back navigation instead of stacking nested popups.';
  const projectBottomMessage =
    currentPage === 'project'
      ? (
          localResult?.message
          || saveProject.message
          || runSync.message
          || cleanupCandidates.message
          || (projectPage.data?.syncProgress?.status === 'error' ? projectPage.data?.syncProgress?.message : null)
        )
      : null;
  const projectBottomMessageTone: 'default' | 'success' | 'error' =
    currentPage === 'project'
      ? (
          localResult?.tone === 'error'
          || saveProject.tone === 'error'
          || runSync.tone === 'error'
          || cleanupCandidates.tone === 'error'
          || projectPage.data?.syncProgress?.status === 'error'
            ? 'error'
            : localResult?.tone === 'success'
              || saveProject.tone === 'success'
              || runSync.tone === 'success'
              || cleanupCandidates.tone === 'success'
              ? 'success'
              : 'default'
        )
      : 'default';
  const message =
    configError
    || refreshIdentity.message
    || (testConnection.tone === 'error' ? testConnection.message : null)
    || (projectPage.data?.connectionTest?.status === 'error' ? projectPage.data?.connectionTest?.message : null)
    || (currentPage !== 'project'
      ? (localResult?.message || saveProject.message || runSync.message || cleanupCandidates.message)
      : null);
  const messageTone: 'default' | 'success' | 'error' =
    configError
    || localResult?.tone === 'error'
    || saveProject.tone === 'error'
    || testConnection.tone === 'error'
    || refreshIdentity.tone === 'error'
    || runSync.tone === 'error'
    || cleanupCandidates.tone === 'error'
    || projectPage.data?.connectionTest?.status === 'error'
      ? 'error'
      : localResult?.tone === 'success'
        || saveProject.tone === 'success'
        || testConnection.tone === 'success'
        || refreshIdentity.tone === 'success'
        || runSync.tone === 'success'
        || cleanupCandidates.tone === 'success'
        || projectPage.data?.connectionTest?.status === 'success'
          ? 'success'
          : 'default';

  return {
    companyId,
    entryContext,
    projectList,
    projectPage,
    providerDirectory,
    providerDetail,
    assignableAgentsData,
    saveProject,
    testConnection,
    refreshIdentity,
    runSync,
    cleanupCandidates,
    configSaving,
    configError,
    selectedProjectId,
    setSelectedProjectId,
    currentPage,
    setCurrentPage,
    selectedProviderId,
    setSelectedProviderId,
    selectedProviderDetailId,
    setSelectedProviderDetailId,
    activeProjectId,
    activeProject,
    configuredProviders,
    selectedProvider,
    selectedProviderStatus,
    providerEnabled,
    assignableAgents,
    assignableAgentsError,
    scheduleFrequencyMinutes,
    setScheduleFrequencyMinutes,
    defaultAssignee,
    setDefaultAssignee,
    defaultProjectKey,
    setDefaultProjectKey,
    defaultMappingEnabled,
    setDefaultMappingEnabled,
    defaultStatus,
    setDefaultStatus,
    defaultStatusAssigneeAgentId,
    setDefaultStatusAssigneeAgentId,
    statusMappings,
    setStatusMappings,
    agentIssueProviderAccessEnabled,
    setAgentIssueProviderAccessEnabled,
    allowedAgentIds,
    setAllowedAgentIds,
    rows,
    setRows,
    rowsDirty,
    setRowsDirty,
    activeProjectTab,
    setActiveProjectTab,
    providerDraft,
    setProviderDraft,
    providerDraftToken,
    setProviderDraftToken,
    newProviderType,
    setNewProviderType,
    mappingModal,
    setMappingModal,
    cleanupModal,
    setCleanupModal,
    localResult,
    visibleCleanupCandidates,
    headerTitle,
    headerSubtitle,
    projectBottomMessage,
    projectBottomMessageTone,
    message,
    messageTone,
    refreshSyncData,
    persistProjectSettings,
    handleProviderSelection,
    handleDisableSync,
    handleSaveProviderDefinition,
    handleDeleteProviderDefinition,
    handleRunSync,
    handleCleanup,
    applyCleanupSelection,
    openProject,
    openProviderDirectoryPage,
    openCreateProviderPage,
    openProviderDetailPage,
    openCreateMappingModal,
    openEditMappingModal,
    saveMappingModal
  };
}
