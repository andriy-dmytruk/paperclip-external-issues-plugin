# Plugin workspace

This repository is organized as a small pnpm workspace so it can host multiple Paperclip plugins side by side.

## Layout

```text
.
├── docs/
├── plugins/
│   ├── .gitkeep
│   └── <plugin-package>/
├── scripts/
├── package.json
└── pnpm-workspace.yaml
```

Each plugin should live in its own folder under `plugins/`.

## Creating a new plugin

This repo is prepared to call the Paperclip scaffold CLI from a vendored Paperclip checkout.

Expected location:

```text
vendor/paperclip/packages/plugins/create-paperclip-plugin/dist/index.js
```

Once that scaffold is available, create a new plugin with:

```bash
pnpm plugin:create @your-scope/your-plugin-name
```

Extra scaffold arguments can be forwarded after `--`.

## Recommended plugin package shape

After scaffolding, each plugin package should generally contain:

- `src/manifest.ts`
- `src/worker.ts`
- `src/ui/index.tsx`
- `tests/`
- `package.json`

## Workspace commands

From the repository root:

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

These commands run across every plugin package that defines the corresponding script.
