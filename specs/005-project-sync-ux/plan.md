# Implementation Plan: Project-First Sync UX Refresh

**Branch**: `005-project-sync-ux` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-project-sync-ux/spec.md`

## Summary

Refocus Jira sync around project-first and issue-context entry points, replace
mixed configuration views with dedicated project and provider pages, align sync
surfaces with Paperclip dark-mode styling, and simplify synced comment behavior
by exposing imported provenance plus an upstream-publication option in the
standard comment composer.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: `@paperclipai/plugin-sdk`, React 19, esbuild, tsx  
**Storage**: Paperclip plugin instance config for providers, plugin state for
project sync settings, and plugin-owned issue/comment sync metadata  
**Testing**: `pnpm typecheck`, `pnpm test`, `pnpm build`; manual hosted-UI
verification for navigation, dark mode, and comment behavior  
**Target Platform**: Paperclip hosted plugin worker and hosted UI surfaces  
**Project Type**: Single-package Paperclip plugin  
**Performance Goals**: Users should reach the correct project sync page in one
decision step, see no irrelevant controls before project or provider selection,
and keep issue-detail comment publishing in the existing authoring flow  
**Constraints**: Keep manifest identity and durable plugin state contracts
stable, keep provider definitions separate from project settings, avoid raw
secret exposure, preserve Paperclip-native loading and empty states, and avoid
introducing a second comment system  
**Scale/Scope**: One plugin package, one current provider type (Jira), several
hosted UI surfaces, one worker, and focused contract coverage in
`tests/plugin.spec.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stable Paperclip Plugin Identity**: Pass. The plan keeps the plugin id,
  capabilities, and durable link metadata stable while reshaping navigation and
  UI flow.
- **Paperclip-Native Experience First**: Pass. The feature explicitly moves sync
  into project and issue surfaces, preserves host-native navigation patterns,
  and aligns dark-mode styling with Paperclip conventions.
- **Provider Boundaries Stay Explicit**: Pass. Provider definitions remain
  separate from project settings, and comment publication is expressed as sync
  intent rather than a replacement for Paperclip’s local comment model.
- **Verification Is Mandatory**: Pass. The plan includes the standard typecheck,
  test, and build gates plus manual verification for hosted UI flows.
- **Docs And Reusable Patterns Stay In Sync**: Pass. Implementation will require
  updates to `README.md`, `SPEC.md`, and any shared Paperclip plugin skill
  guidance if reusable navigation or comment-sync patterns evolve.

Post-design re-check: The generated research, data model, contract, and
quickstart artifacts remain within all five constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/005-project-sync-ux/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── project-first-sync-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── manifest.ts
├── worker.ts
├── github-agent-tools.ts
├── github-repo.ts
├── paperclip-health.ts
└── ui/
    ├── assignees.ts
    ├── http.ts
    ├── index.tsx
    ├── plugin-config.ts
    ├── plugin-installation.ts
    └── project-bindings.ts

tests/
├── build-script.spec.mjs
├── jira-wadl.spec.ts
└── plugin.spec.ts
```

**Structure Decision**: Keep the existing single-package plugin layout. The main
implementation work will stay centered in `src/ui/index.tsx` for hosted UI flow
changes, `src/worker.ts` for data shape and action updates, helper modules in
`src/ui/` for config and project/provider state organization, and
`tests/plugin.spec.ts` for contract coverage.

## Complexity Tracking

No constitution violations are expected for this feature, so no additional
complexity exceptions are required.
