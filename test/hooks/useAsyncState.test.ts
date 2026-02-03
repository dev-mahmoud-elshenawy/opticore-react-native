import { renderHook, act } from '@testing-library/react-native';
import { useAsyncState } from '../../src/hooks/useAsyncState';

describe('useAsyncState', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAsyncState());

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should handle successful async operation', async () => {
        const { result } = renderHook(() => useAsyncState<string>());
        const mockAsync = jest.fn().mockResolvedValue('success data');

        await act(async () => {
            await result.current.run(mockAsync());
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe('success data');
        expect(result.current.error).toBeNull();
    });

    it('should handle failed async operation', async () => {
        const { result } = renderHook(() => useAsyncState<string>());
        const error = new Error('fail');
        const mockAsync = jest.fn().mockRejectedValue(error);

        await act(async () => {
            try {
                await result.current.run(mockAsync());
            } catch (e) {
                // Expected
            }
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toEqual(error);
    });

    it('should set loading state while pending', async () => {
        const { result } = renderHook(() => useAsyncState<string>());
        let resolvePromise: (val: string) => void;
        const promise = new Promise<string>((resolve) => {
            resolvePromise = resolve;
        });

        let runPromise: Promise<string | undefined>;
        await act(async () => {
            runPromise = result.current.run(promise);
        });

        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            resolvePromise!('done');
            await runPromise;
        });

        expect(result.current.isLoading).toBe(false);
    });

    it('should not update state if unmounted', async () => {
        const { result, unmount } = renderHook(() => useAsyncState<string>());
        let resolvePromise: (val: string) => void;
        const promise = new Promise<string>((resolve) => {
            resolvePromise = resolve;
        });

        let runPromise: Promise<string | undefined>;
        await act(async () => {
            runPromise = result.current.run(promise);
        });
        expect(result.current.isLoading).toBe(true);

        unmount();

        await act(async () => {
            resolvePromise!('done');
            await runPromise;
        });
    });
});
