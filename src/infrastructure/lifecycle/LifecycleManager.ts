import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { LifecycleCallback, LifecycleState } from './LifecycleObserver';
import { Logger } from '../logger/Logger';

interface Observer {
  onActive?: LifecycleCallback;
  onInactive?: LifecycleCallback;
}

/**
 * LifecycleManager - Singleton app lifecycle event monitor
 *
 * Monitors React Native AppState changes and notifies observers when the app
 * transitions between active, inactive, and background states.
 *
 * @example
 * ```typescript
 * const lifecycle = LifecycleManager.getInstance();
 *
 * lifecycle.addObserver(
 *   () => console.log('App became active'),
 *   () => console.log('App went to background/inactive')
 * );
 * ```
 */
export class LifecycleManager {
  private static instance: LifecycleManager;
  private observers: Map<number, Observer> = new Map();
  private observerIdCounter = 0;
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
    // On Android, AppState.currentState is 'unknown' until the first change event.
    // Mapping that to INACTIVE makes the first real 'active' event fire a spurious
    // onActive (premature reconnect/timer-restart). The app is in the foreground at
    // launch, so seed ACTIVE when the initial state is unknown.
    const initial = AppState.currentState;
    this.currentState =
      !initial || initial === 'unknown'
        ? LifecycleState.ACTIVE
        : this.mapAppStateToLifecycleState(initial);

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

  /**
   * Register observer callbacks for lifecycle events
   *
   * @param onActive - Callback invoked when app becomes active
   * @param onInactive - Callback invoked when app becomes inactive or goes to background
   *
   * @example
   * ```typescript
   * const unsubscribe = lifecycle.addObserver(
   *   () => resumeTimer(),
   *   () => pauseTimer()
   * );
   * // later: unsubscribe();
   * ```
   *
   * @returns An unsubscribe function that removes exactly this observer.
   */
  public addObserver(onActive?: LifecycleCallback, onInactive?: LifecycleCallback): () => void {
    if (!onActive && !onInactive) {
      return () => {};
    }
    // Key on a unique counter, not the callback reference — keying on the
    // callback meant two observers sharing a handler silently overwrote each
    // other. Each registration is now independent.
    const id = ++this.observerIdCounter;
    this.observers.set(id, { onActive, onInactive });
    return () => {
      this.observers.delete(id);
    };
  }

  /**
   * Remove a previously registered observer by its callback reference.
   *
   * Prefer the unsubscribe function returned by {@link addObserver}. This
   * removes the first observer registered with `callback` as either its
   * onActive or onInactive handler.
   *
   * @param callback - A callback used when adding the observer
   */
  public removeObserver(callback: LifecycleCallback): void {
    for (const [id, observer] of this.observers) {
      if (observer.onActive === callback || observer.onInactive === callback) {
        this.observers.delete(id);
        return;
      }
    }
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
        Logger.getInstance().error(`[LifecycleManager] Error in ${type} observer`, error as Error);
      }
    });
  }

  /**
   * Clean up and remove all observers
   *
   * Call this when the manager is no longer needed to prevent memory leaks.
   */
  public dispose(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.observers.clear();
  }
}
