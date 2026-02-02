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
        api: CrudApi<T>,
        initialState?: Partial<CrudStore<T> & CustomActions>
    },
    customActionsCreator?: StateCreator<CrudStore<T> & CustomActions, [['zustand/immer', never]], [], CustomActions>
) {
    // Define the state creator
    const stateCreator: StateCreator<CrudStore<T> & CustomActions, [['zustand/immer', never]], []> = (set, get, api) => {

        // Create base CRUD actions using the provided API
        const crudActions = {
            items: [],
            status: toIdle<T[]>(),

            fetchAll: async () => {
                if (!config.api.fetchAll) return;

                set((state: any) => { state.status = toLoading(state.status) });

                try {
                    const data = await config.api.fetchAll();
                    set((state: any) => {
                        state.status = toSuccess(data);
                        state.items = data;
                    });
                } catch (error) {
                    set((state: any) => { state.status = toError(error instanceof Error ? error : new Error(String(error)), state.status) });
                }
            },

            fetchById: async (id: string) => {
                if (!config.api.fetchById) return;

                // We might want separate status for detailed view vs list view
                // For simplicity reusing global status or we could add 'selectedItemStatus'
                // Reuse global for MVP
                set((state: any) => { state.status = toLoading(state.status) });

                try {
                    const data = await config.api.fetchById(id);
                    set((state: any) => {
                        state.selectedItem = data;
                        state.status = toSuccess(data); // Note: type mismatch potential if T vs T[]
                        // But AsyncState is generics. Here it's AsyncState<T[] | T>
                    });
                } catch (error) {
                    set((state: any) => { state.status = toError(error instanceof Error ? error : new Error(String(error)), state.status) });
                }
            },

            create: async (data: Partial<T>) => {
                if (!config.api.create) return;

                set((state: any) => { state.status = toLoading(state.status) });

                try {
                    const newItem = await config.api.create(data);
                    set((state: any) => {
                        state.items.push(newItem);
                        state.status = toSuccess(state.items);
                    });
                } catch (error) {
                    set((state: any) => { state.status = toError(error instanceof Error ? error : new Error(String(error)), state.status) });
                }
            },

            update: async (id: string, data: Partial<T>) => {
                if (!config.api.update) return;

                set((state: any) => { state.status = toLoading(state.status) });

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
                    set((state: any) => { state.status = toError(error instanceof Error ? error : new Error(String(error)), state.status) });
                }
            },

            delete: async (id: string) => {
                if (!config.api.delete) return;

                set((state: any) => { state.status = toLoading(state.status) });

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
                    set((state: any) => { state.status = toError(error instanceof Error ? error : new Error(String(error)), state.status) });
                }
            },
        };

        // Mix in custom actions if provided
        const userActions = customActionsCreator ? customActionsCreator(set, get, api as any) : {};

        return {
            ...crudActions,
            ...userActions,
            ...config.initialState
        } as CrudStore<T> & CustomActions;
    };

    return createBaseStore<CrudStore<T> & CustomActions>(
        {
            name: config.name,
            initialState: {
                items: [],
                status: toIdle(),
                ...config.initialState
            } as any, // Cast because methods are added by stateCreator
            persist: config.persist,
            devtools: config.devtools
        },
        stateCreator as any // Casting due to complex middleware types mismatch in helper
    );
}
