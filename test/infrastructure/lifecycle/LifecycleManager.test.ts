import { AppState, AppStateStatus } from 'react-native';
import { LifecycleManager } from '../../../src/infrastructure/lifecycle/LifecycleManager';

// Mock React Native AppState
jest.mock('react-native');

describe('LifecycleManager', () => {
  let lifecycleManager: LifecycleManager;
  let mockRemove: jest.Mock;
  let appStateCallback: ((status: AppStateStatus) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateCallback = null;

    mockRemove = jest.fn();

    // Setup mock to capture callback
    (AppState.addEventListener as jest.Mock).mockImplementation((_eventType: string, callback: (status: AppStateStatus) => void) => {
      appStateCallback = callback;
      return { remove: mockRemove };
    });

    // Reset singleton instance
    const instance = (LifecycleManager as any).instance;
    if (instance) {
      instance.dispose();
      (LifecycleManager as any).instance = null;
    }

    lifecycleManager = LifecycleManager.getInstance();
  });

  afterEach(() => {
    if (lifecycleManager) {
      lifecycleManager.dispose();
    }
    // Clear singleton instance
    (LifecycleManager as any).instance = null;
    jest.clearAllMocks();
  });

  it('should return singleton instance', () => {
    const instance1 = LifecycleManager.getInstance();
    const instance2 = LifecycleManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register AppState listener on initialization', () => {
    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should trigger onActive callback when app becomes active', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);

    // First go to background, then return to active to trigger onActive
    if (appStateCallback) {
      appStateCallback('background' as AppStateStatus);
      appStateCallback('active' as AppStateStatus);
    }

    expect(onActiveMock).toHaveBeenCalled();
  });

  it('should trigger onInactive callback when app goes to background', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);

    // Simulate app going to background using captured callback
    if (appStateCallback) {
      appStateCallback('background' as AppStateStatus);
    }

    expect(onInactiveMock).toHaveBeenCalled();
    expect(onActiveMock).not.toHaveBeenCalled();
  });

  it('should trigger onInactive callback when app becomes inactive', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);

    // Simulate app becoming inactive using captured callback
    if (appStateCallback) {
      appStateCallback('inactive' as AppStateStatus);
    }

    expect(onInactiveMock).toHaveBeenCalled();
    expect(onActiveMock).not.toHaveBeenCalled();
  });

  it('should support multiple observers concurrently', () => {
    const onActive1 = jest.fn();
    const onInactive1 = jest.fn();
    const onActive2 = jest.fn();
    const onInactive2 = jest.fn();

    lifecycleManager.addObserver(onActive1, onInactive1);
    lifecycleManager.addObserver(onActive2, onInactive2);

    // First go to background, then return to active to trigger onActive
    if (appStateCallback) {
      appStateCallback('background' as AppStateStatus);
      appStateCallback('active' as AppStateStatus);
    }

    expect(onActive1).toHaveBeenCalled();
    expect(onActive2).toHaveBeenCalled();
  });

  it('should execute observers in registration order', () => {
    const callOrder: number[] = [];
    const onActive1 = jest.fn(() => callOrder.push(1));
    const onActive2 = jest.fn(() => callOrder.push(2));
    const onActive3 = jest.fn(() => callOrder.push(3));

    lifecycleManager.addObserver(onActive1);
    lifecycleManager.addObserver(onActive2);
    lifecycleManager.addObserver(onActive3);

    // First go to background, then return to active to trigger onActive callbacks
    if (appStateCallback) {
      appStateCallback('background' as AppStateStatus);
      appStateCallback('active' as AppStateStatus);
    }

    expect(callOrder).toEqual([1, 2, 3]);
  });

  it('should remove observer successfully', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);
    lifecycleManager.removeObserver(onActiveMock);

    // Simulate app becoming active using captured callback
    if (appStateCallback) {
      appStateCallback('active' as AppStateStatus);
    }

    expect(onActiveMock).not.toHaveBeenCalled();
  });

  it('should clean up on dispose', () => {
    lifecycleManager.dispose();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('should handle active to background to active lifecycle', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);

    if (appStateCallback) {
      // Active to background
      appStateCallback('background' as AppStateStatus);
      expect(onInactiveMock).toHaveBeenCalledTimes(1);

      // Background to active
      appStateCallback('active' as AppStateStatus);
      expect(onActiveMock).toHaveBeenCalledTimes(1);
    }
  });
});
