import { renderHook } from '@testing-library/react-native';
import { usePrevious } from '../../src/hooks/usePrevious';

describe('usePrevious', () => {
    it('should return undefined initially', () => {
        const { result } = renderHook(() => usePrevious('initial'));
        expect(result.current).toBeUndefined();
    });

    it('should return previous value after update', () => {
        const { result, rerender } = renderHook(({ val }: { val: any }) => usePrevious(val), {
            initialProps: { val: 'initial' }
        });

        rerender({ val: 'updated' });
        expect(result.current).toBe('initial');

        rerender({ val: 'third' });
        expect(result.current).toBe('updated');
    });
});
