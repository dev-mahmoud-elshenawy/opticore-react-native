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
 * export const useSavedStore = create<SavedState>()(
 *   persist((set, get) => ({ ... }), {
 *     name: 'saved-articles',
 *     storage: createPersistStorage<SavedState>(),
 *   }),
 * );
 * ```
 */
export function createPersistStorage<S>(): PersistStorage<S> {
  const local = StorageManager.getInstance().local;
  return {
    getItem: (name) => local.get<StorageValue<S>>(name),
    setItem: (name, value) => local.set(name, value),
    removeItem: (name) => local.remove(name),
  };
}
