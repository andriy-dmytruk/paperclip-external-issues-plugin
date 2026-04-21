# Contract: Provider Sync UI

This document defines the planned worker/UI bridge contract for the
provider-aware sync redesign. It is a product-facing contract for this plugin,
not a public Paperclip platform API.

## Data Contracts

### `sync.providers`

- **Purpose**: Return provider options and current readiness/config summary for
  the active company.
- **Input**:
  - `companyId`
- **Output**:
  - `providers[]`
    - `providerKey`
    - `displayName`
    - `status`
    - `configSummary`
    - `supportsConnectionTest`

### `sync.popupState`

- **Purpose**: Return the full state needed to render the sync popup.
- **Input**:
  - `companyId`
  - optional `providerKey`
- **Output**:
  - `selectedProviderKey`
  - `providerConfig`
  - `filters`
  - `syncProgress`
  - `connectionTest`

### `issue.syncPresentation`

- **Purpose**: Return issue-level synced/local presentation data for hosted UI
  surfaces.
- **Input**:
  - `companyId`
  - `issueId`
- **Output**:
  - `isSynced`
  - `providerKey`
  - `upstreamIssueKey`
  - `localStatus`
  - `upstreamStatus`
  - `openInProviderUrl`
  - `lastSyncedAt`
  - `visualTone`
  - `titlePrefix`

### `comment.syncPresentation`

- **Purpose**: Return comment-level sync origin and actionability data.
- **Input**:
  - `companyId`
  - `issueId`
  - `commentId`
- **Output**:
  - `origin`
  - `providerKey`
  - `isEditable`
  - `uploadAvailable`
  - `lastSyncedAt`
  - `syncMessage`

## Action Contracts

### `sync.provider.saveConfig`

- **Purpose**: Save provider-specific configuration for the active company.
- **Input**:
  - `companyId`
  - `providerKey`
  - `config`
- **Behavior**:
  - stores provider-safe config values
  - updates token state without exposing raw saved tokens afterward

### `sync.provider.testConnection`

- **Purpose**: Test the selected provider configuration explicitly.
- **Input**:
  - `companyId`
  - `providerKey`
  - optional unsaved `config`
- **Output**:
  - `status`
  - `message`

### `sync.runNow`

- **Purpose**: Start a manual sync from the popup with provider filters.
- **Input**:
  - `companyId`
  - `providerKey`
  - optional `filters`
- **Output**:
  - `status`
  - `processedCount`
  - `totalCount`
  - `importedCount`
  - `updatedCount`
  - `skippedCount`
  - `failedCount`
  - `message`

### `comment.uploadToProvider`

- **Purpose**: Upload an existing local Paperclip comment to the linked upstream
  issue.
- **Input**:
  - `companyId`
  - `issueId`
  - `commentId`
- **Output**:
  - `status`
  - `message`
  - `upstreamCommentId`

## Invariants

- Local Paperclip issue workflow status remains separate from upstream provider
  status metadata.
- `Open in Jira` is exposed as a first-class visible action whenever an upstream
  provider URL is known for a synced issue.
- Pulled comments remain visibly upstream-originated even when edited locally.
