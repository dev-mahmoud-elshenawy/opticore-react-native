import type { SecureStorageAdapter } from '../interfaces';

interface ExpoSecureStoreModule {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
}

/**
 * Default secure-storage adapter backed by `expo-secure-store`.
 * Resolves at runtime — returns null if the native module is absent (Expo Go)
 * or the peer is not installed, so the resolver chain can fall through.
 */
// Expo modules register through ExpoModulesCore, not TurboModuleRegistry /
// NativeModules, so nativeModulePresent() always returns false for them.
// Use try-require + method-presence check instead.
export function createExpoSecureStoreAdapter(): SecureStorageAdapter | null {
  let mod: ExpoSecureStoreModule;
  try {
    const imported = require('expo-secure-store');
    mod = (imported?.default ?? imported) as ExpoSecureStoreModule;
  } catch {
    return null;
  }

  if (typeof mod?.setItemAsync !== 'function') return null;

  return {
    setItemAsync: (key, value) => mod.setItemAsync(key, value),
    getItemAsync: (key) => mod.getItemAsync(key),
    deleteItemAsync: (key) => mod.deleteItemAsync(key),
  };
}
