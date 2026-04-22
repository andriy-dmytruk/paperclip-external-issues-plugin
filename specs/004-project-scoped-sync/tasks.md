# Tasks: Project-Scoped Jira Sync Setup

**Input**: Design documents from `/specs/004-project-scoped-sync/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/project-scoped-sync-ui.md`

**Tests**: Targeted contract and integration coverage should be updated in `tests/plugin.spec.ts`, with full verification through `pnpm typecheck`, `pnpm test`, and `pnpm build`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align docs and feature references before implementation starts

- [ ] T001 Update feature context references for the new project-scoped sync rollout in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/AGENTS.md`, `/Users/andriy/IdeaProjects/paperclip-jira-plugin/README.md`, and `/Users/andriy/IdeaProjects/paperclip-jira-plugin/SPEC.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared project-scoped state and worker/UI contracts that all user stories depend on

**⚠️ CRITICAL**: No user story work should begin until this phase is complete

- [ ] T002 Refactor worker settings types from company-scoped mappings to project-scoped configuration records in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T003 [P] Add shared project-scoped config and provider-selection helper types in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/plugin-config.ts`
- [ ] T004 [P] Add project selection and project sync state helper utilities in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/project-bindings.ts`
- [ ] T005 Extend worker data and action registrations to expose `sync.projects`, `sync.projectState`, `sync.project.save`, and `sync.project.refreshIdentity` in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T006 Update shared plugin contract coverage for the new project-scoped worker state shape in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts`

**Checkpoint**: Project-scoped settings infrastructure is ready for user story implementation

---

## Phase 3: User Story 1 - Configure sync from a project-first surface (Priority: P1) 🎯 MVP

**Goal**: Open sync directly in project context and make the global launcher start with project selection instead of target mapping selection

**Independent Test**: Open `Sync Issues` from a project and confirm the modal is already scoped to that project. Open it from the global launcher and confirm a project selector appears first.

- [ ] T007 [P] [US1] Add test coverage for project-scoped launcher context and global project selection behavior in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts`
- [ ] T008 [US1] Update launcher and popup state resolution to accept project context from global, project, and issue entry points in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T009 [US1] Refactor the sync modal state and project-selection flow for project-first rendering in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [ ] T010 [US1] Render empty-provider defaults for newly created Paperclip projects in the project-scoped sync UI in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Save one provider and one sync policy per project (Priority: P1)

**Goal**: Let each Paperclip project choose exactly one provider and persist its own defaults, cadence, filters, and project-only sync actions

**Independent Test**: Choose a provider for one project, confirm default assignee and default status populate correctly, save cadence and filters, and verify sync or hide actions affect only that project.

- [ ] T011 [P] [US2] Add test coverage for project-scoped provider selection, upload defaults, and project-only sync state in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts`
- [ ] T012 [US2] Implement project-scoped provider reference persistence, upload defaults, and filter defaults in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T013 [US2] Implement authenticated-user resolution for project default assignee with safe fallback behavior in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T014 [US2] Update the hosted sync UI to edit provider choice, default assignee, default status, cadence, and filters as one project configuration in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [ ] T015 [US2] Scope manual sync and hide-imported-issues actions to the selected project and return project-only progress in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T016 [US2] Update sync summaries and project-scoped action messaging in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently, with project-scoped config and actions

---

## Phase 5: User Story 3 - Keep issue-level sync actions simple for daily work (Priority: P2)

**Goal**: Preserve synced issue metadata while showing upload actions only for true local issues in configured projects

**Independent Test**: Open a synced issue and verify Jira status, assignee, and imported comments still appear. Open a local issue in a configured project and upload it to Jira.

- [ ] T017 [P] [US3] Add issue-detail and upload-flow coverage for configured and unconfigured projects in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts`
- [ ] T018 [US3] Update issue sync presentation to derive provider availability from project-scoped configuration without showing false upstream links in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T019 [US3] Update issue detail rendering and upload action availability for project-scoped provider settings in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [ ] T020 [US3] Route local issue upload through the selected project provider and preserve synced issue metadata plus imported comments behavior in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize migration compatibility, documentation, and end-to-end verification

- [ ] T021 Add compatibility handling for legacy mapping state migration into project-scoped settings in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [ ] T022 [P] Refresh user-facing documentation for the project-scoped sync model in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/README.md` and `/Users/andriy/IdeaProjects/paperclip-jira-plugin/SPEC.md`
- [ ] T023 Run end-to-end verification commands for the feature from `/Users/andriy/IdeaProjects/paperclip-jira-plugin/package.json` using `pnpm typecheck`, `pnpm test`, and `pnpm build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: US1**: Depends on Phase 2
- **Phase 4: US2**: Depends on Phase 2 and builds naturally on US1 popup flow
- **Phase 5: US3**: Depends on Phase 2 and on US2 project-scoped provider state
- **Phase 6: Polish**: Depends on completion of the desired user stories

### User Story Dependencies

- **US1**: Can start after foundational work; delivers the MVP navigation and scoping flow
- **US2**: Depends on the foundational project-scoped state model and is best implemented after US1 because it fills the project-scoped modal with saved policy fields
- **US3**: Depends on US2 because issue-level upload availability now comes from project-scoped provider configuration

### Within Each User Story

- Update story-specific tests before or alongside the implementation they validate
- Worker contract changes should land before the UI relies on them
- UI rendering changes should follow the worker data shape they consume

### Parallel Opportunities

- `T003` and `T004` can run in parallel after `T002`
- `T007` can run in parallel with `T008`
- `T011` can run in parallel with `T012`
- `T017` can run in parallel with `T018`
- `T022` can run in parallel with `T021` once the implementation shape is stable

---

## Parallel Example: User Story 1

```bash
Task: "Add test coverage for project-scoped launcher context and global project selection behavior in /Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts"
Task: "Update launcher and popup state resolution to accept project context from global, project, and issue entry points in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add test coverage for project-scoped provider selection, upload defaults, and project-only sync state in /Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts"
Task: "Implement project-scoped provider reference persistence, upload defaults, and filter defaults in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add issue-detail and upload-flow coverage for configured and unconfigured projects in /Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts"
Task: "Update issue sync presentation to derive provider availability from project-scoped configuration without showing false upstream links in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phases 1 and 2
2. Complete Phase 3 (US1)
3. Validate the project-first sync launch flow before expanding the settings model

### Incremental Delivery

1. Deliver US1 to prove the project-scoped navigation model
2. Deliver US2 to make project-scoped config, cadence, and project-only actions usable
3. Deliver US3 to reconnect issue detail and upload behavior to the new project-scoped model

### Suggested MVP Scope

- **MVP**: User Story 1 only
- **Next increment**: User Story 2
- **Final increment**: User Story 3 plus migration and docs polish

---

## Notes

- All tasks follow the required checklist format with task ID, optional parallel marker, optional story label, and exact file path
- The task list assumes implementation stays inside the existing single-package plugin structure
- Legacy company-scoped mappings should be treated as migration input, not as the ongoing source of truth
