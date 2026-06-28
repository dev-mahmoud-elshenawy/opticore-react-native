# Implementation Plan: Form Infrastructure

**Branch**: `feature/015-form-infrastructure`
**Date**: 2026-02-05
**Spec**: [spec.md](./spec.md)
**Dependencies**: Spec 014 (stabilization must be complete first)

## Summary

Provide form state management, validation, and input masking utilities without UI components. Wraps react-hook-form with opinionated defaults, integrates Zod for validation, and provides common input masks (phone, currency, credit card).

**Technical Approach**: Create `useFormState` hook wrapping react-hook-form, build validation schema helpers with Zod, implement pure input masking functions, provide pre-built validators for common patterns.

## Technical Context

- **New Dependency**: react-hook-form ^7.54.2
- **Existing Dependency**: zod (already installed)
- **Integration**: Error system (ValidationError), useDebounce hook
- **Pattern**: Pure utility functions, React hooks, no UI components
- **Target**: 80%+ test coverage

## Module Structure

```
src/forms/
├── index.ts                 # Public exports
├── useFormState.ts          # Main form hook (150 lines)
├── useFieldValidation.ts    # Field validation (80 lines)
├── ValidationBuilder.ts     # Zod helpers (100 lines)
├── masks/
│   ├── index.ts
│   ├── phoneMask.ts         # Phone formatting (80 lines)
│   ├── currencyMask.ts      # Currency formatting (60 lines)
│   └── creditCardMask.ts    # Card formatting (100 lines)
├── validators/
│   ├── index.ts
│   ├── email.ts             # Email validation (30 lines)
│   ├── phone.ts             # Phone validation (50 lines)
│   ├── password.ts          # Password validation (80 lines)
│   └── common.ts            # required, minLength, etc. (60 lines)
└── types.ts                 # Type definitions (80 lines)
```

## Public API

```typescript
// Hooks
export function useFormState<T extends FieldValues>(config: FormConfig<T>): FormStateReturn<T>;
export function useFieldValidation<T>(value: T, validator: Validator<T>): FieldValidationReturn;

// Validation
export function createValidationSchema<T>(builder: SchemaBuilder): ZodSchema<T>;
export const validators = {
  email,
  phone,
  password,
  required,
  minLength,
  maxLength,
  matches,
  url,
};

// Masks
export function applyPhoneMask(value: string, format?: PhoneFormat): string;
export function applyCurrencyMask(value: number, options?: CurrencyOptions): string;
export function applyCreditCardMask(value: string): string;
export function unmaskPhone(value: string): string;
export function unmaskCurrency(value: string): number;
export function detectCardType(value: string): CardType | null;
```

## Integration Points

- **Error System**: Use ValidationError for validation failures
- **useDebounce**: For debounced async validation
- **react-hook-form**: Wrapped by useFormState
- **Zod**: Used by ValidationBuilder

## Implementation Phases

**Phase 1: Dependencies** (15 min)

- Install react-hook-form

**Phase 2: Form State** (3-4 hours)

- useFormState hook
- useFieldValidation hook
- Type definitions

**Phase 3: Validation** (2-3 hours)

- ValidationBuilder
- Common validators (email, phone, password, required, etc.)

**Phase 4: Input Masks** (2-3 hours)

- Phone mask/unmask
- Currency mask/unmask
- Credit card mask + card type detection

**Phase 5: Tests** (2-3 hours)

- Hook tests
- Validation tests
- Mask tests

## Verification

```bash
npm test test/forms  # All tests pass
npm run type-check   # 0 errors
npm test -- --coverage  # ≥80% for forms module
```

## Success Criteria

- ✅ TypeScript strict mode: 0 errors
- ✅ Test coverage: 80%+
- ✅ All 30 tasks completed
- ✅ Integrated with main index.ts
- ✅ Example created
