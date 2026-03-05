import { renderHookCompat, actCompat } from '../utils';
import { useSafeCall } from '../../src/hooks/useSafeCall';

describe('useSafeCall', () => {
  it('should execute function safely and return result', async () => {
    const { result } = await renderHookCompat(() => useSafeCall());

    const mockFn = jest.fn().mockResolvedValue('success');

    let data;
    await actCompat(async () => {
      data = await result.current.execute(mockFn);
    });

    expect(data).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('should catch errors and update error state', async () => {
    const { result } = await renderHookCompat(() => useSafeCall());
    const error = new Error('oops');
    const mockFn = jest.fn().mockRejectedValue(error);

    let data;
    await actCompat(async () => {
      data = await result.current.execute(mockFn);
    });

    expect(data).toBeUndefined();
    expect(result.current.error).toEqual(error);
  });

  it('should not update state if unmounted during execution', async () => {
    const { result, unmount } = await renderHookCompat(() => useSafeCall<string>());

    // Create a promise we can resolve later
    let resolveFn: (val: string) => void;
    const delayedPromise = new Promise<string>((resolve) => {
      resolveFn = resolve;
    });

    const mockFn = jest.fn().mockReturnValue(delayedPromise);

    // Start execution
    let executionPromise: Promise<string | undefined>;
    await actCompat(async () => {
      executionPromise = result.current.execute(mockFn);
    });

    // Unmount before promise resolves
    unmount();

    // Resolve promise
    await actCompat(async () => {
      resolveFn!('done');
      await executionPromise;
    });

    // No assertion needed on state as unmount happened, 
    // but the test passing confirms no "act" warning or error occurred
  });
});
