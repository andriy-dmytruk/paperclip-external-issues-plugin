export interface WorkerStateScope {
  scopeKind: string;
  stateKey: string;
}

export interface WorkerStateReader {
  state: {
    get(scope: WorkerStateScope): Promise<unknown>;
  };
}

export interface WorkerStateWriter extends WorkerStateReader {
  state: {
    get(scope: WorkerStateScope): Promise<unknown>;
    set(scope: WorkerStateScope, value: unknown): Promise<void>;
  };
}

export async function loadNormalizedState<T>(
  ctx: WorkerStateReader,
  scope: WorkerStateScope,
  normalize: (value: unknown) => T
): Promise<T> {
  return normalize(await ctx.state.get(scope));
}

export async function saveStateWithUpdatedAt<TState extends object>(
  ctx: WorkerStateWriter,
  scope: WorkerStateScope,
  state: TState
): Promise<void> {
  await ctx.state.set(scope, {
    ...state,
    updatedAt: new Date().toISOString()
  });
}
