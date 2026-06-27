import type { StoreApi } from 'zustand';
import { StateObserver } from '../state/StateObserver';
import type { StateCallback, SubscribeOptions } from '../state/types/ObserverTypes';

/**
 * Cross-store state observation for app code (imperative). Subscribe to changes on
 * any Zustand store created with OptiCore, from outside React. No `.getInstance()`.
 *
 * ```ts
 * const unsubscribe = stateObserver.subscribe(myStore, (state) => logger.debug(state));
 * // later: unsubscribe();
 * ```
 */
export const stateObserver = {
  /** Subscribe to a store's changes; returns an unsubscribe function. */
  subscribe: <T>(
    store: StoreApi<T>,
    callback: StateCallback<T>,
    options?: SubscribeOptions<T>
  ): (() => void) => StateObserver.getInstance().subscribe(store, callback, options),
  /** Remove all subscriptions (e.g. between tests or on teardown). */
  cleanup: (): void => StateObserver.getInstance().cleanup(),
} as const;
