import {
  useForm,
  UseFormReturn,
  FieldValues,
  Path,
  PathValue,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormConfig, FormStateReturn, FieldBinding } from './types';

/**
 * useFormState — a simple forms facade over React Hook Form.
 *
 * App code uses `field()` (input binding) and `submit()` (validate + run); it never
 * touches RHF's `control`/`register`/`handleSubmit`. Drop to `form` only for advanced
 * cases. Validation is Zod via `config.schema`.
 *
 * @param config Form configuration
 * @returns The forms facade
 */
export function useFormState<T extends FieldValues>(config: FormConfig<T>): FormStateReturn<T> {
  const { schema, defaultValues, mode = 'onSubmit', reValidateMode = 'onChange' } = config;

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
    trigger,
  } = form;

  // RN binding for a text field: `<TextInput {...field('email')} />`.
  // `watch(name)` subscribes the component, so the value stays reactive.
  const field = useCallback(
    (name: Path<T>): FieldBinding => ({
      value: String(watch(name) ?? ''),
      onChangeText: (text: string) =>
        setValue(name, text as PathValue<T, Path<T>>, {
          shouldValidate: true,
          shouldDirty: true,
        }),
      onBlur: () => {
        void trigger(name);
      },
      error: (errors as Record<string, { message?: string } | undefined>)[name]?.message,
    }),
    [watch, setValue, trigger, errors]
  );

  // Validate, then run onValid if valid. Call it (don't pre-call at render).
  const submit = useCallback(
    (onValid: SubmitHandler<T>, onInvalid?: SubmitErrorHandler<T>): Promise<void> =>
      rhfHandleSubmit(onValid, onInvalid)(),
    [rhfHandleSubmit]
  );

  return {
    field,
    submit,
    errors,
    isValid,
    isSubmitting,
    isDirty,
    reset,
    setValue,
    getValue: getValues,
    watch,
    form,
  };
}
