# Feature Specification: Project-First Sync UX Refresh

**Feature Branch**: `005-project-sync-ux`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "1. The sync issues button at the very top of window is not the right place. The button is show for each individual project and that is the right place. It should also be shown in the UI for all issues - somewhere in between other buttons. 2. The configuration for sync is still not the most intuitive. The first part is to choose a project. Before you choose a project no other configs should be visible, otherwise it is confusing. In fact, I think there should be a separate page for each project instead of this. So if you click on one of the projects in sync page, it would take you to the specific project configuration. 3. No configurations should be visible before you select a provider. The only button is 'hide imported issues' - others should not be present. Otherwise it is confusing, too. 4. Providers should be a separate page in plugin settings. And configuration for each adapter should also be a separate page, similar to others. I think the pop-up on top of the current popup is a bit strange in display - it would be fine if we just open the same style pop-up on top of the existing, but instead of exit it would have 'back'. The providers page should also have a drop-down for provider type - for now it is just Jira, but in future can be more. 5. The style is not always consistent in the dark mode. I think paperclip uses transparent button background by default, while we fill it with white-ish background. 6. The comment import is not the most intuitive. It would be best we could actually edit the style of comments to show that they were imported. Also, if we would add a field where you could add another comment. Preferably, we would use the same existing field, but extend it with checkbox 'publish to upstream'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start sync from the right place (Priority: P1)

A project owner can start issue sync from the project they are working in, and
an issue viewer can reach the same action from the issue toolbar without relying
on a single global button at the very top of the application.

**Why this priority**: The entry point determines whether the feature feels
native or confusing. If users cannot find sync where they already work, the rest
of the redesign does not solve the usability problem.

**Independent Test**: Open a project and confirm `Sync Issues` is available in
that project context. Open an issue and confirm `Sync Issues` appears alongside
the other issue actions without requiring the global top-of-window button.

**Acceptance Scenarios**:

1. **Given** a user is viewing a Paperclip project, **When** they look for sync
   controls, **Then** `Sync Issues` is available in that project context.
2. **Given** a user is viewing an issue, **When** they inspect the issue action
   area, **Then** `Sync Issues` appears among the other issue actions in a
   placement consistent with the surrounding controls.
3. **Given** a user opens the cross-project sync surface, **When** it first
   loads, **Then** the first decision is which project to work on and no
   project-specific settings are shown before a project is chosen.
4. **Given** a user selects a project from the cross-project sync surface,
   **When** they continue, **Then** they are taken into that specific project's
   sync page rather than editing all projects in one mixed view.

---

### User Story 2 - Configure one project and one provider at a time (Priority: P1)

A plugin administrator can manage providers in their own settings area, then
open a dedicated page for one project and only see the controls that make sense
for that project's current provider selection.

**Why this priority**: Progressive disclosure is the main usability goal of the
request. Hiding irrelevant settings until a project and provider are chosen
reduces setup mistakes and makes the sync model easier to learn.

**Independent Test**: Open plugin settings, go to the providers page, create or
edit a provider from a dedicated provider page, then open one project's sync
page and confirm only `Hide imported issues` is available before a provider is
selected.

**Acceptance Scenarios**:

1. **Given** a user opens plugin settings, **When** they choose provider
   management, **Then** providers are shown on a dedicated page separate from
   project sync setup.
2. **Given** a user starts adding or editing a provider, **When** the provider
   form opens, **Then** it is shown as its own page in the same visual style as
   other settings pages and offers a `Back` action instead of an exit-only
   overlay.
3. **Given** a user is creating or editing a provider, **When** they choose the
   provider type, **Then** the page offers a provider-type selector that can
   support Jira now and additional provider types later.
4. **Given** a user opens a project's sync page before selecting any provider,
   **When** the page renders, **Then** only the provider selection control and
   the `Hide imported issues` action are visible.
5. **Given** a user has not selected a provider for the project, **When** they
   view the project sync page, **Then** mapping rules, refresh settings,
   connection settings, and sync actions remain hidden.
6. **Given** a user selects a provider for the project, **When** the project
   sync page refreshes, **Then** the provider-specific configuration and sync
   controls for that project become visible.
7. **Given** a user returns from a provider page, **When** they go back to the
   previous settings level, **Then** their navigation context is preserved
   without making them start over from the top-level application view.

---

### User Story 3 - Understand synced issue details and comment publishing (Priority: P2)

An issue participant can quickly tell which issue comments came from the
upstream provider, can keep the issue detail view visually consistent in dark
mode, and can write a comment once while choosing whether it should also be sent
upstream.

**Why this priority**: The redesign should improve day-to-day issue work, not
just setup. Comment behavior and visual consistency are where users feel the
rough edges most often after configuration is complete.

**Independent Test**: Open a synced issue in dark mode, confirm the buttons and
panels match the host styling expectations, verify imported comments are visually
distinct, and add a new comment using the standard comment field with a
`Publish to upstream` option.

**Acceptance Scenarios**:

1. **Given** a synced issue is opened in dark mode, **When** the issue sync
   actions and status panels render, **Then** their backgrounds and emphasis are
   visually consistent with the host's dark-mode button and panel styles.
2. **Given** an issue contains comments imported from the upstream provider,
   **When** the user reads the thread, **Then** imported comments are visibly
   styled as imported rather than appearing identical to local-only comments.
3. **Given** a user writes a new comment on a synced issue, **When** they use
   the standard comment entry field, **Then** they can choose whether that same
   comment should also be published upstream.
