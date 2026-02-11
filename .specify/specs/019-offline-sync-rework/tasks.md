# Tasks: Offline Sync Manager Rework

**Spec**: 019 | **Branch**: `feature/019-offline-sync-rework`

---

## Phase 1: SyncEngine Dependency Injection [US3]

- [x] T001 [US3] Write test: SyncEngine accepts MockApiClient via constructor, processes queue using it
- [x] T002 [US3] Write test: SyncEngine works with real ApiClient.getInstance() when passed
- [x] T003 [US3] Modify `src/offline/SyncEngine.ts` — change constructor to accept `apiClient: ApiClient` parameter
- [x] T004 [US3] Modify `src/offline/OfflineSyncManager.ts` — pass `ApiClient.getInstance()` to SyncEngine constructor
- [x] T005 [US3] Run tests — verify existing 59 tests still pass

**Checkpoint**: SyncEngine is injectable and testable with mocks.

---

## Phase 2: ConflictResolver Integration [US1]

- [x] T006 [US1] Write test: `client-wins` strategy retries with client data on 409
- [x] T007 [US1] Write test: `server-wins` strategy accepts server response on 409
- [x] T008 [US1] Write test: `manual` strategy calls `onConflict(localData, serverData)` callback
- [x] T009 [US1] Write test: `manual` strategy without callback throws validation error
- [x] T010 [US1] Modify `src/offline/ConflictResolver.ts` — implement all 3 strategies with proper return types
- [x] T011 [US1] Uncomment ConflictResolver import in `src/offline/OfflineSyncManager.ts` — instantiate with config
- [x] T012 [US1] Modify `src/offline/SyncEngine.ts` — accept ConflictResolver, call on 409 responses
- [x] T013 [US1] Modify `src/offline/OfflineSyncManager.ts` — pass ConflictResolver to SyncEngine
- [x] T014 [US1] Run tests — verify conflict resolution works end-to-end

**Checkpoint**: ConflictResolver handles all 3 strategies.

---

## Phase 3: Deterministic Queue Cleanup [US2]

- [x] T015 [US2] Add `SyncItemResult` type to `src/offline/types.ts`: `{ requestId, status, retryable, error? }`
- [x] T016 [US2] Write test: batch of 5 items (2 success, 1 400-error, 1 500-error, 1 network-error) — verify queue has 2 items after sync
- [x] T017 [US2] Write test: item exceeding maxRetries is removed and emitted as non-retryable
- [x] T018 [US2] Modify `src/offline/SyncEngine.ts` — return `SyncItemResult[]` from `processQueue()`
- [x] T019 [US2] Modify `src/offline/OfflineSyncManager.ts` — iterate results: success→remove, 4xx→remove, 5xx→keep
- [x] T020 [US2] Remove ALL comment blocks with uncertain language from `sync()` method (lines 172-194)
- [x] T021 [US2] Modify `src/offline/RequestQueue.ts` — add `maxQueueSize` enforcement (reject when full, emit event)
- [x] T022 [US2] Run tests — verify deterministic cleanup

**Checkpoint**: Queue cleanup is deterministic with per-item results.

---

## Phase 4: Initialization Guard [US4]

- [ ] T023 [US4] Write test: `enqueue()` called immediately after `getInstance()` — request queued after restore completes
- [ ] T024 [US4] Write test: `enqueue()` after full init — executes immediately
- [ ] T025 [US4] Write test: corrupted storage on restore — graceful fallback, no crash
- [ ] T026 [US4] Modify `src/offline/OfflineSyncManager.ts` — add `private readyPromise: Promise<void>` initialized in constructor
- [ ] T027 [US4] Modify `enqueue()`, `sync()`, `getPendingCount()` — await `this.readyPromise` before executing
- [ ] T028 [US4] Run tests — verify init guard prevents race conditions

**Checkpoint**: No race conditions on early access.

---

## Phase 5: Connectivity Listener Lifecycle [US5]

- [ ] T029 [US5] Write test: connectivity change triggers exactly 1 sync (no duplicates)
- [ ] T030 [US5] Write test: after `dispose()`, connectivity changes don't trigger sync
- [ ] T031 [US5] Write test: while paused, connectivity changes don't trigger sync
- [ ] T032 [US5] Modify `src/offline/OfflineSyncManager.ts` — store listener as class field, setup once in `initialize()`
- [ ] T033 [US5] Modify `dispose()` — remove listener via stored reference, clear properly
- [ ] T034 [US5] Run tests — verify listener lifecycle

**Checkpoint**: Listener lifecycle is deterministic.

---

## Phase 6: Polish & Verification

- [ ] T035 [P] Remove all `// To be used in future` and uncertain comment blocks from all offline files
- [ ] T036 [P] Update `src/offline/index.ts` exports with new types
- [ ] T037 Run full test suite: `npm test`
- [ ] T038 Run `npm run type-check` — verify 0 errors
- [ ] T039 Run `npm run lint` — verify 0 errors
- [ ] T040 Verify coverage: 80%+ on all offline module files

**Checkpoint**: Offline module production-ready.

---

## Dependencies

- Phase 1 → Phase 2 (DI before wiring ConflictResolver)
- Phase 2 → Phase 3 (conflict resolution before cleanup rules)
- Phase 1 → Phase 3 (per-item results need DI'd SyncEngine)
- Phase 3 → Phase 4 (cleanup before init guard)
- Phase 4 → Phase 5 (init guard before listener lifecycle)
- Phase 5 → Phase 6 (all fixes before polish)
