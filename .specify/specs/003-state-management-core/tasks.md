# Tasks: State Management Core

**Input**: Design documents from `/specs/003-state-management-core/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create state directory structure: `src/state/{types,providers}`
- [ ] T002 [P] Install dependencies: `npm install zustand@^5.0.10 immer@^10.0.4`
- [ ] T003 [P] Configure TypeScript for state module (ensure strict mode, generic type inference)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create `src/state/types/AsyncStateTypes.ts` with discriminated union type definition
- [ ] T005 [P] Create `src/state/types/StoreConfig.ts` with store configuration interfaces
- [ ] T006 [P] Create `src/state/types/ObserverTypes.ts` with observer callback type definitions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Handles Async Operations with Loading States (Priority: P1) 🎯 MVP

**Goal**: Implement AsyncState pattern with type-safe state transitions

**Independent Test**: Create AsyncState, transition through idle → loading → success, verify type safety

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Create `tests/state/AsyncState.test.ts` with test cases for:
  - Initial idle state
  - Transition to loading state with isLoading=true
  - Transition to success with data accessible
  - Transition to error with error message
  - Reset back to idle state
  - previousData preserved during loading
  - Type guards work correctly (isLoading, isSuccess, isError, isIdle)
- [ ] T008 [P] [US1] Create `tests/state/AsyncStateHelpers.test.ts` with test cases for:
  - unwrap() returns data in success state
  - unwrap() returns undefined in other states
  - match() pattern matching executes correct handler
  - match() provides exhaustiveness checking

### Implementation for User Story 1

- [ ] T009 [US1] Create `src/state/AsyncState.ts` with:
  - AsyncState<T> discriminated union type
  - Type guard functions: isLoading(), isSuccess(), isError(), isIdle()
  - Transition functions: toLoading(), toSuccess(data), toError(error), reset()
  - createAsyncState<T>() factory for initial state
  - Full JSDoc documentation
- [ ] T010 [P] [US1] Create `src/state/AsyncStateHelpers.ts` with:
  - unwrap<T>(state): T | undefined - safe data extraction
  - match<T, R>(state, handlers) - pattern matching utility
  - mapSuccess<T, U>(state, fn) - transform success data
  - mapError(state, fn) - transform error
- [ ] T011 [US1] Verify tests pass and TypeScript inference works correctly
- [ ] T012 [US1] Verify 80%+ coverage for AsyncState module

**Checkpoint**: AsyncState pattern fully functional and type-safe

---

## Phase 4: User Story 2 - Developer Creates Type-Safe Zustand Stores (Priority: P1) 🎯 MVP

**Goal**: Implement BaseStore pattern with Zustand middleware integration

**Independent Test**: Create auth store with BaseStore, dispatch login, verify state updates and types

### Tests for User Story 2 ⚠️

- [ ] T013 [P] [US2] Create `tests/state/BaseStore.test.ts` with test cases for:
  - Create store with initial state
  - Update state with actions
  - Immer middleware allows mutable syntax
  - DevTools middleware integrates correctly
  - Reset returns to initial state
  - Store accessible outside React components
  - TypeScript infers types correctly
  - Selectors work for computed values

### Implementation for User Story 2

- [ ] T014 [US2] Create `src/state/BaseStore.ts` with:
  - createBaseStore<T>(config) factory function
  - Automatic immer middleware integration
  - Automatic devtools middleware (dev only)
  - reset() method to return to initial state
  - hydrate(state) method for rehydration
  - Type-safe action pattern
  - Selector utilities
  - Full JSDoc documentation
- [ ] T015 [US2] Create example stores for testing:
  - Example AuthStore with login/logout actions
  - Example CounterStore with increment/decrement
  - Verify type inference works without explicit types
- [ ] T016 [US2] Test store access outside React (in API call simulation)
- [ ] T017 [US2] Verify tests pass and 80%+ coverage for BaseStore

**Checkpoint**: BaseStore pattern ready, can create type-safe Zustand stores easily

---

## Phase 5: User Story 3 - Developer Observes Global State Changes (Priority: P2)

**Goal**: Implement StateObserver for global state listening

**Independent Test**: Register observer, trigger state change, verify callback executes with old/new state

### Tests for User Story 3 ⚠️

- [ ] T018 [P] [US3] Create `tests/state/StateObserver.test.ts` with test cases for:
  - Subscribe to store and receive callbacks
  - Callback receives old state and new state
  - Multiple observers work concurrently
  - Unsubscribe removes listener
  - Cleanup removes all listeners
  - Filter function works (e.g., only errors)
  - Listener errors don't break other listeners
  - No memory leaks from forgotten listeners

### Implementation for User Story 3

- [ ] T019 [US3] Create `src/state/StateObserver.ts` singleton with:
  - subscribe<T>(store, callback, filter?) method
  - unsubscribe(listenerId) method
  - cleanup() method to remove all listeners
  - Private listeners WeakMap for memory management
  - Private notifyListeners() method
  - Error isolation for each listener (try/catch)
  - Execution in registration order
  - Full JSDoc documentation
- [ ] T020 [US3] Integration test: StateObserver + Zustand store + multiple listeners
- [ ] T021 [US3] Memory leak test: Subscribe and unsubscribe 1000 times
- [ ] T022 [US3] Verify tests pass and 80%+ coverage for StateObserver

**Checkpoint**: StateObserver functional, can react to global state changes

---

## Phase 6: User Story 4 - Developer Uses Factory Pattern for Store Creation (Priority: P3)

**Goal**: Implement StoreFactory for generating CRUD stores

**Independent Test**: Call factory with User entity, verify generated store has typed CRUD methods

### Tests for User Story 4 ⚠️

- [ ] T023 [P] [US4] Create `tests/state/StoreFactory.test.ts` with test cases for:
  - Factory generates store with CRUD methods
  - fetchAll() transitions through AsyncState
  - create() adds entity to state
  - update() modifies entity in state
  - delete() removes entity from state
  - TypeScript types inferred correctly
  - Custom actions can be added
  - Multiple factories create independent stores

### Implementation for User Story 4

- [ ] T024 [US4] Create `src/state/StoreFactory.ts` with:
  - createCrudStore<T>(config) factory function
  - Generate fetchAll(), fetchById(), create(), update(), delete() methods
  - Integrate AsyncState pattern automatically
  - Support custom action injection via config
  - Type inference for entity-specific methods
  - Full JSDoc documentation
- [ ] T025 [US4] Create example entity stores for testing:
  - UserStore generated by factory
  - ProductStore generated by factory
  - Verify type safety and independence
- [ ] T026 [US4] Verify tests pass and 80%+ coverage for StoreFactory

**Checkpoint**: All user stories fully functional

---

## Phase 7: React Integration

**Purpose**: Provide React providers for state management

- [ ] T027 [P] Create `src/state/providers/QueryProvider.tsx` with:
  - React Query QueryClientProvider wrapper
  - Configure default options (staleTime, cacheTime, retry)
  - Global error handling integration
  - JSDoc documentation
- [ ] T028 [P] Create `src/state/providers/StoreProvider.tsx` (optional):
  - Zustand provider wrapper for isolated store scope
  - Context-based store provision
  - JSDoc documentation
- [ ] T029 Test providers in React component environment

---

## Phase 8: Integration & Polish

**Purpose**: Cross-module integration and final verification

- [ ] T030 [P] Create `src/state/index.ts` exporting all state utilities
- [ ] T031 Integration test: AsyncState + BaseStore (store with AsyncState fields)
- [ ] T032 Integration test: BaseStore + StateObserver (observe auth store changes)
- [ ] T033 Integration test: StoreFactory + AsyncState + StateObserver (full pattern)
- [ ] T034 [P] Run full test suite, verify 80%+ coverage across all modules
- [ ] T035 [P] Fix any ESLint warnings or TypeScript errors
- [ ] T036 [P] Add comprehensive JSDoc comments to all public APIs
- [ ] T037 Performance test: 1000 state updates with StateObserver (< 10ms per update)
- [ ] T038 Performance test: Store with 10,000 items (no memory leaks)
- [ ] T039 Type safety verification: Compile with strict mode, zero errors

---

## Phase 9: Documentation & Examples

**Purpose**: Developer documentation and usage examples

- [ ] T040 [P] Document AsyncState pattern usage:
  - Create AsyncState for data fetching
  - Transition through states
  - Use type guards in components
  - Pattern matching with match()
- [ ] T041 [P] Document BaseStore pattern usage:
  - Create auth store
  - Define actions with type safety
  - Use store in components
  - Access store outside React
- [ ] T042 [P] Document StateObserver usage:
  - Subscribe to store changes
  - Filter by error states
  - Show global error toast
  - Cleanup listeners
- [ ] T043 [P] Document StoreFactory usage:
  - Generate CRUD store
  - Add custom actions
  - Use generated methods
- [ ] T044 Create comprehensive examples in `examples/state/`:
  - Example: Data fetching with AsyncState
  - Example: Auth store with BaseStore
  - Example: Global error handler with StateObserver
  - Example: Product CRUD with StoreFactory
- [ ] T045 Verify all examples run without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational completion
  - US1 (AsyncState) can start first - no dependencies
  - US2 (BaseStore) can start in parallel with US1
  - US3 (StateObserver) depends on US2 (needs Zustand stores)
  - US4 (StoreFactory) depends on US1 + US2 (uses both patterns)
- **React Integration (Phase 7)**: Can start after US1-US2
- **Integration (Phase 8)**: Depends on all user stories
- **Documentation (Phase 9)**: Depends on Integration completion

### User Story Dependencies

- **User Story 1 (P1)**: AsyncState - Can start after Foundational - No dependencies
- **User Story 2 (P1)**: BaseStore - Can start after Foundational - Parallel to US1
- **User Story 3 (P2)**: StateObserver - Depends on US2 (needs stores to observe)
- **User Story 4 (P3)**: StoreFactory - Depends on US1 + US2 (combines patterns)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types before implementations
- Core utilities before helpers
- Story complete before moving to next

### Parallel Opportunities

- **Phase 1 Setup**: All tasks can run in parallel
- **Phase 2 Foundational**: All type definitions can run in parallel
- **Phase 3-4**: US1 (AsyncState) and US2 (BaseStore) can run fully in parallel
- **Phase 7**: Both providers can be created in parallel
- **Phase 8**: Integration tests and polish tasks can run in parallel
- **Phase 9**: All documentation tasks can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (AsyncState)
4. Complete Phase 4: User Story 2 (BaseStore)
5. **STOP and VALIDATE**: Test AsyncState + BaseStore integration
6. Demo patterns with example stores

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 (AsyncState) → Test independently → MVP!
3. Add User Story 2 (BaseStore) → Test with US1 → Enhanced MVP!
4. Add User Story 3 (StateObserver) → Global state listening
5. Add User Story 4 (StoreFactory) → Code generation
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (AsyncState)
   - Developer B: User Story 2 (BaseStore)
3. After US1 + US2:
   - Developer A: User Story 3 (StateObserver)
   - Developer B: User Story 4 (StoreFactory)

---

## Notes

- [P] tasks = different files, can run in parallel
- [Story] label (US1, US2, etc.) maps to user stories
- Each user story independently completable and testable
- Verify tests fail before implementing (TDD)
- US1 + US2 are both P1 - implement both for MVP
- US3 + US4 are enhancements - can be deferred
- Type safety is critical - verify TypeScript inference works
