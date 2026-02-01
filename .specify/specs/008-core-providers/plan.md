# Implementation Plan: Core Providers

**Branch**: `008-core-providers` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)

## Summary

Core Providers create React provider wrappers for easy app setup. QueryProvider wraps React Query with opinionated defaults. CoreProvider combines all opticore providers (QueryProvider, connectivity, lifecycle, state observers) into single wrapper component for simplified integration.

## Technical Context

**Language/Version**: TypeScript 5.9.2, React 18.2.0
**Primary Dependencies**: @tanstack/react-query ^5.90.18
**Testing**: Jest, React Native Testing Library
**Target Platform**: React Native 0.81+

## Constitution Check

- ✅ **Pure Infrastructure**: Provider wrappers only
- ✅ **TypeScript Strict Mode**: Full type safety
- ✅ **Zero Bugs**: Proper provider hierarchy

## Implementation Phases

### Phase 1: QueryProvider (P1)
React Query wrapper with defaults

### Phase 2: CoreProvider (P1)
Combined provider for all utilities

### Phase 3: Testing & Documentation
Provider tests and setup guide

## File Inventory

1. `src/providers/QueryProvider.tsx`
2. `src/providers/CoreProvider.tsx`
3. `src/providers/types.ts`
4. `src/providers/index.ts`
5. `tests/providers/*.test.tsx`

**Total**: 7 files
