---
description: 'Task list for spec 034 — Response Data Convenience'
---

# Tasks: Response Data Convenience

**Input**: Design documents from `.specify/specs/034-response-data-convenience/`
**Prerequisites**: plan.md, spec.md

> **⛔ BLOCKED**: do not start until the unwrapped-surface option is confirmed (A `api.data.*` recommended / B `*Data` / C `unwrap()`). Tasks below assume **Option A**.

**Tests**: Included (parity, unwrap, no-side-effect). **Mark each task `[x]` before the next.** Commit + push per phase. Branch/commit/push/PR only with explicit user approval.

## Phase 0: Decision

- [ ] T000 Confirm the unwrapped-surface option (A/B/C). If not A, revise spec FRs + this plan before continuing.

## Phase 1: Setup

- [ ] T001 Create/checkout branch `034-response-data-convenience` from `main` (ASK before branching)
- [ ] T002 Baseline: `npm run type-check` + full `npm test` green

## Phase 2: User Story 1 — Unwrapped data (P1)

### Tests (write first)

- [ ] T003 [US1] `test/facades/apiData.test.ts`: spy `request`; assert `api.data.get('/x', cfg)` forwards identical args to `api.get('/x', cfg)` and resolves to `response.data`
- [ ] T004 [P] [US1] Assert each verb (`post/put/patch/delete`) unwraps and forwards `{ method, url, data?, ...cfg }`
- [ ] T005 [P] [US1] Extend the no-side-effect test to cover `api.data` (no `getInstance()` at import)

### Implementation

- [ ] T006 [US1] Add the `data` namespace (5 unwrapped verbs + `unwrap` helper) to `api` in `src/facades/api.ts`; existing verbs untouched
- [ ] T007 [US1] Run US1 tests → green; confirm existing `api.test.ts` still green (verbs unchanged); type-check clean

**Checkpoint**: `api.data.*` works, no break to `api.*`. Commit + push.

## Phase 3: User Story 2 — Verb parity (P2)

- [ ] T008 [US2] Verify signatures of `api.data.*` match `api.*` (minus wrapper), `T` defaults to `unknown` (add a typed usage in tests)

**Checkpoint**: Parity confirmed.

## Phase 4: Docs + version

- [ ] T009 [P] README + `docs/QUICK_START.md` Step 3 + `docs/api/INFRASTRUCTURE.md` facades section: show `api.get` (full response) vs `api.data.get` (payload) and when to use each
- [ ] T010 Bump version 2.8.0 → 2.9.0 (`package.json`, `src/index.ts`, `test/index.test.ts`)
- [ ] T011 `CHANGELOG.md`: 2.9.0 entry (additive `api.data.*`)
- [ ] T012 Update CLAUDE.md (header note, version, spec list, footer, spec-numbering hint → 035)

## Phase 5: Polish & Verification

- [ ] T013 Full suite green; new-code coverage ≥80%; lint + type-check clean; no `console.log`/`any`/`!!`
- [ ] T014 Final commit + push; tag `v2.9.0` (per the v2.7.0/v2.8.0 precedent); fast-forward `main` if that remains the workflow. Do NOT open a PR. (ASK before git actions.)

## Dependencies & Execution Order

- T000 (decision) → Phase 1 → 2 → 3 → 4 → 5.
- Tests first; mark each task `[x]` before the next.

## Notes

- Additive only; `api.*` and `request()` return shapes are unchanged (no break to 2.8.0).
- `api.data.*` delegates to `api.*`, so `request()` arg parity is automatic.
- Keep the facade lazy/side-effect-free on import.
