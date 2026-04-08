# AGENTS.md

Guidance for agents working in `plugins/agent-companies-manager`.

This file supplements the repository-root `AGENTS.md`. Follow the root workspace rules first, then the plugin-specific requirements below.

## Source of truth

- Use spec-driven development for this plugin.
- `SPEC.md` is the source of truth for behavior, scope, and acceptance criteria.
- Before implementing or changing a feature, read the relevant parts of `SPEC.md` and validate that the implementation matches the specification.
- If code, tests, or docs disagree with `SPEC.md`, treat the spec as authoritative and bring the implementation back into alignment unless the task explicitly updates the spec.

## Documentation requirements

- User-facing documentation for this plugin lives in `README.md`.
- Every new feature or meaningful behavior change must include a corresponding `README.md` update in the same task.
- Keep documentation focused on how a Paperclip user installs, configures, and uses the plugin.

## Testing and verification

Feature work on this plugin is not complete with unit or package-level tests alone.

When implementing a feature, verify at the smallest relevant scope first and then cover the end-to-end flow:

1. Run diagnostics on edited files.
2. Run the relevant `pnpm` tests for this plugin.
3. Perform end-to-end verification with Playwright in headless mode.

The Playwright flow must cover all of the following:

- Prepare fixture data needed for the scenario.
- Spawn a test-scoped Paperclip instance.
- Install this plugin into that test instance.
- Exercise the feature through the real integration surface.
- Assert the expected behavior from the specification.

## Implementation guardrails

- Keep changes scoped to this plugin unless shared workspace infrastructure is genuinely required.
- Prefer adding or updating tests alongside implementation, not afterwards.
- Do not mark a task complete unless spec validation, documentation, and end-to-end verification have all been addressed.
