# Implementation Plan: Jira Sync MVP Baseline

**Branch**: `main` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-jira-sync-mvp/spec.md`

## Summary

The repository implements a Paperclip-hosted Jira Sync MVP that maps Jira
projects or JQL feeds into Paperclip projects, imports and refreshes upstream
issues, and exposes explicit push/pull controls for issue and comment sync. The
current technical direction keeps Jira transport details inside worker helpers,
stores sync metadata as plugin-owned entities and state, and preserves Paperclip
local workflow status as separate from upstream Jira status metadata.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: `@paperclipai/plugin-sdk`, React 19, esbuild, tsx  
**Storage**: Paperclip plugin state, Paperclip plugin entities, Paperclip secret
references, repository files for docs/specs  
**Testing**: `node --test`, `tsx --test`, `pnpm typecheck`  
**Target Platform**: Paperclip plugin host with hosted worker and hosted UI  
**Project Type**: Single-package Paperclip plugin  
**Performance Goals**: Manual sync should complete successfully for mapped Jira
projects without duplicate import behavior; the UI should remain responsive while
showing sync freshness and issue link details  
**Constraints**: Preserve stable plugin identity and state keys; do not store raw
Jira tokens; keep upstream Jira status distinct from local Paperclip status  
**Scale/Scope**: One plugin package, company-scoped mappings, up to dozens of
issues per sync in the current MVP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stable Paperclip Plugin Identity**: Pass. Manifest id, capabilities, and
  durable state keys are treated as compatibility contracts.
- **Paperclip-Native Experience First**: Pass. UI contributions remain hosted
  Paperclip surfaces and synced-vs-local behavior is explicit.
- **Provider Boundaries Stay Explicit**: Pass. Jira auth and link metadata stay
  provider-owned, while Paperclip local workflow state remains local.
- **Verification Is Mandatory**: Pass. The repo supports `pnpm typecheck`,
  `pnpm test`, and `pnpm build` as the default verification gate.
- **Docs And Reusable Patterns Stay In Sync**: Pass for repo docs. Future
  reusable cross-plugin patterns should still be promoted into shared skills when
  they generalize beyond this repo.

## Project Structure

### Documentation (this feature)

```text
specs/001-jira-sync-mvp/
├── plan.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── manifest.ts
├── worker.ts
└── ui/
    └── index.tsx

tests/
├── build-script.spec.mjs
└── plugin.spec.ts

docs/
└── paperclip-jira-integration-proposal.md
```

**Structure Decision**: This repo is a single Paperclip plugin package. Worker
logic, manifest declarations, and hosted UI stay in `src/`, contract checks stay
in `tests/`, and higher-level product direction stays in `docs/` plus Spec Kit
artifacts under `specs/`.

## Complexity Tracking

No constitution violations are currently required for the MVP baseline.
