import React, { useContext } from 'react';
import { StoreApi } from 'zustand';

/**
 * Interface for the provider props
 */
interface StoreProviderProps<T> {
  children: React.ReactNode;
  store: StoreApi<T>;
  context: React.Context<StoreApi<T> | null>;
}

/**
 * Generic StoreProvider to provide a Zustand store via Context.
 * Useful for dependency injection or scoping stores to a component tree.
 *
 * @example
 * ```tsx
 * const AuthContext = createContext<StoreApi<AuthStore> | null>(null);
 *
 * <StoreProvider store={authStore} context={AuthContext}>
 *   <App />
 * </StoreProvider>
 * ```
 */
export const StoreProvider = <T,>({ children, store, context }: StoreProviderProps<T>) => {
  // Pass `store` through directly. A `useRef(store)` snapshot would ignore a
  // changed `store` prop (e.g. on hot reload or intentional store rotation),
  // leaving consumers bound to the stale store.
  return <context.Provider value={store}>{children}</context.Provider>;
};

/**
 * Helper to create a custom hook for consuming the store from context
 */
export function createStoreHook<T>(context: React.Context<StoreApi<T> | null>) {
  return () => {
    const store = useContext(context);
    if (!store) {
      throw new Error('Missing StoreProvider in tree');
    }
    return store;
  };
}
