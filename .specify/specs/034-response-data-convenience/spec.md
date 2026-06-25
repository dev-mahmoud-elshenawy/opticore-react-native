# Feature Specification: Response Data Convenience

**Feature Branch**: `034-response-data-convenience`
**Created**: 2026-06-25
**Status**: Draft — **NEEDS DECISION** (return-shape approach) before execution
**Input**: Remove the recurring `.data` papercut from the facade. After spec 032, `api.get<T>()` returns `ApiResponse<T>`, so consumers write `(await api.get<User[]>('/users')).data` constantly. Add an unwrapped variant that returns `T` directly — additively, without splitting the mental model or breaking 032.

## Context / Problem

Spec 032's `api` facade returns `ApiResponse<T>` (same shape as `request()`) for one consistent mental model. The cost: the common case is `const { data } = await api.get(...)` or `(await api.get(...)).data` on every call. The DX evaluation flagged this as the main remaining *code* papercut (after docs in 033).

We want an **additive** way to get `T` directly. The earlier evaluation deliberately parked this because it introduces a *second return shape* — that tradeoff is the decision to make here.

**Hard constraint:** spec 032 already shipped `api.get/post/...` returning `ApiResponse<T>` in 2.8.0. Changing those to return `T` would be **breaking** — NOT allowed. The unwrapped access must be a **new, parallel** surface.

## ⚠️ Decision required before execution

Pick the unwrapped surface (all additive; none change existing verbs):

- **Option A — `data` namespace (recommended):** `api.data.get<T>(url)` → `Promise<T>`; mirrors all five verbs + config. Discoverable, grouped, leaves `api.get` untouched.
  ```ts
  const users = await api.data.get<User[]>('/users');   // T
  const created = await api.data.post<Created>('/users', body);
  ```
- **Option B — `*Data` siblings:** `api.getData<T>(url)` / `api.postData<T>(url, body)` → `Promise<T>`. Flat, but doubles the method count on `api`.
- **Option C — unwrap helper:** a `unwrap()` util — `const users = await unwrap(api.get<User[]>('/users'))`. Smallest surface, but still a wrapper at every call site.

Recommendation: **Option A** — cleanest grouping, smallest cognitive overhead, no verb-count bloat. The rest of this spec is written assuming Option A; adjust FRs if B/C is chosen.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Get data directly (Priority: P1)

A consumer calls `api.data.get<T>(url)` (and the other verbs) and receives `T` directly — no `.data`, no `ApiResponse` wrapper — while `api.get` etc. continue to return `ApiResponse<T>` unchanged.

**Why this priority**: This is the entire point — remove the papercut.

**Independent Test**: Spy on `ApiClient.getInstance().request`; assert `api.data.get('/x')` forwards the same args as `api.get('/x')` and resolves to `response.data` (not the wrapper).

**Acceptance Scenarios**:

1. **Given** configured OptiCore, **When** `api.data.get<User[]>('/users')`, **Then** it resolves to the `User[]` payload (i.e., `response.data`), with `request` called identically to `api.get`.
2. **When** `api.data.post<Created>('/users', body, cfg)`, **Then** it forwards `{ method: POST, url, data: body, ...cfg }` and resolves to `Created`.
3. **Given** existing code, **When** `api.get(...)` is called, **Then** it still returns `ApiResponse<T>` (no breaking change from 2.8.0).

---

### User Story 2 - Consistent across all verbs (Priority: P2)

`api.data` exposes the same five verbs (`get/post/put/patch/delete`) with the same signatures as `api.*`, differing only in the unwrapped return.

**Acceptance Scenarios**:

1. **Given** `api.data`, **When** any verb is used, **Then** signatures match `api.*` (minus the `ApiResponse` wrapper) and `T` defaults to `unknown`.

---

### Edge Cases

- A response with no body (204): `data` may be `undefined`/`null`; `api.data.*` resolves to that value as typed `T` (caller's responsibility, same as axios).
- Errors propagate identically (the underlying `request()` rejects); unwrapping only touches the success path.
- `api.data` must remain lazy/side-effect-free like the rest of the facade (no `getInstance()` at module load).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Add an additive unwrapped surface (per the chosen option; recommended `api.data.{get,post,put,patch,delete}`) returning `Promise<T>` = the resolved `ApiResponse<T>.data`.
- **FR-002**: Signatures MUST match the existing verbs: `get/delete(url, cfg?)`, `post/put/patch(url, data?, cfg?)`, `cfg = Omit<RequestConfig,'method'|'url'|'data'>`, `T` defaulting to `unknown`.
- **FR-003**: Existing `api.get/post/put/patch/delete` and `api.request` MUST be unchanged (still return `ApiResponse<T>`). No breaking change to 2.8.0.
- **FR-004**: The unwrapped surface MUST delegate to the same `request()` (identical forwarded config) and MUST remain lazy/side-effect-free on import.
- **FR-005**: Export remains via the root barrel + `opticore-react-native/facades` (no new subpath needed).
- **FR-006**: Tests cover arg-forwarding parity with `api.*`, the unwrapped return, default-`unknown` typing, and the no-side-effect-on-import guarantee; full suite stays green; ≥80% coverage on the new code.
- **FR-007**: Docs (README, QUICK_START Step 3, `docs/api/INFRASTRUCTURE.md` facades section) show both styles and when to use each; CHANGELOG entry; bump to **2.9.0** (minor, additive).

### Out of Scope

- Changing the default return of `api.get` etc. to `T` (breaking — explicitly rejected).
- Unwrapping for `request()` (stays full-control).
- Runtime schema validation (use Zod at the call site).

### Key Entities

- **`api.data`** (Option A): parallel verb object returning unwrapped `T`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer can fetch a typed payload with **no `.data`** at the call site via the new surface.
- **SC-002**: `api.get`/`request` behavior is byte-identical to 2.8.0 (verified by existing tests staying green).
- **SC-003**: New surface forwards identical `request()` args to `api.*` (verified by spy parity tests) and resolves to `response.data`.
- **SC-004**: Importing the facade still triggers zero `getInstance()` at load; type-check + full suite pass; version is 2.9.0.
