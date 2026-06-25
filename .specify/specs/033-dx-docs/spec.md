# Feature Specification: Developer-Experience Docs

**Feature Branch**: `033-dx-docs`
**Created**: 2026-06-25
**Status**: Draft (ready to execute later)
**Input**: Close the remaining learning-curve gaps identified in the package DX evaluation. Docs-only, non-breaking. Three pieces: (1) an error-handling decision tree, (2) a consumer testing/mocking guide, (3) initialization clarity (`OptiCoreProvider` is the path; `CoreSetup` is internal/advanced).

## Context / Problem

After specs 031 (error model alignment) and 032 (ergonomic facades), the package's API friction is largely gone. The DX re-evaluation found the **remaining** gaps are no longer API — they're **learning-curve docs**:

1. **Error idioms aren't disambiguated.** A newcomer faces `Result<T, E>`, throwing `RenderError`, and `ApiError` and can't tell which to use when. 031 fixed the boundary behavior but didn't ship a single "how do I handle errors" guide.
2. **No consumer testing guide.** The adapter memory-fallbacks make OptiCore testable in a consuming app, but there's no short doc on *how* to mock/reset it in app tests — a real adoption blocker for "use in any project."
3. **Two initialization concepts are visible.** `OptiCoreProvider` (the blessed path) and `CoreSetup.init()` (under the hood) both appear in docs; consumers can't tell which is theirs.

This spec is **documentation only** — no source/API changes, no version bump required (optionally a 2.8.1 docs release).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Error-handling decision tree (Priority: P1)

A developer deciding how to surface a failure finds one page that says: use `Result<T, E>` for expected/recoverable operations, throw `RenderError` for render-path failures the user must see, and read `ApiError` for HTTP specifics — tied to the three-outcome RN model from 031 (replace screen / notify via state / silent log).

**Why this priority**: Largest remaining learning-curve payoff; finishes the harmony work 031 started.

**Independent Test**: A new doc exists with a decision tree + a worked example per branch; cross-links to `docs/api/ERRORS.md` and the 031 three-outcome model; no contradictions with existing error docs.

**Acceptance Scenarios**:

1. **Given** the docs, **When** a developer asks "throw or Result?", **Then** the decision tree gives a definitive answer with an example.
2. **Given** the doc, **When** read alongside `ERRORS.md` and CLAUDE.md, **Then** guidance is consistent (no "throw NonRenderError" anywhere).

---

### User Story 2 - Consumer testing/mocking guide (Priority: P1)

A developer writing tests in their app learns how to: rely on the in-memory adapter fallbacks, inject custom adapters/doubles via `OptiCoreProvider`, reset singletons between tests, and silence/inspect the logger.

**Why this priority**: "Use in any project" includes testing; without this, adoption stalls at the test boundary.

**Independent Test**: A new doc shows a runnable pattern for (a) provider-wrapped component tests with injected adapters, (b) unit tests against facades/singletons with mocks, (c) inter-test reset. Patterns mirror the library's own `test/` approach.

**Acceptance Scenarios**:

1. **Given** the guide, **When** a developer wants OptiCore mocked in Jest, **Then** there's a copy-pasteable adapter-injection + reset pattern.
2. **Given** the guide, **When** testing a component using `api`/`storage`, **Then** the documented approach works without real native modules.

---

### User Story 3 - Initialization clarity (Priority: P2)

Docs state plainly that `OptiCoreProvider` is the one setup path for apps, and `CoreSetup.init()` is internal/advanced (what the provider calls). Consumers stop wondering which to use.

**Why this priority**: Cheap, removes a recurring "which init?" confusion.

**Independent Test**: README + relevant docs carry a short, consistent note; no example tells an app to call `CoreSetup.init()` directly as the primary path.

**Acceptance Scenarios**:

1. **Given** the README/setup docs, **When** a consumer reads how to initialize, **Then** `OptiCoreProvider` is unambiguously the path and `CoreSetup` is labeled internal/advanced.

---

### Edge Cases

- Existing docs that mention `CoreSetup.init()` as setup must be reconciled (point to the provider).
- The error decision tree must not reintroduce the deprecated "throw `NonRenderError`" idiom.
- Testing guide must reflect the real adapter resolver chain (override → peer → memory fallback) and the `_resetAdapterWarnings()`/singleton-reset realities.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Add an error-handling decision-tree doc (e.g., `docs/ERROR_HANDLING.md`) covering `Result<T,E>` vs throw `RenderError` vs `ApiError`, mapped to the three-outcome RN model; with one worked example per branch.
- **FR-002**: Add a consumer testing/mocking guide (e.g., extend `docs/TESTING.md` or add a "Testing in your app" section) covering adapter injection via `OptiCoreProvider`, memory-fallback reliance, singleton/adapter reset between tests, and logger control.
- **FR-003**: Add an initialization-clarity note to README + relevant setup docs: `OptiCoreProvider` is the path; `CoreSetup` is internal/advanced.
- **FR-004**: Reconcile any existing doc that presents `CoreSetup.init()` as the primary app setup to point at `OptiCoreProvider`.
- **FR-005**: All new/changed docs MUST be consistent with the 031 three-outcome model and the 032 facade style (use `api`/`storage`/`logger` in examples where natural).
- **FR-006**: No source, type, or API changes. Docs only. Internal doc links MUST resolve (no 404s).
- **FR-007**: Update `CLAUDE.md` doc index / footer as needed (self-updating-doc rule). Optional 2.8.1 docs release; no functional version bump required.

### Out of Scope

- Any code/API change (those are spec 034 and beyond).
- New error types or testing utilities shipped in the library (guide uses what exists).

### Key Entities

- **ERROR_HANDLING.md**: decision tree + per-branch examples.
- **Testing guide**: app-side mocking/reset patterns.
- **Init note**: provider-vs-CoreSetup clarity across README + docs.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer can answer "throw, `Result`, or `ApiError`?" from a single page with a worked example for each.
- **SC-002**: A developer can copy a working Jest setup that mocks OptiCore (no real native modules) from the testing guide.
- **SC-003**: Zero docs present `CoreSetup.init()` as the primary app setup; `OptiCoreProvider` is consistently the path.
- **SC-004**: All internal doc links resolve; no contradictions with `ERRORS.md`/CLAUDE.md; zero source changes.
