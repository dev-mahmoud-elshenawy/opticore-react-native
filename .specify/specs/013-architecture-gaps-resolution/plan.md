# Implementation Plan: Architecture Gaps Resolution

**Specification**: 013-architecture-gaps-resolution
**Branch**: `fix/013-architecture-gaps`
**Created**: 2026-02-05
**Estimated Effort**: 4-6 hours

---

## Overview

This plan addresses 5 critical gaps identified in architecture review:

1. **Export Gap** - State and hooks not exported (BLOCKING)
2. **Documentation Gap** - 5 specs undocumented (BLOCKING)
3. **Configuration Clarity** - Dual pattern needs docs
4. **Test Environment** - Version mismatch blocking 12 tests
5. **Error Consistency** - ApiError should extend BaseError

---

## Technical Approach

### 1. Export Gap Resolution (30 minutes)

**Problem**: State management and hooks are implemented but not exported from main package entry point.

**Solution**:

```typescript
// src/index.ts - ADD these lines:
export * from './state';
export * from './hooks';
```

**Package.json subpath exports**:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils/index.js",
    "./state": {
      "types": "./dist/state/index.d.ts",
      "import": "./dist/state/index.js",
      "require": "./dist/state/index.js"
    },
    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "import": "./dist/hooks/index.js",
      "require": "./dist/hooks/index.js"
    }
  }
}
```

**Verification**:

```typescript
// Test these imports work:
import { AsyncState, BaseStore } from 'opticore-react-native';
import { useDebounce, useAsync } from 'opticore-react-native';
import { AsyncState as AS } from 'opticore-react-native/state';
import { useDebounce as UD } from 'opticore-react-native/hooks';
```

---

### 2. Upgrade to Latest Versions (20 minutes)

**Problem**: Version mismatch between React (18.3.1) and react-test-renderer (19.2.4)

**Solution**: Upgrade to React 19 + React Native 0.83 + new testing library

```json
// package.json devDependencies - UPGRADE
{
  "react": "^19.2.4",                              // Upgrade from 18.3.1
  "react-native": "^0.83.1",                       // Upgrade from 0.76.9
  "@types/react": "^19.1.1",                       // Upgrade from 18.3.0
  "@testing-library/react-native": "^14.0.0-beta.0", // Upgrade from 13.3.3
  "test-renderer": "^0.14.0"                       // NEW: Replaces react-test-renderer
}

// package.json peerDependencies - UPDATE
{
  "react": "^19.0.0",                              // Update from "^18.0.0 || ^19.0.0"
  "react-native": ">=0.78.0"                       // Update from ">=0.74.0"
}
```

**Why `test-renderer` instead of `react-test-renderer`?**

- `test-renderer` is a modern, lightweight replacement for `react-test-renderer`
- Specifically designed for React 19
- Maintained by the same team as @testing-library/react-native
- Smaller bundle size, better performance

**Steps**:

1. Update React, React Native, and type packages
2. Replace react-test-renderer with test-renderer
3. Upgrade @testing-library/react-native to beta (supports React 19)
4. Delete node_modules and package-lock.json
5. Run `npm install`
6. Run `npm test` to verify 264/264 passing

---

### 3. Documentation Gap Resolution (2-3 hours)

**Problem**: 5 completed specs not documented in CLAUDE.md

**Solution**: Add detailed documentation for each spec using consistent template

**Template Structure** (same as existing specs):

```markdown
### ✅ Spec NNN: Feature Name (COMPLETED)

**Status**: Fully Implemented
**Branch**: `feature/NNN-feature-name` (merged to develop)
**Completion Date**: YYYY-MM-DD

**What Was Delivered**:

- ✅ Feature 1 description
- ✅ Feature 2 description

**Key Files**:

- [`src/module/File.ts`](src/module/File.ts) - Description

**Quality Metrics**:

