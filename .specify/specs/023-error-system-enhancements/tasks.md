# Tasks: Error System Enhancements

**Spec**: 023 | **Branch**: `feature/023-error-system-enhancements`

---

## Phase 1: Extensible ErrorClassifier [US1]

- [ ] T001 [US1] Create `src/error/ClassificationRule.ts` — `ClassificationRule` interface
- [ ] T002 [US1] Write test: custom rule classifies 429 as NonRenderError (overriding default RenderError for 4xx)
- [ ] T003 [US1] Write test: custom rules take precedence over defaults
- [ ] T004 [US1] Write test: error matching no custom rules falls through to defaults
- [ ] T005 [US1] Write test: broken custom rule (match throws) skips to next rule
- [ ] T006 [US1] Write test: `ErrorClassifier.addRule()` and `ErrorClassifier.clearCustomRules()`
- [ ] T007 [US1] Modify `src/error/ErrorClassifier.ts` — add `private static customRules: ClassificationRule[]`
- [ ] T008 [US1] Add `static addRule(rule: ClassificationRule): void` method
- [ ] T009 [US1] Add `static clearCustomRules(): void` method (for testing)
- [ ] T010 [US1] Modify `classify()` — iterate custom rules first, then existing logic
- [ ] T011 [US1] Run tests — verify custom rules + existing classification tests pass

**Checkpoint**: ErrorClassifier extensible with custom rules.

---

## Phase 2: Result<T, E> Pattern [US2]

- [ ] T012 [P] [US2] Create `src/error/Result.ts` — `Ok<T>`, `Err<E>`, `Result<T, E>` types
- [ ] T013 [US2] Write test: `Result.ok(42).isOk()` → true, `isErr()` → false
- [ ] T014 [US2] Write test: `Result.ok(42).unwrap()` → 42
- [ ] T015 [US2] Write test: `Result.err(new Error('fail')).unwrap()` → throws
- [ ] T016 [US2] Write test: `Result.ok(42).map(x => x * 2)` → `Result.ok(84)`
- [ ] T017 [US2] Write test: `Result.err(e).map(...)` → still `Result.err(e)`
- [ ] T018 [US2] Write test: `Result.ok(42).unwrapOr(0)` → 42, `Result.err(e).unwrapOr(0)` → 0
- [ ] T019 [US2] Write test: `Result.ok(42).flatMap(x => Result.ok(x + 1))` → `Result.ok(43)`
- [ ] T020 [US2] Implement `Ok<T>` class with isOk, isErr, unwrap, unwrapOr, map, flatMap, mapErr
- [ ] T021 [US2] Implement `Err<E>` class with isOk, isErr, unwrap, unwrapOr, map, flatMap, mapErr
- [ ] T022 [US2] Implement `Result.ok()` and `Result.err()` static constructors
- [ ] T023 [US2] Run Result tests — verify all pass

**Checkpoint**: Result<T,E> pattern complete.

---

## Phase 3: OptiCoreErrorBoundary [US3]

- [ ] T024 [US3] Create `src/error/DefaultErrorFallback.tsx` — simple View + Text + "Try Again" button
- [ ] T025 [US3] Write test: child throws RenderError → fallback shown with userMessage
- [ ] T026 [US3] Write test: child throws NonRenderError → error logged, no fallback
- [ ] T027 [US3] Write test: child throws unclassified Error → ErrorClassifier.classify() called
- [ ] T028 [US3] Write test: custom fallback prop receives error + resetError function
- [ ] T029 [US3] Write test: `resetError()` clears error state, re-renders children
- [ ] T030 [US3] Write test: `onError` callback called for any caught error
- [ ] T031 [US3] Create `src/error/OptiCoreErrorBoundary.tsx` — class component with getDerivedStateFromError + componentDidCatch
- [ ] T032 [US3] Implement classification logic in getDerivedStateFromError
- [ ] T033 [US3] Implement Logger integration in componentDidCatch for NonRenderErrors
- [ ] T034 [US3] Implement `resetError` method that clears state
- [ ] T035 [US3] Run ErrorBoundary tests — verify all pass

**Checkpoint**: ErrorBoundary classifies and handles errors.

---

## Phase 4: Exports & Polish

- [ ] T036 [P] Modify `src/error/index.ts` — export ClassificationRule, Result, OptiCoreErrorBoundary, DefaultErrorFallback
- [ ] T037 [P] Verify `src/index.ts` error exports include new types
- [ ] T038 Run full test suite: `npm test`
- [ ] T039 Run `npm run type-check` — verify 0 errors
- [ ] T040 Run `npm run lint` — verify 0 errors
- [ ] T041 Verify coverage: 80%+ on all error files

**Checkpoint**: Error system enhancements complete.

---

## Dependencies

- Phase 1 independent (can start immediately)
- Phase 2 independent (can run parallel with Phase 1)
- Phase 3 depends on Phase 1 (ErrorBoundary uses ErrorClassifier)
- All → Phase 4
