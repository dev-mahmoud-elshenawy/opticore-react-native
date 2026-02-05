import { IStorage } from './interfaces/IStorage';
import { SecureStorage } from './SecureStorage';
import { LocalStorage } from './LocalStorage';

/**
 * StorageManager - Unified storage interface singleton
 *
 * Provides access to both secure (encrypted) and local (non-encrypted) storage.
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
  public readonly secure: IStorage;
  public readonly local: IStorage;

  private constructor() {
    this.secure = new SecureStorage();
    this.local = new LocalStorage();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Clear all data from both secure and local storage
   *
   * Useful for logout scenarios where all persisted data should be removed.
   *
   * @example
   * ```typescript
   * await storage.clearAll(); // Clears both secure and local storage
   * ```
   */
  public async clearAll(): Promise<void> {
    await Promise.all([this.secure.clear(), this.local.clear()]);
  }
}
