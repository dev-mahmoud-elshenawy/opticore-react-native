import type { SecureStorageAdapter } from '../interfaces';

interface ExpoSecureStoreModule {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
}

/**
 * Default secure-storage adapter backed by `expo-secure-store`.
 * Resolves at runtime — returns null if the peer is not installed
 * so the resolver chain can fall through to the next option.
 */
export function createExpoSecureStoreAdapter(): SecureStorageAdapter | null {
  let mod: ExpoSecureStoreModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy require for optional peer
    mod = require('expo-secure-store') as ExpoSecureStoreModule;
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
