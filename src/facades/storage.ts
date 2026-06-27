import { StorageManager } from '../infrastructure/storage/StorageManager';
import type { IStorage } from '../infrastructure/storage/interfaces/IStorage';

/**
 * Storage for app code — `storage.secure` (Keychain/Keystore) and `storage.local`
 * (AsyncStorage), plus `clearAll()`. No `.getInstance()`.
 *
 * ```ts
 * await storage.secure.set('token', t);
 * const user = await storage.local.get<User>('user');
 * await storage.clearAll();
 * ```
 *
 * Accessors are lazy getters, so importing this module is side-effect-free and the
 * live instances are always returned (reflecting any reconfiguration).
 */
export const storage = {
  get secure(): IStorage {
    return StorageManager.getInstance().secure;
  },
  get local(): IStorage {
    return StorageManager.getInstance().local;
  },
  /** Clear both secure and local storage (e.g. on logout). */
  clearAll: (): Promise<void> => StorageManager.getInstance().clearAll(),
} as const;
