# Feature Specification: Forms Internationalization

**Spec Number**: 022
**Feature Branch**: `feature/022-forms-internationalization`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P1
**Input**: Code Review 2026-02-11, Sections 10 (Forms Infrastructure), 16B (Hardcoded Values)

## Problem Statement

The Forms module has 3 internationalization issues that limit reuse:

1. **Phone mask is US-only** - `applyPhoneMask()` only formats as `(123) 456-7890` or `+1234567890`. No support for UK (`07911 123456`), Germany (`0151 12345678`), France (`06 12 34 56 78`), or other formats.
2. **Currency mask breaks for EU locales** - `unmaskCurrency()` strips everything except digits and `.`, which destroys EU amounts using `,` as decimal separator (e.g., `1.234,56` -> `1.23456` instead of `1234.56`).
3. **Credit card mask limited** - Only detects Visa/MC/Amex/Discover. No support for UnionPay (62xx), JCB (35xx), Elo, Diners, or custom patterns. No Luhn checksum validation.

---

## User Scenarios & Testing

### User Story 1 - Locale-Aware Currency Mask (Priority: P1)

The currency mask correctly handles both US format (`$1,234.56`) and EU format (`1.234,56 EUR`) based on a locale/options parameter.

**Why this priority**: Currency handling bugs cause financial data corruption - the highest risk issue.

**Independent Test**: Call `applyCurrencyMask('1234.56', { locale: 'de-DE', currency: 'EUR' })` and verify output is `1.234,56 EUR`. Call `unmaskCurrency('1.234,56 EUR', { locale: 'de-DE' })` and verify output is `1234.56`.

**Acceptance Scenarios**:

1. **Given** `locale: 'en-US'`, **When** `applyCurrencyMask('1234.56')`, **Then** output is `$1,234.56`.
2. **Given** `locale: 'de-DE'`, **When** `applyCurrencyMask('1234.56', { locale: 'de-DE', currency: 'EUR' })`, **Then** output is `1.234,56 EUR` (or `1.234,56 \u20AC`).
3. **Given** `locale: 'de-DE'`, **When** `unmaskCurrency('1.234,56 EUR', { locale: 'de-DE' })`, **Then** output is `1234.56` (number-safe string).
4. **Given** `locale: 'ja-JP'`, **When** `applyCurrencyMask('1234', { locale: 'ja-JP', currency: 'JPY', precision: 0 })`, **Then** output is `\u00A51,234` (no decimals for Yen).
5. **Given** no locale specified, **When** mask is applied, **Then** defaults to `en-US` / `USD` (backward compatible).

---

### User Story 2 - Configurable Phone Mask Patterns (Priority: P1)

The phone mask accepts a format pattern or locale that determines the grouping and formatting of phone digits.

**Why this priority**: Phone formatting is the most visible mask to users and varies dramatically by country.

**Independent Test**: Call `applyPhoneMask('07911123456', { locale: 'en-GB' })` and verify output is `07911 123456`.

**Acceptance Scenarios**:

1. **Given** `format: PhoneFormat.US`, **When** `applyPhoneMask('4155552671')`, **Then** output is `(415) 555-2671` (existing behavior preserved).
2. **Given** `format: PhoneFormat.INTERNATIONAL`, **When** `applyPhoneMask('+14155552671')`, **Then** output is `+1 415 555 2671`.
3. **Given** `locale: 'en-GB'`, **When** `applyPhoneMask('07911123456', { locale: 'en-GB' })`, **Then** output is `07911 123456`.
4. **Given** `locale: 'de-DE'`, **When** `applyPhoneMask('015112345678', { locale: 'de-DE' })`, **Then** output is `0151 12345678`.
5. **Given** a custom pattern `{ pattern: '#### #### ####', prefix: '+81' }`, **When** `applyPhoneMask('312345678', { customPattern: ... })`, **Then** output follows the custom pattern.
6. **Given** `unmaskPhone('(415) 555-2671')`, **When** called, **Then** output is `4155552671` (existing behavior preserved).

---

### User Story 3 - Extensible Credit Card Detection & Luhn (Priority: P2)

The credit card mask supports additional card networks and validates card numbers using the Luhn algorithm.

**Why this priority**: Missing card types blocks usage in markets with UnionPay/JCB dominance. Luhn is a data quality improvement.

