# Feature Specification: Architecture Gaps Resolution

**Feature Branch**: `013-architecture-gaps-resolution`
**Created**: 2026-02-05
**Status**: Draft
**Priority**: **CRITICAL** 🔴
**Input**: Architecture review identified 5 critical gaps preventing package from being production-ready

## Executive Summary

This specification addresses critical gaps discovered in architecture review of specs 001-010:

1. **Export Gap**: State management and hooks not exported from main index
2. **Documentation Gap**: 5 completed specs (003, 004, 007, 009, 010) not documented in CLAUDE.md
3. **Configuration Clarity**: Dual configuration pattern (CoreSetup vs CoreProvider) needs documentation
4. **Test Environment**: react-test-renderer version mismatch blocking 12 tests
5. **Error Consistency**: ApiError should extend BaseError for architectural consistency

**Why Critical**: Issues #1 and #2 are **BLOCKING** - consuming apps cannot access 50% of implemented features.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Imports State Management (Priority: P0 - CRITICAL)

**Current Problem**: State management is implemented but not exported.

A developer installing opticore wants to use `AsyncState`, `BaseStore`, `StateObserver`, and `StoreFactory` from the main package import, but they are not exported.

**Why this priority**: **CRITICAL BLOCKER**. These are P1 features (highest priority in Spec 003) but completely unusable by consumers. This breaks the package's core value proposition.

**Independent Test**: Import state utilities from main package, verify they are accessible and usable.

**Acceptance Scenarios**:

1. **Given** developer installs opticore-react-native, **When** they import `AsyncState` from main package, **Then** import succeeds without error
2. **Given** developer uses TypeScript, **When** they import state utilities, **Then** TypeScript recognizes all exported types
3. **Given** developer creates Zustand store with `BaseStore`, **When** they extend it, **Then** all base methods are available and typed
4. **Given** developer imports from subpath, **When** they use `import { AsyncState } from 'opticore-react-native/state'`, **Then** import works correctly

**Current State**:

```typescript
// ❌ FAILS - Not exported
import { AsyncState, BaseStore } from 'opticore-react-native';

// ✅ WORKS - But ugly and requires internal knowledge
import { AsyncState } from 'opticore-react-native/dist/state/AsyncState';
```

**Required State**:

```typescript
// ✅ Should work from main package
import { AsyncState, BaseStore, StateObserver, StoreFactory } from 'opticore-react-native';

// ✅ Should also work from subpath
import { AsyncState } from 'opticore-react-native/state';
```

---

### User Story 2 - Developer Imports Custom Hooks (Priority: P0 - CRITICAL)

**Current Problem**: 11 custom hooks are implemented but not exported.

A developer wants to use opticore's custom hooks (`useDebounce`, `useAsync`, `useConnectivity`, etc.) but they are not exported from the main package.

**Why this priority**: **CRITICAL BLOCKER**. These are P1 features (Spec 006) representing significant development effort, but unusable by consumers.

**Independent Test**: Import hooks from main package, verify they work in React components.

**Acceptance Scenarios**:

1. **Given** developer installs opticore-react-native, **When** they import `useDebounce` from main package, **Then** import succeeds
2. **Given** developer uses hook in component, **When** component renders, **Then** hook functions correctly
3. **Given** developer imports all 11 hooks, **When** they use TypeScript, **Then** all hook signatures are correctly typed
4. **Given** developer imports from subpath, **When** they use `import { useDebounce } from 'opticore-react-native/hooks'`, **Then** import works

**Current State**:

```typescript
// ❌ FAILS - Not exported
import { useDebounce, useAsync } from 'opticore-react-native';

// ✅ WORKS - But requires internal knowledge
import { useDebounce } from 'opticore-react-native/dist/hooks/useDebounce';
```

**Required State**:

```typescript
// ✅ Should work from main package
import { useDebounce, useAsync, useConnectivity } from 'opticore-react-native';

// ✅ Should also work from subpath
import { useDebounce } from 'opticore-react-native/hooks';
```

---

### User Story 3 - Developer Understands Configuration Options (Priority: P1)

