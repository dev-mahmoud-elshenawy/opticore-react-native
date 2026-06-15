/**
 * OptiCore React Native
 *
 * Pure infrastructure library for React Native/Expo applications
 * @packageDocumentation
 */

export const VERSION = '2.1.0';

// Infrastructure exports
export { HttpMethod } from './infrastructure';
export * from './infrastructure';
export * from './config';

// Adapter system — interfaces, registry, and built-in default adapters.
export * from './adapters';

// Error classification exports
export * from './error';

// Navigation utilities are intentionally NOT re-exported from the main entry.
// They depend on `expo-router` (an OPTIONAL peer). Re-exporting here would force
// every consumer's bundler to resolve expo-router and break React Navigation /
// non-router apps. Import them from the dedicated subpath instead:
//   import { useRouteHelper } from 'opticore-react-native/navigation';

// Utility functions exports
export * from './utils';

// State management exports
export * from './state';

// Custom hooks exports
export * from './hooks';

// Provider components exports
export * from './providers';

// Type definitions exports
export type * from './types';

// Form infrastructure exports
export * from './forms';

// Offline sync exports
export * from './offline';

// Theme infrastructure exports
export * from './theme';

// React Query integration (OptiCore-aware client factory)
export * from './query';

