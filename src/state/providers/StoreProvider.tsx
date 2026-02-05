import React, { useContext, useRef } from 'react';
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
  const storeRef = useRef(store);

  return <context.Provider value={storeRef.current}>{children}</context.Provider>;
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
