# Feature Specification: Issue Sync Refactor

**Feature Branch**: `[006-issue-sync-refactor]`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: User description: "Refactor the plugin by splitting large files by responsibility, making synchronization predictable with stable synced-issue metadata and no duplicate recreation, keeping provider API logic inside provider modules behind a generic interface, and standardizing UI icons with the host-consistent icon set."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Predictable Sync Identity (Priority: P1)

As a project owner, I want synced issues to be matched to existing local issues by stable upstream identity so repeated sync runs never create duplicate local issues for the same upstream issue.

**Why this priority**: Duplicate issue creation causes data confusion, cleanup burden, and loss of trust in sync correctness.

**Independent Test**: Can be fully tested by running sync repeatedly for the same mapped project, including after plugin restart or provider reconfiguration, and verifying no duplicate local issues are created for previously synced upstream issues.

**Acceptance Scenarios**:

1. **Given** an upstream issue that was synced previously, **When** sync runs again, **Then** the existing local synced issue is updated instead of a new local issue being created.
2. **Given** plugin state where provider definitions were recreated, **When** sync runs for a mapped project, **Then** existing synced local issues are still recognized and not duplicated.
3. **Given** a local issue marked as synced, **When** sync reconciliation runs, **Then** the issue carries stable metadata that supports cleanup and deterministic matching.

---

### User Story 2 - Maintainable Responsibility Boundaries (Priority: P1)

As a maintainer, I want synchronization orchestration, configuration handling, provider adapters, and UI behavior separated into clear modules so changes are easier to make without regressions.

**Why this priority**: Current oversized files increase risk and slow delivery for fixes and new provider support.

**Independent Test**: Can be fully tested by reviewing module boundaries and running existing automated tests to confirm behavior remains unchanged after refactor.

**Acceptance Scenarios**:

1. **Given** a change request for provider-specific behavior, **When** a maintainer updates provider logic, **Then** shared sync orchestration and unrelated UI modules do not require direct edits.
2. **Given** a change request for sync scheduling or reconciliation behavior, **When** a maintainer updates sync orchestration, **Then** provider API client modules remain unchanged unless provider behavior itself changes.

---

### User Story 3 - Consistent Background Sync UX (Priority: P2)

As a user, I want sync execution and status reporting to be predictable, with background sync separated from configuration editing and UI controls using consistent iconography.

**Why this priority**: Users need confidence that configuration actions and background sync actions are distinct, understandable, and visually consistent.

**Independent Test**: Can be fully tested by configuring a project, running sync, and validating that sync status and controls remain clear while icons are consistent across plugin surfaces.

**Acceptance Scenarios**:

1. **Given** a configured project, **When** background sync runs, **Then** status reporting reflects the current project’s latest run outcome and does not misreport another project’s status.
2. **Given** plugin toolbar and sync surfaces, **When** a user views actions, **Then** icon usage is consistent across controls and aligned with the standard icon set used in the host experience.

---

### User Story 4 - Provider-Agnostic Contract Enforcement (Priority: P2)

As a maintainer, I want all Jira and GitHub upstream operations to be routed through provider adapters implementing a shared contract so provider expansion and testing are reliable.

**Why this priority**: Provider-specific logic leaking into shared orchestration increases defects and blocks future provider growth.

**Independent Test**: Can be fully tested by running contract-style tests that exercise sync, issue updates, assignee updates, and comments through provider adapters only.

**Acceptance Scenarios**:

1. **Given** a sync run for any supported provider, **When** the worker fetches or updates upstream issues, **Then** calls are executed through provider adapter interfaces rather than shared orchestration directly calling provider APIs.
2. **Given** provider adapter contract tests, **When** both Jira and GitHub providers are exercised, **Then** both pass equivalent behavior checks for issue query and mutation flows they support.

---

### Edge Cases

- Existing synced issues that lack complete metadata from older plugin versions must still be reconciled without creating duplicates.
- A mapped project switching providers must not cross-link identities between unrelated upstream systems.
- Background sync must skip projects with syncing disabled or with no active provider selection.
- Cleanup candidate detection must continue to work for synced issues even after metadata normalization.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist synced-issue metadata that explicitly marks a local issue as synced and includes a stable upstream identity key.
- **FR-002**: System MUST compute upstream identity deterministically from provider context and upstream issue identity so the same upstream issue resolves to the same local synced issue across runs.
- **FR-003**: System MUST reconcile incoming upstream issues against existing synced local issues using the stable identity before deciding to create a new local issue.
- **FR-004**: System MUST prevent duplicate local issue creation for already-synced upstream issues during manual sync and background sync.
- **FR-005**: System MUST keep background synchronization orchestration separate from configuration management responsibilities.
- **FR-006**: System MUST modularize worker responsibilities so synchronization, configuration/state management, provider registry/adapters, and diagnostics are independently readable and testable.
- **FR-007**: System MUST ensure all provider-specific upstream operations (query, create, update, status change, assignee change, comments) are executed through provider adapter modules implementing a shared contract.
- **FR-008**: System MUST keep shared orchestration provider-agnostic and must not directly call Jira- or GitHub-specific APIs outside provider modules.
- **FR-009**: System MUST preserve behavior compatibility for existing configured projects, mappings, and synced links during and after refactor.
- **FR-010**: System MUST preserve cleanup behavior for synced issues by relying on normalized synced metadata and identity mapping.
- **FR-011**: UI MUST render plugin action icons through a single standardized icon set so toolbar/actions appear consistent across plugin surfaces.
- **FR-012**: System MUST expose per-project sync status that reflects the latest run result for that same project, including failures.
- **FR-013**: Automated tests MUST be organized into focused, responsibility-based suites rather than one monolithic sync test file.
- **FR-014**: Reusable test setup and assertion logic MUST be extracted into shared test helpers/classes to keep test intent readable and reduce duplication.

### Key Entities *(include if feature involves data)*

- **Synced Issue Metadata**: Local issue metadata marking sync participation, cleanup eligibility, provider identity, and stable upstream identity key.
- **Upstream Identity Key**: Deterministic identifier derived from provider scope and upstream issue identifier, used for idempotent reconciliation.
- **Provider Adapter Contract**: Shared provider interface defining upstream issue query and mutation capabilities used by orchestration.
- **Project Sync Runtime State**: Per-project record of current configuration and latest sync outcome used for UI status and operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In repeated sync runs on the same mapped project, 0 duplicate local issues are created for upstream issues that were previously synced.
- **SC-002**: On plugin reload or provider reconfiguration, at least 99% of previously synced issues are matched to existing local issues rather than recreated.
- **SC-003**: Maintainers can locate and update synchronization orchestration, provider adapters, and configuration logic in separate modules without editing a single monolithic worker file.
- **SC-004**: Project-level sync status shown in UI reflects the latest run outcome for the current project in 100% of tested project-switching flows.
- **SC-005**: Plugin action controls use a consistent icon style across toolbar, sync controls, and configuration surfaces with no mixed icon systems.
- **SC-006**: Test contributors can locate sync identity, provider adapter, configuration, and UI-contract tests in separate focused test modules without navigating a single large test file.

## Assumptions

- Existing synced issues may contain incomplete legacy metadata; migration/reconciliation logic will normalize or infer required identity where possible.
- Initial provider scope remains Jira and GitHub, but contract design should remain additive for future providers.
- Refactor preserves external behavior where already working unless explicitly corrected for determinism or duplicate prevention.
- Automated and manual verification flows currently used in this repository remain available for regression validation.
