# agent-companies-manager

Paperclip plugin package for importing Agent Companies from repositories that follow the Agent Companies specification and keeping them aligned with upstream sources.

## Specification-first workflow

Development for this plugin is driven by [`SPEC.md`](./SPEC.md). Implementation, tests, and documentation should be validated against the spec before a task is considered complete.

## Available scripts

- `pnpm test` — runs the package-level Node tests.
- `pnpm test:e2e` — installs the required Playwright Chromium binary if needed, boots an isolated Paperclip instance from a generated local config, seeds a dummy company through the Paperclip API, installs this local plugin package, and verifies with Playwright that the Paperclip plugins settings page loads in headless mode.

## Installable plugin package contract

This package now includes the Paperclip plugin metadata and runtime artifacts expected by `paperclipai plugin install --local`:

- `package.json` declares `paperclipPlugin.manifest`, `paperclipPlugin.worker`, and `paperclipPlugin.ui`
- `dist/manifest.js` exports a valid Paperclip manifest with `apiVersion`, categories, capabilities, and entrypoints
- `dist/worker.js` and `dist/ui/index.js` provide the corresponding runtime artifacts

That packaging support exists so the local plugin can be installed into disposable Paperclip test instances during end-to-end verification.

## End-to-end test harness

The end-to-end smoke test lives in `scripts/e2e/run-paperclip-smoke.mjs` and is intended to be reusable by future sessions.

What it does:

1. Creates a disposable Paperclip home and data directory under the system temp folder.
2. Writes a schema-valid local Paperclip config directly, without running onboarding.
3. Starts a test-scoped Paperclip server.
4. Seeds a dummy company through the Paperclip API so the UI no longer redirects to `/onboarding`.
5. Verifies the seeded company exists through `paperclipai company list --json`.
6. Installs this plugin into the temporary Paperclip instance using `paperclipai plugin install --local`.
7. Uses Playwright in headless mode to open the Paperclip UI and verify the plugins settings page can be reached.

The harness writes the most recent detected plugins settings path to `tests/e2e/results/last-run.json` to make route discovery visible across sessions.

## Current package layout

- `src/manifest.ts` - source manifest placeholder
- `src/worker.ts` - source worker stub with seed company data
- `src/ui/index.tsx` - source UI placeholder renderer
- `dist/manifest.js` - installable Paperclip manifest entrypoint
- `dist/worker.js` - installable worker artifact
- `dist/ui/index.js` - installable UI artifact
- `tests/plugin.spec.ts` - basic structure tests
- `scripts/e2e/run-paperclip-smoke.mjs` - reusable headless Paperclip + Playwright smoke test harness

## Notes

This package is still scaffold-level on the product implementation side, but it now has enough Paperclip packaging and end-to-end infrastructure to exercise real local installation in a disposable instance instead of only running placeholder source tests.
