# Implementation Plan: Project-Scoped Jira Sync Setup

**Branch**: `004-project-scoped-sync` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-project-scoped-sync/spec.md`

## Summary

Move Jira sync configuration from company-level mapping rows to Paperclip
project-scoped sync settings while keeping provider definitions reusable at the
plugin instance level. The implementation should preserve the plugin identity,
keep Paperclip-native UI surfaces, and maintain strict separation between local
Paperclip state and upstream Jira metadata as project-specific sync actions,
defaults, and issue upload behavior are redesigned.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+  
**Primary Dependencies**: `@paperclipai/plugin-sdk`, React 19, esbuild, tsx  
**Storage**: Paperclip plugin instance config, plugin state, plugin-owned issue
link entities, comment link state, and Paperclip secret references  
**Testing**: `pnpm typecheck`, `pnpm test`, `pnpm build`; targeted contract
coverage in `tests/plugin.spec.ts`  
**Target Platform**: Paperclip plugin host with hosted worker and hosted UI  
**Project Type**: Single-package Paperclip plugin  
**Performance Goals**: Project-scoped sync settings should open without extra
navigation, manual sync and hide actions should report project-only progress,
and issue detail should render upstream metadata without blocking local editing  
**Constraints**: Keep manifest id, slot ids, and launcher ids stable; do not
persist raw Jira tokens in plugin state; keep reusable provider definitions
separate from project-level sync settings; preserve local Paperclip workflow
state independently from upstream Jira status and assignee metadata  
**Scale/Scope**: One plugin package, one concrete provider implementation
(Jira), many Paperclip projects per company, project and issue toolbar entry
points, dashboard/settings/issue/comment surfaces, docs and spec artifacts in
the same repo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Stable Paperclip Plugin Identity**: Pass. The plan keeps
  `paperclip-external-issues-plugin`, current capabilities, current slots, and existing
  durable link metadata stable while refactoring settings around project scope.
- **Paperclip-Native Experience First**: Pass. The redesign keeps sync setup in
  hosted Paperclip launchers, settings, and issue detail surfaces rather than
  introducing a separate app model.
- **Provider Boundaries Stay Explicit**: Pass. Provider definitions remain
  instance-owned config, project sync settings reference a provider explicitly,
  and Jira status or assignee stay upstream-owned metadata rather than replacing
  local Paperclip planning state.
- **Verification Is Mandatory**: Pass. The implementation will be gated by
  `pnpm typecheck`, `pnpm test`, and `pnpm build`, with targeted worker/UI
  coverage for project-scoped settings, sync actions, and issue upload flows.
- **Docs And Reusable Patterns Stay In Sync**: Pass. This work will require
  updates to `README.md`, `SPEC.md`, and any shared skill guidance that
  generalizes the new Paperclip project-scoped sync pattern.

## Project Structure

### Documentation (this feature)

```text
specs/004-project-scoped-sync/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── project-scoped-sync-ui.md
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
└── plugin.spec.ts
```

**Structure Decision**: Keep the single-package plugin structure. The worker in
`src/worker.ts` remains the source of truth for provider resolution, project
sync settings, and issue/comment link metadata. The hosted UI in
`src/ui/index.tsx` stays the main delivery surface for project-scoped sync
setup, project-specific sync and hide actions, and issue-level upload controls.
Helper modules under `src/ui/` may be extended to separate provider config from
project sync state without changing the public plugin identity.

## Complexity Tracking

No constitution violations are currently expected. If implementation later
requires durable state migration helpers or a new host capability, this plan
must be updated with explicit justification before those changes land.
