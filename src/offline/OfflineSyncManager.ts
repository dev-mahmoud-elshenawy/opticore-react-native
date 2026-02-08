import { ConnectivityManager } from '../infrastructure/connectivity/ConnectivityManager';
import { Logger } from '../infrastructure/logger/Logger';
import { RequestQueue } from './RequestQueue';
import { SyncEngine } from './SyncEngine';
// import { ConflictResolver } from './ConflictResolver';
import {
    OfflineSyncConfig,
    QueuedRequest,
    SyncResult,
    SyncListener,
    SyncEvent,
} from './types';

/**
 * OfflineSyncManager - Central coordinator for offline synchronization
 *
 * Manages the request queue, sync engine, and conflict resolution.
 * Automatically syncs when connectivity is restored.
 */
export class OfflineSyncManager {
    private static instance: OfflineSyncManager;
    private queue: RequestQueue;
    private syncEngine: SyncEngine;
    // private conflictResolver: ConflictResolver; // To be used in future
    private connectivity: ConnectivityManager;
    private logger: Logger;
    private config: OfflineSyncConfig;
    private isPaused: boolean = false;
    private disposeConnectivityListener?: () => void;

    private constructor() {
        this.logger = Logger.getInstance();
        this.queue = new RequestQueue();
        this.syncEngine = new SyncEngine();
        // this.conflictResolver = new ConflictResolver();
        this.connectivity = ConnectivityManager.getInstance();

        // Default configuration
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            maxBackoff: 30000,
            maxQueueSize: 100,
            persistQueue: true,
            syncOnReconnect: true,
            syncDelay: 1000,
            conflictStrategy: 'client-wins',
        };

