import { Platform, Dimensions } from 'react-native';
import { resolveClipboardAdapter, resolveDeviceAdapter } from '../adapters/registry';
import type { ClipboardAdapter, DeviceAdapter } from '../adapters/interfaces';

/**
 * Cached adapters resolved on first use. OptiCoreProvider may replace these
 * via {@link configurePlatformAdapters}.
 */
let clipboardAdapter: ClipboardAdapter | null = null;
let deviceAdapter: DeviceAdapter | null = null;

function clipboardImpl(): ClipboardAdapter {
  if (!clipboardAdapter) clipboardAdapter = resolveClipboardAdapter();
  return clipboardAdapter;
}

function deviceImpl(): DeviceAdapter {
  if (!deviceAdapter) deviceAdapter = resolveDeviceAdapter();
  return deviceAdapter;
}

/**
 * Replace cached clipboard/device adapters at runtime.
 * Called by OptiCoreProvider with user-supplied or auto-resolved adapters.
 */
export function configurePlatformAdapters(opts: {
  clipboard?: ClipboardAdapter;
  device?: DeviceAdapter;
}): void {
  if (opts.clipboard) clipboardAdapter = opts.clipboard;
  if (opts.device) deviceAdapter = opts.device;
}

/**
 * Copies text to the system clipboard.
 */
export function copyToClipboard(text: string): void {
  clipboardImpl().setString(text);
}

/**
 * Retrieves text from the system clipboard.
 */
export async function getClipboard(): Promise<string> {
  return clipboardImpl().getString();
}

/**
 * Gets the device screen width.
 */
export function getDeviceWidth(): number {
  return Dimensions.get('window').width;
}

/**
 * Gets the device screen height.
 */
export function getDeviceHeight(): number {
  return Dimensions.get('window').height;
}

/**
 * Gets the operating system version via the resolved DeviceAdapter.
 */
export function getOSVersion(): string {
  return deviceImpl().getSystemVersion();
}

/**
 * Gets the device model via the resolved DeviceAdapter.
 */
export function getDeviceModel(): string {
  return deviceImpl().getModel();
}

/**
 * Gets a unique device identifier via the resolved DeviceAdapter.
 */
export async function getUniqueDeviceId(): Promise<string> {
  return deviceImpl().getUniqueId();
}

/** Checks if current platform is iOS. */
export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/** Checks if current platform is Android. */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

/** Checks if current platform is Web. */
export function isWeb(): boolean {
  return Platform.OS === 'web';
}
