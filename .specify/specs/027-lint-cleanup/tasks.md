# Tasks: Lint Cleanup (Spec 027)

**Input**: [spec.md](spec.md), [plan.md](plan.md)
**Branch**: `feature/027-lint-cleanup`

---

## Phase A: Plugin + `src/` `any` Types (highest priority)

- [ ] T001 Install `eslint-plugin-react-hooks`: `npm install --save-dev eslint-plugin-react-hooks`
- [ ] T002 Verify `.eslintrc.js` has `react-hooks/exhaustive-deps` configured; add if missing
- [ ] T003 Fix `src/infrastructure/logger/LogFormatter.ts` — 2 `any` errors (lines 15, 24)
- [ ] T004 Fix `src/infrastructure/network/ApiClient.ts` — 2 `any` errors (lines 71, 93)
- [ ] T005 Fix `src/infrastructure/network/AuthStrategy.ts` — 4 `any` errors (lines 18, 36, 54, 61)
- [ ] T006 Fix `src/infrastructure/network/Interceptor.ts` — 2 `any` errors (lines 26×2)
- [ ] T007 Fix `src/infrastructure/network/interceptors/AuthInterceptor.ts` — 2 `any` errors (lines 31×2)
- [ ] T008 Fix `src/state/BaseStore.ts` — 3 `any` errors (line 18×3)
- [ ] T009 Fix `src/state/StoreFactory.ts` — 21 `any` errors (lines 75–222)
- [ ] T010 Fix `src/forms/masks/creditCardMask.ts` — 1 `any` error (line 33)
- [ ] T011 Fix `src/forms/types.ts` — 1 `any` error (line 107)
- [ ] T012 Fix `src/hooks/useAsyncState.ts` — 1 `any` error (line 59)
- [ ] T013 Fix `src/hooks/useKeyboard.ts` — 1 `any` error (line 20)
- [ ] T014 Fix `src/types/react-test-renderer.d.ts` — 4 `any` errors (lines 4, 13, 14, 17)
- [ ] T015 Fix `src/utils/array.ts` — 2 `any` errors (lines 15, 46)
- [ ] T016 Fix `src/utils/number.ts` — 2 `any` errors (lines 6, 17)
- [ ] T017 Fix `src/utils/object.ts` — 7 `any` errors (lines 7×3, 20×3, 42)
- [ ] T018 Run `npm run type-check` → 0 errors; run `npm test --no-coverage` → 604 pass
- [ ] T019 Commit: `fix(lint): replace any types in src/ production code`

---

## Phase B: `src/` Unused Variables + Stale Disable Comment

- [ ] T020 Fix `src/config/ConfigValidator.ts:38` — `_` unused catch param → rename `_err`
- [ ] T021 Fix `src/infrastructure/network/AuthStrategy.ts:69` — `e` unused → prefix `_e`
- [ ] T022 Fix `src/error/Result.ts:117` — remove stale `// eslint-disable` comment (warning)
- [ ] T023 Run `npm run type-check` → 0 errors; run `npm test --no-coverage` → 604 pass
- [ ] T024 Commit: `fix(lint): remove unused vars and stale eslint-disable in src/`

---

## Phase C: `test/` Errors + Warnings

- [ ] T025 Fix `test/hooks/useAsyncState.test.ts:34` — `e` unused → `_e`
- [ ] T026 Fix `test/integration/hooksInfrastructure.test.ts:204` — `err` unused → `_err`
- [ ] T027 Fix `test/__mocks__/infrastructure/logger/MockLogger.ts:62` — suppress `console` warning
- [ ] T028 Fix `test/infrastructure/logger/ConsoleTransport.test.ts` — suppress 5 `console` warnings (lines 34, 53, 56, 90, 107)
- [ ] T029 Fix `test/performance/infrastructure.performance.test.ts` — suppress 10 `console` warnings (lines 55, 69, 92, 93, 116, 144, 164, 170, 177, 179)
- [ ] T030 Run `npm test --no-coverage` → 604 pass; run `npm run lint` (count should be ≤ ~60 problems)
- [ ] T031 Commit: `fix(lint): fix test/ unused vars and suppress intentional console output`

---

## Phase D: `examples/` + `scripts/` Errors + Warnings

- [ ] T032 Fix `examples/offline/OfflineSyncExample.tsx` — remove unused imports `useEffect`, `ConnectivityManager`; prefix `_error`
- [ ] T033 Fix `examples/forms/FormExample.tsx:27` — prefix `_form`; suppress console warning line 51
- [ ] T034 Fix `examples/state/CompleteExample.ts` — remove `isIdle`, `isSuccess`; prefix `_oldState`; fix 7 `any` errors; suppress 2 console warnings
- [ ] T035 Fix `examples/theme/ThemeExample.tsx` — fix 4 `any` errors (lines 39, 46, 72, 91)
- [ ] T036 Fix `examples/types/UsageExample.tsx` — remove unused `RouteParams`, `initialState`
- [ ] T037 Fix `examples/configuration/UsageExample.tsx` — suppress 1 console warning
- [ ] T038 Fix `scripts/perf-test.ts` — remove `updateCount`; fix 4 `any` errors; suppress 11 console warnings
- [ ] T039 Run `npm run lint` → 0 problems
- [ ] T040 Run `npm run type-check` → 0 errors; run `npm test --no-coverage` → 604 pass
- [ ] T041 Commit: `fix(lint): fix examples/ and scripts/ errors and warnings`

---

## Phase E: Final Verification

- [ ] T042 Run `npm run lint` → **0 errors, 0 warnings**
- [ ] T043 Run `npm run type-check` → **0 errors**
- [ ] T044 Run `npm test` → **604/604 pass**
- [ ] T045 Update this tasks.md with all results
- [ ] T046 Merge `feature/027-lint-cleanup` → `develop`

---

## Dependencies

- Phases A–D are sequential (each pass reduces problem count)
- Phase E depends on all previous phases
- T001 (plugin install) must precede T002 (config verify) and all other tasks
