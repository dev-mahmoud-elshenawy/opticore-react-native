import { ThemeManager } from '../theme/ThemeManager';
import type { Theme, ThemeMode, ThemeListener } from '../theme/types';

/**
 * Imperative theme control for app code. In components, prefer the `useTheme` hook
 * (reactive); use this facade for non-component logic (e.g. toggling mode from a
 * settings action, registering themes at startup). No `.getInstance()`.
 *
 * Exported as `themeControl` to avoid clashing with the `Theme` type / `useTheme` hook.
 *
 * ```ts
 * themeControl.setMode('dark');
 * themeControl.applyTheme('brand', brandTheme);   // register + activate in one call
 * const unsubscribe = themeControl.subscribe((t, mode) => logger.debug(mode));
 * ```
 */
export const themeControl = {
  get current(): Theme {
    return ThemeManager.getInstance().getTheme();
  },
  /** The raw mode setting: `'light'`, `'dark'`, or `'system'`. */
  get mode(): ThemeMode {
    return ThemeManager.getInstance().getMode();
  },
  /** The resolved mode actually in use: always `'light'` or `'dark'` (never `'system'`). */
  get resolvedMode(): 'light' | 'dark' {
    return ThemeManager.getInstance().getActiveMode();
  },
  setMode: (mode: ThemeMode): void => ThemeManager.getInstance().setMode(mode),
  setTheme: (name: string): void => ThemeManager.getInstance().setTheme(name),
  /** Register a named theme and activate it immediately (convenience for the common case). */
  applyTheme: (name: string, theme: Theme): void => {
    ThemeManager.getInstance().registerTheme(name, theme);
    ThemeManager.getInstance().setTheme(name);
  },
  registerTheme: (name: string, value: Theme): void =>
    ThemeManager.getInstance().registerTheme(name, value),
  unregisterTheme: (name: string): void => ThemeManager.getInstance().unregisterTheme(name),
  /** Subscribe to theme/mode changes; returns an unsubscribe function. */
  subscribe: (listener: ThemeListener): (() => void) =>
    ThemeManager.getInstance().addThemeListener(listener),
} as const;
