/**
 * Optional Tailwind/NativeWind integration.
 *
 * Pure, dependency-free helpers for apps that use NativeWind, so their Tailwind
 * tokens stay aligned with the OptiCore theme. Imported via the dedicated
 * `opticore-react-native/tailwind` subpath — never from the main entry — so apps
 * that don't use Tailwind are unaffected.
 */
export * from './createTailwindPreset';
