---
description: 'Tasks for Spec 001: NPM Package Setup & Foundation'
---

# Tasks: NPM Package Setup

**Input**: Plan from [.specify/specs/001-npm-package-setup/plan.md](./plan.md)
**Prerequisites**: plan.md (completed)

## Phase 1: Package Initialization

**Purpose**: Create package identity and dependency structure

- [x] T001 Initialize `package.json` with name, version, and scripts <!-- id: 0 -->
- [x] T002 [P] Install `react-native`, `expo`, `react` as peer dependencies <!-- id: 1 -->
- [x] T003 [P] Install `typescript`, `@types/react`, `@types/react-native` as dev dependencies <!-- id: 2 -->

## Phase 2: TypeScript Configuration

**Purpose**: Enforce strict type safety from the start

- [x] T004 Create `tsconfig.json` with `strict: true` and path aliases <!-- id: 3 -->
- [x] T005 Verify `tsc --noEmit` runs without errors <!-- id: 4 -->

## Phase 3: Code Quality Tools

**Purpose**: Ensure consistent code style and prohibit `any` types

- [x] T006 [P] Create `eslint.config.js` with no-explicit-any rules (ESLint 9) <!-- id: 5 -->
- [x] T007 [P] Create `.prettierrc` with project formatting rules <!-- id: 6 -->
- [x] T008 Verify `npm run lint` and `npm run format:check` scripts <!-- id: 7 -->

## Phase 4: Testing Setup

**Purpose**: Configure test runner for TDD

- [x] T009 Create `jest.config.js` with coverage thresholds (80%) <!-- id: 8 -->
- [x] T010 Create test file `test/index.test.ts` <!-- id: 9 -->
- [x] T011 Verify `npm test` passes <!-- id: 10 -->

## Phase 5: Main Entry Point

**Purpose**: Create the library entry point and directory structure

- [x] T012 Create `src/index.ts` with VERSION constant export <!-- id: 11 -->
- [x] T013 Verify imports work in test file <!-- id: 12 -->

## Phase 6: Documentation & Distribution

**Purpose**: Prepare for public consumption

- [x] T014 [P] Create `README.md` with installation instructions <!-- id: 13 -->
- [x] T015 [P] Create `LICENSE` (MIT) <!-- id: 14 -->
- [x] T016 [P] Create `.npmignore` to exclude development files <!-- id: 15 -->

## Phase 7: Validation

**Purpose**: Final verification before commit

- [x] T017 Run full validation suite (type-check, lint, format, test) <!-- id: 16 -->
- [x] T018 Build verification completed <!-- id: 17 -->
