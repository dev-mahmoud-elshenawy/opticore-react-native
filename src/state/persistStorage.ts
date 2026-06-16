import type { PersistStorage, StorageValue } from 'zustand/middleware';
import { StorageManager } from '../infrastructure/storage/StorageManager';

/**
 * A zustand `persist` storage backed by OptiCore's local storage (its
 * auto-resolved AsyncStorage adapter). Lets any consumer persist a zustand
 * store through the same storage layer the rest of OptiCore uses — no custom
 * adapter required.
 *
 * @example
 * ```typescript
 * export const useStore = create<State>()(
 *   persist((set, get) => ({ ... }), {
 *     name: 'my-store',
 *     storage: createPersistStorage<State>(),
 *   }),
 * );
 * ```
 */
export function createPersistStorage<S>(): PersistStorage<S> {
  // Resolve `local` per call so it always reflects the adapter configured by
  // OptiCoreProvider (no stale capture if the store is created before mount).
  return {
    getItem: (name) => StorageManager.getInstance().local.get<StorageValue<S>>(name),
    setItem: (name, value) => StorageManager.getInstance().local.set(name, value),
    removeItem: (name) => StorageManager.getInstance().local.remove(name),
  };
}
