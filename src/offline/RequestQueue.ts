import { LocalStorage } from '../infrastructure/storage/LocalStorage';
import { Logger } from '../infrastructure/logger/Logger';
import type { QueuedRequest, QueueItem, RequestPriority } from './types';

/**
 * @fileoverview Request queue with persistence and priority management
 * @module offline/RequestQueue
 */

/**
 * Priority values for sorting (higher = more important)
 */
const PRIORITY_VALUES: Record<RequestPriority, number> = {
  high: 3,
  normal: 2,
  low: 1,
};

/**
 * Request queue implementation with persistence
 */
export class RequestQueue {
  private items: QueueItem[] = [];
  private maxSize: number;
  private storageKey: string;
  private storage: LocalStorage;
  private logger: Logger;
  private persistChain: Promise<void> = Promise.resolve();

  constructor(maxSize: number = 100, storageKey: string = 'offline_sync_queue') {
    this.maxSize = maxSize;
    this.storageKey = storageKey;
    this.storage = LocalStorage.getInstance();
    this.logger = Logger.getInstance();
  }

  /**
   * Update the maximum queue size
   * @param maxSize - New maximum size
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
  }

  /**
   * Add a request to the queue
   * @param request - Request to enqueue
   * @returns Unique ID of the queued request
   */
  add<T>(request: QueuedRequest<T>): string {
    if (this.items.length >= this.maxSize) {
      throw new Error(`Queue is full (max: ${this.maxSize})`);
    }

    const id = request.id || this.generateId();
    const item: QueueItem<T> = {
      ...request,
      id,
      priority: request.priority || 'normal',
      maxRetries: request.maxRetries || 3,
      retryCount: request.retryCount || 0,
      createdAt: request.createdAt || Date.now(),
      lastAttempt: request.lastAttempt,
    };

    this.items.push(item);
    this.sort();
    this.persist();

    this.logger.debug(`[RequestQueue] Added request ${id} (priority: ${item.priority})`);
    return id;
  }

  /**
   * Remove a request from the queue
   * @param id - ID of request to remove
   * @returns true if removed, false if not found
   */
  remove(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);

    if (this.items.length < initialLength) {
      this.persist();
      this.logger.debug(`[RequestQueue] Removed request ${id}`);
      return true;
    }

    return false;
  }

  /**
   * Get all queued requests
   * @returns Array of queue items
   */
  getAll(): QueueItem[] {
    return [...this.items];
  }

  /**
   * Get a specific request by ID
   * @param id - Request ID
   * @returns Queue item or undefined
   */
  getById(id: string): QueueItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * Update a request in the queue
   * @param id - Request ID
   * @param updates - Partial updates to apply
   */
  update(id: string, updates: Partial<QueueItem>): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.items[index] = { ...this.items[index], ...updates };
    this.sort();
    this.persist();
    return true;
  }

  /**
   * Clear all requests from the queue
   */
  clear(): void {
    this.items = [];
    this.persist();
    this.logger.debug('[RequestQueue] Cleared all requests');
  }

  /**
   * Get the number of pending requests
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Sort queue by priority (high → normal → low) then by creation time
   */
  private sort(): void {
    this.items.sort((a, b) => {
      const priorityA = PRIORITY_VALUES[a.priority || 'normal'];
      const priorityB = PRIORITY_VALUES[b.priority || 'normal'];

      // First sort by priority (descending)
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }

      // Then by creation time (ascending - older first)
      return a.createdAt - b.createdAt;
    });
  }

  /**
   * Persist queue to storage — serialized to prevent concurrent writes.
   * Callers remain synchronous; writes are chained and never interleave.
   */
  private persist(): void {
    this.persistChain = this.persistChain.then(() =>
      this.storage
        .set(this.storageKey, this.items)
        .then(() => {
          this.logger.debug(`[RequestQueue] Persisted ${this.items.length} requests`);
        })
        .catch((error: Error) => {
          this.logger.error('[RequestQueue] Failed to persist queue', error);
        })
    );
  }

  /**
   * Restore queue from storage
   */
  async restore(): Promise<void> {
    try {
      const stored = await this.storage.get<QueueItem[]>(this.storageKey);
      if (stored && Array.isArray(stored)) {
        this.items = stored;
        this.sort();
        this.logger.info(`[RequestQueue] Restored ${this.items.length} requests from storage`);
      } else {
        this.items = [];
        this.logger.debug('[RequestQueue] No stored queue found');
      }
    } catch (error) {
      this.logger.error('[RequestQueue] Failed to restore queue', error as Error);
      this.items = [];
    }
  }

  /**
   * Generate a unique ID for a request
   */
  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
