import { ConnectivityManager } from '../infrastructure/connectivity/ConnectivityManager';
import type { ConnectivityCallback } from '../infrastructure/connectivity/ConnectivityListener';

/**
 * Network connectivity for app code (imperative). In components, prefer the
 * `useConnectivity` hook; use this facade for non-component logic. No `.getInstance()`.
 *
 * ```ts
 * if (connectivity.isConnected) await sync();
 * const unsubscribe = connectivity.subscribe((state) => log(state.isConnected));
 * // later: unsubscribe();
 * ```
 */
export const connectivity = {
  /** Current connectivity (best-effort; reflects the latest known state). */
  get isConnected(): boolean {
    return ConnectivityManager.getInstance().isConnected;
  },
  /** Subscribe to connectivity changes; returns an unsubscribe function. */
  subscribe: (callback: ConnectivityCallback): (() => void) => {
    const manager = ConnectivityManager.getInstance();
    manager.addListener(callback);
    return () => manager.removeListener(callback);
  },
} as const;
