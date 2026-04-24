# AGENTS.md

Guidance for agents working in this repository.

## Repository intent

This repository contains one Paperclip plugin package for synchronizing external issues between Paperclip and upstream issue providers:

- Jira Data Center
- Jira Cloud
- GitHub Issues

Treat the repository root as the package root.

## Current layout

```text
.
├── .github/workflows/
├── docs/
├── scripts/
│   └── jira-dc/
├── src/
│   ├── issue-provider-agent-tools.ts
│   ├── manifest.ts
│   ├── providers/
│   │   ├── github-issues/
│   │   ├── jira/
│   │   ├── jira-cloud/
│   │   ├── jira-dc/
│   │   └── shared/
│   ├── ui/
│   │   ├── features/
│   │   ├── index.tsx
│   │   ├── primitives.tsx
│   │   └── types.ts
│   ├── worker/
│   │   ├── agent-tools/
│   │   ├── cleanup/
│   │   ├── core/
│   │   ├── data/
│   │   ├── issue-actions/
│   │   ├── jobs/
│   │   ├── providers/
│   │   ├── sync/
│   │   └── sync-actions/
│   ├── worker-runtime.ts
│   └── worker.ts
├── tests/
│   ├── helpers/
│   └── sync/
├── SPEC.md
├── README.md
├── package.json
└── tsconfig.json
```

## Source-of-truth files

Read these before changing behavior:

- `SPEC.md` - feature requirements that must remain true
- `README.md` - package purpose, supported providers, and publish workflow
- `src/manifest.ts` - plugin id, capabilities, slots, jobs, instance config schema
- `src/worker.ts` - top-level plugin setup and registration entrypoint
- `src/providers/` - provider-owned API integration logic and provider capability boundaries
- `src/worker/` - sync orchestration, actions, jobs, cleanup, data handlers, and agent authorization
- `src/ui/` - Paperclip-hosted UI surfaces and shared UI primitives
- `tests/` - contract and sync behavior coverage
- `paperclip-plugin-ui` - reusable Paperclip UI patterns discovered while working here
- `paperclip-plugin-development` - reusable Paperclip backend and plugin patterns discovered while working here

## Architecture rules

### Keep code separated by responsibility

- `src/worker.ts` should stay lean. Prefer registration and composition there, not business logic.
- Put provider-specific API code inside the corresponding provider package under `src/providers/`.
- Put generic sync behavior in `src/worker/sync/`, action handlers in `src/worker/sync-actions/` or `src/worker/issue-actions/`, cleanup logic in `src/worker/cleanup/`, and scheduled job logic in `src/worker/jobs/`.
- Prefer extracting a new file when a function or cluster of functions has a single clear responsibility.
- Prefer feature packages over large utility dumping grounds.

### Provider boundaries

- Providers should own provider-specific APIs, normalization, default mappings, and capability decisions.
- Do not reintroduce generic wrapper layers that only forward calls into provider modules.
- If behavior differs by provider, prefer extending the provider interface rather than branching through worker code.
- Shared provider contracts belong in `src/providers/shared/`.

### Data model and sync behavior

- Keep persisted state keys stable unless migration work is explicitly part of the task.
- Keep sync behavior predictable: imported issues should be identified by stable upstream identity, not by presentation text.
- Avoid title-prefix or description-marker matching for new behavior unless kept only for narrow migration fallback.
- When changing sync behavior, update tests that cover reconciliation, cleanup, and provider settings behavior.

## UI rules

- Treat `src/ui/` as a real Paperclip-hosted UI, not a standalone app.
- Reuse Paperclip visual patterns closely. Prefer matching Paperclip spacing, borders, control sizing, and layout rhythm.
- Prefer `lucide-react` icons and Paperclip-style primitives over custom SVG reimplementations.
- If a Paperclip component or primitive can be reused directly, prefer that over inventing a new local pattern.
- Keep modals, selectors, popovers, and tables resilient inside host layout constraints.
- Keep components small. Split large views into feature packages, tabs, and subcomponents instead of growing monolithic files.
- Remove dead UI components and unused exports when refactoring.

## Testing rules

- Add or update tests for behavior changes, not just for new files.
- Keep tests near the feature area they exercise when possible, using `tests/helpers/` only for shared harness code.
- Prefer focused sync/provider tests for provider behavior and contract tests for manifest or plugin registration behavior.
- When refactoring, preserve or improve coverage for the moved behavior.

Run the smallest relevant scope first:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Use these selectively:

- `pnpm test` for code changes in `src/` or `tests/`
- `pnpm build` after manifest, worker, or UI entrypoint changes
- manual Paperclip verification when changing hosted UI layout, modal behavior, sync controls, or plugin installation behavior

## Manifest and packaging rules

- Keep the plugin id stable unless the task explicitly requires a rename.
- Keep manifest entrypoints aligned with the build output in `dist/`.
- Do not add capabilities casually; every capability should map to real behavior.
- Do not edit `dist/` by hand; rebuild through the package scripts.
- Keep package-specific dependencies in the root `package.json`.

## Documentation rules

Update `README.md` and `SPEC.md` when any of these change:

- plugin purpose or supported providers
- manifest capabilities, slots, tools, or jobs
- worker or UI contract
- packaging or release workflow

Update the matching global skills when any of these change:

- reusable Paperclip plugin UI patterns or helper components
- reusable Paperclip plugin backend patterns, provider boundaries, or test strategies

## Refactor guidance

- Remove one-line wrappers and dependency objects when direct imports are simpler and clearer.
- Delete dead code instead of moving it.
- Rename Jira-specific types or helpers when they are now provider-agnostic.
- Prefer explicit feature ownership over shared “runtime” objects that only pass methods around.
- If a file becomes hard to scan, split it before adding more behavior.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read
`specs/006-issue-sync-refactor/plan.md`.
<!-- SPECKIT END -->