- TypeScript: 0 errors ✓
- Tests: XX/XX passing ✓
- Coverage: XX% ✓
```

**Specs to Document**:

1. Spec 003: State Management Core
   - AsyncState pattern
   - BaseStore for Zustand
   - StateObserver for global listening
   - StoreFactory for CRUD stores

2. Spec 004: Error Classification
   - ErrorType enum
   - BaseError, RenderError, NonRenderError classes
   - ErrorClassifier for automatic categorization
   - RecoveryStrategy utilities

3. Spec 007: Utility Functions
   - String utilities (capitalize, truncate, etc.)
   - Number utilities (toInt, toDouble, clamp)
   - Date utilities (formatDate, timeAgo)
   - Array utilities (groupBy, unique)
   - Object utilities (deepMerge, get)
   - Formatters (phone, currency)
   - Platform helpers

4. Spec 009: Global Types
   - Api.types.d.ts (ApiResponse, ApiError)
   - State.types.d.ts (LoadingState, ErrorState)
   - Error.types.d.ts (ErrorMetadata, RecoveryStrategy)
   - Storage.types.d.ts (StorageConfig, StorageKeys)
   - Navigation.types.d.ts (RouteParams, NavigationOptions)

5. Spec 010: Configuration Interface
   - CoreConfig interface
   - CoreSetup singleton
   - ConfigValidator
   - Feature flags

---

### 4. Configuration Documentation (1 hour)

**Problem**: Two configuration mechanisms exist with no explanation

**Solution**: Add "Configuration Guide" section to CLAUDE.md

**Content Structure**:

```markdown
## Configuration Guide

### Overview

OptiCore provides two complementary configuration mechanisms:

- **CoreSetup**: Infrastructure layer (API, Logger, Error Handling)
- **CoreProvider**: React layer (Providers, State, Lifecycle)

### CoreSetup Usage

[Detailed explanation with code examples]

### CoreProvider Usage

[Detailed explanation with code examples]

### Recommended Pattern

[Complete working example using both]

### Configuration Reference

[Table of all config options]
```

**Key Points to Document**:

1. CoreSetup configures infrastructure BEFORE React
2. CoreProvider wraps React component tree
3. Both are optional but recommended together
4. Execution order matters: CoreSetup.init() → CoreProvider
5. Show complete App.tsx example

---

### 5. Error Consistency Resolution (1-2 hours)

**Problem**: ApiError extends native Error, not BaseError/RenderError

**Current Implementation**:

```typescript
// src/infrastructure/network/ApiError.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public url: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

**New Implementation**:

```typescript
// src/infrastructure/network/ApiError.ts
import { RenderError } from '../../error/RenderError';
import { ErrorType } from '../../error/ErrorType';

export class ApiError extends RenderError {
  constructor(
    public status: number,
    message: string,
    public url: string,
    public data?: unknown
  ) {
    super(message, {
      code: `HTTP_${status}`,
      userMessage: generateUserMessage(status, message),
      severity: getSeverity(status),
      metadata: {
        status,
        url,
        data,
      },
    });
    this.name = 'ApiError';
  }
}

function generateUserMessage(status: number, message: string): string {
  if (status >= 400 && status < 500) {
    return message; // Client errors - show to user
  }
  return 'A server error occurred. Please try again later.';
}

function getSeverity(status: number): 'warning' | 'error' | 'critical' {
  if (status >= 500) return 'critical';
  if (status >= 400) return 'error';
  return 'warning';
}
```

**HTTP Status Classification**:

- 4xx (Client Errors) → RenderError (show to user)
- 5xx (Server Errors) → Should be NonRenderError? (debate)
  - Decision: Keep as RenderError with generic message
  - Rationale: User needs to know something failed even if not their fault

**Files to Update**:

- `src/infrastructure/network/ApiError.ts` - Extend RenderError
- `src/infrastructure/network/interceptors/ErrorInterceptor.ts` - Verify still works
- `test/infrastructure/network/ApiError.test.ts` - Update tests
- `test/infrastructure/network/interceptors/ErrorInterceptor.test.ts` - Update tests

**Backward Compatibility**:

```typescript
// These should still work:
catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status); // ✅ Still works
  }
  if (error instanceof RenderError) {
    console.log(error.userMessage); // ✅ Now also works
  }
  if (error instanceof BaseError) {
    console.log(error.errorType); // ✅ Now also works
  }
}
```

---

## File Structure Changes

### Files to Modify

