import { IStorage } from './interfaces/IStorage';
import { SecureStorage } from './SecureStorage';
import { LocalStorage } from './LocalStorage';
import type { LocalStorageAdapter, SecureStorageAdapter } from '../../adapters/interfaces';

/**
 * StorageManager - Unified storage interface singleton
 *
 * Provides access to both secure (encrypted) and local (non-encrypted) storage.
 * Adapters are injected by `OptiCoreProvider` via {@link configure}; if none
 * are configured, the default resolver chain picks the best available peer or
 * falls back to memory.
 *
 * @example
 * ```typescript
 * const storage = StorageManager.getInstance();
 *
 * // Secure storage for sensitive data
 * await storage.secure.set('auth_token', token);
 * const token = await storage.secure.get<string>('auth_token');
 *
 * // Local storage for app preferences
 * await storage.local.set('theme', 'dark');
 * ```
 */
export class StorageManager {
  private static instance: StorageManager;
  public secure: IStorage;
  public local: IStorage;

  private constructor(secureAdapter?: SecureStorageAdapter, localAdapter?: LocalStorageAdapter) {
    this.secure = new SecureStorage(secureAdapter);
    this.local = LocalStorage.getInstance(localAdapter);
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Reconfigure the singleton's adapters at runtime.
   * Called by OptiCoreProvider on mount with user-supplied or auto-resolved
   * adapters. Safe to call multiple times; replaces the backing stores.
   */
  public configure(opts: {
    secureAdapter?: SecureStorageAdapter;
    localAdapter?: LocalStorageAdapter;
  }): void {
    if (opts.secureAdapter) {
      this.secure = new SecureStorage(opts.secureAdapter);
    }
    if (opts.localAdapter) {
      LocalStorage.getInstance().setAdapter(opts.localAdapter);
      this.local = LocalStorage.getInstance();
    }
  }

  /**
   * Clear all data from both secure and local storage.
   *
   * Useful for logout scenarios where all persisted data should be removed.
   */
  public async clearAll(): Promise<void> {
    await Promise.all([this.secure.clear(), this.local.clear()]);
  }
}
