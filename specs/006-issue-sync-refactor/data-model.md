# Data Model: Issue Sync Refactor

## SyncedIssueLink

- **Purpose**: Durable link between a local Paperclip issue and an upstream
  provider issue.
- **Fields**:
  - `paperclipIssueId`
  - `providerType` (`jira_dc`, `jira_cloud`, `github_issues`)
  - `providerScope` (normalized upstream namespace, e.g., repo or project)
  - `upstreamIssueId` (provider-native stable identifier)
  - `upstreamIssueDisplayKey` (human-friendly key/number)
  - `upstreamIdentityKey` (deterministic composite identity)
  - `upstreamUrl`
  - `synced` (boolean marker for cleanup and reconciliation)
  - `lastSyncedAt`
- **Validation rules**:
  - `upstreamIdentityKey` is required for newly written records.
  - `synced=true` implies a non-empty `providerType` and upstream identifiers.
  - Writes must be idempotent by `upstreamIdentityKey`.

## UpstreamIdentityKey

- **Purpose**: Canonical key used to decide update vs create on sync.
- **Fields**:
  - `providerType`
  - `providerScope`
  - `upstreamIssueId`
  - `canonicalKey` (`{providerType}:{providerScope}:{upstreamIssueId}`)
- **Validation rules**:
  - Same upstream issue must always produce same `canonicalKey`.
  - Switching providers cannot reuse `canonicalKey` for unrelated systems.

## SyncProjectRuntime

- **Purpose**: Project-scoped runtime state for background/manual sync status.
- **Fields**:
  - `companyId`
  - `projectId`
  - `providerId` (or `none`)
  - `status` (`idle`, `running`, `success`, `error`)
  - `message`
  - `checkedAt`
  - counts (`processed`, `imported`, `updated`, `skipped`, `failed`)
- **Validation rules**:
  - Status updates must be scoped to the same `projectId`.
  - `running` transitions to terminal states with `checkedAt` set.

## ProviderAdapterContract

- **Purpose**: Shared provider interface used by orchestration, regardless of
  Jira/GitHub specifics.
- **Fields**:
  - `providerType`
  - `capabilities`
  - methods for:
    - project/repository selection lookup
    - issue query/list/get
    - issue creation/update
    - status/assignee mutation
    - comment list/post
    - canonical mapping conversion
- **Validation rules**:
  - Shared orchestration cannot call provider SDK clients directly.
  - Provider modules own provider API types and transport details.

## LegacySyncCompatibilityRecord

- **Purpose**: Transitional view for pre-refactor synced records that do not
  yet include complete identity metadata.
- **Fields**:
  - `paperclipIssueId`
  - `legacyProviderId`
  - `legacyIssueKeyOrNumber`
  - `candidateProviderScope`
  - `derivedUpstreamIdentityKey`
  - `migrationState` (`pending`, `derived`, `failed`)
- **Validation rules**:
  - Migration must run before create/update reconciliation for affected issues.
  - Failed derivation must not create new duplicate issues silently.
