# Data Model: Project-Scoped Jira Sync Setup

## ProjectSyncConfiguration

- **Purpose**: Stores the complete sync setup for one Paperclip project.
- **Fields**:
  - `projectId`
  - `companyId`
  - `providerId`: optional reference to a saved provider definition
  - `uploadDefaults`
  - `refreshCadenceMinutes`
  - `filters`
  - `syncRunState`
  - `updatedAt`
- **Validation rules**:
  - One configuration exists per Paperclip project at most
  - `providerId` may be empty for projects that remain Paperclip-only
  - Config must never embed raw provider secrets
- **Relationships**:
  - References one `ProviderDefinition`
  - Owns one `ProjectUploadDefaults`
  - Owns one `ProjectImportFilterSet`
  - Owns one `ProjectSyncRunState`

## ProviderDefinition

- **Purpose**: Reusable upstream connection definition stored in plugin config.
- **Fields**:
  - `id`
  - `type`
  - `name`
  - `jiraBaseUrl`
  - `jiraUserEmail`
  - `jiraTokenRef` or hidden saved token marker
  - `defaultIssueType`
- **Validation rules**:
  - Provider definitions remain instance-scoped, not project-scoped
  - Raw saved tokens are not exposed back to project settings UI
  - A project may reference only one provider definition at a time

## ProjectUploadDefaults

- **Purpose**: Default values used when a local Paperclip issue is uploaded from
  one project to Jira.
- **Fields**:
  - `defaultAssignee`
  - `defaultStatus`
  - `resolvedFromProviderIdentity`: boolean
- **Validation rules**:
  - `defaultStatus` defaults to `in_progress` when not overridden
  - `defaultAssignee` stores a structured Jira user reference keyed by
    `accountId`
  - `defaultAssignee` may be empty if provider identity cannot be resolved
  - Manual overrides must be preserved even after later identity refreshes

## ProjectImportFilterSet

- **Purpose**: Defines which upstream Jira issues are in scope for one project's
  import and refresh flow.
- **Fields**:
  - `onlyActive`
  - `assignee`
  - `author`
  - `issueNumberGreaterThan`
  - `issueNumberLessThan`
  - `jiraJql`
- **Validation rules**:
  - New configurations default to `onlyActive = true`
  - New configurations default `assignee` to the resolved default upstream user
    when available
  - `assignee` stores the same structured Jira user reference shape used by
    project upload defaults
  - Numeric bounds must be numeric when present
  - Empty filter values are omitted rather than stored as invalid data

## JiraUserReference

- **Purpose**: Durable Jira identity record reused by project upload defaults,
  assignee filters, current-user resolution, and Jira autocomplete suggestions.
- **Fields**:
  - `accountId`
  - `displayName`
  - optional `emailAddress`
  - optional `username`
- **Validation rules**:
  - `accountId` is the durable key used for persistence and JQL generation
  - `displayName` is presentation text only
  - Legacy string assignee values are normalized into this shape on read

## ProjectSyncRunState

- **Purpose**: Captures the last known sync or hide operation status for one
  project.
- **Fields**:
  - `status`: `idle`, `running`, `success`, `error`
  - `message`
  - `checkedAt`
  - `processedCount`
  - `totalCount`
  - `importedCount`
  - `updatedCount`
  - `skippedCount`
  - `failedCount`
  - `lastRunTrigger`
- **State transitions**:
  - `idle|success|error -> running`
  - `running -> success|error`
- **Validation rules**:
  - Counts are project-scoped and must not aggregate other projects

## IssueSyncPresentation

- **Purpose**: User-facing sync state for one Paperclip issue.
- **Fields**:
  - `issueId`
  - `projectId`
  - `isSynced`
  - `providerKey`
  - `upstreamIssueKey`
  - `openInProviderUrl`
  - `upstreamStatusName`
  - `upstreamStatusCategory`
  - `upstreamAssigneeDisplayName`
  - `lastSyncedAt`
  - `source`: `jira` or `paperclip`
  - `uploadAvailable`
- **Validation rules**:
  - `isSynced` is true only when the issue still has a valid plugin-owned link
    record and durable upstream marker
  - Local Paperclip workflow status is not duplicated here as a replacement for
    Paperclip-owned issue status
  - `uploadAvailable` is true only for unlinked issues in projects with a
    configured provider

## CommentSyncPresentation

- **Purpose**: User-facing sync state for one comment attached to a Jira-linked
  Paperclip issue.
- **Fields**:
  - `commentId`
  - `issueId`
  - `origin`: `paperclip`, `provider_pull`, `provider_push`
  - `jiraIssueKey`
  - `upstreamCommentId`
  - `isEditable`
  - `uploadAvailable`
  - `lastSyncedAt`
  - `syncMessage`
- **Validation rules**:
  - Pulled comments remain editable local Paperclip comments
  - Upload actions are available only when the parent issue is linked upstream

## Existing Durable Records Reused

- **Issue link metadata** remains the durable source for upstream Jira issue id,
  issue key, Jira URL, upstream status, upstream assignee, timestamps, and
  import provenance.
- **Comment link metadata** remains the durable source for upstream comment id,
  sync direction, and last sync time.
- **Plugin config provider records** remain the durable source for reusable Jira
  connection definitions.
