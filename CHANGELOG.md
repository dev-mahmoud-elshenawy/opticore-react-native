# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation (README, ARCHITECTUREcontrib, MIGRATION)
- Test infrastructure with mocks and helpers

## [1.0.0] - 2026-02-05

### Added
- Initial release of opticore-react-native
- Infrastructure layer (ApiClient, Logger, Storage, Connectivity, Lifecycle)
- State management with Zustand and AsyncState pattern
- Error classification (RenderError vs NonRenderError)
- Core providers (CoreProvider, QueryProvider)
- Configuration interface via CoreSetup
- Custom hooks (useAsyncState, useDebounce, useConnectivity, etc.)
- 40+ utility functions (string, date, array, object, color, number)
- TypeScript type definitions
- React Native 0.78+ and React 19 support
- 83%+ test coverage
- Tree-shakable ES module exports

### Infrastructure
- ApiClient with interceptors for auth, logging, error handling
- StorageManager with AsyncStorage and SecureStore support
- Logger with level-based logging
- ConnectivityManager for network state monitoring
- LifecycleManager for app state tracking

### State Management
- AsyncState pattern for API calls
- BaseStore foundation for Zustand stores
- StateObserver for state change listening
- StoreFactory utilities

### Error Handling
- BaseError abstract class
- RenderError for user-facing errors
- NonRenderError for logging-only errors
- ErrorClassifier utilities
- ApiError for network errors

### Providers
- CoreProvider wrapping all infrastructure
- QueryProvider for React Query configuration

### Hooks
- useAsyncState - Async operation state management
- useDebounce - Debounced values
- useThrottle - Throttled callbacks
- useConnectivity - Network status
- useKeyboard - Keyboard state
- useOrientation - Device orientation
- useAppState - App lifecycle state
- usePrevious - Previous value tracking

### Utilities
- String utils: capitalize, truncate, slugify, etc.
- Date utils: formatDate, isToday, getDaysBetween, etc.
- Array utils: chunk, unique, groupBy, etc.
- Object utils: deepMerge, pick, omit, etc.
- Color utils: hexToRgb, adjustOpacity, etc.
- Number utils: clamp, round, formatCurrency, etc.
- Platform utils: Platform-specific helpers

### Configuration
- CoreSetup for centralized configuration
- ConfigValidator for config validation
- SpecialModes for development modes

### Testing
- Jest configuration with 80%+ coverage thresholds
- MockApiClient for API testing
- MockStorage for storage testing
- MockLogger for log testing
- MockConnectivity for network testing
- MockLifecycle for lifecycle testing
- Test helpers (renderWithProviders, createMockStore, etc.)

### Documentation
- Comprehensive README with quick start
- API documentation
- Architecture guide
- Testing guide
- Configuration guide
- Types documentation
- Migration guide
- Contributing guidelines

[Unreleased]: https://github.com/dev-mahmoud-elshenawy/opticore-react-native/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dev-mahmoud-elshenawy/opticore-react-native/releases/tag/v1.0.0
