# Spec 014: React 19 Test Migration & Core Stabilization

## Overview

**Priority**: P0 - BLOCKING
**Effort**: 8-12 hours
**Dependencies**: None (foundational)
**Status**: Not Started

## Problem Statement

After upgrading to React 19 and React Native 0.83, 50 tests are failing due to breaking changes in the React testing APIs. The core code is correct, but tests need updating to be compatible with React 19.

### Root Causes
1. `renderHook` API changed - return type and behavior modified
2. Fragment children handling modified in React reconciler
3. `act()` behavior updated for async operations
4. `react-test-renderer` replaced with `test-renderer` package

## Objectives

1. **Fix all failing tests** - Restore 264/264 passing
2. **Create React 19 compatible test utilities** - Reusable patterns
3. **Core harmony audit** - Verify all modules integrate seamlessly
4. **Code quality sweep** - TypeScript, lint, docs

## User Stories

### US-014.1: Fix Failing Hook Tests (P1)
**As a** developer
**I want** all hook tests to pass with React 19
**So that** I can trust the hook implementations work correctly

**Acceptance Criteria**:
- [ ] All 11 hook tests pass
- [ ] renderHook patterns updated for React 19
- [ ] Proper cleanup in all tests

### US-014.2: Fix Failing Provider Tests (P1)
**As a** developer
**I want** CoreProvider and QueryProvider tests to pass
**So that** I can trust the provider setup

**Acceptance Criteria**:
- [ ] CoreProvider tests pass
- [ ] QueryProvider tests pass
- [ ] Fragment/children issues resolved

### US-014.3: Core Harmony Verification (P2)
**As a** developer
**I want** integration tests verifying module interactions
**So that** all modules work together like an orchestra

**Acceptance Criteria**:
- [ ] CoreProvider → infrastructure managers integration tested
- [ ] ApiClient → Error system integration tested
- [ ] Hooks → Infrastructure integration tested
- [ ] All singletons reset properly between tests

### US-014.4: Code Quality Sweep (P2)
**As a** developer
**I want** zero TypeScript errors and lint issues
**So that** the codebase is production-ready

**Acceptance Criteria**:
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors/warnings
- [ ] All TODO comments resolved or documented
- [ ] JSDoc on all public APIs

## Technical Approach

### Part A: Test Utility Creation

Create `test/utils/react19Helpers.ts`:
```typescript
import { renderHook, act, waitFor } from '@testing-library/react-native';

// React 19 compatible renderHook wrapper
export function renderHookCompat<T>(hook: () => T) {
  // Handle React 19 API changes
}

// React 19 compatible act wrapper
export async function actCompat(callback: () => Promise<void>) {
  // Handle async act changes
}
```

### Part B: Failing Test Categories

| Category | Files | Count | Fix Strategy |
|----------|-------|-------|--------------|
| Hook Tests | `test/hooks/*.test.ts` | 11 | Update renderHook calls |
| Provider Tests | `test/providers/*.test.tsx` | 2 | Fix Fragment issues |
| Navigation Tests | `test/navigation/*.test.ts` | 1 | Update hook testing |
| Config Tests | `test/config/*.test.ts` | 1 | Update singleton patterns |

### Part C: Integration Test Matrix

```
┌─────────────────┬─────────────────┬─────────────────┐
│ CoreProvider    │ ApiClient       │ StateManagement │
├─────────────────┼─────────────────┼─────────────────┤
│ → QueryProvider │ → AuthIntercept │ → AsyncState    │
│ → Connectivity  │ → LogIntercept  │ → BaseStore     │
│ → Lifecycle     │ → ErrorIntercept│ → StateObserver │
└─────────────────┴─────────────────┴─────────────────┘
```

## Files to Modify

```
test/
├── utils/
│   └── react19Helpers.ts        # NEW: React 19 test utilities
├── hooks/
│   ├── useAsyncState.test.ts    # MODIFY
│   ├── useConnectivity.test.ts  # MODIFY
│   ├── useDebounce.test.ts      # MODIFY
│   ├── useKeyboard.test.ts      # MODIFY
│   ├── useLifecycle.test.ts     # MODIFY
│   ├── useMount.test.ts         # MODIFY
│   ├── useOrientation.test.ts   # MODIFY
│   ├── usePrevious.test.ts      # MODIFY
│   ├── useResponsive.test.ts    # MODIFY
│   ├── useSafeCall.test.ts      # MODIFY
│   └── useThrottle.test.ts      # MODIFY
├── providers/
│   ├── CoreProvider.test.tsx    # MODIFY
│   └── QueryProvider.test.tsx   # MODIFY
├── navigation/
│   └── RouteHelper.test.ts      # MODIFY
├── config/
│   └── CoreSetup.test.ts        # MODIFY
└── integration/
    ├── coreHarmony.test.ts      # NEW: Integration tests
    └── moduleIntegration.test.ts # NEW: Module interaction tests
```

## Success Criteria

- [ ] `npm test` → 264/264 passing (0 failures, 0 skipped)
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 errors/warnings
- [ ] `npm run build` → Success
- [ ] Coverage ≥ 80% across all modules
- [ ] All integration points documented

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| React 19 API incompatibility | High | Create abstraction layer |
| Test flakiness | Medium | Add proper waitFor/act handling |
| Coverage drop | Medium | Add new integration tests |

## Out of Scope

- New features or functionality
- UI component changes
- API changes to public interfaces

## Definition of Done

1. All 264+ tests passing
2. No TypeScript errors
3. No lint warnings
4. Build succeeds
5. Coverage ≥ 80%
6. Integration tests added
7. CLAUDE.md updated