4. **Given** a user leaves the `Publish to upstream` option unselected,
   **When** they submit the comment, **Then** the comment is saved locally
   without being published upstream.
5. **Given** a user selects `Publish to upstream` for a new comment on a synced
   issue, **When** they submit the comment, **Then** the comment is saved in
   Paperclip and marked for upstream publication as part of the same action.

### Edge Cases

- What happens when a user opens the cross-project sync surface but leaves
  without choosing a project?
- What happens when a project has imported issues hidden previously but still no
  provider selected, and the user chooses `Hide imported issues` again?
- How does the project sync page behave when a previously selected provider was
  deleted or is no longer available?
- What happens when a synced issue is viewed in dark mode and the host theme
  changes while the issue view is open?
- How does the comment composer behave when upstream publication is selected but
  the issue is no longer linked to an upstream record by the time the comment is
  submitted?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST stop relying on a single top-of-window sync entry
  point as the primary way to reach issue sync.
- **FR-002**: The system MUST expose `Sync Issues` from each Paperclip project
  context where project-specific sync can be managed.
- **FR-003**: The system MUST expose `Sync Issues` from the issue UI in a
  placement consistent with other issue actions.
- **FR-004**: The cross-project sync surface MUST begin with project selection
  and MUST NOT show project-specific sync settings before a project is chosen.
- **FR-005**: After a project is selected from the cross-project sync surface,
  the system MUST open that project's dedicated sync page rather than showing a
  mixed multi-project configuration form.
- **FR-006**: Each project MUST have its own dedicated sync configuration page.
- **FR-007**: Before a provider is selected for a project, the project sync page
  MUST show only provider selection and `Hide imported issues`.
- **FR-008**: Before a provider is selected for a project, the project sync page
  MUST NOT show sync action controls, mapping configuration, schedule controls,
  or provider-specific setup fields.
- **FR-009**: The plugin settings area MUST include a dedicated providers page
  that is separate from project sync pages.
- **FR-010**: Each provider definition MUST be created and edited on its own
  dedicated page rather than through an overlaid nested popup.
- **FR-011**: Provider create and edit pages MUST use the same navigation model
  as the surrounding settings experience and MUST provide a `Back` action to
  return to the prior page.
- **FR-012**: Provider create and edit pages MUST include a provider-type
  selector that supports Jira now and can represent additional provider types in
  the future.
- **FR-013**: Once a provider is selected for a project, the project sync page
  MUST reveal only the controls relevant to that project and that provider.
- **FR-014**: Project-specific sync settings MUST remain separated from provider
  definitions so users can manage provider records independently from project
  configuration.
- **FR-015**: Issue sync action styling and issue sync status panels MUST align
  with Paperclip dark-mode visual patterns, including backgrounds and emphasis.
- **FR-016**: The system MUST avoid bright or opaque button backgrounds in dark
  mode when the surrounding host pattern uses transparent or minimally filled
  controls.
- **FR-017**: Imported comments on synced issues MUST be visually distinguished
  from local-only comments.
- **FR-018**: The standard comment entry flow on a synced issue MUST allow a
  user to decide whether a new comment should also be published upstream.
- **FR-019**: The upstream publication choice for a new comment MUST be
  available in the same comment entry experience instead of requiring a separate
  comment creation flow.
- **FR-020**: When upstream publication is not selected, the comment flow MUST
  behave as a normal local Paperclip comment flow.
- **FR-021**: When upstream publication is selected for a synced issue, the
  system MUST preserve a clear record that the submitted comment was also
  intended for upstream publication.
- **FR-022**: The `Hide imported issues` action MUST remain accessible even when
  no provider is currently selected for the project.

### Key Entities *(include if feature involves data)*

- **Project Sync Page**: The dedicated configuration view for one Paperclip
  project that reveals sync controls progressively based on project and provider
  selection.
- **Provider Directory**: The settings-level collection of saved upstream
  provider records available for project sync.
- **Provider Detail Page**: The dedicated page for creating or editing one saved
  provider, including provider type and provider-specific details.
- **Imported Comment Presentation**: The user-facing metadata and styling that
  identifies a comment as imported from an upstream provider.
- **Comment Publish Choice**: The user-selected state on a new issue comment
  that determines whether the same comment should remain local-only or also be
  published upstream.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability review, users can reach project sync from a project
  or issue context in one step without relying on the top-of-window global sync
  button.
- **SC-002**: In first-time setup, users see no project-specific sync controls
  until a project is selected and no provider-specific controls until a provider
  is selected.
- **SC-003**: In dark-mode review of synced issue details, all primary sync
  actions and status surfaces match the host visual language well enough that no
  high-contrast background inconsistency is flagged.
- **SC-004**: Users can correctly identify imported comments versus local-only
  comments on first inspection in at least 90% of walkthrough evaluations.
- **SC-005**: Users can add a new comment and choose whether to publish it
  upstream from the standard comment field without needing a separate comment
  workflow.

## Assumptions

- Existing project-scoped sync behavior remains the foundation, and this feature
  focuses on simplifying navigation, disclosure, and presentation rather than
  changing the core sync ownership model.
- Jira remains the only available provider type at launch, but provider
  management must be framed so additional provider types can be added later
  without restructuring the settings flow.
- `Hide imported issues` continues to operate on already imported project data
  even when a project is not currently connected to a provider.
- The issue detail surface already supports a standard comment entry experience
  that can be extended with a publication choice instead of replacing the
  existing comment flow entirely.
