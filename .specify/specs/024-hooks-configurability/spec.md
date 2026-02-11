# Feature Specification: Hooks Configurability & Fixes

**Spec Number**: 024
**Feature Branch**: `feature/024-hooks-configurability`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P2
**Input**: Code Review 2026-02-11, Sections 6 (Custom Hooks), 16B (Hardcoded Values)

## Problem Statement

The Custom Hooks module (Spec 006) has 3 issues:

1. **`useResponsive` breakpoints hardcoded** - Values `360/768/1024` are exported constants. Apps with different design systems (e.g., Tailwind uses 640/768/1024/1280) can't customize without forking.
2. **`useSafeCall` missing `isMounted` guard** - Can update state after component unmount, causing React warnings.
3. **`useFormState` handler not memoized** - `handleSubmit` creates a new function reference on every render, potentially causing unnecessary re-renders in child components.

---

## User Scenarios & Testing

### User Story 1 - Configurable Responsive Breakpoints (Priority: P1)

`useResponsive()` reads breakpoints from either a parameter, ConfigContext (Spec 018), or defaults - in that order of precedence.

**Why this priority**: Breakpoints are the most common hardcoded value affecting reuse.

**Independent Test**: Call `useResponsive({ small: 375, medium: 640, large: 1280 })` with a screen width of 700 and verify `isMedium: true`.

**Acceptance Scenarios**:

1. **Given** no parameters and no ConfigContext, **When** `useResponsive()` is called, **Then** default breakpoints (360/768/1024) are used (backward compatible).
2. **Given** custom breakpoints as parameter `useResponsive({ small: 375, medium: 640, large: 1280 })`, **When** screen width is 700, **Then** `isMedium: true`, `isLarge: false`.
3. **Given** breakpoints in ConfigContext (via OptiCoreProvider), **When** `useResponsive()` is called without params, **Then** context breakpoints are used.
4. **Given** both parameter breakpoints AND context breakpoints, **When** called, **Then** parameter takes precedence.

---

### User Story 2 - useSafeCall isMounted Guard (Priority: P1)

`useSafeCall` tracks component mount status and skips state updates after unmount.

**Why this priority**: Fixes a memory leak / React warning bug.

**Independent Test**: Start an async operation via `useSafeCall`, unmount the component before it completes, verify no state update warning.

**Acceptance Scenarios**:

1. **Given** a mounted component using `useSafeCall`, **When** async call completes, **Then** state is updated normally.
2. **Given** a component that unmounts during async call, **When** the call resolves, **Then** state update is skipped (no React warning).
3. **Given** a component that unmounts during async call, **When** the call rejects, **Then** error update is skipped (no React warning).

---

### User Story 3 - useFormState useCallback Memoization (Priority: P2)

`handleSubmit` returned by `useFormState` is wrapped in `useCallback` to maintain referential stability across renders.

**Why this priority**: Performance improvement, prevents unnecessary re-renders of form submit buttons.

**Independent Test**: Render a component using `useFormState`, re-render with new state, verify `handleSubmit` reference is the same.

**Acceptance Scenarios**:

1. **Given** a component using `useFormState`, **When** the component re-renders, **Then** `handleSubmit` function reference is stable (same reference).
2. **Given** `handleSubmit` is passed to a `React.memo` child, **When** parent re-renders, **Then** memoized child does NOT re-render.

---

### Edge Cases

- What happens when `useResponsive` receives partial breakpoints (e.g., only `small`)? (Merge with defaults)
- What happens when `useSafeCall` is called with a sync function? (Works normally, guard still applies)
- What happens when breakpoint values are zero or negative? (Clamp to 0 minimum)

---

## Requirements

### Functional Requirements

- **FR-001**: `useResponsive()` MUST accept an optional `breakpoints` parameter of type `Partial<Breakpoints>`.
- **FR-002**: `useResponsive()` MUST fall back to ConfigContext breakpoints, then defaults.
- **FR-003**: `Breakpoints` type MUST define `small`, `medium`, `large` as optional numbers.
- **FR-004**: `useSafeCall` MUST use a `useRef(true)` to track mount status and set it to `false` on unmount.
- **FR-005**: `useSafeCall` MUST check `isMounted.current` before any `setState` call.
- **FR-006**: `useFormState`'s `handleSubmit` MUST be wrapped in `useCallback` with appropriate dependencies.
- **FR-007**: All changes MUST be backward compatible (no signature changes to existing public API).
- **FR-008**: The exported `breakpoints` constant MUST remain for backward compatibility but be marked as default values.

### Key Entities

- **Breakpoints**: Interface `{ small?: number; medium?: number; large?: number }`
- **useResponsive**: Updated hook with optional breakpoints param
- **useSafeCall**: Fixed hook with isMounted guard

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: `useResponsive` uses custom breakpoints when provided.
- **SC-002**: `useSafeCall` produces no React warnings on unmount during async operations.
- **SC-003**: `handleSubmit` maintains referential stability across renders.
- **SC-004**: All existing hook tests pass without modification.
- **SC-005**: 80%+ coverage on modified hook files.

---

## Files to Create/Modify

- `src/hooks/useResponsive.ts` - Accept breakpoints param, read from context
- `src/hooks/useSafeCall.ts` - Add isMounted guard
- `src/forms/useFormState.ts` - Memoize handleSubmit
- `test/hooks/useResponsive.test.ts` - Custom breakpoint tests
- `test/hooks/useSafeCall.test.ts` - Unmount guard tests
- `test/forms/useFormState.test.ts` - Memoization tests
