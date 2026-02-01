---
description: "Tasks for Spec 001: NPM Package Setup & Foundation"
---

# Tasks: NPM Package Setup

**Input**: Plan from [.specify/specs/001-npm-package-setup/plan.md](./plan.md)
**Prerequisites**: plan.md (completed)

## Phase 1: Package Initialization
**Purpose**: Create package identity and dependency structure

- [ ] T001 Initialize `package.json` with name, version, and scripts <!-- id: 0 -->
- [ ] T002 [P] Install `react-native`, `expo`, `react` as peer dependencies <!-- id: 1 -->
- [ ] T003 [P] Install `typescript`, `@types/react`, `@types/react-native` as dev dependencies <!-- id: 2 -->

## Phase 2: TypeScript Configuration
**Purpose**: Enforce strict type safety from the start

- [ ] T004 Create `tsconfig.json` with `strict: true` and path aliases <!-- id: 3 -->
- [ ] T005 Verify `tsc --noEmit` runs without errors <!-- id: 4 -->

## Phase 3: Code Quality Tools
**Purpose**: Ensure consistent code style and prohibit `any` types

- [ ] T006 [P] Create `.eslintrc.js` with no-explicit-any rules <!-- id: 5 -->
- [ ] T007 [P] Create `.prettierrc` with project formatting rules <!-- id: 6 -->
- [ ] T008 Verify `npm run lint` and `npm run format:check` scripts <!-- id: 7 -->

## Phase 4: Testing Setup
**Purpose**: Configure test runner for TDD

- [ ] T009 Create `jest.config.js` with react-native preset and coverage thresholds <!-- id: 8 -->
- [ ] T010 Create placeholder test `src/index.test.ts` <!-- id: 9 -->
- [ ] T011 Verify `npm test` passes <!-- id: 10 -->

## Phase 5: Main Entry Point
**Purpose**: Create the library entry point and directory structure

- [ ] T012 Create `src/index.ts` with VERSION constant export <!-- id: 11 -->
- [ ] T013 Verify imports work in test file <!-- id: 12 -->

## Phase 6: Documentation & Distribution
**Purpose**: Prepare for public consumption

- [ ] T014 [P] Create `README.md` with installation instructions <!-- id: 13 -->
- [ ] T015 [P] Create `LICENSE` (MIT) <!-- id: 14 -->
- [ ] T016 [P] Create `.npmignore` to exclude development files <!-- id: 15 -->

## Phase 7: Validation
**Purpose**: Final verification before commit

- [ ] T017 Run full validation suite (`npm run validate`) <!-- id: 16 -->
- [ ] T018 Verify package tarball content with `npm pack --dry-run` <!-- id: 17 -->
