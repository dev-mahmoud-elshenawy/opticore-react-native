import { renderHook } from '../utils';
import { usePrevious } from '../../src/hooks/usePrevious';

describe('usePrevious', () => {
  it('should return undefined initially', async () => {
    const { result } = await renderHook(() => usePrevious('initial'));
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after update', async () => {
    const { result, rerender } = await renderHook(({ val }: { val: any }) => usePrevious(val), {
      initialProps: { val: 'initial' },
    });

    await rerender({ val: 'updated' });
    expect(result.current).toBe('initial');

    await rerender({ val: 'third' });
    expect(result.current).toBe('updated');
  });
});
