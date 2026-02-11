# Tasks: Logger Transport System

**Spec**: 020 | **Branch**: `feature/020-logger-transport-system`

---

## Phase 1: Types & Interfaces [US1]

- [ ] T001 [P] [US1] Create `src/infrastructure/logger/LogEntry.ts` — `LogEntry` type with level, message, timestamp, args, error?, metadata?
- [ ] T002 [P] [US1] Create `src/infrastructure/logger/LogTransport.ts` — `LogTransport` interface with name, minLevel?, write(entry)
- [ ] T003 [P] [US1] Create `src/infrastructure/logger/LogFormatter.ts` — `LogFormatter` interface with format(entry): string
- [ ] T004 [US1] Run `npm run type-check` — verify 0 errors

**Checkpoint**: All type interfaces defined.

---

## Phase 2: ConsoleTransport [US1]

- [ ] T005 [US1] Write tests in `test/infrastructure/logger/ConsoleTransport.test.ts` — platform detection (Metro vs device)
- [ ] T006 [US1] Write tests — ANSI codes present in Metro/terminal, absent on device
- [ ] T007 [US1] Write tests — respects minLevel filtering
- [ ] T008 [US1] Write tests — handles error objects correctly
- [ ] T009 [US1] Create `src/infrastructure/logger/ConsoleTransport.ts` — implement with `Platform.OS` detection
- [ ] T010 [US1] Implement ANSI color logic: use colors only when `__DEV__` AND terminal environment
- [ ] T011 [US1] Implement level-specific console methods (debug→console.log, info→console.info, etc.)
- [ ] T012 [US1] Run ConsoleTransport tests — verify all pass

**Checkpoint**: ConsoleTransport works with platform detection.

---

## Phase 3: Logger Refactor [US1, US2]

- [ ] T013 [US2] Write tests — `Logger.addTransport(mockTransport)` then log, verify mock receives entry
- [ ] T014 [US2] Write tests — transport with `minLevel: ERROR` skips INFO messages
- [ ] T015 [US2] Write tests — transport that throws doesn't affect other transports
- [ ] T016 [US2] Write tests — `Logger.removeTransport()` prevents further delivery
- [ ] T017 [US2] Write tests — no transports configured → auto-adds ConsoleTransport
- [ ] T018 [US1] Modify `src/infrastructure/logger/Logger.ts` — add `private transports: LogTransport[]`
- [ ] T019 [US1] Modify `print()` — build `LogEntry`, iterate transports, call `write()` with try/catch
- [ ] T020 [US2] Add `addTransport(transport: LogTransport): void` method
- [ ] T021 [US2] Add `removeTransport(name: string): boolean` method
- [ ] T022 [US1] Auto-add `ConsoleTransport` when transports array is empty on first log
- [ ] T023 [US1] Verify `configure()` still works (level, enabled, isProduction backward compat)
- [ ] T024 [US1] Run all Logger tests — verify existing + new pass

**Checkpoint**: Logger delegates to pluggable transports.

---

## Phase 4: JsonFormatter [US3]

- [ ] T025 [US3] Write tests in `test/infrastructure/logger/LogFormatter.test.ts` — JSON output format
- [ ] T026 [US3] Write tests — error serialization (message + stack)
- [ ] T027 [US3] Write tests — custom formatter integration with ConsoleTransport
- [ ] T028 [US3] Implement `JsonFormatter` in `src/infrastructure/logger/LogFormatter.ts`
- [ ] T029 [US3] Add optional `formatter` property to ConsoleTransport constructor
- [ ] T030 [US3] Run tests — verify JSON output

**Checkpoint**: Structured logging available.

---

## Phase 5: Exports & Polish

- [ ] T031 [P] Modify `src/infrastructure/logger/index.ts` — export LogTransport, LogEntry, LogFormatter, ConsoleTransport, JsonFormatter
- [ ] T032 Verify `src/index.ts` infrastructure exports include new types
- [ ] T033 Run full test suite: `npm test`
- [ ] T034 Run `npm run type-check` — verify 0 errors
- [ ] T035 Run `npm run lint` — verify 0 errors
- [ ] T036 Verify coverage: 80%+ on all logger files

**Checkpoint**: Logger transport system complete.

---

## Dependencies

- Phase 1 → Phase 2 (types before ConsoleTransport)
- Phase 2 → Phase 3 (ConsoleTransport before Logger refactor uses it)
- Phase 3 → Phase 4 (Logger refactor before JsonFormatter)
- Phase 4 → Phase 5 (all implementation before polish)
