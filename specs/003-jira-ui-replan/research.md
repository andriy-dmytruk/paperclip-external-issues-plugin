# Research: Provider-Aware Jira UI Replan

## Decision 1: Introduce a provider-aware UI contract before adding more providers

- **Decision**: Model the sync popup and issue/comment surfaces around a shared
  "issue sync provider" concept while implementing only Jira-specific behavior in
  the first rollout.
- **Rationale**: The user wants the interface to be provider-capable now, even
  if Jira is the only concrete backend today. Designing the UI contract around a
  provider abstraction prevents another full UI rewrite when a second provider
  appears.
- **Alternatives considered**:
  - Keep the UI Jira-only now and generalize later: rejected because it would
    hard-code Jira concepts deeper into the popup and issue surfaces.
  - Build full multi-provider support immediately: rejected because it expands
    backend scope beyond the requested UI replan.

## Decision 2: Center the redesign on a focused sync popup, not scattered controls

- **Decision**: Use a single focused popup or status surface as the primary
  entry point for provider selection, provider config, connection testing,
  filters, and manual sync progress.
- **Rationale**: The existing UI spreads setup and sync information across
  multiple smaller sections. A focused popup better matches the requested
  experience and gives users one place to understand sync state.
- **Alternatives considered**:
  - Extend the current settings page only: rejected because it keeps the sync
    flow fragmented and less discoverable during day-to-day usage.
  - Move everything into the issue detail view: rejected because provider config
    and global sync controls are broader than one issue.

## Decision 3: Preserve local-vs-upstream state separation everywhere in the UI

- **Decision**: Keep local Paperclip issue workflow status and upstream provider
  status as separate display fields and separate worker data paths.
- **Rationale**: The current baseline already corrected a real bug caused by
  conflating the two. The redesigned UI must reinforce that separation instead
  of hiding it behind a generic "status" label.
- **Alternatives considered**:
  - Show only one merged status: rejected because it obscures ownership and can
    mislead users about what a sync action will change.
  - Prefer upstream status over local status in synced issues: rejected because
    Paperclip remains the local planning surface.

## Decision 4: Use layered synced issue identification with a fallback marker

- **Decision**: Prefer integrated visual distinction for synced issues, but also
  support a stable upstream-key title prefix fallback such as `[GRB-123]`.
- **Rationale**: Paperclip host surfaces may not support custom row styling
  everywhere. The fallback keeps the synced-vs-local distinction visible even in
  constrained contexts.
- **Alternatives considered**:
  - Require custom row styling everywhere: rejected because the host may not
    allow it consistently.
  - Keep synced identity only in the detail panel: rejected because it is too
    hidden for day-to-day issue browsing.

## Decision 5: Treat fetched comments as editable local records with explicit sync actions

- **Decision**: Show pulled comments as upstream-originated but still editable in
  Paperclip, and add explicit upload actions for existing local comments.
- **Rationale**: The requested workflow expects fetched comments to remain usable
  within Paperclip while still exposing their sync state clearly.
- **Alternatives considered**:
  - Make fetched comments read-only: rejected because it conflicts with the
    requested ability to edit them.
  - Auto-upload all edited comments: rejected because the user requested
    explicit upload controls.

## Decision 6: Extend worker/UI bridge contracts instead of adding host-wide APIs first

- **Decision**: Implement provider config, connection test, filters, progress,
  and comment sync behavior through expanded plugin data/actions first.
- **Rationale**: The plugin can deliver the requested experience within current
  Paperclip surfaces while keeping future host integrations open.
- **Alternatives considered**:
  - Require new host-native sync APIs before starting: rejected because it would
    block the redesign on broader Paperclip platform changes.
