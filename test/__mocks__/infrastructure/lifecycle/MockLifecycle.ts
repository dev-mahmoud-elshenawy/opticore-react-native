type AppState = 'active' | 'background' | 'inactive';
type LifecycleListener = (state: AppState) => void;

/**
 * MockLifecycle - Test double for LifecycleManager
 *
 * Simulates app lifecycle state changes for testing.
 * Allows manual state transitions and listener notifications.
 */
export class MockLifecycle {
  private currentState: AppState = 'active';
  private listeners: Set<LifecycleListener> = new Set();
  private history: Array<{ state: AppState; timestamp: Date }> = [];

  /**
   * Get current app state
   */
  getState(): AppState {
    return this.currentState;
  }

  /**
   * Set app state (triggers listeners)
   */
  setState(state: AppState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.history.push({ state, timestamp: new Date() });
      this.notifyListeners();
    }
  }

  /**
   * Simulate app going to foreground
   */
  goToForeground(): void {
    this.setState('active');
  }

  /**
   * Simulate app going to background
   */
  goToBackground(): void {
    this.setState('background');
  }

  /**
   * Simulate app becoming inactive
   */
  goToInactive(): void {
    this.setState('inactive');
  }

  /**
   * Add lifecycle listener
   */
  addListener(listener: LifecycleListener): () => void {
    this.listeners.add(listener);
    return () => this.removeListener(listener);
  }

  /**
   * Remove lifecycle listener
   */
  removeListener(listener: LifecycleListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get state history (for testing)
   */
  getHistory(): Array<{ state: AppState; timestamp: Date }> {
    return [...this.history];
  }

  /**
   * Clear state history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentState = 'active';
    this.clearListeners();
    this.clearHistory();
  }

  /**
   * Get listener count (for testing)
   */
  get listenerCount(): number {
    return this.listeners.size;
  }
}
