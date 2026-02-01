# Feature Specification: NPM Package Setup & Foundation

**Feature Branch**: `001-npm-package-setup`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Initialize opticore-react-native as a standalone npm package with proper TypeScript, build configuration, and dependency management"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Installs Package in Expo Project (Priority: P1)

A React Native developer wants to use opticore-react-native in their existing Expo project to leverage core infrastructure utilities without building them from scratch.

**Why this priority**: This is the fundamental use case - if developers can't install and import the package, nothing else matters. This validates the entire package distribution model.

**Independent Test**: Can be fully tested by creating a new Expo project, running `npm install opticore-react-native`, importing a placeholder utility, and verifying it works without errors.

**Acceptance Scenarios**:

1. **Given** a new Expo SDK 54+ project, **When** developer runs `npm install opticore-react-native`, **Then** package installs successfully with all peer dependencies resolved
2. **Given** package is installed, **When** developer imports from the main entry point `import { VERSION } from 'opticore-react-native'`, **Then** import resolves without TypeScript or runtime errors
3. **Given** package is installed, **When** developer runs TypeScript type checking, **Then** all types are correctly resolved and no type errors occur

---

### User Story 2 - Developer Uses Subpath Exports (Priority: P2)

A developer wants to import specific utilities from subpaths (e.g., `opticore-react-native/utils/string`) to enable tree-shaking and reduce bundle size.

**Why this priority**: Tree-shaking is critical for keeping bundle sizes small in production apps. This ensures developers only bundle what they use.

**Independent Test**: Can be tested by importing from a subpath like `import { capitalize } from 'opticore-react-native/utils/string'` and verifying bundle only includes that specific utility.

**Acceptance Scenarios**:

1. **Given** package is installed, **When** developer imports from subpath `opticore-react-native/utils/string`, **Then** import resolves correctly with TypeScript types
2. **Given** multiple subpath imports, **When** production build is created, **Then** bundle analyzer shows only imported utilities are included (tree-shaking works)
3. **Given** invalid subpath import, **When** developer tries to import, **Then** TypeScript shows clear error indicating valid subpaths

---

### User Story 3 - Developer Contributes to Package Development (Priority: P3)

A developer wants to contribute to opticore-react-native by cloning the repository, making changes, running tests, and ensuring code quality passes.

**Why this priority**: Open-source contribution workflow is important for long-term maintenance but not critical for initial MVP release.

**Independent Test**: Can be tested by cloning repository, running `npm install`, `npm test`, `npm run lint`, and `npm run build` successfully.

**Acceptance Scenarios**:

1. **Given** repository is cloned, **When** developer runs `npm install`, **Then** all dependencies install without errors and lock file is consistent
2. **Given** development environment is ready, **When** developer runs `npm test`, **Then** all tests pass (even if placeholder tests initially)
3. **Given** code changes are made, **When** developer runs `npm run lint` and `npm run format`, **Then** ESLint and Prettier execute successfully with clear error messages if issues exist
4. **Given** code is ready for release, **When** developer runs `npm run build`, **Then** TypeScript compiles successfully with zero errors in strict mode

---

### User Story 4 - Package Publishes to NPM Registry (Priority: P2)

A maintainer wants to publish a new version of opticore-react-native to npm so developers can install it via `npm install`.

**Why this priority**: Required for distribution but can be manual initially. Automated CI/CD can come later.

**Independent Test**: Can be tested by running `npm publish` (or `npm publish --dry-run`) and verifying package metadata, files, and exports are correct.

**Acceptance Scenarios**:

1. **Given** package version is updated, **When** maintainer runs `npm publish --dry-run`, **Then** package tarball contains only necessary files (src, dist, package.json, README, LICENSE)
2. **Given** package is published, **When** developer searches on npmjs.com, **Then** package appears with correct metadata (name, description, keywords, repository link)
3. **Given** package is published, **When** developer views package on npm, **Then** README displays correctly with installation instructions

