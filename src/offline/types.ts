
/**
 * @fileoverview Type definitions for Offline Sync Manager
 * @module offline/types
 */

import { HttpMethod } from '../infrastructure/network/HttpMethod';

/**
 * Request priority levels
 */
export type RequestPriority = 'high' | 'normal' | 'low';

/**
 * Conflict resolution strategies
 */
export type ConflictStrategy = 'client-wins' | 'server-wins' | 'manual';

/**
 * A queued request waiting to be synced
 * @template T - Type of request data
 */
export interface QueuedRequest<T = unknown> {
    /** Unique identifier for this request (auto-generated if not provided) */
    id?: string;

    /** HTTP method */
    method: HttpMethod;

    /** API endpoint URL */
    url: string;

    /** Request payload data */
    data?: T;

    /** Custom headers */
    headers?: Record<string, string>;

    /** Request priority (affects processing order) */
    priority?: RequestPriority;

    /** Maximum number of retry attempts */
    maxRetries?: number;

    /** Current retry count */
    retryCount?: number;

    /** Timestamp when request was created */
    createdAt?: number;

    /** Timestamp of last sync attempt */
    lastAttempt?: number;
}

/**
 * Configuration options for OfflineSyncManager
 */
export interface OfflineSyncConfig {
    /** Maximum number of retry attempts per request (default: 3) */
    maxRetries?: number;

    /** Initial retry delay in milliseconds (default: 1000) */
    retryDelay?: number;

    /** Maximum backoff delay in milliseconds (default: 30000) */
    maxBackoff?: number;

    /** Maximum queue size limit (default: 100) */
    maxQueueSize?: number;

    /** Whether to persist queue to storage (default: true) */
    persistQueue?: boolean;

    /** LocalStorage key for queue persistence (default: 'offline_sync_queue') */
    storageKey?: string;

    /** Auto-trigger sync when reconnecting to network (default: true) */
    syncOnReconnect?: boolean;

    /** Delay before starting sync after reconnect in ms (default: 1000) */
    syncDelay?: number;

    /** Conflict resolution strategy (default: 'client-wins') */
    conflictStrategy?: ConflictStrategy;

    /** Manual conflict resolution callback (required if strategy is 'manual') */
    onConflict?: ConflictHandler;
}

/**
 * Error information for a failed sync request
 */
export interface SyncError {
    /** ID of the request that failed */
    requestId: string;

    /** Error that occurred */
    error: Error;

    /** Whether this error is retryable */
    retryable: boolean;
}

/**
 * Result for a single item within a sync operation
 */
export interface SyncItemResult {
    /** ID of the request */
    requestId: string;
    /** Whether the request was successfully processed */
    success: boolean;
    /** Error if the request failed */
    error?: Error;
    /** Whether the failed request is retryable */
    retryable?: boolean;
    /** Response data if available and needed */
    data?: any;
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
    /** Number of successfully synced requests */
    success: number;

    /** Number of failed requests */
    failed: number;

    /** Number of requests still pending */
    pending: number;

    /** Array of sync errors */
    errors: SyncError[];

    /** Array of individual item results for deterministic cleanup */
    results: SyncItemResult[];
}

/**
 * Sync events emitted by the manager
 */
export type SyncEvent =
    | { type: 'sync_start' }
    | { type: 'sync_complete'; result: SyncResult }
    | { type: 'sync_error'; error: Error }
    | { type: 'request_success'; requestId: string }
    | { type: 'request_failed'; requestId: string; error: Error }
    | { type: 'request_retry'; requestId: string; attempt: number };

/**
 * Callback function for sync event listeners
 */
export type SyncListener = (event: SyncEvent) => void;

/**
 * Conflict resolution handler function
 * @param localData - Data from local request
 * @param serverData - Data from server response
 * @returns Resolved data to use
 */
export type ConflictHandler = (localData: unknown, serverData: unknown) => Promise<unknown> | unknown;

/**
 * Internal queue item with metadata
 */
export interface QueueItem<T = unknown> extends QueuedRequest<T> {
    id: string; // Required for queue items
    createdAt: number; // Required
    retryCount: number; // Required
}
