/**
 * Core Providers Module
 *
 * This module provides React provider components for wrapping applications
 * with opticore infrastructure utilities.
 *
 * @module providers
 */

// Main provider that combines all infrastructure
export { CoreProvider } from './CoreProvider';
export type { CoreProviderProps } from './CoreProvider';

// Individual providers for granular control
export { QueryProvider } from './QueryProvider';
export type { QueryProviderProps, QueryProviderConfig } from './QueryProvider';

// Configuration types
export type { CoreProviderConfig, QueryProviderConfig as QueryConfig } from '../types/provider-types';

// Re-export useful React Query utilities
export { useQueryClient } from './QueryProvider';
