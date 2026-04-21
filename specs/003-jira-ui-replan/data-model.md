# Data Model: Provider-Aware Jira UI Replan

## IssueSyncProviderDefinition

- **Purpose**: Describes one provider option in the sync popup and what config,
  test, and filter fields it exposes.
- **Fields**:
  - `providerKey`: stable provider identifier such as `jira`
  - `displayName`: user-facing provider name
  - `status`: readiness state for the current company (`configured`,
    `needs_config`, `error`)
  - `supportsConnectionTest`: whether the provider exposes an explicit test step
  - `filterSchema`: available filter fields and UI labels
  - `configSummary`: safe user-facing summary that excludes raw secrets
- **Relationships**:
  - One provider definition is selected by one `ProviderSyncPopupState`
  - One provider definition may back many `SyncedIssuePresentation` records

## ProviderConfigState

- **Purpose**: Stores the selected provider's editable configuration state for
  the current company.
- **Fields**:
  - `providerKey`
  - `baseUrl`
  - `projectKey` or provider-equivalent scope value
  - `tokenState`: `missing`, `saved`, `updated_pending`
  - `tokenInputMode`: `hidden`, `masked`, `editable`
  - `testStatus`: `idle`, `running`, `success`, `error`
  - `testMessage`
- **Validation rules**:
  - Raw token values must never be persisted into plugin state
  - Provider-specific required fields must be present before sync can start

## ProviderTaskFilterState

- **Purpose**: Captures the operator’s current sync filter inputs.
- **Fields**:
  - `activeScope`
  - `author`
  - `assignee`
  - `issueNumberGreaterThan`
  - `issueNumberLessThan`
- **Validation rules**:
  - Number filters must be numeric when present
  - Empty filters are treated as unspecified rather than invalid

## ProviderSyncPopupState

- **Purpose**: Represents the visible state of the sync popup while a user is
  configuring or running a sync.
- **Fields**:
  - `selectedProviderKey`
  - `configState`
  - `filterState`
  - `syncState`: `idle`, `testing`, `running`, `success`, `error`
  - `processedCount`
  - `totalCount`
  - `importedCount`
  - `updatedCount`
  - `skippedCount`
  - `failedCount`
  - `message`
- **State transitions**:
  - `idle -> testing`
  - `testing -> success|error|idle`
  - `idle|success|error -> running`
  - `running -> success|error`

## SyncedIssuePresentation

- **Purpose**: Defines the user-facing metadata required to render synced issues
  differently from pure Paperclip issues.
- **Fields**:
  - `issueId`
  - `isSynced`
  - `providerKey`
  - `upstreamIssueKey`
  - `titlePrefix`
  - `localStatus`
  - `upstreamStatusName`
  - `upstreamStatusCategory`
  - `syncTone`: `local`, `synced`, `needs_attention`
  - `lastSyncedAt`
  - `openInProviderUrl`
- **Validation rules**:
  - `localStatus` must continue to map to Paperclip-owned workflow state
  - `upstreamStatus*` fields remain provider-owned metadata only

## SyncedCommentPresentation

- **Purpose**: Represents a Paperclip comment that may have upstream provenance
  and explicit sync controls.
- **Fields**:
  - `commentId`
  - `issueId`
  - `origin`: `paperclip`, `provider_pull`, `provider_push`
  - `providerKey`
  - `upstreamCommentId`
  - `isEditable`
  - `uploadAvailable`
  - `lastSyncedAt`
  - `syncMessage`
- **State transitions**:
  - `paperclip -> provider_push`
  - `provider_pull -> provider_pull` with local edits preserved

## Existing Durable Records Reused

- Existing issue link entities remain the durable source for upstream issue key,
  URL, provider status metadata, sync timestamps, and source provenance.
- Existing comment link state remains the durable source for upstream comment id,
  direction, and last sync time.
- Existing plugin instance config and state remain the source for provider
  connection details and saved mappings, but the UI-facing shape will likely be
  expanded to carry provider-aware configuration and filter metadata.
