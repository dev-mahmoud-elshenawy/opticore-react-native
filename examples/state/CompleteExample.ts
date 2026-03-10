/* eslint-disable no-console, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars -- Example file for demonstration */
/**
 * Complete Example of State Management Core
 * Demonstrates: AsyncState, BaseStore, StateObserver, StoreFactory
 */

import {
  AsyncState,
  toLoading,
  toSuccess,
  toError,
  isIdle,
  isSuccess,
} from '../../src/state/AsyncState';
import { createBaseStore } from '../../src/state/BaseStore';
import { StateObserver } from '../../src/state/StateObserver';
import { createCrudStore } from '../../src/state/StoreFactory';

// --- 1. AsyncState Usage ---

interface User {
  id: string;
  name: string;
}

// --- 2. BaseStore Usage (Auth Store) ---

interface AuthState {
  user: User | null;
  status: AsyncState<User>;
  login: (name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = createBaseStore<AuthState>(
  {
    name: 'auth-store',
    initialState: {
      user: null,
      status: { type: 'idle' },
      login: async () => {}, // placeholder
      logout: () => {},
    },
    devtools: true,
  },
  (set) =>
    ({
      login: async (name: string) => {
        set((state: any) => {
          state.status = toLoading(state.status);
        });
        try {
          // Simulate API
          await new Promise((r) => setTimeout(r, 500));
          const user = { id: '1', name };
          set((state: any) => {
            state.user = user;
            state.status = toSuccess(user);
          });
        } catch (e) {
          set((state: any) => {
            state.status = toError(
              e instanceof Error ? e : new Error('Login failed'),
              state.status
            );
          });
        }
      },
      logout: () =>
        set((state: any) => {
          state.user = null;
          state.status = { type: 'idle' };
        }),
    }) as any
);

// --- 3. StoreFactory Usage (Products CRUD) ---

interface Product {
  id: string;
  name: string;
  price: number;
}

const productApi = {
  fetchAll: async () => [{ id: 'p1', name: 'Laptop', price: 999 }],
  create: async (data: Partial<Product>) =>
    ({ id: 'p2', name: 'Phone', price: 500, ...data }) as Product,
};

export const useProductStore = createCrudStore<Product>({
  name: 'product-store',
  api: productApi,
  devtools: true,
});

// --- 4. StateObserver Usage (Global Logger) ---

export function setupGlobalObserver() {
  const observer = StateObserver.getInstance();

  // Log all auth changes
  observer.subscribe(useAuthStore, (newState, oldState) => {
    console.log('Auth changed:', newState.status.type);
  });

  // Log errors only
  observer.subscribe(
    useProductStore,
    (newState) => {
      console.log('Product error:', (newState.status as any).error);
    },
    {
      filter: (newState) => (newState.status as any).type === 'error',
    }
  );
}