**Current Problem**: Two configuration mechanisms exist (CoreSetup vs CoreProvider) with no documentation explaining when to use each.

A developer installing opticore sees both `CoreSetup.init()` and `<CoreProvider>` in examples and is confused about which to use, whether to use both, and what order to call them.

**Why this priority**: P1 because it affects all consuming apps. Without clear guidance, developers will make incorrect configuration choices.

**Independent Test**: Follow documentation to configure package, verify both mechanisms work together correctly.

**Acceptance Scenarios**:

1. **Given** developer reads configuration docs, **When** they see both mechanisms, **Then** docs clearly explain when to use each
2. **Given** developer uses CoreSetup only, **When** they initialize infrastructure, **Then** ApiClient and Logger are configured
3. **Given** developer uses CoreProvider only, **When** they wrap app, **Then** React Query, Connectivity, and Lifecycle are configured
4. **Given** developer uses both, **When** they follow documented order, **Then** both configurations apply without conflicts

**Required Documentation**:

````markdown
## Configuration Guide

OptiCore provides two configuration mechanisms for different concerns:

### 1. CoreSetup (Infrastructure Layer)

Call BEFORE React initialization to configure:

- ApiClient (base URL, timeout, headers)
- Logger (log level, production mode)
- Global error handler
- Feature flags (maintenance mode, debug mode)

### 2. CoreProvider (React Layer)

Wrap your React component tree to configure:

- React Query (caching, retry logic)
- Connectivity monitoring
- Lifecycle management
- DevTools

### Recommended Pattern

```typescript
// 1. Configure infrastructure (index.js/App.tsx top)
CoreSetup.getInstance().init({
  api: { baseURL: process.env.API_URL },
  logger: { level: __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR },
});

// 2. Wrap React tree
export default function App() {
  return (
    <CoreProvider config={{ enableConnectivity: true }}>
      <Navigation />
    </CoreProvider>
  );
}
```
````

```

---

### User Story 4 - Developer Runs All Tests Successfully (Priority: P1)

**Current Problem**: 12 tests fail due to version mismatch between React (18.3.1) and react-test-renderer (19.2.4).

A developer cloning the repository and running `npm test` sees 12 test failures and thinks the code is broken, when actually it's a dependency version mismatch.

**Why this priority**: P1 because it blocks quality gates and creates false impression of broken code.

**Independent Test**: Run `npm test`, verify all 264 tests pass.

**Acceptance Scenarios**:

1. **Given** developer clones repository, **When** they run `npm install && npm test`, **Then** all tests pass
2. **Given** tests are running, **When** they complete, **Then** coverage report shows >80% coverage
3. **Given** CI/CD pipeline runs, **When** tests execute, **Then** all quality gates pass
4. **Given** package uses React 19, **When** tests run, **Then** they use modern `test-renderer` package (not legacy `react-test-renderer`)

**Current State**:
```

Test Suites: 16 failed, 31 passed, 47 total
Tests: 12 failed, 252 passed, 264 total

Error: Incorrect version of "react-test-renderer" detected.
Expected "18.3.1", but found "19.2.4".

React: 18.3.1 (devDependency)
react-test-renderer: 19.2.4 (devDependency) ❌ MISMATCH

```

**Required State**:
```

Test Suites: 47 passed, 47 total
Tests: 264 passed, 264 total
Coverage: >80% (all categories)

React: 19.2.4 ✅
React Native: 0.83.1 ✅
test-renderer: 0.14.0 ✅ (modern replacement)
@testing-library/react-native: 14.0.0-beta.0 ✅

````

---

### User Story 5 - Developer Uses Consistent Error Types (Priority: P2)

**Current Problem**: `ApiError` (infrastructure) doesn't extend `BaseError` (error classification), creating architectural inconsistency.

A developer catching API errors and custom application errors wants consistent error handling, but `ApiError` and `BaseError` are separate hierarchies.

**Why this priority**: P2 because it's an architectural inconsistency but doesn't block functionality. Current error handling works, just isn't perfectly consistent.

**Independent Test**: Throw ApiError and custom BaseError, verify both can be caught and handled consistently.

**Acceptance Scenarios**:

