import { renderHook, act } from '../utils';
import { useSafeCall } from '../../src/hooks/useSafeCall';

describe('useSafeCall', () => {
  it('should execute function safely and return result', async () => {
    const { result } = await renderHook(() => useSafeCall());

    const mockFn = jest.fn().mockResolvedValue('success');

    let data;
    await act(async () => {
      data = await result.current.execute(mockFn);
    });

    expect(data).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('should catch errors and update error state', async () => {
    const { result } = await renderHook(() => useSafeCall());
    const error = new Error('oops');
    const mockFn = jest.fn().mockRejectedValue(error);

    let data;
    await act(async () => {
      data = await result.current.execute(mockFn);
    });

    expect(data).toBeUndefined();
    expect(result.current.error).toEqual(error);
  });
});
