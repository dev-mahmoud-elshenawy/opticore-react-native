import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { LifecycleCallback, LifecycleState } from './LifecycleObserver';

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

    /**
     * Register observer callbacks for lifecycle events
     * 
     * @param onActive - Callback invoked when app becomes active
     * @param onInactive - Callback invoked when app becomes inactive or goes to background
     * 
     * @example
     * ```typescript
     * lifecycle.addObserver(
     *   () => resumeTimer(),
     *   () => pauseTimer()
     * );
     * ```
     */
    public addObserver(onActive?: LifecycleCallback, onInactive?: LifecycleCallback): void {
        if (onActive || onInactive) {
            const key = onActive || onInactive!;
            this.observers.set(key, { onActive, onInactive });
        }
    }

    /**
     * Remove a previously registered observer
     * 
     * @param callback - The callback function used as key when adding the observer
     */
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

