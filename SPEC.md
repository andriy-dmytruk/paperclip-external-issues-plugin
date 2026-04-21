# Jira Sync plugin specification

Jira Sync is a Paperclip plugin for synchronizing Jira issues into Paperclip projects while keeping Paperclip usable as the primary planning surface.

## MVP requirements

- The plugin MUST register successfully in Paperclip.
- The plugin MUST expose a settings page, dashboard widget, task detail contribution, comment annotation contribution, and toolbar actions.
- The settings page MUST expose a provider-aware Jira sync center that can save reusable Jira provider definitions separately from Jira-to-Paperclip project mappings.
- The worker MUST read Jira connection details from plugin config using saved provider records. Legacy single-provider fields (`jiraBaseUrl`, `jiraUserEmail`, `jiraToken`, `jiraTokenRef`, `defaultIssueType`) SHOULD continue to work as a migration path.
- The worker MUST NOT persist the raw Jira token in plugin state.
- The sync center MUST support an explicit Jira connection test, MUST keep an existing token hidden in the UI, and MUST allow creating a provider from a dedicated popup launched next to the provider selector.
- The sync flow MUST import Jira issues into the mapped Paperclip project.
- Imported issues MUST retain the original Jira key as hidden durable metadata in the Paperclip issue description.
- Synced issues MUST use a stable upstream-key title prefix fallback such as `[GRB-123]` so synced/local state stays visible even without host row styling.
- The worker MUST persist durable plugin-owned link metadata for synced issues and synced comments.
- The worker MUST treat Jira upstream status and Paperclip local status as separate fields; pull/import flows MUST update Jira status metadata without overwriting the Paperclip issue workflow status.
- The issue detail contribution MUST only present an issue as Jira-linked when the current Paperclip issue still carries the Jira sync markers for that upstream issue.
- Jira-linked Paperclip issues MUST expose separate pull and push actions plus a visible `Open in Jira` action from the issue detail contribution.
- Pure Paperclip issues in mapped projects MUST expose a push action that creates the upstream Jira issue.
- Comments on Jira-linked issues MUST expose comment-level sync presentation that distinguishes fetched Jira comments from local Paperclip comments and allows uploading an existing local comment.
- The dashboard widget MUST summarize mappings, linked issue count, and last sync state.
- Manual sync MUST report processed, total, imported, updated, skipped, and failed counts when available.
- Sync mappings MUST carry their own upstream issue filters so teams can tune each mapped Paperclip project independently.
- The primary `Sync now` action MUST save provider and mapping edits before running sync.
- The settings surface SHOULD expose a `Hide imported issues` action that hides untouched imported Jira issues in Paperclip, regardless of whether their mapping is still configured.
- The hide dialog SHOULD still open when there are zero matching imported issues so the empty state remains visible.
- Hidden imported issues that later reappear in Jira SHOULD be restored by the next matching sync run instead of remaining hidden forever.
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
