import type { ProviderConfig } from './config.ts';
import type {
  ProviderConnectionResult,
  ProviderCapabilities,
  ProviderErrorShape,
  ProviderType
} from './types.ts';
import type { ProjectSyncMapping, StatusMappingRule } from '../../worker/core/models.ts';

export interface DefaultProjectMappingsInput {
  companyId: string;
  projectId?: string;
  projectName: string;
}

export interface BoundSyncProvider {
  readonly capabilities: ProviderCapabilities;
  readonly label: string;
  testConnection?(): Promise<ProviderConnectionResult>;
  getDefaultProjectMappings?(input: DefaultProjectMappingsInput): Promise<ProjectSyncMapping[]>;
  searchUsers?(query: string): Promise<unknown[]>;
  listUpstreamProjects?(query?: string): Promise<unknown[]>;
  resolveCurrentUser?(): Promise<unknown | undefined>;
  searchIssues?(
    mapping: unknown,
    options?: { issueKey?: string; filters?: unknown }
  ): Promise<unknown[]>;
  createIssue?(mapping: unknown, issue: unknown): Promise<unknown>;
  updateIssue?(issueKey: string, issue: unknown): Promise<void>;
  syncStatusFromPaperclip?(issueKey: string, status: string): Promise<boolean>;
  listTransitions?(issueKey: string): Promise<Array<{ id: string; name: string }>>;
  transitionIssue?(issueKey: string, transitionId: string): Promise<void>;
  setAssignee?(issueKey: string, assignee: unknown): Promise<void>;
  addComment?(issueKey: string, body: string): Promise<{ id: string }>;
}

export interface SyncProviderAdapter<
  TStoredConfig extends ProviderConfig = ProviderConfig,
  TRuntimeConfig = unknown,
  TContext = unknown
> {
  readonly type: ProviderType;
  readonly label: string;
  readonly capabilities: ProviderCapabilities;
  validateConfig(config: TStoredConfig): ProviderErrorShape | null;
  getDefaultStatusMappings?(): StatusMappingRule[];
  createProvider(context: TContext, config: TRuntimeConfig): BoundSyncProvider;
}

export class ProviderRegistry<TContext = unknown> {
  private readonly adapters = new Map<ProviderType, SyncProviderAdapter<any, any, TContext>>();

  register(adapter: SyncProviderAdapter<any, any, TContext>): void {
    this.adapters.set(adapter.type, adapter);
  }

  get(type: ProviderType): SyncProviderAdapter<any, any, TContext> {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`No provider adapter registered for ${type}.`);
    }
    return adapter;
  }

  list(): Array<SyncProviderAdapter<any, any, TContext>> {
    return [...this.adapters.values()];
  }
}