1. **Given** API call fails, **When** error is thrown, **Then** error is instance of both ApiError and RenderError
2. **Given** error handler checks `error instanceof BaseError`, **When** ApiError is thrown, **Then** check returns true
3. **Given** error classifier receives ApiError, **When** it classifies, **Then** it recognizes it as RenderError
4. **Given** error has HTTP 4xx status, **When** it's created, **Then** it's classified as RenderError automatically

**Current Architecture**:
```typescript
// ApiError extends native Error
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// BaseError is separate hierarchy
abstract class BaseError extends Error {
  abstract errorType: ErrorType;
}

// These are NOT compatible
````

**Required Architecture**:

```typescript
// ApiError extends RenderError (which extends BaseError)
class ApiError extends RenderError {
  constructor(
    public status: number,
    message: string
  ) {
    super(message, {
      code: `HTTP_${status}`,
      userMessage: message,
    });
  }
}

// Now ApiError instanceof BaseError === true
// Now ApiError instanceof RenderError === true
// Error classification works automatically
```

---

### Edge Cases

- What happens when consumer imports from both main and subpath exports?
- What happens when CoreSetup.init() is called multiple times?
- What happens when CoreProvider is nested multiple times?
- What happens when tests run with wrong react-test-renderer version?
- What happens when ApiError is created with 5xx status (should it be NonRenderError)?

---

## Requirements _(mandatory)_

### Functional Requirements

**Export Gap Resolution (Critical)**:

- **FR-001**: System MUST export all state management utilities from main index (`src/index.ts`)
- **FR-002**: System MUST export all custom hooks from main index (`src/index.ts`)
- **FR-003**: System MUST provide subpath exports for `opticore-react-native/state`
- **FR-004**: System MUST provide subpath exports for `opticore-react-native/hooks`
- **FR-005**: Package.json exports field MUST include state and hooks subpaths
- **FR-006**: TypeScript type definitions MUST be generated for all exports
- **FR-007**: All exports MUST be tree-shakable (only used exports bundled)

**Documentation Gap Resolution (Critical)**:

- **FR-008**: CLAUDE.md MUST document Spec 003 (State Management Core) in "Completed Specifications" section
- **FR-009**: CLAUDE.md MUST document Spec 004 (Error Classification) in "Completed Specifications" section
- **FR-010**: CLAUDE.md MUST document Spec 007 (Utility Functions) in "Completed Specifications" section
- **FR-011**: CLAUDE.md MUST document Spec 009 (Global Types) in "Completed Specifications" section
- **FR-012**: CLAUDE.md MUST document Spec 010 (Configuration Interface) in "Completed Specifications" section
- **FR-013**: Each documented spec MUST include: Status, Branch, Completion Date, What Was Delivered, Key Files, Quality Metrics

**Configuration Documentation (High Priority)**:

- **FR-014**: CLAUDE.md MUST add "Configuration Guide" section
- **FR-015**: Configuration Guide MUST explain CoreSetup purpose and usage
- **FR-016**: Configuration Guide MUST explain CoreProvider purpose and usage
- **FR-017**: Configuration Guide MUST show recommended pattern using both
- **FR-018**: Configuration Guide MUST clarify execution order (CoreSetup before CoreProvider)
- **FR-019**: Configuration Guide MUST include complete working example

**Version Upgrade Resolution (High Priority)**:

- **FR-020**: Package MUST upgrade to React 19.x (from 18.x)
- **FR-021**: Package MUST upgrade to React Native 0.83.x (from 0.76.x)
- **FR-022**: Package MUST replace `react-test-renderer` with modern `test-renderer` package
- **FR-023**: Package MUST upgrade @testing-library/react-native to 14.0.0-beta.0 (React 19 support)
- **FR-024**: All 264 tests MUST pass when `npm test` is run
- **FR-025**: Test coverage MUST exceed 80% threshold
- **FR-026**: CI/CD pipeline MUST pass all quality gates
- **FR-027**: Package MUST update peerDependencies to reflect React 19+ requirement

**Error Consistency (Medium Priority)**:

- **FR-024**: ApiError SHOULD extend RenderError (not native Error)
- **FR-025**: ApiError SHOULD be classified automatically by ErrorClassifier
- **FR-026**: HTTP 4xx errors SHOULD be RenderError by default
- **FR-027**: HTTP 5xx errors SHOULD be NonRenderError by default
- **FR-028**: Error hierarchy SHOULD be consistent across all error types
- **FR-029**: Existing error handling code SHOULD continue to work (backward compatibility)

### Non-Functional Requirements

- **NFR-001**: Export changes MUST NOT break existing imports (backward compatible)
- **NFR-002**: Documentation updates MUST be completed within 4 hours
- **NFR-003**: Export fixes MUST be completed within 1 hour
- **NFR-004**: Test fixes MUST be completed within 30 minutes
- **NFR-005**: Error refactoring MUST maintain 100% test coverage
- **NFR-006**: All changes MUST pass TypeScript strict mode compilation
- **NFR-007**: Bundle size MUST NOT increase significantly (< 5KB growth)

### Key Entities

**Files to Modify**:

- `src/index.ts` - Add state and hooks exports
- `package.json` - Add subpath exports, fix react-test-renderer version
- `CLAUDE.md` - Add 5 missing spec documentations, add Configuration Guide
- `src/infrastructure/network/ApiError.ts` - Refactor to extend RenderError
- `src/infrastructure/network/interceptors/ErrorInterceptor.ts` - Update to use new ApiError

**Files to Create**:

- `docs/Configuration.md` - Detailed configuration guide (optional, or inline in CLAUDE.md)

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

**Export Gap Resolution**:

- **SC-001**: `import { AsyncState } from 'opticore-react-native'` works without error
- **SC-002**: `import { useDebounce } from 'opticore-react-native'` works without error
- **SC-003**: `import { AsyncState } from 'opticore-react-native/state'` works without error
- **SC-004**: TypeScript compilation succeeds with 0 errors
- **SC-005**: All exports are visible in IDE autocomplete

**Documentation Gap Resolution**:

- **SC-006**: CLAUDE.md "Completed Specifications" section lists 10 specs (currently lists 5)
- **SC-007**: Each spec documentation includes all required sections (6 sections per spec)
- **SC-008**: Configuration Guide exists with clear examples
- **SC-009**: Developer reading docs can successfully configure package on first try

**Test Environment Resolution**:

- **SC-010**: `npm test` shows 264/264 tests passing (currently 252/264)
- **SC-011**: Test coverage exceeds 80% in all categories (statements, branches, functions, lines)
- **SC-012**: Zero test failures in CI/CD pipeline

**Error Consistency**:

- **SC-013**: `new ApiError(404, 'Not Found') instanceof RenderError` returns true
- **SC-014**: `ErrorClassifier.classify(apiError)` returns `ErrorType.RENDER` for 4xx errors
- **SC-015**: All existing error handling tests continue to pass (backward compatibility)

**Overall Quality**:

- **SC-016**: Package builds successfully with `npm run build`
- **SC-017**: Quality gates pass: `npm run type-check && npm run lint && npm test`
- **SC-018**: No regression in existing functionality (all original tests pass)
- **SC-019**: Bundle size increase < 5KB
- **SC-020**: Zero TypeScript errors in strict mode

---

## Dependencies

### Internal Dependencies

- Spec 003 (State Management Core) - needs export
- Spec 004 (Error Classification) - needs documentation + ApiError refactor
- Spec 006 (Custom Hooks) - needs export
- Spec 007 (Utility Functions) - needs documentation
- Spec 008 (Core Providers) - needs configuration docs
- Spec 009 (Global Types) - needs documentation
- Spec 010 (Configuration Interface) - needs configuration docs

### External Dependencies

- react-test-renderer@18.3.1 (downgrade from 19.2.4)
- No new packages required

---

## Risks & Mitigations

### Risk 1: Breaking Existing Imports

**Probability**: Low
**Impact**: High
**Mitigation**: All new exports are additive. Existing imports continue to work. Test thoroughly.

### Risk 2: ApiError Refactor Breaking Infrastructure

**Probability**: Medium
**Impact**: High
**Mitigation**:

- Update all ApiError usage in infrastructure
- Ensure backward compatibility for error handling
- Run full test suite to verify no regressions

### Risk 3: react-test-renderer Downgrade Causing New Issues

**Probability**: Low
**Impact**: Medium
**Mitigation**:

- Test all hooks after downgrade
- Check peer dependency compatibility
- Verify React 18.3.1 compatibility

### Risk 4: Documentation Taking Too Long

**Probability**: Low
**Impact**: Low
**Mitigation**:

- Follow existing spec documentation templates
- Copy structure from completed specs
- Estimated time: 2-3 hours total

---

## Implementation Notes

### Phase 1: Critical Export Gap (30 minutes)

1. Add exports to `src/index.ts`
2. Add subpath exports to `package.json`
3. Run build and verify exports
4. Test imports in consuming app

### Phase 2: Test Environment Fix (10 minutes)

1. Update react-test-renderer version in package.json
2. Run `npm install`
3. Run `npm test` to verify all pass

### Phase 3: Documentation Gap (2-3 hours)

1. Document Spec 003 in CLAUDE.md
2. Document Spec 004 in CLAUDE.md
3. Document Spec 007 in CLAUDE.md
4. Document Spec 009 in CLAUDE.md
5. Document Spec 010 in CLAUDE.md
6. Add Configuration Guide section

### Phase 4: Error Consistency (1-2 hours)

1. Refactor ApiError to extend RenderError
2. Update ErrorInterceptor usage
3. Run all tests to verify no regressions
4. Update error classification tests

**Total Estimated Time**: 4-6 hours

---

## Acceptance Testing Plan

### Test 1: State Management Import

```typescript
import { AsyncState, BaseStore, StateObserver, StoreFactory } from 'opticore-react-native';

