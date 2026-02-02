/**
 * Centralized storage keys to prevent typos
 */
export const StorageKeys = {
    AUTH_TOKEN: 'opti_auth_token',
    REFRESH_TOKEN: 'opti_refresh_token',
    USER_PREFS: 'opti_user_prefs',
    THEME: 'opti_theme',
    LOCALE: 'opti_locale',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
