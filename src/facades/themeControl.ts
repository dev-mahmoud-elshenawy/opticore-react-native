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
 * themeControl.registerTheme('brand', brandTheme);
 * const unsubscribe = themeControl.subscribe((t, mode) => logger.debug(mode));
 * ```
 */
export const themeControl = {
  get current(): Theme {
    return ThemeManager.getInstance().getTheme();
  },
  get mode(): ThemeMode {
    return ThemeManager.getInstance().getMode();
  },
  get activeMode(): 'light' | 'dark' {
    return ThemeManager.getInstance().getActiveMode();
  },
  setMode: (mode: ThemeMode): void => ThemeManager.getInstance().setMode(mode),
  setTheme: (name: string): void => ThemeManager.getInstance().setTheme(name),
  registerTheme: (name: string, value: Theme): void =>
    ThemeManager.getInstance().registerTheme(name, value),
  unregisterTheme: (name: string): void => ThemeManager.getInstance().unregisterTheme(name),
  /** Subscribe to theme/mode changes; returns an unsubscribe function. */
  subscribe: (listener: ThemeListener): (() => void) =>
    ThemeManager.getInstance().addThemeListener(listener),
} as const;
