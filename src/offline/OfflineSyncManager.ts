import { ConnectivityManager } from '../infrastructure/connectivity/ConnectivityManager';
import { Logger } from '../infrastructure/logger/Logger';
import { RequestQueue } from './RequestQueue';
import { SyncEngine } from './SyncEngine';
import { ApiClient } from '../infrastructure/network/ApiClient';
import { ConflictResolver } from './ConflictResolver';
import {
    OfflineSyncConfig,
    QueuedRequest,
    SyncResult,
    SyncListener,
    SyncEvent,
    ConflictStrategy,
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
    private conflictResolver: ConflictResolver;
    private connectivity: ConnectivityManager;
    private logger: Logger;
    private config: OfflineSyncConfig;
    private isPaused: boolean = false;
    private listeners: SyncListener[] = [];
    private disposeConnectivityListener?: () => void;
    private disposeSyncEngineListener?: () => void;
    private readyPromise: Promise<void>;
    private readyResolver!: () => void;

    private constructor() {
        this.logger = Logger.getInstance();

        // Default configuration — set BEFORE constructing the ConflictResolver so
        // the resolver's strategy matches the manager's default.
        //
        // Default is 'server-wins': on a 409 we keep the server's state rather than
        // re-pushing the local edit, so a stale offline write never silently
        // clobbers a newer server-side change. Consumers who want last-write-wins
        // can opt into 'client-wins', or 'manual' with an onConflict handler.
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            maxBackoff: 30000,
            maxQueueSize: 100,
            persistQueue: true,
            syncOnReconnect: true,
            syncDelay: 1000,
            conflictStrategy: ConflictStrategy.SERVER_WINS,
        };

        this.queue = new RequestQueue();
        this.conflictResolver = new ConflictResolver(this.config.conflictStrategy);
        this.syncEngine = new SyncEngine(ApiClient.getInstance(), this.conflictResolver);
        this.connectivity = ConnectivityManager.getInstance();

        // Initialize ready promise
        this.readyPromise = new Promise<void>((resolve) => {
            this.readyResolver = resolve;
        });

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
        try {
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
        } catch (error) {
            this.logger.error('[OfflineSyncManager] Initialization failed', error as Error);
        } finally {
            this.readyResolver();
        }
    }

    /**
     * Configure the manager.
     *
     * NOTE: `storageKey` and `persistQueue` are CONSTRUCTOR-ONLY — they are read
     * once when the queue is created and changing them here has no effect. All
     * other options (retries, backoff, conflict strategy, queue size, sync timing)
     * are applied live.
     *
     * @param config - Configuration options
     */
    public configure(config: Partial<OfflineSyncConfig>): void {
        this.config = { ...this.config, ...config };

        // Update components if needed. `this.config.conflictStrategy` always has a
        // value (set in the constructor), so no fallback is needed.
        if (config.conflictStrategy || config.onConflict) {
            this.conflictResolver.updateStrategy(
                // Always set in the constructor; the `??` only satisfies the
                // optional type and matches that same default.
                this.config.conflictStrategy ?? ConflictStrategy.SERVER_WINS,
                this.config.onConflict
            );
        }

        if (config.maxQueueSize) {
            this.queue.setMaxSize(config.maxQueueSize);
        }
    }

    /**
     * Add a request to the sync queue
     * @param request - Request to enqueue
     * @returns Unique ID of the queued request
     */
    public async enqueue<T>(request: QueuedRequest<T>): Promise<string> {
        await this.readyPromise;
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
        await this.readyPromise;
        if (this.isPaused) {
            this.logger.info('[OfflineSyncManager] Sync skipped (paused)');
            return { success: 0, failed: 0, pending: this.queue.size(), errors: [], results: [] };
        }

        if (!this.connectivity.isConnected) {
            this.logger.info('[OfflineSyncManager] Sync skipped (offline)');
            return { success: 0, failed: 0, pending: this.queue.size(), errors: [], results: [] };
        }

        if (this.syncEngine.getSyncingStatus()) {
            this.logger.info('[OfflineSyncManager] Sync skipped (already in progress)');
            return { success: 0, failed: 0, pending: this.queue.size(), errors: [], results: [] };
        }

        const items = this.queue.getAll();
        if (items.length === 0) {
            return { success: 0, failed: 0, pending: 0, errors: [], results: [] };
        }

        this.logger.info(`[OfflineSyncManager] Starting sync of ${items.length} items`);

        try {
            // Queue cleanup happens in setupSyncListeners() as each item completes via
            // SyncEngine events (request_success / request_failed). No post-sync loop needed.
            return await this.syncEngine.processQueue(items, {
                maxRetries: this.config.maxRetries!,
                retryDelay: this.config.retryDelay!,
                maxBackoff: this.config.maxBackoff!,
            });
        } catch (error) {
            this.logger.error('[OfflineSyncManager] Sync failed', error as Error);
            throw error;
        }
    }

    /**
     * Listen to SyncEngine events for queue cleanup and event propagation.
     */
    private setupSyncListeners(): void {
        this.disposeSyncEngineListener = this.syncEngine.addListener((event: SyncEvent) => {
            if (event.type === 'request_success') {
                this.queue.remove(event.requestId);
            }

            if (event.type === 'request_failed') {
                // Remove non-retryable failures — they will never succeed on retry
                const isRetryable = this.syncEngine.isRetryable(event.error);
                if (!isRetryable) {
                    this.queue.remove(event.requestId);
                    this.logger.warn(
                        `[OfflineSyncManager] Removed non-retryable request "${event.requestId}" from queue`,
                        event.error,
                    );
                }
            }

            // Propagate all SyncEngine events to manager listeners
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
            this.sync().catch((err) => {
                this.logger.error('[OfflineSyncManager] Sync after resume failed', err);
            });
        }
    }

    /**
     * Add a listener for sync events.
     * Receives all SyncEngine events (sync_start, sync_complete, request_success, etc.)
     * propagated through the manager.
     * @returns Unsubscribe function
     */
    public addListener(listener: SyncListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Emit a sync event to all manager-level listeners.
     */
    private emit(event: SyncEvent): void {
        for (const listener of this.listeners) {
            try {
                listener(event);
            } catch (error) {
                this.logger.error('[OfflineSyncManager] Error in event listener', error as Error);
            }
        }
    }

    /**
     * Get pending request count
     */
    public async getPendingCount(): Promise<number> {
        await this.readyPromise;
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
     * Dispose the manager and release all resources.
     * Removes connectivity and sync engine listeners, clears the queue, and resets state.
     * After dispose, `getInstance()` returns a fresh instance.
     */
    public dispose(): void {
        if (this.disposeConnectivityListener) {
            this.disposeConnectivityListener();
            this.disposeConnectivityListener = undefined;
        }
        if (this.disposeSyncEngineListener) {
            this.disposeSyncEngineListener();
            this.disposeSyncEngineListener = undefined;
        }

        // Notify listeners before clearing them
        this.emit({ type: 'disposed' });
        this.listeners = [];
        this.queue.clear();
        this.isPaused = false;
        // Reset singleton so the next getInstance() creates a fresh, configured instance
        OfflineSyncManager.instance = undefined as unknown as OfflineSyncManager;
        this.logger.info('[OfflineSyncManager] Disposed');
    }
}
