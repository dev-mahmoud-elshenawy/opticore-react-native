import { createClientStore } from '../../src/state/createClientStore';
import { StorageManager } from '../../src/infrastructure/storage/StorageManager';

interface CounterState {
  count: number;
  increment: () => void;
  setCount: (n: number) => void;
}

describe('createClientStore', () => {
  it('returns a usable hook with getState and initial state', () => {
    const useStore = createClientStore<CounterState>(
      { name: 'counter', devtools: false },
      (set) => ({
        count: 0,
        increment: () => set((s) => ({ count: s.count + 1 })),
        setCount: (n) => set({ count: n }),
      })
    );

    expect(typeof useStore).toBe('function');
    expect(useStore.getState().count).toBe(0);
  });

  it('updates state via actions (plain set semantics)', () => {
    const useStore = createClientStore<CounterState>(
      { name: 'counter-2', devtools: false },
      (set) => ({
        count: 0,
        increment: () => set((s) => ({ count: s.count + 1 })),
        setCount: (n) => set({ count: n }),
      })
    );

    useStore.getState().increment();
    expect(useStore.getState().count).toBe(1);

    useStore.getState().setCount(42);
    expect(useStore.getState().count).toBe(42);
  });

  it('does not write to storage when persist is not enabled', () => {
    const setSpy = jest.spyOn(StorageManager.getInstance().local, 'set');

    const useStore = createClientStore<CounterState>(
      { name: 'no-persist', devtools: false },
      (set) => ({
        count: 0,
        increment: () => set((s) => ({ count: s.count + 1 })),
        setCount: (n) => set({ count: n }),
      })
    );
    useStore.getState().increment();

    expect(setSpy).not.toHaveBeenCalledWith('no-persist', expect.anything());
    setSpy.mockRestore();
  });

  it('persists through OptiCore storage and honors partialize', async () => {
    const setSpy = jest.spyOn(StorageManager.getInstance().local, 'set').mockResolvedValue();

    const useStore = createClientStore<CounterState>(
      {
        name: 'persisted-counter',
        persist: true,
        devtools: false,
        partialize: (s) => ({ count: s.count }),
      },
      (set) => ({
        count: 0,
        increment: () => set((s) => ({ count: s.count + 1 })),
        setCount: (n) => set({ count: n }),
      })
    );

    useStore.getState().setCount(7);
    // Allow zustand's persist middleware to flush its async write.
    await Promise.resolve();

    expect(setSpy).toHaveBeenCalledWith(
      'persisted-counter',
      expect.objectContaining({ state: { count: 7 } })
    );
    setSpy.mockRestore();
  });
});
