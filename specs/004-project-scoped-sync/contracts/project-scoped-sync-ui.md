# Contract: Project-Scoped Sync UI

This document defines the planned worker and hosted-UI bridge contract for the
project-scoped Jira sync redesign. It describes plugin-internal contracts, not
new Paperclip platform APIs.

## Data Contracts

### `sync.projects`

- **Purpose**: Return the list of Paperclip projects that can be selected from a
  global sync surface.
- **Input**:
  - `companyId`
- **Output**:
  - `projects[]`
    - `projectId`
    - `projectName`
    - `providerId`
    - `providerDisplayName`
    - `isConfigured`

### `sync.projectState`

- **Purpose**: Return the full sync configuration state for one selected
  Paperclip project.
- **Input**:
  - `companyId`
  - `projectId`
- **Output**:
  - `projectId`
  - `projectName`
  - `selectedProviderId`
  - `availableProviders[]`
  - `uploadDefaults`
    - `defaultAssignee`
    - `defaultStatus`
    - `resolvedFromProviderIdentity`
  - `filters`
  - `refreshCadenceMinutes`
  - `syncProgress`
  - `configReady`
  - `configMessage`

### `issue.syncPresentation`

- **Purpose**: Return issue-level sync presentation for the currently opened
  issue.
- **Input**:
  - `companyId`
  - `issueId`
- **Output**:
  - `visible`
  - `isSynced`
  - `providerKey`
  - `upstreamIssueKey`
  - `openInProviderUrl`
  - `upstreamStatus`
  - `upstreamAssignee`
  - `lastSyncedAt`
  - `uploadAvailable`

### `comment.syncPresentation`

- **Purpose**: Return comment-level sync origin and actionability data.
- **Input**:
  - `companyId`
  - `issueId`
  - `commentId`
- **Output**:
  - `visible`
  - `linked`
  - `origin`
  - `jiraIssueKey`
  - `upstreamCommentId`
  - `isEditable`
  - `uploadAvailable`
  - `lastSyncedAt`
  - `syncMessage`

## Action Contracts

### `sync.project.save`

- **Purpose**: Save project-scoped sync configuration for one Paperclip project.
- **Input**:
  - `companyId`
  - `projectId`
  - `providerId`
  - `uploadDefaults`
  - `filters`
  - `refreshCadenceMinutes`
- **Behavior**:
  - updates only the selected project's sync configuration
  - preserves reusable provider definitions outside project state
  - never persists raw secrets into plugin state

### `sync.project.refreshIdentity`

- **Purpose**: Resolve the authenticated upstream user for the selected
  project's provider so the default assignee can be prefilled.
- **Input**:
  - `companyId`
  - `projectId`
  - `providerId`
- **Output**:
  - `defaultAssignee`
  - `resolvedFromProviderIdentity`
  - `message`

### `sync.project.runNow`

- **Purpose**: Run sync for exactly one selected Paperclip project.
- **Input**:
  - `companyId`
  - `projectId`
- **Output**:
  - `status`
  - `processedCount`
  - `totalCount`
  - `importedCount`
  - `updatedCount`
  - `skippedCount`
  - `failedCount`
  - `message`

### `sync.project.hideImported`

- **Purpose**: Hide imported Jira issues for exactly one selected Paperclip
  project according to the project's current filter scope.
- **Input**:
  - `companyId`
  - `projectId`
  - optional cleanup filter selector
- **Output**:
  - `status`
  - `hiddenCount`
  - `message`

### `issue.uploadToProvider`

- **Purpose**: Upload one local Paperclip issue to the configured provider for
  that issue's project.
- **Input**:
  - `companyId`
  - `issueId`
- **Output**:
  - `status`
  - `message`
  - `upstreamIssueKey`
  - `upstreamIssueUrl`

### `comment.uploadToProvider`

- **Purpose**: Upload one existing local Paperclip comment to the linked Jira
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

- Project-scoped sync settings are the only source of truth for which provider,
  defaults, cadence, and filters apply to a Paperclip project.
- Reusable provider definitions remain separate from project-scoped settings.
- Local Paperclip workflow state remains distinct from Jira upstream status and
  assignee metadata.
- An issue is presented as upstream-linked only when durable plugin-owned link
  metadata confirms the current issue is actually linked.
