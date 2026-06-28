# Feature Specification: ApiClient Extensibility

**Spec Number**: 021
**Feature Branch**: `feature/021-api-client-extensibility`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P1
**Input**: Code Review 2026-02-11, Sections 3 (Interceptor chain), 14O (Open/Closed), 14D (Dependency Inversion), 16B (Interceptors locked)

## Problem Statement

The ApiClient currently:

1. **Hardcodes 3 interceptors** (Auth, Logging, Error) in the constructor. Consuming apps cannot add custom interceptors (rate limiting, analytics, caching, retry) without modifying source.
2. **Auth strategy is fixed** - Bearer token injection only. No support for API keys, OAuth PKCE, certificate pinning, or custom auth schemes.
3. **GET/POST/PUT/DELETE/PATCH are private** - Consuming apps must use them through the singleton but can't extend request behavior.
4. **Missing `onTokenRefresh` in CoreConfig** - The `NetworkConfig` has `onTokenRefresh` but `CoreConfig.api` (ApiConfig) doesn't expose it to `CoreSetup.init()`.

---

## User Scenarios & Testing

### User Story 1 - Custom Interceptor Registration (Priority: P1)

Consuming apps can register custom request/response interceptors that execute in a defined order within the interceptor chain.

**Why this priority**: This is the most requested extensibility point. Every app has unique cross-cutting concerns (analytics headers, rate limiting, request signing).

**Independent Test**: Register a custom interceptor that adds an `X-Request-ID` header, make a request, verify the header is present.

**Acceptance Scenarios**:

1. **Given** `apiClient.addRequestInterceptor(myInterceptor)`, **When** a request is made, **Then** `myInterceptor.onRequest(config)` is called before the request is sent.
2. **Given** `apiClient.addResponseInterceptor(myInterceptor)`, **When** a response is received, **Then** `myInterceptor.onResponse(response)` is called.
3. **Given** multiple custom interceptors registered, **When** a request is made, **Then** interceptors execute in registration order (FIFO).
4. **Given** a custom interceptor that throws, **When** a request is made, **Then** the error propagates to the caller (no silent swallowing).
5. **Given** `apiClient.removeInterceptor(id)`, **When** a request is made, **Then** the removed interceptor is not called.
6. **Given** built-in interceptors (Auth, Logging, Error), **When** custom interceptors are added, **Then** built-in interceptors still execute (custom interceptors run after Auth, before Error).

---

### User Story 2 - Auth Strategy Plugin (Priority: P1)

The auth interceptor behavior is configurable. Consuming apps can choose between Bearer token, API key, or custom auth strategies.

**Why this priority**: Many APIs use API keys, OAuth PKCE, or custom schemes that don't fit the Bearer token pattern.

**Independent Test**: Configure ApiClient with API key auth strategy, make a request, verify `X-API-Key` header is set.

**Acceptance Scenarios**:

1. **Given** `authStrategy: 'bearer'` (default), **When** a request is made, **Then** `Authorization: Bearer <token>` header is added.
2. **Given** `authStrategy: 'apiKey'` with `apiKeyHeader: 'X-API-Key'`, **When** a request is made, **Then** the configured header contains the key.
3. **Given** `authStrategy: 'custom'` with a custom `AuthStrategy` implementation, **When** a request is made, **Then** the custom strategy's `applyAuth(config)` method is called.
4. **Given** `authStrategy: 'none'`, **When** a request is made, **Then** no auth headers are added and AuthInterceptor is skipped.

---

### User Story 3 - CoreConfig API Token Refresh (Priority: P2)

`CoreConfig.api` exposes `onTokenRefresh` so consuming apps can configure token refresh via the unified config.

**Why this priority**: Currently `NetworkConfig` has this but `CoreConfig.api` (ApiConfig) doesn't, creating a gap in the unified configuration story.

**Independent Test**: Pass `onTokenRefresh` in CoreConfig, trigger a 401 response, verify refresh callback is invoked.

