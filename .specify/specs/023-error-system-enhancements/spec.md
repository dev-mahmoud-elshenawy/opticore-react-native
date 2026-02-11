# Feature Specification: Error System Enhancements

**Spec Number**: 023
**Feature Branch**: `feature/023-error-system-enhancements`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P2
**Input**: Code Review 2026-02-11, Sections 5 (Error Classification), 13C (Result Pattern), 14O (Open/Closed), 15.4 (Error Boundary)

## Problem Statement

The Error Classification system (Spec 004) has a solid taxonomy but 3 gaps:

1. **ErrorClassifier has hardcoded rules** - Static classification logic can't be extended. Apps needing custom rules (e.g., treat 429 as NonRenderError, treat certain 200s as errors) must modify source.
2. **No Result<T,E> pattern** - Async operations return `T` or throw `Error`. No type-safe way to handle success/failure without try/catch.
3. **No Error Boundary component** - Despite having RenderError/NonRenderError classification, there's no React Error Boundary that leverages the classification system.

---

## User Scenarios & Testing

### User Story 1 - Extensible ErrorClassifier (Priority: P1)

ErrorClassifier accepts custom classification rules that run before the default rules. Consuming apps can override how specific error codes or patterns are classified.

**Why this priority**: Without this, apps with non-standard APIs can't use the error system correctly.

**Independent Test**: Register a custom rule that classifies 429 as NonRenderError, trigger a 429, verify it's classified as NonRenderError instead of the default RenderError.

**Acceptance Scenarios**:

1. **Given** a custom rule `{ match: (e) => e.status === 429, type: ErrorType.NON_RENDER, factory: (e) => new NonRenderError(...) }`, **When** a 429 error occurs, **Then** ErrorClassifier returns a NonRenderError.
2. **Given** custom rules AND default rules, **When** an error matches a custom rule, **Then** the custom rule takes precedence.
3. **Given** an error that matches NO custom rules, **When** classified, **Then** default rules apply (backward compatible).
4. **Given** `ErrorClassifier.addRule(rule)`, **When** called, **Then** the rule is registered for all subsequent classifications.
5. **Given** `CoreConfig.errorClassification.customRules` (Spec 018), **When** `CoreSetup.init()` is called, **Then** rules are registered with ErrorClassifier.

---

### User Story 2 - Result<T, E> Pattern (Priority: P2)

A generic `Result<T, E>` type provides type-safe error handling without try/catch. Includes `ok()`, `err()` constructors and `isOk()`, `isErr()`, `unwrap()`, `map()`, `flatMap()` methods.

**Why this priority**: Improves type safety but is additive - existing code doesn't need to change.

**Independent Test**: Create `Result.ok(42)`, verify `isOk()` returns true and `unwrap()` returns 42. Create `Result.err(new Error('fail'))`, verify `isErr()` returns true and `unwrap()` throws.

**Acceptance Scenarios**:

1. **Given** `Result.ok<number, Error>(42)`, **When** `isOk()` is called, **Then** it returns `true`.
2. **Given** `Result.ok<number, Error>(42)`, **When** `unwrap()` is called, **Then** it returns `42`.
3. **Given** `Result.err<number, Error>(new Error('fail'))`, **When** `isErr()` is called, **Then** it returns `true`.
4. **Given** `Result.err(...)`, **When** `unwrap()` is called, **Then** it throws the error.
5. **Given** `Result.ok(42)`, **When** `map(x => x * 2)` is called, **Then** result is `Result.ok(84)`.
6. **Given** `Result.err(e)`, **When** `map(x => x * 2)` is called, **Then** result is still `Result.err(e)` (function not called).
7. **Given** `Result.ok(42)`, **When** `unwrapOr(0)` is called, **Then** result is `42`.
8. **Given** `Result.err(e)`, **When** `unwrapOr(0)` is called, **Then** result is `0`.

---

### User Story 3 - OptiCoreErrorBoundary Component (Priority: P2)

A React Error Boundary component that automatically classifies caught errors using ErrorClassifier and renders appropriate fallback UI for RenderErrors while silently logging NonRenderErrors.

