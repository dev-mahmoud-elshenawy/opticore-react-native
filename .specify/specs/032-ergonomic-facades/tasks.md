---
description: 'Task list for spec 032 — Ergonomic Facades + Verb Sugar'
---

# Tasks: Ergonomic Facades + Verb Sugar

**Input**: Design documents from `.specify/specs/032-ergonomic-facades/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Included — delegation, verb-mapping, and no-side-effect-on-import are mandatory (constitution: TDD, ≥80%).

**Organization**: Tasks grouped by phase. **After completing each task, mark it `[x]` here FIRST, before starting the next.** Commit + push after each phase.

> **⚠️ GIT RULE**: Branch/commit/push and PR only with explicit user approval. After a phase: `git commit -m "feat(facades): complete phase N"` then `git push`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files)
- **[US#]**: User story

---

## Phase 1: Setup

- [x] T001 Created branch `032-ergonomic-facades` from the **`031` tip** (NOT main — v2.7.0 lives on the unmerged 031 branch; main is still v2.6.0). User-approved via spec execution.
- [x] T002 Baseline: `npm run type-check` clean + full `npm test` green (record count)
- [x] T003 Confirm no existing root-barrel export named `api` / `storage` / `logger` (`grep` `src/index.ts` + re-exported modules) to avoid collisions

---

## Phase 2: Foundational

- [x] T004 Confirm exact import paths/types: `ApiClient` (`src/infrastructure/network/ApiClient`), `RequestConfig` (`src/types/Api.types`), `ApiResponse` (`src/infrastructure/network/ApiResponse`), `HttpMethod` (`src/infrastructure`), `StorageManager` + `IStorage`, `Logger`

**Checkpoint**: Edit surface + types confirmed.

---

## Phase 3: User Story 1 — Facades without `.getInstance()` (Priority: P1) 🎯 MVP

**Goal**: `logger` and `storage` facades delegate to their singletons; importing them runs no `getInstance()`.

### Tests (write first)

- [x] T005 [P] [US1] `test/facades/logger.test.ts`: `logger.{debug,info,warn,error}` call `Logger.getInstance().<method>` with identical args
- [x] T006 [P] [US1] `test/facades/storage.test.ts`: `storage.secure`/`storage.local` return `StorageManager.getInstance().secure`/`.local`
- [x] T007 [US1] `test/facades/noSideEffects.test.ts`: importing `../../src/facades` calls **no** `getInstance()` (spy before dynamic import)

### Implementation

- [x] T008 [P] [US1] Create `src/facades/logger.ts` (lazy delegation)
- [x] T009 [P] [US1] Create `src/facades/storage.ts` (lazy `secure`/`local` getters)
- [x] T010 [US1] Create `src/facades/index.ts` re-exporting `logger`, `storage` (api added in Phase 4)
- [x] T011 [US1] Run US1 tests → green

**Checkpoint**: logger/storage facades work, import is side-effect-free. Commit + push Phase 3.

---

## Phase 4: User Story 2 — `api` facade + verb sugar (Priority: P1)

**Goal**: `api.request` passthrough + `get/post/put/patch/delete` map correctly to `request()`; init guard inherited.

### Tests (write first)

- [x] T012 [US2] `test/facades/api.test.ts`: spy `ApiClient.getInstance().request`; assert each verb forwards `{ method, url, data?, ...cfg }` and returns the `request` result
- [x] T013 [P] [US2] Assert `api.request(config)` is a pure passthrough (same args, same return)
- [x] T014 [P] [US2] Assert calling `api.get('/x')` before `configure()`/`CoreSetup.init()` throws the existing init-guard error (no new failure mode)

### Implementation

- [x] T015 [US2] Create `src/facades/api.ts` (`request` + 5 verbs, `VerbConfig = Omit<RequestConfig,'method'|'url'|'data'>`, returns `ApiResponse<T>`)
- [x] T016 [US2] Add `api` to `src/facades/index.ts`
- [x] T017 [US2] Run US2 tests → green; full suite → green; type-check clean

**Checkpoint**: `api` facade complete. Commit + push Phase 4.

---

## Phase 5: User Story 3 — Exports, docs, version (Priority: P2)

### Wiring

- [x] T018 [US3] `src/index.ts`: add `export * from './facades';` (verify no collision)
- [x] T019 [US3] `package.json`: add `"./facades"` subpath to `exports` (match existing subpath shape)

### Docs + version

- [x] T020 [P] [US3] README: switch Quick Start to facade style (`api`/`storage`/`logger`) with a note that singletons remain supported; add an **import-map** table (barrel vs subpath)
- [x] T021 [US3] Bump version 2.7.0 → 2.8.0 in `package.json`, `src/index.ts` VERSION, and `test/index.test.ts`
- [x] T022 [US3] `CHANGELOG.md`: add 2.8.0 entry (facades + verb sugar, additive/non-breaking)

**Checkpoint**: exported + documented + versioned. Commit + push Phase 5.

---

## Phase 6: Polish & Verification

- [x] T023 Full suite green; new `facades` module coverage ≥80%; type-check + lint clean on new/changed files
- [x] T024 [P] Confirm no `console.log` / `any` / `!!` in new files; confirm `tsc --noEmit` (test:types) passes (signatures additive only)
- [x] T025 Update CLAUDE.md (header note, version 2.8.0, spec-numbering hint → 033, Existing Specifications list, footer) per self-updating-doc rule
- [x] T026 Final commit + push; **tag `v2.8.0`** on the feature commit and push the tag (per the v2.7.0 precedent). Do NOT open a PR. (ASK before git actions.)

---

## Dependencies & Execution Order

- Phase 1 → 2 → (3 ∥ 4 are both P1; US1 = logger/storage, US2 = api — different files, parallelizable) → 5 (docs/exports reference both) → 6.
- Within each story: tests first (failing), then implementation.
- Mark each task `[x]` immediately on completion, before the next.

### Parallel Opportunities

- T005/T006 (US1 tests), T008/T009 (US1 impl), T012–T014 (US2 tests), T020/T024 marked [P].
- US1 and US2 can proceed in parallel (separate facade files).

---

## Implementation Strategy

- **MVP**: Phases 1–3 (logger/storage facades) → already removes most `.getInstance()` noise.
- **Incremental**: add `api` verb sugar (Phase 4) → exports/docs/version (Phase 5) → polish (Phase 6).

## Notes

- Purely additive — no breaking changes, no deprecations (2.8.0 minor).
- Verb sugar returns `ApiResponse<T>` (consistent with `request()`), not unwrapped `T`.
- `ApiClient`'s private verb methods stay private (spec 028); sugar lives on the facade and calls public `request()`.
- Facades must never call `getInstance()` at module load (side-effect-free import, spec 030).
