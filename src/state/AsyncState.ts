import { AsyncState } from './types/AsyncStateTypes';

/* Re-export types */
export * from './types/AsyncStateTypes';

/**
 * Creates an initial idle state
 */
export function createAsyncState<T>(): AsyncState<T> {
    return { type: 'idle' };
}

/**
 * Type guard for idle state
 */
export function isIdle<T>(state: AsyncState<T>): state is { type: 'idle' } {
    return state.type === 'idle';
}

/**
 * Type guard for loading state
 */
export function isLoading<T>(state: AsyncState<T>): state is { type: 'loading'; previousData?: T } {
    return state.type === 'loading';
}

/**
 * Type guard for success state
 */
export function isSuccess<T>(state: AsyncState<T>): state is { type: 'success'; data: T } {
    return state.type === 'success';
}

/**
 * Type guard for error state
 */
export function isError<T>(state: AsyncState<T>): state is { type: 'error'; error: Error; previousData?: T } {
    return state.type === 'error';
}

/**
 * Transitions to loading state, preserving previous data if available
 */
export function toLoading<T>(state?: AsyncState<T>): AsyncState<T> {
    const previousData =
        state?.type === 'success' ? state.data :
            state?.type === 'loading' ? state.previousData :
                state?.type === 'error' ? state.previousData :
                    undefined;

    return {
        type: 'loading',
        previousData
    };
}

/**
 * Transitions to success state
 */
export function toSuccess<T>(data: T): AsyncState<T> {
    return {
        type: 'success',
        data
    };
}

/**
 * Transitions to error state, preserving previous data if available
 */
export function toError<T>(error: Error, state?: AsyncState<T>): AsyncState<T> {
    const previousData =
        state?.type === 'success' ? state.data :
            state?.type === 'loading' ? state.previousData :
                state?.type === 'error' ? state.previousData :
                    undefined;

    return {
        type: 'error',
        error,
        previousData
    };
}

/**
 * Transitions to idle state
 */
export function toIdle<T>(): AsyncState<T> {
    return { type: 'idle' };
}
