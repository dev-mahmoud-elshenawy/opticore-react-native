# Feature Specification: Infrastructure Hardening

**Spec Number**: 025
**Feature Branch**: `feature/025-infrastructure-hardening`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P2
**Input**: Code Review 2026-02-11, Sections 3 (Infrastructure), 7 (Providers), 9 (Theme)

## Problem Statement

Several infrastructure components have stability issues discovered during code review:

1. **SecureStorage async init race** - Constructor calls `this.loadKeys()` (async) but doesn't await it. A `get()` call immediately after construction may return `null` because keys haven't loaded yet.
2. **CoreProvider disposes singletons** - Cleanup effect calls `connectivityManager.dispose()` and `lifecycleManager.dispose()` on unmount. These are singletons shared across the app - disposing them breaks other consumers.
3. **ThemeManager listener accumulation** - `setupAppearanceListener()` is called in constructor AND in `init()` (line 66-68), potentially creating duplicate system appearance listeners.
4. **Theme shadows use CSS syntax** - `ThemeShadows` values are CSS strings (`'0px 4px 6px rgba(0,0,0,0.1)'`). React Native uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` object properties. These CSS strings are unusable on RN.
5. **ThemeManager uses `console.warn`** - Should use Logger instead of direct console calls.

---

## User Scenarios & Testing

### User Story 1 - SecureStorage Initialization Guard (Priority: P1)

SecureStorage ensures `loadKeys()` completes before any `get()`, `set()`, or `remove()` operations execute. Operations called before init completes are queued.

**Why this priority**: Data loss risk - early reads return null for existing keys.

**Independent Test**: Create SecureStorage, immediately call `get('existing_key')`, verify it returns the persisted value (not null).

**Acceptance Scenarios**:

1. **Given** SecureStorage with persisted keys, **When** `get('token')` is called immediately after `getInstance()`, **Then** it waits for `loadKeys()` and returns the stored value.
2. **Given** SecureStorage initializing, **When** `set('key', 'value')` is called, **Then** it waits for init before writing.
3. **Given** SecureStorage already initialized, **When** `get()` is called, **Then** it executes immediately without delay.
4. **Given** `loadKeys()` fails (corrupted storage), **When** `get()` is called, **Then** it returns null and logs a warning (doesn't crash).

---

### User Story 2 - CoreProvider Singleton Safety (Priority: P1)

CoreProvider does NOT dispose singletons on unmount. It only removes its own listeners.

**Why this priority**: Current behavior breaks ConnectivityManager and LifecycleManager for any code outside the provider.

**Independent Test**: Mount CoreProvider, add a connectivity listener outside the provider, unmount CoreProvider, verify the external listener still fires.

**Acceptance Scenarios**:

1. **Given** CoreProvider mounted, **When** it unmounts, **Then** `ConnectivityManager` is NOT disposed (still functional for other consumers).
2. **Given** CoreProvider mounted, **When** it unmounts, **Then** `LifecycleManager` is NOT disposed (still functional for other consumers).
3. **Given** CoreProvider mounts and initializes connectivity, **When** it unmounts, **Then** only the provider's own internal listener is removed.
4. **Given** multiple CoreProvider instances (e.g., nested layouts), **When** one unmounts, **Then** the other still works correctly.

---

### User Story 3 - Theme Shadows React Native Format (Priority: P1)

`ThemeShadows` type uses React Native shadow properties instead of CSS strings.

**Why this priority**: Current shadow values are completely unusable on React Native - the primary target platform.

**Independent Test**: Access `theme.shadows.md` and apply it to a View's style. Verify the shadow renders correctly on iOS and Android.

**Acceptance Scenarios**:

1. **Given** `theme.shadows.md`, **When** applied to a View style, **Then** the shadow renders on iOS using `shadowColor/shadowOffset/shadowOpacity/shadowRadius`.
2. **Given** `theme.shadows.md`, **When** applied to a View style, **Then** the shadow renders on Android using `elevation`.
3. **Given** a dark theme, **When** shadows are accessed, **Then** they have appropriate opacity values for dark backgrounds.
4. **Given** a custom theme, **When** shadow values are provided, **Then** they follow the RN shadow object format.

---

### User Story 4 - ThemeManager Listener Fix (Priority: P2)

ThemeManager sets up exactly ONE system appearance listener, never duplicates.

**Why this priority**: Duplicate listeners waste resources and can cause double re-renders.

**Independent Test**: Call `init()` multiple times, verify only 1 appearance listener is registered.

**Acceptance Scenarios**:

1. **Given** ThemeManager just created, **When** `init()` is called, **Then** exactly 1 appearance listener exists.
2. **Given** ThemeManager already initialized, **When** `init()` is called again, **Then** no additional listener is created.
3. **Given** ThemeManager disposed, **When** `init()` is called, **Then** a new listener is created (1 total).

---

### User Story 5 - ThemeManager Logger Integration (Priority: P3)

ThemeManager uses `Logger` instead of `console.warn` for all warning/error messages.

**Why this priority**: Consistency. Logger respects production mode suppression.

**Acceptance Scenarios**:

1. **Given** Logger in production mode, **When** ThemeManager encounters a warning, **Then** no output is produced.
2. **Given** Logger in debug mode, **When** ThemeManager encounters a warning, **Then** the warning is logged through Logger.

---

### Edge Cases

- What happens when SecureStorage `loadKeys()` is called on web platform? (Should throw platform error, not race condition error)
- What happens when CoreProvider is re-rendered with changed `enableConnectivity` prop? (Should add/remove listener, not dispose manager)
- What happens when theme shadows are applied to a component that doesn't support shadows? (No crash, shadow properties are ignored)
- What happens when `dispose()` is called on ThemeManager twice? (Idempotent, no error)

---

## Requirements

### Functional Requirements

- **FR-001**: `SecureStorage` MUST use an init-guard pattern (ready Promise) to ensure `loadKeys()` completes before operations.
- **FR-002**: All `SecureStorage` public methods MUST await the ready Promise before executing.
- **FR-003**: `CoreProvider` cleanup MUST NOT call `dispose()` on singleton managers.
- **FR-004**: `CoreProvider` MUST only remove listeners it added during its own lifecycle.
- **FR-005**: `ThemeShadows` interface MUST use RN shadow object format: `{ shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }`.
- **FR-006**: `ThemeShadowValue` type MUST include `elevation: number` for Android compatibility.
- **FR-007**: Default themes (`lightTheme`, `darkTheme`) MUST be updated with RN shadow objects.
- **FR-008**: `ThemeManager` MUST track appearance listener state and prevent duplicates.
- **FR-009**: `ThemeManager` MUST use `Logger` instead of `console.warn` for all logging.
- **FR-010**: `setupAppearanceListener()` MUST be idempotent (remove old listener before adding new).

### Key Entities

- **ThemeShadowValue**: `{ shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number }`
- **ThemeShadows**: `{ sm: ThemeShadowValue; md: ThemeShadowValue; lg: ThemeShadowValue; [key: string]: ThemeShadowValue }`
- **InitGuard**: Pattern for ensuring async initialization completes before operations

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: SecureStorage `get()` returns correct value even when called immediately after `getInstance()`.
- **SC-002**: CoreProvider unmount does not break connectivity/lifecycle for other consumers.
- **SC-003**: Theme shadows render correctly on both iOS and Android.
- **SC-004**: ThemeManager never has more than 1 appearance listener.
- **SC-005**: All existing tests continue to pass.
- **SC-006**: 80%+ test coverage on modified files.

---

## Breaking Changes

This spec includes ONE breaking change:

- **`ThemeShadows` type changes from `string` to `ThemeShadowValue` object.** Consuming apps that use `theme.shadows.sm` as a CSS string will need to update. This is intentional because the current CSS string values **do not work on React Native** (the target platform).

Migration:

```typescript
// Before (broken on RN):
style={{ boxShadow: theme.shadows.md }}  // This never worked

// After (works on RN):
style={{ ...theme.shadows.md }}  // Spread shadow properties
```

---

## Files to Create/Modify

- `src/infrastructure/storage/SecureStorage.ts` - Add init-guard pattern
- `src/providers/CoreProvider.tsx` - Remove singleton dispose, add listener-only cleanup
- `src/theme/types.ts` - Update ThemeShadows to RN format
- `src/theme/defaultThemes.ts` - Update shadow values to RN objects
- `src/theme/ThemeManager.ts` - Fix listener duplication, use Logger
- `test/infrastructure/storage/SecureStorage.test.ts` - Init guard tests
- `test/providers/CoreProvider.test.tsx` - Singleton safety tests
- `test/theme/ThemeManager.test.ts` - Listener duplication tests
- `test/theme/defaultThemes.test.ts` - Shadow format tests
