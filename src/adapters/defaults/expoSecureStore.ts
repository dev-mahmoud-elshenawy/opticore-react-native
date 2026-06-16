import type { SecureStorageAdapter } from '../interfaces';
import { nativeModulePresent } from './nativeModulePresent';

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
export function createExpoSecureStoreAdapter(): SecureStorageAdapter | null {
  if (!nativeModulePresent('ExpoSecureStore')) return null;

  let mod: ExpoSecureStoreModule;
  try {
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
