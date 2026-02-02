# Tasks: Error Classification System

**Organization**: Tasks grouped by user story for independent implementation

## Phase 1: Setup

- [x] T001 Create error directory structure: `src/error`
- [x] T002 Configure TypeScript for error module

## Phase 2: Foundational

- [x] T003 Create `src/error/ErrorType.ts` enum (RENDER, NON_RENDER, NONE)

## Phase 3: User Story 1 - Distinguish UI Errors from Background Errors (P1) 🎯

### Tests

- [x] T004 [P] [US1] Create `tests/error/BaseError.test.ts`
- [x] T005 [P] [US1] Create `tests/error/RenderError.test.ts`
- [x] T006 [P] [US1] Create `tests/error/NonRenderError.test.ts`

### Implementation

- [x] T007 [US1] Create `src/error/BaseError.ts` abstract class with:
  - code, message, stack, timestamp, metadata properties
  - toJSON() serialization method
  - getCause() for error chaining
- [x] T008 [P] [US1] Create `src/error/RenderError.ts` extending BaseError
- [x] T009 [P] [US1] Create `src/error/NonRenderError.ts` extending BaseError
- [x] T010 [US1] Verify tests pass, 80%+ coverage

## Phase 4: User Story 3 - Auto-Classify Errors (P2)

### Tests

- [x] T011 [P] [US3] Create `tests/error/ErrorClassifier.test.ts`

### Implementation

- [x] T012 [US3] Create `src/error/ErrorClassifier.ts` with:
  - classify(error): ErrorType method
  - Classification rules for HTTP codes
  - Classification for error types
  - Fallback to NONE for unknown errors

## Phase 5: User Story 4 - Recovery Strategies (P3)

### Tests

- [x] T013 [P] [US4] Create `tests/error/RecoveryStrategy.test.ts`

### Implementation

- [x] T014 [US4] Create `src/error/RecoveryStrategy.ts` with retry patterns

## Phase 6: Integration & Polish

- [x] T015 [P] Create `src/error/index.ts` exports
- [x] T016 Run full test suite
- [x] T017 [P] Add JSDoc comments

## Phase 7: Documentation

- [x] T018 [P] Document error classification usage
- [x] T019 [P] Create examples
