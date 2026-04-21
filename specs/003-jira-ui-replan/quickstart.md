# Quickstart: Provider-Aware Jira UI Replan

## Goal

Validate the redesigned provider-aware sync UI from a developer and operator
perspective before broader rollout.

## Prerequisites

- Repo root: `/Users/andriy/IdeaProjects/paperclip-jira-plugin`
- Local dependencies installed
- A local Paperclip instance available for hosted UI verification when needed
- Jira credentials or a test double suitable for connection-testing flows

## Development Loop

1. Implement provider-aware popup and sync presentation changes in the hosted UI.
2. Expand worker bridge data/actions to support provider config, connection
   testing, filters, progress, and comment upload state.
3. Preserve existing durable Jira link/comment metadata while extending the UI
   contract around it.
4. Update docs and contract tests for any changed UI/worker behavior.

## Verification Commands

```bash
cd /Users/andriy/IdeaProjects/paperclip-jira-plugin
pnpm typecheck
pnpm test
pnpm build
```

## Manual Verification Checklist

1. Open the sync popup from the plugin UI.
2. Confirm provider selection is visible and Jira is available.
3. Confirm saved token handling does not expose raw credentials.
4. Run a connection test and verify success/error feedback appears in the popup.
5. Apply filters and start a sync.
6. Verify progress updates show processed and total issue counts when available.
7. Open a synced issue and confirm:
   - synced/local distinction is visually clear
   - local status and upstream provider status are both visible
   - `Open in Jira` is a visible action button
8. Open fetched comments and confirm:
   - upstream-origin comments are clearly marked
   - comments remain editable in Paperclip
   - an explicit upload action exists for existing local comments

## Rollback Notes

- If the richer issue styling is not possible in a given host surface, retain
  the title-prefix fallback for synced issues.
- If progress totals cannot be produced reliably for the first rollout, preserve
  processed counts and explicit running/completed states rather than hiding sync
  feedback entirely.
