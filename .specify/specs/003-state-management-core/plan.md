# Implementation Plan: State Management Core

**Branch**: `003-state-management-core` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-state-management-core/spec.md`

## Summary

The State Management Core provides reusable patterns for managing application state using Zustand, mirroring Flutter's BLoC pattern architecture. This phase implements AsyncState pattern (Loading/Success/Error states similar to AsyncValue in Riverpod), BaseStore utilities for creating type-safe Zustand stores, StateObserver for global state listening (like GlobalBlocListener), and StoreFactory for generating stores with common patterns. These utilities eliminate boilerplate and ensure consistent state management across any React Native app.

**Technical Approach**: Use TypeScript discriminated unions for AsyncState, create abstract BaseStore pattern with Zustand middleware (immer, devtools), implement observer pattern for global state listening, and provide factory functions for generating CRUD stores with type inference.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict mode)
**Primary Dependencies**:

- Zustand ^5.0.10 (state management)
- immer ^10.0.4 (immutable updates)
- zustand/middleware (persist, devtools)

**Storage**: N/A (state only, no persistence in this phase)
**Testing**: Jest ^29.7.0, React Native Testing Library ^12.4.3
**Target Platform**: React Native 0.81+, Expo SDK 54+
**Project Type**: npm package (library)
**Performance Goals**:

- State updates: < 5ms for typical state changes
- StateObserver notifications: < 10ms latency
- Re-renders: Only components using specific state slice
  **Constraints**:
- Zero dependencies on app-specific logic
- Must work with or without React components
- Full TypeScript type inference required
  **Scale/Scope**:
- 4 core patterns (AsyncState, BaseStore, StateObserver, StoreFactory)
- ~10 TypeScript files
- 80%+ test coverage required

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ **Pure Infrastructure**: Only reusable state patterns, no app features
- ✅ **TypeScript Strict Mode**: Discriminated unions, generic types, full inference
- ✅ **SOLID Principles**:
  - Single Responsibility: Each pattern has one purpose
  - Open/Closed: Extensible via factory config, observers, middleware
  - Dependency Inversion: Stores depend on abstract patterns, not implementations
- ✅ **Zero Bugs**: Type safety prevents runtime state errors
- ✅ **Test-Driven**: 80%+ coverage for all patterns
- ✅ **Spec-First**: Based on approved spec.md

## Project Structure

### Documentation (this feature)

```text
.specify/specs/003-state-management-core/
├── spec.md              # User stories and requirements ✅
├── plan.md              # This file
└── tasks.md             # Implementation tasks (generated next)
```

### Source Code (repository root)

```text
src/
└── state/
    ├── AsyncState.ts                 # AsyncState type and helpers
    ├── AsyncStateHelpers.ts          # Utility functions (unwrap, match)
    ├── BaseStore.ts                  # Base pattern for Zustand stores
    ├── StoreFactory.ts               # Factory for CRUD stores
    ├── StateObserver.ts              # Global state listener
    ├── types/
    │   ├── StoreConfig.ts            # Configuration interfaces
    │   ├── ObserverTypes.ts          # Observer callback types
    │   └── AsyncStateTypes.ts        # AsyncState type definitions
    ├── providers/
    │   ├── QueryProvider.tsx         # React Query provider (integration)
    │   └── StoreProvider.tsx         # Optional Zustand provider wrapper
    └── index.ts                      # Public exports

tests/
└── state/
    ├── AsyncState.test.ts
    ├── AsyncStateHelpers.test.ts
    ├── BaseStore.test.ts
    ├── StoreFactory.test.ts
    ├── StateObserver.test.ts
    └── integration/
        └── state-integration.test.ts
