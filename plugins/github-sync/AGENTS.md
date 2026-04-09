# AGENTS.md

Guidance for agents working in `plugins/github-sync`.

## Package intent

This package is a Paperclip plugin scaffold for future GitHub synchronization workflows.

Today, its job is narrower than the name suggests:

- register cleanly as a Paperclip plugin
- expose a settings page contribution from the manifest
- prove worker ↔ UI wiring through one data endpoint and one action endpoint
- keep an end-to-end harness that installs the plugin into a disposable Paperclip instance and verifies the real host renders the settings page

When making changes, preserve that verified scaffold unless the task explicitly expands the feature set.

## Package layout

```text
plugins/github-sync/
├── AGENTS.md
├── README.md
├── SPEC.md
├── package.json
├── scripts/
│   ├── e2e/
│   └── noop.mjs
├── src/
│   ├── manifest.ts
│   ├── worker.ts
│   └── ui/
│       └── index.tsx
├── tests/
│   ├── plugin.spec.ts
│   └── e2e/
└── tsconfig.json
```

## Source-of-truth files

Read these before changing behavior:

- `SPEC.md` - scaffold requirements that must remain true
- `README.md` - package purpose and current workflow
- `src/manifest.ts` - plugin registration, capabilities, and settings page slot metadata
- `src/worker.ts` - plugin data/action registration and persisted plugin state usage
- `src/ui/index.tsx` - settings page scaffold mounted inside Paperclip
- `tests/plugin.spec.ts` - minimum contract the scaffold must satisfy

## Working rules

### Manifest changes

- Keep the plugin id stable unless the task explicitly requires a breaking rename.
- Keep the settings page slot valid and aligned with the UI export name.
- Do not add capabilities casually; every capability should correspond to real behavior.

### Worker changes

- Match the existing `definePlugin(...)/runWorker(...)` pattern.
- Prefer small, explicit data and action registrations.
- When persisting state, keep scope keys stable unless migration work is part of the task.
- Do not introduce fake GitHub behavior that looks production-ready without tests and spec updates.

### UI changes

- Treat `src/ui/index.tsx` as a real in-host settings page, not a standalone demo.
- Keep the UI resilient to loading and missing data states.
- If you rename exported UI components, update the manifest slot export name in the same change.
- Prefer incremental improvements over large framework or styling churn.

### Tests and automation

- Preserve `tests/plugin.spec.ts` as the fast package-level contract test.
- Preserve the disposable Paperclip e2e workflow under `scripts/e2e/` unless you are deliberately replacing it with something better.
- Do not check in brittle test changes that only validate implementation details; verify manifest, wiring, and host rendering behavior.

## Verification

Run the smallest relevant scope first from `plugins/github-sync`:

```bash
pnpm test
pnpm test:e2e
pnpm verify:manual
```

Use these selectively:

- `pnpm test` for any code change in `src/` or `tests/`
- `pnpm test:e2e` when touching manifest contributions, UI mount behavior, plugin installation flow, or e2e harness code
- `pnpm verify:manual` when the task benefits from visual inspection inside a real Paperclip host

If workspace-level verification is needed, run root commands from the repository root after package checks pass.

## Change boundaries

- Keep package-specific dependencies in this package rather than the workspace root.
- Do not edit `dist/` by hand; update source files and rebuild through the package workflow.
- Do not treat `node_modules/` or generated e2e artifacts as authoring surfaces.
- Avoid broad repo changes when the task is local to `github-sync`.

## Documentation expectations

Update `README.md` and `SPEC.md` when any of these change:

- plugin purpose or scope
- manifest capabilities or slots
- worker/UI contract
- verification workflow
- e2e expectations

## Practical success criteria

A good change in this package usually means:

- the plugin still registers successfully
- the settings page still renders in Paperclip
- worker data/action wiring still functions
- tests reflect the real contract, not temporary implementation noise
- docs describe the new behavior accurately
