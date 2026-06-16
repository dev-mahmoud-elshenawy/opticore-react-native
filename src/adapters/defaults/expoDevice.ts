import type { DeviceAdapter } from '../interfaces';

interface ExpoDeviceModule {
  osVersion: string | null;
  modelName: string | null;
}

interface ExpoApplicationModule {
  getIosIdForVendorAsync?(): Promise<string | null>;
  getAndroidId?(): string | null;
}

/**
 * Device adapter backed by `expo-device` (with `expo-application` for a stable
 * unique id when available). Resolves at runtime — returns null if the peer is
 * not installed so the resolver chain can fall through to the next option.
 *
 * Preferred over the bare `react-native-device-info` peer because the Expo
 * modules ship inside the Expo Go binary, so they work without a custom
 * development build.
 */
export function createExpoDeviceAdapter(): DeviceAdapter | null {
  let device: ExpoDeviceModule;
  try {
     
    device = require('expo-device') as ExpoDeviceModule;
  } catch {
    return null;
  }

  // expo-device exposes constants; if the native module is absent the require
  // above throws, so reaching here means the module loaded.
  if (!device || !('modelName' in device)) return null;

  let application: ExpoApplicationModule | null = null;
  try {
     
    application = require('expo-application') as ExpoApplicationModule;
  } catch {
    application = null;
  }

  return {
    getSystemVersion: () => device.osVersion ?? 'unknown',
    getModel: () => device.modelName ?? 'unknown',
    getUniqueId: async () => {
      try {
        if (typeof application?.getIosIdForVendorAsync === 'function') {
          const id = await application.getIosIdForVendorAsync();
          if (id) return id;
        }
        if (typeof application?.getAndroidId === 'function') {
          const id = application.getAndroidId();
          if (id) return id;
        }
      } catch {
        // fall through to a stable, derived fallback
      }
      return `opticore-${device.modelName ?? 'unknown-device'}`;
    },
  };
}
