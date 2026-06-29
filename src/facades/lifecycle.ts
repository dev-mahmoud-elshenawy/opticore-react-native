import { LifecycleManager } from '../infrastructure/lifecycle/LifecycleManager';

/**
 * App foreground/background lifecycle for app code (imperative). In components,
 * prefer the `useLifecycle` / `useAppState` hooks; use this facade for non-component
 * logic (e.g. flush a queue when the app backgrounds). No `.getInstance()`.
 *
 * ```ts
 * const unsubscribe = lifecycle.subscribe((state) => {
 *   if (state === 'active') logger.info('foregrounded');
 *   else offline.sync();
 * });
 * ```
 */
export const lifecycle = {
  /**
   * Subscribe to app state changes; `cb` is called with `'active'` on foreground
   * and `'inactive'` on background/inactive. Returns an unsubscribe function.
   */
  subscribe: (cb: (state: 'active' | 'inactive') => void): (() => void) =>
    LifecycleManager.getInstance().addObserver(
      () => cb('active'),
      () => cb('inactive')
    ),
} as const;
