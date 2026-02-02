import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { ConnectivityCallback } from './ConnectivityListener';

/**
 * ConnectivityManager - Singleton network connectivity monitor
 * 
 * Monitors network connectivity status and notifies listeners of changes.
 * Uses @react-native-community/netinfo for cross-platform network detection.
 * 
 * @example
 * ```typescript
 * const connectivity = ConnectivityManager.getInstance();
 * 
 * // Check current status
 * if (connectivity.isConnected) {
 *   console.log('Online');
 * }
 * 
 * // Listen for changes
 * connectivity.addListener((isConnected) => {
 *   console.log('Network status changed:', isConnected);
 * });
 * ```
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

            // Only notify if status changed
            if (wasConnected !== this._isConnected) {
                this.notifyListeners();
            }
        });
    }

    /**
     * Get current connectivity status
     * 
     * @returns true if connected to a network, false otherwise
     */
    public get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * Register a listener for connectivity changes
     * 
     * @param callback - Function called when connectivity status changes
     */
    public addListener(callback: ConnectivityCallback): void {
        this.listeners.add(callback);
    }

    /**
     * Remove a registered connectivity listener
     * 
     * @param callback - Previously registered listener function
     */
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

    /**
     * Clean up and remove all listeners
     * 
     * Call this when the manager is no longer needed to prevent memory leaks.
     */
    public dispose(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.listeners.clear();
    }
}
