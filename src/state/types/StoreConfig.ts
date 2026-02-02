import { StateCreator } from 'zustand';

/**
 * Configuration for creating a BaseStore
 */
export interface StoreConfig<T> {
    /** Unique name for the store (used for devtools) */
    name: string;

    /** Initial state of the store */
    initialState: T;

    /** 
     * Whether to persist the store state
     * @default false
     */
    persist?: boolean;

    /**
     * Whether to enable devtools
     * @default __DEV__
     */
    devtools?: boolean;

    /**
     * Whether to enable immer middleware for mutable updates
     * @default true
     */
    immer?: boolean;
}

/**
 * Base store actions that all stores have
 */
export interface BaseActions {
    /** Reset the store to its initial state */
    reset: () => void;

    /** Hydrate the store with new state */
    hydrate: (state: unknown) => void;
}

/**
 * Type definition for a store creator with our custom middleware stack
 */
export type AppStoreCreator<T> = StateCreator<
    T & BaseActions,
    [['zustand/devtools', never], ['zustand/immer', never]],
    []
>;
