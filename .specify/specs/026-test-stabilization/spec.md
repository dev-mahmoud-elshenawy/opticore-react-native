# Spec 026: Test Suite Stabilization

**Branch**: `feature/026-test-stabilization` | **Priority**: P0 | **Created**: 2026-03-05

## Problem

32 pre-existing test failures across 10 suites. Target: 0 failing.

## Root Cause Groups

**A - LogFormatter (1 failure)**: `LogLevel` is numeric enum (`INFO=1`). `JSON.stringify` gives `1`, test expects `'INFO'`. Fix: convert level to string name in `JsonFormatter`.

**B - Locale formatting (5 failures)**: Node.js limited ICU. `Intl.NumberFormat` produces different whitespace/symbols than hardcoded expectations. Fix: flexible matchers (regex/toContain).

**C - OptiCoreErrorBoundary (6 failures)**: Boundary impl gaps after Spec 023. Fix: diagnose and align boundary with test expectations.

**D - hooksInfrastructure (4 failures)**: NetInfo/AppState mocks out of sync with hook internals. Fix: update mock wiring.

**E - Providers (10 failures)**: ConfigContext shape and CoreSetup.init() patterns changed in Spec 018/021. Fix: align tests with current impl.

**F - apiClient/Validation/debounce (6 failures)**: axios interceptor mock needs updating, phone regex mismatch, debounce needs fake timers.

## Files

Source: `src/infrastructure/logger/LogFormatter.ts`
Tests: 9 test files across groups A-F

## Success Criteria

- `npm test` -> 0 failing
- `npm run type-check` -> 0 errors in modified files
- Minimal fixes only
