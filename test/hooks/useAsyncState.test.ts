import { renderHookCompat, actCompat } from '../utils';
import { useAsyncState } from '../../src/hooks/useAsyncState';

describe('useAsyncState', () => {
  it('should initialize with default values', async () => {
    const { result } = await renderHookCompat(() => useAsyncState());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle successful async operation', async () => {
    const { result } = await renderHookCompat(() => useAsyncState<string>());
    const mockAsync = jest.fn().mockResolvedValue('success data');

    await actCompat(async () => {
      await result.current.run(mockAsync());
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success data');
    expect(result.current.error).toBeNull();
  });

  it('should handle failed async operation', async () => {
    const { result } = await renderHookCompat(() => useAsyncState<string>());
    const error = new Error('fail');
    const mockAsync = jest.fn().mockRejectedValue(error);

    await actCompat(async () => {
      try {
        await result.current.run(mockAsync());
      } catch (e) {
        // Expected
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
  });

  it('should set loading state while pending', async () => {
    const { result } = await renderHookCompat(() => useAsyncState<string>());
    let resolvePromise: (val: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    let runPromise: Promise<string | undefined>;
    await actCompat(async () => {
      runPromise = result.current.run(promise);
    });

    expect(result.current.isLoading).toBe(true);

    await actCompat(async () => {
      resolvePromise!('done');
      await runPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should not update state if unmounted', async () => {
    const { result, unmount } = await renderHookCompat(() => useAsyncState<string>());
    let resolvePromise: (val: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    let runPromise: Promise<string | undefined>;
    await actCompat(async () => {
      runPromise = result.current.run(promise);
    });
    expect(result.current.isLoading).toBe(true);

    unmount();

    await actCompat(async () => {
      resolvePromise!('done');
      await runPromise;
    });
  });
});
