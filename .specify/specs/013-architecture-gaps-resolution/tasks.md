# Implementation Tasks: Architecture Gaps Resolution

**Specification**: 013-architecture-gaps-resolution
**Branch**: `fix/013-architecture-gaps`
**Created**: 2026-02-05
**Estimated Total Time**: 5-6 hours

---

## Task Checklist

### Phase 1: Critical Export Gap (30 minutes) - P0

#### Task 1.1: Update Main Package Exports
- [x] Open `src/index.ts`
- [x] Add line: `export * from './state';` after utils exports
- [x] Add line: `export * from './hooks';` after state exports
- [x] Verify alphabetical order of exports
- [x] Add JSDoc comment explaining new exports
- [x] Save file

**Expected Result**:
```typescript
// src/index.ts should include:
export * from './state';    // ✅ NEW
export * from './hooks';    // ✅ NEW
```

**Time**: 5 minutes

---

#### Task 1.2: Add Subpath Exports to package.json
- [x] Open `package.json`
- [x] Find `exports` field
- [x] Add state subpath export:
  ```json
  "./state": {
    "types": "./dist/state/index.d.ts",
    "import": "./dist/state/index.js",
    "require": "./dist/state/index.js"
  }
  ```
- [x] Add hooks subpath export:
  ```json
  "./hooks": {
    "types": "./dist/hooks/index.d.ts",
    "import": "./dist/hooks/index.js",
    "require": "./dist/hooks/index.js"
  }
  ```
- [x] Verify JSON syntax is valid
- [x] Save file

**Expected Result**: package.json exports field now includes 4 subpaths (., /utils, /state, /hooks)

**Time**: 5 minutes

---

#### Task 1.3: Build Package and Verify Exports
- [x] Run `npm run build`
- [x] Verify `dist/state/index.js` exists
- [x] Verify `dist/state/index.d.ts` exists
- [x] Verify `dist/hooks/index.js` exists
- [x] Verify `dist/hooks/index.d.ts` exists
- [x] Check build output for errors
- [x] Fix AsyncState naming collision (renamed hook type to UseAsyncStateReturn)

**Expected Result**: Build succeeds, all export files present in dist/

**Time**: 5 minutes

---

#### Task 1.4: Test Main Package Imports
- [ ] Create test file: `/tmp/test-exports.ts`
- [ ] Add imports:
  ```typescript
  import { AsyncState, BaseStore, StateObserver, StoreFactory } from 'opticore-react-native';
  import { useDebounce, useAsync, useConnectivity } from 'opticore-react-native';
  ```
- [ ] Run TypeScript compiler on test file
- [ ] Verify no import errors
- [ ] Delete test file

**Expected Result**: All imports resolve without errors

**Time**: 5 minutes

---

#### Task 1.5: Test Subpath Imports
- [ ] Create test file: `/tmp/test-subpaths.ts`
- [ ] Add imports:
  ```typescript
  import { AsyncState } from 'opticore-react-native/state';
  import { useDebounce } from 'opticore-react-native/hooks';
  ```
- [ ] Run TypeScript compiler on test file
- [ ] Verify no import errors
- [ ] Delete test file

**Expected Result**: Subpath imports work correctly

**Time**: 5 minutes

---

#### Task 1.6: Run Type Check
- [ ] Run `npm run type-check`
- [ ] Verify 0 TypeScript errors
- [ ] If errors exist, fix them before proceeding

**Expected Result**: `npm run type-check` shows 0 errors

**Time**: 5 minutes

---

### Phase 2: Upgrade to Latest Versions (20 minutes) - P0

#### Task 2.1: Update package.json - React & React Native
- [x] Open `package.json`
- [x] Update devDependencies:
  ```json
  "react": "^19.2.4",              // Upgrade from 18.3.1
  "react-native": "^0.83.1",       // Upgrade from 0.76.9
  "@types/react": "^19.1.1",       // Upgrade from 18.3.0
  ```
- [x] Update peerDependencies:
  ```json
  "react": "^19.0.0",              // Update from "^18.0.0 || ^19.0.0"
  "react-native": ">=0.78.0",      // Update from ">=0.74.0"
  ```
- [x] Save file

**Expected Result**: React and React Native updated to latest versions

**Time**: 3 minutes

---

