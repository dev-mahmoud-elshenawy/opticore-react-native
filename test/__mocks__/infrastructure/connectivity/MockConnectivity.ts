type ConnectionType = 'wifi' | 'cellular' | 'none' | 'unknown';

interface NetworkState {
  isConnected: boolean;
  type: ConnectionType;
}

type ConnectivityListener = (state: NetworkState) => void;

/**
 * MockConnectivity - Test double for ConnectivityManager
 *
 * Simulates network connectivity states for testing.
 * Allows manual state changes and listener notifications.
 */
export class MockConnectivity {
  private state: NetworkState = {
    isConnected: true,
    type: 'wifi',
  };

  private listeners: Set<ConnectivityListener> = new Set();

  /**
   * Get current network state
   */
  getState(): NetworkState {
    return { ...this.state };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state.isConnected;
  }

  /**
   * Set network state (triggers listeners)
   */
  setState(state: Partial<NetworkState>): void {
    this.state = { ...this.state, ...state };
    this.notifyListeners();
  }

  /**
   * Simulate going online
   */
  goOnline(type: ConnectionType = 'wifi'): void {
    this.setState({ isConnected: true, type });
  }

  /**
   * Simulate going offline
   */
  goOffline(): void {
    this.setState({ isConnected: false, type: 'none' });
  }

  /**
   * Add connectivity listener
   */
  addListener(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    return () => this.removeListener(listener);
  }

  /**
   * Remove connectivity listener
   */
  removeListener(listener: ConnectivityListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.state = { isConnected: true, type: 'wifi' };
    this.clearListeners();
  }

  /**
   * Get listener count (for testing)
   */
  get listenerCount(): number {
    return this.listeners.size;
  }
}
