/**
 * State Management Type Definitions
 *
 * Centralized type definitions for state management patterns.
 * Provides consistent types for Zustand stores and async state handling.
 *
 * @module types/State
 */

/**
 * Loading status for async operations
 */
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic loading state wrapper for async data
 * Represents the complete state of an async operation
 *
 * @template T - Type of the data being loaded
 */
export interface LoadingState<T> {
  /** Current loading status */
  status: LoadingStatus;
  /** Data payload (available when status is 'success') */
  data?: T;
  /** Error information (available when status is 'error') */
  error?: ErrorState;
  /** Timestamp of last update */
  lastUpdated?: number;
}

/**
 * Error state information
 */
export interface ErrorState {
  /** Error message */
  message: string;
  /** Optional error code */
  code?: string;
  /** Timestamp when error occurred */
  timestamp: number;
  /** Indicates if error is recoverable */
  recoverable?: boolean;
}

/**
 * Pagination state for lists
 */
export interface PaginationState {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages to load */
  hasMore: boolean;
  /** Whether currently loading next page */
  isLoadingMore?: boolean;
}

/**
 * Discriminated union for async values
 * Provides type-safe access to async state
 *
 * @template T - Type of the value when loaded
 */
export type AsyncValue<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ErrorState };

/**
 * Helper type for nullable values in state
 */
export type Nullable<T> = T | null | undefined;

/**
 * Helper type for optional state properties
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Base state interface for stores
 */
export interface BaseState {
  /** Indicates if the store is initialized */
  isInitialized: boolean;
  /** Timestamp of last state update */
  lastUpdated?: number;
}

/**
 * Store actions interface
 */
export interface StoreActions {
  /** Reset store to initial state */
  reset: () => void;
}
