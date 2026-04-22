import type { ProviderConfig } from './config.ts';
import type {
  CanonicalUpstreamComment,
  CanonicalUpstreamIssue,
  CanonicalUpstreamProject,
  CanonicalUpstreamStatus,
  CanonicalUpstreamUser,
  ProviderCapabilities,
  ProviderConnectionResult,
  ProviderErrorShape,
  ProviderType
} from './types.ts';

export interface SyncProviderAdapter<TConfig extends ProviderConfig = ProviderConfig> {
  readonly type: ProviderType;
  readonly label: string;
  readonly capabilities: ProviderCapabilities;
  validateConfig(config: TConfig): ProviderErrorShape | null;
  testConnection?(context: unknown, config: TConfig): Promise<ProviderConnectionResult>;
  listUpstreamProjects?(context: unknown, config: TConfig, query?: string): Promise<CanonicalUpstreamProject[]>;
  searchUsers?(context: unknown, config: TConfig, query: string): Promise<CanonicalUpstreamUser[]>;
  listAssignableUsers?(context: unknown, config: TConfig, issueOrProjectKey?: string): Promise<CanonicalUpstreamUser[]>;
  listStatuses?(context: unknown, config: TConfig, issueKey?: string): Promise<CanonicalUpstreamStatus[]>;
  getIssue?(context: unknown, config: TConfig, issueKey: string): Promise<CanonicalUpstreamIssue | null>;
  listComments?(context: unknown, config: TConfig, issueKey: string): Promise<CanonicalUpstreamComment[]>;
  runProjectSync?(context: unknown, config: TConfig, mapping: unknown, options?: Record<string, unknown>): Promise<unknown>;
  createUpstreamIssue?(context: unknown, config: TConfig, mapping: unknown, localIssue: unknown): Promise<CanonicalUpstreamIssue>;
  updateUpstreamIssue?(context: unknown, config: TConfig, issueKey: string, localIssue: unknown): Promise<void>;
  updateUpstreamStatus?(context: unknown, config: TConfig, issueKey: string, statusIdOrName: string): Promise<void>;
  updateUpstreamAssignee?(context: unknown, config: TConfig, issueKey: string, assignee: CanonicalUpstreamUser): Promise<void>;
  postComment?(context: unknown, config: TConfig, issueKey: string, body: string): Promise<{ id: string }>;
  toCanonicalIssue?(value: unknown, config: TConfig): CanonicalUpstreamIssue | null;
  toCanonicalComment?(value: unknown): CanonicalUpstreamComment | null;
}

export class ProviderRegistry {
  private readonly adapters = new Map<ProviderType, SyncProviderAdapter>();

  register(adapter: SyncProviderAdapter): void {
    this.adapters.set(adapter.type, adapter);
  }

  get(type: ProviderType): SyncProviderAdapter {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`No provider adapter registered for ${type}.`);
    }
    return adapter;
  }

  list(): SyncProviderAdapter[] {
    return [...this.adapters.values()];
  }
}
