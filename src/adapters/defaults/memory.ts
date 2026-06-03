/**
 * In-memory fallback adapters.
 *
 * Used automatically when the matching native peer (expo-secure-store,
 * @react-native-community/netinfo, etc.) is not installed in the consumer
 * project. Keeps OptiCore runnable in unit tests, SSR, Node scripts, and
 * Expo Go without crashing — at the cost of no real persistence/security.
 */

import type {
  ClipboardAdapter,
  ConnectivityAdapter,
  ConnectivitySnapshot,
  DeviceAdapter,
  LocalStorageAdapter,
  SecureStorageAdapter,
} from '../interfaces';

const inMemoryStore = (): Map<string, string> => new Map<string, string>();

export function createMemorySecureStorageAdapter(): SecureStorageAdapter {
  const store = inMemoryStore();
  return {
    setItemAsync: async (key, value) => {
      store.set(key, value);
    },
    getItemAsync: async (key) => (store.has(key) ? store.get(key)! : null),
    deleteItemAsync: async (key) => {
      store.delete(key);
    },
  };
}

export function createMemoryLocalStorageAdapter(): LocalStorageAdapter {
  const store = inMemoryStore();
  return {
    setItem: async (key, value) => {
      store.set(key, value);
    },
    getItem: async (key) => (store.has(key) ? store.get(key)! : null),
    removeItem: async (key) => {
      store.delete(key);
    },
    clear: async () => {
      store.clear();
    },
  };
}

const ONLINE_STATE: ConnectivitySnapshot = {
  isConnected: true,
  isInternetReachable: true,
  type: 'unknown',
};

export function createMemoryConnectivityAdapter(): ConnectivityAdapter {
  return {
    fetch: async () => ({ ...ONLINE_STATE }),
    addEventListener: () => () => undefined,
  };
}

export function createMemoryDeviceAdapter(): DeviceAdapter {
  return {
    getSystemVersion: () => 'unknown',
    getModel: () => 'unknown',
    getUniqueId: async () => 'opticore-unknown-device',
  };
}

export function createMemoryClipboardAdapter(): ClipboardAdapter {
  let buffer = '';
  return {
    setString: (value: string) => {
      buffer = String(value ?? '');
    },
    getString: async () => buffer,
  };
}
