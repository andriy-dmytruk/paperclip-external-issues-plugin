# Paperclip-native issue sync proposal

The Jira plugin can already show synced-vs-local state in the issue detail page and under each comment, but the user experience becomes much better if Paperclip owns a small amount of sync-aware presentation.

## Recommended host additions

1. Add an issue-row metadata slot or a host-owned `issueSyncState` model.
2. Render a provider badge in lists and board cards.
3. Render the upstream key directly in the issue row for synced items.
4. Support row-level quick actions for pull and push.
5. Expose freshness as a host pill, for example `Synced 3m ago` or `Needs push`.

## Why this belongs in Paperclip core

- The current plugin system can mount detail tabs, inline task detail panels, toolbar buttons, and per-comment annotations.
- The current issue list row is not plugin-extensible, so different colors and upstream badges in the main list cannot be done cleanly from a plugin alone.
- A host-owned sync model would let Jira, GitHub, Linear, and future providers reuse the same visual language instead of each plugin inventing its own row treatment.

## Proposed visual model

- `Pure Paperclip`: warm neutral badge, no upstream key, CTA to create upstream issue.
- `Synced`: provider-tinted badge, upstream key, last-sync freshness.
- `Needs pull`: info badge when upstream changed after the last pull.
- `Needs push`: warning badge when Paperclip changed after the last push.

## Minimal API shape

The host could expose one optional object per issue row:

```ts
type IssueSyncPresentation = {
  provenance: 'local' | 'external';
  provider: 'jira' | 'github' | 'linear' | string;
  upstreamKey?: string;
  upstreamUrl?: string;
  freshnessLabel?: string;
  stateTone?: 'neutral' | 'info' | 'success' | 'warning';
  quickActions?: Array<{
    id: string;
    label: string;
  }>;
};
```

The plugin would provide the data, while Paperclip would own the consistent row rendering.