```
src/
├── index.ts                                      # ADD state and hooks exports
├── infrastructure/
│   └── network/
│       ├── ApiError.ts                           # REFACTOR to extend RenderError
│       └── interceptors/
│           └── ErrorInterceptor.ts               # UPDATE for new ApiError
package.json                                      # ADD subpath exports, FIX react-test-renderer
CLAUDE.md                                         # ADD 5 spec docs + Configuration Guide
test/
└── infrastructure/
    └── network/
        ├── ApiError.test.ts                      # UPDATE tests
        └── interceptors/
            └── ErrorInterceptor.test.ts          # UPDATE tests
```

### No New Files Required

All changes are updates to existing files.

---

## Testing Strategy

### 1. Unit Tests

- **ApiError**: Test new inheritance hierarchy
  - `instanceof RenderError` should be true
  - `instanceof BaseError` should be true
  - All existing properties (status, url, data) still accessible
  - User message generation logic
  - Severity classification

- **ErrorInterceptor**: Verify still works with new ApiError
  - Error creation
  - Error throwing
  - Error metadata

### 2. Integration Tests

- **Import Tests**: Verify all exports work

  ```typescript
  import { AsyncState, BaseStore } from 'opticore-react-native';
  import { useDebounce } from 'opticore-react-native';
  ```

- **Error Handling Flow**:
  ```typescript
  try {
    await apiClient.get('/endpoint');
  } catch (error) {
    if (error instanceof RenderError) {
      // Should work now
    }
  }
  ```

### 3. Regression Tests

Run full test suite to ensure no breaking changes:

```bash
npm test          # All 264 tests should pass
npm run type-check # Zero TypeScript errors
npm run lint      # Zero linting errors
```

### 4. Manual Testing

Create test app to verify imports:

```typescript
// test-app/App.tsx
import { AsyncState, useDebounce, ApiError } from 'opticore-react-native';
import { BaseStore } from 'opticore-react-native/state';

// Verify all imports work
```

---

## Migration Plan

### For Consuming Apps

**No breaking changes** - all changes are additive or internal.

Existing code continues to work:

```typescript
// Still works
catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status);
  }
}

// New capabilities available
catch (error) {
  if (error instanceof RenderError) {
    console.log(error.userMessage); // NEW
  }
}
```

### For Internal Code

No migration needed - backward compatible.

---

## Rollback Plan

If issues arise:

### Phase 1: Export Changes

```bash
git revert <commit-hash>
npm run build
npm publish
```

### Phase 2: Test Environment

```bash
npm install -D react-test-renderer@19.2.4
npm test
```

### Phase 3: Documentation

Simply revert CLAUDE.md to previous version - no runtime impact.

### Phase 4: ApiError Refactor

Most complex to rollback. Keep feature flag:

```typescript
const USE_NEW_ERROR_HIERARCHY = false;

if (USE_NEW_ERROR_HIERARCHY) {
  return new ApiError(...); // Extends RenderError
} else {
  return new LegacyApiError(...); // Extends Error
}
```

---

## Risk Assessment

| Risk                                         | Probability | Impact | Mitigation                                        |
| -------------------------------------------- | ----------- | ------ | ------------------------------------------------- |
| Import breaking existing code                | Low         | High   | All exports are additive. Test thoroughly.        |
| ApiError refactor breaking infrastructure    | Medium      | High   | Comprehensive test suite. Feature flag if needed. |
| react-test-renderer downgrade causing issues | Low         | Medium | Test all hooks after downgrade.                   |
| Documentation taking too long                | Low         | Low    | Use templates. Estimated 2-3 hours.               |
| Performance regression from new exports      | Very Low    | Low    | Tree-shaking handles this. Monitor bundle size.   |

---

## Success Metrics

### Before Implementation

- ❌ State/hooks not importable from main package
- ❌ 12 tests failing (environment issue)
- ❌ 5 specs undocumented
- ⚠️ Configuration pattern unclear
- ⚠️ ApiError not consistent with error hierarchy

### After Implementation

- ✅ All exports work from main package
- ✅ 264/264 tests passing
- ✅ 10/10 specs documented
- ✅ Configuration guide available
- ✅ Consistent error hierarchy

### Quality Gates

- ✅ TypeScript: 0 errors
- ✅ Tests: 264/264 passing
- ✅ Coverage: >80% all categories
- ✅ Lint: 0 errors
- ✅ Build: Successful
- ✅ Bundle size: No significant increase

---

## Implementation Phases

