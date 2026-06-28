# Implementation Plan: Offline Sync Manager

**Branch**: `feature/016-offline-sync-manager`
**Date**: 2026-02-05
**Spec**: [spec.md](./spec.md)
**Dependencies**: Spec 014, ConnectivityManager, LocalStorage, ApiClient

## Summary

Provide request queuing for offline operations with auto-sync on reconnect, retry logic with exponential backoff, and queue persistence. Integrates seamlessly with existing ConnectivityManager, LocalStorage, and ApiClient.

**Technical Approach**: Singleton OfflineSyncManager, RequestQueue with persistence, SyncEngine with retry logic, ConflictResolver for merge strategies, React hook for component integration.

## Technical Context

- **No New Dependencies**: Uses existing infrastructure
- **Integration**: ConnectivityManager, LocalStorage, ApiClient, Logger
- **Pattern**: Singleton manager, Observer pattern, Queue data structure
- **Storage**: LocalStorage for queue persistence
- **Target**: 80%+ test coverage

## Module Structure

```
src/offline/
├── index.ts                 # Public exports (40 lines)
├── OfflineSyncManager.ts    # Singleton manager (250 lines)
├── RequestQueue.ts          # Queue implementation (150 lines)
├── SyncEngine.ts            # Sync processing (200 lines)
├── ConflictResolver.ts      # Conflict resolution (80 lines)
├── useOfflineSync.ts        # React hook (80 lines)
└── types.ts                 # Type definitions (100 lines)
```

## Public API

```typescript
// Singleton
export class OfflineSyncManager {
  static getInstance(): OfflineSyncManager;
  configure(config: OfflineSyncConfig): void;
  enqueue<T>(request: QueuedRequest<T>): Promise<string>;
  dequeue(id: string): void;
  getQueue(): QueuedRequest[];
  clearQueue(): void;
  sync(): Promise<SyncResult>;
  pauseSync(): void;
  resumeSync(): void;
  isSyncing(): boolean;
  getPendingCount(): number;
  addSyncListener(callback: SyncListener): () => void;
  dispose(): void;
}

// Hook
export function useOfflineSync(): {
  isOnline;
  isSyncing;
  pendingCount;
  enqueue;
  dequeue;
  sync;
  clearQueue;
};
```

## Integration Flow

```
User Action (offline)
    ↓
OfflineSyncManager.enqueue()
    ↓
RequestQueue.add()
    ↓
LocalStorage.persist()

[Network returns]
    ↓
ConnectivityManager fires "online"
    ↓
OfflineSyncManager auto-starts sync
    ↓
SyncEngine processes queue
    ↓
ApiClient executes requests
    ↓
Success/Failure handling
    ↓
Queue updated & persisted
```

## Implementation Phases

**Phase 1: Types & Queue** (2-3 hours)

- Type definitions
- RequestQueue implementation
- Queue persistence

**Phase 2: Sync Engine** (3-4 hours)

- SyncEngine with retry logic
- Exponential backoff
- Error handling

**Phase 3: Manager & Hook** (2-3 hours)

- OfflineSyncManager singleton
- ConnectivityManager integration
- useOfflineSync hook

**Phase 4: Conflict Resolution** (1-2 hours)

- ConflictResolver strategies
- Manual conflict callbacks

**Phase 5: Tests** (2-3 hours)

- Manager tests
- Queue tests
- Integration tests

## Verification

```bash
npm test test/offline  # All tests pass
npm run type-check     # 0 errors
```

## Success Criteria

- ✅ TypeScript strict mode: 0 errors
- ✅ Test coverage: 80%+
- ✅ All 21 tasks completed
- ✅ Auto-syncs on reconnect
- ✅ Queue persists across restarts
