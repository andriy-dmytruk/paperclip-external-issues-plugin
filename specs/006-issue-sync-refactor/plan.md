# Implementation Plan: Issue Sync Refactor

**Branch**: `006-issue-sync-refactor` | **Date**: 2026-04-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-issue-sync-refactor/spec.md`

## Summary

Refactor the plugin into clearer module boundaries so synchronization
orchestration, configuration/state management, provider-specific API access, UI
concerns, and automated tests are independently maintainable. Introduce
deterministic synced-issue identity metadata to guarantee idempotent
reconciliation across reruns and provider reconfiguration, standardize UI icon
usage on `lucide-react`, and split monolithic tests into responsibility-driven
suites with shared helpers/classes.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: `@paperclipai/plugin-sdk`, React 19, `@octokit/rest`,
generated Jira DC client, `lucide-react`, esbuild, tsx  
**Storage**: Paperclip plugin instance config + plugin state + issue metadata
fields on Paperclip issues/comments  
**Testing**: `pnpm typecheck`, `pnpm test`, `pnpm build`, targeted manual
verification in hosted Paperclip UI  
**Target Platform**: Paperclip hosted worker runtime + Paperclip hosted UI
slots  
**Project Type**: Single-package Paperclip plugin  
**Performance Goals**: 0 duplicate local issue creation for already-synced
upstream issues in repeat sync runs; deterministic reconciliation on reload  
**Constraints**: Keep plugin id and persisted compatibility contracts stable;
provider-specific API calls must stay inside provider modules; avoid secret
material in plugin state; keep background sync project-scoped and predictable  
**Scale/Scope**: One plugin package, two active providers (Jira, GitHub),
multiple UI slots, one scheduled sync job, one monolithic worker being split
into responsibility modules, and one monolithic plugin test suite being split
into focused suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stable Paperclip Plugin Identity**: Pass. Refactor keeps manifest identity
  stable and introduces compatibility-safe metadata expansion rather than key
  replacement.
- **Paperclip-Native Experience First**: Pass. UI remains in hosted slots and
  will further align iconography with host style using `lucide-react`.
- **Provider Boundaries Stay Explicit**: Pass. Planned architecture moves all
  Jira/GitHub upstream APIs behind provider adapters and keeps orchestration
  provider-agnostic.
- **Verification Is Mandatory**: Pass. Plan includes full repo quality gate and
  manual sync-idempotency verification scenarios.
- **Docs And Reusable Patterns Stay In Sync**: Pass. Plan includes updates to
  `README.md`, `SPEC.md`, and shared skills if new reusable backend/UI patterns
  emerge.

Post-design re-check: Research, data model, contract, and quickstart artifacts
remain compliant with all constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/006-issue-sync-refactor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── provider-sync-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── manifest.ts
├── worker.ts
├── issue-provider-agent-tools.ts
├── providers/
│   ├── index.ts
│   ├── shared/
│   │   ├── config.ts
│   │   ├── registry.ts
│   │   └── types.ts
│   ├── jira-dc/adapter.ts
│   ├── jira-cloud/adapter.ts
│   └── github-issues/adapter.ts
├── ui/
│   ├── index.tsx
│   ├── plugin-config.ts
│   ├── assignees.ts
│   ├── project-bindings.ts
│   ├── plugin-installation.ts
│   └── http.ts
└── github-agent-tools.ts

tests/
├── plugin.spec.ts
├── jira-wadl.spec.ts
└── build-script.spec.mjs
```

**Structure Decision**: Keep the single-package plugin structure while
decomposing current monoliths into worker and UI submodules by responsibility.
Worker decomposition will introduce focused modules under `src/worker/` (sync
orchestration, metadata identity/reconciliation, configuration/state, action/data
registration), while provider adapters remain under `src/providers/` with
shared contracts in `src/providers/shared/`. Test decomposition will introduce
focused suites under `tests/` (for example `tests/sync/`, `tests/providers/`,
`tests/config/`, `tests/ui-contract/`) plus shared harness/fixture helpers
under `tests/helpers/`.

## Complexity Tracking

No constitution violations are expected for this feature.
