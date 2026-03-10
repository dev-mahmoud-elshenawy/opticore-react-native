/**
 * Centralized storage keys to prevent typos
 */
export const StorageKeys = {
  AUTH_TOKEN: 'opticore_auth_token',
  REFRESH_TOKEN: 'opticore_refresh_token',
  USER_PREFS: 'opticore_user_prefs',
  THEME: 'opticore_theme',
  LOCALE: 'opticore_locale',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
