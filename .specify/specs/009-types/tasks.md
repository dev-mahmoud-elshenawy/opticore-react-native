# Tasks: Global TypeScript Types

## Phase 1: Setup

- [x] T001 Create types directory: `src/types`
- [x] T002 Install tsd for type testing

## Phase 2: User Story 1 - API Types (P1) 🎯

### Type Tests

- [x] T003 [P] [US1] Create `test/types/Api.test-d.ts` for type tests

### Implementation

- [x] T004 [US1] Create `src/types/Api.types.ts` with:
  - ApiResponse<T>
  - ApiError
  - PaginatedResponse<T>
  - RequestConfig

## Phase 3: User Story 2 - State Types (P1) 🎯

### Type Tests

- [x] T005 [P] [US2] Create `test/types/State.test-d.ts`

### Implementation

- [x] T006 [US2] Create `src/types/State.types.ts` with:
  - LoadingState<T>
  - ErrorState
  - PaginationState
  - AsyncValue<T>

## Phase 4: Supporting Types (P2)

### Type Tests

- [x] T007 [P] Create tests for error, storage, navigation types

### Implementation

- [x] T008 [P] Create `src/types/Error.types.ts`
- [x] T009 [P] Create `src/types/Storage.types.ts`
- [x] T010 [P] Create `src/types/Navigation.types.ts`

## Phase 5: Integration

- [x] T011 [P] Create `src/types/index.ts` exports
- [x] T012 Run type tests
- [x] T013 [P] Add TSDoc comments

## Phase 6: Documentation

- [x] T014 [P] Document type usage
- [x] T015 [P] Create type examples

## Phase 7: Conflict Resolution (Post-Review)

### Issues Found
- TypeScript compilation errors due to duplicate type definitions
- 5 conflicts with existing types from infrastructure and error modules

### Fixes Applied
- [x] T016 Removed redundant `ApiErrorData` interface (use ApiError class from infrastructure)
- [x] T017 Removed redundant `StandardApiResponse<T>` interface (too opinionated, apps define their own)
- [x] T018 Removed duplicate `StorageKeys` type (use StorageKeys const from infrastructure)
- [x] T019 Renamed `RecoveryStrategy` union to `RecoveryAction` (avoid conflict with RecoveryStrategy interface)
- [x] T020 Removed `QueryProviderConfig` re-export (already exported from providers)
- [x] T021 Updated `PaginatedResponse<T>` to be standalone (no longer extends removed type)
- [x] T022 Updated `src/types/index.ts` to export only non-conflicting types
- [x] T023 Verified TypeScript compilation: **0 errors** ✅

### Final Type Exports
**Kept (Infrastructure-Level)**:
- ✅ `PaginatedResponse<T>`, `PaginationMeta` - Common pagination pattern
- ✅ `RequestConfig`, `HttpMethod` - HTTP configuration types
- ✅ `LoadingState<T>`, `AsyncValue<T>`, `ErrorState` - State management patterns
- ✅ `ErrorSeverity`, `RecoveryAction`, `ErrorMetadata` - Error handling types
- ✅ `StorageValue<T>`, `StorageConfig`, `StorageAdapter` - Storage patterns
- ✅ All navigation types - Navigation type patterns

**Removed (Duplicate/Opinionated)**:
- ❌ `ApiErrorData` - Use ApiError class from infrastructure
- ❌ `StandardApiResponse<T>` - Too opinionated, apps define their own
- ❌ `StorageKeys` - Use StorageKeys const from infrastructure
- ❌ `RecoveryStrategy` - Renamed to RecoveryAction to avoid conflict
