# Feature Specification: Provider-Aware Jira UI Replan

**Feature Branch**: `003-jira-ui-replan`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Replan the Jira Sync UI around provider interfaces, a complete sync status popup, clearer synced vs local issue display, and fetched editable comments with upload controls"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure issue sync through a complete provider popup (Priority: P1)

An operator opens a single sync popup from Paperclip, chooses an upstream issue
provider, configures that provider, tests the connection, sets task filters, and
starts a sync from the same flow.

**Why this priority**: This is the new primary entry point for sync and
configuration. Without a cohesive popup, the user experience remains fragmented
and hard to understand.

**Independent Test**: Open the sync popup, choose Jira as the provider, enter or
review the provider settings, run a connection test, apply task filters, and
start a sync without leaving the popup.

**Acceptance Scenarios**:

1. **Given** a user opens the sync interface, **When** the popup appears,
   **Then** it presents provider selection, provider-specific configuration,
   connection testing, filter controls, and a sync action in one coherent flow.
2. **Given** Jira is selected and a token is already saved, **When** the popup
   renders, **Then** the token input remains hidden or masked while still making
   it clear that credentials already exist.
3. **Given** the user enters or updates Jira configuration, **When** they choose
   to test the connection, **Then** the popup shows whether the provider can be
   reached before a sync begins.

---

### User Story 2 - Track sync progress with exact feedback (Priority: P1)

An operator running a sync can see clear progress, including whether a sync is
active, how many issues have already been processed, how many remain, and the
current completion state.

**Why this priority**: Users need trustworthy feedback during sync so they know
whether the system is working or stalled.

**Independent Test**: Start a sync with a provider filter that returns multiple
issues and confirm the popup shows in-progress state, processed counts, and a
completion indicator that updates until the run finishes.

**Acceptance Scenarios**:

1. **Given** a sync is running, **When** the popup is open, **Then** it shows a
   clear loading state with processed issue count and total issue count when
   available.
2. **Given** processed and total counts are available, **When** sync advances,
   **Then** the popup updates a visible progress indicator such as a progress
   bar or equivalent completion display.
3. **Given** the sync completes or fails, **When** the final state is known,
   **Then** the popup shows the end result with imported, updated, skipped, and
   failed issue counts.

---

### User Story 3 - Distinguish synced issues from pure Paperclip issues in the issue display (Priority: P1)

An operator browsing issues can immediately tell whether an issue is a local
Paperclip issue or a synced upstream issue, and can understand the linked
provider and upstream issue key without hunting through a bottom-of-page panel.

**Why this priority**: The synced-vs-local distinction is central to the product
model and should be visible where people inspect issues.

**Independent Test**: Open a mixed set of local and synced issues and verify
that synced issues are visually distinguishable through styling or, when styling
cannot be applied, through a stable upstream-key prefix in the issue title.

**Acceptance Scenarios**:

1. **Given** a synced issue and a pure Paperclip issue are shown in the same
   Paperclip context, **When** the user views them, **Then** the synced issue is
   visibly distinguishable from the local issue.
2. **Given** host styling hooks are unavailable, **When** a synced issue is
   displayed, **Then** the issue title includes the upstream key prefix such as
   `[GRB-123]` as a fallback marker.
3. **Given** a synced issue detail view is opened, **When** the user inspects
   the issue, **Then** sync metadata is integrated prominently enough that the
   user does not need to scroll to an isolated footer panel to understand the
   linkage.
4. **Given** a synced issue is linked to an upstream Jira issue, **When** the
   issue detail UI is shown, **Then** a visible `Open in Jira` button is
   available as a first-class action.

---

### User Story 4 - Work with fetched comments as synced content (Priority: P2)

An operator can clearly see which comments came from the upstream issue provider,
edit those comments locally in Paperclip, and explicitly upload existing local
comments to the linked upstream issue.

**Why this priority**: Comment sync is part of the collaboration workflow and
needs clear visibility and control rather than hidden annotations only.

**Independent Test**: Pull comments from a synced issue, verify the UI marks
them as fetched upstream comments, edit a local comment, and use an upload
action to push the selected comment to the provider.

**Acceptance Scenarios**:

1. **Given** a synced issue has upstream comments, **When** comments are pulled
   into Paperclip, **Then** the UI makes it clear which comments originated from
   the upstream provider.
2. **Given** a fetched upstream comment is present locally, **When** the user
   edits it in Paperclip, **Then** the local edit remains possible without
   hiding its upstream origin.
3. **Given** a local Paperclip comment exists on a synced issue, **When** the
   user chooses to upload that comment, **Then** the system pushes the selected
   existing comment to the upstream issue and records that sync state.

