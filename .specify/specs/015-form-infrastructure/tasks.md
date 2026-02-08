# Tasks: Form Infrastructure

**Input**: Design documents from `/specs/015-form-infrastructure/`
**Prerequisites**: Spec 014 complete, branch created

## Phase 1: Dependencies (15 min)

- [ ] T015.1 Install react-hook-form: `npm install react-hook-form@^7.54.2`
- [ ] T015.2 Verify zod is installed (should already be in package.json)

---

## Phase 2: Type Definitions (1 hour)

- [ ] T015.3 Create `src/forms/types.ts` with core types:
  - FormConfig<T>
  - FormStateReturn<T>
  - FieldValidationReturn
  - ValidationOptions
  - PhoneFormat, CurrencyOptions, CardType enums

---

## Phase 3: Form State Hook (3-4 hours)

- [ ] T015.4 Create `src/forms/useFormState.ts`:
  - Wrap useForm from react-hook-form
  - Add zodResolver integration
  - Add handleSubmit wrapper
  - Add reset, setValue, getValue helpers
- [ ] T015.5 Create `src/forms/useFieldValidation.ts`:
  - Individual field validation
  - Debounced validation support
  - Error state management
- [ ] T015.6 [P] Write tests: `test/forms/useFormState.test.ts`
- [ ] T015.7 [P] Write tests: `test/forms/useFieldValidation.test.ts`

**Verification**: Form hooks work with mock schemas

---

## Phase 4: Validation Builder (2-3 hours)

- [ ] T015.8 Create `src/forms/ValidationBuilder.ts`:
  - createValidationSchema<T>() function
  - Schema builder helpers
- [ ] T015.9 Create `src/forms/validators/email.ts` - Email validator
- [ ] T015.10 [P] Create `src/forms/validators/phone.ts` - Phone validator
- [ ] T015.11 [P] Create `src/forms/validators/password.ts` - Password strength
- [ ] T015.12 [P] Create `src/forms/validators/common.ts` - required, min/max length
- [ ] T015.13 Create `src/forms/validators/index.ts` - Export all validators
- [ ] T015.14 Write tests: `test/forms/ValidationBuilder.test.ts`
- [ ] T015.15 [P] Write tests: `test/forms/validators/*.test.ts`

**Verification**: Validators work with Zod schemas

---

## Phase 5: Input Masks (2-3 hours)

- [ ] T015.16 Create `src/forms/masks/phoneMask.ts`:
  - applyPhoneMask(value, format)
  - unmaskPhone(value)
  - Support US, international formats
- [ ] T015.17 Create `src/forms/masks/currencyMask.ts`:
  - applyCurrencyMask(value, options)
  - unmaskCurrency(value)
  - Support USD, EUR, etc.
- [ ] T015.18 Create `src/forms/masks/creditCardMask.ts`:
  - applyCreditCardMask(value)
  - unmaskCreditCard(value)
  - detectCardType(value) - Visa, Mastercard, Amex
- [ ] T015.19 Create `src/forms/masks/index.ts` - Export all masks
- [ ] T015.20 [P] Write tests: `test/forms/masks/phoneMask.test.ts`
- [ ] T015.21 [P] Write tests: `test/forms/masks/currencyMask.test.ts`
- [ ] T015.22 [P] Write tests: `test/forms/masks/creditCardMask.test.ts`

**Verification**: All masks format/unformat correctly

---

## Phase 6: Module Exports & Examples (1 hour)

- [ ] T015.23 Create `src/forms/index.ts` - Export all public APIs
- [ ] T015.24 Add forms exports to `src/index.ts`
- [x] T015.23 Create `src/forms/index.ts` - Export all public APIs
- [x] T015.24 Add forms exports to `src/index.ts`
- [x] T015.25 Add subpath export to package.json: `"./forms": "./dist/forms/index.js"`
- [x] T015.26 Create `examples/forms/FormExample.tsx` - Usage example

---

## Final Verification

- [x] T015.27 Run tests: `npm test test/forms` (All passing)
- [ ] T015.28 Run type-check: `npm run type-check` (0 errors)
- [x] T015.29 Check coverage: `npm test test/forms -- --coverage` (≥80%)
- [ ] T015.30 Build: `npm run build` (Success)
- [ ] T015.31 Update CLAUDE.md with Spec 015 completion

## Bug Fixes
- [ ] Fix reported type errors in form modules

**Success Criteria**: All tasks completed ✓
