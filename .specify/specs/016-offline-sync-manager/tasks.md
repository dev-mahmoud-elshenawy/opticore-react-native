# Tasks: Offline Sync Manager

**Input**: Design documents from `/specs/016-offline-sync-manager/`
**Prerequisites**: Spec 014 complete, branch created

## Phase 1: Type Definitions (1 hour)

- [x] T016.1 Create `src/offline/types.ts`:
  - QueuedRequest<T>
  - OfflineSyncConfig
  - SyncResult, SyncError, SyncEvent
  - ConflictStrategy, ConflictHandler
  - SyncListener type

---

## Phase 2: Request Queue (2-3 hours)

- [x] T016.2 Create `src/offline/RequestQueue.ts`:
  - add(request) - Add to queue
  - remove(id) - Remove from queue
  - getAll() - Get all requests
  - clear() - Clear queue
  - persist() - Save to LocalStorage
  - restore() - Load from LocalStorage
  - Priority sorting (high → normal → low)
- [x] T016.3 Write tests: `test/offline/RequestQueue.test.ts`

**Verification**: Queue persists/restores correctly ✓

---

## Phase 3: Sync Engine (3-4 hours)

- [x] T016.4 Create `src/offline/SyncEngine.ts`:
  - processQueue() - Process all requests
  - executeRequest(request) - Execute single request via ApiClient
  - retryWithBackoff(request) - Exponential backoff logic
  - handleSuccess(request) - Success callback
  - handleFailure(request, error) - Failure callback
  - isRetryable(error) - Check if error is retryable
- [x] T016.5 Write tests: `test/offline/SyncEngine.test.ts`

**Verification**: Sync engine retries failed requests

---

## Phase 4: Conflict Resolver (1-2 hours)

- [x] T016.6 Create `src/offline/ConflictResolver.ts`:
  - resolve(local, server, strategy) - Resolve conflicts
  - clientWins() - Client-wins strategy
  - serverWins() - Server-wins strategy
  - manual(callback) - Manual resolution
- [x] T016.7 Write tests: `test/offline/ConflictResolver.test.ts`

---

## Phase 5: Offline Sync Manager (3-4 hours)

- [x] T016.8 Create `src/offline/OfflineSyncManager.ts`:
  - Singleton getInstance()
  - configure(config)
  - enqueue<T>(request) - Add to queue
  - dequeue(id) - Remove from queue
  - getQueue() - Get all pending
  - clearQueue() - Clear all
  - sync() - Manual sync trigger
  - pauseSync() / resumeSync()
  - isSyncing(), isPaused(), getPendingCount()
  - addSyncListener(callback) - Event listeners
  - dispose() - Cleanup
- [x] T016.9 Integrate with ConnectivityManager:
  - Listen for online events
  - Auto-trigger sync when online
  - Configurable sync delay
- [x] T016.10 Write tests: `test/offline/OfflineSyncManager.test.ts`

**Verification**: Manager syncs on reconnect

---

## Phase 6: React Hook (1-2 hours)

- [ ] T016.11 Create `src/offline/useOfflineSync.ts`:
  - Returns: isOnline, isSyncing, pendingCount, enqueue, sync, clearQueue
  - Uses useState for reactivity
  - Subscribes to manager events
  - Cleanup on unmount
- [ ] T016.12 Write tests: `test/offline/useOfflineSync.test.ts`

---

## Phase 7: Module Exports & Examples (1 hour)

- [ ] T016.13 Create `src/offline/index.ts` - Export all public APIs
- [ ] T016.14 Add offline exports to `src/index.ts`
- [ ] T016.15 Add subpath export to package.json: `"./offline": "./dist/offline/index.js"`
- [ ] T016.16 Create `examples/offline/OfflineSyncExample.tsx`

---

## Final Verification

- [ ] T016.17 Run tests: `npm test test/offline` (All passing)
- [ ] T016.18 Run type-check: `npm run type-check` (0 errors)
- [ ] T016.19 Check coverage: `npm test test/offline -- --coverage` (≥80%)
- [ ] T016.20 Test offline scenario manually (queue → go offline → go online → auto-sync)
- [ ] T016.21 Update CLAUDE.md with Spec 016 completion

**Success Criteria**: All tasks completed ✓
