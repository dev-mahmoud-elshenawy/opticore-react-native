# Release Notes Template

Use this template when creating release notes for new versions.

## Version X.Y.Z - YYYY-MM-DD

### 🎉 New Features

- **Feature Name**: Brief description of the feature
  - Example: "Added `useDebounce` hook for debouncing values"
  - Impact: Who benefits and how

### 🔧 Improvements

- **Module/Area**: What was improved
  - Example: "ApiClient: Improved error handling for network timeouts"
  - Benefit: Performance boost, better UX, etc.

### 🐛 Bug Fixes

- **Issue Description**: What was fixed
  - Fix: How it was resolved
  - Affected versions: X.Y.Z

### ⚠️ Breaking Changes

- **Change Description**: What changed
  - Migration: How to update existing code
  - Example:

    ```typescript
    // Before
    oldAPI();

    // After
    newAPI();
    ```

### 📦 Dependencies

- Updated [dependency-name] from X.Y to X.Z
- Added [new-dependency] for [purpose]
- Removed [old-dependency] (no longer needed)

###Technical Details

- **Performance**: Improvements to speed, memory usage, etc.
- **Testing**: New tests added, coverage improvements
- **Documentation**: New docs, updated guides

### 🙏 Contributors

Thank you to all contributors:

- @username1 - Feature X
- @username2 - Bug fix Y

---

## Example: v1.1.0 - 2026-02-15

### 🎉 New Features

- **Offline Mode**: Added offline support with queue syncing
  - API calls are queued when offline and synced when online
  - `ConnectivityManager` detects network changes automatically
- **Biometric Auth**: New `useBiometric` hook
  - Face ID / Touch ID / fingerprint support
  - Fallback to PIN/password

### 🔧 Improvements

- **ApiClient**: Request deduplication for concurrent identical requests
  - Prevents multiple requests to same endpoint
  - 30% reduction in API calls during app startup

- **StorageManager**: Batch operations performance
  - `multiSet` now 2x faster
  - Auto-batching for rapid sequential writes

### 🐛 Bug Fixes

- **Logger**: Fixed memory leak in error aggregation (#45)
  - Error logs are now properly cleaned up
  - Affected: v1.0.0 - v1.0.3
- **useAsyncState**: Fixed race condition with rapid executes (#52)
  - Only most recent execute completes
  - Previous executes are cancelled

### ⚠️ Breaking Changes

- **CoreSetup**: `apiTimeout` now in seconds instead of milliseconds

  ```typescript
  // Before (v1.0)
  CoreSetup.initialize({ apiTimeout: 10000 }); // ms

  // After (v1.1)
  CoreSetup.initialize({ apiTimeout: 10 }); // seconds
  ```

### 📦 Dependencies

- Updated @tanstack/react-query from 5.0.0 to 5.17.0
- Updated zustand from 5.0.0 to 5.0.1
- Added @react-native-community/netinfo for connectivity

### 📚 Documentation

- Added [Offline Mode Guide](./docs/OfflineMode.md)
- Updated [Migration Guide](./docs/Migration.md) with v1.1 changes
- New examples for biometric authentication

### 🙏 Contributors

- @contributor1 - Offline mode implementation
- @contributor2 - Biometric auth
- @contributor3 - Performance improvements

---

## Checklist for Release

Before releasing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version bumped in `package.json`
- [ ] `CHANGELOG.md` updated
- [ ] Release notes created (this template)
- [ ] Git tag created (`git tag v1.1.0`)
- [ ] GitHub release published
- [ ] npm package published (`npm publish`)
- [ ] Documentation updated
- [ ] Migration guide updated (if breaking changes)

---

**Format**: Follow [Keep a Changelog](https://keepachangelog.com/)  
**Versioning**: Follow [Semantic Versioning](https://semver.org/)
