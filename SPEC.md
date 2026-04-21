# Jira Sync plugin specification

Jira Sync is a Paperclip plugin for synchronizing Jira issues into Paperclip projects while keeping Paperclip usable as the primary planning surface.

## MVP requirements

- The plugin MUST register successfully in Paperclip.
- The plugin MUST expose a settings page, dashboard widget, task detail contribution, comment annotation contribution, and toolbar actions.
- The settings page MUST save Jira-to-Paperclip project mappings per company.
- The worker MUST read Jira connection details from plugin instance config using `jiraBaseUrl`, `jiraUserEmail`, and `jiraTokenRef`.
- The worker MUST NOT persist the raw Jira token in plugin state.
- The sync flow MUST import Jira issues into the mapped Paperclip project.
- Imported issues MUST retain the original Jira key as hidden durable metadata in the Paperclip issue description.
- The worker MUST persist durable plugin-owned link metadata for synced issues and synced comments.
- The worker MUST treat Jira upstream status and Paperclip local status as separate fields; pull/import flows MUST update Jira status metadata without overwriting the Paperclip issue workflow status.
- Jira-linked Paperclip issues MUST expose separate pull and push actions from the issue detail contribution.
- Pure Paperclip issues in mapped projects MUST expose a push action that creates the upstream Jira issue.
- Comments on Jira-linked issues MUST expose a per-comment push action.
- The dashboard widget MUST summarize mappings, linked issue count, and last sync state.
- The worker SHOULD support scheduled sync using a company-scoped frequency.

## Current transport choice

- The current repo implementation uses Jira REST-compatible credentials because deployed plugin workers cannot directly call the interactive Atlassian MCP used during development.
- The worker transport SHOULD stay isolated behind helper functions so it can later be swapped for an Atlassian MCP proxy or another provider adapter without reshaping the Paperclip UI.

## Better Paperclip integration proposal

The plugin can already deliver most of the experience inside current Paperclip extension slots, but the most native version of synced/local issue visualization needs small Paperclip host changes:

- Add an issue-row extension point or a small host-owned issue sync badge model so synced issues can show provider color, upstream key, and last-sync freshness directly in issue lists.
- Add optional issue-row quick actions so linked issues can expose pull/push buttons without opening the detail page.
- Add a host concept of issue provenance, for example `local` vs `external`, so Paperclip can color or filter synced issues consistently across list, board, and search surfaces.
- Add host-owned support for provider status pills and freshness timestamps to avoid every plugin rebuilding the same row decoration logic.

Until those host changes exist, the plugin SHOULD keep the richer sync controls in task detail views, toolbar buttons, dashboard widgets, and comment annotations.
