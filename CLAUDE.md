# Claude Development Guide for OptiCore React Native

**Package**: `opticore-react-native`
**Version**: 2.7.0
**Last Updated**: 2026-06-25 (v2.7.0: error system RN alignment — `OptiCoreErrorBoundary` now always converges a caught error to a fallback (removed the `NON_RENDER` re-render branch that could infinite-loop); boundary logging wrapped so a failing `Logger` can't crash it; **throwing `NonRenderError` is deprecated** — it's a descriptor/log payload (RN Error Boundaries can't catch the async/event errors it describes), use `Logger`/`Result<T,E>` instead; boundary `NON_RENDER` handling + throw semantics slated for removal in 3.0; error docs realigned to the three-outcome RN model. Non-breaking. Spec 031. v2.6.0: transient retry handling — `ApiError` gains `isRetryable`/`retryAfterMs`; `408`/`429` reclassified as retryable not actionable; `createQueryClient` retry/retryDelay honor `Retry-After`; `RequestConfig` contract fix (`body`→`data`); side-effect-free imports. Spec 030. v2.5.0: core-hardening round 2 — log token redaction, offline data-loss fixes (conflict-retry budget, fresh-token replay, per-item maxRetries), **default conflict strategy now server-wins** + `ConflictStrategy` constant, SecureStorage concurrency safety, useFieldValidation/useAsyncState race guards, credit-card 16-digit cap, `request()` params/DELETE-body, `useFormState` control/register, `sideEffects:false` + `react-native` export condition, CoreSetup StrictMode idempotency, theme listener cleanup. Spec 029. v2.4.0: core-hardening pass — logger prod-output, durable offline persistence, dispose/cleanup fixes, real `useThrottle`, single canonical `HttpMethod` enum, new `config`/`error`/`infrastructure`/`providers`/`query` subpath exports, WCAG contrast, plus assorted hook/theme/forms/storage correctness fixes. v2.3.0: offline conflict shape fix, single-flight token refresh, request cancellation. v2.2.0: `createQueryHook`, `useApiMutation`, `createQueryPersister`, `useTextStyle` + type guards.)
**Target Platforms**: iOS & Android ONLY

> **📖 Spec Kit Reference**: See [SPECKIT_GUIDE.md](.specify/SPECKIT_GUIDE.md) for complete specification-driven development guide

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
4. [CRITICAL: Workflow Adherence](#critical-workflow-adherence)
5. [Development Workflow](#development-workflow)
6. [Specification-First Process](#specification-first-process)
6. [Implementation Guidelines](#implementation-guidelines)
7. [Quality Standards](#quality-standards)
8. [Testing Requirements](#testing-requirements)
9. [Code Standards](#code-standards)
10. [Common Tasks & Commands](#common-tasks--commands)
11. [File Organization](#file-organization)
12. [What to Build vs. What NOT to Build](#what-to-build-vs-what-not-to-build)
13. [Troubleshooting](#troubleshooting)

## CRITICAL: Workflow Adherence

> [!IMPORTANT]
> **YOU MUST FOLLOW THE WORKFLOWS DEFINED IN [`.agent/workflows/`](.agent/workflows/)**
>
> Before starting any task, open the relevant workflow and follow it step-by-step:
> - **Spec Implementation**: [`.agent/workflows/spec_implementation_flow.md`](.agent/workflows/spec_implementation_flow.md)
> - **Git Flow**: [`.agent/workflows/spec_git_alignment.md`](.agent/workflows/spec_git_alignment.md)
> - **Critical Enforcement**: [`.agent/workflows/critical_workflow_enforcement.md`](.agent/workflows/critical_workflow_enforcement.md)
>
> Failure to follow these workflows results in inconsistent state and documentation drift.

---

## Completed Specifications

> **Note**: To keep this document concise, completed specifications have been moved to [docs/COMPLETED_SPECS.md](docs/COMPLETED_SPECS.md).

---

## Project Overview

### What is OptiCore React Native?

OptiCore React Native is a **pure infrastructure library** for React Native/Expo applications. It provides:

- ✅ Network client with retry logic and error handling (public methods)
- ✅ Storage abstraction (AsyncStorage + SecureStore)
- ✅ State management utilities (Zustand + React Query)
- ✅ Error classification system (RenderError vs NonRenderError)
- ✅ Logging infrastructure (Pluggable Transports, JSON formatting)
- ✅ Navigation utilities (programmatic navigation with Expo Router)
- ✅ **11 Custom React Hooks** (async state, device state, performance optimization)
- ✅ **React Providers** (OptiCoreProvider, useConfig)
- ✅ Pure utility functions (string, number, array, date, etc.)
- ✅ Type-safe configuration interfaces

### 📱 Platform Support

**CRITICAL: This library targets iOS and Android ONLY**

- ✅ **iOS**: Full support (iOS 13.4+)
- ✅ **Android**: Full support (Android 5.0+, API level 21+)
- ❌ **Web**: NOT supported - Some features (like SecureStorage) will throw errors on web platform

**Platform-Specific Behavior**:

- `SecureStorage`: Uses iOS Keychain + Android Keystore. **Throws error on web** - use `LocalStorage` instead for web.
- `LocalStorage`: Uses `AsyncStorage` - works on all platforms
- `ConnectivityManager`: Uses NetInfo - works on all platforms but optimized for native
- `LifecycleManager`: Uses AppState - works on all platforms

### What It Is NOT

- ❌ NOT an application template or boilerplate
- ❌ NOT feature modules (auth, profiles, etc.)
- ❌ NOT UI components (buttons, inputs, etc.)
- ❌ NOT theme or styling configurations
- ❌ NOT i18n setup
- ❌ NOT navigation setup (routes, screens)
- ❌ NOT a web-first library (iOS/Android only)

### Installation in Consumer Apps

```bash
npm install opticore-react-native
# Then install the native peers (see Adapter System below)
npx opticore-install-peers
```

```typescript
// Import from main entry (everything is re-exported here)
import { ApiClient, Logger, OptiCoreProvider } from 'opticore-react-native';

// Import from a subpath (defined in package.json "exports")
import { capitalize } from 'opticore-react-native/utils';
import type { LocalStorageAdapter } from 'opticore-react-native/adapters';
```

Subpath exports map to `dist/*`: `.`, `./utils`, `./state`, `./hooks`, `./forms`,
`./offline`, `./theme`, `./adapters`, `./navigation`, and `./metro` (the Metro config helper).

> **Navigation is NOT in the main barrel.** `useRouteHelper` / `NavigationParams` are exposed
> ONLY via `opticore-react-native/navigation`, because they import `expo-router`. Even though
> `expo-router` is a **required** peer, keeping navigation in a subpath means the main entry's
> bundle never resolves expo-router unless that subpath is actually imported — so the rest of
> OptiCore stays usable/buildable without pulling expo-router in. Do NOT re-export navigation
> from `src/index.ts`. See spec 028.

---

## Architecture: Adapter System (v1.1.0 — READ THIS FIRST)

This is the most important cross-cutting design in the codebase and it spans
`src/adapters/`, `src/providers/`, every infrastructure singleton, `metro.js`,
and `bin/install-peers.mjs`. Understand it before touching storage, connectivity,
device, or clipboard code.

**The problem it solves**: v1.0.0 pinned native modules (`expo-secure-store`,
NetInfo, AsyncStorage, …) as hard `dependencies`. That caused cross-SDK runtime
crashes (e.g. `ClassNotFoundException: AnyTypeProvider`) when a consumer's Expo
SDK didn't match OptiCore's pinned `expo-modules-core`.

**The v1.1.0 fix**: native modules are now **optional `peerDependencies`**
(`peerDependenciesMeta` marks them `optional: true`). OptiCore depends only on a
set of small **adapter interfaces** and resolves a concrete implementation at
runtime via a **resolver chain**.

### How it fits together

1. **Interfaces** (`src/adapters/interfaces.ts`) — stable contracts:
   `SecureStorageAdapter`, `LocalStorageAdapter`, `ConnectivityAdapter`,
   `DeviceAdapter`, `ClipboardAdapter`, and the `OptiCoreAdapters` injection bundle.
   OptiCore code depends on these, never on a native module directly.

2. **Default adapters** (`src/adapters/defaults/*`) — each wraps one peer behind
   a `create*Adapter()` factory that **lazily `require()`s** the peer and returns
   `null` if it's absent or its native module isn't in the binary. Never throws at
   import time — that's what keeps the library Expo Go-friendly.

3. **`nativeModulePresent` / `loadOptionalNativeModule`**
   (`src/adapters/defaults/nativeModulePresent.ts`) — the guard that probes
   `TurboModuleRegistry.get` / `NativeModules` **without throwing**. Any default
   adapter wrapping a *bare* RN native lib (clipboard, device-info, NetInfo) must
   gate its `require` through this, or it red-boxes in Expo Go. Exported for
   consumers to wrap their own native deps the same way.

4. **Resolver chain** (`src/adapters/registry.ts`) — `resolve*Adapter()` picks the
   first available: **consumer override → popular default peer → in-memory fallback**.
   `resolveAllAdapters(overrides)` resolves the whole bundle at once. The memory
   fallback means missing peers degrade gracefully (good for Jest/SSR) instead of
   crashing — but it is **not** real persistence/secure storage in production. When a
   resolver falls through to the memory fallback it emits a one-time `__DEV__`
   `console.warn` via `warnMemoryFallback` (deduped; `_resetAdapterWarnings()` exported
   for tests) so the degradation is never silent. Never make it throw — that breaks
   Expo Go support.

5. **Wiring** (`src/providers/OptiCoreProvider.tsx`) — configures the singletons
   **SYNCHRONOUSLY during render** (ref-guarded, idempotent), BEFORE children render —
   NOT in `useEffect` (child effects run before parent effects, so effect-based setup
   let early API calls hit an unconfigured client). It calls `resolveAllAdapters(...)`,
   then `StorageManager.configure(...)`, `configurePlatformAdapters(...)`
   (clipboard/device, in `src/utils/platform.ts`), `CoreSetup.init(config)`, and
   `ConnectivityManager.configure(...)`. Disposal stays in `useEffect` cleanup. Don't
   move setup back into an effect.

6. **Consumer injection** — pass `config.adapters` to `OptiCoreProvider` to swap in
   MMKV, react-native-keychain, a Jest double, etc. Any omitted adapter falls back
   to the default chain. See `MIGRATION_v1.1.md` for the canonical example.

### Supporting pieces

- **`bin/install-peers.mjs`** (CLI: `npx opticore-install-peers`) — detects Expo +
  package manager and runs `expo install` (SDK-aligned) for the adapter-backed peers.
  Flags: `--required` (secure-store, async-storage, netinfo, **`@tanstack/react-query`**),
  `--optional` (expo-clipboard, expo-device, expo-application), `--dry-run`. Also accepts
  explicit peer names (`npx opticore-install-peers @tanstack/react-query`), validated against
  `KNOWN_PEERS` (includes the bare-RN variants); named selection overrides the group flags.
  `@tanstack/react-query` is in the `REQUIRED` group (it's a required JS peer, not SDK-coupled —
  `expo install` just picks a compatible version). Does NOT install
  `react`/`react-native`/`expo`/`expo-router` (the app already provides those).
- **`metro.js`** (`withOptiCoreMetroConfig`, exported as `opticore-react-native/metro`)
  — only needed for `file:`/monorepo consumption. Forces `react`/`react-native`/
  `react-dom` to resolve from the **app's** `node_modules` (via `resolveRequest`),
  preventing the duplicate-React "Invalid hook call" crash.

### Rules when adding/modifying native-backed features

- Never `import` a native peer at module top level. Add a `create*Adapter()` factory
  under `src/adapters/defaults/`, gate bare-RN libs through `loadOptionalNativeModule`,
  add it to the relevant `resolve*` chain (with a `warnMemoryFallback(...)` call before
  the memory fallback), and export it from `src/adapters/index.ts`.
- Add new contracts to `interfaces.ts` and the `OptiCoreAdapters` bundle so consumers
  can override them.
- Add the peer to `peerDependencies` + `peerDependenciesMeta` (optional) in
  `package.json`, to the appropriate list in `bin/install-peers.mjs` (and `KNOWN_PEERS`),
  and to the "Optional native peers" table in `README.md`.
- **Exception — `expo-router`:** it is a **required** peer (navigation is first-class),
  not optional, and is NOT adapter-backed. Its only consumer is `src/navigation/` which is
  exposed solely via the `opticore-react-native/navigation` subpath (NOT the main barrel),
  so the main entry never bundles expo-router. Don't re-export navigation from `src/index.ts`.

### Other cross-cutting rules from spec 028

- **ApiClient public API is the enum-based `request({ method: HttpMethod.X, url, data? })`.**
  The `get/post/put/delete/patch` verb methods are **private** by design — don't make them
  public; fix docs to use `request()`. `request()` **fails fast** (throws) if called before
  `configure()`/`CoreSetup.init()`. `ApiClient.isInitialized()` / `CoreSetup.isInitialized()`
  exist for imperative readiness guards.

---

## Constitutional Authority

**CRITICAL**: Before ANY development work, read these foundational documents:

1. **[.specify/memory/constitution.md](.specify/memory/constitution.md)** - Project constitution
2. **[SPECKIT_GUIDE.md](.specify/SPECKIT_GUIDE.md)** - Complete Spec Kit guide (AI & human reference)

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

**📖 Reference**: For detailed Spec Kit setup and usage, see [SPECKIT_GUIDE.md](.specify/SPECKIT_GUIDE.md)

### The Mandatory Workflow Order

```
Constitution → (Specify + Plan + Tasks, one pass) → Approve (ONE gate) → Implement → Verify
```

#### 1. Constitution (Already Exists)

- Read [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Read [SPECKIT_GUIDE.md](.specify/SPECKIT_GUIDE.md) for complete Spec Kit reference
- Understand project principles and constraints
- Verify your proposed change aligns with constitutional principles

#### 2. Specify + Plan + Tasks — Generate ALL THREE in one pass (REQUIRED for ALL changes)

Generate all three artifacts together. Do NOT pause between them — the user reviews the
complete set at the single gate in step 3.

- **spec.md** — `.specify/specs/[NNN]-[feature-name]/spec.md` (template: [spec-template.md](.specify/templates/spec-template.md))
  WHAT to build: user scenarios, requirements, success criteria.
- **plan.md** — `.specify/specs/[NNN]-[feature-name]/plan.md` (template: [plan-template.md](.specify/templates/plan-template.md))
  HOW to build: technical approach, architecture, file structure, test strategy, migration plan.
- **tasks.md** — `.specify/specs/[NNN]-[feature-name]/tasks.md` (template: [tasks-template.md](.specify/templates/tasks-template.md))
  Actionable checklist grouped into phases; each task < 30 minutes.
- Use `/speckit.clarify` to resolve ambiguities before presenting.

#### 3. ONE Approval Gate (REQUIRED)

- Present the complete set (spec + plan + tasks) to the user **together**.
- **WAIT for a single approval before writing ANY code.**
- Do NOT proceed to implementation without explicit approval.

#### 4. Implement (Code Execution)

- Follow Test-Driven Development (TDD): tests FIRST, then implementation.
- Work tasks in order, phase by phase.
- **After finishing each task/phase, mark it `[x]` in `tasks.md` FIRST — before starting the next task.** Never batch-mark at the end.
- Adhere to all code standards and quality gates; update documentation as you go.

#### 5. Verify (Quality Gates)

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
- Use next sequential number (last is `031-*`, so the next new spec is `032-`)

**Step 2: Create Directory**

```bash
mkdir -p .specify/specs/027-feature-name
```

**Step 3: Create spec.md**

```bash
cp .specify/templates/spec-template.md .specify/specs/027-feature-name/spec.md
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

**Step 6: Immediately create plan.md and tasks.md (same pass — do NOT wait for approval)**

- Generate `plan.md` (template: plan-template.md) and `tasks.md` (template: tasks-template.md) for the same spec, right away.
- All three files exist before the user reviews anything.

**Step 7: Submit the COMPLETE set for Review (ONE gate)**

- Present spec + plan + tasks to the user **together**.
- **WAIT for a single approval.**
- Do NOT write code until the set is approved.

### Creating Plan and Tasks

**In the same pass as the spec (before the single approval gate)**, create plan and tasks:

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

**Three outcomes — pick by what should happen in the UI, not by a Flutter-style
"render vs non-render" split.** React Error Boundaries catch ONLY synchronous
errors thrown during render; they do NOT catch event handlers, async/promises, or
timers. So the model below maps to how RN actually intercepts errors:

| Outcome | Mechanism | Type |
|---------|-----------|------|
| **Replace the screen** (render-path crash) | thrown → `OptiCoreErrorBoundary` → fallback | `RenderError` (thrown) |
| **Notify** (toast/banner, screen stays) | catch site updates state → re-render of the host | `NonRenderError` as a **payload**, not thrown |
| **Silent** (log / retry only) | `Logger` / `Result<T, E>` | `NonRenderError` as payload, or none |

```typescript
import { RenderError, NonRenderError } from 'opticore-react-native/error';
import { Logger } from 'opticore-react-native';

// (1) Replace the screen — throw a RenderError; the boundary shows a fallback.
function renderProfile(user: User | null) {
  if (!user) {
    throw new RenderError('Failed to load user profile', undefined, {
      userMessage: 'Unable to load your profile. Please try again.',
    });
  }
  // ...render
}

// (2)/(3) Background/async failure — DO NOT throw NonRenderError (a boundary can't
// catch async/event errors). Construct it as a descriptor and log it; read its
// fields to decide whether to surface feedback. Showing a toast = a state update.
try {
  await trackAnalytics('page_view');
} catch (cause) {
  const err = new NonRenderError('Analytics tracking failed', {
    isSilent: true,
    metadata: { page: 'home' },
    cause: cause instanceof Error ? cause : undefined,
  });
  Logger.getInstance().error('analytics failed', err);
  if (!err.isSilent) toast.error(err.metadata.userMessage as string);
}

// Recoverable/expected operations: prefer Result<T, E> over throwing at all.
```

> **Anti-pattern:** `throw new NonRenderError(...)`. The async/event errors it
> describes never reach an Error Boundary, so the throw is silently lost. Log it
> or return `Result<T, E>` instead. (Deprecated; boundary `NON_RENDER` handling
> is removed in 3.0.)

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
npm run test:coverage
open coverage/lcov-report/index.html
```

**Untested code is NOT allowed in production.**

---

## Testing Requirements

### Test File Organization

Tests are **NOT co-located with source**. They live in a top-level `test/` tree
that mirrors `src/`, and Jest only looks there:

```
test/                      # jest.config.js: roots: ['<rootDir>/test']
├── setup.ts               # setupFilesAfterEnv (global mocks, RN env)
├── __mocks__/             # manual module mocks (native peers, etc.)
├── helpers/               # shared test utilities
├── integration/           # cross-module integration tests
├── utils/  state/  hooks/  infrastructure/  ...   # mirror of src/ folders
└── index.test.ts
```

- Preset: **`jest-expo`** (see `jest.config.js`). Test match:
  `**/test/**/*.(test|spec).(ts|tsx|js)`.
- When adding a source file under `src/foo/`, add its test under `test/foo/`
  (not next to the source). Adapters/native peers are mocked in `test/__mocks__`,
  which is also why the memory-fallback adapters matter for the suite.

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
npm run test:coverage

# Run a SINGLE test file or pattern
npm test -- test/utils/string.test.ts
npm test -- -t "capitalize"          # by test name

# Lint code (flat config: eslint.config.mjs)
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code (Prettier) / check only
npm run format
npm run format:check

# Type-test the public API surface (tsd)
npm run test:types

# Build package (clean dist + tsc -p tsconfig.build.json)
npm run build

# Run all quality gates: type-check + lint + format:check + test
npm run validate
```

> Note: `npm run verify` referenced in some older sections does not exist — use
> `npm run validate`. There is no `npm run dev`; `npm start` runs `tsc --watch`.

### Spec Kit Commands

**📖 Full Reference**: See [SPECKIT_GUIDE.md](.specify/SPECKIT_GUIDE.md) for complete Spec Kit documentation

#### Helper Scripts (Available)

```bash
# List all specifications with status
./.specify/scripts/list-specs.sh
./.specify/scripts/list-specs.sh --detailed

# Create new specification (auto-numbered)
./.specify/scripts/create-spec.sh feature-name

# Validate specification completeness
./.specify/scripts/validate-spec.sh .specify/specs/NNN-feature/spec.md

# Run all quality gates
./.specify/scripts/check-quality.sh
```

#### Slash Commands (Optional)

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

**Note**: Slash commands are optional. Helper scripts + Claude assistance provide full functionality.

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
cp .specify/templates/plan-template.md .specify/specs/027-phone-formatting/plan.md
cp .specify/templates/tasks-template.md .specify/specs/027-phone-formatting/tasks.md

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
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
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

// NOTE: Navigation is deliberately NOT re-exported here (it imports expo-router).
// It is exposed only via the `opticore-react-native/navigation` subpath. See spec 028.

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

- ✅ `OptiCoreProvider` (Unified provider)
- ✅ `ConfigContext` (Configuration hook)

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
- [ ] Create spec.md + plan.md + tasks.md together (one pass)
- [ ] Get ONE user approval on the complete set
- [ ] Implement in order; mark each task `[x]` in tasks.md before starting the next
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

- **[SPECKIT_GUIDE.md](.specify/SPECKIT_GUIDE.md)** - Complete Spec Kit guide (framework-agnostic, works with ANY project)
- [.specify/memory/constitution.md](.specify/memory/constitution.md) - Project constitution
- [.specify/templates/spec-template.md](.specify/templates/spec-template.md) - Spec template
- [.specify/templates/plan-template.md](.specify/templates/plan-template.md) - Plan template
- [.specify/templates/tasks-template.md](.specify/templates/tasks-template.md) - Tasks template
- [.specify/scripts/](.specify/scripts/) - Helper scripts (create-spec.sh, validate-spec.sh, check-quality.sh, list-specs.sh)

### Agent Workflows

- **[`.agent/workflows/spec_implementation_flow.md`](.agent/workflows/spec_implementation_flow.md)** - Per-session init, implementation loop, phase commits, finalization
- **[`.agent/workflows/spec_git_alignment.md`](.agent/workflows/spec_git_alignment.md)** - Branch setup, phase sync, commit & push cadence
- **[`.agent/workflows/critical_workflow_enforcement.md`](.agent/workflows/critical_workflow_enforcement.md)** - Enforcement rules and anti-patterns

### Existing Specifications

Browse `.specify/specs/` for examples of completed specs:

- `001-npm-package-setup/` - Package initialization
- `002-infrastructure-layer/` - Network, storage, logging
- `003-state-management-core/` - Zustand + React Query
- `004-error-classification/` - Error handling system
- `005-navigation-utilities/` - Navigation helpers
- `006-custom-hooks/` - React hooks
- `007-utility-functions/` - Pure utility functions
- `008-core-providers/` - React providers (Legacy)
- `009-types/` - TypeScript definitions
- `010-configuration-interface/` - Config interfaces
- `011-testing/` - Testing setup
- `012-documentation-examples/` - Docs and examples
- `013-architecture-gaps-resolution/` - Architecture improvements
- `014-react19-test-stabilization/` - React 19 test fixes
- `015-form-infrastructure/` - Form state & validation
- `016-offline-sync-manager/` - Offline sync (Legacy)
- `017-theme-infrastructure/` - Theming engine
- `018-unified-configuration-provider/` - OptiCoreProvider & Config
- `019-offline-sync-rework/` - Robust offline sync engine
- `020-logger-transport-system/` - Pluggable logging
- `021-api-client-extensibility/` - Interceptors & Auth Strategies
- `022-forms-i18n/` - Form validation i18n messages
- `023-error-system-enhancements/` - Extensible ErrorClassifier, Result<T,E> improvements
- `024-hooks-configurability/` - Hooks fixes and configurability
- `025-infrastructure-hardening/` - Infrastructure stability fixes
- `026-test-stabilization/` - Test suite stabilization
- `027-lint-cleanup/` - Lint cleanup
- `028-consumer-integration-fixes/` - expo-router decoupling (subpath), enum-based ApiClient docs, synchronous provider init + `request()` init guard, optional `typescript` peer, adapter memory-fallback dev warnings (shipped in 1.2.0)
- `029-core-hardening-v2.5.0/` - core-hardening round 2 (log redaction, offline data-loss fixes, server-wins default, concurrency/race guards)
- `030-transient-retry-handling/` - `ApiError.isRetryable`/`retryAfterMs`, `Retry-After`-aware retry policy, `RequestConfig` contract fix
- `031-error-system-rn-alignment/` - boundary converges to fallback (no infinite loop), `NonRenderError` repositioned as descriptor/log payload (throwing deprecated → 3.0), three-outcome RN error docs (2.7.0)

### Technology Stack

Peer baseline is **Expo SDK 54**. The dev/test toolchain is pinned to SDK 54
(react `19.1.0`, react-native `~0.81.0`, expo `54.0.32`, expo-router `~6.0.0`)
so the library is built and tested against the SDK consumers actually run.
Note: Expo Go runs only the *latest* SDK — an SDK-54 app opens in a dev build,
not necessarily in the store Expo Go if it has moved to a newer SDK.

- **Required peers** (consumer-provided): `react >=19.0.0`, `react-native >=0.78.0`,
  `expo >=54.0.0`, `expo-router >=4.0.0`, **`@tanstack/react-query >=5.0.0`** — all use open
  `>=` ranges so an SDK-aligned RN+Expo app satisfies them without `--legacy-peer-deps`
  (verified by simulated install).
  React Query became a **required peer in v2.0.0** (was a bundled dependency); consumers install
  it themselves (`expo install @tanstack/react-query`). Keeping it a peer avoids duplicate copies
  and lets the app pin the version. `withOptiCoreMetroConfig` treats it (and `@tanstack/query-core`)
  as a forced singleton for `file:`/monorepo setups.
  `expo-router` is required because navigation (`useRouteHelper`) is a first-class,
  heavily-used feature — every consumer is expected to use it. Consumers install it via their
  normal Expo setup (`expo install expo-router`). Note: navigation still lives ONLY at the
  `opticore-react-native/navigation` subpath, so the main entry's bundle never pulls expo-router
  unless that subpath is imported (the issue-① build-break fix is structural and preserved).
- **`typescript`** (`>=5`) is an **optional** peer. OptiCore ships its own `.d.ts` (133 files);
  a TS consumer's own compiler reads them for full types. Optional only affects npm's
  install-time check — it never affects typed-coding — and avoids `--legacy-peer-deps` for
  JS-only apps or TS-version mismatches.
- **Optional native peers** (auto-detected via adapters, not bundled):
  `expo-secure-store`, `@react-native-async-storage/async-storage`,
  `@react-native-community/netinfo`, `react-native-device-info`,
  `@react-native-clipboard/clipboard` (install via `npx opticore-install-peers`)
- **Optional UI peers** (only for the Tailwind preset at `opticore-react-native/tailwind`):
  `nativewind >=4`, `tailwindcss >=3.4` — marked optional in `peerDependenciesMeta`.
- **Bundled deps**: Zustand ^5 (state — React Query is now a peer, see above), Axios ^1.13
  (network), Zod ^3 + React Hook Form ^7 + @hookform/resolvers (forms), date-fns ^4, immer ^10
- **Testing**: Jest ^29 with the **`jest-expo`** preset + React Native Testing Library;
  `tsd` for public-API type tests

---

**Last Updated**: 2026-06-25
**Version**: 2.7.0
**Maintained By**: Mahmoud El Shenawy

**For questions or clarifications, always refer to:**

1. **[SPECKIT_GUIDE.md](.specify/SPECKIT_GUIDE.md)** - Complete Spec Kit reference
2. **[constitution.md](.specify/memory/constitution.md)** - Project constitution