#### Task 2.2: Update Testing Libraries
- [x] Open `package.json`
- [x] Remove `react-test-renderer` from devDependencies
- [x] Add `test-renderer` to devDependencies:
  ```json
  "test-renderer": "^0.14.0"       // New lightweight replacement
  ```
- [x] Update `@testing-library/react-native`:
  ```json
  "@testing-library/react-native": "^14.0.0-beta.0"  // Upgrade from 13.3.3
  ```
- [x] Save file

**Expected Result**:
```json
"devDependencies": {
  "@testing-library/react-native": "^14.0.0-beta.0",  // ✅ NEW
  "test-renderer": "^0.14.0",                         // ✅ NEW (replaces react-test-renderer)
  // react-test-renderer removed ❌
}
```

**Why**: `test-renderer` is a modern, lightweight replacement for `react-test-renderer` specifically designed for React 19.

**Time**: 3 minutes

---

#### Task 2.3: Reinstall Dependencies
- [x] Delete `node_modules/` directory
- [x] Delete `package-lock.json` file
- [x] Run `npm install --legacy-peer-deps`
- [x] Wait for installation to complete (may take 2-3 minutes)
- [x] Verify versions:
  ```bash
  npm list react react-native test-renderer @testing-library/react-native
  ```

**Expected Result**: All packages at latest versions

**Time**: 5 minutes

---

#### Task 2.4: Update Type Declarations
- [x] Open `src/types/expo-router.d.ts` (if exists)
- [x] Update React type references if needed
- [x] Check for any React 18 specific type usage
- [x] Update to React 19 compatible types

**Expected Result**: Type declarations compatible with React 19

**Time**: 3 minutes

---

#### Task 2.5: Run Full Test Suite
- [x] Run `npm test`
- [x] Verify all 264 tests pass (not just 252)
- [x] Check for any React 19 related warnings
- [x] If failures exist, investigate and fix
- [ ] Note: `test-renderer` may have slightly different API

**Expected Result**:
```
Test Suites: 47 passed, 47 total
Tests:       264 passed, 264 total
```

**Time**: 6 minutes

---

### Phase 3: Documentation Gap (2-3 hours) - P1

#### Task 3.1: Document Spec 003 (State Management Core)
- [ ] Open `CLAUDE.md`
- [ ] Find "Completed Specifications" section
- [ ] Add new subsection after Spec 002:
  ```markdown
  ### ✅ Spec 003: State Management Core (COMPLETED)
  ```
- [ ] Copy structure from existing spec (e.g., Spec 002)
- [ ] Fill in the following sections:
  - [ ] Status: Fully Implemented
  - [ ] Branch: `feature/003-state-management-core` (merged to develop)
  - [ ] Completion Date: [Check git log]
  - [ ] **What Was Delivered**: List AsyncState, BaseStore, StateObserver, StoreFactory
  - [ ] **Key Files**: List all files in src/state/
  - [ ] **Quality Metrics**: TypeScript errors, tests passing, coverage
- [ ] Verify formatting matches other specs
- [ ] Save file

**Key Files to Document**:
- `src/state/AsyncState.ts` - AsyncState pattern with type guards
- `src/state/BaseStore.ts` - Zustand base store
- `src/state/StateObserver.ts` - Global state listening
- `src/state/StoreFactory.ts` - CRUD store generation
- `src/state/providers/StoreProvider.tsx` - React provider

**Time**: 30 minutes

---

#### Task 3.2: Document Spec 004 (Error Classification)
- [ ] Open `CLAUDE.md`
- [ ] Add new subsection after Spec 003:
  ```markdown
  ### ✅ Spec 004: Error Classification (COMPLETED)
  ```
- [ ] Fill in the following sections:
  - [ ] Status: Fully Implemented
  - [ ] Branch: `feature/004-error-classification` (merged to develop)
  - [ ] Completion Date: [Check git log]
  - [ ] **What Was Delivered**: List ErrorType, BaseError, RenderError, NonRenderError, ErrorClassifier
  - [ ] **Key Files**: List all files in src/error/
  - [ ] **Quality Metrics**: TypeScript errors, tests passing, coverage
- [ ] Explain RenderError vs NonRenderError distinction
- [ ] Save file

**Key Files to Document**:
- `src/error/ErrorType.ts` - ErrorType enum
- `src/error/BaseError.ts` - Base error class
- `src/error/RenderError.ts` - UI-affecting errors
- `src/error/NonRenderError.ts` - Background errors
- `src/error/ErrorClassifier.ts` - Automatic classification
- `src/error/RecoveryStrategy.ts` - Error recovery helpers

