import { renderHook } from '../utils';
import { useMount } from '../../src/hooks/useMount';

describe('useMount', () => {
  it('should call callback on mount', async () => {
    const fn = jest.fn();
    renderHook(() => useMount(fn));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
