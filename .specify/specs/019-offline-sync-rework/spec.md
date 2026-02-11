# Feature Specification: Offline Sync Manager Rework

**Spec Number**: 019
**Feature Branch**: `feature/019-offline-sync-rework`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P0 (Critical stability fix - current module scored 4/10)
**Input**: Code Review 2026-02-11, Section 8 - Offline Sync

## Problem Statement

The OfflineSyncManager (Spec 016) has **5 critical issues** that make it not production-ready:

1. **ConflictResolver is commented out** - Imported but never instantiated (`lines 5, 24, 35`). The entire conflict resolution system is dead code.
2. **Queue cleanup confusion** - 20+ lines of uncertain comments in `sync()` method (`lines 172-194`) about which items to remove after sync. No deterministic cleanup strategy.
3. **SyncEngine creates its own ApiClient** - Violates Dependency Inversion. Not testable without network.
4. **Constructor calls async `initialize()`** - Race condition: `enqueue()` can be called before `restore()` completes.
5. **Connectivity listener leak** - `handleConnectivityChange` created as local function inside `initialize()`, making reliable removal fragile.

---

## User Scenarios & Testing

### User Story 1 - Wire ConflictResolver (Priority: P1)

When a sync request returns a 409 Conflict response, the system resolves it using the configured strategy (client-wins, server-wins, or manual callback).

**Why this priority**: Without conflict resolution, any multi-device or collaborative app will silently lose data.

**Independent Test**: Enqueue a PUT request, mock a 409 response with server data, verify the configured strategy is applied.

**Acceptance Scenarios**:

1. **Given** `conflictStrategy: 'client-wins'`, **When** SyncEngine receives a 409, **Then** it retries with the client's original data and the request succeeds.
2. **Given** `conflictStrategy: 'server-wins'`, **When** SyncEngine receives a 409, **Then** it drops the local request and emits `request_success` with server data.
3. **Given** `conflictStrategy: 'manual'` and an `onConflict` callback, **When** SyncEngine receives a 409, **Then** it calls `onConflict(localData, serverData)` and uses the returned merged data.
4. **Given** `conflictStrategy: 'manual'` but no `onConflict` callback, **When** configure is called, **Then** it throws a validation error.

---

### User Story 2 - Deterministic Queue Cleanup (Priority: P1)

After a sync batch completes, successfully synced items are removed from the queue, non-retryable failures (4xx) are removed with an error event, and retryable failures (5xx, network) stay in the queue.

**Why this priority**: Without deterministic cleanup, the queue grows unbounded or items are lost silently.

**Independent Test**: Enqueue 5 items, mock 2 successes, 1 400-error, 1 500-error, 1 network-error. Verify queue contains exactly 2 items after sync.

**Acceptance Scenarios**:

1. **Given** a successful sync of item X, **When** sync completes, **Then** item X is removed from queue and `request_success` event is emitted.
2. **Given** a 400 Bad Request for item Y, **When** sync completes, **Then** item Y is removed from queue (non-retryable) and `request_failed` event is emitted with `retryable: false`.
3. **Given** a 500 Server Error for item Z, **When** sync completes, **Then** item Z stays in queue with incremented `retryCount` and `request_failed` event is emitted with `retryable: true`.
4. **Given** a network timeout for item W, **When** sync completes, **Then** item W stays in queue (retryable) for next sync attempt.
5. **Given** an item that has exceeded `maxRetries`, **When** sync processes it, **Then** the item is moved to a dead-letter state and `request_failed` event is emitted with `retryable: false`.

---

### User Story 3 - SyncEngine Dependency Injection (Priority: P1)

SyncEngine receives ApiClient as a constructor parameter instead of internally calling `ApiClient.getInstance()`.

**Why this priority**: Without DI, the SyncEngine is untestable without mocking singletons and tightly coupled to the network layer.

**Independent Test**: Create SyncEngine with a MockApiClient, process a queue, verify mock was called correctly.

**Acceptance Scenarios**:

1. **Given** a SyncEngine constructed with a custom ApiClient, **When** `processQueue()` is called, **Then** it uses the injected ApiClient for all requests.
2. **Given** OfflineSyncManager, **When** it creates SyncEngine, **Then** it passes `ApiClient.getInstance()` as the dependency.

---

### User Story 4 - Initialization Guard (Priority: P2)