**Acceptance Scenarios**:

1. **Given** `CoreConfig.api.onTokenRefresh` is set, **When** `CoreSetup.init()` is called, **Then** `ApiClient` is configured with the refresh callback.
2. **Given** a 401 response, **When** AuthInterceptor handles it, **Then** `onTokenRefresh()` is called, the new token is used, and the original request is retried.
3. **Given** `onTokenRefresh` returns null, **When** a 401 occurs, **Then** the error propagates without retry.

---

### User Story 4 - Public HTTP Methods (Priority: P3)

The HTTP methods (get, post, put, delete, patch) are made public so consuming apps can call them directly for simple use cases without going through `request()`.

**Why this priority**: Quality-of-life improvement. The methods already exist but are private.

**Acceptance Scenarios**:

1. **Given** `ApiClient.getInstance()`, **When** `apiClient.get<User>('/users/1')` is called directly, **Then** it returns typed `ApiResponse<User>`.
2. **Given** existing code using `apiClient.request({ method: HttpMethod.GET, url })`, **When** unchanged, **Then** it continues to work (backward compatible).

---

### Edge Cases

- What happens when an interceptor modifies the request config in a way that breaks subsequent interceptors?
- What happens when two interceptors try to set the same header?
- What happens when a custom auth strategy's `applyAuth` is async and slow?
- What happens when `addRequestInterceptor` is called after requests are already in flight?

---

## Requirements

### Functional Requirements

- **FR-001**: `ApiClient` MUST expose `addRequestInterceptor(interceptor): InterceptorId` and `addResponseInterceptor(interceptor): InterceptorId`.
- **FR-002**: `ApiClient` MUST expose `removeInterceptor(id: InterceptorId): boolean`.
- **FR-003**: Custom interceptors MUST execute after Auth interceptor and before Error interceptor.
- **FR-004**: `Interceptor` interface MUST define `onRequest?(config): config`, `onResponse?(response): response`, `onError?(error): error`.
- **FR-005**: `AuthStrategy` interface MUST define `applyAuth(config): config` and `handleUnauthorized(error): Promise<RetryConfig | null>`.
- **FR-006**: Built-in auth strategies: `BearerTokenStrategy`, `ApiKeyStrategy`, `NoAuthStrategy`.
- **FR-007**: `CoreConfig.api` MUST include `onTokenRefresh`, `authStrategy` properties.
- **FR-008**: HTTP methods (get, post, put, delete, patch) MUST be public.
- **FR-009**: All changes MUST be backward compatible with existing `ApiClient.configure()` calls.

### Key Entities

- **Interceptor**: Interface for request/response interception
- **InterceptorId**: Opaque identifier for removal
- **AuthStrategy**: Interface for pluggable auth behavior
- **BearerTokenStrategy**: Default auth strategy (current behavior)
- **ApiKeyStrategy**: API key header auth strategy

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Custom interceptors can be registered and execute in correct order.
- **SC-002**: Auth strategy is swappable via configuration.
- **SC-003**: All existing ApiClient tests pass without modification.
- **SC-004**: 80%+ coverage on new interceptor registration and auth strategy code.
- **SC-005**: `CoreConfig.api.onTokenRefresh` works end-to-end.

---

## Files to Create/Modify

- `src/infrastructure/network/Interceptor.ts` - Public interceptor interface
- `src/infrastructure/network/AuthStrategy.ts` - Auth strategy interface + implementations
- `src/infrastructure/network/ApiClient.ts` - Public methods, interceptor registration, auth strategy
- `src/infrastructure/network/NetworkConfig.ts` - Add authStrategy property
- `src/config/types.ts` - Add onTokenRefresh, authStrategy to ApiConfig
- `src/config/CoreSetup.ts` - Pass onTokenRefresh to ApiClient
- `test/infrastructure/network/ApiClient.test.ts` - Interceptor registration tests
- `test/infrastructure/network/AuthStrategy.test.ts` - Strategy tests
