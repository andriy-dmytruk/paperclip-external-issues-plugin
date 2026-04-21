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

- the hosted sync center lets users create reusable Jira providers, test them, save mappings, and run sync from one surface
- provider definitions live in plugin config so one Jira connection can be reused across many mappings
- legacy single-provider config using `jiraBaseUrl`, `jiraUserEmail`, `jiraToken`, or `jiraTokenRef` still works as a migration path
- saved Jira tokens stay hidden in the UI; users only enter a new token when they want to replace it
- project mappings and their task filters are saved per Paperclip company inside plugin state
- manual and scheduled sync report processed, total, imported, updated, skipped, and failed counts
- synced issues keep their Paperclip local status separate from Jira upstream status metadata
- issue detail only presents an issue as Jira-linked when the current Paperclip issue still carries its Jira sync markers, which avoids stale-link UI on fresh local issues
- synced issues use a stable `[JIRA-123]` title prefix fallback and expose a visible `Open in Jira` action
- comments on Jira-linked issues show whether they were fetched from Jira, already uploaded, or still local to Paperclip
- the main `Sync now` action saves provider and mapping edits automatically before it runs
- `Hide imported issues` can hide untouched imported Jira issues from active Paperclip views, even when their mapping is still configured
- the hide dialog still opens for an empty-state review, and hidden imported issues are restored automatically if the same Jira issue appears again on a later sync

## Important note on Atlassian MCP

The Atlassian MCP available in this coding environment is great for development and for validating the workflow shape, but a deployed Paperclip plugin worker cannot directly call that MCP today.

That means the plugin implementation in this repo uses Jira-compatible REST credentials from Paperclip plugin config today. If Paperclip later grows a plugin-to-MCP bridge or a small Jira MCP proxy service, this plugin should swap that transport behind the worker helpers rather than changing the UI or sync model.

## Planned next steps

- add richer Jira field mapping beyond summary, description, comments, and status
- support safer conflict handling so pull sync can avoid overwriting local Paperclip edits automatically
- support comment pull updates instead of only importing unseen Jira comments
- add optional provider adapters so the worker can target direct Jira REST, an Atlassian MCP proxy, or another issue system behind the same sync UI
- extend Paperclip core so issue lists can show synced/local state natively instead of only inside plugin surfaces
