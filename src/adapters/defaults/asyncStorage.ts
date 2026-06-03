import type { LocalStorageAdapter } from '../interfaces';
import { nativeModulePresent } from './nativeModulePresent';

interface AsyncStorageModule {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Default local-storage adapter backed by `@react-native-async-storage/async-storage`.
 * Returns null if the peer is not installed — or if its native module is not in
 * the running binary (e.g. Expo Go) — so the resolver can fall through.
 */
export function createAsyncStorageAdapter(): LocalStorageAdapter | null {
  if (!nativeModulePresent('RNCAsyncStorage')) return null;

  let asyncStorage: AsyncStorageModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy require for optional peer
    const mod = require('@react-native-async-storage/async-storage');
    asyncStorage = (mod?.default ?? mod) as AsyncStorageModule;
  } catch {
    return null;
  }

  if (typeof asyncStorage?.setItem !== 'function') return null;

  return {
    setItem: (key, value) => asyncStorage.setItem(key, value),
    getItem: (key) => asyncStorage.getItem(key),
    removeItem: (key) => asyncStorage.removeItem(key),
    clear: () => asyncStorage.clear(),
  };
}
