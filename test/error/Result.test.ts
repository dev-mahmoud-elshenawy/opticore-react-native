import { Result } from '../../src/error/Result';

describe('Result<T, E>', () => {
  describe('Result.ok', () => {
    it('isOk() returns true', () => {
      expect(Result.ok(42).isOk()).toBe(true);
    });

    it('isErr() returns false', () => {
      expect(Result.ok(42).isErr()).toBe(false);
    });

    it('unwrap() returns the value', () => {
      expect(Result.ok(42).unwrap()).toBe(42);
    });

    it('unwrapOr() returns the value (ignores default)', () => {
      expect(Result.ok(42).unwrapOr(0)).toBe(42);
    });

    it('map() transforms the value', () => {
      const result = Result.ok(42).map((x) => x * 2);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(84);
    });

    it('flatMap() chains another Result', () => {
      const result = Result.ok(42).flatMap((x) => Result.ok(x + 1));
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(43);
    });

    it('flatMap() can chain to Err', () => {
      const err = new Error('chain-fail');
      const result = Result.ok(42).flatMap(() => Result.err(err));
      expect(result.isErr()).toBe(true);
    });

    it('mapErr() leaves Ok unchanged', () => {
      const result = Result.ok(42).mapErr(() => new Error('should not run'));
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });
  });

  describe('Result.err', () => {
    it('isOk() returns false', () => {
      expect(Result.err(new Error('fail')).isOk()).toBe(false);
    });

    it('isErr() returns true', () => {
      expect(Result.err(new Error('fail')).isErr()).toBe(true);
    });

    it('unwrap() throws the error', () => {
      const err = new Error('fail');
      expect(() => Result.err(err).unwrap()).toThrow(err);
    });

    it('unwrapOr() returns the default value', () => {
      expect(Result.err(new Error('fail')).unwrapOr(0)).toBe(0);
    });

    it('map() leaves Err unchanged (fn not called)', () => {
      const err = new Error('fail');
      const fn = jest.fn((x: number) => x * 2);
      const result = Result.err<number, Error>(err).map(fn);
      expect(result.isErr()).toBe(true);
      expect(fn).not.toHaveBeenCalled();
    });

    it('flatMap() leaves Err unchanged (fn not called)', () => {
      const err = new Error('fail');
      const fn = jest.fn((x: number) => Result.ok(x + 1));
      const result = Result.err<number, Error>(err).flatMap(fn);
      expect(result.isErr()).toBe(true);
      expect(fn).not.toHaveBeenCalled();
    });

    it('mapErr() transforms the error', () => {
      const err = new Error('original');
      const result = Result.err(err).mapErr((e) => new Error(`wrapped: ${e.message}`));
      expect(result.isErr()).toBe(true);
      expect(() => result.unwrap()).toThrow('wrapped: original');
    });
  });

  describe('generic types', () => {
    it('works with string value and custom error type', () => {
      type ApiError = { code: number; message: string };
      const ok = Result.ok<string, ApiError>('hello');
      const err = Result.err<string, ApiError>({ code: 404, message: 'Not found' });

      expect(ok.unwrap()).toBe('hello');
      expect(err.unwrapOr('default')).toBe('default');
    });

    it('works with complex object values', () => {
      const value = { id: 1, name: 'Alice' };
      const result = Result.ok(value);
      expect(result.unwrap()).toBe(value);
    });
  });
});
