# Tasks: ApiClient Extensibility

**Spec**: 021 | **Branch**: `feature/021-api-client-extensibility`

---

## Phase 1: Interceptor Interface & Registration [US1]

- [x] T001 [P] [US1] Create `src/infrastructure/network/Interceptor.ts` — `Interceptor` interface, `InterceptorId` type
- [x] T002 [US1] Write tests in `test/infrastructure/network/Interceptor.test.ts` — register interceptor, verify onRequest called
- [x] T003 [US1] Write tests — register interceptor, verify onResponse called
- [x] T004 [US1] Write tests — multiple interceptors execute in FIFO order
- [x] T005 [US1] Write tests — `removeInterceptor(id)` stops interceptor from being called
- [x] T006 [US1] Write tests — interceptor that throws propagates error to caller
- [x] T007 [US1] Modify `src/infrastructure/network/ApiClient.ts` — add `addRequestInterceptor()` returning InterceptorId
- [x] T008 [US1] Modify `src/infrastructure/network/ApiClient.ts` — add `addResponseInterceptor()` returning InterceptorId
- [x] T009 [US1] Modify `src/infrastructure/network/ApiClient.ts` — add `removeInterceptor(id)` method
- [x] T010 [US1] Run tests — verify custom interceptors work alongside built-in ones

**Checkpoint**: Custom interceptors registerable at runtime.

---

## Phase 2: AuthStrategy Plugin System [US2]

- [x] T011 [P] [US2] Create `src/infrastructure/network/AuthStrategy.ts` — interface + BearerTokenStrategy + ApiKeyStrategy + NoAuthStrategy
- [x] T012 [US2] Write tests in `test/infrastructure/network/AuthStrategy.test.ts` — BearerTokenStrategy adds Authorization header
- [x] T013 [US2] Write tests — ApiKeyStrategy adds custom header (e.g., X-API-Key)
- [x] T014 [US2] Write tests — NoAuthStrategy adds no headers
- [x] T015 [US2] Write tests — custom AuthStrategy implementation works
- [x] T016 [US2] Modify `src/infrastructure/network/NetworkConfig.ts` — add `authStrategy` property
- [x] T017 [US2] Modify `src/infrastructure/network/interceptors/AuthInterceptor.ts` — delegate to AuthStrategy.applyAuth() and handleUnauthorized()
- [x] T018 [US2] Extract current Bearer logic into `BearerTokenStrategy` (preserving exact behavior)
- [x] T019 [US2] Run tests — verify all auth strategies + existing auth tests pass

**Checkpoint**: Auth strategy is pluggable.

---

## Phase 3: Public HTTP Methods [US4]

- [x] T020 [US4] Write tests — `apiClient.get<User>('/users/1')` callable directly
- [x] T021 [US4] Write tests — `apiClient.post<User>('/users', data)` callable directly
- [x] T022 [US4] Modify `src/infrastructure/network/ApiClient.ts` — change `private get/post/put/delete/patch` to `public`
- [x] T023 [US4] Run tests — verify public methods work and `request()` still works (backward compat)

> [!NOTE]
> Phase 3 Skipped per user request (prefer using `request()` global function).

**Checkpoint**: HTTP methods are public.

---

## Phase 4: CoreConfig API Expansion [US3]

- [x] T024 [US3] Modify `src/config/types.ts` — add `onTokenRefresh` and `authStrategy` to `ApiConfig`
- [x] T025 [US3] Write tests — `CoreSetup.init()` passes `onTokenRefresh` to ApiClient
- [x] T026 [US3] Write tests — 401 response triggers `onTokenRefresh`, retries with new token
- [x] T027 [US3] Modify `src/config/CoreSetup.ts` — pass `onTokenRefresh` and `authStrategy` to `ApiClient.configure()`
- [x] T028 [US3] Run tests — verify end-to-end token refresh

**Checkpoint**: Token refresh configurable via CoreConfig.

---

## Phase 5: Exports & Polish

- [x] T029 [P] Modify `src/infrastructure/network/index.ts` — export Interceptor, AuthStrategy, BearerTokenStrategy, ApiKeyStrategy, NoAuthStrategy
- [x] T030 [P] Verify `src/index.ts` exports include new types
- [x] T031 Run full test suite: `npm test`
- [x] T032 Run `npm run type-check` — verify 0 errors
- [x] T033 Run `npm run lint` — verify 0 errors
- [x] T034 Verify coverage: 80%+ on all network files

**Checkpoint**: ApiClient extensibility complete.

---

## Dependencies

- Phase 1 → Phase 2 (interceptor system before auth strategy uses it)
- Phase 2 can run parallel with Phase 3
- Phase 1 + 2 → Phase 4 (auth strategy before CoreConfig expansion)
- All → Phase 5
