# Feature Specification: State Management Core

**Feature Branch**: `003-state-management-core`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Build state management utilities providing AsyncState pattern (Loading/Success/Error), BaseStore for Zustand, StoreFactory for store creation, and StateObserver for global state listening (similar to Flutter BLoC pattern)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Handles Async Operations with Loading States (Priority: P1)

A developer fetching data from an API wants to show loading spinner while fetching, display data on success, and show error message on failure - all with type-safe state management without writing repetitive loading/error state handling.

**Why this priority**: This is the most common pattern in any app - async data fetching with loading states. Without this, every developer writes their own loading/success/error state logic repeatedly.

**Independent Test**: Can be fully tested by creating AsyncState with initial idle state, transitioning to loading, then to success with data, and verifying UI renders correctly at each state.

**Acceptance Scenarios**:

1. **Given** AsyncState is initialized as idle, **When** async operation starts, **Then** state transitions to loading with isLoading=true
2. **Given** AsyncState is loading, **When** operation succeeds with data, **Then** state transitions to success with data accessible and isLoading=false
3. **Given** AsyncState is loading, **When** operation fails with error, **Then** state transitions to error with error message accessible and isLoading=false
4. **Given** AsyncState has data, **When** developer calls reset(), **Then** state returns to idle

---

### User Story 2 - Developer Creates Type-Safe Zustand Stores (Priority: P1)

A developer wants to create a Zustand store for authentication state (user, token, login/logout actions) with full TypeScript type safety, without writing boilerplate store setup code repeatedly.

**Why this priority**: State stores are fundamental to app architecture. BaseStore pattern ensures consistent store structure across the entire app and prevents TypeScript errors.

**Independent Test**: Can be tested by creating an auth store extending BaseStore, dispatching login action, and verifying state updates are typed and accessible.

**Acceptance Scenarios**:

1. **Given** BaseStore is extended for AuthStore, **When** developer defines state and actions with types, **Then** TypeScript infers all types correctly without manual type annotations
2. **Given** AuthStore is created, **When** developer calls login action, **Then** state updates and all components using the store re-render
3. **Given** multiple stores exist, **When** developer accesses store outside React components, **Then** store state is accessible in API calls, navigation, etc.
4. **Given** store has complex nested state, **When** developer uses immer middleware, **Then** state updates with mutable syntax compile to immutable updates

---

### User Story 3 - Developer Observes Global State Changes (Priority: P2)

A developer wants to react to global state changes (like auth logout) across the entire app - showing error toasts, navigating to login screen, or clearing caches - without prop drilling or context providers.

**Why this priority**: Global state observation is important for cross-cutting concerns but not critical for basic functionality. Apps can function without centralized state listeners initially.

**Independent Test**: Can be tested by registering global state observer for auth changes, triggering logout, and verifying observer callback is executed with old and new state.

**Acceptance Scenarios**:

1. **Given** StateObserver is configured with auth store, **When** user logs out, **Then** observer callback receives old state (with user) and new state (null user)
2. **Given** observer callback shows toast on error, **When** any store transitions to error state, **Then** error toast is displayed automatically
3. **Given** multiple observers are registered, **When** state changes, **Then** all observers are notified in registration order
4. **Given** app unmounts, **When** developer calls StateObserver.cleanup(), **Then** all listeners are removed to prevent memory leaks

---

### User Story 4 - Developer Uses Factory Pattern for Store Creation (Priority: P3)

A developer creating multiple similar stores (products, categories, users) wants a factory function that generates stores with common patterns (loading states, error handling, CRUD operations) without copy-pasting store code.

**Why this priority**: Useful for reducing boilerplate but not critical for MVP. Developers can create stores manually initially.

**Independent Test**: Can be tested by calling StoreFactory.create with entity config and verifying generated store has standard CRUD methods with correct types.

**Acceptance Scenarios**:

1. **Given** StoreFactory is called with User entity config, **When** factory generates store, **Then** store has fetchUsers, createUser, updateUser, deleteUser methods with correct types
2. **Given** factory-created store, **When** developer calls fetchUsers(), **Then** store transitions through loading → success states automatically
3. **Given** multiple entities use factory, **When** stores are created, **Then** each store is independent with isolated state
4. **Given** developer wants custom actions, **When** factory is extended with custom config, **Then** custom actions are added to generated store

---

### Edge Cases

