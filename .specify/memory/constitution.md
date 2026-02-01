# OptiCore React Native Constitution

**Package Name**: `opticore-react-native`
**Version**: 1.0.0
**Ratified**: 2026-02-01
**Last Amended**: 2026-02-01

---

## Core Principles

### I. Pure Infrastructure Library (NON-NEGOTIABLE)

**OptiCore React Native is a CORE INFRASTRUCTURE package, NOT an application template**

- Every module MUST be reusable across ANY React Native/Expo project
- ZERO dependencies on application-specific logic:
  - ❌ NO auth features
  - ❌ NO UI components (Button, Input, etc.)
  - ❌ NO theme configurations
  - ❌ NO i18n setup
  - ❌ NO navigation setup
  - ❌ NO feature modules
- ✅ ONLY infrastructure: Network, Storage, State, Logging, Error Handling, Utilities
- Apps install via `npm install opticore-react-native` and configure as needed
- Mirrors the architecture of the Flutter `opticore` package

### II. Specification-First Development (MANDATORY)

**ALL code changes MUST follow the Spec Kit workflow - NO EXCEPTIONS**

**Workflow Order**:

1. **Constitution** → Project principles (this document)
2. **Specify** (`.specify/memory/*.md`) → Define WHAT to build (user scenarios, requirements)
3. **Plan** → Create technical implementation plan
4. **Tasks** → Break into actionable items
5. **Implement** → Execute code

**Rules**:

- ❌ NO CODE WITHOUT APPROVED SPEC
- ✅ ALL changes start with specification
- ✅ User reviews and approves specs BEFORE implementation
- ✅ Constitution is updated for any architectural changes
- ✅ Use `/speckit.clarify` to resolve ambiguities
- ✅ Use `/speckit.analyze` to verify consistency
- ✅ Use `/speckit.checklist` to validate quality

### III. TypeScript Strict Mode (NON-NEGOTIABLE)

**Zero tolerance for type errors - strict TypeScript throughout**

- `strict: true` in tsconfig.json enforced at ALL times
- ❌ NO `any` types without explicit justification in code comments
- ✅ ALL public APIs MUST have complete type definitions
- ✅ Type inference preferred over explicit typing where possible
- ✅ Runtime validation with Zod for all external data
- ✅ Generic types for reusable utilities
- ✅ Discriminated unions for state machines

### IV. Test-Driven Development (MANDATORY)

**80%+ test coverage required for all utilities**

- ✅ Unit tests for ALL utility functions
- ✅ Integration tests for state management
- ✅ Tests written BEFORE implementation (Red-Green-Refactor)
- ✅ Mock implementations provided for consuming apps
- ✅ Test files co-located with source: `*.test.ts` or `__tests__/`
- ❌ NO merging code with failing tests
- ❌ NO untested public APIs

### V. Zero Bugs Philosophy

**Professional-grade quality with comprehensive error handling**

- ✅ ALL errors MUST be classified (RenderError vs NonRenderError)
- ✅ Comprehensive error handling at EVERY layer
- ✅ Safe execution patterns (SafeCall utility)
- ✅ Defensive programming throughout
- ✅ Production error logging and monitoring
- ✅ Graceful degradation for non-critical failures
- ❌ NO silent failures
- ❌ NO unhandled promise rejections

### VI. SOLID Principles (MANDATORY)

**Architecture follows all SOLID principles**

- **S - Single Responsibility**: Each module has ONE reason to change
- **O - Open/Closed**: Extensible without modification
- **L - Liskov Substitution**: Base classes fully interchangeable
- **I - Interface Segregation**: Small, focused interfaces
- **D - Dependency Inversion**: Depend on abstractions, not concretions

### VII. Extension Pattern Alternative

**JavaScript doesn't support Dart-style extensions - use utility functions**

- ✅ Export pure utility functions (NO prototype modifications)
- ✅ Organize by domain: `utils/string/`, `utils/number/`, etc.
- ✅ Import pattern: `import { capitalize } from 'opticore-react-native/utils/string'`
- ❌ NO modification of native prototypes (`String.prototype`, etc.)
- ✅ Mirror Flutter opticore extension functionality

