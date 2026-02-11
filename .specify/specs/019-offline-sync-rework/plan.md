# Implementation Plan: Offline Sync Manager Rework

**Branch**: `feature/019-offline-sync-rework` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Rework the OfflineSyncManager module (scored 4/10 in review) to production quality. Five critical fixes: (1) Wire ConflictResolver into SyncEngine pipeline, (2) Implement deterministic queue cleanup rules (success=remove, 4xx=remove, 5xx=keep), (3) Inject ApiClient into SyncEngine via constructor (DIP), (4) Add initialization guard so operations wait for `restore()` to complete, (5) Fix connectivity listener lifecycle to prevent leaks and duplicates. Remove all uncertain comment blocks.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: Axios (via ApiClient), ConnectivityManager, LocalStorage
**Testing**: Jest ^29
**Target Platform**: iOS & Android

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| Pure Infrastructure | PASS | Offline sync is infrastructure |
| TypeScript Strict | PASS | Remove `any` casts where possible |
| TDD Required | PASS | Tests first each phase |
| 80%+ Coverage | PASS | Target: all offline files |
| SOLID - DIP | FIX | SyncEngine currently violates DIP |
| SOLID - SRP | FIX | OfflineSyncManager has too many responsibilities |

## Source Code Structure

```
src/offline/
├── SyncEngine.ts           [MODIFY] Accept ApiClient via constructor, return per-item results
├── ConflictResolver.ts     [MODIFY] Wire into SyncEngine pipeline
├── OfflineSyncManager.ts   [MODIFY] Init guard, cleanup logic, listener lifecycle, remove comment blocks
├── RequestQueue.ts         [MODIFY] maxQueueSize enforcement, dead-letter support
├── types.ts                [MODIFY] SyncItemResult, DeadLetterItem types
└── index.ts                [MODIFY] Export new types

test/offline/
├── SyncEngine.test.ts      [MODIFY] DI tests, per-item result tests
├── ConflictResolver.test.ts [MODIFY] All 3 strategy tests
├── OfflineSyncManager.test.ts [MODIFY] Init guard, cleanup, listener tests
└── RequestQueue.test.ts    [MODIFY] maxQueueSize, dead-letter tests
```

## Approach

1. **SyncEngine DI**: Change constructor from `private apiClient = ApiClient.getInstance()` to `constructor(private apiClient: ApiClient)`. OfflineSyncManager passes `ApiClient.getInstance()` when creating SyncEngine.

2. **ConflictResolver Wiring**: Uncomment and instantiate ConflictResolver. SyncEngine calls `conflictResolver.resolve(strategy, localData, serverData)` when receiving 409. Three strategies: `client-wins` (retry with original data), `server-wins` (accept server response), `manual` (call `onConflict` callback).

3. **Deterministic Cleanup**: SyncEngine returns `SyncItemResult[]` (not aggregate counts). Each result has `{ requestId, status: 'success' | 'failed', retryable: boolean }`. OfflineSyncManager iterates results: success → remove from queue, non-retryable failure → remove + emit, retryable → increment retryCount + keep.

4. **Init Guard**: Add `private readyPromise: Promise<void>` initialized in constructor. All public methods (`enqueue`, `sync`, `getAll`) await `this.readyPromise` before executing.

5. **Listener Lifecycle**: Store connectivity listener reference as class field. `dispose()` removes it. `initialize()` creates it once. Guard against duplicate setup.
