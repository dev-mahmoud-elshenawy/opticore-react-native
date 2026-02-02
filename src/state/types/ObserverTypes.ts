import { StoreApi } from 'zustand';

/**
 * Callback function for state changes
 */
export type StateCallback<T = unknown> = (
    newState: T,
    oldState: T,
    storeName?: string
) => void;

/**
 * Filter function to conditionally trigger callbacks
 */
export type StateFilter<T = unknown> = (
    newState: T,
    oldState: T
) => boolean;

/**
 * Subscription options
 */
export interface SubscribeOptions<T = unknown> {
    /** Only trigger callback if this filter returns true */
    filter?: StateFilter<T>;

    /** Name of the store being observed (optional, for debugging) */
    storeName?: string;
}

/**
 * Represents a registered listener
 */
export interface Listener<T = unknown> {
    id: string;
    store: StoreApi<T>;
    callback: StateCallback<T>;
    filter?: StateFilter<T>;
    storeName?: string;
}
