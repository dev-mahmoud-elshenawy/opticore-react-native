import type { ConnectivityCallback } from './ConnectivityListener';
import type { ConnectivityAdapter } from '../../adapters/interfaces';
import { resolveConnectivityAdapter } from '../../adapters/registry';

/**
 * ConnectivityManager - Singleton network connectivity monitor
 *
 * Backed by a pluggable {@link ConnectivityAdapter}. By default it auto-resolves
 * `@react-native-community/netinfo` if installed, else falls back to an
 * always-online stub so the app never crashes when the peer is missing.
 * Consumers can inject any implementation via `OptiCoreProvider`.
 */
export class ConnectivityManager {
  private static instance: ConnectivityManager;
  private listeners: Set<ConnectivityCallback> = new Set();
  private _isConnected: boolean = true;
  private adapter: ConnectivityAdapter;
  private unsubscribe: (() => void) | null = null;

  private constructor(adapter?: ConnectivityAdapter) {
    this.adapter = adapter ?? resolveConnectivityAdapter();
    this.initialize();
  }

  public static getInstance(): ConnectivityManager {
    if (!ConnectivityManager.instance) {
      ConnectivityManager.instance = new ConnectivityManager();
    }
    return ConnectivityManager.instance;
  }

  /**
   * Swap the underlying adapter at runtime (re-subscribes events).
   */
  public configure(adapter: ConnectivityAdapter): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.adapter = adapter;
    this.initialize();
  }

  private initialize(): void {
    this.adapter
      .fetch()
      .then((state) => {
        this._isConnected = state.isConnected ?? false;
      })
      .catch(() => {
        this._isConnected = false;
      });

    this.unsubscribe = this.adapter.addEventListener((state) => {
      const wasConnected = this._isConnected;
      this._isConnected = state.isConnected ?? false;

      if (wasConnected !== this._isConnected) {
        this.notifyListeners();
      }
    });
  }

  /**
   * Get current connectivity status
   */
  public get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Register a listener for connectivity changes
   */
  public addListener(callback: ConnectivityCallback): void {
    this.listeners.add(callback);
  }

  /**
   * Remove a registered connectivity listener
   */
  public removeListener(callback: ConnectivityCallback): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this._isConnected);
      } catch (error) {
        // eslint-disable-next-line no-console -- listener error is reported via console as a last resort
        console.error('[ConnectivityManager] Error in listener:', error);
      }
    });
  }

  /**
   * Clean up and remove all listeners
   */
  public dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}
