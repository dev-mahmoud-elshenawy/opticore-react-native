/**
 * OptiCore React Native
 *
 * Pure infrastructure library for React Native/Expo applications
 * @packageDocumentation
 */

export const VERSION = '1.1.0';

// Infrastructure exports
export { HttpMethod } from './infrastructure';
export * from './infrastructure';
export * from './config';

// Adapter system — interfaces, registry, and built-in default adapters.
export * from './adapters';

// Error classification exports
export * from './error';

// Navigation utilities exports
export * from './navigation';

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

