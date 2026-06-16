import { createStore } from 'zustand/vanilla';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { StoreConfig, BaseActions, AppStoreCreator } from './types/StoreConfig';
import { createPersistStorage } from './persistStorage';

/**
 * Creates a base store with immer and devtools middleware enabled by default.
 * When `config.persist` is true, state is persisted through OptiCore's storage
 * (see {@link createPersistStorage}) and rehydrated on startup.
 *
 * @param config Configuration for the store (name, initial state, persist)
 * @param stateCreator Zustand state creator function
 * @returns Zustand vanilla store
 */
export function createBaseStore<T extends object>(
  config: StoreConfig<T>,
  stateCreator: AppStoreCreator<T>
) {
  // We need to cast the middleware chain to match TypeScript's expected types for Zustand
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeCreator = (set: any, get: any, api: any) => {
    // Inject reset and hydrate actions
    const baseActions: BaseActions = {
      reset: () => set(config.initialState, false, 'reset'),
      hydrate: (newState: unknown) => set(newState, false, 'hydrate'),
    };

    // Initialize with provided state + base actions
    const initialState = {
      ...config.initialState,
      ...baseActions,
    };

    // Call the user's state creator with the enhanced set
    // We pass the base actions so they can be mixed in if needed,
    // although they are already in the initial state
    const userState = stateCreator(set, get, api);

    return {
      ...initialState,
      ...userState,
      ...baseActions, // Ensure base actions override if conflict (unlikely)
    };
  };

  // Configure middleware stack:
  // 1. Immer    — mutable-style state updates (innermost)
  // 2. Persist  — optional; persists via OptiCore storage
  // 3. DevTools — Redux devtools integration (outermost)

  const enabledDevtools =
    config.devtools ??
    (typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production');

  const devtoolsOptions = { name: config.name, enabled: enabledDevtools };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- middleware chain
  const base = immer(storeCreator) as any;

  const store = config.persist
    ? createStore<T & BaseActions>()(
        devtools(
          persist(base, {
            name: config.name,
            storage: createPersistStorage<T & BaseActions>(),
            ...(config.partialize
              ? {
                  // zustand types `partialize` as returning the full persisted shape,
                  // but at runtime it shallow-merges the returned slice over the live
                  // state — so returning a Partial is safe and base actions
                  // (reset/hydrate) survive. The cast bridges that type gap.
                  partialize: config.partialize as (
                    state: T & BaseActions,
                  ) => T & BaseActions,
                }
              : {}),
          }),
          devtoolsOptions
        )
      )
    : createStore<T & BaseActions>()(devtools(base, devtoolsOptions));

  return store;
}
