# Implementation Plan: Consumer Integration Fixes

**Spec**: [spec.md](./spec.md)
**Created**: 2026-06-08
**Target version**: 1.2.0 (additive + one documented breaking import-path change)

## Technical Approach

### ① + ② Decouple expo-router (P1)

**Root cause**: `src/navigation/RouteHelper.ts` top-level-imports `expo-router`, and
`src/index.ts` re-exports `./navigation` from the main barrel, so every consumer's bundle
resolves expo-router; the peer is also non-optional → install conflict.

**Changes**:
1. `src/index.ts`: remove `export * from './navigation';`.
2. `package.json` `exports`: add
   ```json
   "./navigation": {
     "types": "./dist/navigation/index.d.ts",
     "import": "./dist/navigation/index.js",
     "require": "./dist/navigation/index.js"
   }
   ```
3. `package.json` `peerDependenciesMeta`: add `"expo-router": { "optional": true }`.
4. `RouteHelper.ts`: keep the `expo-router` import (only bundled when the subpath is imported).
   Optionally add a guarded require with a clear error message if expo-router is missing.
5. Verify `files`/`typesVersions` (if any) include the navigation subpath types.

**Why subpath, not lazy-require in the barrel**: Metro statically resolves both `import` and
`require('expo-router')`; the only way a non-expo-router app builds is to never bundle the
module. Opt-in subpath achieves that. This is the same "optional dependency" philosophy as the
v1.1.0 native-adapter system.

**Breaking change**: consumers importing `useRouteHelper` from the main entry must switch to
`opticore-react-native/navigation`. Documented in CHANGELOG + MIGRATION.

### ③ Docs ↔ enum-based request() API (P1)

**Decision (user)**: keep `get/post/put/delete/patch` **private**; the public API is the
enum-based `request({ method: HttpMethod.X, url, data?, headers? })`. Fix the **docs**, not the
code.

**Changes**:
1. Update docs that use `apiClient.get()/post()/put()/delete()` to the enum form, e.g.
   `await apiClient.request({ method: HttpMethod.GET, url: '/users' })`.
   Files: `docs/MIGRATION.md`, `docs/TESTING.md`, `docs/TYPES.md`, `docs/api/STATE.md`,
   `docs/api/ERRORS.md`, and any README network examples.
2. Add a `test-d` type test asserting `request()` is callable for each `HttpMethod` and returns
   `ApiResponse<T>`.
3. No source change to `ApiClient` verb visibility.

### ④ Synchronous provider init ordering (P1)

**Root cause**: `OptiCoreProvider` configures singletons in `useEffect`; child effects run
before parent effects, so early API calls see an unconfigured client.

**Changes**:
1. `OptiCoreProvider.tsx`: move the synchronous configuration (StorageManager.configure,
   configurePlatformAdapters, CoreSetup.init, ConnectivityManager.configure) out of `useEffect`
   into a render-phase, ref-guarded block that runs once before children render:
   ```tsx
   const setupRef = useRef(false);
   if (!setupRef.current) {
     StorageManager.getInstance().configure({ ... });
     configurePlatformAdapters({ ... });
     CoreSetup.getInstance().init(config);
     if (enableConnectivity) ConnectivityManager.getInstance().configure(resolvedAdapters.connectivity);
     setupRef.current = true;
   }
   ```
2. Keep disposal (connectivity.dispose / lifecycle.dispose) in `useEffect` cleanup.
3. Guard against StrictMode double-invoke (ref + idempotent `configure`/`init`).
4. `CoreSetup`: add public `isInitialized(): boolean`.

**React correctness note**: render-phase side effects on module singletons are acceptable when
idempotent and guarded; this is the established pattern for "configure before children render".

### Test strategy

- **① / ②**: a test asserting the main barrel (`src/index.ts`) exports do not include
  navigation symbols; a test importing `../../src/navigation` works with the mocked router.
  (Bundle-level "0 expo-router refs" is validated manually in a consumer app.)
- **③**: tsd type-test for `request()` across `HttpMethod`; confirm verb methods are not on the
  public type.
- **④**: a test rendering `OptiCoreProvider` with a child that reads `CoreSetup.isInitialized()`
  during its mount effect → expects `true`; idempotency across re-render; disposal on unmount.
- Run full `npm run validate` (type-check, lint, format optional, tests) + `npm run build`.

## File Change Summary

| File | Change |
|---|---|
| `src/index.ts` | remove `export * from './navigation'` |
| `package.json` | add `./navigation` export; `expo-router` optional peer; bump 1.2.0 |
| `src/navigation/RouteHelper.ts` | (optional) guarded require + helpful error |
| `src/config/CoreSetup.ts` | add `isInitialized()` |
| `src/providers/OptiCoreProvider.tsx` | render-phase, ref-guarded setup; dispose in effect |
| `docs/*`, `README.md` | enum-based `request()` examples; navigation subpath import |
| `test/**` | navigation barrel test, request() type-test, provider-init test |
| `CHANGELOG.md` | 1.2.0 entry with migration note |

## Migration Notes (for consumers)

- **Navigation**: `import { useRouteHelper } from 'opticore-react-native'` →
  `import { useRouteHelper } from 'opticore-react-native/navigation'`. Install `expo-router`
  only if you use this subpath.
- **Network**: use `apiClient.request({ method: HttpMethod.GET, url })` (the verb methods are
  internal).

## Risks

- Subpath move is breaking for current barrel importers of `useRouteHelper` → mitigated by
  CHANGELOG/MIGRATION note and a minor bump (acceptable for a young 1.x package).
- Render-phase setup under StrictMode → mitigated by ref guard + idempotent configure/init.
