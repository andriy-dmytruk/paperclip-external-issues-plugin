import { normalizeProviderType } from '../../providers/shared/config.ts';
import type { LinkIdentityMetadata, LinkIdentityRecord, UpstreamIssueIdentityInput } from '../core/types.ts';
import { buildUpstreamIdentityKey, getLegacyIdentityCandidates, normalizeUpstreamProviderScope } from './identity.ts';

export function buildLinkIdentityCandidates(link: LinkIdentityRecord): string[] {
  const explicitIdentity = link.upstreamIdentityKey?.trim().toLowerCase();
  if (explicitIdentity) {
    return [explicitIdentity];
  }

  const providerType = link.upstreamProviderType ?? 'jira_dc';
  return getLegacyIdentityCandidates({
    providerType,
    jiraProjectKey: link.jiraProjectKey,
    jiraIssueId: link.jiraIssueId,
    jiraIssueKey: link.jiraIssueKey
  });
}

export function getLinkIdentityMetadata(params: UpstreamIssueIdentityInput): LinkIdentityMetadata {
  const upstreamProviderScope = normalizeUpstreamProviderScope(
    params.providerType,
    params.jiraProjectKey,
    params.jiraIssueKey
  );
  return {
    upstreamProviderType: normalizeProviderType(params.providerType),
    upstreamProviderScope,
    upstreamIdentityKey: buildUpstreamIdentityKey({
      providerType: params.providerType,
      jiraProjectKey: params.jiraProjectKey,
      jiraIssueId: params.jiraIssueId,
      jiraIssueKey: params.jiraIssueKey
    })
  };
}