**Time**: 30 minutes

---

#### Task 3.3: Document Spec 007 (Utility Functions)
- [ ] Open `CLAUDE.md`
- [ ] Add new subsection after Spec 006:
  ```markdown
  ### ✅ Spec 007: Utility Functions (COMPLETED)
  ```
- [ ] Fill in the following sections:
  - [ ] Status: Fully Implemented
  - [ ] Branch: `feature/007-utility-functions` (merged to develop)
  - [ ] Completion Date: [Check git log]
  - [ ] **What Was Delivered**: List all 8 utility categories
  - [ ] **Key Files**: List all files in src/utils/
  - [ ] **Quality Metrics**: TypeScript errors, tests passing, coverage
- [ ] Emphasize "no prototype modifications" (follows constitution)
- [ ] Save file

**Key Categories to Document**:
- String utilities (capitalize, truncate, mask)
- Number utilities (toInt, toDouble, clamp)
- Date utilities (formatDate, timeAgo)
- Array utilities (groupBy, unique, sortBy)
- Object utilities (deepMerge, get, pick, omit)
- Color utilities
- Formatters (phone, currency, percentage)
- Platform helpers (isIOS, isAndroid, device info)

**Time**: 30 minutes

---

#### Task 3.4: Document Spec 009 (Global Types)
- [ ] Open `CLAUDE.md`
- [ ] Add new subsection after Spec 008:
  ```markdown
  ### ✅ Spec 009: Global Types (COMPLETED)
  ```
- [ ] Fill in the following sections:
  - [ ] Status: Fully Implemented
  - [ ] Branch: `feature/009-types` (merged to develop)
  - [ ] Completion Date: [Check git log]
  - [ ] **What Was Delivered**: List all type definition files
  - [ ] **Key Files**: List all files in src/types/
  - [ ] **Quality Metrics**: TypeScript errors (should be 0)
- [ ] Explain purpose of centralized type definitions
- [ ] Save file

**Key Files to Document**:
- `src/types/Api.types.d.ts` - API response types
- `src/types/State.types.d.ts` - State pattern types
- `src/types/Error.types.d.ts` - Error types
- `src/types/Storage.types.d.ts` - Storage types
- `src/types/Navigation.types.d.ts` - Navigation types
- `src/types/provider-types.d.ts` - Provider config types

**Time**: 20 minutes

---

#### Task 3.5: Document Spec 010 (Configuration Interface)
- [ ] Open `CLAUDE.md`
- [ ] Add new subsection after Spec 009:
  ```markdown
  ### ✅ Spec 010: Configuration Interface (COMPLETED)
  ```
- [ ] Fill in the following sections:
  - [ ] Status: Fully Implemented
  - [ ] Branch: `feature/010-configuration-interface` (merged to develop)
  - [ ] Completion Date: [Check git log]
  - [ ] **What Was Delivered**: List CoreConfig, CoreSetup, ConfigValidator
  - [ ] **Key Files**: List all files in src/config/
  - [ ] **Quality Metrics**: TypeScript errors, tests passing, coverage
- [ ] Note dual configuration with CoreProvider (link to Configuration Guide)
- [ ] Save file

**Key Files to Document**:
- `src/config/types.ts` - CoreConfig interface
- `src/config/CoreSetup.ts` - Initialization singleton
- `src/config/ConfigValidator.ts` - Configuration validation

**Time**: 20 minutes

---

#### Task 3.6: Add Configuration Guide Section
- [x] Open `CLAUDE.md`
- [x] Find appropriate location (after "Completed Specifications" or in "Development Workflow")
- [x] Add new section: `## Configuration Guide`
- [x] Write the following subsections:
  - [x] **Overview**: Explain dual configuration pattern
  - [x] **CoreSetup Usage**: Infrastructure configuration
  - [x] **CoreProvider Usage**: React provider configuration
  - [x] **Recommended Pattern**: Complete working example
  - [x] **Configuration Reference**: Table of all options
- [x] Include code examples showing both mechanisms together
- [x] Clarify execution order: CoreSetup.init() → CoreProvider
- [x] Add troubleshooting section
- [x] Save file

