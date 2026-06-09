# Tasks: Consumer Integration Fixes

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

Each task ≤ 30 min. Order: ① → ④ → ③ → docs → validate.

## ① + ② Decouple expo-router (P1)

- [x] T01 Remove `export * from './navigation';` from `src/index.ts`.
- [x] T02 Add `./navigation` subpath to `package.json` `exports` (types/import/require).
- [x] T03 Add `"expo-router": { "optional": true }` to `peerDependenciesMeta`.
- [~] T04 (Optional) SKIPPED — Metro resolves `require()` targets at bundle time regardless of
      try/catch, so a guard can't improve the build-time experience; static import is correct
      now that navigation is subpath-only.
- [x] T05 Test: `test/index.test.ts` asserts main-barrel excludes `useRouteHelper`; removed the
      now-unneeded `jest.mock('expo-router')` (proof the barrel no longer pulls it in).

## ④ Synchronous provider init ordering (P1)

- [x] T06 Add `public isInitialized(): boolean` to `CoreSetup`.
- [x] T07 Refactor `OptiCoreProvider` to run setup in a ref-guarded render-phase block before
      children; disposal kept in `useEffect` cleanup.
- [x] T08 Idempotency via ref guard + idempotent configure/init (StrictMode-safe).
- [x] T09 Test: child captures `mockInit` call count during its render → init ran exactly once
      before children render; plus `CoreSetup.isInitialized()` false→true unit tests.

## ③ Docs ↔ enum-based request() API (P1)

- [x] T10 Replaced ALL real `apiClient.*` AND `ApiClient.getInstance().*` verb calls with the
      enum `request({ method: HttpMethod.X, ... })` form. First pass missed the
      `ApiClient.getInstance().get<…>()` form; a full re-sweep fixed **27 calls across 9 files**
      (README, MIGRATION, QUICK_START, FORMS, FAQ, ARCHITECTURE, api/HOOKS, api/STATE, api/ERRORS),
      adding `HttpMethod` imports to 17 code blocks. Verified: grep for verb calls on an OptiCore
      ApiClient returns zero; every file using `HttpMethod` imports it. Axios "before" snippets +
      generic non-OptiCore `api.*` left as-is by design.
- [x] T11 Added `test/types/ApiClient.test-d.ts` asserting `request()` returns `ApiResponse<T>`
      for each `HttpMethod`. (Private-verb `expectError` lines omitted — they break plain `tsc`;
      TS already enforces privacy. NOTE: `npm run test:types`/tsd is pre-existing misconfigured —
      looks for `dist/index.test-d.ts`; the file is still type-checked under `tsc`.)

## Docs / README

- [x] T12 README + `docs/api/NAVIGATION.md` use the `opticore-react-native/navigation` subpath +
      optional-`expo-router` note.
- [x] T13 CHANGELOG: added `🚧 Unreleased` section (version intentionally not bumped).

## Validation & Release

- [x] T14 `type-check` 0 errors, `lint` 0 errors, `npm test` 651 passing (84 suites), `build`
      clean. (`format:check` = pre-existing repo-wide debt, deferred; `test:types`/tsd pre-existing
      misconfig, noted.)
- [~] T15 DEFERRED per user — no version bump yet (more changes pending); stays at 1.1.2.
- [x] T16 Updated root `CLAUDE.md` (navigation subpath in exports list; optional expo-router peer).
- [x] T17 Spec 028 Status: Implemented (release pending).
