# Implementation Plan: Utility Functions

**Branch**: `007-utility-functions` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)

## Summary

Utility Functions provide pure, tree-shakable helper functions organized by domain (string, number, date, array, object, color, formatters, helpers). These replace Flutter-style extensions with importable functions. All utilities handle edge cases safely, integrate with TypeScript for type inference, and are fully tested.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (strict mode)
**Primary Dependencies**:

- date-fns ^3.3.1 (date utilities)
- @react-native-clipboard/clipboard (clipboard)
- react-native-device-info (device helpers)

**Testing**: Jest ^29.7.0
**Target Platform**: React Native 0.81+, Expo SDK 54+
**Project Type**: npm package (library)
**Performance Goals**: All utilities pure functions, < 1ms execution
**Constraints**: Tree-shakable exports, zero side effects

## Constitution Check

- ✅ **Pure Infrastructure**: Utility functions only
- ✅ **TypeScript Strict Mode**: Full type safety
- ✅ **SOLID Principles**: Single responsibility per utility
- ✅ **Zero Bugs**: Safe null handling
- ✅ **Test-Driven**: 80%+ coverage

## Implementation Phases

### Phase 1: String & Number Utilities (P1)

Core text and numeric operations

### Phase 2: Date & Array Utilities (P1)

Date formatting and array operations

### Phase 3: Object & Color Utilities (P2)

Object manipulation and color utilities

### Phase 4: Formatters & Helpers (P2)

Phone, currency formatters and device helpers

### Phase 5: Testing & Documentation

Comprehensive tests and examples

## File Structure

**Flat File Organization** (React Native Best Practice):

```
src/utils/
├── index.ts           // Re-export all utilities
├── string.ts          // All string utilities (capitalize, truncate, etc.)
├── string.test.ts     // String utility tests
├── number.ts          // All number utilities (toInt, clamp, etc.)
├── number.test.ts     // Number utility tests
├── date.ts            // All date utilities (formatDate, timeAgo, etc.)
├── date.test.ts       // Date utility tests
├── array.ts           // All array utilities (groupBy, unique, etc.)
├── array.test.ts      // Array utility tests
├── object.ts          // All object utilities (get, deepMerge, etc.)
├── object.test.ts     // Object utility tests
├── color.ts           // All color utilities
├── color.test.ts      // Color utility tests
├── format.ts          // All formatters (phone, currency, percentage)
├── format.test.ts     // Formatter tests
├── platform.ts        // Device, permissions, platform checks
└── platform.test.ts   // Platform utility tests
```

**Total**: 16 files (8 implementation + 8 test files)

**Rationale**:

- Follows React Native community standards (react-native-reanimated, zustand, @react-navigation)
- Easier navigation and discoverability
- Better tree-shaking support
- Simpler import paths
- Mirrors how Dart/Flutter organizes utilities in single files
- Faster module resolution with fewer directories
