/**
 * Test utilities for apps consuming OptiCore.
 *
 * Exposed ONLY via the `opticore-react-native/testing` subpath (never the main
 * barrel), so production bundles don't include it. No test-framework imports —
 * plain factory/function helpers you wire into your own runner.
 */
export { createMemoryAdapters } from './createMemoryAdapters';
export { resetOptiCore } from './resetOptiCore';
