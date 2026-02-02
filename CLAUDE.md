# Claude Development Guide for OptiCore React Native

**Package**: `opticore-react-native`
**Version**: 1.0.0
**Last Updated**: 2026-02-02

---

## 🔄 Self-Updating Document

**IMPORTANT**: This document (`CLAUDE.md`) MUST be kept in sync with:

- [`.specify/memory/constitution.md`](.specify/memory/constitution.md) - Project constitution
- All specifications in `.specify/specs/`
- Actual project structure and patterns

**Claude's Responsibility**:

- ✅ **Automatically update** this file when making architectural changes
- ✅ **Automatically update** when constitutional principles change
- ✅ **Automatically update** when file structure changes
- ✅ **No permission needed** - Keep this guide current as part of development work
- ✅ Update **Last Updated** date when making changes

---

## Table of Contents

1. [Completed Specifications](#completed-specifications)
2. [Project Overview](#project-overview)
3. [Constitutional Authority](#constitutional-authority)
4. [Development Workflow](#development-workflow)
5. [Specification-First Process](#specification-first-process)
6. [Implementation Guidelines](#implementation-guidelines)
7. [Quality Standards](#quality-standards)
8. [Testing Requirements](#testing-requirements)
9. [Code Standards](#code-standards)
10. [Common Tasks & Commands](#common-tasks--commands)
11. [File Organization](#file-organization)
12. [What to Build vs. What NOT to Build](#what-to-build-vs-what-not-to-build)
13. [Troubleshooting](#troubleshooting)

---

## Completed Specifications

### ✅ Spec 001: NPM Package Setup (COMPLETED)

**Status**: Fully Implemented
**Branch**: `feature/001-npm-package-setup` (merged to develop)
**Completion Date**: 2026-02-01

**What Was Delivered**:

- ✅ Package initialization with TypeScript 5.7+ strict mode
- ✅ Jest testing framework with React Native Testing Library
- ✅ ESLint + Prettier configuration
- ✅ Build pipeline (TypeScript compilation to dist/)
- ✅ Quality gates: type-check, lint, format, test scripts
- ✅ Package.json with peer dependencies for React Native/Expo

**Key Files**:

- [`package.json`](package.json) - Package configuration with all dev dependencies
- [`tsconfig.json`](tsconfig.json) - TypeScript strict mode configuration
- [`jest.config.js`](jest.config.js) - Test configuration with 80% coverage threshold
- [`.eslintrc.js`](.eslintrc.js) - Linting rules
- [`.prettierrc.js`](.prettierrc.js) - Code formatting rules

**Quality Metrics**:

- TypeScript: Strict mode enabled ✓
- Tests: All passing ✓
- Coverage: 100% (initial package exports) ✓

---

### ✅ Spec 002: Infrastructure Layer (COMPLETED)

**Status**: Partially Implemented (User Stories 1-3 Complete, 4-5 Pending)
**Branch**: `feature/002-infrastructure-layer` (current)
**Completion Date**: 2026-02-02

**What Was Delivered**:

#### User Story 1: Network Layer (P1) - COMPLETE ✓

- ✅ **ApiClient** - Singleton Axios wrapper with interceptors
  - Location: [`src/infrastructure/network/ApiClient.ts`](src/infrastructure/network/ApiClient.ts)
  - Features: GET, POST, PUT, DELETE, PATCH with TypeScript generics
  - Configuration: baseURL, timeout, headers, auth callbacks
- ✅ **AuthInterceptor** - Automatic token injection and refresh
  - Location: [`src/infrastructure/network/interceptors/AuthInterceptor.ts`](src/infrastructure/network/interceptors/AuthInterceptor.ts)
  - Features: Bearer token injection, 401 auto-refresh with queue mechanism
- ✅ **LoggingInterceptor** - Request/response logging
  - Location: [`src/infrastructure/network/interceptors/LoggingInterceptor.ts`](src/infrastructure/network/interceptors/LoggingInterceptor.ts)
  - Features: Integrated with Logger for structured logging
- ✅ **ErrorInterceptor** - Error classification and handling
  - Location: [`src/infrastructure/network/interceptors/ErrorInterceptor.ts`](src/infrastructure/network/interceptors/ErrorInterceptor.ts)
  - Features: Network errors (status 0), timeouts (408), API errors, setup errors (-1)
- ✅ **ApiError** - Custom error class with status, message, URL, data
  - Location: [`src/infrastructure/network/ApiError.ts`](src/infrastructure/network/ApiError.ts)
- ✅ **Tests**: 100% coverage with comprehensive scenarios

#### User Story 2: Storage Layer (P1) - COMPLETE ✓

- ✅ **SecureStorage** - iOS Keychain + Android Keystore encryption
  - Location: [`src/infrastructure/storage/SecureStorage.ts`](src/infrastructure/storage/SecureStorage.ts)
  - **Platform Support**: iOS and Android ONLY (throws error on web)
  - Features: Key tracking for clear(), generic TypeScript types
  - Security: Uses expo-secure-store for encrypted storage
- ✅ **LocalStorage** - AsyncStorage wrapper with JSON serialization
  - Location: [`src/infrastructure/storage/LocalStorage.ts`](src/infrastructure/storage/LocalStorage.ts)
  - Features: Type-safe get/set, automatic JSON parsing
- ✅ **StorageManager** - Unified facade for both storage types
  - Location: [`src/infrastructure/storage/StorageManager.ts`](src/infrastructure/storage/StorageManager.ts)
  - Features: Singleton instances, clearAll() method
- ✅ **IStorage Interface** - Common storage contract
  - Location: [`src/infrastructure/storage/interfaces/IStorage.ts`](src/infrastructure/storage/interfaces/IStorage.ts)
- ✅ **StorageKeys** - Constants for storage key names
  - Location: [`src/infrastructure/storage/StorageKeys.ts`](src/infrastructure/storage/StorageKeys.ts)
- ✅ **Tests**: iOS/Android/Web platform coverage (web throws error)

#### User Story 3: Logger (P2) - COMPLETE ✓

- ✅ **Logger** - Singleton with colored console output
  - Location: [`src/infrastructure/logger/Logger.ts`](src/infrastructure/logger/Logger.ts)
  - Features: debug (gray), info (blue), warn (yellow), error (red)
  - Levels: DEBUG, INFO, WARN, ERROR with filtering
  - Production Mode: Suppresses ALL logs when `isProduction: true`
  - Timestamps: ISO format timestamps
- ✅ **LogLevel Enum**
  - Location: [`src/infrastructure/logger/LogLevel.ts`](src/infrastructure/logger/LogLevel.ts)
- ✅ **ILogger Interface**
  - Location: [`src/infrastructure/logger/interfaces/ILogger.ts`](src/infrastructure/logger/interfaces/ILogger.ts)
- ✅ **Tests**: All log levels, production mode, formatting

#### User Story 4: Connectivity Manager (P2) - PENDING ⏳

- ⏸️ **ConnectivityManager** - Network status monitoring
  - Status: Not yet implemented
  - Planned: NetInfo integration, online/offline callbacks
  - Directory created: [`src/infrastructure/connectivity/`](src/infrastructure/connectivity/)

#### User Story 5: Lifecycle Manager (P3) - PENDING ⏳

- ⏸️ **LifecycleManager** - App state monitoring
  - Status: Not yet implemented
  - Planned: AppState integration, active/inactive callbacks
  - Directory created: [`src/infrastructure/lifecycle/`](src/infrastructure/lifecycle/)

**Infrastructure Exports**:

- ✅ Main infrastructure index: [`src/infrastructure/index.ts`](src/infrastructure/index.ts)
- ✅ Exported to main package: [`src/index.ts`](src/index.ts)

**Dependencies Installed**:

```json
{
  "axios": "^1.13.4",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "expo-secure-store": "^15.0.8",
  "expo-modules-core": "^3.0.29",
  "@react-native-community/netinfo": "^11.5.1"
}
```

**Quality Metrics**:

- TypeScript: 0 errors, strict mode ✓
- Tests: 47/47 passing ✓
- Coverage: 88.35% (exceeds 80% requirement) ✓
  - Statements: 88.35%
  - Branches: 80.68%
  - Functions: 81.81%
  - Lines: 88.39%

**Testing Approach**:

- Mocked expo-secure-store and react-native for unit tests
- Platform-specific tests for iOS, Android, and web
- Comprehensive error scenarios for interceptors
- Integration-ready with proper module boundaries

---

## Project Overview

### What is OptiCore React Native?

OptiCore React Native is a **pure infrastructure library** for React Native/Expo applications. It provides:

- ✅ Network client with retry logic and error handling
- ✅ Storage abstraction (AsyncStorage + SecureStore)
- ✅ State management utilities (Zustand + React Query)
- ✅ Error classification system (RenderError vs NonRenderError)
- ✅ Logging infrastructure
- ✅ Navigation utilities and guards
- ✅ Custom React hooks
- ✅ Pure utility functions (string, number, array, date, etc.)
- ✅ Type-safe configuration interfaces

### What It Is NOT

- ❌ NOT an application template or boilerplate
- ❌ NOT feature modules (auth, profiles, etc.)
- ❌ NOT UI components (buttons, inputs, etc.)
- ❌ NOT theme or styling configurations
- ❌ NOT i18n setup
- ❌ NOT navigation setup (routes, screens)

### Installation in Consumer Apps

```bash
npm install opticore-react-native
```

```typescript
// Import from main entry
import { ApiClient, Logger } from 'opticore-react-native';

// Import from subpaths
import { capitalize, formatPhone } from 'opticore-react-native/utils/string';
```

---

## Constitutional Authority

**CRITICAL**: Before ANY development work, read [.specify/memory/constitution.md](.specify/memory/constitution.md)

The constitution is the **supreme authority** for this project and defines:

1. **Pure Infrastructure Library** - Zero app-specific logic
2. **Specification-First Development** - NO code without approved specs
3. **TypeScript Strict Mode** - Zero tolerance for type errors
4. **Test-Driven Development** - 80%+ test coverage required
5. **Zero Bugs Philosophy** - Professional-grade error handling
6. **SOLID Principles** - Architecture standards
7. **Extension Pattern Alternative** - Pure utility functions, no prototype modifications

**All development MUST comply with constitutional principles.**

---

## Development Workflow

### The Mandatory Workflow Order

```
Constitution → Specify → Plan → Tasks → Implement → Verify
```

#### 1. Constitution (Already Exists)

- Read [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Understand project principles and constraints
- Verify your proposed change aligns with constitutional principles

#### 2. Specify (REQUIRED for ALL changes)

- Create specification in `.specify/specs/[NNN]-[feature-name]/spec.md`
- Use template: [.specify/templates/spec-template.md](.specify/templates/spec-template.md)
- Define WHAT to build (user scenarios, requirements, success criteria)
- Use `/speckit.clarify` to resolve ambiguities
- **WAIT for user approval before proceeding**

#### 3. Plan (REQUIRED for ALL changes)

- Create plan in `.specify/specs/[NNN]-[feature-name]/plan.md`
- Use template: [.specify/templates/plan-template.md](.specify/templates/plan-template.md)
- Define HOW to build (technical approach, architecture, file structure)
- Include test strategy and migration plan if needed

#### 4. Tasks (REQUIRED for ALL changes)

- Create tasks in `.specify/specs/[NNN]-[feature-name]/tasks.md`
- Use template: [.specify/templates/tasks-template.md](.specify/templates/tasks-template.md)
- Break plan into actionable checklist items
- Each task should be < 30 minutes of work

#### 5. Implement (Code Execution)

- Follow Test-Driven Development (TDD)
- Write tests FIRST, then implementation
- Adhere to all code standards and quality gates
- Update documentation as you go

#### 6. Verify (Quality Gates)

- Run all tests: `npm test`
- Type check: `npm run type-check`
- Lint: `npm run lint`
- Format: `npm run format`
- Verify 80%+ test coverage
- Ensure all quality gates pass

---

## Specification-First Process

### Creating a New Specification

**Step 1: Numbering**

- List existing specs: `ls .specify/specs/`
- Use next sequential number (e.g., if last is `012-*`, use `013-`)

**Step 2: Create Directory**

```bash
mkdir -p .specify/specs/013-feature-name
```

**Step 3: Create spec.md**

```bash
cp .specify/templates/spec-template.md .specify/specs/013-feature-name/spec.md
```

**Step 4: Fill Out Specification**
Include these sections:

- **What**: Clear description of the feature
- **Why**: Business/technical justification
- **User Scenarios**: Real-world use cases
- **Requirements**: Functional and non-functional
- **Success Criteria**: Measurable outcomes
- **Dependencies**: Other specs/packages
- **Risks**: Potential issues and mitigations

**Step 5: Clarify if Needed**

```bash
# Use if specification has ambiguities
/speckit.clarify
```

**Step 6: Submit for Review**

- Present spec to user
- **WAIT for approval**
- Do NOT proceed to planning without approval

### Creating Plan and Tasks

**After spec approval**, create plan and tasks:

```bash
# Create plan from template
cp .specify/templates/plan-template.md .specify/specs/013-feature-name/plan.md

# Create tasks from template
cp .specify/templates/tasks-template.md .specify/specs/013-feature-name/tasks.md
```

Fill out plan with:

- Technical approach
- File structure changes
- Test strategy
- Migration plan (if breaking changes)

Fill out tasks with actionable items (< 30 min each).

---

## Implementation Guidelines

### Test-Driven Development (TDD)

**Red-Green-Refactor cycle**:

1. **Red**: Write a failing test

   ```typescript
   // src/utils/string/__tests__/capitalize.test.ts
   import { capitalize } from '../capitalize';

   describe('capitalize', () => {
     it('should capitalize first letter', () => {
       expect(capitalize('hello')).toBe('Hello');
     });
   });
   ```

2. **Green**: Write minimal code to pass

   ```typescript
   // src/utils/string/capitalize.ts
   export function capitalize(str: string): string {
     if (!str) return str;
     return str.charAt(0).toUpperCase() + str.slice(1);
   }
   ```

3. **Refactor**: Improve code quality
   ```typescript
   // Add edge case handling, optimize, add JSDoc
   /**
    * Capitalizes the first letter of a string
    * @param str - The string to capitalize
    * @returns Capitalized string
    * @example
    * capitalize('hello') // 'Hello'
    * capitalize('') // ''
    */
   export function capitalize(str: string): string {
     if (!str || typeof str !== 'string') return str;
     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
   }
   ```

### TypeScript Strict Mode

**ALL code must compile with strict mode**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Rules**:

- ❌ NO `any` types without explicit justification in comments
- ✅ Use type inference where possible
- ✅ Explicit types for public APIs
- ✅ Generic types for reusable utilities
- ✅ Discriminated unions for state machines

**Example**:

```typescript
// ❌ BAD
function fetchData(url: any): any {
  // ...
}

// ✅ GOOD
function fetchData<T>(url: string): Promise<T> {
  // ...
}

// ⚠️ Acceptable with justification
function parseJsonSafely(json: string): any {
  // Using 'any' here because JSON.parse returns unknown shape
  // Consumers should validate with Zod after parsing
  return JSON.parse(json);
}
```

### Error Handling

**ALL errors must be classified and handled**:

```typescript
import { RenderError, NonRenderError } from 'opticore-react-native/error';

// RenderError: Requires UI update
try {
  const user = await fetchUser();
} catch (error) {
  throw new RenderError('Failed to load user profile', {
    cause: error,
    userMessage: 'Unable to load your profile. Please try again.',
  });
}

// NonRenderError: Log but don't show to user
try {
  await trackAnalytics('page_view');
} catch (error) {
  throw new NonRenderError('Analytics tracking failed', {
    cause: error,
    context: { page: 'home' },
  });
}
```

**Safe execution pattern**:

```typescript
import { SafeCall } from 'opticore-react-native/utils/safe';

const result = await SafeCall(async () => {
  return await riskyOperation();
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### SOLID Principles in Practice

#### Single Responsibility

Each module has ONE reason to change:

```typescript
// ✅ GOOD: Separate concerns
class ApiClient {
  /* network only */
}
class Logger {
  /* logging only */
}
class Storage {
  /* storage only */
}

// ❌ BAD: Multiple responsibilities
class Service {
  async fetchData() {
    /* network */
  }
  logError() {
    /* logging */
  }
  saveToCache() {
    /* storage */
  }
}
```

#### Open/Closed

Extensible without modification:

```typescript
// ✅ GOOD: Open for extension
interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

class SecureStorageAdapter implements StorageAdapter {
  /* ... */
}
class AsyncStorageAdapter implements StorageAdapter {
  /* ... */
}

// ❌ BAD: Requires modification to extend
class Storage {
  async get(key: string, type: 'secure' | 'async') {
    if (type === 'secure') {
      /* ... */
    } else if (type === 'async') {
      /* ... */
    }
  }
}
```

#### Liskov Substitution

Base classes fully interchangeable:

```typescript
// ✅ GOOD: Subtypes are substitutable
interface Cache<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
}

class MemoryCache<T> implements Cache<T> {
  /* ... */
}
class DiskCache<T> implements Cache<T> {
  /* ... */
}
```

#### Interface Segregation

Small, focused interfaces:

```typescript
// ✅ GOOD: Focused interfaces
interface Readable {
  read(): Promise<string>;
}
interface Writable {
  write(data: string): Promise<void>;
}
interface Deletable {
  delete(): Promise<void>;
}

// ❌ BAD: Fat interface
interface Storage {
  read(): Promise<string>;
  write(data: string): Promise<void>;
  delete(): Promise<void>;
  compress(): Promise<void>;
  encrypt(): Promise<void>;
}
```

#### Dependency Inversion

Depend on abstractions:

```typescript
// ✅ GOOD: Depends on abstraction
class UserService {
  constructor(private api: ApiClient) {}
}

// ❌ BAD: Depends on concrete implementation
class UserService {
  private axios = new Axios();
}
```

---

## Quality Standards

### Quality Gates (MANDATORY)

Before committing ANY code:

1. **TypeScript Compilation**

   ```bash
   npm run type-check
   # MUST show: 0 errors
   ```

2. **All Tests Passing**

   ```bash
   npm test
   # MUST show: All tests passed
   # MUST show: Coverage > 80%
   ```

3. **Linting**

   ```bash
   npm run lint
   # MUST show: 0 errors, 0 warnings
   ```

4. **Formatting**

   ```bash
   npm run format
   # Auto-formats all code
   ```

5. **No Console Logs**
   - Search codebase: `grep -r "console.log" src/`
   - MUST return: No matches
   - Use `Logger` instead for all logging

6. **Documentation Updated**
   - JSDoc comments on all public APIs
   - README.md updated if public API changed
   - Examples updated if behavior changed

7. **Specification Matches Implementation**
   - Cross-check implementation against spec
   - Update spec if discovered new requirements
   - Run `/speckit.analyze` to verify consistency

### Test Coverage Requirements

**Minimum 80% coverage for:**

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

**View coverage report**:

```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

**Untested code is NOT allowed in production.**

---

## Testing Requirements

### Test File Organization

```
src/
├── utils/
│   └── string/
│       ├── capitalize.ts
│       ├── capitalize.test.ts        # Co-located
│       └── __tests__/               # Or in __tests__
│           └── formatPhone.test.ts
```

### Test Structure

```typescript
import { functionToTest } from '../functionToTest';

describe('functionToTest', () => {
  // Group related tests
  describe('when given valid input', () => {
    it('should return expected output', () => {
      const result = functionToTest('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      const result = functionToTest('');
      expect(result).toBe('');
    });
  });

  describe('when given invalid input', () => {
    it('should throw error', () => {
      expect(() => functionToTest(null)).toThrow();
    });
  });
});
```

### Integration Tests for State Management

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useUserStore } from '../stores/userStore';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store state
    useUserStore.getState().reset();
  });

  it('should fetch user successfully', async () => {
    const { result } = renderHook(() => useUserStore());

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});
```

### Mock Implementations

Provide mocks for consuming apps:

```typescript
// src/__mocks__/ApiClient.ts
export class MockApiClient {
  async get<T>(url: string): Promise<T> {
    return {} as T;
  }
}
```

---

## Code Standards

### Naming Conventions

| Type              | Convention       | Example             |
| ----------------- | ---------------- | ------------------- |
| Files (classes)   | PascalCase       | `ApiClient.ts`      |
| Files (utilities) | camelCase        | `formatPhone.ts`    |
| Functions         | camelCase        | `getUserProfile()`  |
| Types/Interfaces  | PascalCase       | `AsyncState<T>`     |
| Constants         | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`   |
| Private members   | \_prefix         | `_internalMethod()` |
| React components  | PascalCase       | `ErrorBoundary.tsx` |

### Documentation Requirements

**JSDoc on ALL public APIs**:

````typescript
/**
 * Formats a phone number to E.164 format
 *
 * @param phoneNumber - Raw phone number string
 * @param countryCode - ISO country code (default: 'US')
 * @returns Formatted phone number (e.g., '+14155552671')
 * @throws {ValidationError} If phone number is invalid
 *
 * @example
 * ```typescript
 * formatPhone('415-555-2671', 'US')
 * // Returns: '+14155552671'
 * ```
 *
 * @public
 */
export function formatPhone(phoneNumber: string, countryCode: string = 'US'): string {
  // Implementation
}
````

**When to write inline comments**:

- ✅ Complex algorithms that aren't self-evident
- ✅ Non-obvious workarounds or bug fixes
- ✅ Performance optimizations
- ✅ Justification for `any` type usage
- ❌ NOT for obvious code (`count++` // increment counter)

### Import Organization

```typescript
// 1. External dependencies
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';

// 2. Internal absolute imports
import { ApiClient } from '@/infrastructure/ApiClient';
import { Logger } from '@/infrastructure/Logger';

// 3. Relative imports
import { formatPhone } from './utils/formatPhone';
import type { UserProfile } from './types';

// 4. Type-only imports last
import type { ReactNode } from 'react';
```

### File Structure Standards

```typescript
// 1. Imports

// 2. Types/Interfaces
interface UserProfile {
  id: string;
  name: string;
}

// 3. Constants
const MAX_RETRY_COUNT = 3;

// 4. Main implementation
export class UserService {
  // ...
}

// 5. Helper functions (if not exported)
function _validateUser(user: UserProfile): boolean {
  // ...
}

// 6. Exports (if not inline)
export { UserService, type UserProfile };
```

---

## Common Tasks & Commands

### Development Commands

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format

# Build package
npm run build

# Run all quality gates
npm run verify  # (if script exists)
```

### Spec Kit Commands (via slash commands)

```bash
# Clarify ambiguities in specification
/speckit.clarify

# Analyze spec consistency
/speckit.analyze

# Run quality checklist
/speckit.checklist

# View constitution
/speckit.constitution
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/013-feature-name

# Commit with conventional commits
git commit -m "feat(utils): add formatPhone utility

- Add E.164 phone formatting
- Include country code support
- Add comprehensive tests (95% coverage)

Implements spec: 013-string-utilities"

# Push and create PR
git push origin feat/013-feature-name
```

### Adding a New Utility Function

**Example: Adding `formatPhone` to `utils/string`**

```bash
# 1. Create spec
mkdir -p .specify/specs/013-phone-formatting
cp .specify/templates/spec-template.md .specify/specs/013-phone-formatting/spec.md

# 2. Fill spec, get approval (WAIT for approval)

# 3. Create plan and tasks
cp .specify/templates/plan-template.md .specify/specs/013-phone-formatting/plan.md
cp .specify/templates/tasks-template.md .specify/specs/013-phone-formatting/tasks.md

# 4. Write test first
cat > src/utils/string/formatPhone.test.ts << 'EOF'
import { formatPhone } from './formatPhone';

describe('formatPhone', () => {
  it('should format US phone number', () => {
    expect(formatPhone('4155552671', 'US')).toBe('+14155552671');
  });
});
EOF

# 5. Run test (should fail)
npm test formatPhone

# 6. Implement function
cat > src/utils/string/formatPhone.ts << 'EOF'
export function formatPhone(phone: string, country: string = 'US'): string {
  // Implementation
}
EOF

# 7. Run test (should pass)
npm test formatPhone

# 8. Export from index
echo "export { formatPhone } from './formatPhone';" >> src/utils/string/index.ts

# 9. Run all quality gates
npm run type-check && npm test && npm run lint

# 10. Commit
git add .
git commit -m "feat(utils): add formatPhone utility"
```

### Adding a New Module (e.g., state management)

**Example: Adding Zustand store factory**

```bash
# 1. Create spec (013-state-management-core)
mkdir -p .specify/specs/013-state-management-core

# 2. After spec approval, create structure
mkdir -p src/state/{stores,hooks,types}
mkdir -p src/state/__tests__

# 3. Write tests first
cat > src/state/__tests__/createStore.test.ts

# 4. Implement
cat > src/state/createStore.ts

# 5. Export from module
cat > src/state/index.ts

# 6. Export from main entry
# Add to src/index.ts: export * from './state';

# 7. Quality gates
npm run verify
```

---

## File Organization

### Current Package Structure

```
opticore-react-native/
├── .specify/                          # Spec Kit & Memory
│   ├── memory/
│   │   └── constitution.md            # Project constitution
│   ├── specs/                         # All specifications
│   │   ├── 001-npm-package-setup/
│   │   │   ├── spec.md
│   │   │   ├── plan.md
│   │   │   └── tasks.md
│   │   ├── 002-infrastructure-layer/
│   │   └── ...
│   └── templates/                     # Spec templates
│       ├── spec-template.md
│       ├── plan-template.md
│       └── tasks-template.md
├── src/                               # Source code
│   ├── infrastructure/                # Network, Storage, Logger (folders)
│   ├── state/                         # AsyncState, Zustand stores (folders)
│   ├── error/                         # Error classification (folder)
│   ├── navigation/                    # Route utilities (folder or files)
│   ├── hooks/                         # Custom React hooks (FLAT FILES)
│   │   ├── useDebounce.ts
│   │   ├── useDebounce.test.ts
│   │   ├── useAsync.ts
│   │   ├── useAsync.test.ts
│   │   └── index.ts
│   ├── utils/                         # Pure utility functions (FLAT FILES)
│   │   ├── string.ts                  # All string utilities
│   │   ├── string.test.ts
│   │   ├── number.ts                  # All number utilities
│   │   ├── number.test.ts
│   │   ├── date.ts                    # All date utilities
│   │   ├── date.test.ts
│   │   ├── array.ts                   # All array utilities
│   │   ├── array.test.ts
│   │   ├── object.ts                  # All object utilities
│   │   ├── object.test.ts
│   │   ├── format.ts                  # Formatters (phone, currency)
│   │   ├── format.test.ts
│   │   ├── platform.ts                # Device, permissions, platform
│   │   ├── platform.test.ts
│   │   └── index.ts
│   ├── providers/                     # React providers (files or folders)
│   ├── types/                         # TypeScript definitions (flat files)
│   ├── config/                        # Configuration interfaces (flat files)
│   └── index.ts                       # Main entry point
├── examples/                          # Usage examples
├── docs/                              # Documentation
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc.js
└── CLAUDE.md                          # This file
```

### Where to Put New Code

| Type                | Location              | Example             |
| ------------------- | --------------------- | ------------------- |
| Network client      | `src/infrastructure/` | `ApiClient.ts`      |
| Storage abstraction | `src/infrastructure/` | `Storage.ts`        |
| Logger              | `src/infrastructure/` | `Logger.ts`         |
| Zustand store       | `src/state/stores/`   | `createStore.ts`    |
| React Query hook    | `src/state/hooks/`    | `useAsyncQuery.ts`  |
| Error classes       | `src/error/`          | `RenderError.ts`    |
| String utilities    | `src/utils/string/`   | `capitalize.ts`     |
| Number utilities    | `src/utils/number/`   | `formatCurrency.ts` |
| Array utilities     | `src/utils/array/`    | `chunk.ts`          |
| Date utilities      | `src/utils/date/`     | `formatDate.ts`     |
| Custom React hooks  | `src/hooks/`          | `useDebounce.ts`    |
| Navigation guards   | `src/navigation/`     | `AuthGuard.ts`      |
| React providers     | `src/providers/`      | `ApiProvider.tsx`   |
| Type definitions    | `src/types/`          | `common.ts`         |
| Config interfaces   | `src/config/`         | `AppConfig.ts`      |

### Export Strategy

**Main entry point** (`src/index.ts`):

```typescript
// Infrastructure
export * from './infrastructure';

// State management
export * from './state';

// Error handling
export * from './error';

// Navigation
export * from './navigation';

// Hooks
export * from './hooks';

// Providers
export * from './providers';

// Types
export * from './types';

// Config
export * from './config';
```

**Subpath exports** (`package.json`):

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils/string": "./dist/utils/string/index.js",
    "./utils/number": "./dist/utils/number/index.js",
    "./infrastructure": "./dist/infrastructure/index.js"
  }
}
```

---

## What to Build vs. What NOT to Build

### ✅ Build These (Infrastructure)

**Network Layer**:

- ✅ `ApiClient` with retry logic
- ✅ Request/response interceptors
- ✅ Token refresh mechanism
- ✅ Network connectivity handling
- ✅ Request queueing for offline support

**Storage Layer**:

- ✅ `Storage` abstraction over AsyncStorage
- ✅ `SecureStorage` abstraction over SecureStore
- ✅ Cache management utilities
- ✅ Storage migration helpers

**State Management**:

- ✅ `AsyncState<T>` generic type
- ✅ Zustand store factory functions
- ✅ React Query configuration helpers
- ✅ State persistence utilities
- ✅ State observers and middleware

**Error Handling**:

- ✅ `RenderError` class (shows to user)
- ✅ `NonRenderError` class (logs only)
- ✅ Error classification utilities
- ✅ Error boundary components
- ✅ Global error handler setup

**Logging**:

- ✅ `Logger` class with levels (debug, info, warn, error)
- ✅ Remote logging integration (e.g., Sentry)
- ✅ Log formatting and filtering
- ✅ Performance logging utilities

**Navigation Utilities**:

- ✅ Route helpers (type-safe navigation)
- ✅ Navigation guards (auth, permission)
- ✅ Deep linking utilities
- ✅ Back handler utilities

**Custom Hooks**:

- ✅ `useDebounce`
- ✅ `useThrottle`
- ✅ `usePrevious`
- ✅ `useAsync`
- ✅ `useNetworkStatus`
- ✅ `useAppState`
- ✅ `useKeyboard`

**Utility Functions** (No prototype modifications):

- ✅ String: `capitalize`, `truncate`, `slugify`, `formatPhone`
- ✅ Number: `formatCurrency`, `clamp`, `round`
- ✅ Array: `chunk`, `unique`, `groupBy`, `shuffle`
- ✅ Date: `formatDate`, `isToday`, `addDays`, `diffDays`
- ✅ Object: `deepClone`, `deepMerge`, `pick`, `omit`
- ✅ Validation: `isEmail`, `isUrl`, `isUUID`

**React Providers**:

- ✅ `ApiProvider` (wraps ApiClient)
- ✅ `LoggerProvider` (wraps Logger)
- ✅ `ErrorProvider` (global error handling)

**TypeScript Types**:

- ✅ `AsyncState<T>`
- ✅ `ApiResponse<T>`
- ✅ `PaginatedResponse<T>`
- ✅ `ErrorResponse`
- ✅ Common utility types

**Configuration Interfaces**:

- ✅ `ApiConfig`
- ✅ `StorageConfig`
- ✅ `LoggerConfig`
- ✅ `AppConfig`

### ❌ Do NOT Build These (Application Features)

**Authentication Features**:

- ❌ Login screens/forms
- ❌ Registration flows
- ❌ Password reset UI
- ❌ OAuth provider integrations (Google, Facebook)
- ❌ Biometric authentication setup

**UI Components**:

- ❌ Button components
- ❌ Input/TextField components
- ❌ Card components
- ❌ Modal/Dialog components
- ❌ Any styled components

**Theme/Styling**:

- ❌ Color palettes
- ❌ Theme configurations
- ❌ Styled-components setup
- ❌ Dark mode toggle UI
- ❌ Typography scales

**Internationalization (i18n)**:

- ❌ Translation files
- ❌ i18n library setup
- ❌ Language switcher UI
- ❌ Locale detection

**Navigation Setup**:

- ❌ Screen components
- ❌ Tab navigators
- ❌ Stack navigators
- ❌ Drawer navigators
- ❌ Route definitions

**Feature Modules**:

- ❌ User profile features
- ❌ Settings screens
- ❌ Notification features
- ❌ Chat/messaging
- ❌ Payment integrations
- ❌ Analytics dashboards

**Form Schemas**:

- ❌ Login form validation schemas
- ❌ Registration form schemas
- ❌ Profile edit schemas
- ❌ Any domain-specific forms

**API Endpoints**:

- ❌ Specific API route definitions
- ❌ API models for specific backends
- ❌ GraphQL queries/mutations
- ❌ Backend-specific types

### Gray Areas (Ask First)

**Potentially Acceptable** (if generic enough):

- ⚠️ Form validation helpers (if completely generic)
- ⚠️ Animation utilities (if not component-specific)
- ⚠️ Image handling utilities (resize, compress)
- ⚠️ Gesture handling utilities (if generic)

**Decision Rule**:

> "Can this be used in ANY React Native app without modification?"
>
> - If YES → Build it
> - If NO → Don't build it

---

## Troubleshooting

### TypeScript Errors

**Problem**: `Property 'X' does not exist on type 'Y'`

**Solution**:

1. Check type definitions in `src/types/`
2. Ensure types are exported from index files
3. Run `npm run type-check` to see all errors

**Problem**: `Type 'any' is not assignable to type 'T'`

**Solution**:

1. Remove `any` types
2. Use proper type inference or explicit types
3. If necessary, justify `any` with comment

### Test Failures

**Problem**: Tests failing after code change

**Solution**:

1. Read error message carefully
2. Check if test expectations match new behavior
3. Update tests if behavior change is intentional
4. Update spec if requirements changed

**Problem**: Tests passing locally but failing in CI

**Solution**:

1. Check for environment-specific issues
2. Verify all dependencies are in `package.json`
3. Check for test order dependencies (should be isolated)

### Import Errors

**Problem**: `Cannot find module 'opticore-react-native/utils/string'`

**Solution**:

1. Ensure subpath exports are defined in `package.json`
2. Rebuild package: `npm run build`
3. Check export structure matches imports

### Coverage Below 80%

**Problem**: Test coverage failing quality gate

**Solution**:

1. Run `npm test -- --coverage` to see report
2. Open `coverage/lcov-report/index.html`
3. Identify uncovered lines
4. Write tests for uncovered code paths

### Lint Warnings

**Problem**: ESLint warnings or errors

**Solution**:

1. Run `npm run lint -- --fix` to auto-fix
2. Manually fix issues that can't be auto-fixed
3. If rule is incorrect, discuss updating ESLint config

### Specification Conflicts

**Problem**: Implementation differs from spec

**Solution**:

1. **If spec is correct**: Update implementation to match
2. **If implementation is correct**: Update spec and notify user
3. **If requirements changed**: Create amendment to spec

### Constitutional Violations

**Problem**: Code violates constitutional principles

**Solution**:

1. **STOP implementation immediately**
2. Review [.specify/memory/constitution.md](.specify/memory/constitution.md)
3. Refactor to align with principles
4. If principle is wrong, propose constitutional amendment

---

## Quick Reference

### Before Starting ANY Task

- [ ] Read constitution.md
- [ ] Verify task aligns with constitutional principles
- [ ] Create specification in `.specify/specs/`
- [ ] Get user approval on spec
- [ ] Create plan and tasks
- [ ] Set up tests first (TDD)

### Before Committing ANY Code

- [ ] `npm run type-check` → 0 errors
- [ ] `npm test` → All passing, >80% coverage
- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run format` → Code formatted
- [ ] No `console.log` in code
- [ ] Documentation updated
- [ ] Spec matches implementation

### When Stuck

1. Re-read the constitution
2. Check existing specs for similar patterns
3. Run `/speckit.clarify` for ambiguities
4. Ask user for clarification (don't assume)
5. Review this CLAUDE.md guide

### Key Principles to Remember

1. **Specification-First**: NO code without approved spec
2. **Test-Driven**: Write tests BEFORE implementation
3. **Type-Safe**: Zero tolerance for type errors
4. **Pure Infrastructure**: No app-specific code
5. **SOLID Architecture**: Follow all SOLID principles
6. **Zero Bugs**: Professional-grade error handling
7. **Constitutional Authority**: Constitution supersedes all

---

## Additional Resources

### Key Files to Reference

- [.specify/memory/constitution.md](.specify/memory/constitution.md) - Project constitution
- [.specify/templates/spec-template.md](.specify/templates/spec-template.md) - Spec template
- [.specify/templates/plan-template.md](.specify/templates/plan-template.md) - Plan template
- [.specify/templates/tasks-template.md](.specify/templates/tasks-template.md) - Tasks template

### Existing Specifications

Browse `.specify/specs/` for examples of completed specs:

- `001-npm-package-setup/` - Package initialization
- `002-infrastructure-layer/` - Network, storage, logging
- `003-state-management-core/` - Zustand + React Query
- `004-error-classification/` - Error handling system
- `005-navigation-utilities/` - Navigation helpers
- `006-custom-hooks/` - React hooks
- `007-utility-functions/` - Pure utility functions
- `008-core-providers/` - React providers
- `009-types/` - TypeScript definitions
- `010-configuration-interface/` - Config interfaces
- `011-testing/` - Testing setup
- `012-documentation-examples/` - Docs and examples

### Technology Stack

- **React Native**: 0.81.5 (Expo SDK 54)
- **TypeScript**: 5.9.2+ (strict mode)
- **State**: Zustand ^5.0.10 + React Query ^5.90.18
- **Network**: Axios ^1.13.2
- **Storage**: AsyncStorage ^2.2.0 + SecureStore ^15.0.8
- **Validation**: Zod ^3.22.4
- **Forms**: React Hook Form ^7.50.1
- **Testing**: Jest ^29.7.0 + React Native Testing Library ^12.4.3

---

**Last Updated**: 2026-02-01
**Version**: 1.0.0
**Maintained By**: OptiCore Team

**For questions or clarifications, always refer back to the constitution first.**
