# Implementation Plan: Developer-Experience Docs

**Branch**: `033-dx-docs` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `.specify/specs/033-dx-docs/spec.md`

## Summary

Docs-only DX pass: (1) an error-handling decision-tree page, (2) a consumer testing/mocking guide, (3) initialization clarity (`OptiCoreProvider` is the path; `CoreSetup` internal). No source/API/type changes; optional 2.8.1 docs release. All examples align with the 031 three-outcome error model and the 032 facade style.

## Technical Context

**Language/Version**: Markdown docs only (TS snippets within docs must be valid against 2.8.0 API)
**Primary Dependencies**: none
**Testing**: N/A (manual doc review + link check); existing suite must remain green (unchanged)
**Target Platform**: docs
**Project Type**: Single (library) — `docs/` + README + CLAUDE.md
**Performance Goals**: N/A
**Constraints**: No source changes; snippets must compile mentally against current API; internal links must resolve
**Scale/Scope**: ~2 new/expanded doc files + small notes across README/CLAUDE.md

## Constitution Check

- **Pure Infrastructure / Spec-First**: ✅ docs reflect existing infra; spec+plan+tasks one-pass.
- **TypeScript Strict / TDD**: ✅ N/A (no code); snippets use real API.
- **Zero Bugs / SOLID**: ✅ no behavior change.
- **Non-breaking**: ✅ docs only.

**Result**: PASS.

## Project Structure

```text
docs/
├── ERROR_HANDLING.md     # NEW: decision tree (Result vs throw RenderError vs ApiError) + 3-outcome model
├── TESTING.md            # EDIT: add "Testing OptiCore in your app" section (adapter injection, reset, logger)
└── QUICK_START.md        # EDIT: init-clarity note (provider = path; CoreSetup = internal)

README.md                 # EDIT: init-clarity note near setup
CLAUDE.md                 # EDIT: doc index/footer; optional 2.8.1
docs/api/ERRORS.md        # EDIT (light): cross-link to ERROR_HANDLING.md
```

**Structure Decision**: Keep error guidance discoverable: a dedicated `docs/ERROR_HANDLING.md` (conceptual decision tree) that cross-links the `docs/api/ERRORS.md` reference. Testing guidance extends the existing `docs/TESTING.md`.

## Design Detail

### 1. ERROR_HANDLING.md (decision tree)

- A short flow: *Is it on the render path and must the user see it?* → throw `RenderError` (boundary shows fallback). *Is it an expected/recoverable operation?* → return `Result<T, E>`. *Need HTTP status/details?* → inspect `ApiError`. *Background/silent?* → log via `logger`, never throw `NonRenderError`.
- One worked example per branch, using `api`/`logger` facades.
- Map each branch to the 031 three-outcome model (replace screen / notify via state / silent).

### 2. TESTING.md (consumer section)

- **Component tests**: wrap in `OptiCoreProvider` with `config.adapters` doubles (in-memory/jest), per the adapter resolver chain.
- **Unit tests**: spy on facades or `X.getInstance()` (mirror the library's own `test/facades` patterns).
- **Reset between tests**: resetting singletons / `_resetAdapterWarnings()`; relying on memory fallback for no-native environments.
- **Logger**: silence or assert via a test transport.

### 3. Init clarity

- README + QUICK_START: one callout — "Apps initialize via `OptiCoreProvider`. `CoreSetup.init()` is what the provider calls internally; don't call it directly unless you're doing advanced/manual setup."
- Audit docs for any `CoreSetup.init()`-as-primary-setup and redirect.

## Test Strategy

- No automated tests (docs). Verification = internal link check + a read-through for consistency with `ERRORS.md`/CLAUDE.md, and confirming the existing suite still passes (untouched).

## Migration Plan

- Docs-only; optional `2.8.1` patch (docs) or fold into the next release. No consumer action.

## Complexity Tracking

> None.
