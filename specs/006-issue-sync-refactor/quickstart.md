# Quickstart: Issue Sync Refactor Validation

## 1. Prepare

1. Ensure dependencies are installed.
2. Start from branch `006-issue-sync-refactor`.
3. Ensure Paperclip host is running for manual validation.

## 2. Verify static quality gates

Run from repository root:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Expected: all commands succeed.

## 2.1 Validate test suite decomposition

1. Confirm large plugin test scenarios are split across responsibility-based
   files under `tests/`.
2. Confirm shared setup/assertion utilities are centralized in reusable helper
   modules/classes.
3. Confirm no single test file remains the default home for all sync/provider
   behaviors.

Expected: test intent is discoverable by domain and helpers remove duplication.

## 3. Validate deterministic sync identity (manual)

1. Configure a project mapping to Jira or GitHub provider.
2. Run sync once and record imported issue count.
3. Run sync again with unchanged upstream data.
4. Confirm no duplicate local issues were created for existing upstream issues.
5. Reinstall/reload plugin worker, run sync again, and confirm duplicates are
   still not created.

Expected: existing synced issues are updated in place across runs/reloads.

## 4. Validate provider-boundary behavior

1. Run provider contract tests (existing + new adapter contract assertions).
2. Confirm shared orchestration tests do not require direct Jira/GitHub client
   imports.

Expected: provider-specific APIs are only exercised through adapter modules.

## 5. Validate project-scoped sync status

1. Run sync for Project A, then Project B.
2. Re-open Project A sync view.
3. Confirm displayed status reflects latest Project A run, not Project B.

Expected: status snapshots are always project-scoped and accurate.

## 6. Validate UI icon consistency

1. Open project toolbar and sync surfaces.
2. Confirm action icons use `lucide-react` components consistently.
3. Confirm no legacy mixed icon styles remain in primary controls.

Expected: icon presentation is consistent across configure/sync actions.