### Edge Cases

- What happens when the selected provider is available in the interface but has
  not yet been fully configured for the current company?
- How does the popup behave when a connection test succeeds but a later sync
  fails because the selected filters return invalid or unauthorized items?
- What happens when the host cannot support differentiated issue-row styling and
  the fallback title prefix must carry the synced-vs-local distinction alone?
- How does the UI communicate comments that were fetched from upstream but were
  also edited locally afterward?
- What happens when progress totals are not known at sync start but become known
  later, or remain unknown for the entire run?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a provider-agnostic issue sync interface
  that allows one selected upstream provider to be configured through a common
  Paperclip-hosted UI.
- **FR-002**: The provider-agnostic interface MUST support Jira as the first
  concrete provider and MUST leave room for future providers without requiring
  the entire sync popup to be redesigned.
- **FR-003**: The sync interface MUST present provider selection, provider
  configuration, connection testing, task filters, and manual sync controls in
  a single cohesive popup or equivalent focused status surface.
- **FR-004**: When Jira is selected, the popup MUST allow users to view or set
  the Jira base URL, project selection, and authentication token state.
- **FR-005**: When a Jira token already exists, the popup MUST avoid exposing
  the raw token while still communicating that credentials are present.
- **FR-006**: The popup MUST provide an explicit connection test action for the
  selected provider before or during sync setup.
- **FR-007**: The popup MUST allow task filtering by active-state scope,
  author, assignee, issue number less than, and issue number greater than.
- **FR-008**: The popup MUST provide visible sync progress while a run is
  active, including processed issue count and total issue count when available.
- **FR-009**: The popup MUST present final sync results with imported, updated,
  skipped, and failed counts after the run finishes.
- **FR-010**: The issue display MUST clearly distinguish synced issues from pure
  Paperclip issues using differentiated styling where host capabilities allow.
- **FR-011**: If differentiated styling cannot be applied in a given host
  surface, the issue display MUST use a stable upstream-key prefix such as
  `[GRB-123]` as the fallback synced marker.
- **FR-012**: Synced issue details MUST surface provider and sync metadata in a
  more integrated position than an isolated bottom-only panel when the host
  contribution surface permits it.
- **FR-012a**: Synced issue details MUST expose a visible `Open in Jira` action
  button whenever an upstream Jira URL is known.
- **FR-013**: The issue display MUST preserve the separation between local
  Paperclip workflow status and upstream provider status metadata.
- **FR-014**: Pulled comments MUST remain visibly marked as upstream-fetched
  comments in the UI.
- **FR-015**: Existing comments on synced issues MUST support an explicit upload
  action that pushes the selected local comment to the linked upstream issue.
- **FR-016**: Fetched or linked comments MUST remain editable in Paperclip
  unless a later policy explicitly restricts that behavior.

### Key Entities *(include if feature involves data)*

- **Issue Sync Provider**: A configurable upstream source definition that
  supplies provider-specific connection settings and filter semantics through a
  shared Paperclip sync interface.
- **Provider Sync Session**: A user-visible sync run state that tracks selected
  provider, active filters, progress counts, and final results.
- **Synced Issue Presentation**: The user-facing issue metadata needed to show
  upstream key, provider identity, local-vs-upstream status, and synced/local
  visual distinction.
- **Synced Comment Presentation**: The user-facing comment metadata needed to
  show upstream origin, local editability, and upload state for existing
  comments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can configure Jira, test the connection, set filters, and
  start a sync from a single focused sync popup without navigating across
  multiple disjoint setup surfaces.
- **SC-002**: During a sync involving multiple issues, the UI shows enough
  progress detail that a user can tell how many issues have already been
  processed and whether the run is still advancing.
- **SC-003**: In mixed local and synced issue views, users can correctly tell
  which issues are synced and which are pure Paperclip issues on first glance in
  the primary issue display surface.
- **SC-004**: Users can identify pulled upstream comments and explicitly upload
  an existing local comment to the linked issue provider without needing hidden
  worker-only controls.

## Assumptions

- Jira remains the first supported provider for this redesign, but the UI is
  expected to expose a provider abstraction immediately.
- The Paperclip host may not support custom issue-row styling in every surface,
  so the synced-title prefix fallback is acceptable where needed.
- The redesign focuses on user-facing UI and interaction model changes; deeper
  provider backends may evolve afterward as long as the new UI contract is
  preserved.
- Connection testing, filter persistence, and progress reporting may rely on
  existing plugin state and worker action surfaces rather than introducing a new
  host-native sync API immediately.
