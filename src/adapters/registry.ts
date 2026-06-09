/**
 * Adapter resolver chains.
 *
 * Each `resolve*` function picks the first adapter that's available at
 * runtime: a consumer-supplied override > the popular default peer > the
 * in-memory fallback. This is what makes OptiCore work on any Expo SDK
 * (and even in Node tests) without pinning native peers.
 */

import type {
  ClipboardAdapter,
  ConnectivityAdapter,
  DeviceAdapter,
  LocalStorageAdapter,
  OptiCoreAdapters,
  SecureStorageAdapter,
} from './interfaces';
import { createExpoSecureStoreAdapter } from './defaults/expoSecureStore';
import { createAsyncStorageAdapter } from './defaults/asyncStorage';
import { createNetInfoAdapter } from './defaults/netInfo';
import { createExpoDeviceAdapter } from './defaults/expoDevice';
import { createReactNativeDeviceInfoAdapter } from './defaults/deviceInfo';
import { createExpoClipboardAdapter } from './defaults/expoClipboard';
import { createRNClipboardAdapter } from './defaults/rnClipboard';
import {
  createMemoryClipboardAdapter,
  createMemoryConnectivityAdapter,
  createMemoryDeviceAdapter,
  createMemoryLocalStorageAdapter,
  createMemorySecureStorageAdapter,
} from './defaults/memory';

/**
 * Emits a one-time dev warning when a feature degrades to its in-memory
 * fallback because its optional native peer isn't installed. Silent in
 * production; deduped per feature so it never spams. This turns an otherwise
 * invisible degradation (e.g. storage that doesn't persist) into an
 * actionable signal — without throwing, preserving Expo Go friendliness.
 */
const _warnedFeatures = new Set<string>();

function warnMemoryFallback(feature: string, peers: string): void {
  const isDev =
    typeof __DEV__ !== 'undefined'
      ? __DEV__
      : process.env.NODE_ENV !== 'production';
  if (!isDev || _warnedFeatures.has(feature)) return;
  _warnedFeatures.add(feature);
  console.warn(
    `[OptiCore] ${feature}: optional peer (${peers}) not found — using a ` +
      `non-persistent in-memory fallback. Data will not survive app restarts ` +
      `and secure storage is NOT secure. Install it with ` +
      `\`npx opticore-install-peers\` (or pass a custom adapter to OptiCoreProvider).`,
  );
}

/** Test-only: reset the one-time warning dedup. */
export function _resetAdapterWarnings(): void {
  _warnedFeatures.clear();
}

export function resolveSecureStorageAdapter(
  override?: SecureStorageAdapter,
): SecureStorageAdapter {
  if (override) return override;
  const real = createExpoSecureStoreAdapter();
  if (real) return real;
  warnMemoryFallback('SecureStorage', 'expo-secure-store');
  return createMemorySecureStorageAdapter();
}

export function resolveLocalStorageAdapter(
  override?: LocalStorageAdapter,
): LocalStorageAdapter {
  if (override) return override;
  const real = createAsyncStorageAdapter();
  if (real) return real;
  warnMemoryFallback('LocalStorage', '@react-native-async-storage/async-storage');
  return createMemoryLocalStorageAdapter();
}

export function resolveConnectivityAdapter(
  override?: ConnectivityAdapter,
): ConnectivityAdapter {
  if (override) return override;
  const real = createNetInfoAdapter();
  if (real) return real;
  warnMemoryFallback('Connectivity', '@react-native-community/netinfo');
  return createMemoryConnectivityAdapter();
}

export function resolveDeviceAdapter(override?: DeviceAdapter): DeviceAdapter {
  if (override) return override;
  const real =
    createExpoDeviceAdapter() ?? createReactNativeDeviceInfoAdapter();
  if (real) return real;
  warnMemoryFallback('Device', 'expo-device / react-native-device-info');
  return createMemoryDeviceAdapter();
}

export function resolveClipboardAdapter(
  override?: ClipboardAdapter,
): ClipboardAdapter {
  if (override) return override;
  const real =
    createExpoClipboardAdapter() ?? createRNClipboardAdapter();
  if (real) return real;
  warnMemoryFallback('Clipboard', 'expo-clipboard / @react-native-clipboard/clipboard');
  return createMemoryClipboardAdapter();
}

/**
 * Resolves every adapter at once given a (possibly partial) override bundle.
 * Used by OptiCoreProvider on mount.
 */
export function resolveAllAdapters(overrides?: OptiCoreAdapters): Required<{
  secureStorage: SecureStorageAdapter;
  localStorage: LocalStorageAdapter;
  connectivity: ConnectivityAdapter;
  device: DeviceAdapter;
  clipboard: ClipboardAdapter;
}> {
  return {
    secureStorage: resolveSecureStorageAdapter(overrides?.secureStorage),
    localStorage: resolveLocalStorageAdapter(overrides?.localStorage),
    connectivity: resolveConnectivityAdapter(overrides?.connectivity),
    device: resolveDeviceAdapter(overrides?.device),
    clipboard: resolveClipboardAdapter(overrides?.clipboard),
  };
}
