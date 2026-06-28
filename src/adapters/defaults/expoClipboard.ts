import type { ClipboardAdapter } from '../interfaces';

interface ExpoClipboardModule {
  setStringAsync(value: string): Promise<boolean | void>;
  getStringAsync(): Promise<string>;
}

/**
 * Clipboard adapter backed by `expo-clipboard`.
 * Resolves at runtime — returns null if the peer is not installed so the
 * resolver chain can fall through to the next option.
 *
 * Preferred over the bare `@react-native-clipboard/clipboard` peer because
 * `expo-clipboard` ships inside the Expo Go binary, so it works without a
 * custom development build.
 */
// Expo modules register through ExpoModulesCore, not TurboModuleRegistry /
// NativeModules, so nativeModulePresent() always returns false for them.
// Use try-require + method-presence check instead.
export function createExpoClipboardAdapter(): ClipboardAdapter | null {
  let mod: ExpoClipboardModule;
  try {
    const imported = require('expo-clipboard');
    mod = (imported?.default ?? imported) as ExpoClipboardModule;
  } catch {
    return null;
  }

  if (typeof mod?.setStringAsync !== 'function') return null;

  return {
    // OptiCore's contract is fire-and-forget; expo-clipboard is async.
    setString: (value) => {
      void mod.setStringAsync(value);
    },
    getString: () => mod.getStringAsync(),
  };
}