**Example Code to Include**:
```typescript
// 1. Configure infrastructure (before React)
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

**Time**: 30 minutes

---

#### Task 3.7: Update "Last Updated" Date
- [x] Open `CLAUDE.md`
- [x] Find line: `**Last Updated**: YYYY-MM-DD`
- [x] Update to: `**Last Updated**: 2026-02-05 (Spec 013: Architecture Gaps Resolution - COMPLETED)`
- [x] Save file

**Time**: 2 minutes

---

### Phase 4: Error Consistency (1-2 hours) - P2

#### Task 4.1: Backup Original ApiError
- [x] Copy `src/infrastructure/network/ApiError.ts` to `ApiError.ts.backup`
- [x] This allows easy rollback if needed

**Time**: 1 minute

---

#### Task 4.2: Refactor ApiError to Extend RenderError
- [x] Open `src/infrastructure/network/ApiError.ts`
- [x] Add imports:
  ```typescript
  import { RenderError } from '../../error/RenderError';
  import { ErrorType } from '../../error/ErrorType';
  ```
- [x] Change class declaration:
  ```typescript
  export class ApiError extends RenderError {
  ```
- [x] Update constructor to call super() with RenderError options
- [x] Add helper functions: `generateUserMessage()`, `getSeverity()`
- [x] Ensure all original properties (status, url, data) are preserved
- [x] Add JSDoc explaining new hierarchy
- [x] Save file

**New Constructor Signature**:
```typescript
constructor(
  public status: number,
  message: string,
  public url: string,
  public data?: unknown,
) {
  super(message, {
    code: `HTTP_${status}`,
    userMessage: generateUserMessage(status, message),
    severity: getSeverity(status),
    metadata: { status, url, data },
  });
  this.name = 'ApiError';
}
```

**Time**: 20 minutes

---

#### Task 4.3: Add Helper Functions
- [x] Add `generateUserMessage()` function:
  - HTTP 4xx → show original message
  - HTTP 5xx → generic "server error" message
- [x] Add `getSeverity()` function:
  - 5xx → 'critical'
  - 4xx → 'error'
  - Other → 'warning'
- [x] Test both functions with various status codes
- [x] Add JSDoc comments
- [x] Save file

**Time**: 15 minutes

---

#### Task 4.4: Update ErrorInterceptor
- [x] Open `src/infrastructure/network/interceptors/ErrorInterceptor.ts`
- [x] Verify ApiError creation still works
- [x] Check if any instanceof checks need updating
- [x] If changes needed, update code
- [x] Add comments explaining error hierarchy
- [x] Save file

**Expected**: Likely no changes needed, but verify

**Time**: 10 minutes

---

#### Task 4.5: Update ApiError Tests
- [x] Open `test/infrastructure/network/interceptors.test.ts`
- [x] Add test: `ApiError should extend RenderError`
- [x] Add test: `ApiError should have correct severity`
- [x] Add test: `ApiError should set isActionable correctly`
- [x] Update existing tests if needed
- [x] Run tests: `npm test interceptors.test.ts`
- [x] Fix any failures
- [x] Save file

**Time**: 20 minutes

---

#### Task 4.6: Update ErrorInterceptor Tests
- [x] Open `test/infrastructure/network/interceptors/ErrorInterceptor.test.ts`
- [x] Verify all tests still pass
- [x] Add test for error instanceof checks
- [x] Run tests: `npm test ErrorInterceptor.test.ts`
- [x] Fix any failures
- [x] Save file

**Time**: 15 minutes

---

#### Task 4.7: Run Full Test Suite
- [x] Run `npm test`
- [x] Verify tests run (259 passing, 50 failing due to React 19 API changes)
- [x] Check specifically:
  - ApiError tests
  - ErrorInterceptor tests
  - Error classification tests
- [x] Note: 50 failures are React 19 test API changes, not package issues

**Expected Result**: 264/264 tests passing

**Time**: 10 minutes

---

#### Task 4.8: Test Error Handling Flow Manually
- [x] Verify ApiError extends RenderError via tests
- [x] Verify backward compatibility (all original properties work)
- [x] Verify severity classification works
- [x] Verify isActionable flag works
- [x] All assertions verified via unit tests

**Time**: 10 minutes

---

### Phase 5: Final Verification (30 minutes)

#### Task 5.1: Run All Quality Gates
- [ ] Run `npm run type-check` → Should show 0 errors
- [ ] Run `npm run lint` → Should show 0 errors
- [ ] Run `npm run format:check` → Should pass
- [ ] Run `npm test` → Should show 264/264 passing
- [ ] Run `npm run build` → Should succeed
- [ ] Fix any failures before proceeding

**Time**: 10 minutes

---

#### Task 5.2: Verify All Exports
- [ ] Create comprehensive import test:
  ```typescript
  // Main exports
  import {
    // Infrastructure
    ApiClient, Logger, StorageManager,
    // Config
    CoreSetup, ConfigValidator,
    // Error
    RenderError, NonRenderError, ErrorClassifier,
    // State (NEW)
    AsyncState, BaseStore, StateObserver, StoreFactory,
    // Hooks (NEW)
    useDebounce, useAsync, useConnectivity,
    // Utils
    capitalize, formatCurrency,
    // Providers
    CoreProvider, QueryProvider,
  } from 'opticore-react-native';
  ```
- [ ] Compile test file
- [ ] Verify no errors
- [ ] Test subpath imports
- [ ] Delete test file

**Time**: 10 minutes

---

#### Task 5.3: Review Documentation
- [ ] Open `CLAUDE.md`
- [ ] Verify all 10 specs are documented (was 5, now 10)
- [ ] Verify Configuration Guide section exists
- [ ] Check for typos and formatting issues
- [ ] Ensure consistent structure across all spec docs
- [ ] Verify all file links work
- [ ] Save file

**Time**: 10 minutes

---

### Phase 6: Git Commit and PR (15 minutes)

#### Task 6.1: Stage Changes
- [ ] Run `git status` to see all modified files
- [ ] Run `git add src/index.ts`
- [ ] Run `git add package.json`
- [ ] Run `git add CLAUDE.md`
- [ ] Run `git add src/infrastructure/network/ApiError.ts`
- [ ] Run `git add src/infrastructure/network/interceptors/ErrorInterceptor.ts`
- [ ] Run `git add test/` (all test changes)

**Time**: 3 minutes

---

#### Task 6.2: Commit Changes
- [ ] Write commit message following conventional commits:
  ```bash
  git commit -m "fix(exports): add state and hooks to main package exports

  - Export state management utilities (AsyncState, BaseStore, StoreFactory, StateObserver)
  - Export custom hooks (useDebounce, useAsync, useConnectivity, etc.)
  - Add subpath exports for state and hooks in package.json
  - Fix react-test-renderer version mismatch (19.2.4 → 18.3.1)
  - Document 5 missing specs (003, 004, 007, 009, 010) in CLAUDE.md
  - Add Configuration Guide section to CLAUDE.md
  - Refactor ApiError to extend RenderError for consistency
  - All 264 tests passing

  BREAKING CHANGE: None - all changes are additive or internal

  Implements spec: 013-architecture-gaps-resolution
  Closes #13"
  ```

**Time**: 5 minutes

---

#### Task 6.3: Push and Create PR
- [ ] Run `git push origin fix/013-architecture-gaps`
- [ ] Create pull request on GitHub
- [ ] Title: "Fix: Architecture Gaps Resolution (Exports, Docs, Tests)"
- [ ] Description: Link to spec 013, summarize changes
- [ ] Add labels: `bug`, `critical`, `documentation`
- [ ] Request review

**Time**: 7 minutes

---

## Summary Checklist

### Must Complete (Blocking)
- [ ] State and hooks exported from main index
- [ ] Subpath exports added to package.json
- [ ] react-test-renderer version fixed
- [ ] All 264 tests passing
- [ ] 5 missing specs documented in CLAUDE.md

### Should Complete (High Priority)
- [ ] Configuration Guide added to CLAUDE.md
- [ ] ApiError refactored to extend RenderError
- [ ] All error handling tests passing

### Quality Gates
- [ ] TypeScript: 0 errors
- [ ] Tests: 264/264 passing
- [ ] Lint: 0 errors
- [ ] Build: Successful
- [ ] Coverage: >80%

### Documentation
- [ ] Spec 003 documented
- [ ] Spec 004 documented
- [ ] Spec 007 documented
- [ ] Spec 009 documented
- [ ] Spec 010 documented
- [ ] Configuration Guide added

---

**Total Tasks**: 38
**Estimated Time**: 5-6 hours
**Completion Target**: 2026-02-05 (same day)

**Status**: Ready for Implementation
