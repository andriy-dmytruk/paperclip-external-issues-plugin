# Research: Issue Sync Refactor

## Decision 1: Use deterministic upstream identity keys for idempotent sync

- **Decision**: Introduce a canonical `upstreamIdentityKey` for every synced
  link, derived from provider type + provider scope + upstream issue identifier
  (for example repository/project namespace + issue number or key).
- **Rationale**: This creates a stable identity independent of mutable provider
  record ids, so recreated providers or restarts still reconcile to existing
  local synced issues.
- **Alternatives considered**:
  - Keep matching by provider id + upstream key only: rejected because provider
    recreation breaks continuity.
  - Match by title/body heuristics: rejected because it is nondeterministic and
    unsafe for duplicates.

## Decision 2: Separate worker responsibilities into explicit modules

- **Decision**: Split `src/worker.ts` into responsibility-focused modules for:
  config/state, sync orchestration, identity reconciliation, provider routing,
  issue/comment mutations, registration wiring, and diagnostics.
- **Rationale**: Smaller modules reduce cognitive load, isolate regressions, and
  enable targeted tests and future provider growth.
- **Alternatives considered**:
  - Keep one large worker with comments/regions: rejected because complexity and
    merge risk remain high.
  - Split only helper utilities: rejected because orchestration and registration
    coupling would still dominate one file.

## Decision 3: Enforce provider-boundary architecture

- **Decision**: All Jira/GitHub API calls must live in provider adapter modules;
  shared orchestration uses only provider interface contracts and canonical
  models.
- **Rationale**: Prevents provider leakage, keeps shared sync predictable, and
  makes adding providers additive.
- **Alternatives considered**:
  - Keep selective direct calls in worker “for convenience”: rejected because it
    reintroduces boundary violations and regression risk.
  - Duplicate orchestration per provider: rejected because it fragments behavior
    and multiplies maintenance.

## Decision 4: Keep background sync and configuration workflows distinct

- **Decision**: Treat background sync execution as runtime orchestration with
  per-project status state, and keep configuration mutations in separate module
  paths and UI flows.
- **Rationale**: Reduces accidental coupling and improves status correctness per
  active project.
- **Alternatives considered**:
  - Merge save-and-sync logic deeply into one pathway: rejected because it blurs
    control flow and makes failures harder to reason about.

## Decision 5: Standardize plugin icons on lucide-react

- **Decision**: Replace custom inline action icons in primary controls with
  `lucide-react` components and centralize icon rendering in shared UI helpers.
- **Rationale**: Improves consistency with host visual language and removes
  custom SVG drift.
- **Alternatives considered**:
  - Keep mixed custom SVG + lucide usage: rejected because inconsistent styling
    continues.
  - Use only text labels: rejected because action recognizability degrades.

## Decision 6: Compatibility strategy for legacy synced metadata

- **Decision**: Add a reconciliation compatibility layer that can infer or
  migrate missing identity metadata from existing link records and provider
  fields before deciding create vs update.
- **Rationale**: Preserves existing installations and prevents duplicate
  recreation during transition.
- **Alternatives considered**:
  - Hard reset old synced links: rejected because it breaks continuity and can
    duplicate large issue sets.
  - Ignore legacy records: rejected because it fails real-world upgrade paths.

## Decision 7: Split monolithic test coverage into responsibility suites

- **Decision**: Decompose the current large integration-heavy plugin test file
  into multiple responsibility-oriented suites (identity reconciliation, provider
  routing, project sync status, UI contract data shaping), with shared fixtures
  and helper classes/utilities.
- **Rationale**: Large test files are difficult to maintain, slow to navigate,
  and increase accidental coupling between unrelated scenarios.
- **Alternatives considered**:
  - Keep a single test file and only add comments/sections: rejected because
    structural complexity remains.
  - Move only fixtures to helpers: rejected because scenario discoverability and
    suite ownership still remain poor.
