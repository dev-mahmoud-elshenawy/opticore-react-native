# Plan: Lint Cleanup (Spec 027)

**Branch**: `feature/027-lint-cleanup`
**Base**: `develop`

---

## Technical Approach

Fix all 116 lint problems in 4 passes, from highest-impact to lowest:

1. **Pass A** — Install missing plugin + fix `src/` `any` types (most impactful: production code)
2. **Pass B** — Fix `src/` unused variables + `Result.ts` eslint-disable warning
3. **Pass C** — Fix `test/` errors (unused vars + suppress intentional console statements)
4. **Pass D** — Fix `examples/` + `scripts/` errors + warnings

After each pass: run `npm run type-check` + `npm test` to confirm nothing broken.

---

## Rule-by-Rule Strategy

### `react-hooks/exhaustive-deps` — 1 error (`src/hooks/useMount.ts`)

Install the missing plugin so the rule is recognized:

```bash
npm install --save-dev eslint-plugin-react-hooks
```

Verify the rule is already configured in `.eslintrc.js`. If not, add it.

### `@typescript-eslint/no-explicit-any` — ~60 errors

**Strategy per location:**

| File                                                         | Context                            | Fix                                              |
| ------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------ |
| `src/utils/object.ts`                                        | Generic deep-clone/merge utilities | Use `unknown` + type assertions at boundaries    |
| `src/utils/array.ts`                                         | Generic groupBy/shuffle            | Use proper generic `T` parameters                |
| `src/utils/number.ts`                                        | Locale formatting                  | Use `unknown` narrowed to `string`               |
| `src/state/StoreFactory.ts`                                  | Zustand store generics             | Use `Record<string, unknown>` or proper generics |
| `src/state/BaseStore.ts`                                     | Store action types                 | Use `Record<string, unknown>`                    |
| `src/infrastructure/network/ApiClient.ts`                    | Request/response data              | Use `unknown` with type assertion                |
| `src/infrastructure/network/AuthStrategy.ts`                 | Token payloads                     | Use `Record<string, unknown>`                    |
| `src/infrastructure/network/Interceptor.ts`                  | Interceptor config                 | Use `unknown`                                    |
| `src/infrastructure/network/interceptors/AuthInterceptor.ts` | Token data                         | Use `Record<string, unknown>`                    |
| `src/infrastructure/logger/LogFormatter.ts`                  | JSON replacer                      | Use `unknown` (already partially typed)          |
| `src/forms/masks/creditCardMask.ts`                          | Mask regex                         | Narrow to `string`                               |
| `src/forms/types.ts`                                         | Form field values                  | Use `unknown` or proper union                    |
| `src/hooks/useAsyncState.ts`                                 | Catch block                        | Use `unknown` with `instanceof` guard            |
| `src/hooks/useKeyboard.ts`                                   | Event handler                      | Use proper `KeyboardEvent` type                  |
| `src/types/react-test-renderer.d.ts`                         | Type declaration shim              | Use `unknown`                                    |
| `examples/state/CompleteExample.ts`                          | Example callbacks                  | Use `unknown` or explicit types                  |
| `examples/theme/ThemeExample.tsx`                            | Theme style values                 | Use proper theme types                           |
| `scripts/perf-test.ts`                                       | Perf measurement                   | Use `unknown`                                    |

**Decision rule**: Prefer `unknown` over `any` in public APIs. Use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` only for genuine escape hatches (e.g. JSON.parse results, third-party interop) with a justification comment.

### `@typescript-eslint/no-unused-vars` — ~12 errors

| File                                               | Variable              | Fix                        |
| -------------------------------------------------- | --------------------- | -------------------------- |
| `src/config/ConfigValidator.ts:38`                 | `_` catch param       | Rename to `_err` or remove |
| `src/infrastructure/network/AuthStrategy.ts:69`    | `e`                   | Prefix `_e` or remove      |
| `examples/offline/OfflineSyncExample.tsx:1`        | `useEffect`           | Remove import              |
| `examples/offline/OfflineSyncExample.tsx:5`        | `ConnectivityManager` | Remove import              |
| `examples/offline/OfflineSyncExample.tsx:48`       | `error`               | Prefix `_error` or remove  |
| `examples/forms/FormExample.tsx:27`                | `form`                | Prefix `_form` or remove   |
| `examples/state/CompleteExample.ts:11,12`          | `isIdle`, `isSuccess` | Remove destructured vars   |
| `examples/state/CompleteExample.ts:102`            | `oldState`            | Prefix `_oldState`         |
| `examples/types/UsageExample.tsx:6`                | `RouteParams`         | Remove unused import       |
| `examples/types/UsageExample.tsx:32`               | `initialState`        | Remove or use              |
| `scripts/perf-test.ts:30`                          | `updateCount`         | Remove                     |
| `test/hooks/useAsyncState.test.ts:34`              | `e`                   | Prefix `_e`                |
| `test/integration/hooksInfrastructure.test.ts:204` | `err`                 | Prefix `_err`              |

### `no-console` — 32 warnings

**Strategy**: `console.log/info` in tests and examples is intentional output (not debug leakage). Suppress with `// eslint-disable-next-line no-console` per occurrence.

**Files:**

- `test/infrastructure/logger/ConsoleTransport.test.ts` — testing console transport, suppress
- `test/performance/infrastructure.performance.test.ts` — perf output, suppress
- `test/__mocks__/infrastructure/logger/MockLogger.ts` — mock logger, suppress
- `examples/**` — demo output, suppress
- `scripts/perf-test.ts` — perf script output, suppress

### `@typescript-eslint/no-namespace` eslint-disable warning — 1 warning

- `src/error/Result.ts:117` — The `// eslint-disable-next-line @typescript-eslint/no-namespace` comment is now unnecessary (no violation at that line). Remove it.

---

## File Structure Changes

None. Lint-only fixes — no new files, no deleted files.

---

## Test Strategy

- Run `npm run type-check` after each pass to catch type regressions
- Run `npm test --no-coverage` after each pass to confirm 604/604 still pass
- Final: `npm run lint` → 0 problems

---

## Migration Plan

No breaking changes. All fixes are internal type annotations, unused variable cleanup, and console suppressions.

---

## Commit Strategy

| Commit  | Content                                              |
| ------- | ---------------------------------------------------- |
| Phase A | Install plugin + fix `src/` `any` types              |
| Phase B | Fix `src/` unused vars + remove stale eslint-disable |
| Phase C | Fix `test/` errors + warnings                        |
| Phase D | Fix `examples/` + `scripts/` errors + warnings       |
| Final   | Verify + update tasks.md                             |
