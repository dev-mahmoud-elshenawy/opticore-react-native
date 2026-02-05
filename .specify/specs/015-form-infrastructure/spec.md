# Spec 015: Form Infrastructure

## Overview

**Priority**: P1 - CRITICAL
**Effort**: 8-10 hours
**Dependencies**: Spec 014 (stabilization), Error System, useDebounce hook
**Status**: Not Started

## Problem Statement

Every React Native application needs forms (login, registration, profile, search, checkout, etc.). Currently, consuming apps must implement their own form state management, validation, and input masking from scratch. This represents 30-40% of typical app boilerplate.

## Objectives

1. **Form state management** - Wrap react-hook-form with opinionated defaults
2. **Validation utilities** - Zod integration with common validators
3. **Input masking** - Phone, currency, credit card formatting
4. **Type safety** - Full TypeScript generics support
5. **No UI components** - Pure logic, works with any UI library

## User Stories

### US-015.1: Form State Hook (P1)
**As a** developer
**I want** a `useFormState` hook that manages form state
**So that** I don't have to configure react-hook-form manually

**Acceptance Criteria**:
- [ ] Hook wraps react-hook-form with defaults
- [ ] Supports generic types for form values
- [ ] Returns form state, errors, submit handler
- [ ] Integrates with Zod validation schemas
- [ ] Handles async validation with debounce

**Example Usage**:
```typescript
interface LoginForm {
  email: string;
  password: string;
}

const { form, errors, isSubmitting, handleSubmit } = useFormState<LoginForm>({
  schema: loginSchema,
  defaultValues: { email: '', password: '' },
});

await handleSubmit(async (data) => {
  await login(data.email, data.password);
});
```

### US-015.2: Validation Schema Builder (P1)
**As a** developer
**I want** helpers to build Zod validation schemas
**So that** I can define validations declaratively

**Acceptance Criteria**:
- [ ] Builder pattern for schema creation
- [ ] Common validators included (email, phone, password)
- [ ] Custom error messages support
- [ ] Conditional validation support

**Example Usage**:
```typescript
const loginSchema = createValidationSchema<LoginForm>((z) => ({
  email: validators.email('Please enter a valid email'),
  password: validators.password({ minLength: 8, requireUppercase: true }),
}));
```

### US-015.3: Input Masks (P2) - Phase B
**As a** developer
**I want** input masking utilities
**So that** I can format user input automatically

> **Implementation Note**: This user story can be implemented in a later phase.
> Phase A (core form state + validators) should be completed first.
> Masks add complexity and are not required for basic form functionality.

**Acceptance Criteria**:
- [ ] Phone mask with US format (international formats in future)
- [ ] Currency mask with USD (locale support in future)
- [ ] Credit card mask with basic card type detection (Visa, MC, Amex)
- [ ] Pure functions (no side effects)
- [ ] Unmask function to get raw value

**Example Usage**:
```typescript
// Phone
applyPhoneMask('4155551234', 'US') // → '(415) 555-1234'
unmaskPhone('(415) 555-1234') // → '4155551234'

// Currency
applyCurrencyMask(1234.56, { currency: 'USD' }) // → '$1,234.56'

// Credit Card
applyCreditCardMask('4111111111111111') // → '4111 1111 1111 1111'
detectCardType('4111111111111111') // → 'visa'
```

### US-015.4: Common Validators (P2)
**As a** developer
**I want** pre-built validators for common patterns
**So that** I don't have to write regex patterns

**Acceptance Criteria**:
- [ ] Email validator
- [ ] Phone validator (with country support)
- [ ] Password validator (configurable strength)
- [ ] Required, minLength, maxLength
- [ ] URL validator
- [ ] Custom regex validator

## Technical Approach

### Architecture

```
src/forms/
├── index.ts                 # Public exports
├── FormManager.ts           # Optional singleton for global config
├── useFormState.ts          # Main form hook
├── useFieldValidation.ts    # Per-field validation hook
├── ValidationBuilder.ts     # Schema builder utilities
├── masks/
│   ├── index.ts
│   ├── phoneMask.ts
│   ├── currencyMask.ts
│   └── creditCardMask.ts
├── validators/
│   ├── index.ts
│   ├── email.ts
│   ├── phone.ts
│   ├── password.ts
│   └── common.ts
└── types.ts                 # Type definitions
```

