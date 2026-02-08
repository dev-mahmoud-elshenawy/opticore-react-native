import { renderHookCompat, actCompat } from '../utils';
import { useMount } from '../../src/hooks/useMount';

describe('useMount', () => {
  it('should call callback on mount', async () => {
    const fn = jest.fn();
    await actCompat(async () => {
      await renderHookCompat(() => useMount(fn));
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
