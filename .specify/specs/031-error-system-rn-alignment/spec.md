# Feature Specification: Error System RN Alignment

**Feature Branch**: `031-error-system-rn-alignment`
**Created**: 2026-06-25
**Status**: Draft
**Input**: Align the RenderError / NonRenderError model with how React Native actually intercepts errors. Keep the render-path half; stop treating `NonRenderError` as a thrown control-flow signal (the async/event errors it describes are never caught by a React Error Boundary); remove the latent infinite-render loop in `OptiCoreErrorBoundary`.

## Context / Problem

OptiCore's error system splits errors into two kinds:

- **`RenderError`** — shown to the user via `OptiCoreErrorBoundary` → fallback UI.
- **`NonRenderError`** — described as "background errors that should NOT disturb the user (analytics, logging, background sync failures)."

This split mirrors Flutter's unified error funnel (`ErrorWidget.builder` + `FlutterError.onError` + zones), where both render and non-render errors have real interception points. **React Native does not work this way.** React Error Boundaries catch **only** synchronous errors thrown during render / lifecycle / child constructors. They do **not** catch errors in:

- event handlers (`onPress`)
- `async` / promises / timers
- the boundary's own code

`NonRenderError` is defined for **async/background** failures — exactly the category the boundary cannot see. Therefore:

1. **Dead path**: `throw new NonRenderError(...)` from async/background code is never caught by `OptiCoreErrorBoundary`; it becomes an unhandled rejection. The boundary's `NON_RENDER` branches only ever trigger if a `NonRenderError` is (incorrectly) thrown during render.
2. **Infinite-render loop**: when an error reaching the boundary is classified `NON_RENDER`, the boundary sets `showFallback: false` and re-renders `children`. Any error that _actually_ reached the boundary came from the render path, so re-rendering the same children re-throws → caught again → re-render → loop.
3. **Wrong mental model in docs**: `CLAUDE.md` and the error module docs present a Flutter-style "render vs non-render, no re-render needed" model that does not transfer to RN. In React, any user feedback (e.g. a toast) is a state change → a re-render of the subscriber; there is no "show a message without re-rendering."

The fix keeps the correct half (`RenderError` + boundary) and repositions `NonRenderError` as a **typed descriptor/log payload** that the catch site reads (log it, surface a message, retry) — never a thrown control-flow signal.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Boundary never loops on a non-render classification (Priority: P1)

A consumer wraps a screen in `OptiCoreErrorBoundary`. A descendant throws during render. Regardless of how the error is classified, the boundary must converge to a stable state (fallback shown or error rethrown) and must never re-render the same throwing children indefinitely.

**Why this priority**: An infinite render loop is a hard crash / ANR for the consumer app — the most severe failure mode in the current design.

**Independent Test**: Render a child that throws a `NonRenderError` (and separately a plain `Error` classified `NON_RENDER`) during render inside `OptiCoreErrorBoundary`; assert the boundary renders a fallback exactly once and `render()` is not re-entered in a loop.

**Acceptance Scenarios**:

1. **Given** a child that throws during render, **When** the thrown value is a `NonRenderError`, **Then** the boundary shows the fallback (or rethrows) and does not re-render the throwing children.
2. **Given** a child that throws during render, **When** `ErrorClassifier.classify` returns `NON_RENDER`, **Then** the boundary shows the fallback and does not enter a render loop.
3. **Given** a child that throws a `RenderError`, **When** caught, **Then** behavior is unchanged from today (fallback shown, `resetError` works).

---

### User Story 2 - `NonRenderError` works as a log/descriptor payload (Priority: P1)

A consumer catches a failed background operation, constructs a `NonRenderError` carrying context (`severity`/`isSilent`/`shouldMonitor`/`metadata`/`cause`), and passes it to `Logger` and/or reads its fields to decide on user feedback. It is never thrown.

**Why this priority**: This is the supported replacement for the dead async-throw path; it must be ergonomic and documented so consumers have a clear pattern.

**Independent Test**: Construct a `NonRenderError`, pass it to `Logger.error`, and assert it is logged with its metadata/`cause` intact; read `isSilent` to branch on whether to surface a message.

**Acceptance Scenarios**:

1. **Given** a caught background failure, **When** a `NonRenderError` is constructed and passed to `Logger.error`, **Then** the log entry includes its `code`, `metadata`, and serialized `cause`.
2. **Given** a `NonRenderError` with `isSilent: false`, **When** the catch site inspects it, **Then** `userMessage`/`metadata` are available to drive feedback.

---

### User Story 3 - Throwing `NonRenderError` is deprecated, not broken (Priority: P2)

