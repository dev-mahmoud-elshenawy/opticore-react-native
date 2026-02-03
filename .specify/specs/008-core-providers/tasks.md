# Tasks: Core Providers

## Phase 1: Setup

- [x] T001 Create providers directory: `src/providers`

## Phase 2: User Story 1 - QueryProvider (P1) 🎯

### Tests

- [x] T002 [P] [US1] Create `tests/providers/QueryProvider.test.tsx`

### Implementation

- [x] T003 [US1] Create `src/providers/QueryProvider.tsx` with React Query defaults
- [x] T004 [US1] Configure staleTime, cacheTime, retry, error handling
- [x] T005 [US1] Add DevTools integration (development only)

## Phase 3: User Story 2 - CoreProvider (P1) 🎯

### Tests

- [x] T006 [P] [US2] Create `tests/providers/CoreProvider.test.tsx`

### Implementation

- [x] T007 [US2] Create `src/providers/CoreProvider.tsx` combining:
  - QueryProvider
  - Connectivity initialization
  - Lifecycle initialization
  - State observer setup
- [x] T008 [US2] Create `src/providers/types.ts` for configuration interface
- [x] T009 [US2] Add prop-based configuration override

## Phase 4: Integration & Polish

- [x] T010 [P] Create `src/providers/index.ts` exports
- [x] T011 Run full test suite
- [x] T012 [P] Add JSDoc comments

## Phase 5: Documentation

- [x] T013 [P] Document provider setup
- [x] T014 [P] Create example app root setup
