

import { ApiClient } from '../infrastructure/network/ApiClient';
import { Logger } from '../infrastructure/logger/Logger';
import type { QueueItem, SyncResult, SyncError, SyncEvent, SyncListener } from './types';

/**
 * @fileoverview Sync engine with retry logic and exponential backoff
 * @module offline/SyncEngine
 */

/**
 * HTTP status codes that should NOT be retried
 */
const NON_RETRYABLE_STATUS_CODES = [
    400, // Bad Request
    401, // Unauthorized
    403, // Forbidden
    404, // Not Found
    405, // Method Not Allowed
    409, // Conflict
    422, // Unprocessable Entity
];

import { ConflictResolver } from './ConflictResolver';

/**
 * Sync engine for processing queued requests
 */
export class SyncEngine {
    private apiClient: ApiClient;
    private conflictResolver: ConflictResolver;
    private logger: Logger;
    private listeners: SyncListener[] = [];
    private isSyncing = false;

    constructor(apiClient: ApiClient, conflictResolver: ConflictResolver) {
        this.apiClient = apiClient;
        this.conflictResolver = conflictResolver;
        this.logger = Logger.getInstance();
    }

    /**
     * Process a queue of requests
     * @param items - Queue items to process
     * @param config - Sync configuration
     * @returns Sync result with success/failure counts
     */
    async processQueue(
        items: QueueItem[],
        config: {
            maxRetries: number;
            retryDelay: number;
            maxBackoff: number;
        }
    ): Promise<SyncResult> {
        if (this.isSyncing) {
            throw new Error('Sync already in progress');
        }

        this.isSyncing = true;
        this.emit({ type: 'sync_start' });

        const result: SyncResult = {
            success: 0,
            failed: 0,
            pending: items.length,
            errors: [],
            results: [],
        };

        try {
            // Process items sequentially to avoid overwhelming the server
            for (const item of items) {
                try {
                    await this.executeRequest(item, config);
                    result.success++;
                    result.pending--;
                    result.results.push({
                        requestId: item.id,
                        success: true,
                        retryable: false
                    });
                    this.emit({ type: 'request_success', requestId: item.id });
                } catch (error) {
                    const isRetryable = this.isRetryable(error);
                    const syncError: SyncError = {
                        requestId: item.id,
                        error: error as Error,
                        retryable: isRetryable,
                    };
                    result.errors.push(syncError);
                    result.failed++;
                    result.pending--;
                    result.results.push({
                        requestId: item.id,
                        success: false,
                        error: error as Error,
                        retryable: isRetryable
                    });
                    this.emit({
                        type: 'request_failed',
                        requestId: item.id,
                        error: error as Error,
                    });
                }
            }

            this.emit({ type: 'sync_complete', result });
        } catch (error) {
            this.emit({ type: 'sync_error', error: error as Error });
            throw error;
        } finally {
            this.isSyncing = false;
        }

        return result;
    }

