# Feature Specification: Logger Transport System

**Spec Number**: 020
**Feature Branch**: `feature/020-logger-transport-system`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P1
**Input**: Code Review 2026-02-11, Sections 3 (ANSI colors), 14D (Dependency Inversion), 16B (Logger no transports)

## Problem Statement

The Logger currently:
1. **Hardcodes ANSI escape codes** (`\x1b[31m`) that render as raw text in React Native device logs (Logcat/Xcode Console don't interpret ANSI).
2. **Only outputs to `console.*`** - no way to add Sentry, Datadog, Crashlytics, or file-based logging.
3. **Violates Dependency Inversion** - directly depends on `console` instead of an abstraction.
4. **Has no custom formatter** - log format is hardcoded (`[LEVEL] [timestamp] message`).

---

## User Scenarios & Testing

### User Story 1 - LogTransport Interface & ConsoleTransport (Priority: P1)

Logger accepts an array of transport implementations. A default `ConsoleTransport` replaces the hardcoded `console.*` calls. ConsoleTransport detects the platform and uses ANSI colors only when running in a terminal (Node.js/Metro bundler), not on device.

**Why this priority**: Fixes the ANSI bug and establishes the transport architecture.

**Independent Test**: Create Logger with MockTransport, log a message, verify transport received the structured log entry.

**Acceptance Scenarios**:

1. **Given** a Logger with `ConsoleTransport`, **When** `logger.info('hello')` is called in Metro bundler, **Then** output includes ANSI color codes.
2. **Given** a Logger with `ConsoleTransport`, **When** `logger.info('hello')` is called on iOS device, **Then** output has NO ANSI escape codes.
3. **Given** a Logger with a custom `SentryTransport`, **When** `logger.error('crash', error)` is called, **Then** both ConsoleTransport AND SentryTransport receive the log entry.
4. **Given** a Logger with no transports configured, **When** any log method is called, **Then** it uses `ConsoleTransport` as default.

---

### User Story 2 - Custom Transport Registration (Priority: P1)

Consuming apps can add custom transports via `Logger.addTransport()` or via `CoreConfig.logger.transports`.

**Why this priority**: This is the primary extensibility point for production logging.

**Independent Test**: Register a mock transport, log messages at various levels, verify the transport received correct entries.

**Acceptance Scenarios**:

1. **Given** `Logger.addTransport(new SentryTransport())`, **When** `logger.error()` is called, **Then** SentryTransport receives the log entry.
2. **Given** a transport with `minLevel: LogLevel.ERROR`, **When** `logger.info()` is called, **Then** the transport does NOT receive the entry.
3. **Given** a transport that throws an error, **When** logging occurs, **Then** other transports still receive the log (error is caught silently).
4. **Given** `Logger.removeTransport(transport)`, **When** `logger.info()` is called, **Then** the removed transport does NOT receive the entry.

---

### User Story 3 - Log Formatter (Priority: P2)

Transports can optionally accept a `LogFormatter` that controls the output shape (plain text, JSON structured, custom format).

**Why this priority**: Nice-to-have for structured logging in production, but ConsoleTransport works without it.

**Independent Test**: Create a `JsonFormatter`, attach to transport, verify log output is valid JSON.

**Acceptance Scenarios**:

1. **Given** a transport with `JsonFormatter`, **When** `logger.error('fail', error)` is called, **Then** output is `{"level":"ERROR","message":"fail","timestamp":"...","error":{"message":"...","stack":"..."}}`.
2. **Given** a transport with default formatter, **When** logging occurs, **Then** output matches current plain text format.
3. **Given** a transport with a custom formatter, **When** logging occurs, **Then** the formatter's `format()` method is called with the log entry.

---

### Edge Cases

- What happens when all transports are removed? (Fall back to console.log)
- What happens when a transport's `write()` is async? (Don't await, fire and forget)
- What happens when Logger is in production mode? (No transports receive entries, regardless of their config)
- What happens when `isProduction: true` but a transport has `ignoreProductionMode: true`? (Transport still receives for error reporting services)

---

## Requirements

### Functional Requirements

- **FR-001**: Logger MUST accept an array of `LogTransport` implementations.
- **FR-002**: `LogTransport` interface MUST define `write(entry: LogEntry): void`, `minLevel?: LogLevel`, `name: string`.
- **FR-003**: `ConsoleTransport` MUST be the default transport when none are configured.
- **FR-004**: `ConsoleTransport` MUST detect platform and suppress ANSI codes on iOS/Android device.
- **FR-005**: `Logger.addTransport()` and `Logger.removeTransport()` MUST allow runtime transport management.
- **FR-006**: Transport errors MUST be caught and not affect other transports or the calling code.
- **FR-007**: `LogEntry` MUST include: `level`, `message`, `timestamp`, `args`, `error?`, `metadata?`.
- **FR-008**: `LogFormatter` interface MUST define `format(entry: LogEntry): string`.
- **FR-009**: Logger `configure()` MUST still support `level`, `enabled`, `isProduction` as before (backward compatible).
- **FR-010**: `CoreConfig.logger.transports` MUST accept transport instances for unified configuration (Spec 018).

### Key Entities

- **LogTransport**: Interface for log output destinations
- **ConsoleTransport**: Default console output (platform-aware)
- **LogEntry**: Structured log data passed to transports
- **LogFormatter**: Optional formatting interface
- **JsonFormatter**: Built-in JSON structured formatter

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: ANSI escape codes never appear in iOS/Android device logs.
- **SC-002**: Custom transports receive log entries correctly filtered by level.
- **SC-003**: Existing `Logger` API is 100% backward compatible (no breaking changes).
- **SC-004**: 80%+ test coverage on Logger, ConsoleTransport, LogEntry.
- **SC-005**: All existing Logger tests continue to pass.

---

## Files to Create/Modify

- `src/infrastructure/logger/LogTransport.ts` - Transport interface
- `src/infrastructure/logger/LogEntry.ts` - Structured log entry type
- `src/infrastructure/logger/ConsoleTransport.ts` - Default transport (platform-aware)
- `src/infrastructure/logger/LogFormatter.ts` - Formatter interface + JsonFormatter
- `src/infrastructure/logger/Logger.ts` - Refactor to use transports
- `src/infrastructure/logger/index.ts` - Export new types
- `test/infrastructure/logger/ConsoleTransport.test.ts` - Platform detection tests
- `test/infrastructure/logger/Logger.test.ts` - Transport registration tests
