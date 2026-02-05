/**
 * Global TypeScript Type Definitions
 *
 * Centralized type exports for the entire opticore package.
 * Import types from this module for use throughout your application.
 *
 * @module types
 *
 * @example
 * ```typescript
 * import type { PaginatedResponse, LoadingState, ErrorMetadata } from 'opticore-react-native';
 *
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * const response: PaginatedResponse<User> = await fetchUsers();
 * const state: LoadingState<User> = { status: 'loading' };
 * ```
 */

// API Types
// Note: ApiError class and ApiResponse interface are exported from infrastructure
export type {
    PaginatedResponse,
    PaginationMeta,
    RequestConfig,
    HttpMethod,
} from './Api.types';

// State Types
export type {
    LoadingState,
    LoadingStatus,
    ErrorState,
    PaginationState,
    AsyncValue,
    Nullable,
    Optional,
    BaseState,
    StoreActions,
} from './State.types';

// Error Types
export type {
    ErrorSeverity,
    RecoveryAction,
    ErrorMetadata,
    StructuredError,
    ErrorHandler,
    ErrorBoundaryState,
} from './Error.types';

// Storage Types
// Note: StorageKeys const is exported from infrastructure/storage
export type {
    StorageProvider,
    StorageValue,
    StorageConfig,
    StorageResult,
    StorageAdapter,
} from './Storage.types';

// Navigation Types
export type {
    RouteParams,
    TransitionType,
    NavigationOptions,
    ScreenConfig,
    NavigationState,
    RouteGuard,
    NavigateFunction,
} from './Navigation.types';

// Provider Types are exported from './provider-types' directly, not re-exported here to avoid conflicts
