import { offline } from '../../src/facades/offline';
import { themeControl } from '../../src/facades/themeControl';
import { lifecycle } from '../../src/facades/lifecycle';
import { stateObserver } from '../../src/facades/stateObserver';
import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { LifecycleManager } from '../../src/infrastructure/lifecycle/LifecycleManager';
import { StateObserver } from '../../src/state/StateObserver';

afterEach(() => jest.restoreAllMocks());

describe('offline facade', () => {
  it('delegates to OfflineSyncManager', async () => {
    const m = OfflineSyncManager.getInstance();
    const sync = jest.spyOn(m, 'sync').mockResolvedValue({} as never);
    const pause = jest.spyOn(m, 'pause').mockImplementation(() => {});
    const isSyncing = jest.spyOn(m, 'isSyncing').mockReturnValue(true);
    const addListener = jest.spyOn(m, 'addListener').mockReturnValue(() => {});

    await offline.sync();
    offline.pause();
    expect(offline.isSyncing()).toBe(true);
    const unsub = offline.subscribe(() => {});

    expect(sync).toHaveBeenCalled();
    expect(pause).toHaveBeenCalled();
    expect(isSyncing).toHaveBeenCalled();
    expect(addListener).toHaveBeenCalled();
    expect(typeof unsub).toBe('function');
  });
});

describe('themeControl facade', () => {
  it('delegates to ThemeManager', () => {
    // Mock getInstance to avoid constructing the real manager (it touches Appearance).
    const stub = {
      setMode: jest.fn(),
      getActiveMode: jest.fn().mockReturnValue('dark'),
      addThemeListener: jest.fn().mockReturnValue(() => {}),
    };
    jest.spyOn(ThemeManager, 'getInstance').mockReturnValue(stub as never);

    themeControl.setMode('dark');
    expect(themeControl.activeMode).toBe('dark');
    const unsub = themeControl.subscribe(() => {});

    expect(stub.setMode).toHaveBeenCalledWith('dark');
    expect(stub.getActiveMode).toHaveBeenCalled();
    expect(stub.addThemeListener).toHaveBeenCalled();
    expect(typeof unsub).toBe('function');
  });
});

describe('lifecycle facade', () => {
  it('onChange delegates to LifecycleManager.addObserver and returns unsubscribe', () => {
    const unsubscribe = () => {};
    const addObserver = jest
      .spyOn(LifecycleManager.getInstance(), 'addObserver')
      .mockReturnValue(unsubscribe);

    const onActive = jest.fn();
    const onInactive = jest.fn();
    const result = lifecycle.onChange(onActive, onInactive);

    expect(addObserver).toHaveBeenCalledWith(onActive, onInactive);
    expect(result).toBe(unsubscribe);
  });
});

describe('stateObserver facade', () => {
  it('delegates subscribe / cleanup to StateObserver', () => {
    const unsubscribe = () => {};
    const m = StateObserver.getInstance();
    const subscribe = jest.spyOn(m, 'subscribe').mockReturnValue(unsubscribe);
    const cleanup = jest.spyOn(m, 'cleanup').mockImplementation(() => {});

    const store = {
      getState: () => ({}),
      setState: () => {},
      subscribe: () => () => {},
      getInitialState: () => ({}),
    } as never;
    const cb = jest.fn();
    const result = stateObserver.subscribe(store, cb);
    stateObserver.cleanup();

    expect(subscribe).toHaveBeenCalledWith(store, cb, undefined);
    expect(result).toBe(unsubscribe);
    expect(cleanup).toHaveBeenCalled();
  });
});
