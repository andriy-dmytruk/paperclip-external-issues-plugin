# Jira Sync plugin specification

Issue Sync is a Paperclip plugin for synchronizing upstream issues into Paperclip projects while keeping Paperclip usable as the primary planning surface.

## MVP requirements

- The plugin MUST register successfully in Paperclip.
- The plugin MUST expose a settings page, dashboard widget, task detail contribution, comment annotation contribution, and toolbar actions.
- The settings page MUST expose a provider-aware settings surface that saves reusable provider definitions separately from Paperclip project-scoped sync settings.
- Project-scoped sync MUST open a dedicated sync page for one Paperclip project at a time from project or issue sync surfaces instead of the global settings page.
- The worker MUST read provider connection details from plugin config using saved provider records. Legacy single-provider Jira fields (`jiraBaseUrl`, `jiraUserEmail`, `jiraToken`, `jiraTokenRef`, `defaultIssueType`) SHOULD continue to work as a migration path.
- The worker MUST NOT persist the raw Jira token in plugin state.
- The sync center MUST support an explicit provider connection test, MUST keep an existing token hidden in the UI, and MUST allow creating or editing a provider on its own dedicated page with `Back` navigation instead of a nested popup.
- Provider directory health MUST be tracked per provider, not only per company, so mixed-provider installs can show independent `Connected`, `Degraded`, `Not tested`, or `Needs config` states.
- Successful provider tests and successful sync fetches SHOULD update provider health to `Connected`, while failed provider tests or failed upstream sync fetches SHOULD update provider health to `Degraded`.
- The sync center MUST let a Paperclip project explicitly choose `Provider: None` without falling back to the first saved Jira provider.
- Before a provider is selected for a project, the sync center MUST hide provider-specific project settings and sync actions while keeping `Hide imported issues` available.
- The sync flow MUST import Jira issues into the selected Paperclip project's configured Jira mappings.
- Imported issues MUST retain the original Jira key as hidden durable metadata in the Paperclip issue description.
- Synced issues MUST use a stable upstream-key title prefix fallback such as `[GRB-123]` so synced/local state stays visible even without host row styling.
- The worker MUST persist durable plugin-owned link metadata for synced issues and synced comments.
- The worker MUST treat Jira upstream status and Paperclip local status as separate fields; Jira status metadata MUST remain visible even when Paperclip status differs.
- The issue detail contribution MUST only present an issue as Jira-linked when the current Paperclip issue still carries the Jira sync markers for that upstream issue.
- Jira-linked Paperclip issues MUST expose separate pull and push actions plus a visible `Open in Jira` action from the issue detail contribution.
- Pure Paperclip issues in configured projects MUST expose a push action that creates the upstream Jira issue.
- Jira-linked issue controls SHOULD match Paperclip dark-mode styling and avoid bright opaque button fills when the host uses transparent actions.
- Issue and sync action buttons SHOULD use Paperclip-aligned neutral styling with icon-first labels instead of bright filled call-to-action colors.
- Comments on Jira-linked issues MUST expose comment-level sync presentation that distinguishes imported Jira comments, upstream-published comments, and local Paperclip comments.
- Synced issue detail MUST include a collapsed Jira comments view above the composer so users can review upstream discussion without leaving Paperclip.
- Synced issue detail MUST include a comment composer that always publishes new comments to Jira for linked issues.
- The dashboard widget MUST summarize configured project mappings, linked issue count, and last sync state.
- Manual sync MUST report processed, total, imported, updated, skipped, and failed counts when available.
- Jira sync settings MUST be saved per Paperclip project, including selected provider, default assignee, default Jira-to-Paperclip status mapping, scheduled cadence, and that project's Jira mappings.
- Project sync settings MUST support explicit Jira-to-Paperclip status mappings so Jira status changes can update the local Paperclip workflow status when configured.
- Jira-to-Paperclip status mappings SHOULD allow each mapped Jira status, including the default fallback row, to choose a Paperclip agent assignment or `None`.
- Provider-specific project settings MUST remain preserved in state when a project switches to `Provider: None` so they can return if a real provider is selected again later.
- Sync mappings MUST carry their own upstream issue filters so teams can tune each configured Paperclip project independently.
- Project default assignee and mapping author/assignee filters MUST use structured Jira user references keyed by durable Jira identity, not plain display text.
- The worker MUST expose Jira current-user resolution and Jira user search so the hosted UI can drive project-default and mapping-user autocomplete.
- The worker MUST expose typed provider interfaces and a registry so new providers can be added without changing the shared sync shell.
- Provider config persistence SHOULD remain backward-compatible with older Paperclip host schemas by preserving the real provider type in plugin-owned provider metadata when needed.
- Provider transports SHOULD prefer generated OpenAPI clients or official maintained SDKs when they exist.
- Jira Data Center MUST continue using the checked-in generated OpenAPI client.
- GitHub Issues integration SHOULD use the official Octokit client.
- Jira-linked issue detail SHOULD surface both the upstream Jira assignee and the upstream Jira creator.
- Jira-linked issue detail SHOULD refresh live Jira assignee, creator, status, and comments when the detail view loads so the UI does not depend only on stale cached link metadata.
- The primary `Sync issues` action MUST save provider and project sync edits before running sync.
- The settings surface SHOULD expose a `Hide imported issues` action that hides imported upstream issues in Paperclip, regardless of whether their mapping is still configured or whether the import later participated in local sync activity.
- The hide dialog SHOULD still open when there are zero matching imported issues so the empty state remains visible.
- Hidden imported issues that later reappear upstream SHOULD be restored by the next matching sync run instead of remaining hidden forever.
- The worker SHOULD support scheduled sync using a project-scoped frequency.

## Current transport choice

- The current repo implementation uses Jira REST-compatible credentials because deployed plugin workers cannot directly call the interactive Atlassian MCP used during development.
- The worker transport SHOULD stay isolated behind helper functions so it can later be swapped for an Atlassian MCP proxy or another provider adapter without reshaping the Paperclip UI.
- The repo SHOULD keep a pinned Jira Data Center spec pipeline based on versioned `jira-rest-plugin.wadl`, converted into a checked-in OpenAPI artifact before client generation.
- Generated Jira client code, when used, SHOULD come from the repo-pinned Jira DC-derived OpenAPI artifact rather than the generic Jira Cloud swagger.

## Better Paperclip integration proposal

The plugin can already deliver most of the experience inside current Paperclip extension slots, but the most native version of synced/local issue visualization needs small Paperclip host changes:

- Add an issue-row extension point or a small host-owned issue sync badge model so synced issues can show provider color, upstream key, and last-sync freshness directly in issue lists.
- Add optional issue-row quick actions so linked issues can expose pull/push buttons without opening the detail page.
- Add a host concept of issue provenance, for example `local` vs `external`, so Paperclip can color or filter synced issues consistently across list, board, and search surfaces.
- Add host-owned support for provider status pills and freshness timestamps to avoid every plugin rebuilding the same row decoration logic.

Until those host changes exist, the plugin SHOULD keep the richer sync controls in task detail views, toolbar buttons, dashboard widgets, and comment annotations.
