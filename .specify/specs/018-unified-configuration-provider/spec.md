# Feature Specification: Unified Configuration & Provider

**Spec Number**: 018
**Feature Branch**: `feature/018-unified-configuration-provider`
**Created**: 2026-02-11
**Status**: Draft
**Priority**: P0 (Critical for package usability)
**Input**: Code Review 2026-02-11, Section 16 - Dynamic Configurability Assessment

## Problem Statement

Currently, consuming apps must make **5+ separate initialization calls** across different singletons and compose **multiple JSX providers** manually. This fragments the "orchestra conductor" design intent. `CoreSetup.init()` only configures ApiClient and Logger, leaving Theme, Offline Sync, Forms, and Responsive hooks as separate manual setups.

**Current (fragmented) setup:**
```typescript
CoreSetup.getInstance().init({ api, logger });
ThemeManager.getInstance().configure({ defaultMode: 'dark' });
ThemeManager.getInstance().registerTheme('brand', myTheme);
await ThemeManager.getInstance().init();
OfflineSyncManager.getInstance().configure({ maxRetries: 5 });

<CoreProvider config={queryConfig}>
    <ThemeProvider>
        <App />
    </ThemeProvider>
</CoreProvider>
```

**Target (unified) setup:**
```typescript
<OptiCoreProvider config={{
    api: { baseURL: 'https://api.example.com' },
    logger: { level: LogLevel.INFO },
    theme: { defaultMode: 'dark', customThemes: { brand: myTheme } },
    offline: { enabled: true, maxRetries: 5 },
    responsive: { breakpoints: { small: 375, medium: 768, large: 1024 } },
}}>
    <App />
</OptiCoreProvider>
```

---

## User Scenarios & Testing

### User Story 1 - Unified CoreConfig Interface (Priority: P1)

A developer installing OptiCore for the first time passes a single configuration object that initializes ALL modules (API, Logger, Theme, Offline, Responsive, Forms, Error Classification).

**Why this priority**: This is the foundation. Without a unified config type, nothing else can be centralized.

**Independent Test**: Can be tested by passing a full config object to `CoreSetup.init()` and verifying each subsystem received its configuration.

**Acceptance Scenarios**:

1. **Given** a `CoreConfig` with `theme` property, **When** `CoreSetup.init(config)` is called, **Then** `ThemeManager` is configured with the provided theme settings.
2. **Given** a `CoreConfig` with `offline` property, **When** `CoreSetup.init(config)` is called, **Then** `OfflineSyncManager` is configured with the provided offline settings.
3. **Given** a `CoreConfig` with `responsive.breakpoints` property, **When** `CoreSetup.init(config)` is called, **Then** the breakpoints are stored and accessible to `useResponsive`.
4. **Given** a `CoreConfig` with `forms` property, **When** `CoreSetup.init(config)` is called, **Then** default phone format, currency options, and card patterns are available to masks.
5. **Given** a `CoreConfig` with `errorClassification.customRules`, **When** `CoreSetup.init(config)` is called, **Then** `ErrorClassifier` uses the custom rules in addition to defaults.
6. **Given** a `CoreConfig` with only `api` (minimum required), **When** `CoreSetup.init(config)` is called, **Then** all other modules use sensible defaults without errors.

---

### User Story 2 - Unified OptiCoreProvider (Priority: P1)

A developer wraps their app in a single `<OptiCoreProvider>` that composes QueryProvider, ThemeProvider, and initializes all singletons from one config prop.

**Why this priority**: The provider is the React integration point. Without it, developers still wire providers manually.

**Independent Test**: Render `<OptiCoreProvider config={fullConfig}><TestChild /></OptiCoreProvider>` and verify child can access theme context, query client, and connectivity state.

**Acceptance Scenarios**:

1. **Given** an `OptiCoreProvider` with full config, **When** a child component uses `useTheme()`, **Then** it receives the configured theme.
2. **Given** an `OptiCoreProvider` with full config, **When** a child component uses `useQueryClient()`, **Then** it receives a configured QueryClient.
3. **Given** an `OptiCoreProvider` with `enableConnectivity: true`, **When** the provider mounts, **Then** `ConnectivityManager` is initialized.
4. **Given** an `OptiCoreProvider` that unmounts, **When** cleanup runs, **Then** NO singletons are disposed (they may be shared), only listeners are removed.
5. **Given** an `OptiCoreProvider` with no config (empty object), **When** it renders, **Then** all modules use defaults and no errors occur.

