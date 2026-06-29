/* eslint-disable @typescript-eslint/no-explicit-any --
   Zustand's middleware mutator tuples (persist/devtools) don't compose cleanly with a
   plain `StateCreator<T>` provided by the caller. We cast at the middleware boundary
   only; the public surface stays fully typed via the generic `T`. Same approach as
   BaseStore.ts. */
import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createPersistStorage } from './persistStorage';

/**
 * Configuration for {@link createClientStore}.
 */
export interface ClientStoreConfig<T> {
  /** Unique name — used for devtools and (when persisting) the storage key. */
  name: string;

  /**
   * Persist state through OptiCore's storage layer (see {@link createPersistStorage}).
   * @default false
   */
  persist?: boolean;

  /**
   * Select which slice of state to persist. Only meaningful when `persist` is true.
   * Use it to exclude action functions / transient fields so writes stay small.
   *
   * @example
   * ```typescript
   * partialize: (state) => ({ items: state.items })
   * ```
   */
  partialize?: (state: T) => Partial<T>;

  /**
   * Enable redux-devtools integration.
   * @default __DEV__
   */
  devtools?: boolean;
}

/**
 * Creates a **client-only** zustand store and returns it as a ready-to-use React hook.
 *
 * Unlike {@link createBaseStore} (which returns a `zustand/vanilla` store that needs a
 * `StoreProvider` + `useStore` binding), this returns a `UseBoundStore` you can call
 * directly in components (`useStore()`, `useStore((s) => s.x)`) and imperatively
 * (`useStore.getState()`). Persistence — when enabled — routes through the same OptiCore
 * storage layer the rest of the library uses, so consumers never hand-wire
 * `zustand` + `persist` + `createPersistStorage()` for simple local state.
 *
 * Use this for UI/client state (bookmarks, preferences, filters). For CRUD-over-API
 * resources use {@link createCrudStore}; for DI-scoped vanilla stores use
 * {@link createBaseStore}.
 *
 * @example
 * ```typescript
 * interface SavedState {
 *   items: Article[];
 *   toggle: (a: Article) => void;
 * }
 *
 * export const useSavedStore = createClientStore<SavedState>(
 *   { name: 'saved-articles', persist: true, partialize: (s) => ({ items: s.items }) },
 *   (set, get) => ({
 *     items: [],
 *     toggle: (a) =>
 *       set((state) => ({
 *         items: state.items.some((x) => x.url === a.url)
 *           ? state.items.filter((x) => x.url !== a.url)
 *           : [a, ...state.items],
 *       })),
 *   }),
 * );
 * ```
 */
export function createClientStore<T extends object>(
  config: ClientStoreConfig<T>,
  initializer: StateCreator<T, [], []>
): UseBoundStore<StoreApi<T>> {
  // Default devtools OFF when the environment is indeterminate. `NODE_ENV !== 'production'`
  // would leak devtools whenever NODE_ENV is unset, so check __DEV__ first.
  const enabledDevtools =
    config.devtools ??
    (typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development');

  const devtoolsOptions = { name: config.name, enabled: enabledDevtools };

  if (config.persist) {
    const persisted = persist(initializer as any, {
      name: config.name,
      storage: createPersistStorage<T>(),
      // zustand types `partialize` as returning the full shape, but at runtime it
      // shallow-merges the returned slice over live state, so a Partial is safe.
      ...(config.partialize ? { partialize: config.partialize as (state: T) => T } : {}),
    });
    return create<T>()(devtools(persisted as any, devtoolsOptions));
  }

  return create<T>()(devtools(initializer as any, devtoolsOptions));
}
