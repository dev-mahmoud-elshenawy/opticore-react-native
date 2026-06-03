import { Platform } from 'react-native';
import { Logger } from '../logger/Logger';
import type { IStorage } from './interfaces/IStorage';
import type { SecureStorageAdapter } from '../../adapters/interfaces';
import { resolveSecureStorageAdapter } from '../../adapters/registry';

/**
 * Secure storage implementation.
 *
 * Backed by a pluggable {@link SecureStorageAdapter}. By default the adapter
 * is auto-resolved from `expo-secure-store` (real Keychain/Keystore) or, if
 * the peer isn't installed, an in-memory fallback so the app doesn't crash.
 * Consumers can inject any custom adapter (e.g. react-native-keychain) via
 * `OptiCoreProvider`.
 *
 * @platform iOS, Android — web throws by default (use LocalStorage instead).
 */
export class SecureStorage implements IStorage {
  private adapter: SecureStorageAdapter;
  private keys: Set<string> = new Set();
  private static readonly KEYS_STORAGE_KEY = '__secure_storage_keys__';
  /** Resolves when initial key-list load completes (or fails). All public methods await this. */
  private readyPromise: Promise<void>;

  constructor(adapter?: SecureStorageAdapter) {
    if (Platform.OS === 'web') {
      throw new Error(
        '[SecureStorage] SecureStorage is not available on web platform. Use LocalStorage instead.'
      );
    }
    this.adapter = adapter ?? resolveSecureStorageAdapter();
    this.readyPromise = this.loadKeys();
  }

  private async loadKeys(): Promise<void> {
    try {
      const keysJson = await this.adapter.getItemAsync(SecureStorage.KEYS_STORAGE_KEY);
      if (keysJson) {
        const keys = JSON.parse(keysJson) as string[];
        this.keys = new Set(keys);
      }
    } catch (error) {
      Logger.getInstance().warn('[SecureStorage] Failed to load keys list, starting fresh', error as Error);
      this.keys = new Set();
    }
  }

  private async saveKeys(): Promise<void> {
    try {
      const keysJson = JSON.stringify(Array.from(this.keys));
      await this.adapter.setItemAsync(SecureStorage.KEYS_STORAGE_KEY, keysJson);
    } catch (error) {
      Logger.getInstance().warn('[SecureStorage] Failed to persist keys list', error as Error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.readyPromise;
    try {
      const value = await this.adapter.getItemAsync(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch (parseError) {
        Logger.getInstance().warn(
          `[SecureStorage] Failed to parse value for key "${key}", returning null`,
          parseError as Error,
        );
        return null;
      }
    } catch (error) {
      Logger.getInstance().error(`[SecureStorage] Failed to read key "${key}"`, error as Error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.readyPromise;
    try {
      if (value === undefined || value === null) {
        throw new Error(`[SecureStorage] Cannot store undefined or null value for key: ${key}`);
      }

      const stringValue = JSON.stringify(value);
      await this.adapter.setItemAsync(key, stringValue);

      this.keys.add(key);
      await this.saveKeys();
    } catch (error) {
      Logger.getInstance().error(`[SecureStorage] Failed to write key "${key}"`, error as Error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    await this.readyPromise;
    try {
      await this.adapter.deleteItemAsync(key);

      this.keys.delete(key);
      await this.saveKeys();
    } catch (error) {
      Logger.getInstance().error(`[SecureStorage] Failed to remove key "${key}"`, error as Error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    await this.readyPromise;
    try {
      const logger = Logger.getInstance();

      const deletePromises = Array.from(this.keys).map((key) =>
        this.adapter.deleteItemAsync(key).catch((error) => {
          logger.warn(`[SecureStorage] Failed to delete key "${key}" during clear`, error as Error);
        })
      );
      await Promise.all(deletePromises);
      this.keys.clear();

      await this.adapter.deleteItemAsync(SecureStorage.KEYS_STORAGE_KEY).catch((error) => {
        logger.warn('[SecureStorage] Failed to delete keys-tracking entry during clear', error as Error);
      });
    } catch (error) {
      Logger.getInstance().error('[SecureStorage] Failed to clear storage', error as Error);
      throw error;
    }
  }
}
