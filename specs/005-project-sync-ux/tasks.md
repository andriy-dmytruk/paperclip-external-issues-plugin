# Tasks: Project-First Sync UX Refresh

**Input**: Design documents from `/specs/005-project-sync-ux/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/project-first-sync-ui.md`

**Tests**: Cross-cutting verification should be updated in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts`, with full validation through `pnpm typecheck`, `pnpm test`, and `pnpm build`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared UI helpers for page-oriented sync navigation and provider management

- [X] T001 [P] Add reusable provider-type and provider-page helper types in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/plugin-config.ts`
- [X] T002 [P] Add project-first sync navigation helpers for entry context and page routing in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/project-bindings.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the worker and hosted-UI contracts that all user stories depend on

**⚠️ CRITICAL**: No user story work should begin until this phase is complete

- [X] T003 [P] Rework launcher metadata so project and issue sync entry points are primary in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/manifest.ts`
- [X] T004 Refactor runtime launcher context and page-state contracts for project picker, project page, and provider pages in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [X] T005 [P] Extend provider summary and provider detail helper logic for dedicated provider pages in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/plugin-config.ts`
- [X] T006 [P] Add worker payload builders for `sync.entryContext`, `sync.projectList`, `sync.projectPage`, `settings.providerDirectory`, and `settings.providerDetail` in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [X] T007 Refactor the hosted sync shell to support page-level navigation between project picker, project page, and provider pages in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`

**Checkpoint**: Shared project-first sync infrastructure is ready for story delivery

---

## Phase 3: User Story 1 - Start sync from the right place (Priority: P1) 🎯 MVP

**Goal**: Make sync discoverable from the project and issue contexts while keeping the global flow limited to project selection first

**Independent Test**: Open a project and confirm `Sync Issues` is available in that project context. Open an issue and confirm `Sync Issues` appears alongside the other issue actions without relying on the global top-of-window button.

- [X] T008 [US1] Update project and issue sync entry rendering to open the project-first flow in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [X] T009 [US1] Implement the global sync start screen so it shows only project selection before project settings in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [X] T010 [P] [US1] Persist selected entry context and route chosen projects into dedicated project pages in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [X] T011 [P] [US1] Render the dedicated project page header, project context summary, and back navigation in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Configure one project and one provider at a time (Priority: P1)

**Goal**: Separate provider management from project configuration and reveal project controls only after provider selection

**Independent Test**: Open plugin settings, go to the providers page, create or edit a provider from a dedicated provider page, then open one project's sync page and confirm only `Hide imported issues` is available before a provider is selected.

- [X] T012 [P] [US2] Implement provider directory and provider detail state persistence with provider-type selector support in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [X] T013 [P] [US2] Build the dedicated providers settings page and provider detail page with `Back` navigation in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [X] T014 [US2] Enforce provider-gated disclosure so only provider selection and `Hide imported issues` appear before provider choice in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [X] T015 [US2] Preserve provider-cleared project state and `Hide imported issues` availability in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [X] T016 [US2] Render selected-provider project settings, save actions, and provider summary inside the dedicated project page in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently, with clear provider and project separation

---

## Phase 5: User Story 3 - Understand synced issue details and comment publishing (Priority: P2)

**Goal**: Align synced issue detail styling with dark mode, distinguish imported comments, and add upstream publication to the existing comment flow

**Independent Test**: Open a synced issue in dark mode, confirm the buttons and panels match the host styling expectations, verify imported comments are visually distinct, and add a new comment using the standard comment field with a `Publish to upstream` option.

- [X] T017 [P] [US3] Adjust synced issue action and status panel styling for Paperclip dark mode in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [X] T018 [P] [US3] Extend comment sync presentation metadata for imported-comment styling and publish intent in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`
- [X] T019 [US3] Render imported comment provenance styling and badges in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [X] T020 [US3] Extend the standard synced-issue comment composer with a `Publish to upstream` control in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx`
- [X] T021 [US3] Handle local-only versus upstream-publish comment submission in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish verification, docs, and reusable contract coverage

- [X] T022 [P] Refresh user-facing behavior docs for project-first sync navigation, provider pages, dark-mode styling, and comment publishing in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/README.md` and `/Users/andriy/IdeaProjects/paperclip-jira-plugin/SPEC.md`
- [X] T023 [P] Update project-first navigation, provider-page, and comment-publish contract coverage in `/Users/andriy/IdeaProjects/paperclip-jira-plugin/tests/plugin.spec.ts`
- [X] T024 Run `pnpm typecheck`, `pnpm test`, and `pnpm build` from `/Users/andriy/IdeaProjects/paperclip-jira-plugin/package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: US1**: Depends on Phase 2
- **Phase 4: US2**: Depends on Phase 2 and is best implemented after US1 establishes the project-page flow
- **Phase 5: US3**: Depends on Phase 2 and on US2 for stable project/provider page state
- **Phase 6: Polish**: Depends on completion of the desired user stories

### User Story Dependencies

- **US1**: Can start after foundational work and delivers the MVP entry-point and project-selection flow
- **US2**: Depends on the project-page shell from US1 and adds provider-directory plus provider-gated configuration
- **US3**: Depends on US2 because synced issue presentation and comment publishing rely on the final project/provider flow

### Within Each User Story

- Worker data contracts should land before UI elements rely on them
- Page-level navigation should be stable before provider-gated disclosure is layered on top
- Comment provenance metadata should land before comment styling and publish controls consume it

### Parallel Opportunities

- `T001` and `T002` can run in parallel
- `T003`, `T005`, and `T006` can run in parallel after setup begins
- `T010` and `T011` can run in parallel once the global start screen is in place
- `T012` and `T013` can run in parallel once the foundational page shell is ready
- `T017` and `T018` can run in parallel before the final comment UX wiring
- `T022` and `T023` can run in parallel after implementation stabilizes

---

## Parallel Example: User Story 1

```bash
Task: "Persist selected entry context and route chosen projects into dedicated project pages in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts"
Task: "Render the dedicated project page header, project context summary, and back navigation in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Implement provider directory and provider detail state persistence with provider-type selector support in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts"
Task: "Build the dedicated providers settings page and provider detail page with Back navigation in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Adjust synced issue action and status panel styling for Paperclip dark mode in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/ui/index.tsx"
Task: "Extend comment sync presentation metadata for imported-comment styling and publish intent in /Users/andriy/IdeaProjects/paperclip-jira-plugin/src/worker.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phases 1 and 2
2. Complete Phase 3 (US1)
3. Validate the project and issue entry-point experience before expanding provider and comment work

### Incremental Delivery

1. Deliver US1 to prove sync is discoverable from the right project and issue surfaces
2. Deliver US2 to separate provider management from project configuration and reduce setup confusion
3. Deliver US3 to polish the synced issue experience with dark-mode and comment improvements

### Suggested MVP Scope

- **MVP**: User Story 1 only
- **Next increment**: User Story 2
- **Final increment**: User Story 3 plus documentation, coverage, and verification

---

## Notes

- All tasks follow the required checklist format with task ID, optional parallel marker, optional story label, and exact file path
- The task list assumes implementation stays inside the existing single-package plugin structure
- Provider definitions remain reusable instance-level records even though the UI now exposes them on dedicated settings pages
