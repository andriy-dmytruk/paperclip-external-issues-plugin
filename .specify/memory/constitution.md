# paperclip-external-issues-plugin Constitution

## Core Principles

### I. Stable Paperclip Plugin Identity
The plugin manifest identity, declared capabilities, persisted state keys, and
entity types are treated as compatibility contracts. Changes to plugin id,
entrypoints, capability surface, or durable state names require explicit
migration or a documented breaking-change decision.

### II. Paperclip-Native Experience First
UI contributions must feel like hosted Paperclip surfaces rather than standalone
demos. Loading, error, and empty states are required, and synced-vs-local issue
behavior must stay explicit in the UI. Upstream provider metadata may enrich the
experience, but it must not silently replace Paperclip-owned local workflow
fields.

### III. Provider Boundaries Stay Explicit
External system details such as Jira auth, issue keys, status metadata, and
comment ids are provider-owned metadata. Paperclip planning state remains local
unless a feature explicitly introduces a documented mapping rule. Secrets are
resolved at runtime and must never be copied into plugin state.

### IV. Verification Is Mandatory
Behavior changes to `src/` or `tests/` must be verified with the smallest
relevant set of checks from the repo root. The default quality gate is
`pnpm typecheck`, `pnpm test`, and `pnpm build`, with narrower scopes allowed
only when they still cover the affected contract.

### V. Docs And Reusable Patterns Stay In Sync
Changes to plugin purpose, manifest capabilities, worker or UI contracts, or
release and setup workflow must update `README.md` and `SPEC.md` in the same
change. Reusable Paperclip plugin patterns discovered here should also be
reflected in the appropriate shared skills when they materially generalize.

## Delivery Constraints

- The repository is a single Paperclip plugin package rooted at the repo root.
- Source-of-truth implementation files are `src/manifest.ts`, `src/worker.ts`,
  `src/ui/index.tsx`, and `tests/plugin.spec.ts`.
- `dist/` is build output only and must not be edited by hand.
- Hosted worker logic should keep transport details behind helpers so provider
  integrations can evolve without reshaping the Paperclip UI contract.

## Workflow And Quality Gates

- New work should be captured through Spec Kit artifacts in `specs/` when it
  introduces meaningful product or architecture changes.
- Feature specs should describe user-facing behavior, not implementation-only
  tasks.
- Implementation plans should reference the actual repository layout and note
  required verification scope.
- Code review and self-checks must confirm manifest consistency, worker/UI
  contract alignment, and backward compatibility for persisted plugin data.

## Governance

This constitution overrides ad hoc local preferences when they conflict.
Specs, plans, and implementation changes must be checked against these
principles. Amendments require updating this file, documenting the reason, and
aligning any affected README, SPEC, or workflow artifacts in the same change.

**Version**: 1.0.0 | **Ratified**: 2026-04-21 | **Last Amended**: 2026-04-21
