# Implementation Plan: Test Suite Stabilization

**Branch**: `feature/026-test-stabilization` | **Date**: 2026-03-05 | **Spec**: [spec.md](spec.md)

## Summary

Fix 32 pre-existing test failures across 10 suites by making minimal, targeted changes to tests and source code. No new features; only alignment between tests and current implementation.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Testing**: Jest 29.7 + React Native Testing Library 14.0.0-beta
**Target Platform**: iOS & Android (React Native 0.83+ / Expo SDK 54)
**Constraints**: Minimal fixes only - no refactoring, no new features

## Constitution Check

- Pure infrastructure library: N/A (test fixes only)
- Spec-first: This spec covers the work
- TypeScript strict: All fixes must compile under strict mode
- 80%+ coverage: Maintained or improved

## Approach by Root Cause Group

### Group A - LogFormatter (1 failure)
**File**: `test/infrastructure/logger/LogFormatter.test.ts`
**Root Cause**: `LogLevel` is numeric enum (`INFO=1`). `JSON.stringify` produces `1`, test expects `'INFO'`.
**Fix**: Update `JsonFormatter` to convert numeric level to string name before serializing.

### Group B - Locale Formatting (5 failures)
**Files**: `test/forms/masks/currencyMask.test.ts`, `test/forms/masks/phoneMask.test.ts`
**Root Cause**: Node.js limited ICU produces different whitespace/symbols than hardcoded test expectations.
**Fix**: Use flexible matchers (regex, `toContain`, or normalize whitespace) instead of exact string matches.

### Group C - OptiCoreErrorBoundary (6 failures)
**File**: `test/error/OptiCoreErrorBoundary.test.tsx`
**Root Cause**: Boundary implementation changed in Spec 023. Tests expect old behavior (fallback rendering, onError callback).
**Fix**: Align tests with current ErrorBoundary implementation, or fix boundary to match expected contract.

### Group D - Hooks Infrastructure (4 failures)
**File**: `test/integration/hooksInfrastructure.test.ts`
**Root Cause**: NetInfo/AppState mocks out of sync with hook internals after Spec 024 changes.
**Fix**: Update mock wiring to match current hook implementations.

### Group E - Providers (10 failures)
**Files**: `test/providers/OptiCoreProvider.test.tsx`, `test/integration/coreProviderIntegration.test.tsx`
**Root Cause**: ConfigContext shape and CoreSetup.init() patterns changed in Spec 018/021. Tests use old API.
**Fix**: Update test setup to use current provider API and config shape.

### Group F - ApiClient / Validation / Debounce (6 failures)
**Files**: `test/integration/apiClientErrorFlow.test.ts`, `test/forms/ValidationBuilder.test.ts`, `test/forms/useFieldValidation.test.ts`
**Root Cause**: Axios interceptor mock needs updating, phone regex mismatch, debounce needs fake timers.
**Fix**: Update axios mock setup, fix phone regex expectation, use `jest.useFakeTimers()` for debounce test.

## Execution Order

Groups are independent - fix in order A -> B -> F -> D -> C -> E (simplest first, most complex last).
