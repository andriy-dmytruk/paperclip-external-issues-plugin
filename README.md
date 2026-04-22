# paperclip-jira-plugin

Jira Sync is a Paperclip plugin for teams that plan in Paperclip but still need Jira to remain the upstream system of record.

The plugin maps Jira projects or JQL feeds into Paperclip projects, imports issues into Paperclip, and adds issue-level plus comment-level sync controls so teams can decide when to pull from Jira and when to push local changes upstream.

## What this repo contains

- a new sibling plugin package based on the GitHub sync plugin structure
- a smaller Jira-first worker that focuses on issue sync instead of pull-request workflows
- hosted UI for a provider-aware sync center, dashboard status, issue detail sync controls, and per-comment upload buttons
- a Paperclip integration proposal for a more native synced-vs-local issue experience

## Current shape

This version now has a fuller Jira-first sync flow:

- the hosted sync center lets users create reusable Jira providers, then configure sync one Paperclip project at a time
- provider definitions live in plugin config so one Jira connection can be reused across many Paperclip projects
- legacy single-provider config using `jiraBaseUrl`, `jiraUserEmail`, `jiraToken`, or `jiraTokenRef` still works as a migration path
- saved Jira tokens stay hidden in the UI; users only enter a new token when they want to replace it
- each Paperclip project keeps its own selected provider, default assignee, default status, cadence, and Jira mappings inside plugin state
- a project can explicitly stay on `Provider: None`, which keeps it Paperclip-only while still allowing `Hide imported issues` for previously imported Jira work
- opening `Sync Issues` from a project now scopes the modal to that project, while the global surface starts with a project picker
- manual and scheduled sync report processed, total, imported, updated, skipped, and failed counts
- synced issues keep their Paperclip local status separate from Jira upstream status metadata
- issue detail only presents an issue as Jira-linked when the current Paperclip issue still carries its Jira sync markers, which avoids stale-link UI on fresh local issues
- synced issues use a stable `[JIRA-123]` title prefix fallback and expose a visible `Open in Jira` action
- comments on Jira-linked issues show whether they were fetched from Jira, already uploaded, or still local to Paperclip
- project sync settings prefill the default assignee from the current Jira user when possible and use Jira-backed autocomplete for both the project default assignee and mapping assignee filters
- new mappings start with `Active only` enabled and default the assignee filter to the current Jira user for the selected provider when available
- the main `Sync issues` action saves provider and project settings automatically before it runs
- `Hide imported issues` only targets the selected project and can hide untouched imported Jira issues from active Paperclip views
- the hide dialog still opens for an empty-state review, and hidden imported issues are restored automatically if the same Jira issue appears again on a later sync

## Important note on Atlassian MCP

The Atlassian MCP available in this coding environment is great for development and for validating the workflow shape, but a deployed Paperclip plugin worker cannot directly call that MCP today.

That means the plugin implementation in this repo uses Jira-compatible REST credentials from Paperclip plugin config today. If Paperclip later grows a plugin-to-MCP bridge or a small Jira MCP proxy service, this plugin should swap that transport behind the worker helpers rather than changing the UI or sync model.

## Jira DC spec pipeline

This repo now includes a small Jira Data Center spec pipeline so we can stop hand-maintaining every REST shape:

- `pnpm jira:sync-spec --version <jira-version>` downloads `jira-rest-plugin.wadl` for that Jira DC version and converts it into a pinned OpenAPI artifact under `vendor/jira-dc/<jira-version>/`
- `pnpm jira:generate-client --version <jira-version>` generates a `typescript-fetch` client into `generated/jira-dc-client/<jira-version>/`

Example:

```bash
pnpm jira:sync-spec --version 9.12.0
pnpm jira:generate-client --version 9.12.0
```

Notes:

- the OpenAPI artifact is generated from Jira DC WADL, not from the Jira Cloud swagger
- the converter is intentionally conservative and focused on stable operation/path/request/response scaffolding
- some Jira endpoints, especially user search/picker behavior, may still need handwritten compatibility wrappers even after generation
- if `openapi-generator-cli` has not initialized its runtime yet in this checkout, run `pnpm exec openapi-generator-cli version-manager set 7.16.0` once before generating clients

## Planned next steps

- add richer Jira field mapping beyond summary, description, comments, and status
- support safer conflict handling so pull sync can avoid overwriting local Paperclip edits automatically
- support comment pull updates instead of only importing unseen Jira comments
- add optional provider adapters so the worker can target direct Jira REST, an Atlassian MCP proxy, or another issue system behind the same sync UI
- extend Paperclip core so issue lists can show synced/local state natively instead of only inside plugin surfaces
