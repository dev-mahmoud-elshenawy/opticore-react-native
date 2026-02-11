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
 * @deprecated Use OptiCoreProvider instead. CoreProvider will be removed in v2.0.
 */
export { CoreProvider } from './CoreProvider';
/**
 * @deprecated Use OptiCoreProviderProps instead. CoreProviderProps will be removed in v2.0.
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
