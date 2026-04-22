# Contract: Project-First Sync UI

This document defines the planned worker and hosted-UI bridge for the
project-first sync UX refresh. It documents plugin-internal UI contracts rather
than new Paperclip platform APIs.

## Data Contracts

### `sync.entryContext`

- **Purpose**: Describe where the user launched the sync flow from and which
  project or issue context is already known.
- **Input**:
  - optional `companyId`
  - optional `projectId`
  - optional `issueId`
  - `surface`
- **Output**:
  - `surface`
  - `projectId`
  - `projectName`
  - `issueId`
  - `requiresProjectSelection`

### `sync.projectList`

- **Purpose**: Return the selectable Paperclip projects for the cross-project
  sync start screen.
- **Input**:
  - `companyId`
- **Output**:
  - `projects[]`
    - `projectId`
    - `projectName`
    - `providerId`
    - `providerDisplayName`
    - `hasImportedIssues`
    - `isConfigured`

### `sync.projectPage`

- **Purpose**: Return the dedicated sync page state for one selected project.
- **Input**:
  - `companyId`
  - `projectId`
- **Output**:
  - `projectId`
  - `projectName`
  - `selectedProviderId`
  - `showProviderSelection`
  - `showHideImported`
  - `showProjectSettings`
  - `showSyncActions`
  - `availableProviders[]`
  - `providerSummary`
  - `projectSettings`
  - `navigationContext`

### `settings.providerDirectory`

- **Purpose**: Return the reusable provider-management view state.
- **Input**:
  - optional `companyId`
- **Output**:
  - `providers[]`
    - `providerId`
    - `providerType`
    - `displayName`
    - `configSummary`
    - `tokenSaved`
  - `availableProviderTypes[]`

### `settings.providerDetail`

- **Purpose**: Return the create or edit state for one provider detail page.
- **Input**:
  - optional `providerId`
- **Output**:
  - `mode`
  - `providerId`
  - `providerType`
  - `fields`
  - `tokenSaved`
  - `backTarget`

### `issue.syncPresentation`

- **Purpose**: Return issue-level sync presentation with theme-aware action and
  status metadata.
- **Input**:
  - `companyId`
  - `issueId`
- **Output**:
  - `visible`
  - `isSynced`
  - `providerKey`
  - `upstreamIssueKey`
  - `openInProviderUrl`
  - `statusTone`
  - `actionTone`
  - `commentComposerEligible`

### `comment.syncPresentation`

- **Purpose**: Return comment provenance and styling metadata for comments shown
  on a synced issue.
- **Input**:
  - `companyId`
  - `issueId`
  - `commentId`
- **Output**:
  - `visible`
  - `origin`
  - `providerKey`
  - `styleTone`
  - `badgeLabel`
  - `lastSyncedAt`

## Action Contracts

### `sync.project.select`

- **Purpose**: Move from the cross-project entry screen into one dedicated
  project sync page.
- **Input**:
  - `companyId`
  - `projectId`
- **Output**:
  - `projectId`
  - `navigationTarget`

### `sync.project.save`

- **Purpose**: Save project-specific sync configuration for one project after a
  provider has been selected.
- **Input**:
  - `companyId`
  - `projectId`
  - `providerId`
  - `projectSettings`
- **Behavior**:
  - updates only the selected project's sync settings
  - keeps reusable provider definitions outside project state
  - preserves the ability to clear the selected provider later

### `sync.project.hideImported`

- **Purpose**: Hide imported issues for the current project whether or not a
  provider is currently selected.
- **Input**:
  - `companyId`
  - `projectId`
- **Output**:
  - `status`
  - `hiddenCount`
  - `message`

### `settings.provider.save`

- **Purpose**: Create or update one provider definition on its dedicated detail
  page.
- **Input**:
  - optional `providerId`
  - `providerType`
  - `fields`
- **Output**:
  - `providerId`
  - `providerType`
  - `displayName`
  - `tokenSaved`

### `issue.comment.submit`

- **Purpose**: Submit a new comment from the standard issue comment composer
  with an optional request to publish it upstream.
- **Input**:
  - `companyId`
  - `issueId`
  - `body`
  - `publishToUpstream`
- **Output**:
  - `status`
  - `commentId`
  - `publishedUpstream`
  - `message`

## Invariants

- Project selection happens before project-specific sync controls are shown in a
  cross-project flow.
- Provider selection happens before provider-specific settings or sync actions
  are shown on a project page.
- Provider definitions remain separate from project sync pages even when users
  navigate between them.
- Imported comments remain part of the shared Paperclip comment thread while
  exposing visible provenance.
- The standard comment composer remains the only authoring surface for new
  comments, with upstream publication expressed as an option inside that flow.
