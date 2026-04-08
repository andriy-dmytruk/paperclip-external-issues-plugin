# paperclip-company-plugins

Company-owned Paperclip plugins for the live Paperclip instance.

## Repository purpose

This repository is scaffolded as a multi-plugin workspace. Each Paperclip plugin lives in its own package under `plugins/`, while the root provides shared workspace commands and lightweight documentation.

## Structure

```text
.
├── docs/
│   └── PLUGIN_WORKSPACE.md
├── plugins/
│   └── <plugin-package>/
├── scripts/
│   └── create-plugin.mjs
├── package.json
└── pnpm-workspace.yaml
```

## Create a plugin

When the Paperclip scaffold CLI is available locally, run:

```bash
pnpm plugin:create @your-scope/your-plugin-name
```

The helper script expects the scaffold CLI at:

```text
vendor/paperclip/packages/plugins/create-paperclip-plugin/dist/index.js
```

## Workspace commands

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

Each command fans out only to plugin packages that define that script.

For more details, see [`docs/PLUGIN_WORKSPACE.md`](./docs/PLUGIN_WORKSPACE.md).
