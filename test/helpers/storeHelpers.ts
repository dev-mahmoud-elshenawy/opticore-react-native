import { create, StoreApi, UseBoundStore } from 'zustand';

/**
 * Create a mock Zustand store with initial state
 */
export function createMockStore<T extends object>(initialState: T): UseBoundStore<StoreApi<T>> {
  return create<T>(() => initialState);
}

/**
 * Create a store snapshot for assertions
 */
export function getStoreSnapshot<T>(store: UseBoundStore<StoreApi<T>>): T {
  return store.getState();
}

/**
 * Wait for store state to match condition
 */
export async function waitForStoreUpdate<T>(
  store: UseBoundStore<StoreApi<T>>,
  condition: (state: T) => boolean,
  timeout = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Store update timeout after ${timeout}ms`));
    }, timeout);

    const unsubscribe = store.subscribe((state) => {
      if (condition(state)) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(state);
      }
    });

    // Check initial state
    const currentState = store.getState();
    if (condition(currentState)) {
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(currentState);
    }
  });
}

/**
 * Reset store to initial state (for cleanup)
 */
export function resetStore<T>(store: UseBoundStore<StoreApi<T>>, initialState: T): void {
  store.setState(initialState as any, true);
}