---

## Technology Constraints

### Required Stack (Latest Stable - Feb 2026)

- **React Native**: 0.81.5 (Expo SDK 54)
- **TypeScript**: 5.9.2+ (strict mode)
- **State**: Zustand ^5.0.10 + React Query ^5.90.18
- **Network**: Axios ^1.13.2
- **Storage**: AsyncStorage ^2.2.0 + SecureStore ^15.0.8
- **Validation**: Zod ^3.22.4
- **Forms**: React Hook Form ^7.50.1
- **Testing**: Jest ^29.7.0 + React Native Testing Library ^12.4.3

### Dependency Policy

- ✅ Use latest stable versions ONLY
- ✅ Peer dependencies for React Native/Expo
- ✅ Lock file (`package-lock.json`) MUST be committed
- ✅ Monthly dependency security audits
- ❌ NO deprecated packages
- ❌ NO alpha/beta versions in production

---

## Package Structure Standards

### Directory Organization (MANDATORY)

```
src/
├── infrastructure/    # Network, Storage, Logger (folders with internal structure)
├── state/            # AsyncState, BaseStore, StoreFactory (folders with internal structure)
├── error/            # Error classification system (folder)
├── navigation/       # Route helpers, guards (files or folder if complex)
├── hooks/            # Custom React hooks (flat files: useDebounce.ts, useAsync.ts)
├── utils/            # Pure utility functions (flat files: string.ts, number.ts, date.ts)
├── providers/        # React providers (files or folders)
├── types/            # TypeScript definitions (flat files)
└── config/           # Configuration interfaces (flat files)
```

### File vs Folder Organization Guidelines

**Decision Rule**:

> "Does this module have multiple related files with different responsibilities?"
>
> - **YES** → Use folder (e.g., `infrastructure/ApiClient/`)
> - **NO** → Use file (e.g., `utils/string.ts`)

**Use Folders When**:

- ✅ Module has **internal structure** with private implementation files
- ✅ Module has **multiple file types** (types, config, implementation, tests)
- ✅ Module needs to **hide internal complexity** from public API
- ✅ Example: `infrastructure/ApiClient/{index.ts, ApiClient.ts, types.ts, interceptors.ts}`

**Use Files When**:

- ✅ Related functions grouped by **category** (utilities)
- ✅ All exports are **public API** with no private helpers
- ✅ **Simple modules** with single responsibility
- ✅ Example: `utils/string.ts` (all string functions), `hooks/useDebounce.ts`

**Utils Organization** (React Native Best Practice):

```
✅ CORRECT (Flat structure):
utils/
├── string.ts          // All string utilities
├── string.test.ts
├── number.ts          // All number utilities
├── number.test.ts
└── index.ts           // Re-exports

❌ WRONG (Over-fragmented):
utils/
├── string/            // Don't create folder per category
│   ├── capitalize.ts
│   ├── truncate.ts
│   └── ...
└── number/
    └── ...
```

**Why Flat Files for Utils**:

- Follows React Native community standards (react-native-reanimated, zustand)
- Easier navigation and discoverability
- Better tree-shaking with modern bundlers
- Simpler import paths: `import { capitalize } from 'opticore-react-native/utils/string'`
- Mirrors how Dart/Flutter organizes utilities in single files

### Export Policy

- ✅ Main export: `src/index.ts`
- ✅ Subpath exports: `opticore-react-native/utils/string`
- ✅ All public APIs exported from index files
- ✅ Internal utilities prefixed with underscore (`_internal.ts`)

---

## Development Workflow

### Specification Process (MANDATORY)

1. Create spec in `.specify/memory/[feature-name].md`
2. Follow spec template structure
3. Run `/speckit.clarify` if needed
4. Submit for user review and approval
5. **WAIT for approval before proceeding**

### Implementation Process

1. Write tests first (TDD)
2. Implement to pass tests
3. Refactor for quality
4. Update documentation
5. Run full test suite
6. Lint and format code
7. Commit with conventional commits

### Quality Gates (NON-NEGOTIABLE)