- What happens when AsyncState transitions from error back to loading (retry scenario)?
- What happens when Zustand store is accessed before initialization?
- What happens when StateObserver callback throws an error?
- What happens when store updates trigger infinite loops (observer updating store that triggers observer)?
- What happens when multiple async operations race (second request finishes before first)?
- What happens when developer forgets to cleanup StateObserver listeners?
- What happens when store state exceeds memory limits (very large datasets)?

## Requirements _(mandatory)_

### Functional Requirements

**AsyncState Pattern**:

- **FR-001**: System MUST provide AsyncState<T> discriminated union type with states: idle, loading, success<T>, error
- **FR-002**: System MUST provide type guards: isLoading, isSuccess, isError, isIdle
- **FR-003**: System MUST provide transition functions: toLoading(), toSuccess(data), toError(error), reset()
- **FR-004**: System MUST ensure type safety - data only accessible in success state
- **FR-005**: System MUST track previous state for optimistic updates and rollback
- **FR-006**: System MUST support generic data types with full TypeScript inference

**BaseStore**:

- **FR-007**: System MUST provide BaseStore abstract class/pattern for Zustand stores
- **FR-008**: System MUST include common store methods: reset(), hydrate(state), persist()
- **FR-009**: System MUST support immer middleware for immutable updates with mutable syntax
- **FR-010**: System MUST support devtools middleware for debugging in development
- **FR-011**: System MUST provide type-safe action definitions with TypeScript generics
- **FR-012**: System MUST allow store access outside React components (API calls, navigation)
- **FR-013**: System MUST prevent direct state mutation (enforce immutability)

**StateObserver**:

- **FR-014**: System MUST provide global StateObserver singleton for cross-store observation
- **FR-015**: System MUST support registering listeners for specific stores
- **FR-016**: System MUST trigger callbacks with old state and new state on updates
- **FR-017**: System MUST support filtering by state type (e.g., only error states)
- **FR-018**: System MUST provide cleanup method to remove all listeners
- **FR-019**: System MUST execute listeners in registration order
- **FR-020**: System MUST handle listener errors without breaking other listeners

**StoreFactory**:

- **FR-021**: System MUST provide factory function for creating stores with common patterns
- **FR-022**: System MUST generate standard CRUD methods (fetch, create, update, delete)
- **FR-023**: System MUST integrate AsyncState pattern automatically in generated stores
- **FR-024**: System MUST support custom action injection in generated stores
- **FR-025**: System MUST generate TypeScript types for entity-specific methods
- **FR-026**: System MUST allow extending base factory with domain-specific logic

### Key Entities

- **AsyncState<T>**: Discriminated union for async operation states
  - `{ type: 'idle' }`
  - `{ type: 'loading', previousData?: T }`
  - `{ type: 'success', data: T }`
  - `{ type: 'error', error: Error, previousData?: T }`

- **BaseStore<T>**: Abstract store pattern with state type T, actions, middleware

- **StoreConfig**: Configuration for store creation (name, initial state, actions)

- **StateObserver**: Global state listener with observer pattern
  - `subscribe(store, callback)`
  - `unsubscribe(listener)`
  - `cleanup()`

- **StoreFactory**: Factory for generating typed stores
  - `create<T>(config): Store<T>`
  - `extend(customActions): Store`

- **AsyncStateHelpers**: Utility functions
  - `unwrap<T>(state): T | undefined` - safely extract data
  - `match<T, R>(state, handlers): R` - pattern matching for states

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developer can create AsyncState and transition through all states in under 10 lines of code
- **SC-002**: TypeScript correctly infers data type in success state without explicit type annotations
- **SC-003**: BaseStore provides 90% of common store functionality without custom code
- **SC-004**: Zustand store with BaseStore has < 50 lines of boilerplate code for typical use case
- **SC-005**: StateObserver triggers callback within 10ms of state change
- **SC-006**: StateObserver handles 100 concurrent state updates without performance degradation
- **SC-007**: StoreFactory generates fully-typed store in single function call
- **SC-008**: Factory-generated store passes TypeScript strict mode with zero errors
- **SC-009**: All state management utilities have 80%+ test coverage
- **SC-010**: State updates trigger re-renders only in components using that specific state slice (no unnecessary re-renders)
- **SC-011**: AsyncState pattern reduces loading state boilerplate by 70% compared to manual useState
- **SC-012**: Developer documentation includes working examples for all patterns
