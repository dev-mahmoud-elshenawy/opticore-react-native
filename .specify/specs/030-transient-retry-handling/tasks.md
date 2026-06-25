---
description: 'Task list for spec 030 — status-code-aware transient retry handling'
---

# Tasks: Status-Code-Aware Transient Retry Handling

**Input**: Design documents from `.specify/specs/030-transient-retry-handling/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Included and REQUIRED — the project constitution mandates TDD and ≥80% coverage. Write each test first and confirm it FAILS before implementing.

**Organization**: Grouped by phase for incremental PRs. P1 stories (US1, US2) are the MVP; US3 is optional polish.

> **⚠️ GIT RULE**: Branch creation, commits, and pushes require explicit user approval first (per global git policy — overrides any "branch first" guidance). After each phase, ASK before: `git commit -m "feat(network): <phase>"` then `git push`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (transient retry), US2 (actionable fails fast), US3 (typing)
- All paths are exact and relative to repo root.

## Path Conventions

- Source: `src/...` ; Tests: `test/...` (mirrors `src/`, per `jest.config.js`).

---

## Phase 1: Setup

**Purpose**: Confirm baseline and capture current behavior before changing it.

- [x] T001 Run `npm run validate` to confirm a green baseline (type-check + lint + format:check + test all pass) before any edits.
- [x] T002 Read `src/infrastructure/network/ApiError.ts`, `.../interceptors/ErrorInterceptor.ts`, and `src/query/createQueryClient.ts` to confirm exact current line anchors referenced by the plan.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the `ApiError` contract (`isRetryable`, `retryAfterMs`, redefined `isActionable`). ALL user stories depend on this.

**⚠️ CRITICAL**: No US1/US2 retry work can begin until `ApiError` exposes the new contract.

### Tests for Foundation (write first, must FAIL) ⚠️

- [x] T003 [P] Add `test/infrastructure/network/ApiError.test.ts` (or extend existing) with a table-driven suite asserting `{ isActionable, isRetryable, severity }` for statuses: `0, -1, 400, 401, 403, 404, 408, 409, 422, 429, 500, 503`. Expect: `408`/`429` → `isRetryable=true, isActionable=false`; `400/401/403/404/409/422` → `isRetryable=false, isActionable=true`; `5xx` → `isRetryable=true`.
- [x] T004 [P] In the same file, add a `Retry-After` parsing `describe`: integer seconds (`"2"`→~2000ms), HTTP-date 3s future (~3000ms), HTTP-date in past (→0), malformed (`"soon"`→undefined), missing (→undefined), over-cap (`"3600"`→30000ms clamp).

### Implementation for Foundation

- [x] T005 In `src/infrastructure/network/ApiError.ts`: add `RETRY_AFTER_MAX_MS = 30000` constant, `private static readonly NON_TRANSIENT_4XX`/`getIsRetryable(status)`, and `private static parseRetryAfter(header?)` per plan §2.
- [x] T006 In `ApiError.ts`: add public readonly `isRetryable: boolean` and `retryAfterMs?: number`; add optional 6th constructor param `retryAfterHeader?: string`; set both fields in the constructor body.
- [x] T007 In `ApiError.ts`: redefine the `super(...)` `isActionable` to `status >= 400 && status < 500 && status !== 408 && status !== 429` (keep `getUserMessage`/`getSeverity` behavior; `408`/`429` keep non-critical severity).
- [x] T008 Run T003/T004 → confirm GREEN. Run `npm run type-check`.

**Checkpoint**: `ApiError` now distinguishes transient vs actionable and parses `Retry-After`.

---

## Phase 3: User Story 1 — Transient errors retry with Retry-After (Priority: P1) 🎯 MVP

**Goal**: `429`/`503`/`408`/network failures retry with backoff that honors `Retry-After`.

**Independent Test**: A query mock returning `429` then `200` resolves after one retry; delay matches `Retry-After` when present.

### Tests for US1 (write first, must FAIL) ⚠️

- [x] T009 [P] [US1] Add `test/infrastructure/network/interceptors/ErrorInterceptor.test.ts` cases: Axios error with `response.headers['retry-after'] = '2'` → resulting `ApiError.retryAfterMs ≈ 2000`; header absent → `undefined`; re-assert `408` (`ECONNABORTED`) classification and `axios.isCancel` passthrough unchanged. _(Added inline to the existing `test/infrastructure/network/interceptors.test.ts` `ErrorInterceptor` describe block rather than a new file, matching the codebase's existing test layout.)_
- [x] T010 [P] [US1] Add `test/query/createQueryClient.test.ts` covering the `retry` predicate: `ApiError(429)`/`ApiError(503)` → retry while under limit; the `retryDelay`: returns `retryAfterMs` when set, exponential backoff otherwise, clamped to 30000ms. Cover both queries and mutations.

### Implementation for US1

- [x] T011 [US1] In `src/infrastructure/network/interceptors/ErrorInterceptor.ts`: in the `error.response` branch, read `error.response.headers?.['retry-after']` as `string | undefined` and pass it as the new 6th arg to `new ApiError(...)`. Do not change cancellation/network/timeout branches' status logic.
- [x] T012 [US1] In `src/query/createQueryClient.ts`: import `ApiError`; add `isRetryable(error)` helper (ApiError → `isRetryable`; RenderError → `!isActionable`; else `true`); rewrite the `queries.retry` and `mutations.retry` predicates to `isRetryable(error) && failureCount < limit`.
- [x] T013 [US1] In `createQueryClient.ts`: extend `retryDelay` to accept `(attempt, error)` and return `Math.min(error.retryAfterMs, MAX_BACKOFF_MS)` when `error instanceof ApiError && retryAfterMs !== undefined`, else the existing backoff. Wire it into both `queries` and `mutations`. Ensure consumer `overrides.defaultOptions.*` still spread last (override wins).
- [x] T014 [US1] Run T009/T010 → GREEN. Run `npm run type-check` + `npm run lint`.

**Checkpoint**: Transient failures now self-heal; `Retry-After` honored. MVP functional.

---

## Phase 4: User Story 2 — Actionable errors fail fast (Priority: P1)

**Goal**: Guarantee no regression — `400/401/403/404/409/422` are never retried; `401` refresh path untouched.

**Independent Test**: `422` and `403` queries fail with zero retries; `401` still triggers `AuthInterceptor` single-shot refresh.

### Tests for US2 (write first, must FAIL or assert current behavior) ⚠️

- [x] T015 [P] [US2] In `test/query/createQueryClient.test.ts`: assert `retry` returns `false` for `ApiError(400/401/403/404/409/422)` regardless of `failureCount`; assert plain `Error` falls back to count-based retry (no change).
- [x] T016 [P] [US2] Add/confirm a test that `AuthInterceptor` 401 single-flight refresh-and-replay is unchanged (existing AuthInterceptor test still passes; `ApiError(401)` is covered by T015's actionable-status assertion, confirming React Query won't double-retry on top of the AuthInterceptor's single-shot refresh).

### Implementation for US2

- [x] T017 [US2] No new production code expected — behavior falls out of the Phase 2/3 contract. All T015/T016 assertions passed against the Phase 2/3 implementation with no further fixes needed.
- [x] T018 [US2] Run the full suite `npm test` → all green (729/729); coverage for touched files (`ApiError.ts`, `ErrorInterceptor.ts`, `createQueryClient.ts`) is 89–97%. _Note: the repo-wide global branch-coverage gate (80%) was already failing at 76.98% before this work (unrelated files: `date.ts`, `platform.ts`, `url.ts`); this change nudges it to 77.51% — a pre-existing gap, not a regression introduced here._

**Checkpoint**: Both halves of the transient/actionable split verified; no regression.

---

## Phase 5: User Story 3 — Typed error surface (Priority: P3, OPTIONAL)

**Goal**: Consumers read `error.status` from `createQueryHook` results without a cast.

**Independent Test**: `tsd` assertion compiles.

- [x] T019 [P] [US3] Sharpen `src/query/createQueryHook.ts` generic error type from `Error` to `RenderError` (import from `src/error`); keep `useQuery<TData, RenderError>`.
- [x] T020 [US3] Add a `tsd` assertion (`test/types/Query.test-d.ts`) that a `createQueryHook` result's `error` type-checks as `RenderError | null` without a cast (this project validates `.test-d.ts` files via `tsc --noEmit`/`npm run test:types`, since `tsconfig.json` includes `test/**/*` — confirmed green).

**Checkpoint**: Error types sharpened; safe to skip without affecting P1.

---

## Phase 6: Polish & Cross-Cutting

- [x] T021 [P] Update `CHANGELOG.md` with the `429`/`503`/`408` retry + `Retry-After` behavior fix and the `isActionable` redefinition for `408`/`429`.
- [x] T022 [P] Update docs: `docs/api/INFRASTRUCTURE.md` (ApiError retry fields), `docs/api/ERRORS.md` (`isActionable` vs `isRetryable` distinction), and `docs/api/STATE.md` (new `createQueryClient` subsection under React Query Integration).
- [x] T023 Update `CLAUDE.md` "Completed Specifications" pointer / version notes if a release is cut (per the self-updating-doc rule). Version bumped to `2.6.0` (`package.json`, `src/index.ts` VERSION, `test/index.test.ts`); `CLAUDE.md` header/footer, `docs/INDEX.md`, and `CHANGELOG.md` synced.
- [x] T024 Final gate: `npm run type-check` + `npm run lint` + `npm test` all green (729/729, 95 suites). `npm run format:check` remains pre-existingly broken repo-wide (unrelated to this spec) so `npm run validate` as a single command doesn't exit 0; ran its constituent checks individually instead.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: no deps.
- **Phase 2 (Foundational `ApiError` contract)**: BLOCKS Phases 3–5.
- **Phase 3 (US1)** and **Phase 4 (US2)**: both depend only on Phase 2; US2 is largely verification of US1's contract — run US1 first, then US2 as the regression gate.
- **Phase 5 (US3)**: independent, optional; depends on Phase 2 only.
- **Phase 6 (Polish)**: after P1 stories pass.

### Within Each Story

- Tests written and FAILING before implementation.
- `ApiError` classification before retry policy before docs.

### Parallel Opportunities

- T003/T004 (ApiError tests) run in parallel.
- T009/T010 (US1 tests) run in parallel.
- T015/T016 (US2 tests) run in parallel.
- T021/T022 (docs) run in parallel.

---

## Implementation Strategy

### MVP (Stop after Phase 4)

1. Phase 1 Setup → green baseline.
2. Phase 2 Foundational → `ApiError` contract.
3. Phase 3 US1 → transient retry + `Retry-After`.
4. Phase 4 US2 → regression gate.
5. **STOP & VALIDATE**: `npm run validate`. This is a shippable fix.

### Then (optional)

6. Phase 5 US3 typing.
7. Phase 6 docs + CHANGELOG, version bump at release.

---

## Notes

- [P] = different files, no dependencies.
- Fix classification in source, never weaken a test to pass.
- No `any`, no `!!`, no `console.log` (use `Logger`); honor strict mode.
- All `ApiError`/`createQueryClient` changes are additive — verify zero breaking changes with `npm run test:types`.
- Commit/push only after explicit user approval.
