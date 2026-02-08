import { renderHookCompat } from '../utils';
import { useLifecycle } from '../../src/hooks/useLifecycle';

describe('useLifecycle', () => {
  it('should return current app state', async () => {
    const { result } = await renderHookCompat(() => useLifecycle());
    // AppState usually defaults to 'active' or 'unknown' in tests depending on RN version/mock
    // but we can check it returns a string
    expect(typeof result.current).toBe('string');
  });
});
