# Implementation Plan: Infrastructure Layer

**Branch**: `002-infrastructure-layer` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-infrastructure-layer/spec.md`

## Summary

The Infrastructure Layer provides foundational services that every React Native app needs: network communication (ApiClient with Axios), data persistence (StorageManager with SecureStore and AsyncStorage), logging (Logger), connectivity monitoring (ConnectivityManager), and lifecycle tracking (LifecycleManager). This phase creates reusable, type-safe infrastructure utilities that consuming apps can configure and use without implementing boilerplate code.

**Technical Approach**: Implement singleton patterns for managers, use TypeScript interfaces for configuration, provide Axios interceptors for cross-cutting concerns (auth, logging, errors), wrap native storage APIs with unified interface, and create event-based lifecycle/connectivity managers.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict mode)
**Primary Dependencies**:

- Axios ^1.13.2 (HTTP client)
- @react-native-async-storage/async-storage ^2.2.0 (local storage)
- expo-secure-store ^15.0.8 (encrypted storage)
- @react-native-community/netinfo ^11.3.0 (connectivity monitoring)
- React Native 0.81.5 (AppState for lifecycle)

**Storage**: SecureStore (iOS Keychain, Android Keystore), AsyncStorage (SQLite)
**Testing**: Jest ^29.7.0, React Native Testing Library ^12.4.3
**Target Platform**: iOS 15+, Android 13+, Expo SDK 54+
**Project Type**: npm package (library)
**Performance Goals**:

- API requests: < 50ms overhead for interceptors
- Storage operations: < 100ms for reads/writes
- Connectivity detection: < 1s to detect state change
  **Constraints**:
- Zero dependencies on app-specific logic
- Must work on both iOS and Android
- SecureStore not available on web (fallback to AsyncStorage)
  **Scale/Scope**:
- 5 infrastructure modules
- ~15 TypeScript files
- 80%+ test coverage required

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ **Pure Infrastructure**: Only reusable utilities, no app-specific features
- ✅ **TypeScript Strict Mode**: All types enforced, no `any` types
- ✅ **SOLID Principles**:
  - Single Responsibility: Each manager has one purpose
  - Open/Closed: Configurable via interfaces, extensible without modification
  - Dependency Inversion: Depend on IStorage/ILogger interfaces, not implementations
- ✅ **Zero Bugs**: Comprehensive error handling, SafeCall pattern for all async operations
- ✅ **Test-Driven**: 80%+ coverage for all utilities
- ✅ **Spec-First**: This plan based on approved spec.md

## Project Structure

### Documentation (this feature)

```text
.specify/specs/002-infrastructure-layer/
├── spec.md              # User stories and requirements ✅
├── plan.md              # This file
└── tasks.md             # Implementation tasks (generated next)
```

### Source Code (repository root)

```text
src/
└── infrastructure/
    ├── network/
    │   ├── ApiClient.ts              # Axios wrapper with interceptors
    │   ├── NetworkConfig.ts          # Configuration interface
    │   ├── ApiResponse.ts            # Response type definitions
    │   ├── ApiError.ts               # Error class for API failures
    │   ├── interceptors/
    │   │   ├── AuthInterceptor.ts    # Auto token injection
    │   │   ├── LoggingInterceptor.ts # Request/response logging
    │   │   └── ErrorInterceptor.ts   # Centralized error handling
    │   └── index.ts                  # Public exports
    │
    ├── storage/
    │   ├── interfaces/
    │   │   └── IStorage.ts           # Storage interface
    │   ├── SecureStorage.ts          # SecureStore wrapper
    │   ├── LocalStorage.ts           # AsyncStorage wrapper
    │   ├── StorageManager.ts         # Unified storage interface
    │   ├── StorageKeys.ts            # Centralized key constants
    │   └── index.ts                  # Public exports
    │
    ├── logger/
    │   ├── interfaces/
    │   │   └── ILogger.ts            # Logger interface
    │   ├── Logger.ts                 # Singleton logger implementation
    │   ├── LogLevel.ts               # Log level enum
    │   ├── LoggerConfig.ts           # Configuration interface
    │   └── index.ts                  # Public exports
    │
    ├── connectivity/
    │   ├── ConnectivityManager.ts    # Network status monitor
    │   ├── ConnectivityListener.ts   # Listener type definitions
    │   └── index.ts                  # Public exports
    │
    ├── lifecycle/
    │   ├── LifecycleManager.ts       # App state monitor
    │   ├── LifecycleObserver.ts      # Observer type definitions
    │   └── index.ts                  # Public exports
    │
    └── index.ts                       # Infrastructure public exports

tests/
└── infrastructure/
    ├── network/
    │   ├── ApiClient.test.ts
    │   ├── interceptors.test.ts
    │   └── ApiError.test.ts
    ├── storage/
    │   ├── SecureStorage.test.ts
    │   ├── LocalStorage.test.ts
    │   └── StorageManager.test.ts
    ├── logger/
    │   └── Logger.test.ts
    ├── connectivity/
    │   └── ConnectivityManager.test.ts
    └── lifecycle/
        └── LifecycleManager.test.ts