- ✅ TypeScript compilation: ZERO errors
- ✅ All tests passing (80%+ coverage)
- ✅ ESLint: No warnings or errors
- ✅ Prettier: Code formatted
- ✅ No `console.log` in production code (use Logger)
- ✅ Documentation updated
- ✅ Specification matches implementation

---

## What This Package IS

✅ Pure infrastructure utilities
✅ Reusable across ANY React Native project
✅ Zero app-specific dependencies
✅ Installable via `npm install opticore-react-native`
✅ Configurable by consuming apps
✅ Type-safe with strict TypeScript
✅ Professional-grade with zero bugs
✅ Mirrors Flutter opticore architecture

## What This Package is NOT

❌ NOT a full app template
❌ NOT feature modules (auth, profile)
❌ NOT i18n setup
❌ NOT UI components
❌ NOT theme configuration
❌ NOT navigation setup
❌ NOT form schemas

---

## Code Standards

### Naming Conventions

- **Files**: PascalCase for classes (`ApiClient.ts`), camelCase for utilities (`formatPhone.ts`)
- **Functions**: camelCase, descriptive (`getUserProfile`, `formatPhoneNumber`)
- **Types/Interfaces**: PascalCase (`AsyncState<T>`, `StorageConfig`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_TIMEOUT`)
- **Private members**: Prefix with underscore (`_internalMethod`)

### Documentation Requirements

- ✅ JSDoc comments for ALL public APIs
- ✅ README.md at root with quick start
- ✅ API.md with complete API reference
- ✅ Examples folder with working demos
- ✅ Inline comments for complex logic ONLY
- ❌ NO obvious comments ("increment counter" for `count++`)

### Error Handling Standards

- ✅ ALL async operations wrapped in try/catch
- ✅ Errors classified as RenderError or NonRenderError
- ✅ Meaningful error messages
- ✅ Error logging via Logger
- ❌ NO silent failures
- ❌ NO unhandled promise rejections
- ❌ NO generic error messages ("Error occurred")

---

## Security Requirements (MANDATORY)

1. **Token Storage**: ONLY in SecureStore (encrypted)
2. **Input Validation**: ALL external data validated with Zod
3. **XSS Prevention**: Sanitize all user inputs
4. **HTTPS Only**: Enforce in production
5. **No Secrets in Code**: Use environment variables
6. **Dependency Audits**: Monthly via `npm audit`
7. **No Eval**: Never use `eval()` or `new Function()`

---

## Performance Standards

1. **Bundle Size**: Core package < 100KB gzipped
2. **Tree Shaking**: All utilities MUST be tree-shakable
3. **Lazy Loading**: No eager initialization
4. **Memory Management**: Zero memory leaks
5. **Async Operations**: Non-blocking

---

## Accessibility Standards (WCAG AA)

1. **Screen Reader Support**: All interactive elements labeled
2. **Touch Targets**: Minimum 44x44 pt
3. **Color Contrast**: WCAG AA compliance (4.5:1)
4. **Keyboard Navigation**: Full support
5. **Dynamic Text**: System font scaling support

---

## Governance

### Constitutional Authority

- This constitution **SUPERSEDES** all other development practices
- ALL PRs MUST verify compliance with these principles
- Deviations require explicit justification and approval
- Spec workflow is MANDATORY for all changes

### Amendment Process

1. Propose amendment in `.specify/memory/constitution-amendment.md`
2. Review and discussion
3. User approval required
4. Update version number
5. Add to amendment log below
6. Provide migration guide if needed

### Compliance Verification

Every PR checklist:

- [ ] Specification created and approved
- [ ] Constitution principles followed
- [ ] TypeScript strict mode passing
- [ ] Tests passing (80%+ coverage)
- [ ] Documentation updated
- [ ] Quality gates passed

---

## Amendment Log

| Version | Date       | Amendment            | Reason                 |
| ------- | ---------- | -------------------- | ---------------------- |
| 1.0.0   | 2026-02-01 | Initial constitution | Project initialization |

---

**Version**: 1.0.0
**Ratified**: 2026-02-01
**Last Amended**: 2026-02-01
**Next Review**: 2026-03-01
