import { renderHook } from '@testing-library/react-native';
import { useMount } from '../../src/hooks/useMount';

describe('useMount', () => {
  it('should call callback on mount', () => {
    const fn = jest.fn();
    renderHook(() => useMount(fn));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
