import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { ConnectivityCallback } from './ConnectivityListener';

/**
 * ConnectivityManager
 * Monitors网络连接状态
 * Provides listeners for online/offline状态变化
 */
export class ConnectivityManager {
  private static instance: ConnectivityManager;
  private listeners: Set<ConnectivityCallback> = new Set();
  private _isConnected: boolean = true;
  private unsubscribe: NetInfoSubscription | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ConnectivityManager {
    if (!ConnectivityManager.instance) {
      ConnectivityManager.instance = new ConnectivityManager();
    }
    return ConnectivityManager.instance;
  }

  private initialize(): void {
    // Fetch initial state
    NetInfo.fetch()
      .then((state: NetInfoState) => {
        this._isConnected = state.isConnected ?? false;
      })
      .catch(() => {
        this._isConnected = false;
      });

    // Setup listener
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasConnected = this._isConnected;
      this._isConnected = state.isConnected ?? false;

      // Only notify if状态changed
      if (wasConnected !== this._isConnected) {
        this.notifyListeners();
      }
    });
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public addListener(callback: ConnectivityCallback): void {
    this.listeners.add(callback);
  }

  public removeListener(callback: ConnectivityCallback): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this._isConnected);
      } catch (error) {
        console.error('[ConnectivityManager] Error in listener:', error);
      }
    });
  }

  public dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}
