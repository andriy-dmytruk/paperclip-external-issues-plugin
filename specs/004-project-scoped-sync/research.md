# Research: Project-Scoped Jira Sync Setup

## Decision 1: Keep provider definitions reusable, but move sync ownership to projects

- **Decision**: Continue storing provider definitions in plugin instance config,
  but store sync settings as one project-scoped configuration per Paperclip
  project.
- **Rationale**: The user wants providers and mappings separated. Reusing saved
  Jira providers avoids duplicating credentials, while project-scoped settings
  remove the extra target-project mapping step from daily usage.
- **Alternatives considered**:
  - Keep company-scoped mapping rows with a target project selector: rejected
    because it preserves the same mental model the redesign is trying to remove.
  - Duplicate full provider credentials into every project config: rejected
    because it increases secret management burden and config drift.

## Decision 2: Make project context the primary sync entry point

- **Decision**: Treat `Sync Issues` launched from a project as already scoped to
  that project, and require a project picker only when the sync UI is opened
  from a global context.
- **Rationale**: This matches how users think about Paperclip work. Most sync
  setup and sync execution decisions belong to one project at a time.
- **Alternatives considered**:
  - Always show the project selector first: rejected because it adds unnecessary
    friction when the user is already inside a project.
  - Remove the global entry point entirely: rejected because users still need a
    top-level way to inspect or configure sync outside project detail.

## Decision 3: Resolve default assignee from provider identity, with safe fallback

- **Decision**: When a provider supports authenticated-user lookup, populate the
  project's default upload assignee from that identity and let the user override
  it manually; otherwise leave the field editable and empty.
- **Rationale**: The user explicitly wants the default assignee fetched from the
  provided token. Making this a project-level default reduces repeated manual
  setup for issue upload.
- **Alternatives considered**:
  - Require manual assignee entry every time: rejected because it makes project
    setup noisier and less reliable.
  - Treat missing identity lookup as a hard error: rejected because some Jira
    setups may still be usable for sync even if identity lookup is unavailable.

## Decision 4: Keep project sync state separate from issue link state

- **Decision**: Introduce a project sync configuration model for provider
  selection, upload defaults, cadence, filters, and last run state, while
  reusing existing issue-link and comment-link records for per-issue upstream
  metadata.
- **Rationale**: Project-scoped settings and per-issue upstream linkage solve
  different problems. Combining them would make saved configuration brittle and
  would risk reintroducing stale-link presentation bugs.
- **Alternatives considered**:
  - Store everything only on issue link records: rejected because project-wide
    sync configuration would become fragmented across imported issues.
  - Replace issue link records with project-only state: rejected because issue
    detail still needs durable upstream keys, status, assignee, and comment
    linkage.

## Decision 5: Scope sync and hide actions strictly to the selected project

- **Decision**: Manual sync and hide-imported-issues actions should operate only
  on the currently selected Paperclip project, even when launched from a global
  modal after project selection.
- **Rationale**: The spec explicitly calls for project-only sync and hide
  behavior. This reduces accidental cross-project changes and matches the new
  configuration model.
- **Alternatives considered**:
  - Allow one click to sync all configured projects: rejected for this feature
    because it would weaken the project-scoped redesign and complicate progress
    feedback.
  - Keep hide behavior global while sync becomes project-scoped: rejected
    because it creates two conflicting scopes in one UI.

## Decision 6: Preserve issue-level simplicity while preventing false upstream linkage

- **Decision**: Continue showing Jira status, assignee, and imported comments on
  truly linked issues, and show an upload action only when the current issue's
  project has a configured provider and the issue itself is not already linked.
- **Rationale**: The existing plugin already fixed a bug where fresh local
  issues could appear linked accidentally. The new project-scoped model should
  keep issue detail simple without loosening link detection.
- **Alternatives considered**:
  - Always show Jira metadata shell on every issue in a configured project:
    rejected because it blurs the distinction between configured projects and
    actually linked issues.
  - Remove issue-level upload in favor of project sync only: rejected because
    the user still wants one-click upload for locally created issues.
