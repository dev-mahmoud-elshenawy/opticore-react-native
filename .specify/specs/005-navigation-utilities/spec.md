# Feature Specification: Navigation Utilities

**Feature Branch**: `005-navigation-utilities`
**Created**: 2026-02-01
**Updated**: 2026-02-02
**Status**: Revised
**Input**: Simplified scope — RouteHelper only, no route path definitions, no RouteGuard

## Overview

Provide a thin `useRouteHelper` hook wrapping Expo Router's `useRouter` for programmatic navigation. This is a **core infrastructure library** used across many projects — route paths and auth guards are app-level concerns and must NOT be defined here.

## Scope

### In Scope

- `useRouteHelper` hook: `push()`, `replace()`, `back()`, `reset()`
- Accepts plain `string` route paths — no registered route types
- Optional `Record<string, string | number>` params for any navigation call
- `NavigationParams` type alias for params

### Out of Scope (App-Level Concerns)

- ❌ Route path definitions / registration — routes are defined by consuming apps
- ❌ RouteGuard / auth protection — app-level business logic
- ❌ Role-based / permission-based access control
- ❌ Declaration merging for route types
- ❌ Typed route names (consuming apps can wrap this hook with their own types)

## User Scenarios & Testing

### User Story 1 - Developer Navigates Between Screens Programmatically (Priority: P1)

A developer using this core library in their app wants to navigate between screens using simple, consistent helper functions without manually interacting with Expo Router's API.

**Why this priority**: Programmatic navigation is essential for post-login redirects, conditional navigation, deep linking, and navigation after async operations.

**Acceptance Scenarios**:

1. **Given** user completes login, **When** `push('/home')` is called, **Then** app navigates to home screen
2. **Given** developer navigates with params, **When** `push('/user/profile', { id: '123' })`, **Then** params are passed correctly
3. **Given** user wants to go back, **When** `back()` is called, **Then** navigation stack pops safely (no-op if at root)
4. **Given** app needs to replace current screen, **When** `replace('/login')`, **Then** current screen is replaced (no back entry)
5. **Given** app needs a full stack reset, **When** `reset('/home')`, **Then** all screens are dismissed and replaced with the target

### Edge Cases

- `back()` called on root screen (no history) → no-op, no crash
- `reset()` called when stack is empty → behaves like `replace()`
- Navigation called with undefined/empty params → navigates without params

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide `push(route, params?)` for stack navigation
- **FR-002**: System MUST provide `replace(route, params?)` for replacing current screen
- **FR-003**: System MUST provide `back()` for safe back navigation (no-op at root)
- **FR-004**: System MUST provide `reset(route, params?)` for clearing stack and navigating
- **FR-005**: All functions MUST accept plain `string` route paths
- **FR-006**: All functions with params MUST accept `Record<string, string | number>` or `undefined`
- **FR-007**: System MUST integrate with Expo Router's `useRouter` hook

### Non-Functional Requirements

- **NFR-001**: 80%+ test coverage
- **NFR-002**: Zero TypeScript errors in strict mode
- **NFR-003**: No app-specific route paths or auth logic

## Success Criteria

- **SC-001**: Developer can navigate programmatically using plain string routes
- **SC-002**: `back()` is safe at root (no crash)
- **SC-003**: `reset()` reliably clears the navigation stack
- **SC-004**: 80%+ test coverage
- **SC-005**: No route path definitions exist in the library
