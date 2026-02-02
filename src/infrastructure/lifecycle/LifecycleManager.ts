import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { LifecycleCallback, LifecycleState } from './LifecycleObserver';

interface Observer {
  onActive?: LifecycleCallback;
  onInactive?: LifecycleCallback;
}

/**
 * LifecycleManager
 * Monitors React Native app lifecycle events
 * Provides observers for active/inactive/background states
 */
export class LifecycleManager {
  private static instance: LifecycleManager;
  private observers: Map<LifecycleCallback, Observer> = new Map();
  private subscription: NativeEventSubscription | null = null;
  private currentState: LifecycleState = LifecycleState.ACTIVE;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): LifecycleManager {
    if (!LifecycleManager.instance) {
      LifecycleManager.instance = new LifecycleManager();
    }
    return LifecycleManager.instance;
  }

  private initialize(): void {
    this.currentState = this.mapAppStateToLifecycleState(AppState.currentState);

    this.subscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    const nextState = this.mapAppStateToLifecycleState(nextAppState);
    const prevState = this.currentState;

    this.currentState = nextState;

    // Notify observers based on transition
    if (nextState === LifecycleState.ACTIVE && prevState !== LifecycleState.ACTIVE) {
      this.notifyObservers('onActive');
    } else if (nextState !== LifecycleState.ACTIVE && prevState === LifecycleState.ACTIVE) {
      this.notifyObservers('onInactive');
    }
  };

  private mapAppStateToLifecycleState(appState: AppStateStatus): LifecycleState {
    switch (appState) {
      case 'active':
        return LifecycleState.ACTIVE;
      case 'inactive':
        return LifecycleState.INACTIVE;
      case 'background':
        return LifecycleState.BACKGROUND;
      default:
        return LifecycleState.INACTIVE;
    }
  }

  public addObserver(onActive?: LifecycleCallback, onInactive?: LifecycleCallback): void {
    if (onActive || onInactive) {
      const key = onActive || onInactive!;
      this.observers.set(key, { onActive, onInactive });
    }
  }

  public removeObserver(callback: LifecycleCallback): void {
    this.observers.delete(callback);
  }

  private notifyObservers(type: 'onActive' | 'onInactive'): void {
    // Execute in registration order (Map preserves insertion order)
    this.observers.forEach((observer) => {
      try {
        if (type === 'onActive' && observer.onActive) {
          observer.onActive();
        } else if (type === 'onInactive' && observer.onInactive) {
          observer.onInactive();
        }
      } catch (error) {
        console.error(`[LifecycleManager] Error in ${type} observer:`, error);
      }
    });
  }

  public dispose(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.observers.clear();
  }
}
