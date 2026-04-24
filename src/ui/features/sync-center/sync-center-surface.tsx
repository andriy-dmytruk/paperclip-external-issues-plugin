import React from 'react';
import {
  buildProjectPageNavigationTarget,
  buildProviderDetailNavigationTarget,
  resolveInitialSyncPage
} from '../../project-bindings.js';
import { ProviderDetailSection, ProviderDirectorySection } from '../provider-config/provider-pages.js';
import { ProjectProviderSelectionSection } from '../project-config/provider-selection-section.js';
import { ProjectSyncActionsSection, ProviderDisabledCleanupSection } from '../sync/sync-action-sections.js';
import { ResultMessage, SyncProgressPanel } from '../shared/shared-controls.js';
import { getProviderTypeLabel } from '../../plugin-config.js';
import {
  badgeStyle,
  buttonLabel,
  buttonStyle,
  cardStyle,
  inputStyle,
  pageCardStyle,
  providerLabel,
  rowStyle,
  sectionCardStyle,
  stackStyle
} from '../../primitives.js';
import {
  healthBadgeStyle,
  neutralBadgeStyle,
  shouldShowProviderHealthMessage,
  tabButtonStyle,
  tabListStyle
} from '../shared/feature-primitives.js';
import { formatProviderHealthLabel, createEmptyProviderDraft } from './helpers.js';
import { MappingModal } from './components/mapping-modal.js';
import { CleanupModal } from './components/cleanup-modal.js';
import { EssentialTab } from './tabs/essential-tab.js';
import { AgentAccessTab } from './tabs/agent-access-tab.js';
import { MappingsTab } from './tabs/mappings-tab.js';
import { StatusMappingTab } from './tabs/status-mapping-tab.js';
import { useSyncCenterController } from './use-sync-center-controller.js';
import type { ProjectSettingsTabId } from '../../types.js';
import type { JiraProviderConfig, ProviderType } from '../../plugin-config.js';
import type { UpstreamUserReference } from '../../assignees.js';

const PROJECT_TABS: Array<{ id: ProjectSettingsTabId; label: string }> = [
  { id: 'essential', label: 'Essential' },
  { id: 'agent-access', label: 'Agent access' },
  { id: 'mappings', label: 'Project mappings' },
  { id: 'status-mapping', label: 'Status mapping' }
];

