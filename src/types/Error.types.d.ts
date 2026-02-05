/**
 * Error Type Definitions
 * 
 * Centralized type definitions for error handling and classification.
 * Extends the existing error classification system with metadata types.
 * 
 * @module types/Error
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error recovery action types
 * Use this to specify recommended recovery actions in error metadata
 * Note: For executable recovery strategies, use RecoveryStrategy interface from error module
 */
export type RecoveryAction =
    | 'retry'      // Retry the failed operation
    | 'fallback'   // Use fallback/cached data
    | 'ignore'     // Ignore and continue
    | 'prompt'     // Prompt user for action
    | 'logout'     // Force user logout
    | 'refresh';   // Refresh the app/page

/**
 * Error metadata for additional context
 */
export interface ErrorMetadata {
    /** Timestamp when error occurred */
    timestamp: number;
    /** User ID if available */
    userId?: string;
    /** Session ID if available */
    sessionId?: string;
    /** Screen/route where error occurred */
    screen?: string;
    /** Additional context data */
    context?: Record<string, unknown>;
    /** Stack trace (development only) */
    stackTrace?: string;
    /** Error severity level */
    severity: ErrorSeverity;
    /** Recommended recovery action */
    recoveryAction?: RecoveryAction;
    /** Whether error has been reported */
    reported?: boolean;
}

/**
 * Structured error object
 */
export interface StructuredError {
    /** Error message */
    message: string;
    /** Error code */
    code: string;
    /** Error metadata */
    metadata: ErrorMetadata;
    /** Original error if wrapped */
    originalError?: Error;
}

/**
 * Error handler callback type
 */
export type ErrorHandler = (error: StructuredError) => void | Promise<void>;

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
    /** Whether error boundary has caught an error */
    hasError: boolean;
    /** The caught error */
    error?: StructuredError;
    /** Error info from React */
    errorInfo?: {
        componentStack: string;
    };
}
