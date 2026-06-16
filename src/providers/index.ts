/**
 * Core Providers Module
 *
 * This module provides React provider components for wrapping applications
 * with opticore infrastructure utilities.
 *
 * @module providers
 */

// Unified provider (recommended)
export { OptiCoreProvider } from './OptiCoreProvider';
export type { OptiCoreProviderProps } from './OptiCoreProvider';

// Configuration context
export { ConfigContext, ConfigProvider } from './ConfigContext';
export { useConfig } from './useConfig';
export type { ConfigContextValue } from './ConfigContext';

/**
 * @deprecated Use {@link OptiCoreProvider} instead. `CoreProvider` only wires
 * QueryProvider + the connectivity/lifecycle singletons; it does NOT resolve the
 * adapter chain or configure storage/CoreSetup. Scheduled for removal in v3.0.
 */
export { CoreProvider } from './CoreProvider';
/**
 * @deprecated Use {@link OptiCoreProviderProps} instead. Scheduled for removal in v3.0.
 */
export type { CoreProviderProps } from './CoreProvider';

// Individual providers for granular control
export { QueryProvider } from './QueryProvider';
export type { QueryProviderProps, QueryProviderConfig } from './QueryProvider';

// Configuration types
export type {
  CoreProviderConfig,
  QueryProviderConfig as QueryConfig,
} from '../types/provider-types';

// Re-export useful React Query utilities
export { useQueryClient } from './QueryProvider';
