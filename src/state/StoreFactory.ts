/* eslint-disable @typescript-eslint/no-explicit-any --
   Zustand + Immer's set() callback requires `any` for draft state mutations.
   The generic middleware chain types are incompatible with strict inference here.
   This is a known Zustand limitation; all state is still typed externally via CrudStore<T>. */
import { StateCreator } from 'zustand/vanilla';
import { createBaseStore } from './BaseStore';
import { AsyncState, toLoading, toSuccess, toError, toIdle } from './AsyncState';
import { StoreConfig } from './types/StoreConfig';

/**
 * Standard CRUD API definition
 */
export interface CrudApi<T> {
  fetchAll?: () => Promise<T[]>;
  fetchById?: (id: string) => Promise<T>;
  create?: (data: Partial<T>) => Promise<T>;
  update?: (id: string, data: Partial<T>) => Promise<T>;
  delete?: (id: string) => Promise<void>;
}

/**
 * Helper interface for items with ID
 */
interface Identifiable {
  id: string | number;
}

/**
 * Generated store API for CRUD operations
 */
export interface CrudStore<T> {
  items: T[];
  selectedItem?: T;
  status: AsyncState<T[] | T>;

  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create: (data: Partial<T>) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

/**
 * Configuration for creating a CRUD store
 */
export interface CrudStoreConfig<T> extends StoreConfig<CrudStore<T>> {
  api: CrudApi<T>;
}

/**
 * Factory to create a CRUD store with standard methods and AsyncState handling
 */
export function createCrudStore<T extends Identifiable, CustomActions extends object = {}>(
  config: Omit<StoreConfig<CrudStore<T> & CustomActions>, 'initialState'> & {
    api: CrudApi<T>;
    initialState?: Partial<CrudStore<T> & CustomActions>;
  },
  customActionsCreator?: StateCreator<
    CrudStore<T> & CustomActions,
    [['zustand/immer', never]],
    [],
    CustomActions
  >
) {
  // Define the state creator
  const stateCreator: StateCreator<CrudStore<T> & CustomActions, [['zustand/immer', never]], []> = (
    set,
    get,
    api
  ) => {
    // Create base CRUD actions using the provided API
    const crudActions = {
      items: [],
      status: toIdle<T[]>(),

      fetchAll: async () => {
        if (!config.api.fetchAll) {
          if (__DEV__) console.warn(`[CrudStore:${config.name}] fetchAll called but api.fetchAll is not defined`);
          return;
        }

        set((state: any) => {
          state.status = toLoading(state.status);
        });

        try {
          const data = await config.api.fetchAll();
          set((state: any) => {
            state.status = toSuccess(data);
            state.items = data;
          });
        } catch (error) {
          set((state: any) => {
            state.status = toError(
              error instanceof Error ? error : new Error(String(error)),
              state.status
            );
          });
        }
      },

      fetchById: async (id: string) => {
        if (!config.api.fetchById) {
          if (__DEV__) console.warn(`[CrudStore:${config.name}] fetchById called but api.fetchById is not defined`);
          return;
        }

        set((state: any) => {
          state.status = toLoading(state.status);
        });

        try {
          const data = await config.api.fetchById(id);
          set((state: any) => {
            state.selectedItem = data;
            state.status = toSuccess(data);
          });
        } catch (error) {
          set((state: any) => {
            state.status = toError(
              error instanceof Error ? error : new Error(String(error)),
              state.status
            );
          });
        }
      },

      create: async (data: Partial<T>) => {
        if (!config.api.create) {
          if (__DEV__) console.warn(`[CrudStore:${config.name}] create called but api.create is not defined`);
          return;
        }

        set((state: any) => {
          state.status = toLoading(state.status);
        });

        try {
          const newItem = await config.api.create(data);
          set((state: any) => {
            state.items.push(newItem);
            state.status = toSuccess(state.items);
          });
        } catch (error) {
          set((state: any) => {
            state.status = toError(
              error instanceof Error ? error : new Error(String(error)),
              state.status
            );
          });
        }
      },

      update: async (id: string, data: Partial<T>) => {
        if (!config.api.update) {
          if (__DEV__) console.warn(`[CrudStore:${config.name}] update called but api.update is not defined`);
          return;
        }

        set((state: any) => {
          state.status = toLoading(state.status);
        });

        try {
          const updatedItem = await config.api.update(id, data);
          set((state: any) => {
            const index = state.items.findIndex((item: any) => item.id == id);
            if (index !== -1) {
              state.items[index] = updatedItem;
            }
            if (state.selectedItem && state.selectedItem.id == id) {
              state.selectedItem = updatedItem;
            }
            state.status = toSuccess(state.items);
          });
        } catch (error) {
          set((state: any) => {
            state.status = toError(
              error instanceof Error ? error : new Error(String(error)),
              state.status
            );
          });
        }
      },

      delete: async (id: string) => {
        if (!config.api.delete) {
          if (__DEV__) console.warn(`[CrudStore:${config.name}] delete called but api.delete is not defined`);
          return;
        }

        set((state: any) => {
          state.status = toLoading(state.status);
        });

        try {
          await config.api.delete(id);
          set((state: any) => {
            state.items = state.items.filter((item: any) => item.id != id);
            if (state.selectedItem && state.selectedItem.id == id) {
              state.selectedItem = undefined;
            }
            state.status = toSuccess(state.items);
          });
        } catch (error) {
          set((state: any) => {
            state.status = toError(
              error instanceof Error ? error : new Error(String(error)),
              state.status
            );
          });
        }
      },
    };

    // Mix in custom actions if provided
    const userActions = customActionsCreator ? customActionsCreator(set, get, api as any) : {};

    return {
      ...crudActions,
      ...userActions,
      ...config.initialState,
    } as CrudStore<T> & CustomActions;
  };

  return createBaseStore<CrudStore<T> & CustomActions>(
    {
      name: config.name,
      initialState: {
        items: [],
        status: toIdle(),
        ...config.initialState,
      } as any, // Cast because methods are added by stateCreator
      persist: config.persist,
      devtools: config.devtools,
    },
    stateCreator as any // Casting due to complex middleware types mismatch in helper
  );
}
