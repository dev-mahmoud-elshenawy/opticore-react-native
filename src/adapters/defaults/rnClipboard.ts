import type { ClipboardAdapter } from '../interfaces';
import { nativeModulePresent } from './nativeModulePresent';

interface ClipboardModule {
  setString(value: string): void;
  getString(): Promise<string>;
}

/**
 * Default clipboard adapter backed by `@react-native-clipboard/clipboard`.
 * Returns null if the peer is not installed — or if its native module is not
 * in the running binary (e.g. Expo Go), so we never trigger the peer's
 * import-time `getEnforcing('RNCClipboard')` throw.
 */
export function createRNClipboardAdapter(): ClipboardAdapter | null {
  if (!nativeModulePresent('RNCClipboard')) return null;

  let clipboard: ClipboardModule;
  try {
    const mod = require('@react-native-clipboard/clipboard');
    clipboard = (mod?.default ?? mod) as ClipboardModule;
  } catch {
    return null;
  }

  if (typeof clipboard?.setString !== 'function') return null;

  return {
    setString: (value) => clipboard.setString(value),
    getString: () => clipboard.getString(),
  };
}
