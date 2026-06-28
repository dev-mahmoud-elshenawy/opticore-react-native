# Contributing to OptiCore React Native

Thank you for your interest in contributing! OptiCore is a pure infrastructure library — contributions that strengthen the foundation are always welcome.

---

## Getting Started

```bash
git clone https://github.com/dev-mahmoud-elshenawy/opticore-react-native.git
cd opticore-react-native
npm install
npm test
```

All 604 tests should pass before you begin.

---

## Development Workflow

### Branch Naming

```
feat/NNN-short-description    # new feature
fix/NNN-short-description     # bug fix
docs/short-description        # documentation only
refactor/short-description    # refactoring, no behavior change
```

### Quality Gates (ALL must pass before PR)

```bash
npm run type-check   # 0 TypeScript errors
npm test             # all tests passing, 80%+ coverage
npm run lint         # 0 errors, 0 warnings
npm run format       # code formatted
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(hooks): add useInterval hook
fix(api): handle network timeout correctly
docs(readme): update quick start example
test(storage): add clearAll edge case tests
```

### Pull Request Process

1. Fork the repo and create your branch from `develop`
2. Pass all quality gates locally
3. Write or update tests for your change
4. Open a PR against `develop` — not `main`
5. Fill out the PR description with what changed and why

---

## Code Standards

### TypeScript

- Strict mode — zero `any` types without explicit justification
- Explicit types on all public API signatures
- Generics for reusable utilities

### Testing

- Write tests first (TDD) — red → green → refactor
- Co-locate test files: `capitalize.ts` → `capitalize.test.ts`
- Minimum 80% coverage on new code; aim for 90%+ on critical paths
- No real network calls in tests — use mocks

### No `console.log`

Use `Logger.getInstance()` instead. `console.*` in source code is a lint error.

### Naming

| Type             | Convention       | Example            |
| ---------------- | ---------------- | ------------------ |
| Files (classes)  | PascalCase       | `ApiClient.ts`     |
| Files (utils)    | camelCase        | `formatPhone.ts`   |
| Functions        | camelCase        | `getUserProfile()` |
| Types/Interfaces | PascalCase       | `AsyncState<T>`    |
| Constants        | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`  |

---

## What to Contribute

### Welcome

- Bug fixes with reproduction tests
- New utility functions (string, number, array, date, object)
- New infrastructure hooks (`useDebounce`, `useThrottle`, etc.)
- Infrastructure improvements (retry logic, error handling, etc.)
- Documentation fixes and improvements
- Test coverage improvements

### Out of Scope

OptiCore is a **pure infrastructure library** — these will not be accepted:

- UI components (buttons, inputs, cards)
- Theme or styling configurations
- Authentication flows or screens
- App-specific feature modules
- i18n setup or translation files
- Navigation screen definitions

**Decision rule**: "Can this be used in ANY React Native app without modification?" If yes → welcome. If no → out of scope.

---

## Project Structure

```
src/
├── infrastructure/     # ApiClient, Logger, StorageManager, ConnectivityManager
├── state/              # AsyncState, createBaseStore, createCrudStore
├── error/              # RenderError, NonRenderError, ErrorClassifier, Result<T,E>
├── hooks/              # useDebounce, useThrottle, useAsync, useConnectivity, ...
├── forms/              # useFormState, masks, useFieldValidation, validators
├── offline/            # OfflineSyncManager, useOfflineSync, SyncEngine
├── theme/              # ThemeManager, useTheme, ThemeProvider
├── navigation/         # useRouteHelper
├── providers/          # OptiCoreProvider, ConfigContext
├── utils/              # string, number, array, date, object, format, platform
├── types/              # Shared TypeScript definitions
└── index.ts            # Main entry point
```

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues) with:

- OptiCore version
- React Native / Expo version
- Minimal reproduction steps
- Expected vs actual behavior
- Error output (if any)

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