```

**Structure Decision**: Single project structure (npm package). Infrastructure modules organized by domain (network, storage, logger, connectivity, lifecycle). Each module has dedicated directory with interfaces, implementations, and index exports following SOLID principles.

## Implementation Phases

### Phase 0: Research & Design

**Goal**: Understand Axios interceptor patterns, Expo storage APIs, and React Native lifecycle

**Deliverables**:

- Research Axios interceptor execution order and configuration
- Review expo-secure-store API and platform limitations (web fallback)
- Study @react-native-community/netinfo reliability
- Design IStorage interface for unified storage access
- Design error classification for network vs storage vs lifecycle errors

**Success Criteria**: Clear understanding of API contracts, platform limitations documented

### Phase 1: Network Module (Priority: P1 - Critical)

**Goal**: Implement ApiClient with interceptors for auth, logging, and error handling

**Components**:

1. **ApiClient.ts**: Axios wrapper with configurable baseURL, timeout, headers
2. **NetworkConfig.ts**: TypeScript interface for configuration (baseURL, timeout, headers, auth callback)
3. **ApiResponse.ts**: Generic type `ApiResponse<T>` with data, status, headers
4. **ApiError.ts**: Custom error class with statusCode, message, url, responseData
5. **Interceptors**:
   - AuthInterceptor: Inject Authorization header, handle 401 auto-refresh
   - LoggingInterceptor: Log request method/url, response status/time
   - ErrorInterceptor: Convert Axios errors to ApiError, classify error types

**Key Decisions**:

- Use singleton pattern for ApiClient (one instance per app)
- Support multiple interceptor registration
- Provide typed methods: `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`, `patch<T>()`
- Handle concurrent 401 errors (only one token refresh at a time)

**Success Criteria**:

- Developer can make typed API request in 5 lines
- Auth token auto-injected in all requests
- 401 triggers refresh callback and retry
- All network errors classified correctly

### Phase 2: Storage Module (Priority: P1 - Critical)

**Goal**: Implement unified storage interface with secure and local storage

**Components**:

1. **IStorage.ts**: Interface with `get<T>()`, `set<T>()`, `remove()`, `clear()` methods
2. **SecureStorage.ts**: Implements IStorage using expo-secure-store
3. **LocalStorage.ts**: Implements IStorage using AsyncStorage with JSON serialization
4. **StorageManager.ts**: Facade providing both secure and local storage
5. **StorageKeys.ts**: Constants object (AUTH_TOKEN, USER_PREFS, THEME, etc.)

**Key Decisions**:

- Generic types for type-safe storage: `get<User>('user')`
- Automatic JSON serialization/deserialization in LocalStorage
- Fallback to AsyncStorage on web (SecureStore unavailable)
- Validate data before storing (no undefined, null, or circular references)
- Error handling for quota exceeded, permission denied

**Success Criteria**:

- Developer can store/retrieve typed data with type safety
- SecureStorage encrypts data (verified on device)
- LocalStorage operations complete < 100ms
- Storage survives app restart

### Phase 3: Logger Module (Priority: P2 - Important)

**Goal**: Implement structured, colored logger with configurable levels

**Components**:

1. **ILogger.ts**: Interface with `debug()`, `info()`, `warn()`, `error()` methods
2. **Logger.ts**: Singleton implementation with console output
3. **LogLevel.ts**: Enum (DEBUG = 0, INFO = 1, WARN = 2, ERROR = 3)
4. **LoggerConfig.ts**: Configuration interface (level, enabled, timestamp)

**Key Decisions**:

- Use ANSI color codes for terminal colors (gray, blue, yellow, red)
- Filter logs by level (e.g., production = ERROR only)
- Include timestamps in ISO format
- Handle circular references with JSON.stringify replacer
- Support logging objects, arrays, errors with stack traces

**Success Criteria**:

- Logs appear colored in development console
- Production config suppresses debug/info logs
- Error logs include stack traces
- No performance impact on production builds

### Phase 4: Connectivity Module (Priority: P2 - Important)

**Goal**: Monitor network connectivity with event listeners

**Components**:

1. **ConnectivityManager.ts**: NetInfo wrapper with listener registration
2. **ConnectivityListener.ts**: Type definitions for callbacks

**Key Decisions**:

- Use @react-native-community/netinfo for accurate detection
- Provide synchronous `isConnected` check and async listener registration
- Support multiple listener registration
- Auto-cleanup listeners on manager disposal
- Detect connection type (wifi, cellular, none)

**Success Criteria**:

- Detects offline state within 1 second
- Triggers callbacks on online/offline transitions
- Multiple listeners work concurrently
- No memory leaks from listeners

### Phase 5: Lifecycle Module (Priority: P3 - Nice to Have)

**Goal**: Monitor React Native AppState changes

**Components**:

1. **LifecycleManager.ts**: AppState wrapper with listener registration
2. **LifecycleObserver.ts**: Type definitions for callbacks

**Key Decisions**:

- Use React Native AppState API
- Map AppState to simpler events: onActive, onInactive, onBackground
- Support multiple observer registration
- Provide cleanup method for observers

**Success Criteria**:

- Triggers callbacks within 100ms of app state change
- Multiple observers work concurrently
- No memory leaks from observers

### Phase 6: Integration & Testing

**Goal**: Comprehensive testing and integration

**Test Coverage**:

- Unit tests for all modules (80%+ coverage)
- Integration tests for ApiClient + Storage (save token, use in request)
- Mock implementations for testing (MockStorage, MockLogger)
- Platform-specific tests (iOS Keychain, Android Keystore)
- Error scenario tests (network timeout, storage quota, etc.)

**Success Criteria**:

- All tests passing
- 80%+ code coverage
- Zero TypeScript errors
- No ESLint warnings

### Phase 7: Documentation & Examples

**Goal**: Comprehensive developer documentation

**Deliverables**:

- JSDoc comments for all public APIs
- README with quick start examples
- Example: Configure ApiClient and make request
- Example: Store and retrieve auth token
- Example: Setup logger for development vs production

**Success Criteria**:

- Developer can integrate infrastructure in < 10 minutes
- All public APIs documented
- Examples work without modification

## Complexity Tracking

No constitution violations. All infrastructure modules follow pure utility pattern with zero app-specific dependencies.

## File Inventory

### Implementation Files (15 files)

1. `src/infrastructure/network/ApiClient.ts`
2. `src/infrastructure/network/NetworkConfig.ts`
3. `src/infrastructure/network/ApiResponse.ts`
4. `src/infrastructure/network/ApiError.ts`
5. `src/infrastructure/network/interceptors/AuthInterceptor.ts`
6. `src/infrastructure/network/interceptors/LoggingInterceptor.ts`
7. `src/infrastructure/network/interceptors/ErrorInterceptor.ts`
8. `src/infrastructure/storage/interfaces/IStorage.ts`
9. `src/infrastructure/storage/SecureStorage.ts`
10. `src/infrastructure/storage/LocalStorage.ts`
11. `src/infrastructure/storage/StorageManager.ts`
12. `src/infrastructure/storage/StorageKeys.ts`
13. `src/infrastructure/logger/interfaces/ILogger.ts`
14. `src/infrastructure/logger/Logger.ts`
15. `src/infrastructure/logger/LogLevel.ts`
16. `src/infrastructure/logger/LoggerConfig.ts`
17. `src/infrastructure/connectivity/ConnectivityManager.ts`
18. `src/infrastructure/connectivity/ConnectivityListener.ts`
19. `src/infrastructure/lifecycle/LifecycleManager.ts`
20. `src/infrastructure/lifecycle/LifecycleObserver.ts`

### Test Files (8 files)

1. `tests/infrastructure/network/ApiClient.test.ts`
2. `tests/infrastructure/network/interceptors.test.ts`
3. `tests/infrastructure/network/ApiError.test.ts`
4. `tests/infrastructure/storage/SecureStorage.test.ts`
5. `tests/infrastructure/storage/LocalStorage.test.ts`
6. `tests/infrastructure/storage/StorageManager.test.ts`
7. `tests/infrastructure/logger/Logger.test.ts`
8. `tests/infrastructure/connectivity/ConnectivityManager.test.ts`
9. `tests/infrastructure/lifecycle/LifecycleManager.test.ts`

### Index Files (6 files)

1. `src/infrastructure/network/index.ts`
2. `src/infrastructure/storage/index.ts`
3. `src/infrastructure/logger/index.ts`
4. `src/infrastructure/connectivity/index.ts`
5. `src/infrastructure/lifecycle/index.ts`
6. `src/infrastructure/index.ts`

**Total**: 34 files

## Dependencies

### Phase Dependencies

- Phase 0 (Research): No dependencies
- Phase 1 (Network): Depends on Phase 0
- Phase 2 (Storage): Depends on Phase 0, parallel to Phase 1
- Phase 3 (Logger): Depends on Phase 0, parallel to Phases 1-2
- Phase 4 (Connectivity): Depends on Phase 0, parallel to Phases 1-3
- Phase 5 (Lifecycle): Depends on Phase 0, parallel to Phases 1-4
- Phase 6 (Testing): Depends on Phases 1-5
- Phase 7 (Docs): Depends on Phase 6

### Critical Path

Phase 0 → Phase 1 (Network) → Phase 2 (Storage) → Phase 6 (Testing) → Phase 7 (Docs)

Logger, Connectivity, and Lifecycle can be implemented in parallel with Network/Storage as they have no interdependencies.

## Risk Mitigation

**Risk**: SecureStore unavailable on web platform
**Mitigation**: Fallback to AsyncStorage with warning log

**Risk**: Multiple concurrent 401 errors cause multiple token refreshes
**Mitigation**: Implement token refresh queue with single refresh at a time

**Risk**: AsyncStorage 64MB quota exceeded
**Mitigation**: Validate data size before storage, throw quota error with clear message

**Risk**: NetInfo false positives (connected but no internet)
**Mitigation**: Document limitation, provide manual connectivity check method

**Risk**: Circular references in logged objects crash app
**Mitigation**: Use JSON.stringify with replacer to detect and handle circular refs
