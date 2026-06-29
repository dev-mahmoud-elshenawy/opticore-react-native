import { storage } from '../facades/storage';

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
  return {
    persistClient: (client) => storage.local.set(key, client),
    restoreClient: async () => (await storage.local.get<PersistedClient>(key)) ?? undefined,
    removeClient: () => storage.local.remove(key),
  };
}
