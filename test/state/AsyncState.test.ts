import {
  createAsyncState,
  toLoading,
  toSuccess,
  toError,
  toIdle,
  isLoading,
  isSuccess,
  isError,
  isIdle,
} from '../../src/state/AsyncState';

describe('AsyncState', () => {
  it('should initialize as idle', () => {
    const state = createAsyncState<string>();

    expect(state).toEqual({ type: 'idle' });
    expect(isIdle(state)).toBe(true);
    expect(isLoading(state)).toBe(false);
    expect(isSuccess(state)).toBe(false);
    expect(isError(state)).toBe(false);
  });

  it('should transition to loading', () => {
    const state = createAsyncState<string>();
    const loadingState = toLoading(state);

    expect(loadingState.type).toBe('loading');
    expect(isLoading(loadingState)).toBe(true);
    expect(isIdle(loadingState)).toBe(false);
    expect((loadingState as any).previousData).toBeUndefined();
  });

  it('should preserve previous data when transitioning to loading', () => {
    const previousState = toSuccess('test data');
    const loadingState = toLoading(previousState);

    expect(loadingState.type).toBe('loading');
    expect((loadingState as any).previousData).toBe('test data');
  });

  it('should transition to success', () => {
    const state = toSuccess('success data');

    expect(state.type).toBe('success');
    expect((state as any).data).toBe('success data');
    expect(isSuccess(state)).toBe(true);
    expect(isLoading(state)).toBe(false);
  });

  it('should transition to error', () => {
    const error = new Error('fail');
    const state = toError(error);

    expect(state.type).toBe('error');
    expect((state as any).error).toBe(error);
    expect(isError(state)).toBe(true);
  });

  it('should preserve previous data when transitioning to error', () => {
    const previousState = toSuccess('old data');
    const error = new Error('fail');
    const errorState = toError(error, previousState);

    expect(errorState.type).toBe('error');
    expect((errorState as any).previousData).toBe('old data');
  });

  it('should return to idle', () => {
    const state = toIdle();
    expect(state.type).toBe('idle');
    expect(isIdle(state)).toBe(true);
  });
});