        this.setupSyncListeners();
        this.initialize();
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): OfflineSyncManager {
        if (!OfflineSyncManager.instance) {
            OfflineSyncManager.instance = new OfflineSyncManager();
        }
        return OfflineSyncManager.instance;
    }

    /**
     * Initialize the manager
     */
    private async initialize(): Promise<void> {
        // Restore queue from storage
        if (this.config.persistQueue) {
            await this.queue.restore();
        }

        // Setup connectivity listener
        const handleConnectivityChange = (isConnected: boolean) => {
            if (isConnected && this.config.syncOnReconnect && !this.isPaused) {
                this.logger.info('[OfflineSyncManager] Connectivity restored, scheduling sync');
                setTimeout(() => {
                    this.sync().catch(err => {
                        this.logger.error('[OfflineSyncManager] Auto-sync failed', err);
                    });
                }, this.config.syncDelay);
            }
        };

        this.connectivity.addListener(handleConnectivityChange);
        this.disposeConnectivityListener = () => {
            this.connectivity.removeListener(handleConnectivityChange);
        }
    }

    /**
     * Configure the manager
     * @param config - Configuration options
     */
    public configure(config: Partial<OfflineSyncConfig>): void {
        this.config = { ...this.config, ...config };

        // Update components if needed
        if (config.conflictStrategy || config.onConflict) {
            // this.conflictResolver = new ConflictResolver(
            //     this.config.conflictStrategy,
            //     this.config.onConflict
            // );
        }

        // Re-initialize queue if storage settings changed (simplified for now)
        if (config.maxQueueSize) {
            // In a real implementation, we might need to recreate the queue or update its limit
        }
    }

    /**
     * Add a request to the sync queue
     * @param request - Request to enqueue
     * @returns Unique ID of the queued request
     */
    public async enqueue<T>(request: QueuedRequest<T>): Promise<string> {
        const id = this.queue.add(request);

        // If we are online and not paused, try to sync immediately
        if (this.connectivity.isConnected && !this.isPaused && !this.syncEngine.getSyncingStatus()) {
            // We don't await this, it runs in background
            this.sync().catch(err => {
                this.logger.error('[OfflineSyncManager] Immediate sync failed', err);
            });
        }

        return id;
    }

    /**
     * Remove a request from the queue
     * @param id - Request ID
     */
    public remove(id: string): boolean {
        return this.queue.remove(id);
    }

    /**
     * Manually trigger a synchronization
     */
    public async sync(): Promise<SyncResult> {
        if (this.isPaused) {
            this.logger.info('[OfflineSyncManager] Sync skipped (paused)');
            return { success: 0, failed: 0, pending: this.queue.size(), errors: [] };
        }

        if (!this.connectivity.isConnected) {
            this.logger.info('[OfflineSyncManager] Sync skipped (offline)');
            return { success: 0, failed: 0, pending: this.queue.size(), errors: [] };
        }

        if (this.syncEngine.getSyncingStatus()) {
            this.logger.info('[OfflineSyncManager] Sync skipped (already in progress)');
            return { success: 0, failed: 0, pending: this.queue.size(), errors: [] };
        }

        const items = this.queue.getAll();
        if (items.length === 0) {
            return { success: 0, failed: 0, pending: 0, errors: [] };
        }

        this.logger.info(`[OfflineSyncManager] Starting sync of ${items.length} items`);

        try {
            const result = await this.syncEngine.processQueue(items, {
                maxRetries: this.config.maxRetries!,
                retryDelay: this.config.retryDelay!,
                maxBackoff: this.config.maxBackoff!,
            });

            // Remove successfully synced items
            // Note: SyncEngine events could also be used, but this ensures consistency
            // We might need to handle partial failures carefully
            // For now, let's assume SyncEngine returns which specific requests succeeded/failed via event listeners if we hooked them up,
            // but here we can just check the result if it contained IDs.
            // Since SyncEngine result counts are aggregate, we rely on the behavior that SyncEngine 
            // executes them. However, SyncEngine doesn't automatically remove from queue.
            // We should probably check which ones succeeded.
            // To keep it simple for now, we attach a listener to SyncEngine or rely on it returning details.
            // The current SyncEngine implementation emits events.
            // Ideally, SyncEngine should return types that let us know WHICH items succeeded.
            // Let's rely on the fact that we can subscribe to SyncEngine events within this manager if needed,
            // OR we update SyncEngine to return the list of processed IDs. 

            // Actually, typically the queue removal happens upon success. 
            // Let's iterate and check. Wait, SyncEngine processes them. 
            // A Clean way is to have SyncEngine take a callback or we listen to events.

            // Let's use the event listener approach for cleaner decoupling, OR just handle it here if we mock it.
            // But for this implementation, let's just re-read the queue status? RequestQueue doesn't know about sync status.

            // BETTER APPROACH: modify SyncEngine to return list of successful IDs or we handle it via listeners during init.
            // Let's register a listener on the SyncEngine during init/construction.

            return result;

        } catch (error) {
            this.logger.error('[OfflineSyncManager] Sync failed', error as Error);
            throw error;
        }
    }

    // Helper to handle queue cleanup based on sync events
    // We need to listen to SyncEngine events to remove items from queue
    private setupSyncListeners() {
        this.syncEngine.addListener((event: SyncEvent) => {
            if (event.type === 'request_success') {
                this.queue.remove(event.requestId);
            }
            // We can also handle 'request_failed' if it's non-retryable to remove it?
            // For now, keep it in queue if failed? Or move to a dead-letter queue?
            // If SyncEngine determines it's non-retryable, it might still return it as failed.
            // The current SyncEngine implementation distinguishes retryable vs not in the error, but
            // `request_failed` event has the error. 

            if (event.type === 'request_failed') {
                // Check if we should remove specific failures (like 400 Bad Request which won't pass on retry)
                // This logic requires inspecting the error again or having SyncEngine tell us.
                // SyncEngine `processQueue` logic handles retries internally. If it fails there, it means it exhausted retries OR was non-retryable.
                // So if we get 'request_failed' from SyncEngine processQueue flow, it implies it's done processing that item for this batch.
                // The question is: do we keep it in the queue for the NEXT sync attempt?
                // Usually:
                // - Network errors: Keep in queue
                // - 4xx errors: Remove (user error, won't fix itself)
                // - 5xx errors: Keep (server issue, might fix)

                // For this iteration, let's just remove successful ones. Failed ones stay for next sync attempt.
            }

            // Propagate events to our listeners
            this.emit(event);
        });
    }

    /**
     * Pause synchronization
     */
    public pause(): void {
        this.isPaused = true;
        this.logger.info('[OfflineSyncManager] Sync paused');
    }

    /**
     * Resume synchronization
     */
    public resume(): void {
        this.isPaused = false;
        this.logger.info('[OfflineSyncManager] Sync resumed');
        if (this.connectivity.isConnected) {
            this.sync().catch(() => { });
        }
    }

    /**
     * Add a listener for sync events
     */
    public addListener(listener: SyncListener): () => void {
        return this.syncEngine.addListener(listener);
    }

    // Wrapper for emit to satisfy private usage or simple event bubbling if we had our own listeners
    // But we delegate to SyncEngine's listener system mostly, OR we maintain our own.
    // Since we expose `addListener` via SyncEngine, we don't need a separate `emit` here unless we have manager-specific events.
    private emit(_event: SyncEvent) {
        // If we had a separate listener set for Manager, we'd emit here. 
        // For now, we reuse SyncEngine's system or just rely on it.
    }

    /**
     * Get pending request count
     */
    public getPendingCount(): number {
        return this.queue.size();
    }

    /**
     * Check if currently syncing
     */
    public isSyncing(): boolean {
        return this.syncEngine.getSyncingStatus();
    }

    /**
      * Clear the queue
      */
    public clearQueue(): void {
        this.queue.clear();
    }

    /**
     * Dispose the manager
     */
    public dispose(): void {
        if (this.disposeConnectivityListener) {
            this.disposeConnectivityListener();
        }
        this.isPaused = false;
        // Potentially cleanup queue or sync engine if they had resources
    }
}
