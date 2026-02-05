# Tasks: React 19 Test Migration & Core Harmony

**Input**: Design documents from `/specs/014-react19-test-stabilization/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by phase to enable systematic fixing of tests.

## Format: `[ID] [P?] [Description]`

- **[P]**: Can run in parallel (different files, no dependencies)

## Phase A: Test Utilities (1-2 hours)

**Purpose**: Create React 19 compatible test utilities

- [ ] T014.1 Create `test/utils/react19Helpers.ts` with renderHook wrapper
- [ ] T014.2 [P] Create act wrapper for async operations
- [ ] T014.3 [P] Create test setup utilities (cleanup, mocks)
- [ ] T014.4 Export all helpers from `test/utils/index.ts`

**Checkpoint**: Test utilities ready for use in all tests

---

## Phase B: Fix Hook Tests (3-4 hours)

**Purpose**: Update all 11 hook tests to use React 19 compatible patterns

- [ ] T014.5 Fix `test/hooks/useAsyncState.test.ts` - Update renderHook calls
- [ ] T014.6 [P] Fix `test/hooks/useConnectivity.test.ts` - Update renderHook calls
- [ ] T014.7 [P] Fix `test/hooks/useDebounce.test.ts` - Update renderHook calls
- [ ] T014.8 [P] Fix `test/hooks/useKeyboard.test.ts` - Update renderHook calls
- [ ] T014.9 [P] Fix `test/hooks/useLifecycle.test.ts` - Update renderHook calls
- [ ] T014.10 [P] Fix `test/hooks/useMount.test.ts` - Update renderHook calls
- [ ] T014.11 [P] Fix `test/hooks/useOrientation.test.ts` - Update renderHook calls
- [ ] T014.12 [P] Fix `test/hooks/usePrevious.test.ts` - Update renderHook calls
- [ ] T014.13 [P] Fix `test/hooks/useResponsive.test.ts` - Update renderHook calls
- [ ] T014.14 [P] Fix `test/hooks/useSafeCall.test.ts` - Update renderHook calls
- [ ] T014.15 [P] Fix `test/hooks/useThrottle.test.ts` - Update renderHook calls

**Verification**: `npm test test/hooks` - All 11 hook tests pass

---

## Phase C: Fix Provider & Other Tests (1-2 hours)

**Purpose**: Fix remaining failing tests

- [ ] T014.16 Fix `test/providers/CoreProvider.test.tsx` - Wrap children in View
- [ ] T014.17 Fix `test/providers/QueryProvider.test.tsx` - Wrap children in View
- [ ] T014.18 Fix `test/navigation/RouteHelper.test.ts` - Update renderHook
- [ ] T014.19 Fix `test/config/CoreSetup.test.ts` - Update any hooks

**Verification**: `npm test` - 264/264 tests passing

---

## Phase D: Integration Tests (2-3 hours)

**Purpose**: Add tests for module interactions (orchestra harmony)

- [ ] T014.20 Create `test/integration/coreProviderIntegration.test.tsx`
  - Test CoreProvider initializes ConnectivityManager
  - Test CoreProvider initializes LifecycleManager
  - Test QueryProvider is accessible
- [ ] T014.21 Create `test/integration/apiClientErrorFlow.test.ts`
  - Test API errors flow through ErrorInterceptor
  - Test errors classified as RenderError/NonRenderError
  - Test Logger receives error logs
- [ ] T014.22 Create `test/integration/stateErrorIntegration.test.ts`
  - Test AsyncState error states
  - Test BaseStore error handling
  - Test StateObserver error events
- [ ] T014.23 Create `test/integration/hooksInfrastructure.test.ts`
  - Test useConnectivity with ConnectivityManager
  - Test useLifecycle with LifecycleManager
  - Test useAsyncState with AsyncState pattern

**Verification**: `npm test test/integration` - All integration tests pass

---

## Phase E: Code Quality Sweep (2-3 hours)

**Purpose**: Ensure all quality gates pass

- [ ] T014.24 Run `npm run type-check` - Fix any TypeScript errors (target: 0)
- [ ] T014.25 Run `npm run lint` - Fix ESLint errors/warnings (target: 0)
- [ ] T014.26 Search for TODO comments - Resolve or document
- [ ] T014.27 Verify JSDoc coverage on public APIs
- [ ] T014.28 Verify exports in `src/index.ts` - All modules exported
- [ ] T014.29 Verify subpath exports in `package.json` - All working
- [ ] T014.30 Run coverage report - Ensure ≥80% across all modules

**Verification**: All quality gates pass

---

## Final Verification

- [ ] T014.31 Run full test suite: `npm test` (264/264 passing)
- [ ] T014.32 Run TypeScript: `npm run type-check` (0 errors)
- [ ] T014.33 Run linter: `npm run lint` (0 errors/warnings)
- [ ] T014.34 Build package: `npm run build` (Success)
- [ ] T014.35 Check coverage: `npm test -- --coverage` (≥80%)
- [ ] T014.36 Update CLAUDE.md with Spec 014 completion

**Success Criteria**: All checkboxes above checked ✓
