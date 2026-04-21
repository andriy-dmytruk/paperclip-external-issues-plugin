# Feature Specification: Jira Sync MVP Baseline

**Feature Branch**: `001-jira-sync-mvp`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Capture the current Jira Sync plugin design as the baseline Spec Kit feature in this repository."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Jira issues into mapped Paperclip projects (Priority: P1)

An operator configures Jira access and one or more Jira-to-Paperclip project
mappings, then runs a sync that imports or refreshes Jira issues inside the
selected Paperclip projects.

**Why this priority**: This is the core value of the plugin. Without reliable
import and refresh behavior, the plugin does not justify existing as a Jira
connector.

**Independent Test**: Save a company mapping, run `sync.runNow`, and confirm
that mapped Jira issues appear in the target Paperclip project without duplicate
creation on repeat syncs.

**Acceptance Scenarios**:

1. **Given** a configured Jira connection and a saved company mapping, **When**
   the operator runs a manual sync, **Then** Jira issues are imported into the
   mapped Paperclip project with durable upstream metadata.
2. **Given** a Jira-linked Paperclip issue already exists, **When** a later sync
   pulls updated upstream title, description, or comments, **Then** the existing
   issue is updated instead of creating a duplicate.

---

### User Story 2 - Distinguish local Paperclip workflow state from upstream Jira state (Priority: P1)

An operator viewing a synced issue can understand both the local Paperclip
status and the upstream Jira status without one silently overwriting the other.

**Why this priority**: Mixed local-vs-upstream state caused a real integration
failure and creates confusing planning behavior if left implicit.

**Independent Test**: Import a Jira issue whose upstream status differs from the
desired Paperclip workflow state, then confirm the issue detail contribution
shows both values while preserving the local Paperclip status.

**Acceptance Scenarios**:

1. **Given** a synced issue with local Paperclip status `blocked`, **When** a
   pull sync refreshes upstream Jira metadata showing status `Done`, **Then**
   the Paperclip issue remains `blocked` and the UI shows Jira status `Done` as
   upstream metadata.
2. **Given** a Jira issue in upstream `In Progress`, **When** it is imported,
   **Then** the sync succeeds without requiring the Paperclip issue to adopt an
   invalid local status.

---

### User Story 3 - Push local Paperclip changes back to Jira selectively (Priority: P2)

An operator can push a pure Paperclip issue upstream to create a Jira issue, or
push a synced issue's title/description updates and comments back to Jira using
explicit actions.

**Why this priority**: The sync model is bi-directional, but explicit user
control is more important than full automatic mirroring.

**Independent Test**: Create or select a mapped Paperclip issue, use the push
action, and verify the Jira issue key and comment sync metadata are stored.

**Acceptance Scenarios**:

1. **Given** a pure Paperclip issue in a mapped project, **When** the operator
   chooses `Create in Jira`, **Then** a Jira issue is created and linked to the
   Paperclip issue.
2. **Given** a synced issue with local comment updates, **When** the operator
   pushes a comment to Jira, **Then** the comment link metadata records the
   upstream Jira comment id.

### Edge Cases

- What happens when Jira auth is configured incorrectly or the token secret
  reference cannot be resolved at runtime?
- How does sync behave when a mapping exists by project name but the target
  Paperclip project id has not been saved yet?
- What happens when Jira comments or descriptions contain formatting that does
  not map cleanly to Paperclip markdown?
- How should the plugin behave if Jira returns an issue successfully but the
  linked Paperclip issue was deleted locally?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST read Jira connection details from plugin instance
  config using `jiraBaseUrl`, optional `jiraUserEmail`, and `jiraTokenRef`.
- **FR-002**: The system MUST save Jira-to-Paperclip mappings per company in
  durable plugin state.
- **FR-003**: The system MUST import Jira issues into mapped Paperclip projects
  and reuse linked Paperclip issues on later syncs.
- **FR-004**: The system MUST persist durable issue-link metadata including Jira
  issue key, url, status metadata, sync timestamps, and source provenance.
- **FR-005**: The system MUST persist durable comment-link metadata for pushed
  and pulled Jira comments.
- **FR-006**: The system MUST treat Jira upstream status and Paperclip local
  workflow status as separate fields; pull/import flows MUST NOT overwrite the
  Paperclip issue status merely because Jira status changed.
- **FR-007**: The system MUST expose a settings page, dashboard widget, issue
  detail contribution, comment annotation contribution, and toolbar actions.
- **FR-008**: The system MUST allow pure Paperclip issues in mapped projects to
  be pushed upstream to create Jira issues.
- **FR-009**: The system MUST allow synced issues to pull from Jira and push
  local title, description, and comment changes back to Jira through explicit
  actions.
- **FR-010**: The system MUST NOT persist raw Jira tokens in plugin state.
- **FR-011**: The system SHOULD support scheduled sync per company using a saved
  sync frequency.

### Key Entities *(include if feature involves data)*

- **Jira Mapping**: A company-scoped association between a Jira project or JQL
  feed and a Paperclip project, including sync cadence.
- **Jira Issue Link**: Durable metadata that binds one Paperclip issue to one
  Jira issue and stores upstream identifiers, status metadata, timestamps, and
  provenance.
- **Jira Comment Link**: Durable metadata that binds a Paperclip comment to a
  Jira comment and records push/pull direction plus last sync time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A configured operator can complete a manual sync for a mapped
  company and receive a success result with zero failed issues under valid Jira
  credentials.
- **SC-002**: Re-running sync on already imported Jira issues updates linked
  Paperclip issues instead of creating duplicates.
- **SC-003**: Synced issue details show both local Paperclip status and upstream
  Jira status clearly enough that an operator can tell which system owns each
  value without reading source code.
- **SC-004**: The repo-local contract suite covers import, sync metadata, and
  push flows closely enough to catch regressions in local-vs-upstream status
  handling.

## Assumptions

- Jira REST remains the runtime transport until Paperclip offers a supported
  plugin-to-MCP bridge or equivalent proxy.
- The current MVP scope covers issue title, description, comments, status
  metadata, and sync timestamps; richer field mapping is out of scope for this
  baseline.
- Paperclip remains the local planning surface even when Jira is the upstream
  system of record.
- Existing repository structure and build scripts remain the implementation
  baseline for this feature.
