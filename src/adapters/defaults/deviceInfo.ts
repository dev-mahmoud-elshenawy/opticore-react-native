import type { DeviceAdapter } from '../interfaces';
import { nativeModulePresent } from './nativeModulePresent';

interface DeviceInfoModule {
  getSystemVersion(): string;
  getModel(): string;
  getUniqueId(): Promise<string> | string;
}

/**
 * Default device-info adapter backed by `react-native-device-info`.
 * Returns null if the peer is not installed — or if its native module is not
 * in the running binary (e.g. Expo Go), so we never trigger the peer's
 * import-time `NativeModule.RNDeviceInfo is null` throw.
 */
export function createReactNativeDeviceInfoAdapter(): DeviceAdapter | null {
  if (!nativeModulePresent('RNDeviceInfo')) return null;

  let deviceInfo: DeviceInfoModule;
  try {
     
    const mod = require('react-native-device-info');
    deviceInfo = (mod?.default ?? mod) as DeviceInfoModule;
  } catch {
    return null;
  }

  if (typeof deviceInfo?.getSystemVersion !== 'function') return null;

  return {
    getSystemVersion: () => deviceInfo.getSystemVersion(),
    getModel: () => deviceInfo.getModel(),
    getUniqueId: async () => Promise.resolve(deviceInfo.getUniqueId()),
  };
}
