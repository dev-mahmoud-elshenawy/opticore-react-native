# Tasks: Theme Infrastructure

**Input**: Design documents from `/specs/017-theme-infrastructure/`
**Prerequisites**: Spec 014 complete, branch created

## Phase 1: Type Definitions (1 hour)

- [x] T017.1 Create `src/theme/types.ts`:
  - ThemeMode = 'light' | 'dark' | 'system'
  - Theme interface
  - ThemeColors interface
  - ThemeSpacing, ThemeTypography, ThemeBorderRadius
  - ThemeConfig, ThemeListener

---

## Phase 2: Default Themes (1-2 hours)

- [x] T017.2 Create `src/theme/defaultThemes.ts`:
  - Light theme (Material Design palette)
  - Dark theme (Material Design palette)
  - Verify WCAG AA contrast for text colors
- [x] T017.3 Write tests: `test/theme/defaultThemes.test.ts`

**Verification**: Themes have all required properties

---

## Phase 3: Color Utilities (1-2 hours)

- [x] T017.4 Create `src/theme/colorUtils.ts`:
  - lighten(color, amount) - Lighten color
  - darken(color, amount) - Darken color
  - alpha(color, opacity) - Add transparency
  - contrast(color) - Determine if light/dark text needed
  - hexToRgb(hex) - Convert hex to RGB
  - rgbToHex(r, g, b) - Convert RGB to hex
- [x] T017.5 Write tests: `test/theme/colorUtils.test.ts`

**Verification**: Color utils work with hex colors

---

## Phase 4: Theme Manager (2-3 hours)

- [x] T017.6 Create `src/theme/ThemeManager.ts`:
  - Singleton getInstance()
  - configure(config)
  - registerTheme(name, theme)
  - setTheme(name)
  - setMode(mode: 'light' | 'dark' | 'system')
  - getTheme(), getMode(), getActiveMode()
  - addThemeListener(callback)
  - dispose()
- [x] T017.7 Integrate with Appearance API:
  - Detect system color scheme
  - Listen for system changes
  - Update when system changes (if mode is 'system')
- [x] T017.8 Integrate with LocalStorage:
  - Persist mode preference
  - Restore on init
- [x] T017.9 Write tests: `test/theme/ThemeManager.test.ts`

**Verification**: Manager follows system theme when mode is 'system'

---

## Phase 5: React Provider & Hook (1-2 hours)

- [ ] T017.10 Create `src/theme/ThemeProvider.tsx`:
  - Create ThemeContext
  - ThemeProvider component
  - Subscribe to ThemeManager events
  - Re-render on theme changes
- [ ] T017.11 Create `src/theme/useTheme.ts`:
  - Returns theme, mode, activeMode
  - Returns setMode, toggleMode helpers
  - Returns color shortcuts (colors, spacing, typography)
  - Returns status booleans (isDark, isLight, isSystem)
- [ ] T017.12 Write tests: `test/theme/ThemeProvider.test.tsx`
- [ ] T017.13 Write tests: `test/theme/useTheme.test.ts`

**Verification**: Hook re-renders when theme changes

---

## Phase 6: Module Exports & Examples (1 hour)

- [ ] T017.14 Create `src/theme/index.ts` - Export all public APIs
- [ ] T017.15 Add theme exports to `src/index.ts`
- [ ] T017.16 Add subpath export to package.json: `"./theme": "./dist/theme/index.js"`
- [ ] T017.17 Create `examples/theme/ThemeExample.tsx`

---

## Final Verification

- [ ] T017.18 Run tests: `npm test test/theme` (All passing)
- [ ] T017.19 Run type-check: `npm run type-check` (0 errors)
- [ ] T017.20 Check coverage: `npm test test/theme -- --coverage` (≥80%)
- [ ] T017.21 Verify WCAG AA contrast in default themes
- [ ] T017.22 Test system theme detection manually
- [ ] T017.23 Update CLAUDE.md with Spec 017 completion

**Success Criteria**: All tasks completed ✓
