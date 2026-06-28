# Feature Specification: Official Test Utilities

**Feature Branch**: `035-testing-utilities`
**Created**: 2026-06-25
**Status**: Draft (ready to execute)
**Input**: Ship the testing helpers that spec 033 only _documented_. Today consumers hand-roll in-memory adapters and reset logic to test code that uses OptiCore. Provide a first-class `opticore-react-native/testing` entry with `createMemoryAdapters()` and `resetOptiCore()` so app tests are trivial. Additive, non-breaking; no test-framework coupling.

## Context / Problem

Spec 033 added a "Testing OptiCore in your app" guide — but the patterns it describes
(implementing `OptiCoreAdapters` with Maps, resetting singletons/warnings between tests)
are **hand-rolled by every consumer**. The library has the adapter interfaces and the
memory-fallback concept internally; it just doesn't _expose_ ready-made test doubles.

This spec ships them at a dedicated subpath:

- `createMemoryAdapters(overrides?)` — a full `OptiCoreAdapters` bundle of Map-backed
  in-memory implementations, to pass to `OptiCoreProvider`'s `config.adapters`.
- `resetOptiCore()` — best-effort reset of cross-test state (adapter fallback warnings,
  storage, logger transports) so suites don't leak state between tests.

**Placement:** a new `opticore-react-native/testing` subpath, **NOT** re-exported from the
main barrel — exactly like `navigation`. This keeps test helpers out of production
bundles (they're only pulled in when a test imports the subpath).

**No test-framework coupling:** the module must not import Jest, RNTL, or any test runner.
It returns plain objects/functions; consumers wire them into their own framework. (A
`renderWithOptiCore`-style helper that needs RNTL is explicitly out of scope.)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - In-memory adapters in one call (Priority: P1)

A developer testing a component/hook that uses `storage`/`connectivity`/`device`/
`clipboard` passes `createMemoryAdapters()` to `OptiCoreProvider` (or overrides one) and
gets working, isolated, in-memory behavior with no native modules.

**Why this priority**: This is the bulk of the boilerplate consumers write today.

**Independent Test**: `createMemoryAdapters()` returns an object implementing all five
adapter interfaces; a `setItem`/`getItem` round-trips; `connectivity.fetch()` returns a
connected snapshot; overrides replace the named adapter and leave the rest in-memory.

**Acceptance Scenarios**:

1. **Given** `createMemoryAdapters()`, **When** used as `config.adapters`, **Then** storage/secure/connectivity/device/clipboard all work in-memory with no native peers.
2. **Given** `createMemoryAdapters({ connectivity: offlineDouble })`, **When** resolved, **Then** `connectivity` is the override and the other four remain in-memory.
3. **Given** the secure + local adapters, **When** a value is set then read, **Then** it round-trips; instances created by separate `createMemoryAdapters()` calls are isolated.

---

### User Story 2 - Reset state between tests (Priority: P1)

A developer calls `resetOptiCore()` in `afterEach` to clear cross-test state (the one-time
adapter fallback warnings, in-memory storage, registered logger transports) so tests don't
leak into each other.

**Why this priority**: Singletons persist across tests in a process; without a reset,
state bleeds and tests become order-dependent.

**Independent Test**: After writing storage / adding a logger transport / triggering a
fallback warning, `resetOptiCore()` returns those to a clean baseline (verified by
re-observing the warning, empty storage, no extra transports).

**Acceptance Scenarios**:

1. **Given** a triggered memory-fallback warning, **When** `resetOptiCore()` runs, **Then** the one-time warning can fire again (re-armed via `_resetAdapterWarnings()`).
2. **Given** data written to the in-memory storage, **When** `resetOptiCore()` runs, **Then** subsequent reads return empty.
3. **Given** extra logger transports added in a test, **When** `resetOptiCore()` runs, **Then** they are removed.

---

### User Story 3 - Discoverable, prod-safe, documented (Priority: P2)

The utilities are exported only from `opticore-react-native/testing`, documented in the
testing guide, and never bundled into production code.

**Acceptance Scenarios**:

1. **Given** the package, **When** a consumer imports `opticore-react-native/testing`, **Then** `createMemoryAdapters`/`resetOptiCore` resolve with types.
2. **Given** the main barrel, **When** inspected, **Then** the testing utilities are NOT re-exported there (prod bundles exclude them).
3. **Given** `docs/TESTING.md`, **When** read, **Then** the hand-rolled examples are replaced/augmented with `createMemoryAdapters()` + `resetOptiCore()`.

---

### Edge Cases

- `resetOptiCore()` must be safe to call even if `OptiCoreProvider` never ran (no throw).
- Reset must only touch state that has a safe reset; anything requiring a new singleton API gets a minimal, internal `__resetForTest()` (additive) rather than unsafe poking.
- The testing module must remain importable in a plain Node/Jest env (no native peers, no RN runtime assumptions beyond what the adapters already abstract).
- Memory adapters must be independent per `createMemoryAdapters()` call (no shared global Map).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Add `createMemoryAdapters(overrides?: Partial<OptiCoreAdapters>): OptiCoreAdapters` returning Map-backed implementations of `SecureStorageAdapter`, `LocalStorageAdapter`, `ConnectivityAdapter`, `DeviceAdapter`, `ClipboardAdapter`, merged with `overrides`.
- **FR-002**: Memory adapters MUST be self-contained and isolated per call (own Maps; no shared module state).
- **FR-003**: Add `resetOptiCore()` performing a best-effort cross-test reset: call `_resetAdapterWarnings()`, clear in-memory storage, and clear extra logger transports. MUST be safe (never throw) if OptiCore was never configured.
- **FR-004**: Where a singleton lacks a safe reset, add a minimal internal `__resetForTest()` (additive, underscore-prefixed) rather than mutating private state externally.
- **FR-005**: Expose both via a new `opticore-react-native/testing` subpath (package.json `exports` + `src/testing/index.ts`). MUST NOT be re-exported from `src/index.ts` (keep test code out of prod bundles — mirror `navigation`).
- **FR-006**: The testing module MUST NOT import Jest/RNTL/any test runner. Plain functions/objects only.
- **FR-007**: Tests cover memory-adapter round-trip + isolation + overrides (US1), reset behavior (US2), and that the subpath is not in the main barrel (US3). Full suite green; ≥80% coverage on new code.
- **FR-008**: Update `docs/TESTING.md` to use `createMemoryAdapters()`/`resetOptiCore()`; add `opticore-react-native/testing` to the README import-map. CHANGELOG under `[Unreleased]`; **no version bump** (batched per the current release directive).

### Out of Scope

- A `renderWithOptiCore()` helper (would couple to RNTL).
- Network mocking (consumers spy on `api`/`request` per the 033 guide).
- Auto-reset hooks / global setup files.

### Key Entities

- **`createMemoryAdapters`**: factory → `OptiCoreAdapters` of in-memory doubles.
- **`resetOptiCore`**: best-effort cross-test state reset.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer can fully test storage/connectivity/device/clipboard code with **one import** and **no hand-rolled adapters**.
- **SC-002**: `resetOptiCore()` returns warnings/storage/transports to baseline (verified by test); safe when unconfigured.
- **SC-003**: The testing utilities are reachable only via `opticore-react-native/testing` and absent from the main barrel (verified).
- **SC-004**: Full suite + type-check pass; new module coverage ≥80%; no test-runner imports in `src/testing/`.