// Create AsyncState
const state: AsyncState<User> = createAsyncState<User>();
console.assert(state.type === 'idle', 'State should be idle');

// Test subpath import
import { AsyncState as AS } from 'opticore-react-native/state';
console.assert(AS === AsyncState, 'Subpath export should match main export');
```

### Test 2: Hooks Import

```typescript
import { useDebounce, useAsync, useConnectivity } from 'opticore-react-native';

function MyComponent() {
  const debouncedValue = useDebounce('test', 500);
  const { isConnected } = useConnectivity();
  return null;
}

// Should compile without errors
```

### Test 3: Configuration Pattern

```typescript
// Step 1: Infrastructure configuration
CoreSetup.getInstance().init({
  api: { baseURL: 'https://api.example.com' },
  logger: { level: LogLevel.DEBUG },
});

// Step 2: React provider
function App() {
  return (
    <CoreProvider config={{ enableConnectivity: true }}>
      <MyApp />
    </CoreProvider>
  );
}

// Both should work without conflicts
```

### Test 4: Error Consistency

```typescript
const apiError = new ApiError(404, 'Not Found');
console.assert(apiError instanceof RenderError, 'ApiError should extend RenderError');
console.assert(apiError instanceof BaseError, 'ApiError should extend BaseError');

const classified = ErrorClassifier.classify(apiError);
console.assert(classified === ErrorType.RENDER, 'API 4xx should be RenderError');
```

### Test 5: All Tests Pass

```bash
npm test
# Expected output: 264/264 tests passing
```

---

## Definition of Done

- [ ] All exports added to `src/index.ts`
- [ ] Subpath exports added to `package.json`
- [ ] react-test-renderer version fixed
- [ ] All 264 tests passing
- [ ] 5 missing specs documented in CLAUDE.md
- [ ] Configuration Guide added to CLAUDE.md
- [ ] ApiError refactored to extend RenderError
- [ ] All error handling tests passing
- [ ] TypeScript compiles with 0 errors
- [ ] Build succeeds (`npm run build`)
- [ ] Quality gates pass (`npm run validate`)
- [ ] Documentation reviewed and approved
- [ ] Changes committed with conventional commit messages
- [ ] Spec marked as "Completed" with completion date

---

**Created By**: Architecture Review Analysis
**Reviewed By**: TBD
**Approved By**: TBD
**Completion Target**: 2026-02-05 (same day - critical priority)
