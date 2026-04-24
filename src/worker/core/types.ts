export interface LinkIdentityMetadata {
  uniqueUpstreamId: string;
}

export interface UpstreamIssueIdentityInput {
  uniqueUpstreamId: string;
}

export interface LinkIdentityRecord extends LinkIdentityMetadata {
  issueId?: string;
}
