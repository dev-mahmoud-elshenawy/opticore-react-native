import { NativeModules, TurboModuleRegistry } from 'react-native';

/**
 * Returns true only if a native module is actually registered in the running
 * binary — without throwing — for ANY native module name.
 *
 * This is the guard that keeps OptiCore (and any consumer code) Expo Go-friendly
 * even when a bare React Native native lib is installed (e.g.
 * `@react-native-clipboard/clipboard`, `react-native-device-info`,
 * `@react-native-community/netinfo`, or any third-party native package). Such
 * libs call `TurboModuleRegistry.getEnforcing(...)` (or read `NativeModules.X`)
 * at import time, which throws — and is reported as a red box — when the native
 * code is not in the binary (as in Expo Go). By probing with the non-throwing
 * `TurboModuleRegistry.get` and a plain `NativeModules` lookup first, callers
 * can skip importing such a lib entirely and fall back gracefully.
 *
 * @param name The native module name as registered on the native side
 *   (e.g. `'RNCClipboard'`, `'RNDeviceInfo'`, `'RNCNetInfo'`).
 */
export function nativeModulePresent(name: string): boolean {
  try {
    if (
      typeof TurboModuleRegistry?.get === 'function' &&
      TurboModuleRegistry.get(name) != null
    ) {
      return true;
    }
  } catch {
    // ignore — fall through to the legacy bridge lookup
  }

  try {
    if (NativeModules != null && NativeModules[name] != null) {
      return true;
    }
  } catch {
    // ignore — treat as not present
  }

  return false;
}

/**
 * Loads an optional native lib of ANY kind, but only after confirming its
 * native module is present in the running binary. Returns `null` instead of
 * throwing when the native module is missing (Expo Go) or the JS package is
 * not installed — so callers can fall back to another implementation.
 *
 * This is the generic building block behind OptiCore's default adapters, and
 * is exported so consumers can wrap their own native dependencies the same way:
 *
 * ```ts
 * const haptics = loadOptionalNativeModule('RNHaptic', () =>
 *   require('react-native-haptic-feedback').default,
 * );
 * if (haptics) haptics.trigger('impactLight');
 * ```
 *
 * @param nativeModuleName Native-side module name to probe (see {@link nativeModulePresent}).
 * @param load A loader that performs the actual `require`/`import` of the JS package.
 */
export function loadOptionalNativeModule<T>(
  nativeModuleName: string,
  load: () => T | null | undefined,
): T | null {
  if (!nativeModulePresent(nativeModuleName)) return null;

  try {
    return load() ?? null;
  } catch {
    return null;
  }
}
