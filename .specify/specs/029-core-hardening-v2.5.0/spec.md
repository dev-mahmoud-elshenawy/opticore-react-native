# Spec 029 — Core Hardening v2.5.0

**Status:** In progress
**Version target:** 2.5.0
**Created:** 2026-06-16

## What

A second correctness pass over the core, addressing the P0/P1 findings from the
2026-06-16 multi-module review (6 parallel reviewers). No breaking changes to
documented public APIs; all fixes are additive or internal.

## Why

v2.4.0 closed the first review's findings. A fresh deep review surfaced new
issues the first pass didn't cover — including a credential leak, an Immer
revoked-proxy crash, two silent data-loss paths in offline sync, and a
concurrency hazard in secure storage.

## Requirements (P0 — must fix)

- **R1 (network/security):** Request logging MUST NOT emit `Authorization`,
  `Cookie`, or other sensitive headers to any transport. Redact before logging.
- **R2 (state):** CRUD `create`/`update`/`delete` MUST snapshot the Immer draft
  with `current()` before passing to `toSuccess()` (prevents revoked-proxy reads).
- **R3 (offline):** `ConflictResolver` default strategy MUST match
  `OfflineSyncManager`'s default; strategy passed into the constructor.
- **R4 (offline):** 409 conflict retries MUST NOT consume the network `maxRetries`
  budget; track conflict retries separately.
- **R5 (storage):** `SecureStorage` key-index mutations MUST be serialized so
  concurrent `set`/`remove`/`clear` cannot drop keys.
- **R6 (theme):** The `Appearance` listener MUST be torn down when the provider
  that owns the default `ThemeManager` unmounts.
- **R7 (forms):** `useFieldValidation` MUST cancel stale async validations and
  guard against setState-after-unmount.
- **R8 (forms):** `applyCreditCardMask` default branch MUST cap at 16 digits.

## Requirements (P1 — real bugs)

- **Network:** `timeout:0`/`baseURL:''` honored (`!== undefined` guards); add
  `params` to `request()`; token-refresh retry returns `ApiResponse<T>` (not raw);
  `handleUnauthorized` throw rejects with the original error; encapsulate the raw
  Axios `client`.
- **Offline:** honor per-item `maxRetries`; replayed requests get a FRESH auth
  token (don't persist/replay stale `Authorization`); document/guard
  constructor-only config; fix `SyncEngine.DI.test.ts` `@ts-ignore`.
- **State/Query:** mutation `retry` applies the `isActionable` guard; `mapSuccess`
  maps `previousData`; `StoreProvider` tracks store prop changes; normalize id
  comparison.
- **Hooks/Forms:** `useAsyncState.run()` generation guard; `useFormState.reset()`
  passes `ResetOptions` and exposes `control`/`register`; `phone({required:false})`
  validates non-empty values.
- **Infra:** honor `showTimestamp`; tighten `ILogger.configure` type;
  `ConnectivityManager.configure()` generation guard; Lifecycle Android
  `'unknown'` startup handling.
- **Config/Providers:** `CoreSetup.init()` idempotency guard;
  `QueryProvider` destroys a swapped-out client.
- **Adapters/Packaging:** `expoDevice`/`expoClipboard` gate on `nativeModulePresent`;
  add `"sideEffects": false`; add `"react-native"` export condition; wire or remove
  `ClassificationRule.factory`.

## Out of scope (deferred to a later spec)

P2 polish, new features (storage TTL/namespacing, connectivity reachability,
queue TTL/dedup/optimistic CRUD, `useInterval`/`useTimeout`/`useUnmount`), and the
broad test-coverage expansion (adapter factories, `configure()` suites, `tsd` wiring).

## Success criteria

- All R1–R8 fixed with regression tests.
- All listed P1s fixed.
- `npm run type-check`, `lint`, `build`, and the full test suite green.
- Version bumped to 2.5.0; CHANGELOG (user-facing) updated.
