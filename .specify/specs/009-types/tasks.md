# Tasks: Global TypeScript Types

## Phase 1: Setup

- [ ] T001 Create types directory: `src/types`
- [ ] T002 Install tsd for type testing

## Phase 2: User Story 1 - API Types (P1) 🎯

### Type Tests

- [ ] T003 [P] [US1] Create `tests/types/Api.test-d.ts` for type tests

### Implementation

- [ ] T004 [US1] Create `src/types/Api.types.ts` with:
  - ApiResponse<T>
  - ApiError
  - PaginatedResponse<T>
  - RequestConfig

## Phase 3: User Story 2 - State Types (P1) 🎯

### Type Tests

- [ ] T005 [P] [US2] Create `tests/types/State.test-d.ts`

### Implementation

- [ ] T006 [US2] Create `src/types/State.types.ts` with:
  - LoadingState<T>
  - ErrorState
  - PaginationState
  - AsyncValue<T>

## Phase 4: Supporting Types (P2)

### Type Tests

- [ ] T007 [P] Create tests for error, storage, navigation types

### Implementation

- [ ] T008 [P] Create `src/types/Error.types.ts`
- [ ] T009 [P] Create `src/types/Storage.types.ts`
- [ ] T010 [P] Create `src/types/Navigation.types.ts`

## Phase 5: Integration

- [ ] T011 [P] Create `src/types/index.ts` exports
- [ ] T012 Run type tests
- [ ] T013 [P] Add TSDoc comments

## Phase 6: Documentation

- [ ] T014 [P] Document type usage
- [ ] T015 [P] Create type examples
