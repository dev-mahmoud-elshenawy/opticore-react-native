# Tasks: Error System Enhancements

**Spec**: 023 | **Branch**: `feature/023-error-system-enhancements`

---

## Phase 1: Extensible ErrorClassifier [US1]

- [x] T001 [US1] Create `src/error/ClassificationRule.ts` — `ClassificationRule` interface
- [x] T002 [US1] Write test: custom rule classifies 429 as NonRenderError (overriding default RenderError for 4xx)
- [x] T003 [US1] Write test: custom rules take precedence over defaults
- [x] T004 [US1] Write test: error matching no custom rules falls through to defaults
- [x] T005 [US1] Write test: broken custom rule (match throws) skips to next rule
- [x] T006 [US1] Write test: `ErrorClassifier.addRule()` and `ErrorClassifier.clearCustomRules()`
- [x] T007 [US1] Modify `src/error/ErrorClassifier.ts` — add `private static customRules: ClassificationRule[]`
- [x] T008 [US1] Add `static addRule(rule: ClassificationRule): void` method
- [x] T009 [US1] Add `static clearCustomRules(): void` method (for testing)
- [x] T010 [US1] Modify `classify()` — iterate custom rules first, then existing logic
- [x] T011 [US1] Run tests — verify custom rules + existing classification tests pass

**Checkpoint**: ErrorClassifier extensible with custom rules.

---

## Phase 2: Result<T, E> Pattern [US2]

- [x] T012 [P] [US2] Create `src/error/Result.ts` — `Ok<T>`, `Err<E>`, `Result<T, E>` types
- [x] T013 [US2] Write test: `Result.ok(42).isOk()` → true, `isErr()` → false
- [x] T014 [US2] Write test: `Result.ok(42).unwrap()` → 42
- [x] T015 [US2] Write test: `Result.err(new Error('fail')).unwrap()` → throws
- [x] T016 [US2] Write test: `Result.ok(42).map(x => x * 2)` → `Result.ok(84)`
- [x] T017 [US2] Write test: `Result.err(e).map(...)` → still `Result.err(e)`
- [x] T018 [US2] Write test: `Result.ok(42).unwrapOr(0)` → 42, `Result.err(e).unwrapOr(0)` → 0
- [x] T019 [US2] Write test: `Result.ok(42).flatMap(x => Result.ok(x + 1))` → `Result.ok(43)`
- [x] T020 [US2] Implement `Ok<T>` class with isOk, isErr, unwrap, unwrapOr, map, flatMap, mapErr
- [x] T021 [US2] Implement `Err<E>` class with isOk, isErr, unwrap, unwrapOr, map, flatMap, mapErr
- [x] T022 [US2] Implement `Result.ok()` and `Result.err()` static constructors
- [x] T023 [US2] Run Result tests — verify all pass

**Checkpoint**: Result<T,E> pattern complete.

---

## Phase 3: OptiCoreErrorBoundary [US3]

- [x] T024 [US3] Create `src/error/DefaultErrorFallback.tsx` — simple View + Text + "Try Again" button
- [x] T025 [US3] Write test: child throws RenderError → fallback shown with userMessage
- [x] T026 [US3] Write test: child throws NonRenderError → error logged, no fallback
- [x] T027 [US3] Write test: child throws unclassified Error → ErrorClassifier.classify() called
- [x] T028 [US3] Write test: custom fallback prop receives error + resetError function
- [x] T029 [US3] Write test: `resetError()` clears error state, re-renders children
- [x] T030 [US3] Write test: `onError` callback called for any caught error
- [x] T031 [US3] Create `src/error/OptiCoreErrorBoundary.tsx` — class component with getDerivedStateFromError + componentDidCatch
- [x] T032 [US3] Implement classification logic in getDerivedStateFromError
- [x] T033 [US3] Implement Logger integration in componentDidCatch for NonRenderErrors
- [x] T034 [US3] Implement `resetError` method that clears state
- [x] T035 [US3] Run ErrorBoundary tests — verify all pass

**Checkpoint**: ErrorBoundary classifies and handles errors.

---

## Phase 4: Exports & Polish

- [x] T036 [P] Modify `src/error/index.ts` — export ClassificationRule, Result, OptiCoreErrorBoundary, DefaultErrorFallback
- [x] T037 [P] Verify `src/index.ts` error exports include new types
- [x] T038 Run full test suite: `npm test`
- [x] T039 Run `npm run type-check` — verify 0 errors
- [x] T040 Run `npm run lint` — verify 0 errors
- [x] T041 Verify coverage: 80%+ on all error files

**Checkpoint**: Error system enhancements complete.

---

## Dependencies

- Phase 1 independent (can start immediately)
- Phase 2 independent (can run parallel with Phase 1)
- Phase 3 depends on Phase 1 (ErrorBoundary uses ErrorClassifier)
- All → Phase 4
