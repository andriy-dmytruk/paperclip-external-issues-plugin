# Tasks: Issue Sync Refactor

**Input**: Design documents from `/specs/006-issue-sync-refactor/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are required for this feature because test decomposition and deterministic sync behavior are explicit requirements.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- All tasks include concrete file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare baseline folders and shared scaffolding for refactor.

- [X] T001 Create worker module folders and index files under `src/worker/core/`, `src/worker/sync/`, and `src/worker/providers/`
- [X] T002 Create shared test helper folders and baseline modules under `tests/helpers/` and `tests/sync/`
- [X] T003 [P] Add/update barrel exports for newly introduced worker module entry points in `src/worker/` files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Introduce shared contracts and foundational abstractions required by all stories.

**⚠️ CRITICAL**: No user-story completion until this phase is done.

- [X] T004 Add canonical synced-link identity utilities in `src/worker/sync/identity.ts`
- [X] T005 Add worker shared types/interfaces for sync runtime and reconciliation in `src/worker/core/types.ts`
- [X] T006 Extract plugin settings/state read-write helpers from `src/worker.ts` into `src/worker/core/state.ts`
- [X] T007 [P] Add provider-operation orchestration interface wrapper module in `src/worker/providers/operations.ts`
- [X] T008 Wire `src/worker.ts` to consume new worker-core modules without behavior change
- [X] T009 Add foundational regression tests for extracted core helpers in `tests/sync/core-state.spec.ts`

**Checkpoint**: Foundation ready for story implementation.

---

## Phase 3: User Story 1 - Predictable Sync Identity (Priority: P1) 🎯 MVP

**Goal**: Guarantee idempotent sync reconciliation and prevent duplicate issue recreation.

**Independent Test**: Repeated sync runs and reload/provider-recreate flows update existing synced issues instead of creating duplicates.

### Tests for User Story 1

- [X] T010 [P] [US1] Add identity-key derivation and normalization tests in `tests/sync/identity-reconciliation.spec.ts`
- [ ] T011 [P] [US1] Add duplicate-prevention sync regression tests in `tests/sync/duplicate-prevention.spec.ts`
- [ ] T012 [US1] Add legacy-link compatibility reconciliation tests in `tests/sync/legacy-link-migration.spec.ts`

### Implementation for User Story 1

- [X] T013 [US1] Implement deterministic upstream identity derivation helpers in `src/worker/sync/identity.ts`
- [X] T014 [US1] Persist normalized synced metadata and identity keys during sync/link updates in `src/worker/sync/reconcile.ts`
- [ ] T015 [US1] Update sync import/update flow to reconcile by identity before create in `src/worker/sync/reconcile.ts`
- [ ] T016 [US1] Add legacy metadata fallback derivation path in `src/worker/sync/legacy.ts`
- [ ] T017 [US1] Integrate US1 reconciliation modules into worker execution path in `src/worker.ts`

**Checkpoint**: US1 works independently and prevents duplicates.

---

## Phase 4: User Story 2 - Maintainable Responsibility Boundaries (Priority: P1)

**Goal**: Split worker and tests by responsibility for readability and maintainability.

**Independent Test**: Maintainers can modify sync orchestration, config state, and provider routing in separate modules while all tests still pass.

### Tests for User Story 2

- [X] T018 [P] [US2] Split monolithic plugin tests into sync-focused suites in `tests/sync/*.spec.ts`
- [ ] T019 [P] [US2] Split provider-behavior tests into `tests/providers/*.spec.ts`
- [X] T020 [US2] Add shared harness/helper classes in `tests/helpers/harness.ts` and `tests/helpers/fixtures.ts`

### Implementation for User Story 2

- [ ] T021 [US2] Extract worker action/data registration wiring into `src/worker/core/registration.ts`
- [ ] T022 [US2] Extract sync execution orchestration into `src/worker/sync/orchestrator.ts`
- [ ] T023 [US2] Extract project/page toolbar data builders into `src/worker/core/project-page.ts`
- [ ] T024 [US2] Reduce `src/worker.ts` to composition/bootstrap layer using extracted modules
- [ ] T025 [US2] Keep public behavior stable by updating imports/exports and type wiring across extracted files

**Checkpoint**: Worker/test structure is decomposed and readable.

---

## Phase 5: User Story 3 - Consistent Background Sync UX (Priority: P2)

**Goal**: Keep background sync status deterministic per project and align UI icon usage on lucide-react.

**Independent Test**: Per-project status reflects project-specific runs and sync controls use a consistent lucide icon system.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add project-scoped sync-status tests in `tests/sync/project-status.spec.ts`
- [ ] T027 [US3] Add UI contract tests for toolbar/status data shaping in `tests/ui-contract/toolbar-state.spec.ts`

### Implementation for User Story 3

- [ ] T028 [US3] Isolate project-scoped sync-state update/read helpers in `src/worker/core/sync-status.ts`
- [ ] T029 [US3] Ensure background sync paths use project-scoped status helpers in `src/worker/sync/orchestrator.ts`
- [ ] T030 [US3] Centralize icon rendering on `lucide-react` components in `src/ui/index.tsx`
- [ ] T031 [US3] Remove remaining custom primary action SVG icon paths from shared action controls in `src/ui/index.tsx`

**Checkpoint**: Sync status UX and icon consistency are independently verifiable.

---

## Phase 6: User Story 4 - Provider-Agnostic Contract Enforcement (Priority: P2)

**Goal**: Enforce that all Jira/GitHub API calls stay inside providers and shared orchestration is provider-agnostic.

**Independent Test**: Provider-routing tests pass while shared orchestration imports no provider-specific API clients.

### Tests for User Story 4

- [ ] T032 [P] [US4] Add provider contract/routing tests in `tests/providers/provider-routing.spec.ts`
- [ ] T033 [US4] Add adapter parity tests for issue/comment/assignee/status flows in `tests/providers/provider-contract.spec.ts`

### Implementation for User Story 4

- [ ] T034 [US4] Move remaining direct Jira/GitHub upstream operations from `src/worker.ts` to `src/providers/*/adapter.ts`
- [ ] T035 [US4] Route worker issue/comment/status/assignee operations via provider-operation wrapper in `src/worker/providers/operations.ts`
- [ ] T036 [US4] Add/strengthen provider capability checks and canonical conversions in `src/providers/shared/registry.ts`
- [ ] T037 [US4] Remove provider-specific API-type leakage from shared worker modules in `src/worker/core/*.ts`

**Checkpoint**: Provider boundary contract is enforced and test-covered.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, docs, and verification passes.

- [ ] T038 [P] Update refactor architecture and testing layout notes in `README.md`
- [ ] T039 [P] Update feature/scope expectations in `SPEC.md`
- [ ] T040 Run full verification (`pnpm typecheck`, `pnpm test`, `pnpm build`) and capture results in `specs/006-issue-sync-refactor/quickstart.md`
- [ ] T041 Verify no unchecked tasks remain and mark completed tasks in `specs/006-issue-sync-refactor/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): no dependencies
- Phase 2 (Foundational): depends on Phase 1
- Phase 3 (US1): depends on Phase 2
- Phase 4 (US2): depends on Phase 2 (can proceed after US1 baseline is stable)
- Phase 5 (US3): depends on Phase 2 and status-related extractions from US2
- Phase 6 (US4): depends on Phase 2 and provider wrapper from foundational phase
- Phase 7 (Polish): depends on selected user stories being complete

### User Story Dependencies

- US1 is MVP and should land first.
- US2 can progress in parallel with US1 late-stage hardening if file ownership is isolated.
- US3 depends on US2 module boundaries for clean project-status handling.
- US4 depends on foundational provider wrappers and extracted orchestration seams.

### Within Each User Story

- Write/adjust tests before final implementation changes.
- Shared helpers/classes before dependent suites.
- Core behavior changes before integration wiring.

### Parallel Opportunities

- Tasks marked `[P]` within the same phase can run in parallel where file overlap is absent.
- Test-splitting tasks and helper extraction can run in parallel with non-overlapping worker module extraction.

---

## Parallel Example: User Story 2

```bash
# Parallel test decomposition work:
Task: "Split monolithic plugin tests into sync-focused suites in tests/sync/*.spec.ts"
Task: "Split provider-behavior tests into tests/providers/*.spec.ts"

# In parallel with helper scaffolding:
Task: "Add shared harness/helper classes in tests/helpers/harness.ts and tests/helpers/fixtures.ts"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Setup + Foundational.
2. Deliver US1 deterministic identity reconciliation and duplicate prevention.
3. Validate with repeat-sync and reload/provider-recreate scenarios.

### Incremental Delivery

1. US1: idempotent sync identity and duplicate prevention.
2. US2: worker/test decomposition for readability and maintainability.
3. US3: per-project status consistency + icon standardization.
4. US4: strict provider boundary enforcement and contract parity.

### Team Parallelization

1. One stream decomposes worker modules.
2. One stream decomposes tests and helper classes.
3. One stream hardens provider boundary contract and adapter parity.
