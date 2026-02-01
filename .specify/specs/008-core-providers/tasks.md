# Tasks: Core Providers

## Phase 1: Setup

- [ ] T001 Create providers directory: `src/providers`

## Phase 2: User Story 1 - QueryProvider (P1) 🎯

### Tests

- [ ] T002 [P] [US1] Create `tests/providers/QueryProvider.test.tsx`

### Implementation

- [ ] T003 [US1] Create `src/providers/QueryProvider.tsx` with React Query defaults
- [ ] T004 [US1] Configure staleTime, cacheTime, retry, error handling
- [ ] T005 [US1] Add DevTools integration (development only)

## Phase 3: User Story 2 - CoreProvider (P1) 🎯

### Tests

- [ ] T006 [P] [US2] Create `tests/providers/CoreProvider.test.tsx`

### Implementation

- [ ] T007 [US2] Create `src/providers/CoreProvider.tsx` combining:
  - QueryProvider
  - Connectivity initialization
  - Lifecycle initialization
  - State observer setup
- [ ] T008 [US2] Create `src/providers/types.ts` for configuration interface
- [ ] T009 [US2] Add prop-based configuration override

## Phase 4: Integration & Polish

- [ ] T010 [P] Create `src/providers/index.ts` exports
- [ ] T011 Run full test suite
- [ ] T012 [P] Add JSDoc comments

## Phase 5: Documentation

- [ ] T013 [P] Document provider setup
- [ ] T014 [P] Create example app root setup
