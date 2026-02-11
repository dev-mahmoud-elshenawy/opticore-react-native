# Implementation Plan: Logger Transport System

**Branch**: `feature/020-logger-transport-system` | **Date**: 2026-02-11 | **Spec**: spec.md

## Summary

Replace the Logger's hardcoded `console.*` output with a pluggable transport system. Create `LogTransport` interface, `LogEntry` structured type, and a default `ConsoleTransport` that detects the platform and suppresses ANSI codes on iOS/Android devices. Allow consuming apps to add custom transports (Sentry, Datadog, file logging) via `Logger.addTransport()`. Fully backward compatible.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: React Native (Platform API for detection)
**Testing**: Jest ^29
**Target Platform**: iOS & Android

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| Pure Infrastructure | PASS | Logging is infrastructure |
| TypeScript Strict | PASS | Interfaces fully typed |
| TDD Required | PASS | Tests first |
| 80%+ Coverage | PASS | All new files |
| SOLID - DIP | FIX | Logger depends on console → now depends on LogTransport abstraction |
| SOLID - OCP | FIX | New transports without modifying Logger |

## Source Code Structure

```
src/infrastructure/logger/
├── Logger.ts              [MODIFY] Delegate to transports, add addTransport/removeTransport
├── LogTransport.ts        [NEW] Transport interface
├── LogEntry.ts            [NEW] Structured log entry type
├── ConsoleTransport.ts    [NEW] Default transport with platform detection
├── LogFormatter.ts        [NEW] Formatter interface + JsonFormatter
├── LogLevel.ts            [UNCHANGED]
├── interfaces/ILogger.ts  [UNCHANGED]
└── index.ts               [MODIFY] Export new types

test/infrastructure/logger/
├── Logger.test.ts         [MODIFY] Transport registration tests
├── ConsoleTransport.test.ts [NEW] Platform detection, ANSI tests
└── LogFormatter.test.ts   [NEW] JsonFormatter tests
```

## Approach

1. **LogTransport interface**: `{ name: string; minLevel?: LogLevel; write(entry: LogEntry): void }`. Simple, synchronous API.

2. **LogEntry type**: `{ level: LogLevel; message: string; timestamp: string; args: unknown[]; error?: Error; metadata?: Record<string, unknown> }`.

3. **ConsoleTransport**: Default transport. Uses `Platform.OS` to detect iOS/Android device vs Metro bundler. ANSI codes only when `__DEV__` AND running in Metro (heuristic: check `global.__METRO_GLOBAL_PREFIX__` or similar). Falls back to plain text on device.

4. **Logger refactor**: `private transports: LogTransport[]` array. `print()` method iterates transports and calls `write()`. If no transports configured, auto-adds `ConsoleTransport`. `addTransport()` / `removeTransport()` for runtime management. Each transport's `write()` is wrapped in try/catch to isolate failures.

5. **LogFormatter**: Optional interface `{ format(entry: LogEntry): string }`. `ConsoleTransport` uses it if provided. `JsonFormatter` produces structured JSON output.

6. **Backward compat**: `Logger.configure({ level, enabled, isProduction })` still works. `isProduction: true` still suppresses all output. Existing test assertions against console.log/warn/error continue to pass because ConsoleTransport still calls them.
