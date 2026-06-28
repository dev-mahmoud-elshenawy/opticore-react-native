# Implementation Plan: Forms Internationalization

**Branch**: `feature/022-forms-internationalization` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Make form masks locale-aware: (1) Currency mask handles EU decimal comma and symbol position, (2) Phone mask supports 5+ country formats via locale patterns, (3) Credit card detection extended to 7+ networks with custom pattern support, (4) Luhn checksum validation added. All existing behavior preserved as defaults.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: None (pure string manipulation, no i18n library needed)
**Testing**: Jest ^29
**Target Platform**: iOS & Android

## Constitution Check

| Principle           | Status | Notes                                    |
| ------------------- | ------ | ---------------------------------------- |
| Pure Infrastructure | PASS   | Masks are pure utility functions         |
| TypeScript Strict   | PASS   | Locale types fully typed                 |
| Zero Dependencies   | PASS   | No new dependencies needed               |
| Backward Compat     | PASS   | Default params preserve current behavior |

## Source Code Structure

```
src/forms/
├── masks/
│   ├── currencyMask.ts       [MODIFY] Locale-aware decimal/thousands handling
│   ├── phoneMask.ts          [MODIFY] Multi-locale patterns
│   └── creditCardMask.ts     [MODIFY] Extended card types + Luhn
├── types.ts                  [MODIFY] PhoneLocale, CurrencyLocale, CardPattern types
└── index.ts                  [MODIFY] Export new types

test/forms/masks/
├── currencyMask.test.ts      [MODIFY] Multi-locale tests (en-US, de-DE, fr-FR, ja-JP, pt-BR)
├── phoneMask.test.ts         [MODIFY] Multi-locale tests (US, GB, DE, FR, JP)
└── creditCardMask.test.ts    [MODIFY] Extended cards + Luhn tests
```

## Approach

1. **Currency mask**: Add `decimalSeparator` and `thousandsSeparator` to `CurrencyOptions`. Default: `.` and `,` (US). For `de-DE`: `,` and `.`. `unmaskCurrency()` uses the locale's decimal separator to parse correctly. Use lookup table for 5 locales rather than `Intl.NumberFormat` to avoid RN compatibility issues.

2. **Phone mask**: Define `PhoneLocaleConfig` with `{ pattern: string, prefix?: string, maxDigits: number }` for each locale. Lookup table: US `(###) ###-####`, GB `##### ######`, DE `#### ########`, FR `## ## ## ## ##`, JP `###-####-####`, BR `(##) #####-####`. `applyPhoneMask()` accepts optional `locale` param.

3. **Credit card**: Extend card detection regex table with UnionPay (`/^62/`), JCB (`/^35/`), Diners (`/^(36|38)/`). Add `customCardPatterns` array support. Implement Luhn algorithm as standalone `validateCardNumber()` function.

4. **Backward compat**: All new params are optional. Default behavior matches current (US phone, USD currency, 4 card types).
