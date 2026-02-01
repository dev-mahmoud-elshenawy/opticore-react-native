# Feature Specification: Global TypeScript Types

**Feature Branch**: `009-types`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Build centralized TypeScript type definitions for API responses, state patterns, error types, storage types, and navigation types - providing type safety across the entire package"

## User Scenarios & Testing

### User Story 1 - Developer Uses Typed API Responses (Priority: P1)

A developer making API calls wants generic ApiResponse<T> type that wraps all API responses with consistent structure (data, status, headers, error) for type-safe data access.

**Why this priority**: API type safety is critical - prevents runtime errors from incorrect data access.

**Independent Test**: Define API response with type, verify TypeScript catches incorrect property access.

**Acceptance Scenarios**:

1. **Given** API returns user data, **When** response typed as ApiResponse<User>, **Then** TypeScript enforces User shape for data property
2. **Given** API returns error, **When** response typed as ApiResponse<T>, **Then** error property is accessible with correct type
3. **Given** paginated API, **When** response includes pagination, **Then** PaginatedResponse<T> type includes page, total, items

---

### User Story 2 - Developer Uses State Types (Priority: P1)

A developer working with Zustand stores wants type definitions for common state patterns (loading states, error states, pagination states) to ensure consistency.

**Why this priority**: State type consistency prevents state management bugs across different stores.

**Independent Test**: Create store with typed state, verify TypeScript enforces state structure.

**Acceptance Scenarios**:

1. **Given** store uses LoadingState<T>, **When** accessing data, **Then** TypeScript knows data is only available when not loading
2. **Given** store uses ErrorState, **When** error occurs, **Then** error property has correct Error type
3. **Given** store uses PaginationState, **When** paginating, **Then** page, pageSize, total are correctly typed

---

### User Story 3 - Developer Uses Navigation Types (Priority: P2)

A developer navigating between screens wants type definitions for routes and route parameters ensuring compile-time safety for navigation.

**Why this priority**: Important for catching navigation errors early but not critical for MVP.

**Independent Test**: Define route types, attempt invalid navigation, verify TypeScript error.

**Acceptance Scenarios**:

1. **Given** routes are typed, **When** navigating to invalid route, **Then** TypeScript shows error
2. **Given** route requires params, **When** params missing, **Then** TypeScript shows error
3. **Given** route params typed, **When** wrong type passed, **Then** TypeScript shows error

---

### Edge Cases

- What happens when API response doesn't match ApiResponse<T> shape?
- What happens when generic type parameters are omitted?
- What happens when third-party types conflict with opticore types?

## Requirements

### Functional Requirements

**API Types**:
- **FR-001**: System MUST provide ApiResponse<T> generic type
- **FR-002**: System MUST provide ApiError type with status, message, code
- **FR-003**: System MUST provide PaginatedResponse<T> type
- **FR-004**: System MUST provide RequestConfig type for API configuration

**State Types**:
- **FR-005**: System MUST provide LoadingState<T> type
- **FR-006**: System MUST provide ErrorState type
- **FR-007**: System MUST provide PaginationState type
- **FR-008**: System MUST provide AsyncValue<T> discriminated union

**Storage Types**:
- **FR-009**: System MUST provide StorageConfig type
- **FR-010**: System MUST provide StorageKeys type

**Navigation Types**:
- **FR-011**: System MUST provide RouteParams type
- **FR-012**: System MUST provide NavigationOptions type

**Error Types**:
- **FR-013**: System MUST provide ErrorMetadata type
- **FR-014**: System MUST provide RecoveryStrategy type

### Key Entities

All type definitions in `src/types/`:
- `Api.types.ts` - API-related types
- `State.types.ts` - State management types
- `Error.types.ts` - Error types
- `Storage.types.ts` - Storage types
- `Navigation.types.ts` - Navigation types

## Success Criteria

- **SC-001**: All opticore modules use centralized types
- **SC-002**: TypeScript strict mode passes with zero errors
- **SC-003**: Generic types provide full type inference
- **SC-004**: Types are exported from main index for easy import
