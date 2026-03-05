import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { IStorage } from './interfaces/IStorage';

/**
 * Secure storage implementation using expo-secure-store (iOS Keychain, Android Keystore)
 * @platform iOS, Android only - not available on web
 */
export class SecureStorage implements IStorage {
  private keys: Set<string> = new Set();
  private static readonly KEYS_STORAGE_KEY = '__secure_storage_keys__';
  /** Resolves when initial key-list load completes (or fails). All public methods await this. */
  private readyPromise: Promise<void>;

  constructor() {
    if (Platform.OS === 'web') {
      throw new Error(
        '[SecureStorage] SecureStorage is not available on web platform. Use LocalStorage instead.'
      );
    }
    this.readyPromise = this.loadKeys();
  }

  private async loadKeys(): Promise<void> {
    try {
      const keysJson = await SecureStore.getItemAsync(SecureStorage.KEYS_STORAGE_KEY);
      if (keysJson) {
        const keys = JSON.parse(keysJson) as string[];
        this.keys = new Set(keys);
      }
    } catch {
      // If loading fails, start with empty set — storage remains usable
      this.keys = new Set();
    }
  }

  private async saveKeys(): Promise<void> {
    try {
      const keysJson = JSON.stringify(Array.from(this.keys));
      await SecureStore.setItemAsync(SecureStorage.KEYS_STORAGE_KEY, keysJson);
    } catch (error) {
      // Log but don't throw - key tracking is best-effort
      console.warn('[SecureStorage] Failed to save keys list:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.readyPromise;
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.readyPromise;
    try {
      // Validate data before storing
      if (value === undefined || value === null) {
        throw new Error(`[SecureStorage] Cannot store undefined or null value for key: ${key}`);
      }

      const stringValue = JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);

      // Track key for clear() operation
      this.keys.add(key);
      await this.saveKeys();
    } catch (error) {
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    await this.readyPromise;
    try {
      await SecureStore.deleteItemAsync(key);

      // Remove from tracked keys
      this.keys.delete(key);
      await this.saveKeys();
    } catch (error) {
      throw error;
    }
  }

  async clear(): Promise<void> {
    await this.readyPromise;
    try {
      // Delete all tracked keys from SecureStore
      const deletePromises = Array.from(this.keys).map((key) =>
        SecureStore.deleteItemAsync(key).catch(() => {
          // Ignore individual key deletion errors
        })
      );
      await Promise.all(deletePromises);
      this.keys.clear();

      // Clear the keys tracking storage itself
      await SecureStore.deleteItemAsync(SecureStorage.KEYS_STORAGE_KEY).catch(() => {
        // Ignore error
      });
    } catch (error) {
      throw error;
    }
  }
}
