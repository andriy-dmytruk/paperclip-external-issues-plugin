# Implementation Plan: Provider-Aware Jira UI Replan

**Branch**: `003-jira-ui-replan` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-jira-ui-replan/spec.md`

## Summary

Redesign the current Jira Sync UI into a provider-aware Paperclip-native sync
experience centered on a complete sync popup, clearer synced-versus-local issue
presentation, and explicit comment sync controls. The implementation should keep
the plugin identity stable, preserve local-vs-upstream state separation, and add
new worker/UI contracts in a way that lets Jira be the first provider without
hard-coding the entire user experience to Jira-only concepts.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: `@paperclipai/plugin-sdk`, React 19, esbuild, tsx  
**Storage**: Paperclip plugin instance config, plugin state, plugin entities, and
Paperclip secret references  
**Testing**: `pnpm typecheck`, `pnpm test`, `pnpm build`; targeted worker/UI
contract coverage in `tests/plugin.spec.ts`  
**Target Platform**: Paperclip plugin host with hosted worker and hosted UI  
**Project Type**: Single-package Paperclip plugin  
**Performance Goals**: Sync popup updates should remain responsive during manual
sync; visible progress should advance as issue counts change; issue and comment
surfaces should render useful state without extra navigation  
**Constraints**: Keep manifest id and slot identities stable; do not persist raw
provider tokens in plugin state; preserve local Paperclip workflow status as a
separate field from upstream provider status; use Paperclip-hosted surfaces
rather than standalone pages  
**Scale/Scope**: One plugin package, one initial provider (Jira), multiple UI
surfaces (`settingsPage`, `globalToolbarButton`, `toolbarButton`, `taskDetailView`,
`commentAnnotation`, `dashboardWidget`), repo-local docs/spec updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stable Paperclip Plugin Identity**: Pass. The plan keeps `paperclip-external-issues-plugin`,
  existing entrypoints, and durable state/entity identifiers stable while adding
  provider-aware data structures behind them.
- **Paperclip-Native Experience First**: Pass. The redesign stays inside hosted
  Paperclip slots and emphasizes resilient loading, error, empty, and sync-state
  UI rather than introducing an external standalone app.
- **Provider Boundaries Stay Explicit**: Pass. Provider config, provider status,
  upstream keys, and comment sync metadata remain provider-owned; local
  Paperclip issue workflow state remains local.
- **Verification Is Mandatory**: Pass. The implementation will be gated by
  `pnpm typecheck`, `pnpm test`, and `pnpm build`, with additional focused
  contract coverage for popup, provider config, and synced display flows.
- **Docs And Reusable Patterns Stay In Sync**: Pass. This feature will require
  updates to `README.md`, `SPEC.md`, and likely reusable Paperclip plugin UI
  skill guidance if the provider-aware popup and synced issue presentation
  generalize well.

## Project Structure

### Documentation (this feature)

```text
specs/003-jira-ui-replan/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── provider-sync-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── manifest.ts
├── worker.ts
├── ui/
│   ├── assignees.ts
│   ├── http.ts
│   ├── index.tsx
│   ├── plugin-config.ts
│   ├── plugin-installation.ts
│   └── project-bindings.ts
├── github-agent-tools.ts
├── github-repo.ts
└── paperclip-health.ts

tests/
├── build-script.spec.mjs
└── plugin.spec.ts

docs/
└── paperclip-jira-integration-proposal.md
```

**Structure Decision**: Keep the single-package plugin structure. The worker
remains the source of truth for provider state and sync orchestration, while the
hosted UI in `src/ui/index.tsx` becomes the main delivery surface for the new
popup, synced issue presentation, and comment controls. Small helper modules may
be split out under `src/ui/` or `src/` only if they simplify a provider-aware
contract without expanding the public plugin surface unnecessarily.

## Complexity Tracking

No constitution violations are currently expected. If implementation later
requires new manifest capabilities or persisted key migrations, that change must
be justified in a follow-up update to this plan.
