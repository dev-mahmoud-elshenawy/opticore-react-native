import { unwrap, match, mapSuccess, mapError } from '../../src/state/AsyncStateHelpers';
import { toSuccess, toError, toLoading, createAsyncState } from '../../src/state/AsyncState';

describe('AsyncStateHelpers', () => {
  describe('unwrap', () => {
    it('should return data when state is success', () => {
      const state = toSuccess('data');
      expect(unwrap(state)).toBe('data');
    });

    it('should return undefined when state is not success', () => {
      expect(unwrap(createAsyncState())).toBeUndefined();
      expect(unwrap(toLoading(createAsyncState()))).toBeUndefined();
      expect(unwrap(toError(new Error()))).toBeUndefined();
    });
  });

  describe('match', () => {
    it('should call idle handler', () => {
      const result = match(createAsyncState(), {
        idle: () => 'idle',
        loading: () => 'loading',
        success: () => 'success',
        error: () => 'error',
      });
      expect(result).toBe('idle');
    });

    it('should call loading handler', () => {
      const result = match(toLoading(createAsyncState()), {
        idle: () => 'idle',
        loading: () => 'loading',
        success: () => 'success',
        error: () => 'error',
      });
      expect(result).toBe('loading');
    });

    it('should call success handler with data', () => {
      const result = match(toSuccess('test'), {
        idle: () => 'idle',
        loading: () => 'loading',
        success: (data) => `success: ${data}`,
        error: () => 'error',
      });
      expect(result).toBe('success: test');
    });

    it('should call error handler with error', () => {
      const result = match(toError(new Error('oops')), {
        idle: () => 'idle',
        loading: () => 'loading',
        success: () => 'success',
        error: (e) => `error: ${e.message}`,
      });
      expect(result).toBe('error: oops');
    });
  });

  describe('mapSuccess', () => {
    it('should transform data if success', () => {
      const state = toSuccess(10);
      const mapped = mapSuccess(state, (n) => n * 2);
      expect(unwrap(mapped)).toBe(20);
    });

    it('should return idle state unchanged', () => {
      const state = createAsyncState<number>();
      const mapped = mapSuccess(state, (n) => n * 2);
      expect(mapped).toEqual({ type: 'idle' });
    });

    it('should return loading state with undefined previousData', () => {
      const state = toLoading(toSuccess(10));
      const mapped = mapSuccess(state, (n) => n * 2);
      expect(mapped).toEqual({ type: 'loading', previousData: undefined });
    });

    it('should return error state with undefined previousData', () => {
      const error = new Error('fail');
      const state = toError<number>(error, toSuccess(10));
      const mapped = mapSuccess(state, (n) => n * 2);
      expect(mapped).toEqual({ type: 'error', error, previousData: undefined });
    });
  });

  describe('mapError', () => {
    it('should transform error in error state', () => {
      const state = toError<string>(new Error('original'));
      const mapped = mapError(state, (e) => new Error(`wrapped: ${e.message}`));
      expect(mapped.type).toBe('error');
      if (mapped.type === 'error') {
        expect(mapped.error.message).toBe('wrapped: original');
      }
    });

    it('should return idle state unchanged', () => {
      const state = createAsyncState<string>();
      const mapped = mapError(state, (e) => new Error(`wrapped: ${e.message}`));
      expect(mapped).toEqual(state);
    });

    it('should return success state unchanged', () => {
      const state = toSuccess('data');
      const mapped = mapError(state, (e) => new Error(`wrapped: ${e.message}`));
      expect(mapped).toEqual(state);
    });

    it('should return loading state unchanged', () => {
      const state = toLoading(createAsyncState<string>());
      const mapped = mapError(state, (e) => new Error(`wrapped: ${e.message}`));
      expect(mapped).toEqual(state);
    });
  });
});
