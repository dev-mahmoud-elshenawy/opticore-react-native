/**
 * A discriminated union representing either a successful value (`Ok<T>`) or
 * a failure (`Err<E>`). Provides a type-safe alternative to try/catch for
 * operations that can fail.
 *
 * @example
 * ```typescript
 * function parsePositive(n: number): Result<number, Error> {
 *   if (n <= 0) return Result.err(new Error('must be positive'));
 *   return Result.ok(n);
 * }
 *
 * const result = parsePositive(5);
 * if (result.isOk()) {
 *   console.log(result.unwrap()); // 5
 * }
 * ```
 */

export interface IResult<T, E> {
  /** Returns `true` when this is an `Ok` variant. */
  isOk(): this is Ok<T, E>;
  /** Returns `true` when this is an `Err` variant. */
  isErr(): this is Err<T, E>;
  /**
   * Returns the contained value.
   * @throws the contained error when called on an `Err`.
   */
  unwrap(): T;
  /** Returns the contained value or `defaultValue` when this is an `Err`. */
  unwrapOr(defaultValue: T): T;
  /**
   * Transforms the value inside an `Ok` using `fn`.
   * Returns `this` unchanged when called on an `Err`.
   */
  map<U>(fn: (value: T) => U): Result<U, E>;
  /**
   * Chains another `Result`-producing operation.
   * Returns `this` unchanged when called on an `Err`.
   * The chained function may produce a different error type `F`.
   */
  flatMap<U, F = E>(fn: (value: T) => Result<U, F>): Result<U, F>;
  /**
   * Transforms the error inside an `Err` using `fn`.
   * Returns `this` unchanged when called on an `Ok`.
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F>;
}

export class Ok<T, E = never> implements IResult<T, E> {
  constructor(private readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return Result.ok<U, E>(fn(this.value));
  }

  flatMap<U, F = E>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }

  mapErr<F>(_fn: (error: E) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }
}

export class Err<T = never, E = Error> implements IResult<T, E> {
  constructor(private readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  unwrap(): T {
    throw this.error;
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  flatMap<U, F = E>(_fn: (value: T) => Result<U, F>): Result<U, F> {
    return this as unknown as Result<U, F>;
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return Result.err<T, F>(fn(this.error));
  }
}

/** Discriminated union of `Ok<T, E>` and `Err<T, E>`. */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  /** Create a successful result wrapping `value`. */
  export function ok<T, E = never>(value: T): Result<T, E> {
    return new Ok<T, E>(value);
  }

  /** Create a failed result wrapping `error`. */
  export function err<T = never, E = Error>(error: E): Result<T, E> {
    return new Err<T, E>(error);
  }
}