**Why this priority**: Ties the error classification system to the React rendering lifecycle, completing the error story.

**Independent Test**: Render a child that throws a RenderError, verify the fallback UI is shown. Render a child that throws a NonRenderError, verify the error is logged but no fallback is shown.

**Acceptance Scenarios**:

1. **Given** a child throws a `RenderError`, **When** caught by boundary, **Then** fallback UI is rendered with `error.userMessage`.
2. **Given** a child throws a `NonRenderError`, **When** caught by boundary, **Then** error is logged but children continue rendering (no fallback).
3. **Given** a child throws an unclassified `Error`, **When** caught by boundary, **Then** `ErrorClassifier.classify()` is called to determine type.
4. **Given** a custom `fallback` prop, **When** a RenderError is caught, **Then** the custom fallback receives the error and a `resetError` function.
5. **Given** an `onError` callback prop, **When** any error is caught, **Then** the callback is called with the classified error.
6. **Given** `resetError()` is called from fallback, **When** triggered, **Then** the boundary clears the error state and re-renders children.

---

### Edge Cases

- What happens when ErrorClassifier rules array is empty? (Fall back to defaults)
- What happens when a custom rule's `match` function throws? (Skip rule, continue to next)
- What happens when Result is used with a union error type? (Generic E handles it)
- What happens when ErrorBoundary catches during server-side rendering? (Not applicable - RN only)
- What happens when nested ErrorBoundaries both match? (Inner boundary catches first)

---

## Requirements

### Functional Requirements

- **FR-001**: `ErrorClassifier` MUST expose `addRule(rule: ClassificationRule)` for runtime rule registration.
- **FR-002**: `ClassificationRule` interface MUST define `match(error: unknown): boolean`, `type: ErrorType`, `factory?: (error: unknown) => BaseError`.
- **FR-003**: Custom rules MUST be checked before default rules (custom takes precedence).
- **FR-004**: `Result<T, E>` MUST be a discriminated union with `ok` and `err` variants.
- **FR-005**: `Result` MUST provide: `isOk()`, `isErr()`, `unwrap()`, `unwrapOr(default)`, `map()`, `flatMap()`, `mapErr()`.
- **FR-006**: `OptiCoreErrorBoundary` MUST extend `React.Component` with `getDerivedStateFromError` and `componentDidCatch`.
- **FR-007**: `OptiCoreErrorBoundary` MUST classify unknown errors using `ErrorClassifier`.
- **FR-008**: `OptiCoreErrorBoundary` MUST only show fallback for RenderErrors.
- **FR-009**: `OptiCoreErrorBoundary` MUST log NonRenderErrors via Logger without showing fallback.
- **FR-010**: A default fallback component MUST be provided for apps that don't customize.

### Key Entities

- **ClassificationRule**: Custom error classification rule
- **Result<T, E>**: Discriminated union for type-safe error handling
- **OptiCoreErrorBoundary**: React Error Boundary with classification integration
- **DefaultErrorFallback**: Built-in fallback UI component

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Custom ErrorClassifier rules override default behavior correctly.
- **SC-002**: Result type is fully generic and works with any T and E types.
- **SC-003**: ErrorBoundary correctly differentiates RenderError vs NonRenderError.
- **SC-004**: All existing error system tests pass (backward compatible).
- **SC-005**: 80%+ test coverage on new code.

---

## Files to Create/Modify

- `src/error/ErrorClassifier.ts` - Add custom rule registration
- `src/error/ClassificationRule.ts` - Rule interface
- `src/error/Result.ts` - Result<T, E> type
- `src/error/OptiCoreErrorBoundary.tsx` - Error Boundary component
- `src/error/DefaultErrorFallback.tsx` - Default fallback UI
- `src/error/index.ts` - Export new types
- `test/error/ErrorClassifier.test.ts` - Custom rules tests
- `test/error/Result.test.ts` - Result type tests
- `test/error/OptiCoreErrorBoundary.test.tsx` - Error Boundary tests