---

### User Story 3 - Configuration Context for Hooks (Priority: P2)

Hooks like `useResponsive` read their configuration from a React context provided by `OptiCoreProvider`, rather than from hardcoded constants.

**Why this priority**: Hooks are consumed frequently; making them context-aware completes the dynamic chain.

**Independent Test**: Render `useResponsive` inside an `OptiCoreProvider` with custom breakpoints and verify the hook uses them.

**Acceptance Scenarios**:

1. **Given** custom breakpoints `{ small: 375, medium: 640, large: 1280 }` in config, **When** `useResponsive()` is called, **Then** it uses 375/640/1280 instead of default 360/768/1024.
2. **Given** no breakpoints in config, **When** `useResponsive()` is called, **Then** it uses defaults (360/768/1024).
3. **Given** `useResponsive()` is called outside of `OptiCoreProvider`, **When** rendered, **Then** it uses defaults without crashing.

---

### Edge Cases

- What happens when `CoreSetup.init()` is called multiple times? (Should merge/override, not duplicate listeners)
- What happens when `OptiCoreProvider` re-renders with new config? (Should update without re-initializing singletons)
- What happens when a module config is `undefined`? (Should skip initialization, use defaults)
- What happens when an invalid theme name is referenced? (Should fall back to default light/dark)

---

## Requirements

### Functional Requirements

- **FR-001**: `CoreConfig` interface MUST include optional properties for `theme`, `offline`, `responsive`, `forms`, `errorClassification`, and `interceptors`.
- **FR-002**: `CoreSetup.init()` MUST delegate configuration to each subsystem when its config section is present.
- **FR-003**: `CoreSetup.init()` MUST NOT fail when optional config sections are omitted.
- **FR-004**: `OptiCoreProvider` MUST compose `QueryProvider` and `ThemeProvider` internally.
- **FR-005**: `OptiCoreProvider` MUST call `CoreSetup.init()` on mount and clean up listeners on unmount.
- **FR-006**: `OptiCoreProvider` MUST NOT dispose singletons on unmount (they may outlive the provider).
- **FR-007**: A `ConfigContext` MUST expose runtime config (breakpoints, feature flags) to hooks via React context.
- **FR-008**: `useResponsive` MUST read breakpoints from `ConfigContext` when available, falling back to defaults.
- **FR-009**: Existing `CoreProvider` MUST be deprecated with a re-export alias to `OptiCoreProvider`.

### Key Entities

- **CoreConfig** (expanded): Single configuration interface for all modules
- **OptiCoreProvider**: Unified React provider component
- **ConfigContext**: React context for runtime configuration values
- **useConfig**: Hook to read from ConfigContext

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A consuming app can set up the entire OptiCore package with 1 config object and 1 provider wrapper.
- **SC-002**: Zero breaking changes to existing `CoreSetup.init()` calls (additive only).
- **SC-003**: All existing tests continue to pass.
- **SC-004**: New tests achieve 80%+ coverage on expanded CoreConfig, OptiCoreProvider, and ConfigContext.
- **SC-005**: `CoreProvider` remains functional as a deprecated alias.

---

## Dependencies

- Spec 010 (Configuration Interface) - extends CoreConfig
- Spec 008 (Core Providers) - replaces CoreProvider with OptiCoreProvider
- Spec 017 (Theme Infrastructure) - ThemeProvider composed inside OptiCoreProvider
- Spec 016 (Offline Sync Manager) - OfflineSyncManager configured from CoreConfig

## Files to Create/Modify

- `src/config/types.ts` - Expand CoreConfig interface
- `src/config/CoreSetup.ts` - Expand init() to delegate to all modules
- `src/providers/OptiCoreProvider.tsx` - New unified provider
- `src/providers/ConfigContext.tsx` - New React context for runtime config
- `src/providers/useConfig.ts` - New hook for config access
- `src/hooks/useResponsive.ts` - Read breakpoints from context
- `src/providers/index.ts` - Export new provider, deprecate old
- `src/index.ts` - Export new public APIs
- `test/providers/OptiCoreProvider.test.tsx` - Provider tests
- `test/config/CoreSetup.test.ts` - Expanded config tests