The OfflineSyncManager ensures `initialize()` completes before `enqueue()`, `sync()`, or `getAll()` can proceed. Operations called before init completes are queued and executed after init.

**Why this priority**: Race condition can cause data loss but is unlikely in practice (init is fast).

**Independent Test**: Call `enqueue()` immediately after `getInstance()` without awaiting. Verify the request is eventually queued after restore completes.

**Acceptance Scenarios**:

1. **Given** OfflineSyncManager just created, **When** `enqueue()` is called before `initialize()` completes, **Then** the request is buffered and processed after init.
2. **Given** OfflineSyncManager fully initialized, **When** `enqueue()` is called, **Then** it executes immediately without delay.
3. **Given** `persistQueue: true` and stored queue from previous session, **When** OfflineSyncManager initializes, **Then** persisted items are restored before any new items are added.

---

### User Story 5 - Connectivity Listener Lifecycle (Priority: P2)

The connectivity listener is properly managed with a deterministic setup/teardown lifecycle.

**Why this priority**: Listener leaks cause memory issues and duplicate sync triggers.

**Independent Test**: Create manager, call `dispose()`, verify connectivity listener is removed and no sync triggers fire.

**Acceptance Scenarios**:

1. **Given** OfflineSyncManager initialized, **When** connectivity changes to online, **Then** exactly ONE sync is triggered (no duplicates).
2. **Given** OfflineSyncManager disposed, **When** connectivity changes, **Then** no sync is triggered.
3. **Given** OfflineSyncManager paused, **When** connectivity changes to online, **Then** no sync is triggered until `resume()` is called.

---

### Edge Cases

- What happens when sync is in progress and another connectivity change fires?
- What happens when queue exceeds `maxQueueSize`?
- What happens when `restore()` finds corrupted data in storage?
- What happens when `onConflict` callback throws an error?
- What happens when the app goes to background during sync?

---

## Requirements

### Functional Requirements

- **FR-001**: `ConflictResolver` MUST be instantiated and wired into `SyncEngine` processing pipeline.
- **FR-002**: `SyncEngine.processQueue()` MUST return per-item results (not just aggregate counts).
- **FR-003**: Queue cleanup MUST follow deterministic rules: success=remove, 4xx=remove, 5xx/network=keep.
- **FR-004**: Items exceeding `maxRetries` MUST be removed and emitted as non-retryable failures.
- **FR-005**: `SyncEngine` MUST accept `ApiClient` as constructor parameter.
- **FR-006**: `OfflineSyncManager` MUST ensure `initialize()` completes before processing operations.
- **FR-007**: Connectivity listener MUST be a stored reference that can be deterministically removed.
- **FR-008**: All comment-based TODO/uncertainty blocks MUST be replaced with actual implementation.
- **FR-009**: Queue MUST reject new items when `maxQueueSize` is reached (emit event, don't silently drop).

### Key Entities

- **SyncEngine**: Processes queue items via injected ApiClient
- **ConflictResolver**: Strategy-based conflict resolution (client-wins, server-wins, manual)
- **RequestQueue**: Priority queue with deterministic cleanup
- **SyncResult**: Per-item results with request IDs
- **DeadLetterItem**: Failed items that exceeded max retries

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: ConflictResolver handles all 3 strategies with test coverage.
- **SC-002**: Queue cleanup is deterministic - test with mixed success/failure batch proves correct item retention.
- **SC-003**: SyncEngine is testable with mock ApiClient (no singleton dependency).
- **SC-004**: No race conditions - init guard prevents premature operations.
- **SC-005**: Zero comment blocks with uncertainty language ("might", "should we", "TODO").
- **SC-006**: 80%+ test coverage across all offline module files.
- **SC-007**: All 59 existing offline tests continue to pass.

---

## Files to Create/Modify

- `src/offline/SyncEngine.ts` - Accept ApiClient via constructor, return per-item results
- `src/offline/ConflictResolver.ts` - Wire into SyncEngine pipeline
- `src/offline/OfflineSyncManager.ts` - Init guard, cleanup logic, listener lifecycle
- `src/offline/RequestQueue.ts` - maxQueueSize enforcement, dead-letter support
- `src/offline/types.ts` - SyncItemResult type, DeadLetterItem type
- `test/offline/SyncEngine.test.ts` - DI tests, per-item results
- `test/offline/ConflictResolver.test.ts` - All 3 strategies
- `test/offline/OfflineSyncManager.test.ts` - Init guard, cleanup, listener lifecycle
