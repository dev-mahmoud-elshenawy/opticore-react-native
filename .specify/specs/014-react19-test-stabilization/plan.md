# Implementation Plan: React 19 Test Migration & Core Harmony

**Branch**: `feature/014-react19-test-stabilization`
**Date**: 2026-02-05
**Spec**: [spec.md](./spec.md)

## Summary

Fix all 50 failing tests caused by React 19 API changes, ensure perfect integration between all 13 existing modules, and perform a complete code quality sweep. This establishes a stable foundation before adding new features.

**Technical Approach**: Create React 19 compatible test utilities, update all test patterns, write integration tests for module interactions, and fix any TypeScript/lint issues.

## Technical Context

- **Language/Version**: TypeScript 5.9.2 (strict mode)
- **React Version**: 19.2.4 (breaking changes from 18.x)
- **React Native**: 0.83.1
- **Testing**: Jest 29.7.0, @testing-library/react-native 14.0.0-beta.0
- **Target**: 264/264 tests passing, 80%+ coverage

## Critical Files

**Test Utilities**:

- `test/utils/react19Helpers.ts` - NEW: React 19 compatible helpers

**Failing Tests** (50 total):

- `test/hooks/*.test.ts` (11 files)
- `test/providers/*.test.tsx` (2 files)
- `test/navigation/RouteHelper.test.ts`
- `test/config/CoreSetup.test.ts`

**Integration Points to Test**:

- [src/providers/CoreProvider.tsx](../../src/providers/CoreProvider.tsx)
- [src/config/CoreSetup.ts](../../src/config/CoreSetup.ts)
- [src/infrastructure/network/interceptors/ErrorInterceptor.ts](../../src/infrastructure/network/interceptors/ErrorInterceptor.ts)

## Module Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                      CoreProvider                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │QueryProvider│  │Connectivity  │  │LifecycleManager  │   │
│  │             │  │Manager       │  │                  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   ApiClient   │  │   Storage     │  │    Logger     │
│  ┌─────────┐  │  │ ┌──────────┐  │  │               │
│  │Auth     │  │  │ │Secure    │  │  │               │
│  │Intercept│  │  │ │Storage   │  │  │               │
│  └─────────┘  │  │ └──────────┘  │  │               │
│  ┌─────────┐  │  │ ┌──────────┐  │  │               │
│  │Error    │──┼──┤►│Local     │  │  │◄──────────────│
│  │Intercept│  │  │ │Storage   │  │  │               │
│  └─────────┘  │  │ └──────────┘  │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
        │                                     ▲
        ▼                                     │
┌───────────────┐                             │
│ Error System  │─────────────────────────────┘
│ ┌───────────┐ │
│ │RenderError│ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │NonRender  │ │
│ │Error      │ │
│ └───────────┘ │
└───────────────┘
```

## Implementation Phases

**Phase A: Test Utilities** (1-2 hours)

- Create React 19 compatible renderHook wrapper
- Create React 19 compatible act wrapper
- Create test setup helpers

**Phase B: Fix Failing Tests** (4-6 hours)

- Update all 11 hook tests
- Fix 2 provider tests (Fragment issues)
- Fix navigation test
- Fix config test

**Phase C: Integration Tests** (2-3 hours)

- CoreProvider initialization
- ApiClient → Error flow
- State → Error integration
- Hooks → Infrastructure

**Phase D: Quality Sweep** (2-3 hours)

- TypeScript strict mode check
- ESLint fixes
- JSDoc coverage
- Export verification

## Verification

```bash
# Must all pass
npm run type-check  # 0 errors
npm run lint        # 0 errors/warnings
npm test            # 264/264 passing
npm run build       # Success
npm test -- --coverage  # ≥80%
```

## Success Criteria

- ✅ 264/264 tests passing
- ✅ 0 TypeScript errors
- ✅ 0 ESLint warnings
- ✅ Integration tests added
- ✅ Core harmony documented
