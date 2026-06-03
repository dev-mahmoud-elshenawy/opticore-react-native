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

export function resolveSecureStorageAdapter(
  override?: SecureStorageAdapter,
): SecureStorageAdapter {
  return (
    override ??
    createExpoSecureStoreAdapter() ??
    createMemorySecureStorageAdapter()
  );
}

export function resolveLocalStorageAdapter(
  override?: LocalStorageAdapter,
): LocalStorageAdapter {
  return (
    override ?? createAsyncStorageAdapter() ?? createMemoryLocalStorageAdapter()
  );
}

export function resolveConnectivityAdapter(
  override?: ConnectivityAdapter,
): ConnectivityAdapter {
  return (
    override ?? createNetInfoAdapter() ?? createMemoryConnectivityAdapter()
  );
}

export function resolveDeviceAdapter(override?: DeviceAdapter): DeviceAdapter {
  return (
    override ??
    createExpoDeviceAdapter() ??
    createReactNativeDeviceInfoAdapter() ??
    createMemoryDeviceAdapter()
  );
}

export function resolveClipboardAdapter(
  override?: ClipboardAdapter,
): ClipboardAdapter {
  return (
    override ??
    createExpoClipboardAdapter() ??
    createRNClipboardAdapter() ??
    createMemoryClipboardAdapter()
  );
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
