
import {
    UseFormReturn,
    FieldErrors,
    SubmitHandler,
    SubmitErrorHandler,
    UseFormSetValue,
    UseFormGetValues,
    UseFormWatch,
    FieldValues,
    DefaultValues
} from 'react-hook-form';
import { ZodSchema, ZodType, ZodString, ZodRawShape } from 'zod';

export type Validator<T> = (value: T) => string | undefined | Promise<string | undefined>;

export interface ValidationOptions {
    debounceMs?: number;
    message?: string;
}

export interface FieldValidationReturn {
    error: string | undefined;
    isValid: boolean;
    isValidating: boolean;
    validate: () => Promise<boolean>;
}

export enum PhoneFormat {
    US = 'US',
    INTERNATIONAL = 'INTERNATIONAL'
}

export enum CardType {
    VISA = 'visa',
    MASTERCARD = 'mastercard',
    AMEX = 'amex',
    DISCOVER = 'discover',
    UNIONPAY = 'unionpay',
    JCB = 'jcb',
    DINERS = 'diners',
    UNKNOWN = 'unknown'
}

export interface CurrencyLocaleConfig {
    decimalSeparator: string;
    thousandsSeparator: string;
    symbolPosition: 'before' | 'after';
    symbol: string;
}

export interface PhoneLocaleConfig {
    pattern: string;
    prefix?: string;
    maxDigits: number;
}

export interface CardPattern {
    pattern: RegExp;
    name: string;
    grouping: number[];
}

export interface CurrencyOptions {
    currency?: string;     // Default: USD
    locale?: string;      // Default: en-US
    symbol?: string;      // Default by locale
    precision?: number;   // Default: 2
}

export interface FormConfig<T extends FieldValues> {
    schema?: ZodSchema<T>;
    defaultValues?: DefaultValues<T>;
    mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
    reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit';
}

export interface FormStateReturn<T extends FieldValues> {
    form: UseFormReturn<T>;
    errors: FieldErrors<T>;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
    handleSubmit: (onValid: SubmitHandler<T>, onInvalid?: SubmitErrorHandler<T>) => Promise<void>;
    reset: (values?: DefaultValues<T>) => void;
    setValue: UseFormSetValue<T>;
    getValue: UseFormGetValues<T>;
    watch: UseFormWatch<T>;
}

export type {
    UseFormReturn,
    FieldErrors,
    SubmitHandler,
    SubmitErrorHandler,
    UseFormSetValue,
    UseFormGetValues,
    UseFormWatch,
    FieldValues,
    DefaultValues,
    ZodSchema,
    ZodType,
    ZodString,
    ZodRawShape
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- z is the Zod namespace object; its full type is not publicly exported from zod
export type SchemaBuilder = (z: any) => ZodRawShape;

export interface PhoneValidatorOptions {
    required?: boolean;
    message?: string;
    format?: PhoneFormat;
}

export interface PasswordValidatorOptions {
    required?: boolean;
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecial?: boolean;
    message?: string;
}
