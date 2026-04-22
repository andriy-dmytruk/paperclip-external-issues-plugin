# Research: Project-First Sync UX Refresh

## Decision 1: Make project and issue surfaces the primary sync entry points

- **Decision**: Treat the project context as the main place to launch `Sync
  Issues`, keep an issue-context `Sync Issues` action among the other issue
  buttons, and reduce the global top-of-window launcher to a secondary
  cross-project entry point.
- **Rationale**: The feature request is centered on moving sync to where users
  already work. Project-level entry keeps configuration naturally scoped, while
  issue-level entry preserves discoverability during day-to-day issue work.
- **Alternatives considered**:
  - Keep the top-of-window launcher as the primary path: rejected because it
    disconnects sync from project and issue workflows.
  - Remove the global launcher entirely: rejected because administrators still
    need a cross-project starting point for selection and review.

## Decision 2: Use progressive disclosure with dedicated project pages

- **Decision**: The cross-project sync surface will start with project
  selection only. After a project is chosen, the user moves into a dedicated
  page for that project's sync configuration. Before a provider is selected,
  that page shows only provider selection and `Hide imported issues`.
- **Rationale**: This directly addresses the reported confusion from showing too
  many controls before the user has picked the project and provider context that
  gives those controls meaning.
- **Alternatives considered**:
  - Keep all project controls in one long mixed form: rejected because it
    preserves the same cognitive overload the feature is trying to remove.
  - Show disabled controls before selection: rejected because visible but
    inactive controls still create noise and unclear expectations.

## Decision 3: Separate provider management from project configuration

- **Decision**: Provider records will live on a dedicated settings page, and
  each provider record will open on its own detail page with a provider-type
  selector and `Back` navigation instead of a nested popup on top of another
  popup.
- **Rationale**: Provider records are reusable configuration assets, while
  project sync pages are project-owned operating surfaces. Splitting them makes
  both flows clearer and creates space for future provider types beyond Jira.
- **Alternatives considered**:
  - Continue editing providers in nested overlays: rejected because the current
    stacked popup interaction is explicitly called out as awkward.
  - Move provider credentials directly into each project page: rejected because
    it would duplicate reusable provider definitions and weaken provider
    boundaries.

## Decision 4: Reuse Paperclip host styling patterns in dark mode

- **Decision**: Sync action buttons and status panels should align with the host
  theme's transparent or lightly tinted control treatment in dark mode instead
  of using bright white-ish backgrounds that overpower neighboring controls.
- **Rationale**: The reported dark-mode inconsistency is visual rather than
  functional, so the best fix is to follow the host's established contrast and
  fill patterns for buttons, cards, and status treatments.
- **Alternatives considered**:
  - Keep custom filled button backgrounds for sync controls: rejected because
    they visually clash with Paperclip-hosted UI.
  - Remove all visual emphasis from sync states: rejected because synced/local
    status still needs clear affordances and differentiation.

## Decision 5: Distinguish imported comments through presentation metadata

- **Decision**: Imported comments should remain editable in Paperclip while
  gaining a clearer imported visual treatment driven by comment-level sync
  presentation data rather than separate custom comment objects.
- **Rationale**: The request asks for imported comments to look distinct without
  making the interaction feel like a different comment system. Presentation
  metadata preserves the existing Paperclip comment flow while clarifying
  provenance.
- **Alternatives considered**:
  - Create a second comment rendering system for imported comments: rejected
    because it would fragment the issue discussion experience.
  - Keep imported comments visually identical and rely only on small labels:
    rejected because the current experience is already described as not
    intuitive enough.

## Decision 6: Extend the existing comment composer with upstream publication choice

- **Decision**: Use the standard new-comment field for synced issues and add a
  publication control, such as `Publish to upstream`, within that same composer
  flow so one submitted comment can be local-only or also publish upstream.
- **Rationale**: This keeps comment authoring simple and avoids forcing users
  into a second comment form just to publish upstream.
- **Alternatives considered**:
  - Add a separate upstream comment form: rejected because it duplicates the
    writing flow and increases the chance of inconsistent comments.
  - Publish every new comment upstream automatically on synced issues: rejected
    because users need an explicit choice per comment.
