/**
 * Represents the state of an asynchronous operation.
 * Discriminated union type for type-safe state handling.
 */
export type AsyncState<T> =
  | { type: 'idle' }
  | { type: 'loading'; previousData?: T }
  | { type: 'success'; data: T }
  | { type: 'error'; error: Error; previousData?: T };

/**
 * Union type of all possible state types
 */
export type AsyncStatus = AsyncState<unknown>['type'];
