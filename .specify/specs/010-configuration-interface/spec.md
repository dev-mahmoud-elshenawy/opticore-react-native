# Feature Specification: Configuration Interface

**Feature Branch**: `010-configuration-interface`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Build CoreConfig interface allowing consuming apps to configure opticore: API base URL, auth token callback, logger level, storage keys, theme config, maintenance mode, offline mode, error handlers"

## User Scenarios & Testing

### User Story 1 - Developer Configures Core Package (Priority: P1)

A developer installing opticore wants single configuration object to set API base URL, auth token, logger level, and error handlers without configuring each module separately.

**Why this priority**: Configuration is critical for package usability - must be simple and centralized.

**Independent Test**: Pass CoreConfig to CoreSetup, verify all modules configured correctly.

**Acceptance Scenarios**:

1. **Given** CoreConfig with apiBaseURL, **When** ApiClient is used, **Then** all requests use configured base URL
2. **Given** CoreConfig with logLevel='error', **When** Logger is used, **Then** only error logs show
3. **Given** CoreConfig with onError handler, **When** global error occurs, **Then** custom handler executes
4. **Given** CoreConfig with authToken callback, **When** API call is made, **Then** token is injected

---

### User Story 2 - Developer Enables Special Modes (Priority: P2)

A developer wants to enable maintenance mode (show maintenance screen), offline mode (custom offline screen), or debug mode (verbose logging) via configuration.

**Why this priority**: Useful for production scenarios but not critical for MVP.

**Independent Test**: Enable maintenance mode in config, verify maintenance screen shows.

**Acceptance Scenarios**:

1. **Given** CoreConfig with maintenanceMode=true, **When** app loads, **Then** maintenance screen shows
2. **Given** CoreConfig with offlineMode custom screen, **When** offline, **Then** custom screen shows
3. **Given** CoreConfig with debugMode=true, **When** app runs, **Then** verbose logging enabled

---

### Edge Cases

- What happens when configuration is invalid (malformed URLs)?
- What happens when configuration changes at runtime?
- What happens when required config is missing?

## Requirements

### Functional Requirements

**CoreConfig Interface**:

- **FR-001**: System MUST provide CoreConfig TypeScript interface
- **FR-002**: System MUST support apiBaseURL, timeout, headers configuration
- **FR-003**: System MUST support authToken callback or static token
- **FR-004**: System MUST support logLevel (debug, info, warn, error)
- **FR-005**: System MUST support global error handler callback
- **FR-006**: System MUST support maintenance mode toggle
- **FR-007**: System MUST support offline mode custom screen
- **FR-008**: System MUST support debug mode toggle
- **FR-009**: System MUST validate configuration on initialization

**CoreSetup**:

- **FR-010**: System MUST provide CoreSetup.init(config) method
- **FR-011**: System MUST configure all modules from single config
- **FR-012**: System MUST throw error if critical config missing
- **FR-013**: System MUST support runtime configuration updates

### Key Entities

- **CoreConfig**: Main configuration interface
- **CoreSetup**: Initialization utility
- **ConfigValidator**: Configuration validation

## Success Criteria

- **SC-001**: Developer can configure entire package with single object
- **SC-002**: Invalid configuration throws clear error messages
- **SC-003**: All modules respect configuration
- **SC-004**: Configuration is type-safe (TypeScript errors for invalid config)
