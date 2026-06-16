import { StorageManager } from '../infrastructure/storage/StorageManager';

/** Opaque persisted React Query cache snapshot (matches query-persist-client-core). */
export interface PersistedClient {
  [key: string]: unknown;
}

/**
 * Structural match of `@tanstack/query-persist-client-core`'s `Persister`, so
 * this works with `persistQueryClient(...)` without importing that package.
 */
export interface QueryPersister {
  persistClient(client: PersistedClient): Promise<void> | void;
  restoreClient(): Promise<PersistedClient | undefined>;
  removeClient(): Promise<void> | void;
}

/**
 * A React Query persister backed by OptiCore's local storage (its auto-resolved
 * AsyncStorage adapter) — persist/restore the query cache across app restarts
 * through the same storage layer the rest of OptiCore uses.
 *
 * @example
 * ```typescript
 * import { persistQueryClient } from '@tanstack/react-query-persist-client';
 * persistQueryClient({ queryClient, persister: createQueryPersister() });
 * ```
 */
export function createQueryPersister(key = 'opticore-react-query-cache'): QueryPersister {
  // Look up `local` per call so it always reflects the adapter configured by
  // OptiCoreProvider (no stale capture if a store is created before mount).
  return {
    persistClient: (client) => StorageManager.getInstance().local.set(key, client),
    restoreClient: async () =>
      (await StorageManager.getInstance().local.get<PersistedClient>(key)) ?? undefined,
    removeClient: () => StorageManager.getInstance().local.remove(key),
  };
}
