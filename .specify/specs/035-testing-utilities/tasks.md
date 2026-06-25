---
description: 'Task list for spec 035 — Official Test Utilities'
---

# Tasks: Official Test Utilities

**Input**: Design documents from `.specify/specs/035-testing-utilities/`
**Prerequisites**: plan.md, spec.md

**Tests**: Included (adapters, reset, not-in-barrel). **Mark each task `[x]` before the next.** Commit + push per phase. Branch/commit/push/PR only with explicit user approval.

## Phase 1: Setup

- [x] T001 Create/checkout branch `035-testing-utilities` from `main` (ASK before branching)
- [x] T002 Baseline: `npm run type-check` + full `npm test` green
- [x] T003 Confirm exact shapes in `src/adapters/interfaces.ts` (esp. `ConnectivitySnapshot` required fields) and that `_resetAdapterWarnings` is exported from `src/adapters/registry.ts`

## Phase 2: User Story 1 — In-memory adapters (P1)

### Tests (write first)

- [x] T004 [US1] `test/testing/createMemoryAdapters.test.ts`: secure + local round-trip (set→get), `connectivity.fetch()` connected, `device`/`clipboard` return defaults
- [x] T005 [P] [US1] Override merge: `createMemoryAdapters({ connectivity })` keeps the override, others in-memory
- [x] T006 [P] [US1] Isolation: two factory calls don't share storage

### Implementation

- [x] T007 [US1] `src/testing/createMemoryAdapters.ts` — Map-backed impls of all 5 interfaces, override-merge, isolated Maps per call
- [x] T008 [US1] `src/testing/index.ts` — export `createMemoryAdapters`
- [x] T009 [US1] Run US1 tests → green; type-check clean

**Checkpoint**: adapters ship. Commit + push.

## Phase 3: User Story 2 — reset (P1)

### Tests (write first)

- [x] T010 [US2] `test/testing/resetOptiCore.test.ts`: triggered fallback warning re-fires after reset
- [x] T011 [P] [US2] storage cleared after reset; extra logger transport removed after reset
- [x] T012 [P] [US2] `resetOptiCore()` does not throw when OptiCore was never configured

### Implementation

- [x] T013 [US2] `src/testing/resetOptiCore.ts` — `_resetAdapterWarnings()` + `Logger.clearTransports()` + `StorageManager.clearAll()`, each guarded. NOTE: returns `Promise<void>` (async) — deviation from the spec's `void`, because `clearAll()` is async; consumers `await resetOptiCore()`.
- [x] T014 [US2] Not needed — `Logger` already exposes public `clearTransports()`; no `__resetForTest()` was required on any singleton.
- [x] T015 [US2] Run US2 tests → green; full suite → green

**Checkpoint**: reset works + safe. Commit + push.

## Phase 4: User Story 3 — subpath, prod-safe, docs (P2)

- [x] T016 [US3] `package.json`: add `"./testing"` subpath to `exports` (match existing shape). Do NOT touch `src/index.ts`.
- [x] T017 [US3] `test/testing/notInBarrel.test.ts`: main barrel does NOT export `createMemoryAdapters`/`resetOptiCore`; subpath does
- [x] T018 [P] [US3] Grep guard: no `jest`/`@testing-library` import in `src/testing/`
- [x] T019 [P] [US3] Update `docs/TESTING.md` to use `createMemoryAdapters()`/`resetOptiCore()`; add `./testing` to the README import-map

**Checkpoint**: discoverable + prod-safe + documented. Commit + push.

## Phase 5: Polish & Verification

- [x] T020 Full suite green; new `testing` module coverage ≥80%; lint + type-check clean; no `console.log`/`any`/`!!`
- [x] T021 Updated CLAUDE.md spec list (035), spec-numbering hint → 036, README features (Test-Ready + 760 tests), INDEX testing row, README import-map. CHANGELOG under `[Unreleased]`. No version bump (batched).
- [x] T022 Committed + pushed; fast-forwarded `main`. No tag / no version bump (deferred to batch release). No PR.

## Dependencies & Execution Order

- Phase 1 → (2, 3 are both P1; adapters then reset — reset tests may use the adapters) → 4 → 5.
- Tests first; mark each task `[x]` before the next.

## Notes

- New surface lives ONLY at `opticore-react-native/testing` — never in the main barrel (prod bundles exclude it).
- No test-runner imports in `src/testing/` (plain functions/objects).
- Additive; no version bump now — released with the batch bump (will be part of 2.9.0).
