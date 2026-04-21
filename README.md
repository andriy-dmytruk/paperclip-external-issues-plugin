# paperclip-jira-plugin

Jira Sync is a Paperclip plugin for teams that plan in Paperclip but still need Jira to remain the upstream system of record.

The plugin maps Jira projects or JQL feeds into Paperclip projects, imports issues into Paperclip, and adds issue-level plus comment-level sync controls so teams can decide when to pull from Jira and when to push local changes upstream.

## What this repo contains

- a new sibling plugin package based on the GitHub sync plugin structure
- a smaller Jira-first worker that focuses on issue sync instead of pull-request workflows
- hosted UI for settings, dashboard status, issue detail sync controls, and per-comment push buttons
- a Paperclip integration proposal for a more native synced-vs-local issue experience

## Current shape

This version is intentionally an MVP:

- Jira connectivity comes from plugin instance config via `jiraBaseUrl`, `jiraUserEmail`, and `jiraTokenRef`
- project mappings are saved per Paperclip company inside plugin state
- manual and scheduled sync can import/update Jira issues into mapped Paperclip projects
- synced issues show the upstream key, Jira status metadata, local Paperclip status, last sync, and separate push/pull buttons
- unsynced Paperclip issues can be pushed upstream to create the Jira issue
- comments on Jira-linked issues can be pushed individually to Jira from the comment annotation area

## Important note on Atlassian MCP

The Atlassian MCP available in this coding environment is great for development and for validating the workflow shape, but a deployed Paperclip plugin worker cannot directly call that MCP today.

That means the plugin implementation in this repo uses Jira-compatible REST credentials from Paperclip instance config. If Paperclip later grows a plugin-to-MCP bridge or a small Jira MCP proxy service, this plugin should swap that transport behind the worker helpers rather than changing the UI or sync model.

## Planned next steps

- add richer Jira field mapping beyond summary, description, comments, and status
- support safer conflict handling so pull sync can avoid overwriting local Paperclip edits automatically
- support comment pull updates instead of only importing unseen Jira comments
- add optional provider adapters so the worker can target direct Jira REST, an Atlassian MCP proxy, or another issue system behind the same sync UI
- extend Paperclip core so issue lists can show synced/local state natively instead of only inside plugin surfaces
