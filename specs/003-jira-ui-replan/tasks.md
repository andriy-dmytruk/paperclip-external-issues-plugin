# Tasks: Provider-Aware Jira UI Replan

**Input**: Design documents from `/specs/003-jira-ui-replan/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/provider-sync-ui.md, quickstart.md

**Tests**: Verification is required for this feature. Expand `tests/plugin.spec.ts` for worker/UI contract coverage and run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. [US1], [US2], [US3])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align repo docs and active feature context before implementation

- [ ] T001 Update repo guidance references for the UI replan in `<repo-root>/AGENTS.md`, `<repo-root>/README.md`, and `<repo-root>/SPEC.md`
- [ ] T002 [P] Add or refresh provider-aware config helper scaffolding in `<repo-root>/src/ui/plugin-config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared provider-aware worker/UI contracts that all stories depend on

**⚠️ CRITICAL**: No user story work should be considered complete until this phase is done

- [ ] T003 Expand provider-aware plugin instance config and manifest schema in `<repo-root>/src/manifest.ts`
- [ ] T004 Implement shared provider definition, provider popup state, and sync progress bridge data in `<repo-root>/src/worker.ts`
- [ ] T005 [P] Add shared TypeScript UI state helpers for provider popup rendering and issue/comment sync presentation in `<repo-root>/src/ui/index.tsx`
- [ ] T006 [P] Add foundational worker/UI contract coverage for provider popup state and synced issue presentation in `<repo-root>/tests/plugin.spec.ts`

**Checkpoint**: Provider-aware worker/UI foundation is ready and all user stories can build on it

---

## Phase 3: User Story 1 - Configure issue sync through a complete provider popup (Priority: P1) 🎯 MVP

**Goal**: Deliver a single Paperclip-hosted sync popup that supports provider selection, Jira configuration, connection testing, filters, and sync start from one flow

**Independent Test**: Open the sync popup, configure Jira, test the connection, set filters, and start a sync without leaving the popup

### Tests for User Story 1

- [ ] T007 [P] [US1] Add worker contract tests for provider config save, token masking state, and connection testing in `<repo-root>/tests/plugin.spec.ts`
- [ ] T008 [P] [US1] Add sync popup rendering and interaction coverage for provider selection and filter inputs in `<repo-root>/tests/plugin.spec.ts`

### Implementation for User Story 1

- [ ] T009 [US1] Implement provider config persistence and connection test actions in `<repo-root>/src/worker.ts`
- [ ] T010 [P] [US1] Implement provider-aware popup UI with Jira config fields, token-state handling, and filter controls in `<repo-root>/src/ui/index.tsx`
- [ ] T011 [US1] Wire the sync popup launcher into existing settings and toolbar entry points in `<repo-root>/src/ui/index.tsx`

**Checkpoint**: User Story 1 is independently usable as the new sync entry flow

---

## Phase 4: User Story 2 - Track sync progress with exact feedback (Priority: P1)

**Goal**: Show trustworthy in-progress and final sync feedback, including processed counts and completion state

**Independent Test**: Start a sync and verify the popup shows running progress and final imported/updated/skipped/failed counts

### Tests for User Story 2

- [ ] T012 [P] [US2] Add worker tests for processed and total progress reporting in `<repo-root>/tests/plugin.spec.ts`
- [ ] T013 [P] [US2] Add popup UI tests for running, success, and error progress states in `<repo-root>/tests/plugin.spec.ts`

### Implementation for User Story 2

- [ ] T014 [US2] Extend manual sync worker state to expose processed count, total count, and final summary metrics in `<repo-root>/src/worker.ts`
- [ ] T015 [US2] Implement progress bar or equivalent completion display plus result summary messaging in `<repo-root>/src/ui/index.tsx`

**Checkpoint**: User Story 2 gives the new popup reliable, visible progress feedback

---

## Phase 5: User Story 3 - Distinguish synced issues from pure Paperclip issues in the issue display (Priority: P1)

**Goal**: Make synced issues visually obvious and surface provider metadata, local/upstream status, and `Open in Jira` prominently

**Independent Test**: View mixed local and synced issues and verify synced issues are clearly marked, with a title-prefix fallback where styling hooks are unavailable

### Tests for User Story 3

