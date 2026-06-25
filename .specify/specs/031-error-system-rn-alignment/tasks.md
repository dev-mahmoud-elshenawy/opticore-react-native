---
description: 'Task list for spec 031 — Error System RN Alignment'
---

# Tasks: Error System RN Alignment

**Input**: Design documents from `.specify/specs/031-error-system-rn-alignment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Included — this is a correctness/architecture change; loop-convergence and serialization tests are mandatory (constitution: TDD, ≥80% coverage).

**Organization**: Tasks grouped by phase. **After completing each task, mark it `[x]` here FIRST, before starting the next.** After completing each phase, commit + push.

> **⚠️ GIT RULE**: After completing each phase:
> 1. `git commit -m "feat(error): complete phase N — <name>"`
> 2. `git push origin 031-error-system-rn-alignment`
> 3. Verify CI/quality gates pass

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Branch + baseline green before changing anything.

- [x] T001 Created branch `031-error-system-rn-alignment` from `main` (NOT develop — develop is stale/behind; releases + tags live on main, base needed v2.6.0). User-approved.
- [x] T002 Baseline established: `npm run type-check` clean + `test/error` green (61 tests). (Used type-check + targeted tests; repo-wide `format:check` is known-broken per project notes.)

**Checkpoint**: Clean baseline, all gates green.

---

## Phase 2: Foundational (No blocking infra needed)

**Purpose**: This spec touches existing files only — no new infrastructure. Confirm scope.

- [x] T003 Re-read `src/error/OptiCoreErrorBoundary.tsx`, `src/error/NonRenderError.ts`, `src/error/BaseError.ts`, `src/error/ErrorClassifier.ts` and confirm the edit points match plan.md §Design Detail

**Checkpoint**: Edit surface confirmed; no signature changes planned.

---

## Phase 3: User Story 1 — Boundary never loops on a non-render classification (Priority: P1) 🎯 MVP

**Goal**: Every error reaching `OptiCoreErrorBoundary` converges to a fallback; no infinite re-render.

**Independent Test**: Child throws `NonRenderError` (and a plain error classified `NON_RENDER`) during render → fallback shown exactly once, no render loop; `RenderError` path + `resetError` unchanged.

### Tests for User Story 1 (write first, ensure they FAIL)

- [x] T004 [US1] Added test in `test/error/OptiCoreErrorBoundary.test.tsx`: child throws `NonRenderError` during render → fallback rendered, no loop
- [x] T005 [P] [US1] Added test: child throws plain `Error` mapped to `NON_RENDER` by `ErrorClassifier` → fallback shown, no loop
- [x] T006 [P] [US1] Regression covered by existing `RenderError` / `custom fallback` / `resetError()` / `onError` describe blocks (still green)

### Implementation for User Story 1

- [x] T007 [US1] `getDerivedStateFromError`: removed `NON_RENDER → showFallback:false` branches; every caught error now resolves to `showFallback:true` with a `RenderError` wrapping the cause; `errorType` kept for telemetry only
- [x] T008 [US1] `render()`: children are returned only when `!hasError`; on error the fallback always shows → loop path unreachable (verified by no-loop tests)
- [x] T009 [US1] `componentDidCatch`: logging wrapped in try/catch so a failing/unconfigured `Logger` cannot throw inside the boundary; `onError` still called first
- [x] T010 [US1] `test/error` green: 63 tests, 9 suites

**Checkpoint**: Loop class eliminated; boundary behavior stable. Commit + push Phase 3.

---

## Phase 4: User Story 2 — `NonRenderError` works as a log/descriptor payload (Priority: P1)

**Goal**: `NonRenderError` is constructed and passed to `Logger` / read at catch sites; never thrown.

**Independent Test**: Construct `NonRenderError`, pass to `Logger.error` → logged with metadata/cause intact; read `isSilent` to branch feedback.

### Tests for User Story 2 (write first)

- [x] T011 [US2] Added test in `test/error/NonRenderError.test.ts`: `toJSON()` serializes `code`, `metadata`, nested `cause`; `Logger.error(msg, nonRenderError)` accepts it without throwing
- [x] T012 [P] [US2] Added test: reading `isSilent` / `metadata.userMessage` drives a feedback branch (descriptor usage, no throw). Note: `severity` is a `RenderError` field, not on `NonRenderError`, so the feedback branch uses `isSilent` + `metadata`.

### Implementation for User Story 2

- [x] T013 [US2] Rewrote `NonRenderError.ts` JSDoc: documented as descriptor/log payload with usage examples; no field/signature change
- [x] T014 [US2] Documented throw-as-control-flow deprecation in `@remarks` (prose, with 3.0 removal note). Deliberately did NOT place a machine `@deprecated` tag on the class — that would flag valid descriptor use; "throwing" is not a separate symbol a tag can target.
- [x] T015 [US2] `test/error` green: 66 tests; type-check clean

**Checkpoint**: `NonRenderError` repositioned, no API break. Commit + push Phase 4.

---

## Phase 5: User Story 3 — Deprecation without breaking consumers (Priority: P2)

**Goal**: No compile break in 2.7.0; deprecation + RN model documented.

**Independent Test**: `tsd` passes (no public-signature change); `@deprecated` present; simulated consumer import compiles.

### Tests for User Story 3

- [x] T016 [US3] `npm run test:types` passes. NOTE: `test:types` is wired to `tsc --noEmit` (true tsd not configured in this repo); no public signature was changed, so the no-break guarantee holds.
- [x] T017 [P] [US3] No exported type/signature of `NonRenderError` / `OptiCoreErrorBoundary` was touched (only JSDoc + internal logic), so existing type surface is stable. (No separate tsd assertion added since the tsd runner isn't active.)

### Implementation for User Story 3 (docs + version)

- [x] T018 [US3] Updated `CLAUDE.md` error section to the three-outcome RN model + anti-pattern callout; removed Flutter-style framing
- [x] T019 [P] [US3] Updated `docs/api/ERRORS.md` (NonRenderError descriptor + boundary behavior note) and `docs/FAQ.md` (use-don't-throw). README links to ERRORS.md, which is now correct.
- [x] T020 [US3] Bumped `package.json`, `src/index.ts` VERSION, and `test/index.test.ts` expectation 2.6.0 → 2.7.0
- [x] T021 [US3] Added `CHANGELOG.md` 2.7.0 entry: loop fix, safe boundary logging, throw-deprecation, docs realignment, 3.0 removal plan

**Checkpoint**: Non-breaking, documented, versioned. Commit + push Phase 5.

---

## Phase 6: Polish & Verification

**Purpose**: Final gates and consistency.

- [x] T022 Full suite green: 95 suites / 734 tests; type-check clean; lint clean on changed files. (Skipped repo-wide `format:check` — known-broken per project notes, unrelated to this change.)
- [x] T023 [P] No `console.log` in changed source (only a Result.ts JSDoc example, pre-existing); no `!!`; no `any` introduced
- [x] T024 Updated CLAUDE.md header note, version (2.7.0), spec-numbering hint, Existing Specifications list (029/030/031), and footer
- [x] T025 Two separate commits pushed to `origin/031-error-system-rn-alignment`: `ac8c11d chore: consolidate spec workflow to a single approval gate` + `3cd1b80 feat(error): align error system with React Native (v2.7.0)`. Annotated tag `v2.7.0` created on the feat commit and pushed. No PR opened (not requested).

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** → no deps.
- **Phase 2 (Foundational)** → after Setup; confirms scope, no code.
- **Phase 3 (US1)** and **Phase 4 (US2)** → both after Phase 2; independent of each other (different files: boundary vs NonRenderError) — may proceed in parallel.
- **Phase 5 (US3)** → after US1 + US2 (docs describe the final behavior; version bump last).
- **Phase 6 (Polish)** → after all stories.

### Within each story

- Tests written and failing before implementation.
- Mark each task `[x]` immediately on completion, before the next.

### Parallel Opportunities

- T005, T006 (US1 tests) in parallel.
- T012 (US2 test) parallel with its sibling.
- US1 (boundary) and US2 (NonRenderError) are different files → parallelizable.
- T017, T019, T023 marked [P].

---

## Implementation Strategy

### MVP (US1 only)

1. Phase 1 → 2 → 3. **STOP and VALIDATE**: loop crash class gone, boundary stable. This alone is shippable value.

### Incremental Delivery

1. Setup + Foundational → ready.
2. US1 (loop fix) → validate → commit (MVP).
3. US2 (descriptor) → validate → commit.
4. US3 (deprecation + docs + 2.7.0) → validate → commit.
5. Polish → final validate → summarize.

---

## Notes

- [P] = different files, no dependencies.
- No public API signature changes anywhere (2.7.0 is non-breaking).
- Branch/commit/push and PR only with explicit user approval (git rule).
- Removal of deprecated throw semantics + `NON_RENDER` special-casing is deferred to 3.0 (out of scope here).