### Phase 1: Critical Blockers (30 minutes)

**Priority**: P0 - CRITICAL

1. Add exports to `src/index.ts`
2. Update `package.json` exports
3. Run build and verify
4. Test imports manually

**Exit Criteria**:

```typescript
import { AsyncState, useDebounce } from 'opticore-react-native';
// ✅ Works without error
```

### Phase 2: Version Upgrades (20 minutes)

**Priority**: P0 - CRITICAL

1. Upgrade React to 19.2.4
2. Upgrade React Native to 0.83.1
3. Update @types/react to 19.1.1
4. Replace react-test-renderer with test-renderer
5. Upgrade @testing-library/react-native to 14.0.0-beta.0
6. Update peerDependencies
7. Clear node_modules
8. Run npm install
9. Run npm test

**Exit Criteria**:

```
Test Suites: 47 passed, 47 total
Tests:       264 passed, 264 total

React: 19.2.4 ✅
React Native: 0.83.1 ✅
test-renderer: 0.14.0 ✅
```

### Phase 3: Documentation (2-3 hours)

**Priority**: P1 - HIGH

1. Document Spec 003 (State Management)
2. Document Spec 004 (Error Classification)
3. Document Spec 007 (Utility Functions)
4. Document Spec 009 (Global Types)
5. Document Spec 010 (Configuration Interface)
6. Add Configuration Guide section
7. Update "Last Updated" date

**Exit Criteria**:

- CLAUDE.md lists 10 completed specs (not 5)
- Configuration Guide section exists
- All specs follow consistent template

### Phase 4: Error Consistency (1-2 hours)

**Priority**: P2 - MEDIUM

1. Refactor ApiError to extend RenderError
2. Update ErrorInterceptor if needed
3. Update all tests
4. Run full test suite
5. Verify backward compatibility

**Exit Criteria**:

```typescript
const error = new ApiError(404, 'Not Found', '/api/users');
console.assert(error instanceof RenderError);
console.assert(error instanceof BaseError);
// ✅ Both assertions pass
```

---

## Estimated Timeline

| Phase | Task                                    | Time   | Cumulative |
| ----- | --------------------------------------- | ------ | ---------- |
| 1     | Export gap resolution                   | 30 min | 30 min     |
| 2     | Upgrade to React 19 + React Native 0.83 | 20 min | 50 min     |
| 3     | Document Spec 003                       | 30 min | 1h 20min   |
| 3     | Document Spec 004                       | 30 min | 1h 50min   |
| 3     | Document Spec 007                       | 30 min | 2h 20min   |
| 3     | Document Spec 009                       | 20 min | 2h 40min   |
| 3     | Document Spec 010                       | 20 min | 3h         |
| 3     | Configuration Guide                     | 30 min | 3h 30min   |
| 4     | Refactor ApiError                       | 1h     | 4h 30min   |
| 4     | Update tests                            | 30 min | 5h         |
| 4     | Verification & testing                  | 30 min | 5h 30min   |

**Total Estimated Time**: 5.5-6 hours

**Completion Target**: Same day (2026-02-05)

---

## Definition of Done

- [ ] `src/index.ts` exports state and hooks
- [ ] `package.json` includes subpath exports for state and hooks
- [ ] react-test-renderer version is 18.3.1
- [ ] All 264 tests passing
- [ ] Spec 003 documented in CLAUDE.md
- [ ] Spec 004 documented in CLAUDE.md
- [ ] Spec 007 documented in CLAUDE.md
- [ ] Spec 009 documented in CLAUDE.md
- [ ] Spec 010 documented in CLAUDE.md
- [ ] Configuration Guide section added to CLAUDE.md
- [ ] ApiError extends RenderError
- [ ] All error handling tests passing
- [ ] TypeScript compiles with 0 errors (strict mode)
- [ ] Linting passes with 0 errors
- [ ] Build succeeds (`npm run build`)
- [ ] Quality gates pass (`npm run validate`)
- [ ] Manual import testing completed successfully
- [ ] No regression in existing functionality
- [ ] Commit messages follow conventional commits
- [ ] Pull request created and reviewed
- [ ] Spec 013 marked as "Completed" with date

---

**Created By**: Architecture Review Analysis
**Approved By**: TBD
**Implementation Start**: 2026-02-05
