# Implementation Plan: NPM Package Setup & Foundation

**Branch**: `001-npm-package-setup` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)

## Summary

Initialize opticore-react-native as a professional, standalone npm package with proper TypeScript strict mode configuration, build tooling, peer dependency management, and subpath exports. This foundation ensures the package can be installed in any Expo SDK 54+ project and provides tree-shakable utilities through modern ES modules.

**Primary Requirement**: Create npm package infrastructure that supports installation via `npm install opticore-react-native` with full TypeScript type safety and subpath imports.

**Technical Approach**: Use standard npm package structure with TypeScript strict mode, ESLint + Prettier for code quality, Jest for testing, and proper package.json exports configuration for tree-shaking support.

## Technical Context

**Language/Version**: TypeScript 5.9.2+ (strict mode enabled)
**Primary Dependencies**:
- React Native 0.81.5 (peer dependency)
- Expo ~54.0.31 (peer dependency)
- React 18.3.1 (peer dependency)
- TypeScript ~5.9.2 (peer dependency)

**Development Dependencies**:
- ESLint ^8.57.0 (linting)
- Prettier ^3.2.5 (formatting)
- Jest ^29.7.0 (testing)
- @types/react, @types/react-native (type definitions)

**Storage**: Not applicable (this phase only creates package structure)
**Testing**: Jest with React Native preset
**Target Platform**: npm registry, installable in Expo SDK 54+ projects (iOS, Android, Web)
**Project Type**: npm library package (NOT an application)
**Performance Goals**:
- Package tarball size < 50KB for foundation phase
- npm install completes in < 3 minutes on standard connection
- TypeScript compilation < 10 seconds for foundation files

**Constraints**:
- MUST maintain strict TypeScript mode with zero errors
- MUST support tree-shaking via ES modules
- MUST NOT bundle application-specific code (auth, UI components, themes)
- MUST be compatible with both npm and Expo managed workflow

**Scale/Scope**: Foundation phase - core package infrastructure only (no feature code yet)

## Constitution Check

**Reference**: [../../memory/constitution.md](../../memory/constitution.md)

### Compliance Verification

✅ **I. Pure Infrastructure Library**
- Phase 1 creates only package structure, no application code
- No auth, UI, themes, or features included

✅ **II. Specification-First Development**
- Spec created: spec.md
- Plan follows spec (this document)
- Tasks will be created after plan approval

✅ **III. TypeScript Strict Mode**
- tsconfig.json will enforce `strict: true`
- ESLint configured to prevent `any` types

✅ **IV. Test-Driven Development**
- Jest configured for unit tests
- Placeholder tests included to verify setup

✅ **V. Zero Bugs Philosophy**
- ESLint catches potential errors at compile time
- TypeScript strict mode prevents runtime errors

✅ **VI. SOLID Principles**
- Package structure follows Single Responsibility
- Configuration files separated by concern

✅ **VII. Extension Pattern Alternative**
- Package structure supports utility function exports
- Main entry point + subpath exports configured

**GATE STATUS**: ✅ PASSED - All constitutional principles satisfied for Phase 1

## Project Structure

### Documentation (this feature)

```text
.specify/specs/001-npm-package-setup/
├── spec.md         # Feature specification
├── plan.md         # This file (implementation plan)
└── tasks.md        # To be created next
```

### Source Code (repository root)

```text
opticore-rn/
├── src/
│   └── index.ts                            # Main entry point (exports VERSION constant)
│
├── package.json                            # Package metadata, scripts, dependencies
├── tsconfig.json                           # TypeScript configuration (strict mode)
├── .eslintrc.js                            # ESLint configuration
├── .prettierrc                             # Prettier configuration
├── jest.config.js                          # Jest configuration
│
├── .gitignore                              # Git ignore rules
├── .npmignore                              # npm publish ignore rules
│
├── README.md                               # Installation and quick start
├── LICENSE                                 # MIT License
│
└── .git/                                   # Git repository (already initialized)
```

**Structure Decision**:

This is a **library package** (not an application), so we use a minimal foundation structure:

