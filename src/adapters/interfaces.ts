/**
 * Adapter interfaces for native module abstraction.
 *
 * OptiCore depends on these contracts — not on any specific native module.
 * Consumers can install popular peers (expo-secure-store, NetInfo, etc.)
 * and OptiCore's default adapters will auto-detect them, or they can supply
 * their own implementation via `OptiCoreProvider`'s `adapters` prop.
 */

export interface SecureStorageAdapter {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
}

export interface LocalStorageAdapter {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface ConnectivitySnapshot {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

export interface ConnectivityAdapter {
  fetch(): Promise<ConnectivitySnapshot>;
  addEventListener(callback: (state: ConnectivitySnapshot) => void): () => void;
}

export interface DeviceAdapter {
  getSystemVersion(): string;
  getModel(): string;
  getUniqueId(): Promise<string>;
}

export interface ClipboardAdapter {
  setString(value: string): void;
  getString(): Promise<string>;
}

/**
 * Bundle of adapters consumers may inject via OptiCoreProvider.
 * Any omitted adapter is auto-resolved from the default chain.
 */
export interface OptiCoreAdapters {
  secureStorage?: SecureStorageAdapter;
  localStorage?: LocalStorageAdapter;
  connectivity?: ConnectivityAdapter;
  device?: DeviceAdapter;
  clipboard?: ClipboardAdapter;
}
