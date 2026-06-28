# Implementation Plan: ApiClient Extensibility

**Branch**: `feature/021-api-client-extensibility` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Make ApiClient extensible: (1) Custom interceptor registration via `addRequestInterceptor()` / `addResponseInterceptor()`, (2) Pluggable auth strategy (Bearer, API Key, None, Custom), (3) Public HTTP methods (get/post/put/delete/patch), (4) Expose `onTokenRefresh` in CoreConfig.api. All changes backward compatible.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: Axios ^1.13
**Testing**: Jest ^29
**Target Platform**: iOS & Android

## Constitution Check

| Principle           | Status   | Notes                                                          |
| ------------------- | -------- | -------------------------------------------------------------- |
| Pure Infrastructure | PASS     | Network client is infrastructure                               |
| TypeScript Strict   | PASS     | Interceptor/AuthStrategy fully typed                           |
| SOLID - OCP         | FIX      | New interceptors without modifying ApiClient source            |
| SOLID - DIP         | IMPROVED | Auth depends on abstraction (AuthStrategy) not concrete Bearer |

## Source Code Structure

```
src/infrastructure/network/
├── ApiClient.ts              [MODIFY] Public methods, interceptor registration, auth strategy
├── Interceptor.ts            [NEW] Public interceptor interface + InterceptorId
├── AuthStrategy.ts           [NEW] Interface + BearerTokenStrategy + ApiKeyStrategy + NoAuthStrategy
├── NetworkConfig.ts          [MODIFY] Add authStrategy property
├── interceptors/
│   └── AuthInterceptor.ts    [MODIFY] Delegate to AuthStrategy
└── index.ts                  [MODIFY] Export new types

src/config/
├── types.ts                  [MODIFY] Add onTokenRefresh, authStrategy to ApiConfig
└── CoreSetup.ts              [MODIFY] Pass onTokenRefresh to ApiClient

test/infrastructure/network/
├── ApiClient.test.ts         [MODIFY] Interceptor registration, public methods
├── AuthStrategy.test.ts      [NEW] Strategy tests
└── Interceptor.test.ts       [NEW] Custom interceptor tests
```

## Approach

1. **Interceptor interface** (`src/infrastructure/network/Interceptor.ts`): `{ name: string; onRequest?(config): config; onResponse?(response): response; onError?(error): error }`. Registration returns opaque `InterceptorId` (number) for removal.

2. **ApiClient registration**: `addRequestInterceptor(interceptor)` uses `this.client.interceptors.request.use()` under the hood. Custom interceptors run after Auth, before Error in the chain. Store Axios interceptor IDs for removal via `removeInterceptor(id)`.

3. **AuthStrategy** (`src/infrastructure/network/AuthStrategy.ts`): Interface with `applyAuth(config): config` and `handleUnauthorized(error): Promise<RetryConfig | null>`. Built-in: `BearerTokenStrategy` (current behavior extracted), `ApiKeyStrategy` (custom header), `NoAuthStrategy` (skip).

4. **AuthInterceptor refactor**: Delegate to `AuthStrategy.applyAuth()` in onRequest and `AuthStrategy.handleUnauthorized()` in onError (401). Strategy is set via `NetworkConfig.authStrategy`.

5. **Public HTTP methods**: Change `private get/post/put/delete/patch` to `public`. No signature changes.

6. **CoreConfig.api expansion**: Add `onTokenRefresh?: () => Promise<string | null>` and `authStrategy?: 'bearer' | 'apiKey' | 'none' | AuthStrategy` to `ApiConfig`. `CoreSetup.init()` passes these to `ApiClient.configure()`.
