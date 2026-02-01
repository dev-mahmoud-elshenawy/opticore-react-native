# Feature Specification: Infrastructure Layer

**Feature Branch**: `002-infrastructure-layer`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Build core infrastructure layer providing network client (Axios wrapper), storage management (AsyncStorage + SecureStore), logger, lifecycle manager, and connectivity monitor"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Makes API Calls with Auto Token Injection (Priority: P1)

A developer building an app needs to make HTTP requests to their backend API. They want authentication tokens automatically injected into headers, request/response logging for debugging, and centralized error handling without writing boilerplate in every API call.

**Why this priority**: Network layer is the most critical infrastructure - almost every app makes API calls. Without this, developers have to write their own Axios wrapper, interceptors, and error handling repeatedly.

**Independent Test**: Can be fully tested by configuring ApiClient with base URL and auth token, making a GET request, and verifying the token appears in request headers and response is typed correctly.

**Acceptance Scenarios**:

1. **Given** ApiClient is configured with baseURL and auth token, **When** developer calls `apiClient.get('/users')`, **Then** request includes Authorization header with token and returns typed response
2. **Given** auth token expires, **When** API returns 401 status, **Then** ApiClient triggers token refresh callback and retries request automatically
3. **Given** network timeout is configured to 10 seconds, **When** request takes longer than 10 seconds, **Then** ApiClient throws timeout error with clear message
4. **Given** logging is enabled, **When** any API request is made, **Then** request method, URL, headers, and response status are logged to console with colors

---

### User Story 2 - Developer Stores Sensitive Data Securely (Priority: P1)

A developer needs to store user authentication tokens securely (encrypted) and user preferences non-securely (faster access). They want a unified storage interface that handles both cases without learning two different APIs.

**Why this priority**: Storage is critical for auth tokens, user settings, and offline data. Developers need secure storage for tokens (SecureStore) and fast storage for preferences (AsyncStorage) with a simple API.

**Independent Test**: Can be tested by saving a token to SecureStorage, app restart, and verifying token is retrieved successfully with encryption verified on device.

**Acceptance Scenarios**:

1. **Given** StorageManager is initialized, **When** developer calls `SecureStorage.set('auth_token', 'xyz123')`, **Then** token is encrypted and stored in iOS Keychain or Android Keystore
2. **Given** auth token is stored, **When** app restarts and developer calls `SecureStorage.get('auth_token')`, **Then** encrypted token is retrieved and decrypted correctly
3. **Given** developer stores user preferences, **When** they call `LocalStorage.set('theme', 'dark')`, **Then** preference is stored in AsyncStorage and retrievable after app restart
4. **Given** developer wants to clear all data on logout, **When** they call `StorageManager.clearAll()`, **Then** both secure and local storage are cleared completely

---

### User Story 3 - Developer Debugs Issues with Colored Logs (Priority: P2)

A developer debugging network issues or app flow wants structured, colored console logs with different levels (debug, info, warn, error) to quickly identify problems without console.log statements everywhere.

**Why this priority**: Logging is essential for debugging but not critical for MVP. Developers can use console.log initially but structured logging greatly improves development experience.

**Independent Test**: Can be tested by calling Logger methods at different levels and verifying console output includes colors, timestamps, and log levels.

**Acceptance Scenarios**:

1. **Given** Logger is configured with log level 'debug', **When** developer calls `Logger.debug('API request started')`, **Then** message appears in console with gray color and [DEBUG] prefix
2. **Given** Logger is configured with log level 'warn', **When** developer calls `Logger.debug('test')`, **Then** message is suppressed (not shown in console)
3. **Given** error occurs, **When** developer calls `Logger.error('Network failed', error)`, **Then** error message, stack trace, and error object are logged in red
4. **Given** production build, **When** Logger is configured for production, **Then** only 'error' level logs are shown (debug/info/warn suppressed)

---

### User Story 4 - Developer Monitors Network Connectivity (Priority: P2)

A developer wants to show "No Internet" screen when device goes offline and resume API calls when connection is restored, without manually checking connectivity before every request.

**Why this priority**: Important for user experience but not critical for MVP. Apps can handle network errors without proactive connectivity monitoring initially.

**Independent Test**: Can be tested by toggling device airplane mode and verifying connectivity callbacks are triggered with correct online/offline status.

**Acceptance Scenarios**:

1. **Given** ConnectivityManager is initialized, **When** device internet connection is available, **Then** `isConnected` returns true
2. **Given** ConnectivityManager is monitoring, **When** device goes offline (airplane mode), **Then** onDisconnected callback is triggered
3. **Given** device is offline, **When** internet connection is restored, **Then** onConnected callback is triggered
4. **Given** developer wants to check connectivity before API call, **When** they call `ConnectivityManager.isConnected`, **Then** real-time connectivity status is returned

---

### User Story 5 - Developer Reacts to App Lifecycle Events (Priority: P3)

A developer wants to pause timers when app goes to background, resume data sync when app becomes active, and clean up resources when app is terminated.

**Why this priority**: Nice to have for optimizations but not critical for basic app functionality. Most apps can work without lifecycle monitoring initially.

**Independent Test**: Can be tested by backgrounding app, foregrounding app, and verifying lifecycle callbacks are triggered in correct order.

**Acceptance Scenarios**:

