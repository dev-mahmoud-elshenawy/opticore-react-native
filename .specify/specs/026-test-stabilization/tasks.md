# Tasks: Test Suite Stabilization

**Input**: [spec.md](spec.md), [plan.md](plan.md)
**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Group A - LogFormatter (1 failure)

- [ ] T001 Read `src/infrastructure/logger/LogFormatter.ts` and `test/infrastructure/logger/LogFormatter.test.ts`
- [ ] T002 Fix `JsonFormatter` to output string level name instead of numeric enum value
- [ ] T003 Run `npx jest LogFormatter` - verify 0 failures

---

## Phase 2: Group B + F - Locale, Validation, ApiClient (11 failures)

- [ ] T004 [P] Fix `test/forms/masks/currencyMask.test.ts` - flexible matchers for locale formatting (4 failures)
- [ ] T005 [P] Fix `test/forms/masks/phoneMask.test.ts` - update US phone format expectation (1 failure)
- [ ] T006 [P] Fix `test/forms/ValidationBuilder.test.ts` - align phone regex expectation (1 failure)
- [ ] T007 [P] Fix `test/forms/useFieldValidation.test.ts` - add fake timers for debounce (1 failure)
- [ ] T008 [P] Fix `test/integration/apiClientErrorFlow.test.ts` - update axios interceptor mock (3 failures)
- [ ] T009 Run affected tests - verify 0 failures in groups B+F

---

## Phase 3: Group D - Hooks Infrastructure (4 failures)

- [ ] T010 Read `test/integration/hooksInfrastructure.test.ts` and related hook source files
- [ ] T011 Fix NetInfo/AppState mock wiring (4 failures)
- [ ] T012 Run `npx jest hooksInfrastructure` - verify 0 failures

---

## Phase 4: Group C - OptiCoreErrorBoundary (6 failures)

- [ ] T013 Read `src/error/OptiCoreErrorBoundary.tsx` and `test/error/OptiCoreErrorBoundary.test.tsx`
- [ ] T014 Diagnose and fix boundary behavior gaps (fallback, onError, resetError)
- [ ] T015 Run `npx jest OptiCoreErrorBoundary` - verify 0 failures

---

## Phase 5: Group E - Providers (10 failures)

- [ ] T016 Read provider source and test files
- [ ] T017 Fix `OptiCoreProvider.test.tsx` - align with current ConfigContext/CoreSetup (3 failures)
- [ ] T018 Fix `coreProviderIntegration.test.tsx` - align manager init and QueryClient (7 failures)
- [ ] T019 Run `npx jest OptiCoreProvider coreProviderIntegration` - verify 0 failures

---

## Phase 6: Final Verification

- [ ] T020 Run full `npm test` - verify 0 failures across all 84 suites
- [ ] T021 Run `npm run type-check` - verify 0 errors
- [ ] T022 Run `npm run lint` - verify 0 errors

---

## Dependencies

- Phases 1-5 are independent, can be done in any order
- Phase 6 depends on all previous phases completing
