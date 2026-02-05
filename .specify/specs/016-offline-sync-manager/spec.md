# Spec 016: Offline Sync Manager

## Overview

**Priority**: P1 - CRITICAL
**Effort**: 10-12 hours
**Dependencies**: Spec 014, ConnectivityManager, LocalStorage, ApiClient
**Status**: Not Started

## Problem Statement

Mobile apps frequently operate in unreliable network conditions. Users expect their actions to work offline and sync when connectivity returns. Currently, consuming apps must build their own request queuing, retry logic, and sync mechanisms. This is complex, error-prone, and repetitive.

## Objectives

1. **Request queue** - Queue API requests when offline
2. **Auto-sync** - Automatically process queue when online
3. **Retry logic** - Exponential backoff for failed requests
4. **Persistence** - Queue survives app restart
5. **Conflict resolution** - Handle server/client conflicts
6. **Integration** - Seamless with existing ApiClient and ConnectivityManager

## User Stories

### US-025.1: Request Queue (P1)
**As a** developer
**I want** to enqueue API requests when offline
**So that** user actions aren't lost

**Acceptance Criteria**:
- [ ] Can enqueue any HTTP request (GET, POST, PUT, DELETE, PATCH)
- [ ] Queue returns unique ID for tracking
- [ ] Can dequeue/cancel pending requests
- [ ] Queue has configurable max size
- [ ] Priority levels (high, normal, low)

**Example Usage**:
```typescript
const manager = OfflineSyncManager.getInstance();

// Enqueue a request
const queueId = await manager.enqueue({
  method: 'POST',
  url: '/api/orders',
  data: { items: [...] },
  priority: 'high',
});

// Check queue
const pending = manager.getQueue();
console.log(`${pending.length} requests pending`);

// Cancel if needed
manager.dequeue(queueId);
```

### US-025.2: Auto-Sync on Reconnect (P1)
**As a** developer
**I want** queued requests to automatically sync when online
**So that** I don't have to manually trigger sync

**Acceptance Criteria**:
- [ ] Listens to ConnectivityManager for online status
- [ ] Automatically processes queue when online
- [ ] Respects priority order (high → normal → low)
- [ ] Configurable sync behavior (immediate vs delayed)
- [ ] Can pause/resume sync

**Example Usage**:
```typescript
manager.configure({
  syncOnReconnect: true,
  syncDelay: 1000, // Wait 1s after reconnect
});

// Listen to sync events
manager.addSyncListener((event) => {
  if (event.type === 'sync_complete') {
    console.log(`Synced ${event.success} requests`);
  }
});
```

### US-025.3: Retry with Exponential Backoff (P2)
**As a** developer
**I want** failed requests to retry with backoff
**So that** temporary failures don't cause data loss

**Acceptance Criteria**:
- [ ] Configurable max retries (default: 3)
- [ ] Exponential backoff (1s, 2s, 4s, ...)
- [ ] Different retry strategies per request
- [ ] Permanent failure handling
- [ ] Retry count tracking

**Example Usage**:
```typescript
await manager.enqueue({
  method: 'POST',
  url: '/api/critical-action',
  data: { ... },
  maxRetries: 5,
  retryDelay: 2000, // Start at 2s
});
```

### US-025.4: Queue Persistence (P2)
**As a** developer
**I want** the queue to persist across app restarts
**So that** requests aren't lost if app closes

**Acceptance Criteria**:
- [ ] Queue stored in LocalStorage
- [ ] Automatic load on manager init
- [ ] Automatic save on queue changes
- [ ] Handles storage failures gracefully
- [ ] Configurable persistence key

### US-025.5: Conflict Resolution (P3)
**As a** developer
**I want** to handle sync conflicts
**So that** data integrity is maintained

**Acceptance Criteria**:
- [ ] Client-wins strategy (default)
- [ ] Server-wins strategy
- [ ] Manual resolution callback
- [ ] Conflict detection via timestamps/versions