1. **src/** - Single directory for all source code
   - Initially contains only `index.ts` with VERSION constant
   - Future phases will add subdirectories: infrastructure/, state/, hooks/, utils/, etc.

2. **No app/, no features/** - This is infrastructure only
   - Applications that install this package will have their own app structure
   - We provide utilities, not features

3. **Configuration at root** - All build/quality tools configured at package root
   - TypeScript, ESLint, Prettier, Jest
   - Standard npm package convention

4. **No dist/ folder yet** - Build artifacts excluded from git
   - Will be generated during npm publish
   - Added to .gitignore

## Implementation Phases

### Phase 0: Repository Verification ✅ (DONE)

**Status**: Already completed
- ✅ Git repository initialized
- ✅ Remote configured: git@github-personal:dev-mahmoud-elshenawy/opticore-react-native.git
- ✅ .gitignore created and configured

### Phase 1: Package Initialization

**Goal**: Create package.json with correct metadata and scripts

**Files to Create**:
1. `package.json`

**Key Configuration**:
- Package name: `opticore-react-native`
- Version: `1.0.0`
- Main entry: `src/index.ts`
- Peer dependencies: React Native, Expo, React, TypeScript
- Dev dependencies: ESLint, Prettier, Jest, TypeScript
- Scripts: test, lint, format, type-check, validate

**Success Criteria**:
- ✅ package.json passes `npm install` without errors
- ✅ All peer dependencies match Expo SDK 54 requirements
- ✅ Scripts are executable

### Phase 2: TypeScript Configuration

**Goal**: Setup strict TypeScript with zero-tolerance for type errors

**Files to Create**:
1. `tsconfig.json`

**Key Settings**:
- `strict: true` - All strict checks enabled
- `noImplicitAny: true` - No any types without explicit declaration
- `noUnusedLocals: true` - No unused variables
- `noImplicitReturns: true` - All code paths must return
- Path aliases configured for future use

**Success Criteria**:
- ✅ `tsc --noEmit` runs without errors
- ✅ Strict mode enabled and enforced
- ✅ Path aliases configured for future use

### Phase 3: Code Quality Tools

**Goal**: Setup ESLint and Prettier for consistent code quality

**Files to Create**:
1. `.eslintrc.js`
2. `.prettierrc`

**ESLint Rules**:
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/explicit-function-return-type`: warn
- `no-console`: warn (use Logger instead)

**Prettier Settings**:
- Semi-colons: yes
- Single quotes: yes
- Print width: 100
- Tab width: 2

**Success Criteria**:
- ✅ `npm run lint` passes with zero errors
- ✅ `npm run format:check` passes
- ✅ No `any` types allowed without justification

### Phase 4: Testing Setup

**Goal**: Configure Jest for unit testing

**Files to Create**:
1. `jest.config.js`
2. `src/index.test.ts` (placeholder test)

**Jest Configuration**:
- Preset: `react-native`
- Coverage threshold: 80% (branches, functions, lines, statements)
- Test environment: node

**Success Criteria**:
- ✅ `npm test` runs successfully
- ✅ Coverage threshold configured (80%)
- ✅ Test passes for VERSION constant

### Phase 5: Main Entry Point

**Goal**: Create minimal src/index.ts with VERSION export

**Files to Create**:
1. `src/index.ts`

**Exports**:
- `VERSION` constant (string)
- `PACKAGE_NAME` constant (string)
- JSDoc comments for documentation

**Success Criteria**:
- ✅ File compiles with TypeScript strict mode
- ✅ Exports are accessible
- ✅ JSDoc comments present

### Phase 6: Documentation

**Goal**: Create README and LICENSE

**Files to Create**:
1. `README.md`
2. `LICENSE`

**README Contents**:
- Installation instructions
- Requirements (versions)
- Quick start example
- Features (current + planned)
- Development commands
- License and repository links

**LICENSE**:
- MIT License
- Copyright 2026 Mahmoud Elshenawy

**Success Criteria**:
- ✅ README includes installation instructions
- ✅ README includes quick start example
- ✅ LICENSE is MIT and properly formatted

### Phase 7: NPM Ignore Configuration

**Goal**: Exclude unnecessary files from npm publish

**Files to Create**:
1. `.npmignore`

**Exclusions**:
- Source control files (.git, .gitignore)
- Spec Kit (.specify/)
- Claude Agent (.claude/)
- Tests (*.test.ts, __tests__/, coverage/)
- Development configs (eslint, prettier, jest, tsconfig)
- Temporary docs (plan.md, EXPO_APP_GUIDE.md, .history/)

**Success Criteria**:
- ✅ `npm pack --dry-run` shows only necessary files
- ✅ No test files, config files, or .specify/ in package
- ✅ Package size < 50KB

### Phase 8: Validation

**Goal**: Verify everything works together

**Validation Steps**:
1. Run `npm install` - verify no errors
2. Run `npm run type-check` - verify TypeScript compiles
3. Run `npm run lint` - verify ESLint passes
4. Run `npm run format:check` - verify Prettier formatting
5. Run `npm test` - verify tests pass
6. Run `npm run validate` - verify all checks pass
7. Run `npm pack --dry-run` - verify package contents

**Success Criteria**:
- ✅ All npm scripts run without errors
- ✅ `npm run validate` passes completely
- ✅ Package tarball contains correct files only
- ✅ Package size < 50KB

## File Inventory

**Total Files to Create: 10**

1. ✅ `.gitignore` (already created)
2. ⏳ `package.json`
3. ⏳ `tsconfig.json`
4. ⏳ `.eslintrc.js`
5. ⏳ `.prettierrc`
6. ⏳ `jest.config.js`
7. ⏳ `src/index.ts`
8. ⏳ `src/index.test.ts`
9. ⏳ `README.md`
10. ⏳ `LICENSE`
11. ⏳ `.npmignore`

## Complexity Tracking

> Phase 1 has zero constitutional violations - no complexity justification needed.

All choices follow standard npm package best practices and constitutional principles.

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Peer dependency version conflicts | High | Use exact Expo SDK 54 compatible versions, test with fresh Expo install |
| TypeScript strict mode too restrictive | Medium | Start with strict mode from Phase 1, easier than migrating later |
| Package size exceeds 50KB | Low | Only foundation files in Phase 1, no dependencies yet |
| npm publish fails | Medium | Use `npm pack --dry-run` to verify before actual publish |

## Next Steps

After this plan is approved:
1. Create tasks breakdown in `tasks.md` (same folder)
2. Get user approval for tasks
3. Execute implementation
4. Commit with message: "feat: initialize npm package foundation with TypeScript strict mode"
5. Push to GitHub
