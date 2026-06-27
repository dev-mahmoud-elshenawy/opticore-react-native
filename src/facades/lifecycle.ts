import { LifecycleManager } from '../infrastructure/lifecycle/LifecycleManager';
import type { LifecycleCallback } from '../infrastructure/lifecycle/LifecycleObserver';

/**
 * App foreground/background lifecycle for app code (imperative). In components,
 * prefer the `useLifecycle` / `useAppState` hooks; use this facade for non-component
 * logic (e.g. flush a queue when the app backgrounds). No `.getInstance()`.
 *
 * ```ts
 * const unsubscribe = lifecycle.onChange(
 *   () => logger.info('active'),
 *   () => offline.sync(),   // on background/inactive
 * );
 * ```
 */
export const lifecycle = {
  /** Run callbacks when the app becomes active/inactive; returns an unsubscribe function. */
  onChange: (onActive?: LifecycleCallback, onInactive?: LifecycleCallback): (() => void) =>
    LifecycleManager.getInstance().addObserver(onActive, onInactive),
} as const;