export function SyncCenterSurface(props: {
  companyId: string;
  scopeProjectId?: string;
  scopeIssueId?: string;
  embeddedTitle?: string;
  modal?: boolean;
  settingsOnly?: boolean;
}): React.JSX.Element {
  const controller = useSyncCenterController(props);

  return (
    <section style={{
      ...(props.modal
        ? {
            ...cardStyle(),
            width: 'min(100%, 980px)',
            maxHeight: 'min(82vh, 980px)',
            overflowY: 'auto',
            padding: 18
          }
        : {})
    }}
    >
      <div style={stackStyle(16)}>
        <div style={rowStyle()}>
          <div style={{ display: 'grid', gap: 4, flex: '1 1 260px' }}>
            <h3 style={{ margin: 0 }}>{controller.headerTitle}</h3>
            <span style={{ fontSize: 13, opacity: 0.78 }}>
              {controller.headerSubtitle}
            </span>
          </div>
          {controller.currentPage === 'project' && controller.activeProject ? (
            <span style={badgeStyle(controller.activeProject.isConfigured ? 'synced' : 'local')}>
              {controller.activeProject.isConfigured ? 'Configured' : 'Needs provider'}
            </span>
          ) : null}
        </div>

        <div style={rowStyle()}>
          {controller.currentPage === 'project' && (!props.scopeProjectId || controller.entryContext.data?.requiresProjectSelection) ? (
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => controller.setCurrentPage('projects')}
            >
              {buttonLabel('back', 'Back')}
            </button>
          ) : null}
          {controller.currentPage === 'providers' && !props.settingsOnly ? (
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => controller.setCurrentPage(
                controller.activeProjectId
                  ? 'project'
                  : resolveInitialSyncPage(controller.entryContext.data ?? {
                      surface: 'global',
                      requiresProjectSelection: true
                    })
              )}
            >
              {buttonLabel('back', 'Back')}
            </button>
          ) : null}
          {controller.currentPage === 'provider-detail' ? (
            <button
              type="button"
              style={buttonStyle()}
              onClick={() => controller.openProviderDirectoryPage()}
            >
              {buttonLabel('back', 'Back')}
            </button>
          ) : null}
        </div>

        <ResultMessage message={controller.message} tone={controller.messageTone} />

        {controller.currentPage === 'projects' ? (
          <div style={stackStyle(12)}>
            {(controller.projectList.data?.projects ?? []).length === 0 ? (
              <div style={sectionCardStyle()}>
                No Paperclip projects are available for sync yet.
              </div>
            ) : (controller.projectList.data?.projects ?? []).map((project) => (
              <button
                key={project.projectId}
                type="button"
                style={pageCardStyle(project.projectId === controller.activeProjectId)}
                onClick={() => controller.openProject(project.projectId)}
                data-navigation-target={buildProjectPageNavigationTarget(project.projectId)}
              >
                <div style={rowStyle()}>
                  <strong>{project.projectName}</strong>
                  <span style={badgeStyle(project.isConfigured ? 'synced' : 'local')}>
                    {project.isConfigured ? 'Configured' : 'Choose provider'}
                  </span>
                  {project.hasImportedIssues ? (
                    <span style={badgeStyle('info')}>Imported issues present</span>
                  ) : null}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>
                  {project.providerDisplayName
                    ? `Current provider: ${project.providerDisplayName}`
                    : 'No provider selected yet.'}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {controller.currentPage === 'project' ? (
          <div style={stackStyle(14)}>
            <ProjectProviderSelectionSection
              sectionCardStyle={sectionCardStyle}
              stackStyle={stackStyle}
              rowStyle={rowStyle}
              buttonStyle={buttonStyle}
              inputStyle={inputStyle}
              buttonLabel={buttonLabel}
              healthBadgeStyle={healthBadgeStyle}
              formatProviderHealthLabel={formatProviderHealthLabel}
              shouldShowProviderHealthMessage={shouldShowProviderHealthMessage}
              selectedProviderStatus={controller.selectedProviderStatus}
              configuredProviders={controller.configuredProviders}
              selectedProviderId={controller.selectedProviderId}
              selectedProvider={controller.selectedProvider}
              providerEnabled={controller.providerEnabled}
              activeProjectId={controller.activeProjectId}
              saveProjectBusy={controller.saveProject.busy}
              onProviderSelection={(providerId) => { void controller.handleProviderSelection(providerId); }}
              onCreateProvider={controller.openCreateProviderPage}
              onEditProvider={() => controller.openProviderDetailPage(controller.selectedProvider?.id)}
              onDisableSync={() => { void controller.handleDisableSync(); }}
            />

            {!controller.providerEnabled ? (
              <ProviderDisabledCleanupSection
                sectionCardStyle={sectionCardStyle}
                stackStyle={stackStyle}
                rowStyle={rowStyle}
                buttonStyle={buttonStyle}
                buttonLabel={buttonLabel}
                activeProjectId={controller.activeProjectId}
                cleanupBusy={controller.cleanupCandidates.busy}
                onCleanup={() => { void controller.handleCleanup(); }}
                bottomMessageNode={<ResultMessage message={controller.projectBottomMessage} tone={controller.projectBottomMessageTone} />}
              />
            ) : null}

            {controller.providerEnabled ? (
              <>
                <div style={tabListStyle()}>
                  {PROJECT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      style={tabButtonStyle(controller.activeProjectTab === tab.id)}
                      onClick={() => controller.setActiveProjectTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {controller.activeProjectTab === 'essential' ? (
                  <EssentialTab
                    companyId={controller.companyId}
                    activeProjectId={controller.activeProjectId}
                    selectedProvider={controller.selectedProvider ? { id: controller.selectedProvider.id, type: controller.selectedProvider.type } : null}
                    activeProjectName={controller.activeProject?.projectName ?? controller.projectPage.data?.projectName ?? ''}
                    defaultProjectKey={controller.defaultProjectKey}
                    defaultAssignee={controller.defaultAssignee}
                    scheduleFrequencyMinutes={controller.scheduleFrequencyMinutes}
                    projectPageSuggestions={controller.projectPage.data?.suggestedUpstreamProjectKeys}
                    activeProjectSuggestions={controller.activeProject?.suggestedUpstreamProjectKeys}
                    refreshIdentityBusy={controller.refreshIdentity.busy}
                    setDefaultProjectKey={controller.setDefaultProjectKey}
                    setDefaultAssignee={controller.setDefaultAssignee}
                    setScheduleFrequencyMinutes={controller.setScheduleFrequencyMinutes}
                    refreshIdentity={async (input) => (
                      await controller.refreshIdentity.run(input) as { defaultAssignee?: UpstreamUserReference | null } | null
                    )}
                    refreshSyncData={controller.refreshSyncData}
                  />
                ) : null}

                {controller.activeProjectTab === 'agent-access' ? (
                  <AgentAccessTab
                    enabled={controller.agentIssueProviderAccessEnabled}
                    allowedAgentIds={controller.allowedAgentIds}
                    assignableAgents={controller.assignableAgents}
                    assignableAgentsLoading={controller.assignableAgentsData.loading}
                    assignableAgentsError={controller.assignableAgentsError}
                    setEnabled={controller.setAgentIssueProviderAccessEnabled}
                    setAllowedAgentIds={(updater) => controller.setAllowedAgentIds(updater)}
                  />
                ) : null}

                {controller.activeProjectTab === 'mappings' ? (
                  <MappingsTab
                    activeProjectId={controller.activeProjectId}
                    activeProjectName={controller.activeProject?.projectName ?? controller.projectPage.data?.projectName ?? ''}
                    selectedProviderId={controller.selectedProvider?.id}
                    selectedProviderType={controller.selectedProvider?.type ?? null}
                    defaultMappingEnabled={controller.defaultMappingEnabled}
                    defaultProjectKey={controller.defaultProjectKey}
                    defaultAssignee={controller.defaultAssignee}
                    rows={controller.rows}
                    onCreate={controller.openCreateMappingModal}
                    onEdit={controller.openEditMappingModal}
                    onRemove={(rowId) => {
                      controller.setRows((current) => current.filter((row) => row.id !== rowId));
                      controller.setRowsDirty(true);
                    }}
                    onToggleEnabled={(rowId, enabled) => {
                      controller.setRows((current) => current.map((row) => (
                        row.id === rowId
                          ? { ...row, enabled }
                          : row
                      )));
                      controller.setRowsDirty(true);
                    }}
                    onToggleDefaultEnabled={controller.setDefaultMappingEnabled}
                  />
                ) : null}

                {controller.activeProjectTab === 'status-mapping' ? (
                  <StatusMappingTab
                    providerType={controller.selectedProvider?.type ?? null}
                    activeProjectId={controller.activeProjectId}
                    defaultStatus={controller.defaultStatus}
                    defaultStatusAssigneeAgentId={controller.defaultStatusAssigneeAgentId}
                    statusMappings={controller.statusMappings}
                    assignableAgents={controller.assignableAgents}
                    assignableAgentsError={controller.assignableAgentsError}
                    setDefaultStatus={controller.setDefaultStatus}
                    setDefaultStatusAssigneeAgentId={controller.setDefaultStatusAssigneeAgentId}
                    setStatusMappings={(updater) => controller.setStatusMappings(updater)}
                  />
                ) : null}

                <ProjectSyncActionsSection
                  sectionCardStyle={sectionCardStyle}
                  rowStyle={rowStyle}
                  buttonStyle={buttonStyle}
                  buttonLabel={buttonLabel}
                  activeProjectId={controller.activeProjectId}
                  saveProjectBusy={controller.saveProject.busy}
                  configSaving={controller.configSaving}
                  runSyncBusy={controller.runSync.busy}
                  cleanupBusy={controller.cleanupCandidates.busy}
                  onSave={() => { void controller.persistProjectSettings(); }}
                  onRunSync={() => { void controller.handleRunSync(); }}
                  onCleanup={() => { void controller.handleCleanup(); }}
                />

                <SyncProgressPanel syncProgress={controller.projectPage.data?.syncProgress} />
              </>
            ) : null}
          </div>
        ) : null}

        {controller.currentPage === 'providers' ? (
          <ProviderDirectorySection
            providerDirectory={controller.providerDirectory.data}
            selectedProviderId={controller.selectedProviderId}
            newProviderType={controller.newProviderType}
            sectionCardStyle={sectionCardStyle}
            stackStyle={stackStyle}
            rowStyle={rowStyle}
            buttonStyle={buttonStyle}
            pageCardStyle={pageCardStyle}
            neutralBadgeStyle={neutralBadgeStyle}
            healthBadgeStyle={healthBadgeStyle}
            buttonLabel={buttonLabel}
            providerLabel={providerLabel}
            getProviderTypeLabel={getProviderTypeLabel}
            formatProviderHealthLabel={formatProviderHealthLabel}
            shouldShowProviderHealthMessage={shouldShowProviderHealthMessage}
            buildProviderDetailNavigationTarget={buildProviderDetailNavigationTarget}
            createEmptyProviderDraft={createEmptyProviderDraft}
            setProviderDraft={controller.setProviderDraft}
            setProviderDraftToken={controller.setProviderDraftToken}
            setSelectedProviderDetailId={controller.setSelectedProviderDetailId}
            openProviderDetailPage={controller.openProviderDetailPage}
          />
        ) : null}

        {controller.currentPage === 'provider-detail' && controller.providerDraft ? (
          <ProviderDetailSection
            providerDraft={controller.providerDraft}
            providerDraftToken={controller.providerDraftToken}
            providerDetailData={controller.providerDetail.data}
            providerDirectoryData={controller.providerDirectory.data}
            newProviderType={controller.newProviderType}
            companyId={controller.companyId}
            configSaving={controller.configSaving}
            testConnectionBusy={controller.testConnection.busy}
            setProviderDraft={controller.setProviderDraft}
            setProviderDraftToken={controller.setProviderDraftToken}
            setNewProviderType={controller.setNewProviderType}
            createEmptyProviderDraft={createEmptyProviderDraft}
            buttonStyle={buttonStyle}
            stackStyle={stackStyle}
            rowStyle={rowStyle}
            inputStyle={inputStyle}
            sectionCardStyle={sectionCardStyle}
            neutralBadgeStyle={neutralBadgeStyle}
            healthBadgeStyle={healthBadgeStyle}
            buttonLabel={buttonLabel}
            providerLabel={providerLabel}
            getProviderTypeLabel={getProviderTypeLabel}
            formatProviderHealthLabel={formatProviderHealthLabel}
            onTestConnection={(input) => { void controller.testConnection.run(input as {
              companyId: string;
              projectId?: string;
              providerId?: string;
              providerKey?: ProviderType;
              config: JiraProviderConfig;
            }); }}
            onSaveProvider={() => { void controller.handleSaveProviderDefinition(); }}
            onDeleteProvider={() => { void controller.handleDeleteProviderDefinition(); }}
          />
        ) : null}

        {controller.mappingModal ? (
          <MappingModal
            companyId={controller.companyId}
            providerId={controller.selectedProvider?.id ?? null}
            providerType={controller.selectedProvider?.type ?? null}
            draft={controller.mappingModal.draft}
            mode={controller.mappingModal.mode}
            projectPageSuggestions={controller.projectPage.data?.suggestedUpstreamProjectKeys}
            activeProjectSuggestions={controller.activeProject?.suggestedUpstreamProjectKeys}
            onClose={() => controller.setMappingModal(null)}
            onChange={(updater) => controller.setMappingModal((current) => current ? {
              ...current,
              draft: updater(current.draft)
            } : null)}
            onSave={controller.saveMappingModal}
          />
        ) : null}

        {controller.cleanupModal ? (
          <CleanupModal
            mode={controller.cleanupModal.mode}
            status={controller.cleanupModal.status}
            customFilter={controller.cleanupModal.customFilter}
            candidates={controller.cleanupModal.candidates}
            visibleCandidates={controller.visibleCleanupCandidates}
            selectedIssueIds={controller.cleanupModal.selectedIssueIds}
            onClose={() => controller.setCleanupModal(null)}
            onModeChange={(mode) => controller.setCleanupModal((current) => {
              if (!current) {
                return null;
              }
              if (mode === 'all') {
                return {
                  ...current,
                  mode,
                  selectedIssueIds: current.candidates.map((candidate) => candidate.issueId)
                };
              }
              if (mode === 'status') {
                const status = current.status || 'backlog';
                return {
                  ...current,
                  mode,
                  status,
                  selectedIssueIds: current.candidates.filter((candidate) => candidate.status === status).map((candidate) => candidate.issueId)
                };
              }
              return {
                ...current,
                mode,
                selectedIssueIds: current.candidates.map((candidate) => candidate.issueId)
              };
            })}
            onStatusChange={(status) => controller.setCleanupModal((current) => current ? {
              ...current,
              status,
              selectedIssueIds: current.candidates.filter((candidate) => candidate.status === status).map((candidate) => candidate.issueId)
            } : null)}
            onCustomFilterChange={(nextFilter) => controller.setCleanupModal((current) => {
              if (!current) {
                return null;
              }
              const visible = current.candidates.filter((candidate) => {
                const term = nextFilter.trim().toLowerCase();
                if (!term) {
                  return true;
                }
                return `${candidate.jiraIssueKey} ${candidate.title} ${candidate.status}`.toLowerCase().includes(term);
              });
              return {
                ...current,
                customFilter: nextFilter,
                selectedIssueIds: visible.map((candidate) => candidate.issueId)
              };
            })}
            onToggleIssue={(issueId, checked) => controller.setCleanupModal((current) => current ? {
              ...current,
              selectedIssueIds: checked
                ? [...current.selectedIssueIds, issueId]
                : current.selectedIssueIds.filter((value) => value !== issueId)
            } : null)}
            onConfirm={() => { void controller.applyCleanupSelection(); }}
          />
        ) : null}
      </div>
    </section>
  );
}
