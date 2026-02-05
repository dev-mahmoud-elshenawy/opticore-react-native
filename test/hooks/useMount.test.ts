import { renderHook, act } from '../utils';
import { useMount } from '../../src/hooks/useMount';

describe('useMount', () => {
  it('should call callback on mount', async () => {
    const fn = jest.fn();
    await act(async () => {
      await renderHook(() => useMount(fn));
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