**Example Usage**:
```typescript
manager.configure({
  conflictStrategy: 'manual',
  onConflict: async (local, server) => {
    // Return resolved data
    return mergeData(local, server);
  },
});
```

### US-025.6: React Hook (P1)
**As a** developer
**I want** a `useOfflineSync` hook
**So that** I can use offline sync in React components

**Acceptance Criteria**:
- [ ] Returns current online/syncing status
- [ ] Returns pending count
- [ ] Provides enqueue function
- [ ] Provides sync trigger
- [ ] Auto-updates on state changes

**Example Usage**:
```typescript
function OrderButton() {
  const { isOnline, isSyncing, pendingCount, enqueue } = useOfflineSync();

  const handleOrder = async () => {
    await enqueue({
      method: 'POST',
      url: '/api/orders',
      data: orderData,
    });
    // Works offline - queued for later
  };

  return (
    <Button onPress={handleOrder} disabled={isSyncing}>
      {isOnline ? 'Place Order' : `Queue Order (${pendingCount} pending)`}
    </Button>
  );
}
```

## Technical Approach

### Architecture

```
src/offline/
├── index.ts                 # Public exports
├── OfflineSyncManager.ts    # Singleton manager
├── RequestQueue.ts          # Queue implementation
├── SyncEngine.ts            # Sync processing logic
├── ConflictResolver.ts      # Conflict resolution
├── useOfflineSync.ts        # React hook
└── types.ts                 # Type definitions
```

### Class Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 OfflineSyncManager                       │
│─────────────────────────────────────────────────────────│
│ - instance: OfflineSyncManager                          │
│ - queue: RequestQueue                                   │
│ - syncEngine: SyncEngine                                │
│ - conflictResolver: ConflictResolver                    │
│ - config: OfflineSyncConfig                             │
│─────────────────────────────────────────────────────────│
│ + getInstance(): OfflineSyncManager                     │
│ + configure(config): void                               │
│ + enqueue<T>(request): Promise<string>                  │
│ + dequeue(id): void                                     │
│ + getQueue(): QueuedRequest[]                           │
│ + clearQueue(): void                                    │
│ + sync(): Promise<SyncResult>                           │
│ + pauseSync(): void                                     │
│ + resumeSync(): void                                    │
│ + isSyncing(): boolean                                  │
│ + getPendingCount(): number                             │
│ + addSyncListener(callback): () => void                 │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │RequestQueue │ │ SyncEngine  │ │ConflictRes. │
    │             │ │             │ │             │
    │ - items[]   │ │ - process() │ │ - resolve() │
    │ - add()     │ │ - retry()   │ │ - strategy  │
    │ - remove()  │ │ - backoff() │ │             │
    │ - persist() │ │             │ │             │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### Integration with Existing Modules

```
┌─────────────────────────────────────────────┐
│            OfflineSyncManager               │
└─────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│Connectivity │ │ LocalStorage│ │  ApiClient  │
│Manager      │ │             │ │             │
│             │ │             │ │             │
│ isConnected │ │ persist()   │ │ request()   │
│ addListener │ │ restore()   │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
     (existing)    (existing)     (existing)
```

### Public API

