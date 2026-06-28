
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFormState } from '../../src/forms/useFormState';
import { z } from 'zod';

describe('useFormState', () => {
    const schema = z.object({
        email: z.string().email('Invalid email'),
        age: z.number().min(18, 'Must be 18+'),
    });

    const defaultValues = {
        email: 'test@example.com',
        age: 20,
    };

    test('should initialize with default values', async () => {
        const { result } = await renderHook(() => useFormState({
            defaultValues,
            schema,
        }));

        expect(result.current.getValue('email')).toBe(defaultValues.email);
        expect(result.current.getValue('age')).toBe(defaultValues.age);
        expect(result.current.isDirty).toBe(false);
    });

    test('should validate on submit with valid data', async () => {
        const { result } = await renderHook(() => useFormState({
            defaultValues,
            schema,
        }));

        const onSubmit = jest.fn();

        await act(async () => {
            await result.current.submit(onSubmit);
        });

        expect(onSubmit).toHaveBeenCalledWith(defaultValues, undefined);
        expect(result.current.isValid).toBe(true);
        expect(result.current.errors).toEqual({});
    });

    test('should validate on submit with invalid data', async () => {
        const { result } = await renderHook(() => useFormState({
            defaultValues: { email: 'invalid', age: 10 },
            schema,
        }));

        const onSubmit = jest.fn();

        await act(async () => {
            await result.current.submit(onSubmit);
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(result.current.isValid).toBe(false);
        expect(result.current.errors.email?.message).toBe('Invalid email');
        expect(result.current.errors.age?.message).toBe('Must be 18+');
    });

    test('should update value via setValue', async () => {
        const { result } = await renderHook(() => useFormState({
            defaultValues,
            schema,
        }));

        await act(async () => {
            result.current.setValue('email', 'new@example.com', { shouldDirty: true });
        });

        expect(result.current.getValue('email')).toBe('new@example.com');
        await waitFor(() => expect(result.current.isDirty).toBe(true));
    });

    test('should reset form to default values', async () => {
        const { result } = await renderHook(() => useFormState({
            defaultValues,
            schema,
        }));

        await act(async () => {
            result.current.setValue('email', 'dirty@example.com', { shouldDirty: true });
        });

        await waitFor(() => expect(result.current.isDirty).toBe(true));

        await act(async () => {
            result.current.reset();
        });

        expect(result.current.getValue('email')).toBe(defaultValues.email);
        await waitFor(() => expect(result.current.isDirty).toBe(false));
    });

    test('should maintain referential stability of submit', async () => {
        const { result, rerender } = await renderHook(() => useFormState({
            defaultValues,
            schema,
        }));

        const initialSubmit = result.current.submit;

        // Force re-render
        rerender({});

        expect(result.current.submit).toBe(initialSubmit);
    });

    test('field() binds value/onChangeText/error and validates on change', async () => {
        const { result } = await renderHook(() => useFormState({
            defaultValues,
            schema,
        }));

        expect(result.current.field('email').value).toBe(defaultValues.email);

        await act(async () => {
            result.current.field('email').onChangeText('not-an-email');
        });

        await waitFor(() => expect(result.current.field('email').error).toBe('Invalid email'));
    });
});
