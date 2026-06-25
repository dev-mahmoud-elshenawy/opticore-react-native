import type {
  OptiCoreAdapters,
  SecureStorageAdapter,
  LocalStorageAdapter,
  ConnectivityAdapter,
  DeviceAdapter,
  ClipboardAdapter,
} from '../adapters/interfaces';

/**
 * In-memory implementations of every {@link OptiCoreAdapters} contract, for tests.
 *
 * Pass the result to `OptiCoreProvider`'s `config.adapters` to run storage /
 * connectivity / device / clipboard fully in memory — no native peers required.
 * Each call returns isolated state (its own Maps), so tests don't leak into one
 * another. Provide `overrides` to replace a specific adapter (the rest stay
 * in-memory).
 *
 * @example
 * render(<App />, {
 *   wrapper: ({ children }) => (
 *     <OptiCoreProvider config={{ api: { baseURL: 'http://test' }, adapters: createMemoryAdapters() }}>
 *       {children}
 *     </OptiCoreProvider>
 *   ),
 * });
 */
export function createMemoryAdapters(overrides: Partial<OptiCoreAdapters> = {}): OptiCoreAdapters {
  const secureMap = new Map<string, string>();
  const localMap = new Map<string, string>();
  let clipboardBuffer = '';

  const secureStorage: SecureStorageAdapter = {
    setItemAsync: async (key, value) => {
      secureMap.set(key, value);
    },
    getItemAsync: async (key) => secureMap.get(key) ?? null,
    deleteItemAsync: async (key) => {
      secureMap.delete(key);
    },
  };

  const localStorage: LocalStorageAdapter = {
    setItem: async (key, value) => {
      localMap.set(key, value);
    },
    getItem: async (key) => localMap.get(key) ?? null,
    removeItem: async (key) => {
      localMap.delete(key);
    },
    clear: async () => {
      localMap.clear();
    },
  };

  const connectivity: ConnectivityAdapter = {
    fetch: async () => ({ isConnected: true, isInternetReachable: true, type: 'wifi' }),
    addEventListener: () => () => {},
  };

  const device: DeviceAdapter = {
    getSystemVersion: () => 'test',
    getModel: () => 'test-device',
    getUniqueId: async () => 'test-unique-id',
  };

  const clipboard: ClipboardAdapter = {
    setString: (value) => {
      clipboardBuffer = value;
    },
    getString: async () => clipboardBuffer,
  };

  return { secureStorage, localStorage, connectivity, device, clipboard, ...overrides };
}