    /**
     * Execute a single request with retry logic
     * @param item - Queue item to execute
     * @param config - Retry configuration
     */
    async executeRequest(
        item: QueueItem,
        config: { maxRetries: number; retryDelay: number; maxBackoff: number }
    ): Promise<void> {
        const { maxRetries, retryDelay, maxBackoff } = config;
        let lastError: Error | undefined;

        // Track the data to send per attempt locally so conflict resolution can
        // update it WITHOUT mutating the shared queue item (immutability).
        let currentData = item.data;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Execute the request via ApiClient
                await this.apiClient.request({
                    method: item.method,
                    url: item.url,
                    data: currentData,
                    headers: item.headers,
                });

                // Success - exit retry loop
                this.logger.debug(`[SyncEngine] Request ${item.id} succeeded`);
                return;
            } catch (error) {
                lastError = error as Error;

                // Handle Conflict (409). ApiClient throws ApiError, which exposes
                // `status`/`data` at the top level (no `.response`). Read that shape
                // first, falling back to the raw axios shape for resilience.
                const statusCode = SyncEngine.extractStatus(error);
                if (statusCode === 409) {
                    const serverData = SyncEngine.extractData(error);
                    this.logger.info(`[SyncEngine] Conflict detected for ${item.id}, resolving with strategy: ${this.conflictResolver.getStrategy()}`);

                    try {
                        const resolvedData = await this.conflictResolver.resolve(currentData, serverData);

                        // Strategy check
                        if (this.conflictResolver.getStrategy() === 'server-wins') {
                            // Server wins means we accept server state and consider request "done"
                            // No need to retry.
                            this.logger.info(`[SyncEngine] Resolved conflict with server-wins for ${item.id}`);
                            return;
                        }

                        // Client wins or Manual: retry with resolved data (local only).
                        currentData = resolvedData;
                        this.logger.info(`[SyncEngine] Resolved conflict, retrying with new data for ${item.id}`);

                        // Continue loop to retry immediately
                        continue;


                    } catch (resolveError) {
                        this.logger.error(`[SyncEngine] Conflict resolution failed for ${item.id}`, resolveError as Error);
                        // Fall through to normal error handling (retry or fail)
                    }
                }

                // Check if error is retryable
                if (!this.isRetryable(error)) {
                    this.logger.error(
                        `[SyncEngine] Non-retryable error for ${item.id}`,
                        error as Error
                    );
                    throw error;
                }

                // Check if we've exhausted retries
                if (attempt >= maxRetries) {
                    this.logger.error(
                        `[SyncEngine] Max retries (${maxRetries}) reached for ${item.id}`,
                        error as Error
                    );
                    throw error;
                }

                // Exponential backoff capped at maxBackoff, plus full jitter to
                // avoid a thundering herd when many clients reconnect at once.
                const cappedDelay = Math.min(retryDelay * Math.pow(2, attempt), maxBackoff);
                const backoffDelay = Math.round(cappedDelay / 2 + Math.random() * (cappedDelay / 2));

                this.logger.info(
                    `[SyncEngine] Retrying ${item.id} in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})`
                );

                this.emit({
                    type: 'request_retry',
                    requestId: item.id,
                    attempt: attempt + 1,
                });

                // Wait before retrying
                await this.delay(backoffDelay);
            }
        }

        // If we reach here, all retries failed
        throw lastError || new Error('Request failed');
    }

    /**
     * Determine if an error is retryable
     * @param error - Error to check
     * @returns true if error should be retried
     */
    isRetryable(error: unknown): boolean {
        // Network errors are retryable
        if (error instanceof Error) {
            // Check for network connectivity errors
            if (
                error.message.includes('Network') ||
                error.message.includes('timeout') ||
                error.message.includes('ECONNREFUSED')
            ) {
                return true;
            }
        }

        // Check HTTP status code if available
        const statusCode = SyncEngine.extractStatus(error);

        if (statusCode) {
            // Don't retry client errors (4xx except 408, 429)
            if (NON_RETRYABLE_STATUS_CODES.includes(statusCode)) {
                return false;
            }

            // Retry on 408 (Request Timeout), 429 (Too Many Requests), and 5xx errors
            if (statusCode === 408 || statusCode === 429 || statusCode >= 500) {
                return true;
            }
        }

        // Default: retry on unknown errors
        return true;
    }

    /**
     * Add a sync event listener
     * @param listener - Event listener callback
     * @returns Function to remove the listener
     */
    addListener(listener: SyncListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Emit a sync event to all listeners
     * @param event - Event to emit
     */
    private emit(event: SyncEvent): void {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                this.logger.error('[SyncEngine] Error in event listener', error as Error);
            }
        });
    }

    /**
     * Delay helper for retry backoff
     * @param ms - Milliseconds to wait
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current syncing status
     */
    getSyncingStatus(): boolean {
        return this.isSyncing;
    }

    /**
     * Extract an HTTP status code from an error, regardless of shape.
     * ApiClient throws {@link ApiError} (top-level `status`); raw axios errors
     * nest it under `response.status`. Prefer the ApiError shape.
     */
    private static extractStatus(error: unknown): number | undefined {
        const e = error as {
            status?: number;
            statusCode?: number;
            response?: { status?: number };
        };
        return e?.status ?? e?.statusCode ?? e?.response?.status;
    }

    /**
     * Extract the server response body from an error, regardless of shape.
     * ApiError exposes it as top-level `data`; raw axios errors as `response.data`.
     */
    private static extractData(error: unknown): unknown {
        const e = error as { data?: unknown; response?: { data?: unknown } };
        return e?.data ?? e?.response?.data;
    }
}
