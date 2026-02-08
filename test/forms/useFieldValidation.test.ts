
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFieldValidation } from '../../src/forms/useFieldValidation';

describe('useFieldValidation', () => {
    const validator = jest.fn();

    beforeEach(() => {
        validator.mockClear();
    });

    test('should initialize with valid state', async () => {
        const { result } = await renderHook(() => useFieldValidation('initial', validator));

        expect(result.current.isValid).toBe(true);
        expect(result.current.error).toBeUndefined();
        expect(result.current.isValidating).toBe(false);
    });

    test('should validate successfully', async () => {
        validator.mockResolvedValue(undefined); // No error means valid

        const { result } = await renderHook(() => useFieldValidation('valid', validator));

        await waitFor(() => {
            expect(result.current.isValid).toBe(true);
            expect(result.current.error).toBeUndefined();
        });

        expect(validator).toHaveBeenCalledWith('valid');
    });

    test('should set error state on validation failure', async () => {
        validator.mockResolvedValue('Invalid value');

        const { result } = await renderHook(() => useFieldValidation('invalid', validator));

        await waitFor(() => {
            expect(result.current.isValid).toBe(false);
            expect(result.current.error).toBe('Invalid value');
        });
    });

    test('should handle validation exceptions', async () => {
        validator.mockRejectedValue(new Error('Validation crashed'));

        const { result } = await renderHook(() => useFieldValidation('crash', validator));

        await waitFor(() => {
            expect(result.current.isValid).toBe(false);
            expect(result.current.error).toBe('Validation crashed');
        });
    });

    test('should debounce validation calls', async () => {
        jest.useFakeTimers();
        const { result, rerender } = await renderHook(
            ({ value }) => useFieldValidation(value, validator, { debounceMs: 500 }),
            { initialProps: { value: 'initial' } }
        );

        // Fast updates
        rerender({ value: 'up' });
        rerender({ value: 'update' });
        rerender({ value: 'updated' });

        // Should not have called validator yet
        expect(validator).not.toHaveBeenCalled();

        // Fast forward time
        await act(async () => {
            jest.advanceTimersByTime(500);
        });

        await waitFor(() => {
            expect(validator).toHaveBeenCalledTimes(1); // Only once for 'updated'
            expect(validator).toHaveBeenCalledWith('updated');
        });

        jest.useRealTimers();
    });
});
