# Error Handling — Which Tool, When

OptiCore gives you a few error tools. This page is the decision tree so you never
have to guess. For the API reference of each type, see
[`docs/api/ERRORS.md`](api/ERRORS.md).

## TL;DR decision tree

```
Is this an EXPECTED, recoverable outcome the caller should branch on
(validation, "not found", parse failure)?
│
├─ YES → return Result<T, E>           (no throwing; caller handles both paths)
│
└─ NO → it's an UNEXPECTED failure. What should the user see?
        │
        ├─ Replace the screen (render-path crash the user must see)
        │        → throw RenderError    → OptiCoreErrorBoundary shows a fallback
        │
        ├─ An HTTP request failed
        │        → ApiError (a RenderError subclass) is thrown for you by ApiClient.
        │          Catch it to read status / isRetryable / retryAfterMs, or let it
        │          bubble to the boundary.
        │
        └─ Nothing — log it / retry quietly (analytics, background sync)
                 → logger.error(new NonRenderError(...))   ← construct + log, NEVER throw
                   (need user feedback like a toast? that's a state update, not a throw)
```

This maps to the three RN outcomes (see the boundary behavior in
[`docs/api/ERRORS.md`](api/ERRORS.md)): **replace screen** · **notify via state** · **silent log**.

---

## 1. `Result<T, E>` — expected, recoverable outcomes

Use when failure is a normal branch the caller must handle. No exceptions, no boundary.

```ts
import { Result } from 'opticore-react-native';

function parsePort(raw: string): Result<number, string> {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? Result.ok(n) : Result.err('not a valid port');
}

const r = parsePort(input);
if (r.isOk()) {
  use(r.unwrap());
} else {
  show(r); // r.isErr() — handle the error branch
}
// or: const port = parsePort(input).unwrapOr(8080);
```

**Why:** the type forces the caller to handle the failure — it can't be silently dropped.

---

## 2. `RenderError` — the user must see it, replace the screen

Throw it on the **render path**; `OptiCoreErrorBoundary` catches it and shows a fallback.

```ts
import { RenderError } from 'opticore-react-native';

function Profile({ user }: { user: User | null }) {
  if (!user) {
    throw new RenderError('profile missing', undefined, {
      userMessage: 'We couldn’t load your profile. Please try again.',
    });
  }
  return <ProfileView user={user} />;
}
```

> Boundaries only catch errors thrown **synchronously during render** — not event
> handlers or async code. For those, handle locally (see §3/§4).

---

## 3. `ApiError` — HTTP failures

`ApiError` **extends `RenderError`**, so an uncaught one drives the boundary like any
render error. `ApiClient`/`api` throw it for you on non-2xx. Catch it when you want the
HTTP specifics:

```ts
import { api, ApiError } from 'opticore-react-native';

try {
  const { data } = await api.get<User[]>('/users');
  return data;
} catch (e) {
  if (e instanceof ApiError) {
    if (e.isRetryable) scheduleRetry(e.retryAfterMs); // 429/503/timeout/network
    else if (e.status === 404) return [];             // actionable 4xx
  }
  throw e; // unknown → let it bubble to the boundary
}
```

Fields: `status`, `isRetryable`, `retryAfterMs`, plus `RenderError`'s `userMessage`/`severity`.

---

## 4. `NonRenderError` — background/silent failures

A **descriptor / log payload — never thrown.** The async/event errors it describes
aren't caught by a boundary, so throwing them is lost. Construct it and log it; read
its fields if you want to drive feedback (a toast is a state update, not a throw).

```ts
import { logger, NonRenderError } from 'opticore-react-native';

try {
  await syncInBackground();
} catch (cause) {
  const e = new NonRenderError('background sync failed', {
    isSilent: true,
    metadata: { userMessage: 'Couldn’t sync — we’ll retry.' },
    cause: cause instanceof Error ? cause : undefined,
  });
  logger.error('sync failed', e);
  if (!e.isSilent) toast.error(e.metadata.userMessage as string);
}
```

> ❌ Do **not** `throw new NonRenderError(...)` — deprecated; removed in 3.0.

---

## Quick reference

| Situation | Tool | Mechanism |
|-----------|------|-----------|
| Expected/recoverable branch | `Result<T, E>` | return value, no throw |
| Render-path failure, user must see | `RenderError` (throw) | `OptiCoreErrorBoundary` → fallback |
| HTTP non-2xx | `ApiError` (thrown for you) | catch for `status`/`isRetryable`, else bubbles to boundary |
| Background/async, log only | `NonRenderError` (payload) | `logger.error(...)`, never thrown |
| Notify user without replacing screen | (none) | state update → re-render (e.g. a toast store) |

See also: [`docs/api/ERRORS.md`](api/ERRORS.md) · [`docs/FAQ.md`](FAQ.md).
