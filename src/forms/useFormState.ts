
import { useForm, UseFormReturn, FieldValues, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormConfig, FormStateReturn } from './types';


/**
 * useFormState
 * 
 * A wrapper around react-hook-form's useForm hook that provides
 * opinionated defaults and integrates with Zod validation.
 * 
 * @param config Form configuration
 * @returns Form state and handlers
 */
export function useFormState<T extends FieldValues>(
    config: FormConfig<T>
): FormStateReturn<T> {
    const {
        schema,
        defaultValues,
        mode = 'onSubmit',
        reValidateMode = 'onChange',
    } = config;

    // Initialize useForm with zod resolver if schema is provided
    const form: UseFormReturn<T> = useForm<T>({
        defaultValues,
        mode,
        reValidateMode,
        resolver: schema ? zodResolver(schema) : undefined,
    });

    const {
        handleSubmit: rhfHandleSubmit,
        formState: { errors, isValid, isSubmitting, isDirty },
        reset,
        setValue,
        getValues, // Renamed to getValue in return interface for consistency
        watch,
        control,
        register,
    } = form;

    // Safe async submission wrapper
    const handleSafeSubmit = useCallback(async (
        onValid: SubmitHandler<T>,
        onInvalid?: SubmitErrorHandler<T>
    ): Promise<void> => {
        return rhfHandleSubmit(onValid, onInvalid)();
    }, [rhfHandleSubmit]);

    return {
        form,
        errors,
        isValid,
        isSubmitting,
        isDirty,
        handleSubmit: handleSafeSubmit,
        reset,
        setValue,
        getValue: getValues,
        watch,
        control,
        register,
    };
}
