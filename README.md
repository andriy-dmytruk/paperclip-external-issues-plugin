# paperclip-external-issues-plugin

Paperclip plugin for syncing external issues with:
- Jira Data Center
- Jira Cloud
- GitHub Issues

## Attribution and License

This project is a derivative of [paperclip-github-plugin](https://github.com/alvarosanchez/paperclip-github-plugin) by Álvaro Sánchez-Mariscal.

- Original project license: Apache-2.0
- This project license: Apache-2.0
- License file: [LICENSE](LICENSE)

## Screenshots

- Provider settings  
  ![Provider settings](./docs/assets/providers.png)
- Project sync settings  
  ![Project sync settings](./docs/assets/sync.png)
- Issue sync view  
  ![Issue sync view](./docs/assets/issue.png)

## Provider Support

| Capability | Jira Data Center | GitHub Issues | Jira Cloud |
| --- | --- | --- | --- |
| Configure provider | Tested | Tested | Implemented, not fully validated |
| Map project/repository | Tested | Tested | Implemented, not fully validated |
| Import and refresh issues | Tested | Tested | Implemented, not fully validated |
| Create upstream issues | Tested | Tested | Implemented, not fully validated |
| Comments (read/post) | Tested | Tested | Implemented, not fully validated |
| Assignee search/update | Tested | Tested | Implemented, not fully validated |
| Status read/update | Tested | Tested | Implemented, not fully validated |
| Agent tools (project scoped) | Tested | Tested | Implemented, not fully validated |

## Quick Start

1. Configure one or more providers in plugin settings.
2. Open a Paperclip project and choose a provider.
3. Set the default upstream project/repository and mapping filters.
4. Run sync.

## Key Behavior

- Provider settings are reusable across projects.
- Project sync settings are project-scoped.
- `Provider: None` is supported.
- `Sync issues` saves project settings before sync.
- Imported issues can be hidden from cleanup flow.
- Sync status and provider health are tracked per provider.

## Compatibility

- npm package: `paperclip-external-issues-plugin`
- Paperclip plugin id: `paperclip-external-issues-plugin`

## Publish

1. Run `pnpm typecheck && pnpm test && pnpm build`
2. Create a release tag (for example `v0.1.2`)
3. Publish workflow: [`.github/workflows/release.yml`](.github/workflows/release.yml)

## Development

- Build: `pnpm build`
- Tests: `pnpm test`
- Typecheck: `pnpm typecheck`
- Dev watch: `pnpm dev`

## Jira DC OpenAPI Pipeline

- Sync spec: `pnpm jira:sync-spec --version <jira-version>`
- Generate client: `pnpm jira:generate-client --version <jira-version>`

Example:

```bash
pnpm jira:sync-spec --version 9.12.0
pnpm jira:generate-client --version 9.12.0
```
