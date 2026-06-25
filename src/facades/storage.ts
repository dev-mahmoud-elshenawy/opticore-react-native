import { StorageManager } from '../infrastructure/storage/StorageManager';
import type { IStorage } from '../infrastructure/storage/interfaces/IStorage';

/**
 * Ergonomic facade over the {@link StorageManager} singleton — use
 * `storage.secure` / `storage.local` instead of
 * `StorageManager.getInstance().secure` / `.local`.
 *
 * The accessors are lazy getters: they resolve the singleton on access (so
 * importing this module has no side effects) and always return the live
 * instances, reflecting any reconfiguration.
 */
export const storage = {
  get secure(): IStorage {
    return StorageManager.getInstance().secure;
  },
  get local(): IStorage {
    return StorageManager.getInstance().local;
  },
} as const;
