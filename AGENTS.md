# AGENTS.md

Guidance for agents working in this repository.

## Repository intent

This repo is a multi-plugin workspace for Paperclip plugins. Treat the root as shared infrastructure and documentation, and treat each directory under `plugins/` as an isolated plugin package.

## Workspace layout

```text
.
├── AGENTS.md
├── docs/
│   └── PLUGIN_WORKSPACE.md
├── plugins/
│   ├── .gitkeep
│   └── <plugin-package>/
├── scripts/
│   └── create-plugin.mjs
├── package.json
└── pnpm-workspace.yaml
```

## Where to put things

- New plugins belong in `plugins/<package-name>/`.
- Root-level changes should be limited to workspace-wide tooling, shared docs, and automation scripts.
- Plugin-specific code, tests, assets, and package configuration should stay inside the relevant plugin directory.

## Preferred workflow

### Adding a plugin

Use the root helper when the Paperclip scaffold CLI is available:

```bash
pnpm plugin:create @your-scope/your-plugin-name
```

The helper expects the Paperclip scaffold entrypoint at:

```text
vendor/paperclip/packages/plugins/create-paperclip-plugin/dist/index.js
```

If that scaffold is missing, do not invent a custom plugin structure unless the task explicitly asks for it. Prefer setting up the expected scaffold source first.

### Working on a plugin

From the repository root, prefer workspace commands:

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

For targeted work, use pnpm filters against the plugin package name when a plugin exists.

## Plugin expectations

A typical plugin package should contain at least:

- `src/manifest.ts`
- `src/worker.ts`
- `src/ui/index.tsx`
- `tests/`
- `package.json`

Match the current Paperclip plugin runtime rather than future-facing spec ideas. Keep plugin UI self-contained and avoid assuming host-provided shared UI components unless the repo explicitly adds them.

## Root guardrails

- Do not turn the root into a plugin package.
- Do not mix multiple plugins into the same folder.
- Do not add repo-wide dependencies unless they are truly shared workspace tooling.
- Do not hardcode environment-specific absolute paths in committed files.
- Keep the root scaffold lightweight; prefer per-plugin dependencies and scripts.

## Documentation and verification

When you change workspace structure or developer workflow, update `README.md` and `docs/PLUGIN_WORKSPACE.md` if needed.

After making changes, verify the smallest relevant scope first:

- `lsp_diagnostics` or equivalent on edited files
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

If the workspace is still empty, it is acceptable for root recursive commands to report that no projects matched.