---

### Edge Cases

- What happens when a developer installs the package in a React Native project without Expo (bare workflow)?
- What happens when TypeScript version in consuming project doesn't match the package's TypeScript version?
- What happens when peer dependencies (React Native, Expo) are incompatible versions?
- What happens when a developer tries to import from a non-existent subpath?
- What happens when the package is used in a monorepo with hoisting issues?
- What happens when npm cache is corrupted during installation?
- What happens when a developer accidentally imports internal utilities prefixed with underscore?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Package MUST be publishable to npm registry as `opticore-react-native`
- **FR-002**: Package MUST support installation via `npm install opticore-react-native` in any Expo SDK 54+ project
- **FR-003**: Package MUST export a main entry point from `src/index.ts` with at minimum a `VERSION` constant
- **FR-004**: Package MUST support subpath exports (e.g., `opticore-react-native/utils/string`) with full TypeScript type definitions
- **FR-005**: Package MUST compile TypeScript in strict mode with zero errors
- **FR-006**: Package MUST include proper peer dependencies for React Native (0.81.5), Expo (~54.0.31), React (18.3.1), and TypeScript (~5.9.2)
- **FR-007**: Package MUST use npm as package manager (not yarn or pnpm) with committed lock file
- **FR-008**: Package MUST include NPM scripts for: start, test, lint, format, type-check, build, clear
- **FR-009**: Package MUST exclude unnecessary files from published tarball (.specify/, .claude/, tests/, etc.)
- **FR-010**: Package MUST include tsconfig.json with strict mode enabled and path aliases configured
- **FR-011**: Package MUST include ESLint configuration with TypeScript rules enforcing no-explicit-any
- **FR-012**: Package MUST include Prettier configuration for consistent code formatting
- **FR-013**: Package MUST include basic README.md with installation instructions and quick start example
- **FR-014**: Package MUST include LICENSE file (MIT recommended for open source)
- **FR-015**: Package MUST include .gitignore excluding node_modules, dist, build artifacts, .specify/memory/, .claude/
- **FR-016**: Package MUST be configured as a library (not an executable app) with proper exports field in package.json
- **FR-017**: Package MUST support tree-shaking through ES modules with "type": "module" or proper export conditions

### Key Entities _(include if feature involves data)_

- **Package Metadata**: Name (opticore-react-native), version (1.0.0), description, keywords (react-native, expo, infrastructure, utilities), author, license, repository URL
- **Exports Configuration**: Main entry point, subpath patterns, TypeScript type definitions, export conditions (import, require, types)
- **TypeScript Configuration**: Compiler options (strict mode, ES2020, JSX, path aliases), include/exclude patterns, declaration files
- **Build Artifacts**: Compiled JavaScript files, TypeScript declaration files (.d.ts), source maps (for debugging)
- **Dependencies**: Peer dependencies (React Native, Expo, React, TypeScript), dev dependencies (testing, linting, building tools)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developer can install package in new Expo project and import main entry point in under 2 minutes without errors
- **SC-002**: Package size (tarball) is under 50KB for Phase 1 (foundation only, no features yet)
- **SC-003**: TypeScript compilation completes with zero errors in strict mode
- **SC-004**: ESLint runs with zero errors and zero warnings on initial codebase
- **SC-005**: Package publishes to npm successfully with `npm publish --dry-run` showing correct file list (no .specify/, .claude/, tests/)
- **SC-006**: README.md includes at minimum: installation command, basic import example, link to full documentation
- **SC-007**: All peer dependencies resolve correctly without version conflicts in Expo SDK 54 project
- **SC-008**: Running `npm install` in cloned repository completes in under 3 minutes on standard internet connection
- **SC-009**: Package metadata on npm shows correct description, keywords, and GitHub repository link
- **SC-010**: TypeScript types are exported correctly allowing full IntelliSense in consuming projects
