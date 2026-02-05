import { StateObserver } from '../../src/state/StateObserver';
import { createStore } from 'zustand/vanilla';

// Mock store creator
const createMockStore = (initialState: { count: number }) => {
  return createStore((set) => ({
    ...initialState,
    increment: () => set((state: any) => ({ count: state.count + 1 })),
    reset: () => set(initialState),
  }));
};

describe('StateObserver', () => {
  let observer: StateObserver;
  let testStore: any;

  beforeEach(() => {
    // Reset singleton instance or create new one if export isn't singleton
    // For now assuming singleton but we'll restart it
    observer = StateObserver.getInstance();
    observer.cleanup();
    testStore = createMockStore({ count: 0 });
  });

  afterEach(() => {
    observer.cleanup();
  });

  it('should subscribe to store changes', () => {
    const callback = jest.fn();
    observer.subscribe(testStore, callback);

    testStore.getState().increment();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 }),
      expect.objectContaining({ count: 0 }),
      undefined
    );
  });

  it('should unsubscribe from changes', () => {
    const callback = jest.fn();
    const unsubscribe = observer.subscribe(testStore, callback);

    // Trigger once
    testStore.getState().increment();
    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe and trigger again
    unsubscribe();
    testStore.getState().increment();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cleanup all listeners', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    observer.subscribe(testStore, callback1);
    observer.subscribe(testStore, callback2);

    observer.cleanup();
    testStore.getState().increment();

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it('should filter notifications', () => {
    const callback = jest.fn();

    // Only trigger when count > 1
    observer.subscribe(testStore, callback, {
      filter: (newState: any) => newState.count > 1,
    });

    // Count = 1, should NOT trigger
    testStore.getState().increment();
    expect(callback).not.toHaveBeenCalled();

    // Count = 2, SHOULD trigger
    testStore.getState().increment();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ count: 2 }),
      expect.objectContaining({ count: 1 }),
      undefined
    );
  });

  it('should handle multiple listeners independently', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    observer.subscribe(testStore, callback1);
    observer.subscribe(testStore, callback2);

    testStore.getState().increment();

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should not crash if a listener fails', () => {
    const errorCallback = jest.fn(() => {
      throw new Error('Fail');
    });
    const successCallback = jest.fn();

    // Register error callback first
    observer.subscribe(testStore, errorCallback);
    observer.subscribe(testStore, successCallback);

    // Should use try/catch internally
    // expect(() => testStore.getState().increment()).not.toThrow();
    // But since zustand notify is sync, error might propagate unless caught in observer?
    // Observer subscribes to store. store.subscribe calls listener.
    // Listener calls our callbacks. If one fails, we should catch it.

    testStore.getState().increment();

    expect(errorCallback).toHaveBeenCalled();
    expect(successCallback).toHaveBeenCalled();
  });
});