- [ ] T016 [P] [US3] Add worker tests for synced issue presentation metadata including title prefix and open-in-provider URL in `<repo-root>/tests/plugin.spec.ts`
- [ ] T017 [P] [US3] Add UI tests for synced issue badges, local-vs-upstream status display, and visible `Open in Jira` action in `<repo-root>/tests/plugin.spec.ts`

### Implementation for User Story 3

- [ ] T018 [US3] Extend issue presentation bridge data with synced/local visual metadata, fallback title prefix, and `Open in Jira` button state in `<repo-root>/src/worker.ts`
- [ ] T019 [US3] Rework synced issue display and detail integration in `<repo-root>/src/ui/index.tsx`
- [ ] T020 [US3] Apply synced title-prefix fallback behavior where richer styling is not possible in `<repo-root>/src/worker.ts` and `<repo-root>/src/ui/index.tsx`

**Checkpoint**: User Story 3 makes synced issues visibly different and better integrated in the issue UI

---

## Phase 6: User Story 4 - Work with fetched comments as synced content (Priority: P2)

**Goal**: Make upstream-fetched comments obvious, editable locally, and explicitly uploadable to the provider

**Independent Test**: Pull comments on a synced issue, verify their upstream-origin UI, edit locally, and upload an existing comment upstream

### Tests for User Story 4

- [ ] T021 [P] [US4] Add worker tests for comment sync presentation and upload action behavior in `<repo-root>/tests/plugin.spec.ts`
- [ ] T022 [P] [US4] Add UI tests for fetched comment origin markers and upload controls in `<repo-root>/tests/plugin.spec.ts`

### Implementation for User Story 4

- [ ] T023 [US4] Extend comment annotation and issue comment sync worker data/actions for fetched-origin display and existing-comment upload in `<repo-root>/src/worker.ts`
- [ ] T024 [US4] Rework comment UI messaging and upload actions in `<repo-root>/src/ui/index.tsx`

**Checkpoint**: User Story 4 makes comment sync understandable and actionable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, docs, and verification across all stories

- [ ] T025 [P] Update operator-facing docs for the provider-aware sync popup and synced issue/comment UI in `<repo-root>/README.md` and `<repo-root>/SPEC.md`
- [ ] T026 [P] Capture reusable provider-aware Paperclip plugin UI/worker patterns in the appropriate shared skills if they generalize beyond this repo
- [ ] T027 Run end-to-end repo verification with `pnpm typecheck`, `pnpm test`, and `pnpm build` from `<repo-root>`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Stories (Phases 3-6)**: Depend on Foundational completion
- **Polish (Phase 7)**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational completion
- **User Story 2 (P1)**: Depends on User Story 1’s popup foundation and sync bridge state
- **User Story 3 (P1)**: Depends on Foundational completion and can proceed alongside User Story 2 after the shared popup/presentation contract exists
- **User Story 4 (P2)**: Depends on Foundational completion and existing synced issue/comment link metadata

### Within Each User Story

- Add or update tests before or alongside implementation to cover the target contract
- Worker bridge/state changes before final UI wiring
- Core UI rendering before polish and copy refinement

### Parallel Opportunities

- T002 can run in parallel with T001
- T005 and T006 can run in parallel after T003/T004 begin to settle
- Within each user story, `[P]` test tasks can run in parallel
- User Story 2 and User Story 3 can overlap once the foundational provider-aware contract is in place

---

## Parallel Example: User Story 3

```bash
Task: "Add worker tests for synced issue presentation metadata including title prefix and open-in-provider URL in tests/plugin.spec.ts"
Task: "Add UI tests for synced issue badges, local-vs-upstream status display, and visible Open in Jira action in tests/plugin.spec.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. **STOP and VALIDATE** the new sync popup flow end-to-end

### Incremental Delivery

1. Land provider-aware popup configuration and sync start flow
2. Add exact progress feedback
3. Improve synced issue presentation and `Open in Jira`
4. Finish comment sync clarity and upload actions
5. Refresh docs and verification

### Suggested MVP Scope

User Story 1 + User Story 2 provide the most valuable initial slice because they
replace the fragmented sync flow with a cohesive popup and trustworthy progress
feedback.

---

## Notes

- All tasks use exact file paths
- User stories remain independently testable where possible
- Local Paperclip status and upstream provider status must stay separate during
  implementation
- Avoid manifest identity changes or persisted key renames unless explicitly
  justified and documented
