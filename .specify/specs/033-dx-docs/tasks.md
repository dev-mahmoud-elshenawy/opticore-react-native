---
description: 'Task list for spec 033 — Developer-Experience Docs'
---

# Tasks: Developer-Experience Docs

**Input**: Design documents from `.specify/specs/033-dx-docs/`
**Prerequisites**: plan.md, spec.md

**Tests**: None (docs only). Verification = link check + consistency read + existing suite stays green.

**Organization**: Grouped by phase. **Mark each task `[x]` before starting the next.** Commit + push after each phase. Branch/commit/push/PR only with explicit user approval.

## Phase 1: Setup

- [x] T001 Create/checkout branch `033-dx-docs` from `main` (ASK before branching; main now carries v2.8.0)
- [x] T002 Inventory docs that mention `CoreSetup.init()` and the error idioms (`grep -rn "CoreSetup.init\|Result<\|RenderError\|ApiError" docs/ README.md`)

## Phase 2: User Story 1 — Error decision tree (P1)

- [x] T003 [US1] Write `docs/ERROR_HANDLING.md`: decision tree (Result vs throw RenderError vs ApiError) mapped to the 031 three-outcome model, one worked example per branch (use `api`/`logger` facades)
- [x] T004 [US1] Cross-link from `docs/api/ERRORS.md` and `docs/FAQ.md` to `ERROR_HANDLING.md`; verify no contradictions (no "throw NonRenderError")
- [x] T005 [US1] Link-check the new/edited pages

**Checkpoint**: Single authoritative error-handling page. Commit + push.

## Phase 3: User Story 2 — Consumer testing guide (P1)

- [x] T006 [US2] Add a "Testing OptiCore in your app" section to `docs/TESTING.md`: provider + injected adapter doubles; memory-fallback reliance; singleton/adapter reset; logger silencing/asserting
- [x] T007 [US2] Ensure patterns mirror the library's own `test/` approach and need no real native modules
- [x] T008 [US2] Link-check

**Checkpoint**: App-side testing is documented. Commit + push.

## Phase 4: User Story 3 — Init clarity (P2)

- [x] T009 [US3] Add init-clarity callout to README + `docs/QUICK_START.md` (`OptiCoreProvider` = path; `CoreSetup` = internal/advanced)
- [x] T010 [US3] Redirect any doc presenting `CoreSetup.init()` as primary app setup to the provider

**Checkpoint**: One unambiguous init story. Commit + push.

## Phase 5: Polish

- [x] T011 Full read-through for consistency with `ERRORS.md` / CLAUDE.md / 032 facade style; confirm all internal links resolve
- [x] T012 Confirm zero source changes (`git diff --stat` shows only docs); run existing suite once to confirm still green (untouched)
- [x] T013 Updated README doc index (added ERROR_HANDLING.md) + CLAUDE.md spec list. Chose NO version bump (pure docs — stay 2.8.0, no release noise).
- [x] T014 Committed + pushed; fast-forwarded main. No tag (docs-only, no version bump). No PR.

## Dependencies & Execution Order

- Phase 1 → (2, 3, 4 are independent docs — parallelizable) → 5.
- Mark each task `[x]` before the next.

## Notes

- Docs only — no source/API/type changes.
- All examples align with 031 (three-outcome model) and 032 (facade style).
- No new error types or test utilities are added to the library; the guide uses what exists.