1. **Given** LifecycleManager is initialized, **When** app becomes active (foreground), **Then** onActive callback is triggered
2. **Given** app is active, **When** user presses home button (app goes to background), **Then** onInactive callback is triggered
3. **Given** app returns from background, **When** app becomes active again, **Then** onActive callback is triggered again
4. **Given** developer registered multiple listeners, **When** lifecycle event occurs, **Then** all registered callbacks are executed in registration order

---

### Edge Cases

- What happens when API baseURL is not configured but request is made?
- What happens when SecureStore is not available (web platform)?
- What happens when AsyncStorage is full (64MB limit reached)?
- What happens when multiple API requests are made simultaneously with expired token?
- What happens when device has no internet and developer tries to make API call?
- What happens when Logger is called before initialization?
- What happens when connectivity listener is registered but never unregistered (memory leak)?

## Requirements *(mandatory)*

### Functional Requirements

**Network (ApiClient)**:
- **FR-001**: System MUST provide configurable ApiClient class wrapping Axios with baseURL, timeout, and headers
- **FR-002**: System MUST support request interceptors for automatic auth token injection
- **FR-003**: System MUST support response interceptors for error handling and logging
- **FR-004**: System MUST automatically refresh expired auth tokens on 401 responses
- **FR-005**: System MUST provide typed request/response methods (get, post, put, delete, patch)
- **FR-006**: System MUST log all requests and responses when logging is enabled
- **FR-007**: System MUST handle network timeouts with configurable duration (default 30 seconds)
- **FR-008**: System MUST classify errors as network errors, timeout errors, or API errors

**Storage (StorageManager)**:
- **FR-009**: System MUST provide SecureStorage wrapper for expo-secure-store with encrypt/decrypt
- **FR-010**: System MUST provide LocalStorage wrapper for AsyncStorage with JSON serialization
- **FR-011**: System MUST support get, set, remove, clear operations for both storage types
- **FR-012**: System MUST handle storage errors gracefully with clear error messages
- **FR-013**: System MUST validate data before storing (prevent undefined, null, invalid JSON)
- **FR-014**: System MUST provide StorageKeys constants to prevent typos in storage keys

**Logger**:
- **FR-015**: System MUST provide Logger singleton with debug, info, warn, error methods
- **FR-016**: System MUST support configurable log levels (debug, info, warn, error)
- **FR-017**: System MUST colorize console output (gray=debug, blue=info, yellow=warn, red=error)
- **FR-018**: System MUST include timestamps in all log messages
- **FR-019**: System MUST suppress logs below configured level (e.g., no debug in production)
- **FR-020**: System MUST handle circular references in logged objects

**Connectivity (ConnectivityManager)**:
- **FR-021**: System MUST provide real-time network connectivity status (online/offline)
- **FR-022**: System MUST support registering listeners for connectivity changes
- **FR-023**: System MUST trigger callbacks when network goes offline
- **FR-024**: System MUST trigger callbacks when network comes online
- **FR-025**: System MUST use NetInfo library for accurate connectivity detection

**Lifecycle (LifecycleManager)**:
- **FR-026**: System MUST monitor React Native AppState (active, inactive, background)
- **FR-027**: System MUST trigger callbacks when app becomes active
- **FR-028**: System MUST trigger callbacks when app becomes inactive
- **FR-029**: System MUST support registering multiple lifecycle listeners
- **FR-030**: System MUST provide cleanup method to unregister listeners

### Key Entities

- **ApiClient**: Axios wrapper with interceptors, baseURL, timeout, headers
- **NetworkConfig**: Configuration interface for baseURL, timeout, headers, auth token
- **ApiResponse<T>**: Generic type for API responses with data, status, headers
- **ApiError**: Error class with status code, message, request URL, response data
- **StorageManager**: Unified interface for SecureStorage + LocalStorage
- **SecureStorage**: Encrypted storage wrapper (expo-secure-store)
- **LocalStorage**: Fast key-value storage wrapper (AsyncStorage)
- **StorageKeys**: Constants for storage key names (AUTH_TOKEN, USER_PREFS, etc.)
- **Logger**: Singleton logger with configurable levels
- **LogLevel**: Enum (DEBUG, INFO, WARN, ERROR)
- **ConnectivityManager**: Network status monitor with event listeners
- **LifecycleManager**: App lifecycle monitor with event listeners

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can configure ApiClient and make typed GET request in under 5 lines of code
- **SC-002**: Auth token is automatically injected into all requests without manual header setting
- **SC-003**: Expired tokens trigger refresh callback and retry request automatically (verified by test)
- **SC-004**: Developer can store auth token securely and retrieve after app restart successfully
- **SC-005**: SecureStorage data is encrypted on device (verified by inspecting storage location)
- **SC-006**: LocalStorage operations complete in under 100ms for typical JSON objects (< 10KB)
- **SC-007**: Logger outputs colored, timestamped messages with correct log level prefixes
- **SC-008**: Production Logger configuration suppresses debug/info logs (only warn/error shown)
- **SC-009**: ConnectivityManager detects offline state within 1 second of network disconnect
- **SC-010**: LifecycleManager triggers callbacks within 100ms of app state change
- **SC-011**: All infrastructure modules have 80%+ test coverage
- **SC-012**: ApiClient handles 100 concurrent requests without errors or memory leaks
