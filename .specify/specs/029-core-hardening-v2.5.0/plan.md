# Plan 029 — Core Hardening v2.5.0

Implementation plan for [spec.md](./spec.md). Spec-first per repo convention.

## Approach

Fix in module clusters (lowest-coupling first), each with regression tests, and
run `type-check` + targeted tests per cluster. Full `npm run validate`-equivalent
(type-check + lint + build + test) at the end. No breaking changes to documented
public APIs — all fixes are additive or internal.

## Clusters & sequencing

| #   | Cluster                    | Files                                                                                                                                                                                               | Findings                                                                           |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A   | Network                    | `network/interceptors/LoggingInterceptor.ts`, `ApiClient.ts`, `interceptors/AuthInterceptor.ts`                                                                                                     | R1; timeout/baseURL guard; `params`; DELETE body; refresh-throw                    |
| B   | State / Query              | `state/StoreFactory.ts`, `state/AsyncStateHelpers.ts`, `state/providers/StoreProvider.tsx`, `query/createQueryClient.ts`                                                                            | R2; mutation retry guard; `mapSuccess` previousData; StoreProvider ref; id compare |
| C   | Offline                    | `offline/ConflictResolver.ts`, `offline/OfflineSyncManager.ts`, `offline/SyncEngine.ts`, `test/offline/SyncEngine.DI.test.ts`                                                                       | R3, R4; per-item maxRetries; stale-token replay; configure docs; DI test           |
| D   | Storage / Infra            | `infrastructure/storage/SecureStorage.ts`, `logger/Logger.ts`, `logger/ConsoleTransport.ts`, `logger/interfaces/ILogger.ts`, `connectivity/ConnectivityManager.ts`, `lifecycle/LifecycleManager.ts` | R5; showTimestamp; ILogger type; connectivity generation; lifecycle Android        |
| E   | Theme / Providers / Config | `theme/ThemeManager.ts`, `theme/ThemeProvider.tsx`, `providers/OptiCoreProvider.tsx`, `providers/QueryProvider.tsx`, `config/CoreSetup.ts`                                                          | R6; CoreSetup idempotency; QueryProvider destroy                                   |
| F   | Forms / Hooks              | `forms/useFieldValidation.ts`, `forms/masks/creditCardMask.ts`, `hooks/useAsyncState.ts`, `forms/useFormState.ts`, `forms/types.ts`, `forms/ValidationBuilder.ts`                                   | R7, R8; useAsyncState race; reset/control/register; phone validation               |
| G   | Adapters / Packaging       | `adapters/defaults/expoDevice.ts`, `adapters/defaults/expoClipboard.ts`, `error/ErrorClassifier.ts`+`ClassificationRule.ts`, `package.json`                                                         | nativeModulePresent guards; sideEffects; react-native condition; factory wiring    |

## Test strategy

- Add/adjust regression tests next to each fix where a behavior changed
  (token redaction, Immer `current()` success paths, conflict-retry budget,
  SecureStorage concurrency, useFieldValidation cancellation, credit-card cap).
- Keep all existing tests green; update only those that encoded buggy behavior.

## Risks

- `SecureStorage` write-queue change touches the hottest storage path — cover with
  a concurrency regression test.
- `ConnectivityManager`/`Lifecycle` changes interact with RN mocks — verify suite.
- Packaging changes (`sideEffects`, exports) verified via `npm run build` + dist check.

## Release

Bump to 2.5.0 (package.json, src/index.ts, CLAUDE.md), user-facing CHANGELOG entry.
Commit/push/tag only on explicit user request.
