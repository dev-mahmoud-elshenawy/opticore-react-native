import { Appearance, NativeEventSubscription } from 'react-native';
import { LocalStorage } from '../infrastructure/storage/LocalStorage';
import { Logger } from '../infrastructure/logger/Logger';
import { lightTheme, darkTheme } from './defaultThemes';
import type { Theme, ThemeMode, ThemeConfig, ThemeListener } from './types';

/**
 * Singleton class to manage app theming.
 * Handles:
 * - Theme state (light/dark/system)
 * - Custom themes
 * - Persistence
 * - System preference changes
 */
export class ThemeManager {
  private static instance: ThemeManager;

  private themes: Map<string, Theme> = new Map();
  private mode: ThemeMode = 'system';
  private activeThemeName: string = 'light';
  private listeners: Set<ThemeListener> = new Set();

  private config: ThemeConfig = {
    defaultMode: 'system',
    persistMode: true,
    storageKey: 'opticore_theme_mode',
    followSystem: true,
  };

  private appearanceListener: NativeEventSubscription | null = null;
  private initialized = false;

  private constructor() {
    // Register default themes
    this.registerTheme('light', lightTheme);
    this.registerTheme('dark', darkTheme);

    // Set initial system listener
    this.setupAppearanceListener();
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Configure the manager options.
   * Can be called multiple times to update config.
   */
  public configure(config: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.defaultMode && !this.initialized) {
      this.mode = config.defaultMode;
    }
  }

  /**
   * Initialize the manager, restoring persisted state if enabled.
   */
  public async init(): Promise<void> {
    if (this.initialized) return;

    // Re-establish appearance listener (idempotent — safe to call even if constructor ran it)
    this.setupAppearanceListener();

    if (this.config.persistMode) {
      try {
        const savedMode = await LocalStorage.getInstance().get<ThemeMode>(this.config.storageKey!);
        if (savedMode) {
          this.mode = savedMode;
        }
      } catch (error) {
        Logger.getInstance().warn('[ThemeManager] Failed to restore theme mode:', error);
      }
    }

    this.initialized = true;
    this.notifyListeners();
  }

  /**
   * Register a custom theme.
   */
  public registerTheme(name: string, theme: Theme): void {
    this.themes.set(name, theme);
  }

  /**
   * Unregister a theme.
   */
  public unregisterTheme(name: string): void {
    if (name === 'light' || name === 'dark') {
      Logger.getInstance().warn('[ThemeManager] Cannot unregister default themes', {});
      return;
    }
    this.themes.delete(name);
  }

  /**
   * Set the current theme by name.
   * Note: This keeps the current mode logic but switches the underlying theme definition used.
   */
  /**
   * Set the current theme by name.
   * Note: This keeps the current mode logic but switches the underlying theme definition used.
   */
  public setTheme(name: string): void {
    if (!this.themes.has(name)) {
      Logger.getInstance().warn(`[ThemeManager] Theme '${name}' not found`, {});
      return;
    }
    this.activeThemeName = name;
    this.notifyListeners();
  }

  /**
   * Set the current mode (light, dark, or system).
   */
  public setMode(mode: ThemeMode): void {
    this.mode = mode;

    if (this.config.persistMode) {
      LocalStorage.getInstance()
        .set(this.config.storageKey!, mode)
        .catch((e) => Logger.getInstance().warn('[ThemeManager] Failed to persist mode:', e));
    }

    this.notifyListeners();
  }

  /**
   * Get the current resolved theme object.
   */
  public getTheme(): Theme {
    const activeMode = this.getActiveMode();

    // Try to use the active named theme if it matches the current mode
    const namedTheme = this.themes.get(this.activeThemeName);
    if (namedTheme && namedTheme.mode === activeMode) {
      return namedTheme;
    }

    // Fallback to the theme matching the mode (light/dark)
    const modeTheme = this.themes.get(activeMode);
    if (modeTheme) {
      return modeTheme;
    }

    // Final fallback to defaults
    return activeMode === 'dark' ? darkTheme : lightTheme;
  }

  /**
   * Get the current configured mode.
   */
  public getMode(): ThemeMode {
    return this.mode;
  }

  /**
   * Get the actual active mode (resolves 'system' to 'light' or 'dark').
   */
  public getActiveMode(): 'light' | 'dark' {
    if (this.mode === 'system') {
      const colorScheme = Appearance.getColorScheme();
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return this.mode;
  }

  /**
   * Add a listener for theme changes.
   * Returns a cleanup function.
   */
  public addThemeListener(callback: ThemeListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Cleanup resources.
   */
  public dispose(): void {
    if (this.appearanceListener) {
      this.appearanceListener.remove();
      this.appearanceListener = null;
    }
    this.listeners.clear();
    // Default restore
    this.mode = 'system';
    this.initialized = false;
  }

  private setupAppearanceListener() {
    // Remove existing listener before adding a new one (idempotent)
    if (this.appearanceListener) {
      this.appearanceListener.remove();
      this.appearanceListener = null;
    }
    this.appearanceListener = Appearance.addChangeListener(() => {
      if (this.mode === 'system') {
        this.notifyListeners();
      }
    });
  }

  private notifyListeners() {
    const theme = this.getTheme();
    const mode = this.mode;
    this.listeners.forEach((listener) => listener(theme, mode));
  }
}
