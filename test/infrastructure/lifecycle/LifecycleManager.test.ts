import { AppState, AppStateStatus } from 'react-native';
import { LifecycleManager } from '../../../src/infrastructure/lifecycle/LifecycleManager';

// Mock React Native AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
    currentState: 'active',
  },
}));

describe('LifecycleManager', () => {
  let lifecycleManager: LifecycleManager;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    mockUnsubscribe = jest.fn();
    (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: mockUnsubscribe });
    lifecycleManager = LifecycleManager.getInstance();
  });

  afterEach(() => {
    lifecycleManager.dispose();
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

    // Simulate app becoming active
    const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    changeHandler('active' as AppStateStatus);

    expect(onActiveMock).toHaveBeenCalled();
    expect(onInactiveMock).not.toHaveBeenCalled();
  });

  it('should trigger onInactive callback when app goes to background', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);

    // Simulate app going to background
    const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    changeHandler('background' as AppStateStatus);

    expect(onInactiveMock).toHaveBeenCalled();
    expect(onActiveMock).not.toHaveBeenCalled();
  });

  it('should trigger onInactive callback when app becomes inactive', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);

    // Simulate app becoming inactive
    const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    changeHandler('inactive' as AppStateStatus);

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

    const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    changeHandler('active' as AppStateStatus);

    expect(onActive1).toHaveBeenCalled();
    expect(onActive2).toHaveBeenCalled();
    expect(onInactive1).not.toHaveBeenCalled();
    expect(onInactive2).not.toHaveBeenCalled();
  });

  it('should execute observers in registration order', () => {
    const callOrder: number[] = [];
    const onActive1 = jest.fn(() => callOrder.push(1));
    const onActive2 = jest.fn(() => callOrder.push(2));
    const onActive3 = jest.fn(() => callOrder.push(3));

    lifecycleManager.addObserver(onActive1);
    lifecycleManager.addObserver(onActive2);
    lifecycleManager.addObserver(onActive3);

    const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    changeHandler('active' as AppStateStatus);

    expect(callOrder).toEqual([1, 2, 3]);
  });

  it('should remove observer successfully', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);
    lifecycleManager.removeObserver(onActiveMock);

    const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];
    changeHandler('active' as AppStateStatus);

    expect(onActiveMock).not.toHaveBeenCalled();
  });

  it('should clean up on dispose', () => {
    lifecycleManager.dispose();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle active to background to active lifecycle', () => {
    const onActiveMock = jest.fn();
    const onInactiveMock = jest.fn();

    lifecycleManager.addObserver(onActiveMock, onInactiveMock);

    const changeHandler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];

    // Active to background
    changeHandler('background' as AppStateStatus);
    expect(onInactiveMock).toHaveBeenCalledTimes(1);

    // Background to active
    changeHandler('active' as AppStateStatus);
    expect(onActiveMock).toHaveBeenCalledTimes(1);
  });
});
