# Quickstart: Project-First Sync UX Refresh

## Goal

Validate the project-first sync redesign end to end before implementation work
starts.

## Prerequisites

- Repo root: `<repo-root>`
- Local dependencies installed
- A Paperclip host environment available for manual plugin UI verification
- At least one reusable Jira provider definition or test Jira credentials

## Design Focus

1. Move `Sync Issues` discovery into project and issue contexts.
2. Make the cross-project flow start with project selection only.
3. Split provider management into a dedicated settings directory and provider
   detail pages.
4. Reveal project sync controls only after a provider is selected.
5. Bring dark-mode sync styling back in line with host conventions.
6. Distinguish imported comments and add upstream publication to the standard
   comment composer.

## Verification Commands

```bash
cd <repo-root>
pnpm typecheck
pnpm test
pnpm build
```

## Manual Verification Checklist

1. Open a Paperclip project and confirm `Sync Issues` is available from that
   project context.
2. Open an issue and confirm `Sync Issues` appears among the other issue
   buttons rather than only at the top of the application.
3. Open the cross-project sync entry and confirm no project-specific controls
   appear before selecting a project.
4. Select a project and confirm the UI navigates into that project's dedicated
   sync page.
5. Open a project sync page without a selected provider and confirm only
   provider selection plus `Hide imported issues` are shown.
6. Open plugin settings and confirm providers appear on a dedicated page
   separate from project sync.
7. Create or edit a provider and confirm the provider detail page uses `Back`
   navigation and includes a provider-type selector.
8. Open a synced issue in dark mode and confirm sync buttons and panels match
   the host visual style without white-ish filled backgrounds.
9. Open a synced issue with imported comments and confirm imported comments are
   visually distinct from local-only comments.
10. Submit a new comment on a synced issue with `Publish to upstream` cleared
    and confirm it remains local-only.
11. Submit a new comment on a synced issue with `Publish to upstream` selected
    and confirm the same comment flow records the upstream publication request.

## Rollback Notes

- If provider-page navigation proves too disruptive in one release, preserve the
  provider data model and ship the dedicated pages behind the existing settings
  entry until all routes are stable.
- If the existing comment composer cannot safely carry upstream publication in
  one rollout, keep imported comment styling and delay the publish option rather
  than introducing a second comment authoring surface.
