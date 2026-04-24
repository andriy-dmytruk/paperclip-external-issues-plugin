import type { LinkIdentityMetadata, LinkIdentityRecord, UpstreamIssueIdentityInput } from '../core/types.ts';

export function buildLinkIdentityCandidates(link: LinkIdentityRecord): string[] {
  const uniqueUpstreamId = link.uniqueUpstreamId?.trim().toLowerCase();
  return uniqueUpstreamId ? [uniqueUpstreamId] : [];
}

export function getLinkIdentityMetadata(params: UpstreamIssueIdentityInput): LinkIdentityMetadata {
  return {
    uniqueUpstreamId: params.uniqueUpstreamId.trim().toLowerCase()
  };
}
