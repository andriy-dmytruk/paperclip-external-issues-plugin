# Feature Specification: Project-Scoped Jira Sync Setup

**Feature Branch**: `004-project-scoped-sync`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Add another specification in this project. I would like to change the design of the issue import more 1. The import should be setup per-project. When you open a project and click sync issues it would open the setting for that project. When you click that for all issues, you would first have a drop down showing which project to choose. When a project is created, it does not connect to issues by default - the provider is just empty. This will simplify the mappings a bit, as you do not need to choose mapping target project any more. 2. For each project you can choose one provider (can be different for each project). Then you have issue upload settings with 2 fields: default assignee: should fetch your user by default using the provided token; default status: in progress. After that you choose the refresh rate and mappings. The default mappings is issue is active and assignee is default user. When you click sync or hide issues, it does it only for this project. 3. When you open an issue, it shows the same info as now: Jira status and assignee, imported comments. When you create a new issue, you can click a button to upload it to jira."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure sync from a project-first surface (Priority: P1)

A project owner opens a Paperclip project, clicks `Sync Issues`, and edits only
that project's sync configuration without having to choose a separate Paperclip
mapping target.

**Why this priority**: This is the core redesign. The user wants issue import
to be configured per project so the setup model matches how teams already think
about Paperclip projects.

**Independent Test**: Open `Sync Issues` from one Paperclip project, select a
provider for that project, save the project-specific settings, and confirm the
configuration applies only to that project.

**Acceptance Scenarios**:

1. **Given** a user opens `Sync Issues` from a project detail surface, **When**
   the sync settings open, **Then** the UI is already scoped to that project and
   does not ask the user to choose a separate mapping target project.
2. **Given** a user opens `Sync Issues` from a global issue-import surface,
   **When** the dialog opens, **Then** the first control is a project selector
   that determines which Paperclip project's sync settings are being edited.
3. **Given** a newly created Paperclip project, **When** the project sync
   settings are first opened, **Then** no provider is connected by default and
   the project remains Paperclip-only until the user chooses one.

---

### User Story 2 - Save one provider and one sync policy per project (Priority: P1)

A project owner can choose exactly one upstream provider for a Paperclip
project, set project-level upload defaults, set refresh cadence, and define the
default import filters for that same project.

**Why this priority**: The redesign is meant to simplify mappings. Per-project
ownership only works if provider choice, upload defaults, cadence, and import
filters all live together in one project-specific configuration model.

**Independent Test**: Choose a provider for a project, confirm the default
assignee is auto-filled from the provider token identity, leave the default
status at `in_progress`, save the refresh rate and mappings, and verify later
sync or hide actions apply only to that project.

**Acceptance Scenarios**:

1. **Given** a Paperclip project with no upstream provider selected, **When**
   the user opens project sync settings, **Then** the project-level provider
   selection is empty and must be chosen explicitly.
2. **Given** a Paperclip project that was previously connected to Jira,
   **When** the user switches the provider selector back to `None`, **Then**
   the project becomes Paperclip-only without deleting its saved Jira-specific
   defaults or mappings.
3. **Given** the user selects a provider for a project, **When** the provider
   settings are loaded, **Then** the project shows upload defaults for default
   assignee and default status.
4. **Given** the selected provider can identify the authenticated upstream user,
   **When** the project settings load or refresh provider identity, **Then**
   the default assignee is populated with that upstream user by default.
5. **Given** the selected provider is Jira and the user edits assignee fields,
   **When** the user types into the default assignee field or mapping assignee
   filter, **Then** the UI searches Jira users and saves the selected user by a
   stable Jira identity instead of free text.
6. **Given** the user has not overridden the default upload status, **When**
   a new project sync configuration is created, **Then** the default upload
   status is `in_progress`.
7. **Given** a project sync configuration is created, **When** default mappings
   are initialized, **Then** the default import filter includes active issues
   assigned to the default upstream user.
8. **Given** the user triggers `Sync` or `Hide imported issues` while working
   inside a project-scoped sync surface, **When** the action runs, **Then** it
   only affects the currently selected project.

---

### User Story 3 - Keep issue-level sync actions simple for daily work (Priority: P2)

An issue viewer can still inspect Jira status, Jira assignee, and imported
comments on a synced issue, while a local Paperclip issue can be uploaded to
Jira with a single explicit action.

**Why this priority**: Users still need the existing issue-level visibility and
manual upload workflow even after configuration moves to the project level.

**Independent Test**: Open a synced issue and verify it still shows upstream
status, assignee, and imported comments. Open a local issue in a configured
project and use the issue-level upload action to create it in Jira.

**Acceptance Scenarios**:

1. **Given** a synced issue is opened, **When** the issue sync contribution
   renders, **Then** it still shows Jira status, Jira assignee, and imported
   comments as it does today.
2. **Given** a local Paperclip issue exists in a project with a configured
   provider, **When** the issue is opened, **Then** the issue detail shows an
   action that uploads that issue to Jira.
