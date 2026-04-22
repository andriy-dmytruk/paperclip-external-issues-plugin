# Data Model: Project-First Sync UX Refresh

## SyncEntrySurface

- **Purpose**: Represents the Paperclip surface from which a user starts the
  sync flow.
- **Fields**:
  - `surface`: `project`, `issue`, or `global`
  - `projectId`: optional preselected project reference
  - `issueId`: optional current issue reference
  - `placementLabel`
- **Validation rules**:
  - `project` and `issue` surfaces must preserve surrounding Paperclip context
  - `global` surface must not bypass project selection before project settings
    are shown

## ProjectSyncPageState

- **Purpose**: Stores the user-visible state for one dedicated project sync
  page.
- **Fields**:
  - `projectId`
  - `projectName`
  - `selectedProviderId`
  - `providerSelectionVisible`
  - `hideImportedVisible`
  - `settingsVisible`
  - `syncActionsVisible`
  - `navigationContext`
  - `updatedAt`
- **Validation rules**:
  - `settingsVisible` and `syncActionsVisible` are false until a provider is
    selected
  - `hideImportedVisible` remains true even when `selectedProviderId` is empty
  - only one project page state is active at a time in the visible flow
- **State transitions**:
  - `unselected -> project_selected_without_provider`
  - `project_selected_without_provider -> provider_selected`
  - `provider_selected -> provider_cleared`

## ProviderDirectory

- **Purpose**: Represents the reusable provider-management collection shown in
  plugin settings.
- **Fields**:
  - `providers[]`
  - `availableProviderTypes[]`
  - `selectedProviderId`
  - `canCreateProvider`
- **Validation rules**:
  - provider records remain instance-scoped and reusable across projects
  - available provider types must support Jira now and allow future expansion

## ProviderDetailPage

- **Purpose**: Represents the dedicated page for creating or editing a single
  provider definition.
- **Fields**:
  - `providerId`
  - `mode`: `create` or `edit`
  - `providerType`
  - `displayName`
  - `connectionFields`
  - `tokenSaved`
  - `backTarget`
- **Validation rules**:
  - provider detail pages use the shared settings navigation pattern
  - `providerType` is required before provider-specific fields appear
  - raw secrets are never echoed back into visible state after saving

## DarkModeSyncPresentation

- **Purpose**: Captures theme-sensitive styling expectations for sync buttons
  and status panels on issue detail screens.
- **Fields**:
  - `theme`: `light` or `dark`
  - `buttonTone`
  - `panelTone`
  - `backgroundStyle`
  - `borderStyle`
  - `emphasisLevel`
- **Validation rules**:
  - dark-mode backgrounds must align with host visual patterns
  - emphasized sync states must remain readable without using bright opaque
    fills that overpower neighboring Paperclip controls

## ImportedCommentPresentation

- **Purpose**: User-facing metadata that indicates a comment was imported from
  an upstream provider while keeping it inside the shared Paperclip thread.
- **Fields**:
  - `commentId`
  - `issueId`
  - `origin`: `imported`, `local`, or `published_upstream`
  - `providerKey`
  - `importedBadgeLabel`
  - `styleTone`
  - `lastSyncedAt`
- **Validation rules**:
  - imported comments remain editable unless a future policy says otherwise
  - imported presentation must remain visually distinct from local-only
    comments

## CommentComposerPublishChoice

- **Purpose**: The per-comment authoring state that determines whether a new
  comment remains local-only or is also published upstream.
- **Fields**:
  - `issueId`
  - `draftBody`
  - `publishToUpstream`
  - `upstreamEligible`
  - `submissionState`
  - `submissionMessage`
- **Validation rules**:
  - `publishToUpstream` can only be enabled when the issue is still eligible
    for upstream publication
  - when `publishToUpstream` is false, the submission follows normal local
    comment behavior
  - when `publishToUpstream` is true, the resulting comment retains a durable
    record of the requested upstream publication
