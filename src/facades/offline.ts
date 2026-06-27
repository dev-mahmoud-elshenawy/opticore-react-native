import { OfflineSyncManager } from '../offline/OfflineSyncManager';
import type { QueuedRequest, SyncResult, SyncListener } from '../offline/types';

/**
 * Offline sync for app code (imperative). In components, prefer the `useOfflineSync`
 * hook; use this facade from repositories/services/background tasks. No `.getInstance()`.
 *
 * ```ts
 * await offline.enqueue({ ...mutation });   // queue while offline
 * const result = await offline.sync();       // replay when back online
 * const n = await offline.getPendingCount();
 * const unsubscribe = offline.subscribe((e) => logger.debug(e.type));
 * ```
 */
export const offline = {
  enqueue: <T = unknown>(request: QueuedRequest<T>): Promise<string> =>
    OfflineSyncManager.getInstance().enqueue(request),
  sync: (): Promise<SyncResult> => OfflineSyncManager.getInstance().sync(),
  remove: (id: string): boolean => OfflineSyncManager.getInstance().remove(id),
  clearQueue: (): void => OfflineSyncManager.getInstance().clearQueue(),
  pause: (): void => OfflineSyncManager.getInstance().pause(),
  resume: (): void => OfflineSyncManager.getInstance().resume(),
  getPendingCount: (): Promise<number> => OfflineSyncManager.getInstance().getPendingCount(),
  isSyncing: (): boolean => OfflineSyncManager.getInstance().isSyncing(),
  /** Subscribe to sync events; returns an unsubscribe function. */
  subscribe: (listener: SyncListener): (() => void) =>
    OfflineSyncManager.getInstance().addListener(listener),
} as const;