```typescript
// ============== SINGLETON ==============

export class OfflineSyncManager {
  static getInstance(): OfflineSyncManager;

  // Configuration
  configure(config: OfflineSyncConfig): void;

  // Queue Operations
  enqueue<T = unknown>(request: QueuedRequest<T>): Promise<string>;
  dequeue(id: string): void;
  getQueue(): QueuedRequest[];
  clearQueue(): void;

  // Sync Control
  sync(): Promise<SyncResult>;
  pauseSync(): void;
  resumeSync(): void;

  // Status
  isSyncing(): boolean;
  isPaused(): boolean;
  getPendingCount(): number;

  // Listeners
  addSyncListener(callback: SyncListener): () => void;

  // Cleanup
  dispose(): void;
}

// ============== HOOK ==============

export function useOfflineSync(): {
  isOnline: boolean;
  isSyncing: boolean;
  isPaused: boolean;
  pendingCount: number;
  enqueue: <T>(request: QueuedRequest<T>) => Promise<string>;
  dequeue: (id: string) => void;
  sync: () => Promise<SyncResult>;
  clearQueue: () => void;
};

// ============== TYPES ==============

export interface QueuedRequest<T = unknown> {
  id?: string;                    // Auto-generated if not provided
  method: HttpMethod;
  url: string;
  data?: T;
  headers?: Record<string, string>;
  priority?: 'high' | 'normal' | 'low';
  maxRetries?: number;
  retryCount?: number;
  createdAt?: number;
  lastAttempt?: number;
}

export interface OfflineSyncConfig {
  maxRetries?: number;            // Default: 3
  retryDelay?: number;            // Default: 1000ms
  maxBackoff?: number;            // Default: 30000ms
  maxQueueSize?: number;          // Default: 100
  persistQueue?: boolean;         // Default: true
  storageKey?: string;            // Default: 'offline_sync_queue'
  syncOnReconnect?: boolean;      // Default: true
  syncDelay?: number;             // Default: 1000ms (after reconnect)
  conflictStrategy?: ConflictStrategy;
  onConflict?: ConflictHandler;
}

export type ConflictStrategy = 'client-wins' | 'server-wins' | 'manual';

export interface SyncResult {
  success: number;
  failed: number;
  pending: number;
  errors: SyncError[];
}

export interface SyncError {
  requestId: string;
  error: Error;
  retryable: boolean;
}

export type SyncEvent =
  | { type: 'sync_start' }
  | { type: 'sync_complete'; result: SyncResult }
  | { type: 'sync_error'; error: Error }
  | { type: 'request_success'; requestId: string }
  | { type: 'request_failed'; requestId: string; error: Error }
  | { type: 'request_retry'; requestId: string; attempt: number };

export type SyncListener = (event: SyncEvent) => void;
```

## Files to Create

```
src/offline/
├── index.ts                     # 40 lines
├── OfflineSyncManager.ts        # 250 lines
├── RequestQueue.ts              # 150 lines
├── SyncEngine.ts                # 200 lines
├── ConflictResolver.ts          # 80 lines
├── useOfflineSync.ts            # 80 lines
└── types.ts                     # 100 lines

test/offline/
├── OfflineSyncManager.test.ts   # 300 lines
├── RequestQueue.test.ts         # 150 lines
├── SyncEngine.test.ts           # 200 lines
├── ConflictResolver.test.ts     # 100 lines
└── useOfflineSync.test.ts       # 150 lines

examples/offline/
└── OfflineSyncExample.tsx       # Usage example
```

## Success Criteria

- [ ] TypeScript strict mode: 0 errors
- [ ] Test coverage: 80%+ for all new code
- [ ] JSDoc: 100% on public APIs
- [ ] Lint: 0 errors/warnings
- [ ] Build succeeds
- [ ] Integrates with ConnectivityManager
- [ ] Integrates with LocalStorage
- [ ] Integrates with ApiClient
- [ ] Queue persists across restarts
- [ ] Example works in test app

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Race conditions in sync | High | Use mutex/locks |
| Storage quota exceeded | Medium | Max queue size limit |
| Stale requests | Medium | TTL on queued items |
| Memory leaks | Medium | Proper cleanup |

## Out of Scope

- Real-time sync (WebSocket)
- Multi-device sync
- Complex merge strategies
- Database sync (SQLite, etc.)

## Definition of Done

1. All user stories implemented
2. 80%+ test coverage
3. TypeScript strict mode passes
4. Integrates with existing infrastructure
5. Example created
6. CLAUDE.md updated
