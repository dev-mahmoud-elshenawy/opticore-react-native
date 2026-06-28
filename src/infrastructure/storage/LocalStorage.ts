import { Logger } from '../logger/Logger';
import type { IStorage } from './interfaces/IStorage';
import type { LocalStorageAdapter } from '../../adapters/interfaces';
import { resolveLocalStorageAdapter } from '../../adapters/registry';

/**
 * Local (non-secure) storage backed by a pluggable {@link LocalStorageAdapter}.
 *
 * Default adapter is auto-resolved from `@react-native-async-storage/async-storage`
 * when installed, or an in-memory fallback otherwise. Consumers can inject any
 * adapter (e.g. react-native-mmkv) via `OptiCoreProvider`.
 */
export class LocalStorage implements IStorage {
  private static instance: LocalStorage;
  private adapter: LocalStorageAdapter;

  private constructor(adapter?: LocalStorageAdapter) {
    this.adapter = adapter ?? resolveLocalStorageAdapter();
  }

  /**
   * Get the shared LocalStorage instance.
   * If `adapter` is provided on the first call, it becomes the backing store
   * for the lifetime of the process.
   */
  public static getInstance(adapter?: LocalStorageAdapter): LocalStorage {
    if (!LocalStorage.instance) {
      LocalStorage.instance = new LocalStorage(adapter);
    }
    return LocalStorage.instance;
  }

  /** Replace the backing adapter at runtime (e.g. when OptiCoreProvider mounts). */
  public setAdapter(adapter: LocalStorageAdapter): void {
    this.adapter = adapter;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.adapter.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch (parseError) {
        Logger.getInstance().warn(
          `[LocalStorage] Failed to parse value for key "${key}", returning null`,
          parseError as Error
        );
        return null;
      }
    } catch (error) {
      Logger.getInstance().error(`[LocalStorage] Failed to read key "${key}"`, error as Error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      // Reject null/undefined to match SecureStorage. Otherwise this would
      // persist the literal string "null", and the two IStorage implementations
      // would disagree on the same input. Use remove() to clear a key.
      if (value === undefined || value === null) {
        throw new Error(`[LocalStorage] Cannot store undefined or null value for key: ${key}`);
      }
      await this.adapter.setItem(key, JSON.stringify(value));
    } catch (error) {
      Logger.getInstance().error(`[LocalStorage] Failed to write key "${key}"`, error as Error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.adapter.removeItem(key);
    } catch (error) {
      Logger.getInstance().error(`[LocalStorage] Failed to remove key "${key}"`, error as Error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.adapter.clear();
    } catch (error) {
      Logger.getInstance().error('[LocalStorage] Failed to clear storage', error as Error);
      throw error;
    }
  }
}