**Independent Test**: Call `detectCardType('6212345678901234')` and verify it returns `'unionpay'`. Call `validateCardNumber('4111111111111111')` and verify `true`. Call `validateCardNumber('4111111111111112')` and verify `false`.

**Acceptance Scenarios**:

1. **Given** a number starting with `62`, **When** `detectCardType()` is called, **Then** it returns `'unionpay'`.
2. **Given** a number starting with `35`, **When** `detectCardType()` is called, **Then** it returns `'jcb'`.
3. **Given** a custom card pattern `{ pattern: /^504/, name: 'elo', grouping: [4,4,4,4] }`, **When** registered via config, **Then** `detectCardType('5041234567890')` returns `'elo'`.
4. **Given** a valid Visa number `4111111111111111`, **When** `validateCardNumber()` is called, **Then** it returns `true` (passes Luhn).
5. **Given** an invalid number `4111111111111112`, **When** `validateCardNumber()` is called, **Then** it returns `false` (fails Luhn).
6. **Given** `applyCreditCardMask('6212345678901234')`, **When** called, **Then** output is `6212 3456 7890 1234` (UnionPay 4-4-4-4 grouping).
7. **Given** existing Visa/MC/Amex/Discover numbers, **When** masks are applied, **Then** existing behavior is preserved.

---

### Edge Cases

- What happens when currency input has both `.` and `,`? (Disambiguate based on locale)
- What happens when phone input exceeds max digits for the locale? (Truncate to max)
- What happens when a credit card number doesn't match any known pattern? (Return `'unknown'`, still apply 4-4-4-4 grouping)
- What happens when `customPattern` is malformed? (Ignore and use default)
- What happens when Luhn validation is called on a partial number? (Return false, validation is for complete numbers only)

---

## Requirements

### Functional Requirements

- **FR-001**: `CurrencyOptions` MUST include `locale`, `decimalSeparator`, `thousandsSeparator` properties.
- **FR-002**: `unmaskCurrency()` MUST correctly parse both `.` and `,` decimal separators based on locale.
- **FR-003**: `PhoneFormat` enum MUST be extended or replaced with a locale-based system supporting at least US, GB, DE, FR, JP, BR.
- **FR-004**: `applyPhoneMask()` MUST accept an optional locale or custom pattern parameter.
- **FR-005**: `CardType` enum MUST include `UNIONPAY`, `JCB`, `DINERS` in addition to existing types.
- **FR-006**: `detectCardType()` MUST support custom card patterns registered via configuration.
- **FR-007**: A new `validateCardNumber(number: string): boolean` function MUST implement Luhn algorithm.
- **FR-008**: All existing mask function signatures MUST remain backward compatible (new params are optional).
- **FR-009**: Default behavior (no locale/options) MUST match current behavior exactly.
- **FR-010**: `CoreConfig.forms` (Spec 018) MUST accept `defaultPhoneFormat`, `defaultCurrency`, `customCardPatterns`.

### Key Entities

- **PhoneLocale**: Locale-specific phone formatting rules
- **CurrencyLocale**: Locale-specific currency formatting rules (decimal, thousands, symbol position)
- **CardPattern**: Custom card type definition (regex, name, grouping)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Currency mask correctly handles at least 5 locales (en-US, de-DE, fr-FR, ja-JP, pt-BR).
- **SC-002**: Phone mask correctly formats at least 5 country formats.
- **SC-003**: Credit card detection supports at least 7 card networks.
- **SC-004**: Luhn validation passes standard test vectors.
- **SC-005**: All existing mask tests pass without modification (backward compatible).
- **SC-006**: 80%+ test coverage on all mask files.

---

## Files to Create/Modify

- `src/forms/masks/currencyMask.ts` - Locale-aware formatting and unmasking
- `src/forms/masks/phoneMask.ts` - Locale/pattern-based phone formatting
- `src/forms/masks/creditCardMask.ts` - Extended card types, Luhn validation
- `src/forms/types.ts` - PhoneLocale, CurrencyLocale, CardPattern types, extended enums
- `test/forms/masks/currencyMask.test.ts` - Multi-locale tests
- `test/forms/masks/phoneMask.test.ts` - Multi-locale tests
- `test/forms/masks/creditCardMask.test.ts` - Extended card types, Luhn tests
