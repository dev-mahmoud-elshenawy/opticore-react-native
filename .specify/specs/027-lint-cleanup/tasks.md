# Tasks: Lint Cleanup (Spec 027)

**Input**: [spec.md](spec.md), [plan.md](plan.md)
**Branch**: `feature/027-lint-cleanup`

---

## Phase A: Plugin + `src/` `any` Types (highest priority)

- [x] T001 Install `eslint-plugin-react-hooks`: `npm install --save-dev eslint-plugin-react-hooks`
- [x] T002 Verify `.eslintrc.js` has `react-hooks/exhaustive-deps` configured; add if missing
- [x] T003 Fix `src/infrastructure/logger/LogFormatter.ts` — 2 `any` errors (lines 15, 24)
- [x] T004 Fix `src/infrastructure/network/ApiClient.ts` — 2 `any` errors (lines 71, 93)
- [x] T005 Fix `src/infrastructure/network/AuthStrategy.ts` — 4 `any` errors (lines 18, 36, 54, 61)
- [x] T006 Fix `src/infrastructure/network/Interceptor.ts` — 2 `any` errors (lines 26×2)
- [x] T007 Fix `src/infrastructure/network/interceptors/AuthInterceptor.ts` — 2 `any` errors (lines 31×2)
- [x] T008 Fix `src/state/BaseStore.ts` — 3 `any` errors (line 18×3)
- [x] T009 Fix `src/state/StoreFactory.ts` — 21 `any` errors (lines 75–222)
- [x] T010 Fix `src/forms/masks/creditCardMask.ts` — 1 `any` error (line 33)
- [x] T011 Fix `src/forms/types.ts` — 1 `any` error (line 107)
- [x] T012 Fix `src/hooks/useAsyncState.ts` — 1 `any` error (line 59)
- [x] T013 Fix `src/hooks/useKeyboard.ts` — 1 `any` error (line 20)
- [x] T014 Fix `src/types/react-test-renderer.d.ts` — 4 `any` errors (lines 4, 13, 14, 17)
- [x] T015 Fix `src/utils/array.ts` — 2 `any` errors (lines 15, 46)
- [x] T016 Fix `src/utils/number.ts` — 2 `any` errors (lines 6, 17)
- [x] T017 Fix `src/utils/object.ts` — 7 `any` errors (lines 7×3, 20×3, 42)
- [x] T018 Run `npm run type-check` → 0 errors; run `npm test --no-coverage` → 604 pass
- [x] T019 Commit: `fix(lint): replace any types in src/ production code`

---

## Phase B: `src/` Unused Variables + Stale Disable Comment

- [x] T020 Fix `src/config/ConfigValidator.ts:38` — `_` unused catch param → rename `_err`
- [x] T021 Fix `src/infrastructure/network/AuthStrategy.ts:69` — `e` unused → prefix `_e`
- [x] T022 Fix `src/error/Result.ts:117` — remove stale `// eslint-disable` comment (warning)
- [x] T023 Run `npm run type-check` → 0 errors; run `npm test --no-coverage` → 604 pass
- [x] T024 Commit: `fix(lint): remove unused vars and stale eslint-disable in src/`

---

## Phase C: `test/` Errors + Warnings

- [x] T025 Fix `test/hooks/useAsyncState.test.ts:34` — `e` unused → `_e`
- [x] T026 Fix `test/integration/hooksInfrastructure.test.ts:204` — `err` unused → `_err`
- [x] T027 Fix `test/__mocks__/infrastructure/logger/MockLogger.ts:62` — suppress `console` warning
- [x] T028 Fix `test/infrastructure/logger/ConsoleTransport.test.ts` — suppress 5 `console` warnings (lines 34, 53, 56, 90, 107)
- [x] T029 Fix `test/performance/infrastructure.performance.test.ts` — suppress 10 `console` warnings (lines 55, 69, 92, 93, 116, 144, 164, 170, 177, 179)
- [x] T030 Run `npm test --no-coverage` → 604 pass; run `npm run lint` (count should be ≤ ~60 problems)
- [x] T031 Commit: `fix(lint): fix test/ unused vars and suppress intentional console output`

---

## Phase D: `examples/` + `scripts/` Errors + Warnings

- [x] T032 Fix `examples/offline/OfflineSyncExample.tsx` — remove unused imports `useEffect`, `ConnectivityManager`; prefix `_error`
- [x] T033 Fix `examples/forms/FormExample.tsx:27` — prefix `_form`; suppress console warning line 51
- [x] T034 Fix `examples/state/CompleteExample.ts` — remove `isIdle`, `isSuccess`; prefix `_oldState`; fix 7 `any` errors; suppress 2 console warnings
- [x] T035 Fix `examples/theme/ThemeExample.tsx` — fix 4 `any` errors (lines 39, 46, 72, 91)
- [x] T036 Fix `examples/types/UsageExample.tsx` — remove unused `RouteParams`, `initialState`
- [x] T037 Fix `examples/configuration/UsageExample.tsx` — suppress 1 console warning
- [x] T038 Fix `scripts/perf-test.ts` — remove `updateCount`; fix 4 `any` errors; suppress 11 console warnings
- [x] T039 Run `npm run lint` → 0 problems
- [x] T040 Run `npm run type-check` → 0 errors; run `npm test --no-coverage` → 604 pass
- [x] T041 Commit: `fix(lint): fix examples/ and scripts/ errors and warnings`

---

## Phase E: Final Verification

- [x] T042 Run `npm run lint` → **0 errors, 0 warnings**
- [x] T043 Run `npm run type-check` → **0 errors**
- [x] T044 Run `npm test` → **604/604 pass**
- [x] T045 Update this tasks.md with all results
- [x] T046 Merge `feature/027-lint-cleanup` → `develop`

---

## Dependencies

- Phases A–D are sequential (each pass reduces problem count)
- Phase E depends on all previous phases
- T001 (plugin install) must precede T002 (config verify) and all other tasks
