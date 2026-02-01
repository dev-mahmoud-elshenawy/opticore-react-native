# Feature Specification: Utility Functions

**Feature Branch**: `007-utility-functions`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Build pure utility functions (Flutter-style extensions) for strings, numbers, dates, arrays, objects, colors, formatters (phone, date, number), and helpers (clipboard, device, permissions, platform) - organized as importable functions since JS doesn't support true extensions"

## User Scenarios & Testing

### User Story 1 - Developer Uses String Utilities (Priority: P1)

A developer wants string utilities like notNull, capitalize, truncate, maskSensitive, toCamelCase without writing custom logic or installing separate packages.

**Why this priority**: String manipulation is extremely common - user inputs, API responses, display formatting. Essential for any app.

**Independent Test**: Call string utilities with various inputs, verify correct transformations and edge cases handled.

**Acceptance Scenarios**:

1. **Given** string is null/undefined, **When** notNull(str, 'default') is called, **Then** 'default' is returned
2. **Given** string is 'hello world', **When** capitalize(str) is called, **Then** 'Hello World' is returned
3. **Given** string is long text, **When** truncate(str, 50) is called, **Then** string is cut to 50 chars with '...'
4. **Given** string is '1234567890', **When** maskSensitive(str, 4) is called, **Then** '******7890' is returned

---

### User Story 2 - Developer Uses Number & Date Utilities (Priority: P1)

A developer wants safe number parsing (toInt, toDouble with fallbacks), date formatting (formatDate, parseDate, timeAgo), and number formatting (currency, percentage, abbreviated) without manual type checking.

**Why this priority**: Number/date operations are fundamental - prices, timestamps, calculations. Must handle edge cases safely.

**Independent Test**: Call utilities with various inputs including invalid data, verify safe handling and correct formatting.

**Acceptance Scenarios**:

1. **Given** string '123', **When** toInt(str) is called, **Then** 123 is returned
2. **Given** string 'invalid', **When** toInt(str, 0) is called, **Then** 0 is returned (fallback)
3. **Given** date '2026-02-01', **When** formatDate(date, 'MMM DD, YYYY') is called, **Then** 'Feb 01, 2026' is returned
4. **Given** timestamp 2 hours ago, **When** timeAgo(timestamp) is called, **Then** '2 hours ago' is returned

---

### User Story 3 - Developer Uses Array & Object Utilities (Priority: P2)

A developer wants array utilities (filterNonNull, groupBy, unique, sorted) and object utilities (deepMerge, get nested property safely, pick, omit) without lodash dependency.

**Why this priority**: Important for data manipulation but not critical for MVP. Can use manual operations initially.

**Independent Test**: Call utilities with complex data structures, verify correct transformations and edge cases.

**Acceptance Scenarios**:

1. **Given** array with nulls, **When** filterNonNull(arr) is called, **Then** only non-null values returned
2. **Given** array of objects, **When** groupBy(arr, 'category') is called, **Then** object grouped by category
3. **Given** nested object, **When** get(obj, 'user.profile.name', 'default') is called, **Then** nested value or default returned
4. **Given** two objects, **When** deepMerge(obj1, obj2) is called, **Then** deeply merged object returned

---

### User Story 4 - Developer Uses Formatters & Helpers (Priority: P2)

A developer wants formatters for phone numbers, currencies, and percentages, plus helpers for clipboard, device info, permissions, and platform checks.

**Why this priority**: Useful utilities but not critical for core functionality. Can be implemented as needed.

**Independent Test**: Call formatters/helpers, verify correct formatting and platform-specific behavior.

**Acceptance Scenarios**:

1. **Given** phone '1234567890', **When** formatPhone(phone) is called, **Then** '(123) 456-7890' is returned
2. **Given** number 1234.56, **When** formatCurrency(num, 'USD') is called, **Then** '$1,234.56' is returned
3. **Given** text 'hello', **When** copyToClipboard(text) is called, **Then** text is copied to clipboard
4. **Given** app on iOS, **When** isIOS() is called, **Then** true is returned

---

### Edge Cases

- What happens when string utilities receive non-string inputs?
- What happens when number parsing receives Infinity or NaN?
- What happens when date parsing receives invalid format?
- What happens when array utilities receive non-array inputs?
- What happens when clipboard access is denied?
- What happens when platform detection is ambiguous (web)?

## Requirements

### Functional Requirements

**String Utilities**:
- **FR-001**: System MUST provide notNull(str, fallback) for null coalescing
- **FR-002**: System MUST provide capitalize, toUpperCase, toLowerCase utilities
- **FR-003**: System MUST provide truncate(str, length, suffix) for text truncation
- **FR-004**: System MUST provide maskSensitive(str, visibleChars) for masking
- **FR-005**: System MUST provide toCamelCase, toSnakeCase, toKebabCase utilities
- **FR-006**: System MUST provide isEmpty, isEmail, isURL validation utilities

**Number Utilities**:
- **FR-007**: System MUST provide toInt(value, fallback) with safe parsing
- **FR-008**: System MUST provide toDouble(value, fallback) with safe parsing
- **FR-009**: System MUST provide clamp(value, min, max) for range limiting
- **FR-010**: System MUST provide random(min, max) for random number generation

**Date Utilities**:
- **FR-011**: System MUST provide formatDate(date, format) with date-fns integration
- **FR-012**: System MUST provide parseDate(str, format) with safe parsing
- **FR-013**: System MUST provide timeAgo(date) for relative time formatting
- **FR-014**: System MUST provide isToday, isYesterday, isSameDay utilities

**Array Utilities**:
- **FR-015**: System MUST provide filterNonNull(arr) to remove nulls/undefined
- **FR-016**: System MUST provide groupBy(arr, key) for grouping
- **FR-017**: System MUST provide unique(arr) for removing duplicates
- **FR-018**: System MUST provide sortBy(arr, key) for sorting

**Object Utilities**:
- **FR-019**: System MUST provide get(obj, path, fallback) for safe nested access
- **FR-020**: System MUST provide deepMerge(obj1, obj2) for merging
- **FR-021**: System MUST provide pick(obj, keys) and omit(obj, keys) utilities

**Formatters**:
- **FR-022**: System MUST provide formatPhone(phone, format) for phone formatting
- **FR-023**: System MUST provide formatCurrency(num, currency) for currency
- **FR-024**: System MUST provide formatPercentage(num, decimals) for percentages

**Helpers**:
- **FR-025**: System MUST provide clipboard helpers (copy, paste)
- **FR-026**: System MUST provide device info helpers (width, height, OS version)
- **FR-027**: System MUST provide permission helpers (camera, location, etc.)
- **FR-028**: System MUST provide platform checks (isIOS, isAndroid, isWeb)

### Key Entities

All utilities are pure functions exported from respective modules:
- String utilities: `src/utils/string/`
- Number utilities: `src/utils/number/`
- Date utilities: `src/utils/date/`
- Array utilities: `src/utils/array/`
- Object utilities: `src/utils/object/`
- Color utilities: `src/utils/color/`
- Formatters: `src/utils/formatters/`
- Helpers: `src/utils/helpers/`

## Success Criteria

- **SC-001**: Developer can import any utility in single line
- **SC-002**: All utilities handle null/undefined inputs safely
- **SC-003**: String utilities reduce manual null checks by 80%
- **SC-004**: Number parsing never throws errors (always returns number or fallback)
- **SC-005**: Date utilities integrate seamlessly with date-fns
- **SC-006**: Array/object utilities match lodash functionality for common operations
- **SC-007**: 80%+ test coverage for all utilities
- **SC-008**: Tree-shakable (only bundled utilities used)
