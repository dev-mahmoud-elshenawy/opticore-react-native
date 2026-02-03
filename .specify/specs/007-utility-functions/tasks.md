# Tasks: Utility Functions

**Organization**: Tasks grouped by user story for independent implementation

## Phase 1: Setup

- [x] T001 Create utils directory: `src/utils/`
- [x] T002 Install dependencies: date-fns, clipboard, device-info

## Phase 2: User Story 1 - String Utilities (P1) 🎯

### Tests First (TDD)

- [x] T003 [P] [US1] Create `src/utils/string.test.ts` with tests for all string utilities

### Implementation

- [x] T004 [P] [US1] Create `src/utils/string.ts` with all string utilities:
  - notNull(str, fallback) - null coalescing
  - capitalize(str) - capitalize first letter
  - truncate(str, length, suffix) - truncate text
  - maskSensitive(str, visibleChars) - mask sensitive data
  - toCamelCase(str) - convert to camelCase
  - toSnakeCase(str) - convert to snake_case
  - toKebabCase(str) - convert to kebab-case
  - isEmpty(str) - check if empty
  - isEmail(str) - validate email
  - isURL(str) - validate URL

## Phase 3: User Story 2 - Number & Date Utilities (P1) 🎯

### Tests First (TDD)

- [x] T005 [P] [US2] Create `src/utils/number.test.ts` with tests for all number utilities
- [x] T006 [P] [US2] Create `src/utils/date.test.ts` with tests for all date utilities

### Implementation

- [x] T007 [P] [US2] Create `src/utils/number.ts` with all number utilities:
  - toInt(value, fallback) - safe integer parsing
  - toDouble(value, fallback) - safe float parsing
  - clamp(value, min, max) - clamp to range
  - random(min, max) - random number generation

- [x] T008 [P] [US2] Create `src/utils/date.ts` with all date utilities:
  - formatDate(date, format) - format date with date-fns
  - parseDate(str, format) - safe date parsing
  - timeAgo(date) - relative time formatting
  - isToday(date) - check if today
  - isYesterday(date) - check if yesterday
  - isSameDay(date1, date2) - compare dates

## Phase 4: User Story 3 - Array & Object Utilities (P2)

### Tests First (TDD)

- [x] T009 [P] [US3] Create `src/utils/array.test.ts` with tests for all array utilities
- [x] T010 [P] [US3] Create `src/utils/object.test.ts` with tests for all object utilities

### Implementation

- [x] T011 [P] [US3] Create `src/utils/array.ts` with all array utilities:
  - filterNonNull(arr) - remove null/undefined
  - groupBy(arr, key) - group by property
  - unique(arr) - remove duplicates
  - sortBy(arr, key) - sort by property

- [x] T012 [P] [US3] Create `src/utils/object.ts` with all object utilities:
  - get(obj, path, fallback) - safe nested access
  - deepMerge(obj1, obj2) - deep merge objects
  - pick(obj, keys) - pick properties
  - omit(obj, keys) - omit properties

## Phase 5: User Story 4 - Formatters & Platform Helpers (P2)

### Tests First (TDD)

- [x] T013 [P] [US4] Create `src/utils/format.test.ts` with tests for all formatters
- [x] T014 [P] [US4] Create `src/utils/platform.test.ts` with tests for all platform helpers

### Implementation

- [x] T015 [P] [US4] Create `src/utils/format.ts` with all formatters:
  - formatPhone(phone, format) - phone number formatting
  - formatCurrency(num, currency) - currency formatting
  - formatPercentage(num, decimals) - percentage formatting

- [x] T016 [P] [US4] Create `src/utils/platform.ts` with all platform helpers:
  - Clipboard helpers: copyToClipboard(text), getClipboard()
  - Device helpers: getDeviceWidth(), getDeviceHeight(), getOSVersion()
  - Permission helpers: checkCameraPermission(), checkLocationPermission()
  - Platform checks: isIOS(), isAndroid(), isWeb()

## Phase 6: Color Utilities (Optional - P2)

### Tests First (TDD)

- [x] T017 [P] Create `src/utils/color.test.ts` with tests for all color utilities

### Implementation

- [x] T018 [P] Create `src/utils/color.ts` with all color utilities:
  - hexToRgb(hex) - convert hex to RGB
  - rgbToHex(r, g, b) - convert RGB to hex
  - lighten(color, amount) - lighten color
  - darken(color, amount) - darken color

## Phase 7: Integration & Polish

- [x] T019 [P] Create `src/utils/index.ts` - re-export all utilities
- [x] T020 Run full test suite, verify 80%+ coverage
- [x] T021 [P] Add JSDoc comments to all public functions
- [x] T022 Verify tree-shaking works with test imports
- [x] T023 Update package.json with subpath exports

## Phase 8: Documentation

- [x] T024 [P] Document all utility categories in README
- [x] T025 [P] Create usage examples for each category
- [x] T026 [P] Add import pattern examples
