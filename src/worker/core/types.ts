import type { ProviderType } from '../../providers/shared/config.ts';

export interface LinkIdentityMetadata {
  upstreamProviderType?: ProviderType;
  upstreamProviderScope?: string;
  upstreamIdentityKey?: string;
}

export interface UpstreamIssueIdentityInput {
  providerType: ProviderType | string | undefined;
  jiraProjectKey: string;
  jiraIssueId: string;
  jiraIssueKey: string;
}

export interface LinkIdentityRecord extends LinkIdentityMetadata {
  jiraProjectKey: string;
  jiraIssueId: string;
  jiraIssueKey: string;
}
