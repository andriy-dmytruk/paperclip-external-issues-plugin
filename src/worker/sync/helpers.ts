import { createHash } from 'node:crypto';
import type { Issue } from '@paperclipai/plugin-sdk';
import { isGitHubProviderType } from '../../providers/shared/config.ts';
import type { ProviderType } from '../../providers/shared/types.ts';
import type { UpstreamIssueRecord } from '../core/models.ts';
import {
  HIDDEN_ISSUE_MARKER_PREFIX,
  HIDDEN_ISSUE_MARKER_SUFFIX
} from '../core/defaults.ts';

export interface IssueLinkSnapshot {
  jiraIssueKey: string;
  importedTitleHash?: string;
  importedDescriptionHash?: string;
}

export function stripIssueTitlePrefix(title: string): string {
  let next = title.trim();
  const jiraPrefixPattern = /^\[[A-Z][A-Z0-9]+-\d+\]\s*/i;
  const githubPrefixPattern = /^\[[a-z0-9_.-]+\/[a-z0-9_.-]+#\d+\]\s*/i;
  while (jiraPrefixPattern.test(next) || githubPrefixPattern.test(next)) {
    next = next
      .replace(jiraPrefixPattern, '')
      .replace(githubPrefixPattern, '')
      .trim();
  }
  return next;
}

export function ensureIssueTitlePrefix(title: string, jiraIssueKey: string): string {
  const cleanTitle = stripIssueTitlePrefix(title);
  return `[${jiraIssueKey}] ${cleanTitle || jiraIssueKey}`;
}

export function getProviderPlatformName(providerType: ProviderType): string {
  return isGitHubProviderType(providerType) ? 'GitHub' : 'Jira';
}

export function buildIssueMarker(jiraIssueKey: string): string {
  return `${HIDDEN_ISSUE_MARKER_PREFIX}${jiraIssueKey}${HIDDEN_ISSUE_MARKER_SUFFIX}`;
}

export function stripIssueMarker(description: string): string {
  return description.replace(/<!-- paperclip-external-issues-plugin-upstream: [^>]+ -->/g, '').trim();
}

export function ensureIssueMarker(description: string, jiraIssueKey: string): string {
  const cleanDescription = stripIssueMarker(description).trim();
  const marker = buildIssueMarker(jiraIssueKey);
  return cleanDescription ? `${cleanDescription}\n\n${marker}` : marker;
}

export function hasIssueMarker(description: string | null | undefined, jiraIssueKey?: string): boolean {
  if (!description) {
    return false;
  }

  return jiraIssueKey
    ? description.includes(buildIssueMarker(jiraIssueKey))
    : /<!-- paperclip-external-issues-plugin-upstream: [^>]+ -->/.test(description);
}

export function hashCommentBody(body: string): string {
  return createHash('sha1').update(body).digest('hex');
}

export function buildImportedIssueDescription(upstreamIssue: UpstreamIssueRecord): string {
  const body = upstreamIssue.description.trim();
  return ensureIssueMarker(body || `_Imported from Jira ${upstreamIssue.key}._`, upstreamIssue.key);
}

export function matchesImportedIssueSnapshot(issue: Issue, link: IssueLinkSnapshot): boolean {
  if (link.importedTitleHash && link.importedDescriptionHash) {
    const currentTitleHash = hashCommentBody(issue.title);
    const currentDescriptionHash = hashCommentBody(issue.description ?? '');
    return currentTitleHash === link.importedTitleHash && currentDescriptionHash === link.importedDescriptionHash;
  }

  const prefixedTitle = issue.title.trim().startsWith(`[${link.jiraIssueKey}]`);
  const descriptionHasMarker = hasIssueMarker(issue.description ?? '', link.jiraIssueKey);
  return prefixedTitle && descriptionHasMarker;
}

export function shouldPresentIssueLink(issue: Issue, link: { jiraIssueKey: string } | null): link is { jiraIssueKey: string } {
  if (!link) {
    return false;
  }

  const hasTitlePrefix = issue.title.trim().startsWith(`[${link.jiraIssueKey}]`);
  const descriptionHasMarker = hasIssueMarker(issue.description ?? '', link.jiraIssueKey);
  return hasTitlePrefix || descriptionHasMarker;
}