```

**Structure Decision**: Single project structure (npm package). State management module organized by pattern (AsyncState, BaseStore, etc.). Each pattern is independent and composable.

## Implementation Phases

### Phase 0: Research & Design

**Goal**: Understand Zustand patterns, TypeScript discriminated unions, and observer pattern

**Deliverables**:

- Research Zustand middleware (immer, devtools, persist)
- Study TypeScript discriminated unions for type-safe state machines
- Review observer pattern best practices for React
- Design AsyncState type to be maximally type-safe
- Design StateObserver to prevent memory leaks

**Success Criteria**: Clear understanding of type system, patterns documented

### Phase 1: AsyncState Pattern (Priority: P1 - Critical)

**Goal**: Implement type-safe async state machine with loading/success/error states

**Components**:

1. **AsyncState.ts**: Discriminated union type with type guards
2. **AsyncStateHelpers.ts**: Utility functions for working with AsyncState

**Type Definition**:

```typescript
type AsyncState<T> =
  | { type: 'idle' }
  | { type: 'loading'; previousData?: T }
  | { type: 'success'; data: T }
  | { type: 'error'; error: Error; previousData?: T };
```

**Key Decisions**:

- Use discriminated union for compile-time exhaustiveness checking
- Include previousData for optimistic updates
- Provide type guards: isLoading, isSuccess, isError, isIdle
- Provide transition functions: toLoading(), toSuccess(data), toError(error)
- Helper function unwrap<T>(state): T | undefined for safe data access
- Helper function match<T, R>(state, handlers): R for pattern matching

**Success Criteria**:

- TypeScript infers data type in success branch
- Exhaustiveness checking in switch statements
- Zero runtime errors from state access
- Developer can use pattern in < 10 lines

### Phase 2: BaseStore Pattern (Priority: P1 - Critical)

**Goal**: Provide reusable Zustand store pattern with common functionality

**Components**:

1. **BaseStore.ts**: Utility functions and patterns for Zustand stores
2. **StoreConfig.ts**: Configuration interface for stores

**Features**:

- Immer middleware integration (mutable syntax, immutable updates)
- Devtools middleware integration (Redux DevTools)
- Reset method to return to initial state
- Hydrate method for rehydration
- Type-safe action pattern
- Support for computed values (selectors)

**Key Decisions**:

- NOT a class (use function pattern with Zustand create)
- Provide createBaseStore<T>() utility function
- Include common middleware by default
- Support custom middleware injection
- Allow store access outside React components

**Success Criteria**:

- Type inference works for state and actions
- Stores work outside React (API calls, navigation)
- Immer middleware allows mutable syntax
- DevTools integration works in development
- < 50 lines of code for typical store

### Phase 3: StateObserver Pattern (Priority: P2 - Important)

**Goal**: Global state listener for cross-cutting concerns (like GlobalBlocListener)

**Components**:

1. **StateObserver.ts**: Singleton observer for all stores
2. **ObserverTypes.ts**: Callback type definitions

**Features**:

- Subscribe to any Zustand store
- Filter by state conditions (e.g., only errors)
- Receive old state and new state in callback
- Multiple listeners per store
- Cleanup method to prevent memory leaks
- Error handling in callbacks (don't break other listeners)

**Key Decisions**:

- Use singleton pattern for global observer
- Store listeners in WeakMap to prevent memory leaks
- Execute listeners in registration order
- Isolate listener errors (try/catch per listener)
- Provide filtering function for conditional observation

**Success Criteria**:

- Callbacks triggered within 10ms of state change
- Multiple observers work concurrently
- No memory leaks from forgotten listeners
- Handles 100 concurrent state updates

### Phase 4: StoreFactory Pattern (Priority: P3 - Nice to Have)

**Goal**: Generate CRUD stores with common patterns

**Components**:

1. **StoreFactory.ts**: Factory functions for store generation

**Features**:

- Generate stores with AsyncState integration
- Standard CRUD methods (fetch, create, update, delete)
- Type inference for entity-specific methods
- Support custom action injection
- Extensible for domain-specific logic

**Key Decisions**:

- Use TypeScript generics for entity types
- Generate methods at runtime
- Include AsyncState transitions automatically
- Allow factory extension with custom config
- Provide opinionated defaults, allow overrides

**Success Criteria**:

- Generate fully-typed store in single call
- TypeScript strict mode passes with zero errors
- Custom actions integrate seamlessly
- 70% reduction in boilerplate code

### Phase 5: Providers (Integration with React)

**Goal**: React provider wrappers for state management

**Components**:

1. **QueryProvider.tsx**: React Query provider setup
2. **StoreProvider.tsx**: Optional Zustand provider wrapper

**Features**:

- Configure React Query defaults
- Provide global error handling
- Optional Zustand provider for isolated store scope

**Success Criteria**:

- Providers work with all state patterns
- Easy integration in app root

### Phase 6: Testing & Integration

**Goal**: Comprehensive testing and pattern validation

**Test Coverage**:

- AsyncState transitions and type guards
- BaseStore with middleware
- StateObserver with multiple listeners
- StoreFactory generated stores
- Integration tests: AsyncState + Zustand store + Observer

**Success Criteria**:

- All tests passing
- 80%+ code coverage
- No TypeScript errors
- Performance benchmarks met

### Phase 7: Documentation & Examples

**Goal**: Complete developer documentation

**Deliverables**:

- JSDoc comments for all public APIs
- README with pattern examples
- Example: AsyncState with data fetching
- Example: BaseStore for auth state
- Example: StateObserver for global errors
- Example: StoreFactory for CRUD store

**Success Criteria**:

- Developer can implement patterns in < 15 minutes
- All patterns documented
- Examples work without modification

## Complexity Tracking

No constitution violations. All patterns are pure infrastructure utilities following SOLID principles.

## File Inventory

### Implementation Files (10 files)

1. `src/state/AsyncState.ts`
2. `src/state/AsyncStateHelpers.ts`
3. `src/state/BaseStore.ts`
4. `src/state/StoreFactory.ts`
5. `src/state/StateObserver.ts`
6. `src/state/types/StoreConfig.ts`
7. `src/state/types/ObserverTypes.ts`
8. `src/state/types/AsyncStateTypes.ts`
9. `src/state/providers/QueryProvider.tsx`
10. `src/state/providers/StoreProvider.tsx`
11. `src/state/index.ts`

### Test Files (6 files)

1. `tests/state/AsyncState.test.ts`
2. `tests/state/AsyncStateHelpers.test.ts`
3. `tests/state/BaseStore.test.ts`
4. `tests/state/StoreFactory.test.ts`
5. `tests/state/StateObserver.test.ts`
6. `tests/state/integration/state-integration.test.ts`

**Total**: 17 files

## Dependencies

### Phase Dependencies

- Phase 0 (Research): No dependencies
- Phase 1 (AsyncState): Depends on Phase 0
- Phase 2 (BaseStore): Depends on Phase 0, parallel to Phase 1
- Phase 3 (StateObserver): Depends on Phase 2
- Phase 4 (StoreFactory): Depends on Phases 1-2
- Phase 5 (Providers): Depends on Phases 1-4
- Phase 6 (Testing): Depends on Phases 1-5
- Phase 7 (Docs): Depends on Phase 6

### Critical Path

Phase 0 → Phase 1 (AsyncState) → Phase 2 (BaseStore) → Phase 6 (Testing) → Phase 7 (Docs)

StateObserver and StoreFactory can be implemented after BaseStore in parallel.

## Risk Mitigation

**Risk**: TypeScript type inference fails for complex store states
**Mitigation**: Use explicit generic parameters, provide type helpers

**Risk**: StateObserver causes memory leaks from forgotten listeners
**Mitigation**: Use WeakMap, provide cleanup method, document proper usage

**Risk**: Zustand store updates cause excessive re-renders
**Mitigation**: Use selectors, document best practices, provide examples

**Risk**: StoreFactory generated code is not type-safe
**Mitigation**: Use TypeScript generics extensively, write comprehensive tests

**Risk**: AsyncState pattern too complex for simple use cases
**Mitigation**: Provide simple unwrap() helper, document when to use vs when to skip
