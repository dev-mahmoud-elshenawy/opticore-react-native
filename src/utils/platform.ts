import Clipboard from '@react-native-clipboard/clipboard';
import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Copies text to the system clipboard.
 * @param text - Text to copy
 */
export function copyToClipboard(text: string): void {
    Clipboard.setString(text);
}

/**
 * Retrieves text from the system clipboard.
 */
export async function getClipboard(): Promise<string> {
    return await Clipboard.getString();
}

/**
 * Gets the device screen width.
 * @returns Width in pixels
 */
export function getDeviceWidth(): number {
    return Dimensions.get('window').width;
}

/**
 * Gets the device screen height.
 * @returns Height in pixels
 */
export function getDeviceHeight(): number {
    return Dimensions.get('window').height;
}

/**
 * Gets the operating system version.
 * @returns OS version string
 */
export function getOSVersion(): string {
    return DeviceInfo.getSystemVersion();
}

/**
 * Checks if current platform is iOS.
 */
export function isIOS(): boolean {
    return Platform.OS === 'ios';
}

/**
 * Checks if current platform is Android.
 */
export function isAndroid(): boolean {
    return Platform.OS === 'android';
}

/**
 * Checks if current platform is Web.
 */
export function isWeb(): boolean {
    return Platform.OS === 'web';
}
