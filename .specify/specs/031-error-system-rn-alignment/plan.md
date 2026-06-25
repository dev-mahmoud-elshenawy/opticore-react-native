# Implementation Plan: Error System RN Alignment

**Branch**: `031-error-system-rn-alignment` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/031-error-system-rn-alignment/spec.md`

## Summary

Align OptiCore's error model with how React Native actually intercepts errors. Keep `RenderError` + `OptiCoreErrorBoundary` (the render-path half, which has a real RN mechanism). Remove the boundary's `NON_RENDER` "log-and-re-render-children" branch — the source of a latent infinite-render loop — so every error reaching the boundary converges to a fallback. Reposition `NonRenderError` as a **typed descriptor / log payload** (constructed and handed to `Logger`, read at catch sites), never a thrown control-flow signal; throwing it is `@deprecated` with removal scheduled for 3.0. Update `CLAUDE.md` + module docs to the three-outcome RN model. Ship as **non-breaking 2.7.0** (no public signature changes; `tsd` passes).

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: React 19.1, React Native 0.81 (peers); no new deps
**Storage**: N/A
**Testing**: Jest (`jest-expo` preset) + React Native Testing Library; `tsd` for public-API type tests
**Target Platform**: iOS 13.4+, Android API 21+ (library; no web)
**Project Type**: Single (infrastructure library) — source in `src/`, tests mirror in `test/`
**Performance Goals**: N/A (correctness/architecture change)
**Constraints**: No breaking public API change in 2.7.0; ≥80% coverage on `error` module; no `console.log`; no `any` without justification; no `!!`
**Scale/Scope**: `src/error/` module — primarily `OptiCoreErrorBoundary.tsx` + `NonRenderError.ts` docs/JSDoc; docs in `CLAUDE.md`, `.specify`, `CHANGELOG.md`, `README` error section

## Constitution Check

_GATE: Must pass before implementation. Re-check after design._

- **Pure Infrastructure Library**: ✅ No app-specific logic introduced; error handling is generic infrastructure.
- **Specification-First**: ✅ spec.md approved before this plan; plan + tasks generated in the same pass under the new flow.
- **TypeScript Strict Mode**: ✅ No new `any`; public signatures unchanged.
- **TDD / 80%+ coverage**: ✅ New tests for loop-convergence (US1) and descriptor/log usage (US2) written before/with the changes.
- **Zero Bugs Philosophy**: ✅ This change *removes* a crash class (infinite render loop) and a dead async-throw path.
- **SOLID**: ✅ `NonRenderError` keeps single responsibility (now: describe a background failure); boundary keeps single responsibility (render-path recovery).
- **No breaking change** (semver): ✅ 2.7.0 minor; deprecation only. Removal of `NON_RENDER` branch semantics deferred to 3.0.

**Result**: PASS — no violations, no Complexity Tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/031-error-system-rn-alignment/
├── spec.md              # Approved specification
├── plan.md              # This file
└── tasks.md             # Task breakdown (generated same pass)
```

### Source Code (repository root)

```text
src/error/
├── OptiCoreErrorBoundary.tsx   # EDIT: remove NON_RENDER re-render branch; converge to fallback; safe logging
├── NonRenderError.ts           # EDIT (docs/JSDoc): reposition as descriptor/log payload; @deprecate throwing
├── RenderError.ts              # UNCHANGED
├── BaseError.ts                # UNCHANGED (serialization already supports Logger use)
├── ErrorClassifier.ts          # UNCHANGED (classification rules out of scope)
├── Result.ts                   # UNCHANGED (documented as async default)
├── ErrorType.ts                # UNCHANGED
├── DefaultErrorFallback.tsx    # UNCHANGED
├── RecoveryStrategy.ts         # UNCHANGED
├── toMessage.ts                # UNCHANGED
└── index.ts                    # UNCHANGED (no surface change)

test/error/
├── OptiCoreErrorBoundary.test.tsx   # EDIT/ADD: loop-convergence tests (US1)
├── NonRenderError.test.ts           # ADD/EDIT: descriptor + Logger serialization tests (US2)
└── (existing error tests)           # Must stay green

docs / meta:
├── CLAUDE.md                    # EDIT: error section → three-outcome RN model
├── CHANGELOG.md                 # EDIT: 2.7.0 entry + deprecation note
├── README.md                    # EDIT: error guide (if it documents NonRenderError throwing)
└── package.json                 # EDIT: version 2.6.0 → 2.7.0
```

**Structure Decision**: Single-project library layout. Changes are concentrated in `src/error/` with mirrored tests in `test/error/`, plus documentation/versioning files. No new modules, no new exports.

## Design Detail

### 1. Boundary loop fix (`OptiCoreErrorBoundary.tsx`)

Today `getDerivedStateFromError` produces `showFallback: false` for `NON_RENDER` (typed or classified), and `render()` returns `children` → re-throws → loop.

**Decision**: Any error that reaches a React error boundary came from the render path, so it MUST resolve to a fallback. Remove the `NON_RENDER → showFallback:false → re-render children` branches. Behavior:
- `RenderError` → fallback (unchanged).
- `NonRenderError` thrown during render (misuse) → wrap/show fallback (converges; logged via `componentDidCatch`).
- Classified `NON_RENDER` / `NONE` / unknown → fallback.
- `componentDidCatch` still logs; logging is wrapped so a not-yet-configured `Logger` cannot throw inside the boundary.

`onError`, custom `fallback` prop, and `resetError` semantics are preserved.

### 2. `NonRenderError` repositioning (`NonRenderError.ts`)

- No field/signature change (FR-008).
- JSDoc rewritten: it is a **descriptor/log payload** — construct it, pass to `Logger.error(...)`, and/or read `isSilent`/`severity`/`metadata`/`userMessage` at the catch site to decide on feedback. **Do not throw it as control flow** (`@deprecated` on that usage, with migration pointing to `Logger` and `Result<T, E>`).
- Confirm `BaseError.toJSON()` serialization (code/metadata/cause) is exercised by a `Logger` test.

### 3. Documentation (three-outcome model)

`CLAUDE.md` error section + module JSDoc state:
- Replace screen → `RenderError` + boundary.
- Notify (toast/banner) → state update at catch site (a re-render of the subscriber; RN has no "message without re-render").
- Silent/background → `Logger` / `Result<T, E>`.
Remove Flutter-style "non-render = no re-render" framing.

### 4. Versioning

`package.json` → `2.7.0`; version test updated; `CHANGELOG.md` 2.7.0 entry documents: loop fix, `NonRenderError` deprecation-as-thrown, docs realignment, and the 3.0 removal plan.

## Test Strategy

- **US1 (P1)** — render a child that throws (a) a `NonRenderError` and (b) a plain error classified `NON_RENDER`; assert exactly one fallback render and no render-loop re-entry; assert `RenderError` path + `resetError` unchanged.
- **US2 (P1)** — construct `NonRenderError`, pass to `Logger.error`; assert serialized `code`/`metadata`/`cause` present; assert reading `isSilent` branches feedback.
- **US3 (P2)** — `tsd` confirms no public-signature change; verify `@deprecated` JSDoc present; simulated consumer import still compiles.
- Full suite stays green; `error` module coverage ≥80%.

## Migration Plan

- **2.7.0** (this spec): behavior change (loop fix) + deprecation; no signature break. `CHANGELOG` calls out that throwing `NonRenderError` is deprecated and the boundary no longer silently re-renders on `NON_RENDER`.
- **3.0** (future): remove the deprecated throw semantics and any remaining `NON_RENDER` special-casing entirely.

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
