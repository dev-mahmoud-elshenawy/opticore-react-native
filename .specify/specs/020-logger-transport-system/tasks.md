# Tasks: Logger Transport System

**Spec**: 020 | **Branch**: `feature/020-logger-transport-system`

---

## Phase 1: Types & Interfaces [US1]

- [x] T001 [P] [US1] Create `src/infrastructure/logger/LogEntry.ts` — `LogEntry` type with level, message, timestamp, args, error?, metadata?
- [x] T002 [P] [US1] Create `src/infrastructure/logger/LogTransport.ts` — `LogTransport` interface with name, minLevel?, write(entry)
- [x] T003 [P] [US1] Create `src/infrastructure/logger/LogFormatter.ts` — `LogFormatter` interface with format(entry): string
- [x] T004 [US1] Run `npm run type-check` — verify 0 errors

**Checkpoint**: All type interfaces defined.

---

## Phase 2: ConsoleTransport [US1]

- [x] T005 [US1] Write tests in `test/infrastructure/logger/ConsoleTransport.test.ts` — platform detection (Metro vs device)
- [x] T006 [US1] Write tests — ANSI codes present in Metro/terminal, absent on device
- [x] T007 [US1] Write tests — respects minLevel filtering
- [x] T008 [US1] Write tests — handles error objects correctly
- [x] T009 [US1] Create `src/infrastructure/logger/ConsoleTransport.ts` — implement with `Platform.OS` detection
- [x] T010 [US1] Implement ANSI color logic: use colors only when `__DEV__` AND terminal environment
- [x] T011 [US1] Implement level-specific console methods (debug→console.log, info→console.info, etc.)
- [x] T012 [US1] Run ConsoleTransport tests — verify all pass

**Checkpoint**: ConsoleTransport works with platform detection.

---

## Phase 3: Logger Refactor [US1, US2]

- [x] T013 [US2] Write tests — `Logger.addTransport(mockTransport)` then log, verify mock receives entry
- [x] T014 [US2] Write tests — transport with `minLevel: ERROR` skips INFO messages
- [x] T015 [US2] Write tests — transport that throws doesn't affect other transports
- [x] T016 [US2] Write tests — `Logger.removeTransport()` prevents further delivery
- [x] T017 [US2] Write tests — no transports configured → auto-adds ConsoleTransport
- [x] T018 [US1] Modify `src/infrastructure/logger/Logger.ts` — add `private transports: LogTransport[]`
- [x] T019 [US1] Modify `print()` — build `LogEntry`, iterate transports, call `write()` with try/catch
- [x] T020 [US2] Add `addTransport(transport: LogTransport): void` method
- [x] T021 [US2] Add `removeTransport(name: string): boolean` method
- [x] T022 [US1] Auto-add `ConsoleTransport` when transports array is empty on first log
- [x] T023 [US1] Verify `configure()` still works (level, enabled, isProduction backward compat)
- [x] T024 [US1] Run all Logger tests — verify existing + new pass

**Checkpoint**: Logger delegates to pluggable transports.

---

## Phase 4: JsonFormatter [US3]

- [x] T025 [US3] Write tests in `test/infrastructure/logger/LogFormatter.test.ts` — JSON output format
- [x] T026 [US3] Write tests — error serialization (message + stack)
- [x] T027 [US3] Write tests — custom formatter integration with ConsoleTransport
- [x] T028 [US3] Implement `JsonFormatter` in `src/infrastructure/logger/LogFormatter.ts`
- [x] T029 [US3] Add optional `formatter` property to ConsoleTransport constructor
- [x] T030 [US3] Run tests — verify JSON output

**Checkpoint**: Structured logging available.

---

## Phase 5: Exports & Polish

- [x] T031 [P] Modify `src/infrastructure/logger/index.ts` — export LogTransport, LogEntry, LogFormatter, ConsoleTransport, JsonFormatter
- [x] T032 Verify `src/index.ts` infrastructure exports include new types
- [x] T033 Run full test suite: `npm test`
- [x] T034 Run `npm run type-check` — verify 0 errors
- [x] T035 Run `npm run lint` — verify 0 errors
- [x] T036 Verify coverage: 80%+ on all logger files

**Checkpoint**: Logger transport system complete.

---

## Dependencies

- Phase 1 → Phase 2 (types before ConsoleTransport)
- Phase 2 → Phase 3 (ConsoleTransport before Logger refactor uses it)
- Phase 3 → Phase 4 (Logger refactor before JsonFormatter)
- Phase 4 → Phase 5 (all implementation before polish)
