# Implementation Plan: Error System Enhancements

**Branch**: `feature/023-error-system-enhancements` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Three additions to the error system: (1) Extensible ErrorClassifier with custom rules via `addRule()`, (2) Result<T, E> discriminated union for type-safe error handling without try/catch, (3) OptiCoreErrorBoundary React component that classifies caught errors and renders fallback only for RenderErrors. All additive.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: React 19, React Native 0.81
**Testing**: Jest ^29 + React Native Testing Library ^12
**Target Platform**: iOS & Android

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| Pure Infrastructure | PASS | Error handling is infrastructure |
| TypeScript Strict | PASS | Result<T,E> uses discriminated unions |
| SOLID - OCP | FIX | ErrorClassifier open for extension via custom rules |

## Source Code Structure

```
src/error/
├── ErrorClassifier.ts          [MODIFY] Add addRule(), custom rules before defaults
├── ClassificationRule.ts       [NEW] Rule interface
├── Result.ts                   [NEW] Result<T, E> discriminated union
├── OptiCoreErrorBoundary.tsx   [NEW] React Error Boundary
├── DefaultErrorFallback.tsx    [NEW] Default fallback UI
└── index.ts                    [MODIFY] Export new types

test/error/
├── ErrorClassifier.test.ts     [MODIFY] Custom rules tests
├── Result.test.ts              [NEW]
└── OptiCoreErrorBoundary.test.tsx [NEW]
```

## Approach

1. **ClassificationRule**: `{ name: string; match(error: unknown): boolean; type: ErrorType; factory?: (error: unknown) => BaseError }`. Rules stored in static array on ErrorClassifier. Custom rules checked first (LIFO — last added has highest priority).

2. **ErrorClassifier.addRule()**: Static method. `classify()` iterates custom rules first, then falls back to existing default logic. Rule's `match()` is wrapped in try/catch to prevent broken rules from crashing classification.

3. **Result<T, E>**: Discriminated union `type Result<T, E = Error> = Ok<T> | Err<E>`. Constructors: `Result.ok(value)`, `Result.err(error)`. Methods: `isOk()`, `isErr()`, `unwrap()`, `unwrapOr(default)`, `map(fn)`, `flatMap(fn)`, `mapErr(fn)`. Implemented as classes with shared interface.

4. **OptiCoreErrorBoundary**: React class component (Error Boundaries require class components). `getDerivedStateFromError()` classifies the error. RenderErrors → show fallback. NonRenderErrors → log via Logger, don't show fallback. Unknown errors → classify via ErrorClassifier. Props: `fallback?: (error, resetError) => ReactNode`, `onError?: (error) => void`.

5. **DefaultErrorFallback**: Simple RN View + Text showing `error.userMessage` with a "Try Again" button that calls `resetError()`.
