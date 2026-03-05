
import { z, ZodSchema } from 'zod';
import { SchemaBuilder, PhoneValidatorOptions, PasswordValidatorOptions, PhoneFormat } from './types';

/**
 * Creates a Zod validation schema using a builder function.
 * @param builder Function that returns a Zod shape
 */
export function createValidationSchema<T>(builder: SchemaBuilder): ZodSchema<T> {
    const shape = builder(z);
    return z.object(shape) as unknown as ZodSchema<T>;
}

// Common Validators

export const email = (message: string = 'Invalid email address') =>
    z.string().email(message);

export const phone = (options: PhoneValidatorOptions = {}) => {
    const { required = true, message = 'Invalid phone number', format = PhoneFormat.US } = options;

    const schema = z.string();

    if (!required) {
        return schema.optional().or(z.literal(''));
    }

    return schema.refine((val: string) => {
        if (!val) return false;
        // Basic US phone regex: (123) 456-7890 or 123-456-7890 or 1234567890
        const usPhoneRegex = /^(\+?1[-.]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        // International E.164: min 7 digits total (e.g. +1234567), max 15
        const intlPhoneRegex = /^\+?[1-9]\d{6,14}$/;

        return format === PhoneFormat.US ? usPhoneRegex.test(val) : intlPhoneRegex.test(val);
    }, { message });
};

export const password = (options: PasswordValidatorOptions = {}) => {
    const {
        required = true,
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecial = true,
    } = options;

    const schema = z.string();

    if (!required) {
        return schema.optional().or(z.literal(''));
    }

    return schema
        .min(minLength, `Password must be at least ${minLength} characters`)
        .refine((val: string) => !requireUppercase || /[A-Z]/.test(val), { message: 'Must contain an uppercase letter' })
        .refine((val: string) => !requireLowercase || /[a-z]/.test(val), { message: 'Must contain a lowercase letter' })
        .refine((val: string) => !requireNumbers || /\d/.test(val), { message: 'Must contain a number' })
        .refine((val: string) => !requireSpecial || /[!@#$%^&*(),.?":{}|<>]/.test(val), { message: 'Must contain a special character' });
};

export const common = {
    required: (message: string = 'Required') => z.string().min(1, message),
    minLength: (min: number, message?: string) => z.string().min(min, message),
    maxLength: (max: number, message?: string) => z.string().max(max, message),
    matches: (regex: RegExp, message: string = 'Invalid format') => z.string().regex(regex, message),
    url: (message: string = 'Invalid URL') => z.string().url(message),
};

export const validators = {
    email,
    phone,
    password,
    ...common
};
