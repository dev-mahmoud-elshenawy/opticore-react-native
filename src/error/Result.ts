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
  isOk(): this is Ok<T>;
  /** Returns `true` when this is an `Err` variant. */
  isErr(): this is Err<E>;
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
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  /**
   * Transforms the error inside an `Err` using `fn`.
   * Returns `this` unchanged when called on an `Ok`.
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F>;
}

export class Ok<T> implements IResult<T, never> {
  constructor(private readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return Result.ok(fn(this.value));
  }

  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  mapErr<F>(_fn: (error: never) => F): Result<T, F> {
    return this as unknown as Result<T, F>;
  }
}

export class Err<E> implements IResult<never, E> {
  constructor(private readonly error: E) {}

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  unwrap(): never {
    throw this.error;
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  map<T, U>(_fn: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  flatMap<T, U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  mapErr<T, F>(fn: (error: E) => F): Result<T, F> {
    return Result.err(fn(this.error));
  }
}

/** Discriminated union of `Ok<T>` and `Err<E>`. */
export type Result<T, E = Error> = Ok<T> | Err<E>;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  /** Create a successful result wrapping `value`. */
  export function ok<T, E = never>(value: T): Result<T, E> {
    return new Ok<T>(value) as Result<T, E>;
  }

  /** Create a failed result wrapping `error`. */
  export function err<T = never, E = Error>(error: E): Result<T, E> {
    return new Err<E>(error) as Result<T, E>;
  }
}
