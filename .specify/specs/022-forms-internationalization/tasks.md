# Tasks: Forms Internationalization

**Spec**: 022 | **Branch**: `feature/022-forms-internationalization`

---

## Phase 1: Types & Locale Definitions [US1, US2, US3]

- [ ] T001 [P] Add `CurrencyLocaleConfig` type to `src/forms/types.ts`: `{ decimalSeparator, thousandsSeparator, symbolPosition, symbol }`
- [ ] T002 [P] Add `PhoneLocaleConfig` type to `src/forms/types.ts`: `{ pattern, prefix?, maxDigits }`
- [ ] T003 [P] Add `CardPattern` type to `src/forms/types.ts`: `{ pattern: RegExp, name: string, grouping: number[] }`
- [ ] T004 [P] Extend `CardType` enum with `UNIONPAY`, `JCB`, `DINERS`
- [ ] T005 Add currency locale lookup table (en-US, de-DE, fr-FR, ja-JP, pt-BR) to `src/forms/masks/currencyMask.ts`
- [ ] T006 Add phone locale lookup table (US, GB, DE, FR, JP, BR) to `src/forms/masks/phoneMask.ts`
- [ ] T007 Run `npm run type-check` — verify 0 errors

**Checkpoint**: All types and lookup tables defined.

---

## Phase 2: Currency Mask Locale Support [US1]

- [ ] T008 [US1] Write test: `applyCurrencyMask('1234.56')` with no options → `$1,234.56` (existing behavior)
- [ ] T009 [US1] Write test: `applyCurrencyMask('1234.56', { locale: 'de-DE', currency: 'EUR' })` → `1.234,56 EUR`
- [ ] T010 [US1] Write test: `unmaskCurrency('1.234,56 EUR', { locale: 'de-DE' })` → `1234.56`
- [ ] T011 [US1] Write test: `applyCurrencyMask('1234', { locale: 'ja-JP', currency: 'JPY', precision: 0 })` → `\u00A51,234`
- [ ] T012 [US1] Write test: `unmaskCurrency('$1,234.56')` with no options → `1234.56` (existing behavior)
- [ ] T013 [US1] Modify `src/forms/masks/currencyMask.ts` — add locale parameter to `applyCurrencyMask()`
- [ ] T014 [US1] Modify `unmaskCurrency()` — use locale's decimal separator for parsing
- [ ] T015 [US1] Run currency mask tests — verify all pass

**Checkpoint**: Currency mask handles 5 locales.

---

## Phase 3: Phone Mask Multi-Locale [US2]

- [ ] T016 [US2] Write test: `applyPhoneMask('4155552671')` → `(415) 555-2671` (existing behavior)
- [ ] T017 [US2] Write test: `applyPhoneMask('07911123456', { locale: 'en-GB' })` → `07911 123456`
- [ ] T018 [US2] Write test: `applyPhoneMask('015112345678', { locale: 'de-DE' })` → `0151 12345678`
- [ ] T019 [US2] Write test: `applyPhoneMask('0612345678', { locale: 'fr-FR' })` → `06 12 34 56 78`
- [ ] T020 [US2] Write test: `unmaskPhone('07911 123456')` → `07911123456`
- [ ] T021 [US2] Modify `src/forms/masks/phoneMask.ts` — add locale parameter, pattern-based formatting
- [ ] T022 [US2] Run phone mask tests — verify all pass

**Checkpoint**: Phone mask handles 5+ countries.

---

## Phase 4: Credit Card Extensions & Luhn [US3]

- [ ] T023 [US3] Write test: `detectCardType('6212345678901234')` → `'unionpay'`
- [ ] T024 [US3] Write test: `detectCardType('3512345678901234')` → `'jcb'`
- [ ] T025 [US3] Write test: `validateCardNumber('4111111111111111')` → `true` (Luhn valid)
- [ ] T026 [US3] Write test: `validateCardNumber('4111111111111112')` → `false` (Luhn invalid)
- [ ] T027 [US3] Write test: custom card pattern registration
- [ ] T028 [US3] Write test: existing Visa/MC/Amex/Discover detection unchanged
- [ ] T029 [US3] Add UnionPay, JCB, Diners detection to `src/forms/masks/creditCardMask.ts`
- [ ] T030 [US3] Implement `validateCardNumber()` with Luhn algorithm in `src/forms/masks/creditCardMask.ts`
- [ ] T031 [US3] Add custom card pattern support (accept `CardPattern[]` param)
- [ ] T032 [US3] Run credit card tests — verify all pass

**Checkpoint**: 7+ card types + Luhn validation.

---

## Phase 5: Exports & Polish

- [ ] T033 [P] Update `src/forms/types.ts` exports
- [ ] T034 [P] Update `src/forms/index.ts` — export `validateCardNumber`, `CurrencyLocaleConfig`, `PhoneLocaleConfig`, `CardPattern`
- [ ] T035 Run full test suite: `npm test`
- [ ] T036 Run `npm run type-check` — verify 0 errors
- [ ] T037 Run `npm run lint` — verify 0 errors
- [ ] T038 Verify coverage: 80%+ on all mask files

**Checkpoint**: Forms internationalization complete.

---

## Dependencies

- Phase 1 → Phase 2, 3, 4 (types before implementations)
- Phases 2, 3, 4 can run in parallel (independent mask files)
- All → Phase 5
