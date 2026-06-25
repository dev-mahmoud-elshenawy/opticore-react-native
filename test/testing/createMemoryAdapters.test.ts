import { createMemoryAdapters } from '../../src/testing/createMemoryAdapters';
import type { ConnectivityAdapter } from '../../src/adapters/interfaces';

describe('createMemoryAdapters', () => {
  it('implements all five adapters with working in-memory behavior', async () => {
    const { secureStorage, localStorage, connectivity, device, clipboard } = createMemoryAdapters();
    if (!secureStorage || !localStorage || !connectivity || !device || !clipboard) {
      throw new Error('expected all adapters to be defined');
    }

    await secureStorage.setItemAsync('k', 'sec');
    expect(await secureStorage.getItemAsync('k')).toBe('sec');

    await localStorage.setItem('k', 'loc');
    expect(await localStorage.getItem('k')).toBe('loc');

    expect(await connectivity.fetch()).toEqual({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    expect(device.getModel()).toBe('test-device');
    expect(await device.getUniqueId()).toBe('test-unique-id');

    clipboard.setString('hi');
    expect(await clipboard.getString()).toBe('hi');
  });

  it('supports delete / remove / clear', async () => {
    const { secureStorage, localStorage } = createMemoryAdapters();
    if (!secureStorage || !localStorage) throw new Error('missing adapters');

    await localStorage.setItem('x', '1');
    await localStorage.removeItem('x');
    expect(await localStorage.getItem('x')).toBeNull();

    await localStorage.setItem('y', '2');
    await localStorage.clear();
    expect(await localStorage.getItem('y')).toBeNull();

    await secureStorage.setItemAsync('s', '3');
    await secureStorage.deleteItemAsync('s');
    expect(await secureStorage.getItemAsync('s')).toBeNull();
  });

  it('merges overrides — override replaces the named adapter, others stay in-memory', () => {
    const customConnectivity: ConnectivityAdapter = {
      fetch: async () => ({ isConnected: false, isInternetReachable: false, type: null }),
      addEventListener: () => () => {},
    };
    const adapters = createMemoryAdapters({ connectivity: customConnectivity });

    expect(adapters.connectivity).toBe(customConnectivity);
    expect(adapters.localStorage).toBeDefined();
    expect(adapters.secureStorage).toBeDefined();
    expect(adapters.device).toBeDefined();
    expect(adapters.clipboard).toBeDefined();
  });

  it('isolates state between separate calls', async () => {
    const a1 = createMemoryAdapters();
    const a2 = createMemoryAdapters();
    if (!a1.localStorage || !a2.localStorage) throw new Error('missing adapters');

    await a1.localStorage.setItem('shared', 'a1');
    expect(await a2.localStorage.getItem('shared')).toBeNull();
  });
});
