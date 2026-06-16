import { StoreApi } from 'zustand';
import { Listener, StateCallback, SubscribeOptions } from './types/ObserverTypes';

/**
 * Global state observer for listening to changes across multiple stores.
 * Implements Singleton pattern.
 */
export class StateObserver {
  private static instance: StateObserver;
  private listeners: Map<string, Listener> = new Map();
  private storeUnSubscribers: Map<string, () => void> = new Map();
  /** Monotonic counter for collision-free subscription IDs. */
  private idCounter = 0;

  private constructor() {}

  /**
   * Get the singleton instance of StateObserver
   */
  public static getInstance(): StateObserver {
    if (!StateObserver.instance) {
      StateObserver.instance = new StateObserver();
    }
    return StateObserver.instance;
  }

  /**
   * Subscribe to changes in a specific store
   *
   * @param store The Zustand store to observe
   * @param callback Function to call when state changes
   * @param options Optional configuration (filter, storeName)
   * @returns Unsubscribe function
   */
  public subscribe<T>(
    store: StoreApi<T>,
    callback: StateCallback<T>,
    options?: SubscribeOptions<T>
  ): () => void {
    const id = `sub_${++this.idCounter}`;

    const listener: Listener<T> = {
      id,
      store,
      callback,
      filter: options?.filter,
      storeName: options?.storeName,
    };

    this.listeners.set(id, listener as Listener);

    // We need to subscribe to the store itself to detect changes
    // But we only want to do this ONCE per store if possible?
    // Actually, we can subscribe individually for each listener to keep it simple,
    // or we can manage a single subscription per store and fan out.
    // Fan out is better for memory, but identifying the store "instance" is hard without a WeakMap key.
    // For simplicity and to match the requirements of 10ms latency:
    // Let's attach a listener to the store for THIS subscription.

    // We need to track the current state to provide oldState
    let currentState = store.getState();

    const unsubscribeStore = store.subscribe((newState: T) => {
      const oldState = currentState;
      currentState = newState;

      try {
        if (listener.filter && !listener.filter(newState, oldState)) {
          return;
        }
        listener.callback(newState, oldState, listener.storeName);
      } catch (error) {
        console.error('[StateObserver] Listener failed:', error);
        // Don't rethrow to avoid breaking other listeners or the store update
      }
    });

    // Store the unsubscribe function mapped to our listener ID so we can cleanup
    this.storeUnSubscribers.set(id, unsubscribeStore);

    return () => this.unsubscribe(id);
  }

  /**
   * Unsubscribe a specific listener
   */
  public unsubscribe(listenerId: string): void {
    // 1. Remove from listeners map
    this.listeners.delete(listenerId);

    // 2. Call the store's unsubscribe function
    const unsubscribeStore = this.storeUnSubscribers.get(listenerId);
    if (unsubscribeStore) {
      unsubscribeStore();
      this.storeUnSubscribers.delete(listenerId);
    }
  }

  /**
   * Remove all listeners and subscriptions
   */
  public cleanup(): void {
    // Call all unsubscribe functions
    this.storeUnSubscribers.forEach((unsubscribe) => unsubscribe());

    // Clear maps
    this.storeUnSubscribers.clear();
    this.listeners.clear();
  }
}
