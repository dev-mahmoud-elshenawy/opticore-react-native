# Spec 027: Lint Cleanup

**Feature Branch**: `feature/027-lint-cleanup`
**Created**: 2026-03-05
**Status**: Draft
**Priority**: P1

---

## What

Resolve all 84 pre-existing ESLint errors (and 32 warnings) across 30 files. These were confirmed as pre-existing in Spec 026's final verification — `npm run lint` currently fails the quality gate on every run.

---

## Why

- Constitutional rule: "0 errors, 0 warnings" before any commit — currently violated
- `any` types in published `src/` code reduce type safety and IDE autocomplete for consumers
- Unused variables signal incomplete refactors and waste bundle space
- Missing `react-hooks/exhaustive-deps` plugin means React hook dependency linting is silently disabled

---

## Error Inventory

**Total: 116 problems — 84 errors, 32 warnings**

### By Rule

| Rule | Count | Scope |
|------|-------|-------|
| `@typescript-eslint/no-explicit-any` | ~60 errors | src/, test/, examples/ |
| `@typescript-eslint/no-unused-vars` | ~12 errors | src/, test/, examples/ |
| `no-console` | ~32 warnings | test/, examples/, scripts/ |
| `react-hooks/exhaustive-deps` (plugin missing) | 1 error | src/hooks/useMount.ts |

### Affected Files

**Production `src/`** — highest priority (published library):
- `src/config/ConfigValidator.ts`
- `src/error/Result.ts`
- `src/forms/masks/creditCardMask.ts`
- `src/forms/types.ts`
- `src/hooks/useAsyncState.ts`
- `src/hooks/useKeyboard.ts`
- `src/hooks/useMount.ts`
- `src/infrastructure/logger/LogFormatter.ts`
- `src/infrastructure/network/ApiClient.ts`
- `src/infrastructure/network/AuthStrategy.ts`
- `src/infrastructure/network/Interceptor.ts`
- `src/infrastructure/network/interceptors/AuthInterceptor.ts`
- `src/state/BaseStore.ts`
- `src/state/StoreFactory.ts`
- `src/types/react-test-renderer.d.ts`
- `src/utils/array.ts`
- `src/utils/number.ts`
- `src/utils/object.ts`

**Test `test/`** — medium priority:
- `test/__mocks__/infrastructure/logger/MockLogger.ts`
- `test/hooks/useAsyncState.test.ts`
- `test/infrastructure/logger/ConsoleTransport.test.ts`
- `test/integration/hooksInfrastructure.test.ts`
- `test/performance/infrastructure.performance.test.ts`

**Examples `examples/`** — low priority (not published):
- `examples/configuration/UsageExample.tsx`
- `examples/forms/FormExample.tsx`
- `examples/offline/OfflineSyncExample.tsx`
- `examples/state/CompleteExample.ts`
- `examples/theme/ThemeExample.tsx`
- `examples/types/UsageExample.tsx`

**Scripts `scripts/`** — low priority:
- `scripts/perf-test.ts`

---

## User Scenarios

### Story 1 — Developer runs quality gate (P1)

A developer runs `npm run lint` before committing and sees 0 problems.

**Acceptance Scenarios**:
1. **Given** the codebase on `develop`, **When** `npm run lint` is run, **Then** it exits with 0 errors and 0 warnings.
2. **Given** a consumer imports `ApiClient`, **When** they use its methods, **Then** IDE shows correct types (no `any` bleed-through).

---

### Story 2 — New contributor adds a React hook (P2)

A contributor adds a new hook with a missing dependency. ESLint catches it immediately.

**Acceptance Scenarios**:
1. **Given** `eslint-plugin-react-hooks` is installed, **When** a hook has a missing `useEffect` dependency, **Then** lint reports `react-hooks/exhaustive-deps` error.

---

## Requirements

### Functional

- **FR-001**: `npm run lint` MUST exit with 0 errors and 0 warnings
- **FR-002**: All `any` types in `src/` MUST be replaced with proper TypeScript types (or suppressed with inline disable + justification comment for genuine escape hatches)
- **FR-003**: All unused variables in `src/` MUST be removed or prefixed with `_`
- **FR-004**: `console.log` in `test/` and `examples/` MAY be suppressed with `// eslint-disable-next-line no-console` where output is intentional
- **FR-005**: `eslint-plugin-react-hooks` MUST be installed and the `react-hooks/exhaustive-deps` rule MUST be enabled

### Non-Functional

- **NFR-001**: All 604 existing tests must continue to pass
- **NFR-002**: TypeScript strict mode must remain at 0 errors
- **NFR-003**: No functional behavior changes — lint-only fixes
- **NFR-004**: No breaking changes to public API signatures

---

## Success Criteria

- **SC-001**: `npm run lint` → 0 errors, 0 warnings
- **SC-002**: `npm run type-check` → 0 errors (unchanged from Spec 026)
- **SC-003**: `npm test` → 604/604 pass (unchanged)
- **SC-004**: No `any` in public-facing `src/` APIs without inline justification comment

---

## Out of Scope

- Adding new lint rules beyond what already exists
- Fixing logic bugs discovered during lint review (create separate spec)
- Changing public API shapes in ways that require consumer migration

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Replacing `any` in ApiClient/Interceptor introduces type errors | Run `npm run type-check` after each file |
| `react-hooks/exhaustive-deps` install flags new errors in other hooks | Fix all newly surfaced errors in same spec |
| Examples use intentional `console.log` for demo output | Use `// eslint-disable-next-line no-console` with comment explaining intent |

---

## Dependencies

- **Spec 026** (Test Stabilization) — completed ✅
- No other blocking dependencies
