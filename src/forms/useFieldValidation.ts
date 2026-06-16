
import { useState, useCallback, useEffect, useRef } from 'react';
import { FieldValidationReturn, Validator, ValidationOptions } from './types';
import { useDebounce } from '../hooks/useDebounce';

/**
 * useFieldValidation
 * 
 * Hook for validating individual fields, supporting async validation
 * and debouncing.
 *
 * NOTE: pass a STABLE `validator` reference (module-level or `useCallback`'d).
 * An inline function is a new identity each render, so the auto-validate effect
 * would re-run on every render instead of only when the debounced value changes.
 *
 * @param value The value to validate
 * @param validator The validation function
 * @param options Validation options (debounceMs, message)
 */
export function useFieldValidation<T>(
    value: T,
    validator: Validator<T>,
    options: ValidationOptions = {}
): FieldValidationReturn {
    const { debounceMs = 300 } = options;
    const [error, setError] = useState<string | undefined>(undefined);
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState(true);

    // Debounced value for validation
    const debouncedValue = useDebounce(value, debounceMs);

    // Don't show a validation error for an untouched, empty field on mount.
    // We skip only the FIRST auto-validation, and only when the field started
    // empty — a pre-filled field is still validated on mount.
    const hasAutoValidated = useRef(false);
    const startedEmpty = useRef(value === undefined || value === null || (value as unknown) === '');

    const validate = useCallback(async () => {
        setIsValidating(true);
        try {
            const validationError = await validator(debouncedValue);
            setError(validationError);
            setIsValid(!validationError);
            return !validationError;
        } catch (err) {
            // If validator throws, treat as validation error
            const message = err instanceof Error ? err.message : 'Validation failed';
            setError(message);
            setIsValid(false);
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [debouncedValue, validator]);

    // Auto-validate when debounced value changes
    useEffect(() => {
        if (!hasAutoValidated.current) {
            hasAutoValidated.current = true;
            // Skip the mount validation for a field that started empty.
            if (startedEmpty.current) {
                return;
            }
        }
        validate();
    }, [validate]);

    return {
        error,
        isValid,
        isValidating,
        validate
    };
}
