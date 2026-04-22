# Quickstart: Project-Scoped Jira Sync Setup

## Goal

Validate the project-scoped sync redesign end to end before implementation
expands further.

## Prerequisites

- Repo root: `/Users/andriy/IdeaProjects/paperclip-jira-plugin`
- Local dependencies installed
- A local Paperclip instance available for hosted UI verification when needed
- At least one saved Jira provider definition or test Jira credentials

## Development Loop

1. Refactor worker settings storage from company-scoped mapping collections to
   project-scoped sync configuration records.
2. Update hosted UI flows so project launchers open directly into that
   project's sync settings and the global launcher starts with project
   selection.
3. Preserve reusable provider management while wiring project-level provider
   selection, upload defaults, cadence, and filters.
4. Keep issue detail limited to true linked-issue metadata and local issue
   upload actions.
5. Update tests, README, and SPEC to reflect the new project-scoped model.

## Verification Commands

```bash
cd /Users/andriy/IdeaProjects/paperclip-jira-plugin
pnpm typecheck
pnpm test
pnpm build
```

## Manual Verification Checklist

1. Open `Sync Issues` from a Paperclip project and confirm the modal is already
   scoped to that project.
2. Open `Sync Issues` from the global launcher and confirm a project selector is
   shown before project settings.
3. Open a newly created project and confirm no provider is selected by default.
4. Switch a configured project back to `Provider: None` and confirm it becomes
   Paperclip-only without losing its saved Jira mappings and defaults.
5. Select a saved Jira provider for one project and confirm another project
   still remains unconfigured.
6. Confirm default assignee resolves from provider identity when available.
7. Confirm default assignee and mapping assignee use Jira autocomplete instead
   of plain free-text entry.
8. Confirm default upload status starts as `in_progress`.
9. Confirm default filters are active issues assigned to the resolved user.
10. Run sync and hide actions and verify they affect only the selected project.
11. Open a synced issue and confirm Jira status, assignee, and imported comments
   still appear.
12. Open a local issue in a configured project and confirm an upload-to-Jira
    action is available.
13. Open a local issue in a project with no provider and confirm it does not
    appear linked to Jira.

## Rollback Notes

- If project-scoped state migration proves too risky for one rollout, keep the
  provider definitions stable and add a compatibility reader for older mapping
  records until the new project config is saved.
- If authenticated-user lookup is unavailable for some Jira deployments, keep
  the default assignee editable and empty rather than blocking the rest of the
  project configuration.