### Public API

```typescript
// ============== HOOKS ==============

export function useFormState<T extends FieldValues>(
  config: FormConfig<T>
): FormStateReturn<T>;

export function useFieldValidation<T>(
  value: T,
  validator: Validator<T>,
  options?: ValidationOptions
): FieldValidationReturn;

// ============== VALIDATION ==============

export function createValidationSchema<T>(
  builder: (z: typeof zod) => ZodRawShape
): ZodSchema<T>;

export const validators: {
  email: (message?: string) => ZodString;
  phone: (options?: PhoneValidatorOptions) => ZodString;
  password: (options?: PasswordValidatorOptions) => ZodString;
  required: <T>(message?: string) => ZodType<T>;
  minLength: (min: number, message?: string) => ZodString;
  maxLength: (max: number, message?: string) => ZodString;
  matches: (regex: RegExp, message?: string) => ZodString;
  url: (message?: string) => ZodString;
};

// ============== MASKS ==============

export function applyPhoneMask(value: string, format?: PhoneFormat): string;
export function unmaskPhone(value: string): string;

export function applyCurrencyMask(value: number, options?: CurrencyOptions): string;
export function unmaskCurrency(value: string, options?: CurrencyOptions): number;

export function applyCreditCardMask(value: string): string;
export function unmaskCreditCard(value: string): string;
export function detectCardType(value: string): CardType | null;

// ============== TYPES ==============

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
```

### Dependencies

**New**:
```json
{
  "react-hook-form": "^7.54.2"
}
```

**Existing** (already installed):
- `zod` - Validation schemas

**Internal**:
- Error system (ValidationError)
- useDebounce (for async validation)

## Files to Create

```
src/forms/
├── index.ts                     # 50 lines
├── useFormState.ts              # 150 lines
├── useFieldValidation.ts        # 80 lines
├── ValidationBuilder.ts         # 100 lines
├── masks/
│   ├── index.ts                 # 20 lines
│   ├── phoneMask.ts             # 80 lines
│   ├── currencyMask.ts          # 60 lines
│   └── creditCardMask.ts        # 100 lines
├── validators/
│   ├── index.ts                 # 30 lines
│   ├── email.ts                 # 30 lines
│   ├── phone.ts                 # 50 lines
│   ├── password.ts              # 80 lines
│   └── common.ts                # 60 lines
└── types.ts                     # 80 lines

test/forms/
├── useFormState.test.ts         # 200 lines
├── useFieldValidation.test.ts   # 100 lines
├── ValidationBuilder.test.ts    # 150 lines
├── masks/
│   ├── phoneMask.test.ts        # 100 lines
│   ├── currencyMask.test.ts     # 80 lines
│   └── creditCardMask.test.ts   # 100 lines
└── validators/
    ├── email.test.ts            # 50 lines
    ├── phone.test.ts            # 50 lines
    └── password.test.ts         # 80 lines

examples/forms/
└── FormExample.tsx              # Usage example
```

## Success Criteria

- [ ] TypeScript strict mode: 0 errors
- [ ] Test coverage: 80%+ for all new code
- [ ] JSDoc: 100% on public APIs
- [ ] Lint: 0 errors/warnings
- [ ] Build succeeds
- [ ] Example works in test app
- [ ] Integrates with existing error system
- [ ] No UI components (pure logic)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| react-hook-form version conflicts | Medium | Pin to stable version |
| Complex validation scenarios | Low | Provide escape hatches |
| Performance with many fields | Low | Use memo and debounce |

## Out of Scope

- UI input components
- Form layout components
- Server-side validation
- File upload handling (separate spec)

## Definition of Done

1. All user stories implemented
2. 80%+ test coverage
3. TypeScript strict mode passes
4. Integrated with main index.ts exports
5. Example created
6. CLAUDE.md updated
