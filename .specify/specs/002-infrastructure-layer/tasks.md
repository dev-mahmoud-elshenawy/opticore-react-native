# Tasks: Infrastructure Layer

**Input**: Design documents from `/specs/002-infrastructure-layer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create infrastructure directory structure: `src/infrastructure/{network,storage,logger,connectivity,lifecycle}`
- [ ] T002 [P] Install production dependencies: `npm install axios@^1.13.4 @react-native-async-storage/async-storage@^2.2.0`
- [ ] T003 [P] Install production dependencies: `npm install expo-secure-store@^15.0.8 @react-native-community/netinfo@^11.5.1`
- [ ] T004 [P] Install dev dependencies: `npm install --save-dev @testing-library/react-native@^13.3.3 @testing-library/jest-native@^5.4.3`
- [ ] T005 [P] Configure TypeScript for infrastructure module (ensure strict mode in tsconfig.json)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and interfaces that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create `src/infrastructure/storage/interfaces/IStorage.ts` with generic get/set/remove/clear methods
- [ ] T007 [P] Create `src/infrastructure/logger/interfaces/ILogger.ts` with debug/info/warn/error methods
- [ ] T008 [P] Create `src/infrastructure/logger/LogLevel.ts` enum (DEBUG=0, INFO=1, WARN=2, ERROR=3)
- [ ] T009 [P] Create `src/infrastructure/network/ApiResponse.ts` with generic type definition
- [ ] T010 [P] Create `src/infrastructure/network/ApiError.ts` custom error class
- [ ] T012 [P] Create `src/infrastructure/storage/StorageKeys.ts` constants object

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Makes API Calls with Auto Token Injection (Priority: P1) 🎯 MVP

**Goal**: Implement ApiClient with interceptors for automatic auth, logging, and error handling

**Independent Test**: Configure ApiClient, make GET request, verify token in headers and typed response

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Create `test/infrastructure/network/ApiClient.test.ts` with test cases for:
  - Configure ApiClient with baseURL
  - Make GET request returns typed response
  - Auth token auto-injected in headers
  - 401 triggers token refresh callback
  - Network timeout throws error after configured duration
- [ ] T012 [P] [US1] Create `test/infrastructure/network/interceptors.test.ts` with test cases for:
  - AuthInterceptor injects token
  - LoggingInterceptor logs requests
  - ErrorInterceptor classifies errors

### Implementation for User Story 1

- [ ] T022[P] [US1] Create `src/infrastructure/network/NetworkConfig.ts` interface (baseURL, timeout, headers, onTokenRefresh callback)
- [ ] T022[US1] Create `src/infrastructure/network/ApiClient.ts` singleton class with:
  - Constructor accepts NetworkConfig
  - Axios instance with baseURL and timeout
  - Generic methods: get<T>(), post<T>(), put<T>(), delete<T>(), patch<T>()
  - configure() method to update config
- [ ] T022[US1] Create `src/infrastructure/network/interceptors/AuthInterceptor.ts`:
  - Request interceptor to inject Authorization header from config
  - Response interceptor to catch 401 and trigger onTokenRefresh callback
  - Queue mechanism to prevent multiple concurrent token refreshes
- [ ] T022[P] [US1] Create `src/infrastructure/network/interceptors/LoggingInterceptor.ts`:
  - Request interceptor logs method, URL, headers (if enabled)
  - Response interceptor logs status, duration, response size
  - Use Logger (integration with US3, but can use console.log initially)
- [ ] T022[P] [US1] Create `src/infrastructure/network/interceptors/ErrorInterceptor.ts`:
  - Response error interceptor converts AxiosError to ApiError
  - Extract status code, message, URL, response data
  - Classify error types (network, timeout, API)
- [ ] T022[US1] Register all interceptors in ApiClient constructor
- [ ] T022[US1] Create `src/infrastructure/network/index.ts` exporting ApiClient, NetworkConfig, ApiResponse, ApiError
- [ ] T022[US1] Verify tests pass and 80%+ coverage for network module

**Checkpoint**: At this point, User Story 1 should be fully functional - developer can make typed API calls with auto auth

---

## Phase 4: User Story 2 - Developer Stores Sensitive Data Securely (Priority: P1) 🎯 MVP

**Goal**: Implement StorageManager with unified interface for secure and local storage

**Independent Test**: Save token to SecureStorage, restart app, retrieve successfully

### Tests for User Story 2 ⚠️

- [ ] T022[P] [US2] Create `test/infrastructure/storage/SecureStorage.test.ts` with test cases for:
  - Set and get encrypted data
  - Data persists after mock restart
  - Remove deletes data
  - Clear removes all data
  - Fallback to AsyncStorage on web platform
- [ ] T023[P] [US2] Create `test/infrastructure/storage/LocalStorage.test.ts` with test cases for:
  - Set and get JSON data
  - Type safety with generics
  - Data persists after mock restart
  - Remove deletes data
  - Clear removes all data
- [ ] T024[P] [US2] Create `test/infrastructure/storage/StorageManager.test.ts` with test cases for:
  - Access both secure and local storage
  - clearAll() clears both storages

### Implementation for User Story 2

- [ ] T025[P] [US2] Create `src/infrastructure/storage/SecureStorage.ts` implementing IStorage:
  - get<T>(key): Promise<T | null> using SecureStore.getItemAsync()
  - set<T>(key, value): Promise<void> using SecureStore.setItemAsync()
  - remove(key): Promise<void>
  - clear(): Promise<void> (iterate and remove all keys)
  - JSON serialization for objects
  - Fallback to AsyncStorage on web with console warning
- [ ] T026[P] [US2] Create `src/infrastructure/storage/LocalStorage.ts` implementing IStorage:
  - get<T>(key): Promise<T | null> using AsyncStorage.getItem()
  - set<T>(key, value): Promise<void> using AsyncStorage.setItem()
  - remove(key): Promise<void>
  - clear(): Promise<void> using AsyncStorage.clear()
  - JSON.parse/stringify with error handling
  - Validate data before storing (no undefined, null, circular refs)
- [ ] T027[US2] Create `src/infrastructure/storage/StorageManager.ts` facade:
  - Export singleton instances: secureStorage, localStorage
  - clearAll() method clears both storages
  - Type-safe getters for common keys (authToken, userPrefs, theme)
- [ ] T028[US2] Create `src/infrastructure/storage/index.ts` exporting StorageManager, IStorage, StorageKeys
- [ ] T029[US2] Verify tests pass and 80%+ coverage for storage module

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - API calls + storage

---

## Phase 5: User Story 3 - Developer Debugs Issues with Colored Logs (Priority: P2)

**Goal**: Implement structured Logger with colored output and configurable levels

**Independent Test**: Call Logger methods, verify colored console output with timestamps

### Tests for User Story 3 ⚠️

- [ ] T030[P] [US3] Create `test/infrastructure/logger/Logger.test.ts` with test cases for:
  - debug() logs with gray color when level is DEBUG
  - debug() suppressed when level is INFO or higher
  - info() logs with blue color
  - warn() logs with yellow color
  - error() logs with red color and stack trace
  - Timestamps included in all logs
  - Circular references handled gracefully
  - Production config suppresses debug/info

### Implementation for User Story 3

- [ ] T031[P] [US3] Create `src/infrastructure/logger/LoggerConfig.ts` interface (level: LogLevel, enabled: boolean, showTimestamp: boolean)
- [ ] T032[US3] Create `src/infrastructure/logger/Logger.ts` singleton class:
  - configure(config: LoggerConfig) method
  - debug(message, ...args) with gray ANSI color
  - info(message, ...args) with blue ANSI color
  - warn(message, ...args) with yellow ANSI color
  - error(message, error?, ...args) with red ANSI color
  - Filter by configured log level
  - Include ISO timestamp if enabled
  - Handle circular references with JSON.stringify replacer
  - Format stack traces for errors
- [ ] T033[US3] Create `src/infrastructure/logger/index.ts` exporting Logger, LogLevel, ILogger, LoggerConfig
- [ ] T034[US3] Update LoggingInterceptor in ApiClient to use Logger instead of console.log
- [ ] T035[US3] Verify tests pass and 80%+ coverage for logger module

**Checkpoint**: Logger fully functional, integrated with ApiClient logging

---

## Phase 6: User Story 4 - Developer Monitors Network Connectivity (Priority: P2)

**Goal**: Implement ConnectivityManager with event listeners for online/offline detection

**Independent Test**: Toggle airplane mode, verify callbacks triggered with correct status

### Tests for User Story 4 ⚠️

- [ ] T036[P] [US4] Create `test/infrastructure/connectivity/ConnectivityManager.test.ts` with test cases for:
  - isConnected returns correct status
  - addListener registers callback
  - onDisconnected callback triggered when offline
  - onConnected callback triggered when online
  - removeListener unregisters callback
  - Multiple listeners work concurrently

### Implementation for User Story 4

- [ ] T037[P] [US4] Create `src/infrastructure/connectivity/ConnectivityListener.ts` type definitions:
  - ConnectivityCallback type: (isConnected: boolean) => void
  - ConnectivityState type: { isConnected: boolean, type: string }
- [ ] T038[US4] Create `src/infrastructure/connectivity/ConnectivityManager.ts` singleton:
  - Initialize NetInfo listener
  - isConnected: boolean getter (synchronous current state)
  - addListener(callback: ConnectivityCallback): void
  - removeListener(callback: ConnectivityCallback): void
  - Private listeners array
  - Private notifyListeners() method
  - dispose() cleanup method
- [ ] T039[US4] Create `src/infrastructure/connectivity/index.ts` exporting ConnectivityManager, ConnectivityListener
- [ ] T040[US4] Verify tests pass and 80%+ coverage for connectivity module

**Checkpoint**: ConnectivityManager functional, can detect online/offline transitions

---

## Phase 7: User Story 5 - Developer Reacts to App Lifecycle Events (Priority: P3)

**Goal**: Implement LifecycleManager for monitoring app active/inactive/background states

**Independent Test**: Background/foreground app, verify callbacks triggered in correct order

### Tests for User Story 5 ⚠️

- [ ] T041[P] [US5] Create `test/infrastructure/lifecycle/LifecycleManager.test.ts` with test cases for:
  - onActive callback triggered when app becomes active
  - onInactive callback triggered when app goes to background
  - Multiple observers work concurrently
  - removeObserver unregisters callback
  - Observers execute in registration order

### Implementation for User Story 5

- [ ] T042[P] [US5] Create `src/infrastructure/lifecycle/LifecycleObserver.ts` type definitions:
  - LifecycleCallback type: () => void
  - LifecycleState enum: ACTIVE, INACTIVE, BACKGROUND
- [ ] T043[US5] Create `src/infrastructure/lifecycle/LifecycleManager.ts` singleton:
  - Initialize React Native AppState listener
  - addObserver(onActive?: LifecycleCallback, onInactive?: LifecycleCallback): void
  - removeObserver(callback: LifecycleCallback): void
  - Private observers array
  - Private handleAppStateChange() method
  - dispose() cleanup method
- [ ] T044[US5] Create `src/infrastructure/lifecycle/index.ts` exporting LifecycleManager, LifecycleObserver
- [ ] T045[US5] Verify tests pass and 80%+ coverage for lifecycle module

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Integration & Polish

**Purpose**: Cross-module integration and final verification

- [ ] T046[P] Create `src/infrastructure/index.ts` exporting all infrastructure modules
- [ ] T047Integration test: Save auth token in SecureStorage, use in ApiClient request, verify token in headers
- [ ] T048Integration test: ConnectivityManager detects offline, ApiClient request fails with network error
- [ ] T049Integration test: LifecycleManager triggers onInactive, app pauses background tasks
- [ ] T050[P] Run full test suite, verify 80%+ coverage across all modules
- [ ] T051[P] Fix any ESLint warnings or TypeScript errors
- [ ] T052[P] Add JSDoc comments to all public APIs
- [ ] T053Performance test: ApiClient handles 100 concurrent requests without memory leaks
- [ ] T054Performance test: LocalStorage operations complete in < 100ms
- [ ] T055Security verification: SecureStorage data encrypted on iOS/Android devices

---

## Phase 9: Documentation & Examples

**Purpose**: Developer documentation and usage examples

- [ ] T056[P] Document ApiClient usage in infrastructure README: configure, make request, handle errors
- [ ] T057[P] Document StorageManager usage: save token, retrieve token, clear on logout
- [ ] T058[P] Document Logger usage: configure for dev vs production, log levels
- [ ] T059[P] Document ConnectivityManager usage: check connectivity, register listeners
- [ ] T060[P] Document LifecycleManager usage: observe app state changes
- [ ] T061Create example in `examples/infrastructure/`: complete app setup with all infrastructure modules
- [ ] T062Verify all examples run without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P3)
- **Integration (Phase 8)**: Depends on all user stories being complete
- **Documentation (Phase 9)**: Depends on Integration completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Parallel to US1
- **User Story 3 (P2)**: Can start after Foundational - Integrates with US1 (LoggingInterceptor) but independently testable
- **User Story 4 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational - No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Interfaces/types before implementations
- Core implementation before interceptors/integrations
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: All tasks marked [P] can run in parallel
- **Phase 2 Foundational**: All tasks marked [P] can run in parallel (within Phase 2)
- **Phase 3-7**: Once Foundational completes, all user stories can start in parallel (if team capacity allows)
  - US1 (Network) and US2 (Storage) can run fully in parallel
  - US3 (Logger) can run in parallel, then integrate with US1
  - US4 (Connectivity) and US5 (Lifecycle) fully independent
- **Phase 8 Integration**: Integration tests marked [P] can run in parallel
- **Phase 9 Docs**: All documentation tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Network)
4. Complete Phase 4: User Story 2 (Storage)
5. **STOP and VALIDATE**: Test US1 + US2 integration (save token, use in API call)
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Network) → Test independently → MVP!
3. Add User Story 2 (Storage) → Test with US1 → Enhanced MVP!
4. Add User Story 3 (Logger) → Integrate with US1 → Better DX!
5. Add User Story 4 (Connectivity) → Independent feature
6. Add User Story 5 (Lifecycle) → Independent feature
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Network)
   - Developer B: User Story 2 (Storage)
   - Developer C: User Story 3 (Logger)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, etc.) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 1 & 2 are both P1 (critical) - implement both for MVP
- User Story 3-5 are enhancements - can be deferred if needed