3. **Given** the user uploads a local issue to Jira from issue detail, **When**
   the upload succeeds, **Then** the issue becomes linked to its new upstream
   Jira issue and starts showing synced issue details.

### Edge Cases

- What happens when a project-scoped sync surface is opened for a project that
  has no provider selected and no upstream user can be resolved yet?
- How does the project settings UI behave when the selected provider token can
  connect to Jira but cannot resolve the current upstream user for the default
  assignee field?
- What happens when a project-scoped `Hide imported issues` action is triggered
  for a project that currently has zero imported issues?
- How does the global sync surface behave if the user changes the selected
  project while unsaved project-scoped sync edits are present?
- What happens when a local issue exists in a project that has no provider
  configured and the user opens the issue expecting an upload action?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST treat issue import configuration as project-scoped
  configuration rather than as a separate Paperclip-project mapping selection.
- **FR-002**: Opening `Sync Issues` from a Paperclip project MUST open the sync
  settings already scoped to that project.
- **FR-003**: Opening the global issue sync surface MUST require the user to
  choose which Paperclip project they are configuring before project-scoped sync
  settings are shown.
- **FR-004**: A newly created Paperclip project MUST have no provider selected
  by default.
- **FR-005**: Each Paperclip project MUST support at most one selected upstream
  issue provider at a time.
- **FR-006**: Different Paperclip projects MUST be allowed to use different
  providers.
- **FR-007**: Project-scoped sync settings MUST include issue upload defaults
  for default assignee and default status.
- **FR-008**: The system MUST attempt to resolve the authenticated upstream user
  for the selected provider and use that user as the default assignee when the
  provider token supports that lookup.
- **FR-009**: When no explicit override is saved, the default upload status MUST
  be `in_progress`.
- **FR-010**: Project-scoped sync settings MUST include refresh cadence for that
  project.
- **FR-011**: Project-scoped sync settings MUST include import mappings or
  filters for that project without requiring the user to choose a target
  Paperclip project.
- **FR-012**: Newly created project-scoped mappings MUST default to importing
  active issues assigned to the resolved default upstream user.
- **FR-012a**: A project-scoped configuration MUST allow `providerId` to remain
  empty as an explicit Paperclip-only state without auto-selecting another
  saved provider.
- **FR-012b**: Switching a project back to the empty-provider state MUST
  preserve its previously saved Jira-specific defaults and mappings in durable
  state.
- **FR-012c**: The default assignee and mapping assignee filter MUST be chosen
  through Jira-backed autocomplete and persisted as a structured Jira user
  reference keyed by durable Jira identity.
- **FR-013**: When the user triggers sync from a project-scoped surface, the
  sync operation MUST only read from and write to the selected Paperclip project.
- **FR-014**: When the user triggers hide-from-project from a project-scoped
  surface, the action MUST only consider imported issues belonging to the
  selected project.
- **FR-015**: Synced issue detail presentation MUST continue to show Jira
  status, Jira assignee, and imported comments.
- **FR-016**: Local issues inside a project with a configured provider MUST show
  an explicit action that uploads that issue to Jira.
- **FR-017**: Local issues inside a project without a configured provider MUST
  NOT appear linked to any upstream issue by default.
- **FR-018**: The global project selector and project-scoped sync settings MUST
  preserve independent saved settings for each project.

### Key Entities *(include if feature involves data)*

- **Project Sync Configuration**: The per-project configuration record that
  stores the chosen provider, refresh cadence, upload defaults, and import
  filters for a single Paperclip project.
- **Project Provider Selection**: The single upstream provider currently chosen
  for a Paperclip project, or the empty state when no provider is connected.
- **Project Upload Defaults**: The project-level default assignee and default
  status used when local issues are uploaded from Paperclip to Jira.
- **Jira User Reference**: The structured Jira identity record used for default
  assignee and assignee filters, keyed by `accountId` and enriched with
  display text for the UI.
- **Project Import Filter Set**: The project-specific filter rules used when
  importing or refreshing upstream issues for one Paperclip project.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can configure issue sync for a Paperclip project without
  ever having to select a separate mapping target project in the sync UI.
- **SC-002**: A newly created Paperclip project starts with no connected issue
  provider and remains Paperclip-only until a provider is explicitly selected.
- **SC-003**: A user can open the global sync surface, choose a project, and
  then run sync or hide actions that affect only that chosen project.
- **SC-004**: A user can open a local issue inside a configured project and
  upload it to Jira from issue detail without re-entering project mapping data.

## Assumptions

- Existing provider records remain reusable, but project configuration chooses
  one provider reference per Paperclip project instead of creating free-form
  project mappings to a Paperclip target.
- The selected provider can expose enough identity information to populate a
  reasonable default assignee for most Jira deployments, while still allowing
  manual override when needed.
- The current synced issue detail presentation for Jira status, assignee, and
  imported comments remains valuable and should be preserved as part of this
  redesign.
- Hiding imported issues continues to mean hiding them inside Paperclip rather
  than deleting upstream Jira issues.
