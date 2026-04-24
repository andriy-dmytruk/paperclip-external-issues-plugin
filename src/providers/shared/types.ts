export const PROVIDER_TYPE_OPTIONS = ['jira_dc', 'jira_cloud', 'github_issues'] as const;

export type ProviderType = (typeof PROVIDER_TYPE_OPTIONS)[number];
export type ProviderSelection = ProviderType | 'none';

export interface ProviderCapabilities {
  supportsProjectPicker: boolean;
  supportsUserSearch: boolean;
  supportsAssignableUsers: boolean;
  supportsIssueCreation: boolean;
  supportsIssueUpdate: boolean;
  supportsComments: boolean;
  supportsStatusUpdates: boolean;
  supportsBackgroundSync: boolean;
  supportsCreatorLookup: boolean;
}

export interface CanonicalUpstreamUser {
  id: string;
  displayName: string;
  emailAddress?: string;
  username?: string;
}

export interface CanonicalUpstreamComment {
  id: string;
  body: string;
  authorDisplayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalUpstreamStatus {
  id?: string;
  name: string;
  category?: string;
}

export interface CanonicalUpstreamIssue {
  id: string;
  key: string;
  uniqueUpstreamId: string;
  title: string;
  body: string;
  url: string;
  status: CanonicalUpstreamStatus;
  assigneeDisplayName?: string;
  creatorDisplayName?: string;
  createdAt: string;
  updatedAt: string;
  comments: CanonicalUpstreamComment[];
  metadata?: Record<string, unknown>;
}

export interface CanonicalUpstreamProject {
  id: string;
  key: string;
  displayName: string;
  url?: string;
}

export interface ProviderErrorShape {
  message: string;
  diagnostics?: Record<string, unknown>;
}

export interface ProviderConnectionResult {
  status: 'success' | 'error';
  message: string;
}
