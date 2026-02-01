# Feature Specification: Core Providers

**Feature Branch**: `008-core-providers`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Build React providers for wrapping consuming apps: QueryProvider for React Query configuration, CoreProvider for combining all opticore providers (state, network, lifecycle)"

## User Scenarios & Testing

### User Story 1 - Developer Wraps App with QueryProvider (Priority: P1)

A developer wants to configure React Query globally (cache time, retry logic, error handling) by wrapping their app once, rather than configuring per-component.

**Why this priority**: React Query requires provider wrapping - critical for any app using server state management.

**Independent Test**: Wrap app with QueryProvider, make query, verify configured options apply (cache time, retry, etc.).

**Acceptance Scenarios**:

1. **Given** app wrapped with QueryProvider, **When** query is made, **Then** default staleTime is applied
2. **Given** custom error handler configured, **When** query fails, **Then** global error handler executes
3. **Given** retry configured to 3, **When** query fails, **Then** query retries 3 times before failing
4. **Given** developer wants DevTools, **When** QueryProvider includes devtools, **Then** React Query DevTools appear

---

### User Story 2 - Developer Uses CoreProvider for All Setup (Priority: P1)

A developer wants to wrap their app with single CoreProvider that configures all opticore utilities (React Query, Zustand devtools, lifecycle observers, connectivity listeners) instead of multiple nested providers.

**Why this priority**: Simplified setup is critical for developer experience - one provider instead of five.

**Independent Test**: Wrap app with CoreProvider, verify all infrastructure utilities work (queries, stores, connectivity, lifecycle).

**Acceptance Scenarios**:

1. **Given** app wrapped with CoreProvider, **When** component uses React Query, **Then** queries work correctly
2. **Given** app wrapped with CoreProvider, **When** component uses Zustand store, **Then** store updates trigger re-renders
3. **Given** app wrapped with CoreProvider, **When** network changes, **Then** connectivity listeners trigger
4. **Given** app wrapped with CoreProvider, **When** app backgrounds, **Then** lifecycle callbacks execute

---

### Edge Cases

- What happens when providers are nested incorrectly (CoreProvider inside QueryProvider)?
- What happens when CoreProvider is not at app root?
- What happens when multiple CoreProviders exist (multiple instances)?

## Requirements

### Functional Requirements

**QueryProvider**:

- **FR-001**: System MUST provide QueryProvider wrapping QueryClientProvider
- **FR-002**: System MUST configure default staleTime, cacheTime, retry logic
- **FR-003**: System MUST support global error handling
- **FR-004**: System MUST support React Query DevTools in development
- **FR-005**: System MUST allow configuration override via props

**CoreProvider**:

- **FR-006**: System MUST provide CoreProvider combining all opticore providers
- **FR-007**: System MUST initialize connectivity monitoring
- **FR-008**: System MUST initialize lifecycle management
- **FR-009**: System MUST configure React Query
- **FR-010**: System MUST support configuration via props

### Key Entities

- **QueryProvider**: React Query provider wrapper
- **CoreProvider**: Combined provider for all opticore utilities
- **CoreConfig**: Configuration interface for CoreProvider

## Success Criteria

- **SC-001**: Developer can wrap app with single CoreProvider component
- **SC-002**: All infrastructure utilities work when CoreProvider wraps app
- **SC-003**: Configuration passed to CoreProvider applies correctly
- **SC-004**: 80%+ test coverage for providers
