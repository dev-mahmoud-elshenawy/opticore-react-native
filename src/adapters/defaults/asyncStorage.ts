import type { LocalStorageAdapter } from '../interfaces';
import { createMemoryLocalStorageAdapter } from './memory';
import { nativeModulePresent } from './nativeModulePresent';

interface AsyncStorageModule {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

function isNativeModuleUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  return /native module is null/i.test(message);
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
    const mod = require('@react-native-async-storage/async-storage');
    asyncStorage = (mod?.default ?? mod) as AsyncStorageModule;
  } catch {
    return null;
  }

  if (typeof asyncStorage?.setItem !== 'function') return null;

  let memoryFallback: LocalStorageAdapter | null = null;
  let useMemoryFallback = false;

  const fallback = (): LocalStorageAdapter => {
    memoryFallback ??= createMemoryLocalStorageAdapter();
    return memoryFallback;
  };

  const run = async <T>(
    nativeOperation: () => Promise<T>,
    fallbackOperation: (adapter: LocalStorageAdapter) => Promise<T>
  ): Promise<T> => {
    if (useMemoryFallback) return fallbackOperation(fallback());

    try {
      return await nativeOperation();
    } catch (error) {
      if (!isNativeModuleUnavailableError(error)) throw error;

      useMemoryFallback = true;
      return fallbackOperation(fallback());
    }
  };

  return {
    setItem: (key, value) =>
      run(
        () => asyncStorage.setItem(key, value),
        (adapter) => adapter.setItem(key, value)
      ),
    getItem: (key) =>
      run(
        () => asyncStorage.getItem(key),
        (adapter) => adapter.getItem(key)
      ),
    removeItem: (key) =>
      run(
        () => asyncStorage.removeItem(key),
        (adapter) => adapter.removeItem(key)
      ),
    clear: () =>
      run(
        () => asyncStorage.clear(),
        (adapter) => adapter.clear()
      ),
  };
}
