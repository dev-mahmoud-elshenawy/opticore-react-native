# React Query Integration

OptiCore integrates with [TanStack React Query](https://tanstack.com/query) as the recommended
server-state layer. As of **v2.0.0**, `@tanstack/react-query` is a **required peer dependency**
(install it once: `npx expo install @tanstack/react-query`).

OptiCore stays the **transport + error** layer (the `api` facade, `RenderError`/`ApiError`), and React
Query owns **caching, deduping, background refetch, and retries**. The glue is one helper:
`createQueryClient`.

---

## `createQueryClient(overrides?)`

```typescript
import { createQueryClient } from 'opticore-react-native';
```

Returns a `QueryClient` pre-wired with OptiCore-aware defaults:

| Default     | Value                   | Why                                                                        |
| ----------- | ----------------------- | -------------------------------------------------------------------------- |
| `staleTime` | `5 * 60 * 1000` (5 min) | Mobile data changes less often than a tab refresh; cuts redundant requests |
| `retry`     | **error-aware**         | Skips retries on actionable errors, retries transient ones                 |

### Error-aware retry

OptiCore surfaces failures as `RenderError` (and its subclass `ApiError`). A `RenderError` carries
`isActionable` — `true` when the user must fix something (most 4xx: bad input, unauthorized, not
found). Retrying those just wastes requests, so the default retry policy is:

```typescript
retry: (failureCount, error) => {
  if (error instanceof RenderError && error.isActionable) return false; // 4xx → don't retry
  return failureCount < 2; // transient → retry twice
};
```

### Everything is overridable

Your `QueryClientConfig` is merged on top (yours wins), so you can tune any default:

```typescript
// defaults
export const queryClient = createQueryClient();

// override only what you need
export const queryClient = createQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // always refetch
      gcTime: 10 * 60 * 1000, // keep unused data 10 min
      refetchOnWindowFocus: false, // mobile: don't refetch on refocus
    },
  },
});
```

### Overriding config for a single query

You rarely need a second `QueryClient`. React Query merges options by precedence — **later wins**, and
an override affects **only that one query**, never the global client:

`createQueryClient` defaults **<** `createQueryHook`'s 3rd `defaultOptions` arg **<** per-call options at the hook call site.

```typescript
import { isRetryable } from 'opticore-react-native';

// 1) Per call — affects just this usage:
const { data } = useThing(arg, { staleTime: 60_000 });

// 2) Per hook — bake defaults via createQueryHook's 3rd arg:
const useThing = createQueryHook((arg) => ['thing', arg], fetchThing, { staleTime: 60_000 });
```

> **Retry caveat.** Overriding `retry` with a plain number/boolean **drops** OptiCore's error-aware policy
> (never retry actionable 4xx, honor `Retry-After`). To keep it, compose with the exported helpers — both
> `isRetryable` and `retryDelay` are exported from the root barrel:
>
> ```typescript
> useThing(arg, { retry: (n, e) => isRetryable(e) && n < 5 });
> ```

Only spin up a **separate `QueryClient`** for a genuinely separate cache boundary — not for per-query tweaks.

---

## Wiring it up

`OptiCoreProvider` mounts the React Query provider for you, and its default client already uses
these OptiCore-aware defaults — so **nothing extra is needed** for the error-aware retry to apply:

```tsx
// app/_layout.tsx
import { OptiCoreProvider } from 'opticore-react-native';
import { opticoreConfig } from '@/core/opticore.config';

export default function RootLayout() {
  return (
    <OptiCoreProvider config={opticoreConfig}>
      <Stack />
    </OptiCoreProvider>
  );
}
```

To tune the defaults, set `config.query` (merged on top). To control the client fully (devtools,
persistence, a shared instance), pass your own via the `queryClient` prop — no second
`QueryClientProvider` needed:

```tsx
import { OptiCoreProvider, createQueryClient } from 'opticore-react-native';

const queryClient = createQueryClient({
  defaultOptions: { queries: { refetchOnReconnect: false } },
});

<OptiCoreProvider config={opticoreConfig} queryClient={queryClient}>
  <Stack />
</OptiCoreProvider>;

// …or declaratively, without a custom client:
// opticoreConfig.query = { defaultOptions: { queries: { staleTime: 0 } } };
```

> **Monorepo / `file:` link:** `withOptiCoreMetroConfig` forces `@tanstack/react-query` and
> `@tanstack/query-core` to resolve from the **app's** `node_modules`, so the app and OptiCore
> share one React Query instance (no "two QueryClients" / context mismatch). See the Metro section
> in the README.

---

## Recommended pattern — repository + query hook

Keep the data source behind a repository, wrap it in a query hook, and let UI consume the hook:

```typescript
// repository — the only place that knows the API shape. The api facade throws ApiError
// on any non-2xx status, so this only maps the successful (2xx) body.
import { api } from 'opticore-react-native';

export const repository = {
  getById: (id: string) => api.get<ResourceResponse>(`/resource/${id}`),
};

// query hook — caching/retry handled by the client defaults
export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => repository.getById(id),
  });
}
// (or the same in one line: createQueryHook((id) => ['resource', id], repository.getById))
```

In the UI, surface errors with [`toMessage`](./api/ERRORS.md#tomessageerror-fallback):

```tsx
const { data, isError, error, refetch } = useResource(id);
if (isError) return <Text>{toMessage(error)}</Text>;
```

## Helpers

**`createQueryHook(keyFn, fetcher, defaults?)`** — collapse the repository + key + `useQuery`
wiring into one definition:

```typescript
const useResource = createQueryHook(
  (id: string) => ['resource', id],
  (id) => repository.getById(id)
);
const { data, isLoading } = useResource('id-1');
```

**`useApiMutation(mutationFn, options?)`** — `useMutation` plus a ready-to-display `errorMessage`
(via `toMessage`):

```tsx
const save = useApiMutation((input: Input) => repository.create(input));
<Button onPress={() => save.mutate(input)} />;
{
  save.errorMessage && <Text>{save.errorMessage}</Text>;
}
```

**`createQueryPersister(key?)`** — persist/restore the query cache across restarts through OptiCore
storage (structural match for `@tanstack/react-query-persist-client`):

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client';
persistQueryClient({ queryClient, persister: createQueryPersister() });
```

---

**See also**:

- [Error Handling API](./api/ERRORS.md) — `RenderError`, `ApiError`, `toMessage`
- [Infrastructure API](./api/INFRASTRUCTURE.md) — `ApiClient`
- [Types](./TYPES.md) — `ApiResult`
