import { renderHook, act } from '../utils';
import { useDebounce } from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
  jest.useFakeTimers();

  it('should return initial value immediately', async () => {
    const { result } = await renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', async () => {
    const { result, rerender } = await renderHook(({ val }: { val: any }) => useDebounce(val, 500), {
      initialProps: { val: 'initial' },
    });

    await rerender({ val: 'updated' });
    // Should still be initial
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('updated');
  });
});
