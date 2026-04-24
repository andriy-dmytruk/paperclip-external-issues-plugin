# Contract: Provider Sync Interface & Identity Reconciliation

## Purpose

Define the provider-agnostic contract the worker orchestration uses for
upstream issue sync and mutation flows, including deterministic identity
reconciliation requirements.

## Provider Adapter Interface (behavioral contract)

Every provider adapter must implement the following contract groups:

1. **Configuration & Health**
   - `validateConfig(config) -> ValidationResult`
   - `testConnection(config) -> ConnectionResult`

2. **Upstream Discovery**
   - `listUpstreamProjects(config, query?) -> UpstreamProject[]`
   - `searchUsers(config, query, context?) -> UpstreamUser[]`
   - `listAssignableUsers(config, issueRef) -> UpstreamUser[]`
   - `listStatuses(config, issueRef?) -> UpstreamStatus[]`

3. **Issue Read**
   - `listIssues(config, mapping, cursor?) -> UpstreamIssuePage`
   - `getIssue(config, issueRef) -> UpstreamIssue`
   - `toCanonicalIssue(upstreamIssue, context) -> CanonicalIssue`

4. **Issue Mutation**
   - `createUpstreamIssue(config, draft) -> UpstreamIssue`
   - `updateUpstreamIssue(config, issueRef, patch) -> UpstreamIssue`
   - `updateUpstreamStatus(config, issueRef, transitionId) -> UpstreamIssue`
   - `updateUpstreamAssignee(config, issueRef, assigneeRef) -> UpstreamIssue`

5. **Comments**
   - `listComments(config, issueRef) -> UpstreamComment[]`
   - `postComment(config, issueRef, body) -> UpstreamComment`
   - `toCanonicalComment(upstreamComment, context) -> CanonicalComment`

## Identity Reconciliation Contract

Orchestration must apply this algorithm for every upstream issue candidate:

1. Build deterministic `upstreamIdentityKey` from provider adapter normalized
   identity components.
2. Look up existing synced local issue by `upstreamIdentityKey`.
3. If found: update existing issue/link metadata (never create).
4. If not found:
   - run legacy compatibility derivation on historical link metadata
   - retry lookup using derived identity
5. Only create a new local issue when no existing identity match is found.

## Required Invariants

- A single `upstreamIdentityKey` maps to at most one local synced issue.
- Background/manual sync use the same reconciliation algorithm.
- Provider-specific request/response types do not cross module boundary into
  shared orchestration.
- Sync status updates are project-scoped and cannot overwrite another project’s
  status snapshot.

## Error Contract

- Adapter errors return structured, user-safe messages plus redacted diagnostics
  for logs.
- Reconciliation failures must not silently create duplicates; they should
  surface actionable errors and preserve existing local state.