Existing consumers who currently `throw new NonRenderError(...)` must not get a compile break in 2.7.0. The throw-as-control-flow usage is marked deprecated (JSDoc `@deprecated` + documented migration), with removal of the boundary's `NON_RENDER` handling scheduled for 3.0.

**Why this priority**: Preserves semver discipline for a published library with consumers; gives a migration window.

**Independent Test**: Verify `NonRenderError` remains exported and constructable; verify `@deprecated` guidance is present; verify the public type signatures of the error module are unchanged in 2.7.0 (tsd).

**Acceptance Scenarios**:

1. **Given** a consumer on 2.7.0, **When** they import and construct `NonRenderError`, **Then** it compiles with no signature change.
2. **Given** the 2.7.0 docs, **When** a consumer reads the error guide, **Then** the RN-correct model and migration from throwing are documented.

---

### Edge Cases

- A `NonRenderError` thrown during render (misuse): boundary must still converge (show fallback), never loop.
- An error thrown inside the custom `fallback` render prop: out of scope to fully solve, but must not be worsened; document that fallback render must not throw.
- `componentDidCatch` logging must not itself throw (e.g., Logger not yet configured) — must degrade safely.
- Classifier returns `NONE` (unknown): treated as render-path → fallback (unchanged).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `RenderError` and `OptiCoreErrorBoundary` MUST retain their current public API and render-path behavior (fallback rendering, custom `fallback` prop, `onError`, `resetError`).
- **FR-002**: `OptiCoreErrorBoundary` MUST NOT re-render the throwing children for an error classified `NON_RENDER`. Any error that reaches the boundary originated on the render path and MUST resolve to a fallback (or rethrow) — never a silent re-render that can loop.
- **FR-003**: The boundary's "log silently and re-render children" branch for `NON_RENDER` MUST be removed; `componentDidCatch` MAY still log a caught error, but rendering MUST converge to the fallback.
- **FR-004**: `NonRenderError` MUST remain a constructable, exported class whose fields (`isSilent`, `shouldMonitor`, `retryConfig`, `metadata`, `cause`, `code`) are usable as a descriptor/log payload.
- **FR-005**: `NonRenderError` MUST be documented as a non-thrown descriptor; throwing it as control flow MUST be marked `@deprecated` with a migration note pointing to `Logger` and `Result<T, E>`.
- **FR-006**: `Logger` MUST accept and serialize a `NonRenderError` (via existing `toJSON`/`BaseError` serialization) with metadata and `cause` preserved.
- **FR-007**: Documentation (`CLAUDE.md` error section + error module docs/JSDoc) MUST describe the three RN outcomes — (a) replace screen → `RenderError` + boundary, (b) notify/feedback → state update at the catch site, (c) silent/background → `Logger` / `Result<T, E>` — and MUST remove the Flutter-style "non-render = no re-render" framing.
- **FR-008**: Public type signatures of the `error` module MUST be unchanged in 2.7.0 (no breaking change); `tsd` type tests MUST pass.
- **FR-009**: The change MUST ship as a minor release (2.7.0) with a deprecation entry in `CHANGELOG.md`; removal of the boundary's `NON_RENDER` handling and the deprecated throw semantics MUST be recorded as planned for 3.0.
- **FR-010**: Existing tests MUST continue to pass; new tests MUST cover the loop-convergence behavior (US1) and the descriptor/log usage (US2).

### Out of Scope

- A built-in toast/notification sink or `ToastHost` (deferred — not part of this spec).
- Changes to `ErrorClassifier` rules, `RecoveryStrategy`, or `Result<T, E>` semantics beyond documentation.
- Any change to `RenderError` fields or `DefaultErrorFallback`.

### Key Entities

- **`OptiCoreErrorBoundary`**: render-path error interceptor; after this change, every caught error resolves to a fallback (no silent re-render branch).
- **`NonRenderError`**: typed descriptor/log payload for background/async failures; carries severity/silent/monitor/retry/metadata/cause; not thrown as control flow.
- **`RenderError`**: unchanged; user-facing render-path error driving the fallback.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A child throwing a `NonRenderError` (or a plain error classified `NON_RENDER`) during render resolves to a single fallback render with zero render-loop re-entries (verified by test).
- **SC-002**: 100% of the error module's existing `tsd` type tests pass with no public-signature changes in 2.7.0.
- **SC-003**: The full test suite passes with ≥80% coverage maintained for the `error` module, including new US1/US2 tests.
- **SC-004**: `CLAUDE.md` and error docs contain zero remaining statements describing `NonRenderError` as a thrown, boundary-caught background error; the three-outcome RN model is documented.
- **SC-005**: No consumer-facing compile break (verified by simulated import of `NonRenderError` + boundary usage on 2.7.0).

```

```
