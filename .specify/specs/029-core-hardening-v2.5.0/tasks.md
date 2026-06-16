# Tasks 029 — Core Hardening v2.5.0

Checklist for [plan.md](./plan.md). `[x]` done, `[ ]` pending.

## Cluster A — Network
- [x] R1: redact `Authorization`/`Cookie`/etc. in `LoggingInterceptor` before logging
- [x] P1: `timeout:0`/`baseURL:''` honored via `!== undefined` guards
- [x] P1: add `params` to `ApiClient.request()` and forward to Axios
- [x] P1: forward `data` on DELETE
- [x] P1: `handleUnauthorized` throw rejects with the ORIGINAL error
- [x] Tests: token redaction; timeout:0; params forwarding; refresh-throw

## Cluster B — State / Query
- [x] R2: `current()` snapshot in `create`/`update` success paths (delete reassigns to a plain array — already a safe snapshot, current() would throw)
- [x] P1: mutation `retry` applies `isActionable` guard in `createQueryClient`
- [x] P1: `mapSuccess` maps `previousData` in loading/error
- [x] P1: `StoreProvider` tracks store prop changes (drop stale `useRef`)
- [x] P1: normalize id comparison (`String(a)===String(b)` or `string|number` + `===`)
- [x] Tests: success-path proxy snapshot; mutation retry guard; mapSuccess

## Cluster C — Offline
- [x] R3: align `ConflictResolver`/manager default strategy (pass via constructor)
- [x] R4: separate conflict-retry counter from network `maxRetries`
- [x] P1: honor per-item `maxRetries`
- [x] P1: replayed requests get a fresh auth token (don't replay stale `Authorization`)
- [x] P1: document/guard constructor-only config in `configure()`
- [x] P1: fix `SyncEngine.DI.test.ts` `@ts-ignore`
- [x] Tests: conflict-strategy default; conflict-retry budget; per-item maxRetries

## Cluster D — Storage / Infra
- [x] R5: serialize `SecureStorage` key-index writes (set/remove/clear)
- [x] P1: honor `showTimestamp` (thread to ConsoleTransport)
- [x] P1: tighten `ILogger.configure` type
- [x] P1: `ConnectivityManager.configure()` generation guard
- [x] P1: Lifecycle Android `'unknown'` startup handling
- [x] Tests: SecureStorage concurrency; showTimestamp

## Cluster E — Theme / Providers / Config
- [x] R6: dispose `Appearance` listener on provider unmount (owner only)
- [x] P1: `CoreSetup.init()` idempotency guard
- [~] P1: `QueryProvider` swapped-client — SKIPPED: `QueryClientProvider` already mounts/unmounts the client on prop change, and v5 `QueryClient` has no public `destroy()`; not a real leak
- [x] Tests: theme dispose; CoreSetup re-init no-op

## Cluster F — Forms / Hooks
- [x] R7: `useFieldValidation` cancellation + unmount guard
- [x] R8: `applyCreditCardMask` default branch caps at 16 digits
- [x] P1: `useAsyncState.run()` generation guard
- [x] P1: `useFormState.reset()` passes `ResetOptions`; expose `control`/`register`
- [x] P1: `phone({required:false})` validates non-empty values
- [x] Tests: validation race; card cap; useAsyncState race

## Cluster G — Adapters / Packaging
- [x] P1: `expoDevice`/`expoClipboard` gate on `nativeModulePresent`
- [x] P1: add `"sideEffects": false` to package.json
- [x] P1: add `"react-native"` export condition to subpaths
- [x] P1: wire or remove `ClassificationRule.factory`

## Finalize
- [x] `npm run type-check` + `lint` + `build` + full test suite green
- [x] Bump to 2.5.0 (package.json, src/index.ts, CLAUDE.md)
- [x] User-facing CHANGELOG entry
