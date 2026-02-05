# Contributing to opticore-react-native

Thank you for considering contributing to opticore! This document outlines the process for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Speckit Workflow](#speckit-workflow)

## Code of Conduct

This project adheres to a code of conduct. By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- React Native development environment
- Git

### Setup

1. **Fork and clone**:
```bash
git clone https://github.com/YOUR_USERNAME/opticore-react-native.git
cd opticore-react-native
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run tests**:
```bash
npm test
```

4. **Build**:
```bash
npm run build
```

## Development Workflow

This project follows **Speckit**, a specification-first development process.

### Speckit Process

1. **Find or create a specification** in `.specify/specs/`
2. **Create feature branch**: `git checkout -b feature/XXX-spec-name`
3. **Review tasks** in `.specify/specs/XXX-spec-name/tasks.md`
4. **Implement** following the spec
5. **Test** (80%+ coverage required)
6. **Submit PR** linking to the spec

See [speckit_guide.md](./speckit_guide.md) for full details.

### Git Workflow

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/012-your-feature

# Make changes, commit incrementally
git add .
git commit -m "feat(module): description"

# Push and create PR
git push -u origin feature/012-your-feature
```

## Coding Standards

### TypeScript

- **Strict mode**: All code must pass TypeScript strict mode
- **No any**: Avoid `any`, use `unknown` or proper typing
- **Explicit returns**: Always type function returns
- **Interfaces over types**: Prefer `interface` for object shapes

```typescript
// ✅ Good
export interface UserData {
  id: string;
  name: string;
}

export function getUser(id: string): Promise<UserData> {
  // ...
}

// ❌ Bad
export type UserData = {  // Use interface
  id: string;
  name: string;
};

export function getUser(id) {  // Missing types
  // ...
}
```

### Code Style

We use **ESLint** and **Prettier**:

```bash
npm run lint          # Check linting
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
```

**Rules**:
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas
- No semicolons (except where required)

### File Organization

```
src/
├── infrastructure/    # Core services
├── state/            # State management
├── error/            # Error handling
├── providers/        # React providers
├── hooks/            # Custom hooks
├── utils/            # Pure functions
├── config/           # Configuration
└── types/            # Type definitions
```

- **One export per file**: Each file should have clear responsibility
- **Index files**: Use for clean public API (`index.ts`)
- **Naming**:
  - Folders: lowercase with hyphens (`my-module/`)
  - Files: PascalCase for classes (`ApiClient.ts`), camelCase for utilities (`formatDate.ts`)
  - Tests: Same name with `.test.ts` suffix

## Testing Requirements

### Coverage Target

**80%+ coverage required** across all metrics:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### Writing Tests

```typescript
import { MockApiClient } from '@test/__mocks__';
import { renderWithProviders } from '@test/helpers';

describe('MyComponent', () => {
  it('should fetch and display users', async () => {
    const mockApi = new MockApiClient();
    mockApi.mockGet('/users', { data: [{ id: 1, name: 'John' }] });
    
    const { getByText } = renderWithProviders(<UserList />);
    
    await waitFor(() => {
      expect(getByText('John')).toBeTruthy();
    });
  });
});
```

### Test Guidelines

1. **Test behavior, not implementation**
2. **Use mocks for external dependencies**
3. **Write descriptive test names**: "should X when Y"
4. **Test happy path + edge cases**
5. **Clean up after tests**: Reset mocks in `afterEach`

See [docs/Testing.md](./docs/Testing.md) for full guide.

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Coverage ≥ 80% (`npm test -- --coverage`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

### PR Template

```markdown
## Description
Brief description of changes

## Specification
Link to spec: `.specify/specs/XXX-spec-name/`

## Changes
- Added X
- Fixed Y
- Updated Z

## Testing
- Unit tests added/updated
- Integration tests added
- Manual testing performed

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(module): add new feature
fix(module): fix bug
docs: update documentation
test: add tests
refactor: refactor code
chore: update dependencies
```

**Examples**:
```bash
git commit -m "feat(hooks): add useDebounce hook"
git commit -m "fix(api): handle 401 errors correctly"
git commit -m "docs: update Architecture.md"
git commit -m "test(utils): increase string utils coverage"
```

### Review Process

1. **Automated checks** run on PR
2. **Code review** by maintainers
3. **Feedback** addressed
4. **Approval** and merge to `develop`
5. **Release** from `develop` to `main`

## Speckit Workflow

### Specification Structure

```
.specify/specs/XXX-spec-name/
├── spec.md          # Specification document
├── tasks.md         # Task breakdown
└── plan.md          # Implementation plan (optional)
```

### Creating a Spec

1. Create new spec directory
2. Write `spec.md` with user stories and requirements
3. Break down into tasks in `tasks.md`
4. Get review and approval
5. Implement following the spec

### Task Format

```markdown
## Phase 1: Setup

- [ ] T001 Configure module
- [ ] T002 Add dependencies
- [x] T003 Write tests (completed tasks marked with x)

## Phase 2: Implementation

- [ ] T004 Implement feature X
- [ ] T005 Implement feature Y
```

## Documentation

### JSDoc Comments

All public APIs must have JSDoc:

```typescript
/**
 * Fetches user data from the API
 * 
 * @param userId - The ID of the user to fetch
 * @returns Promise resolving to user data
 * @throws {ApiError} If the request fails
 * 
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export async function fetchUser(userId: string): Promise<User> {
  // ...
}
```

### README Updates

Update relevant documentation when adding features:
- README.md - if public API changes
- docs/API.md - for new APIs
- docs/ARCHITECTURE.md - for architectural changes

## Questions?

- 📖 Read the [docs](./docs)
- 💬 Open a [Discussion](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/discussions)
- 🐛 File an [Issue](https://github.com/dev-mahmoud-elshenawy/opticore-react-native/issues)

---

**Thank you for contributing!** 🎉
