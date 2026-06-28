# Graph Report - . (2026-06-03)

## Corpus Check

- 394 files · ~179,497 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1632 nodes · 3090 edges · 109 communities (86 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- [[_COMMUNITY_Unified Config & Provider|Unified Config & Provider]]
- [[_COMMUNITY_Adapter System|Adapter System]]
- [[_COMMUNITY_Error System|Error System]]
- [[_COMMUNITY_Form Infrastructure|Form Infrastructure]]
- [[_COMMUNITY_Theme Infrastructure|Theme Infrastructure]]
- [[_COMMUNITY_Async Hooks|Async Hooks]]
- [[_COMMUNITY_Package & Build Config|Package & Build Config]]
- [[_COMMUNITY_NPM Package Setup|NPM Package Setup]]
- [[_COMMUNITY_Utility Functions|Utility Functions]]
- [[_COMMUNITY_Spec Planning Docs|Spec Planning Docs]]
- [[_COMMUNITY_Offline Sync Engine|Offline Sync Engine]]
- [[_COMMUNITY_API Client & Auth|API Client & Auth]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]

## God Nodes (most connected - your core abstractions)

1. `Logger` - 42 edges
2. `ApiClient` - 39 edges
3. `OfflineSyncManager` - 32 edges
4. `ConnectivityManager` - 30 edges
5. `compilerOptions` - 29 edges
6. `ThemeManager` - 27 edges
7. `RequestQueue` - 24 edges
8. `LogLevel` - 23 edges
9. `SyncEngine` - 21 edges
10. `RenderError` - 20 edges

## Surprising Connections (you probably didn't know these)

- `Release Notes Template` --conceptually_related_to--> `OptiCore Changelog` [INFERRED]
  .github/RELEASE_TEMPLATE.md → CHANGELOG.md
- `ConnectivityManager (NetInfo)` --conceptually_related_to--> `Adapter System (/adapters)` [INFERRED]
  .specify/specs/002-infrastructure-layer/spec.md → CHANGELOG.md
- `Custom Adapters (MMKV, Keychain, stubs)` --conceptually_related_to--> `Adapter System (/adapters)` [INFERRED]
  README.md → CHANGELOG.md
- `ARCHITECTURE.md` --describes--> `Provider Layer (Architecture)` [EXTRACTED]
  .specify/specs/012-documentation-examples/spec.md → docs/ARCHITECTURE.md
- `ARCHITECTURE.md` --describes--> `Result Type Pattern (Architecture)` [EXTRACTED]
  .specify/specs/012-documentation-examples/spec.md → docs/ARCHITECTURE.md

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Spec Kit Six-Step Development Pipeline** — speckit_guide_constitution, speckit_guide_six_step_workflow, spec_implementation_flow, spec_git_alignment, critical_workflow_enforcement [INFERRED 0.85]
- **Infrastructure Layer Core Managers** — 002_infrastructure_layer_api_client, 002_infrastructure_layer_storage_manager, 002_infrastructure_layer_logger, 002_infrastructure_layer_connectivity_manager, 002_infrastructure_layer_lifecycle_manager [EXTRACTED 1.00]
- **State Management Core Patterns** — 003_state_management_core_async_state, 003_state_management_core_base_store, 003_state_management_core_state_observer, 003_state_management_core_store_factory [EXTRACTED 1.00]
- **Error Classification Taxonomy** — spec_004_error_type_enum, spec_004_base_error, spec_004_render_error, spec_004_non_render_error, spec_004_error_classifier [EXTRACTED 0.90]
- **Device State Monitoring Hooks** — spec_006_use_connectivity, spec_006_use_keyboard, spec_006_use_orientation, spec_006_use_lifecycle, spec_006_use_responsive [EXTRACTED 0.90]
- **CoreProvider Infrastructure Composition** — spec_008_core_provider, spec_008_query_provider, spec_006_use_connectivity, spec_003_state_observer [INFERRED 0.75]
- **Offline Sync Manager Composition** — offline_offlinesyncmanager, offline_requestqueue, offline_syncengine, offline_conflictresolver [EXTRACTED 0.90]
- **Offline Sync Integration with Infrastructure** — offline_offlinesyncmanager, infra_connectivitymanager, infra_localstorage, infra_apiclient [EXTRACTED 0.85]
- **Dual Configuration Pattern (CoreSetup + CoreProvider)** — config_coresetup, config_coreprovider, config_coreconfig [EXTRACTED 0.85]
- **OptiCoreProvider composes CoreSetup, ThemeProvider, and ConfigContext** — providers_opticoreprovider, config_coresetup, theme_themeprovider, providers_configcontext [EXTRACTED 1.00]
- **Offline sync pipeline: manager, engine, conflict resolution, queue** — offline_offlinesyncmanager, offline_syncengine, offline_conflictresolver, offline_requestqueue, network_apiclient [EXTRACTED 1.00]
- **Pluggable AuthStrategy implementations** — network_authstrategy, network_bearertokenstrategy, network_apikeystrategy, network_noauthstrategy [EXTRACTED 1.00]
- **Spec 026 Test Failure Root Causes** — specs_026_logformatter_fix, specs_026_locale_formatting_fix, specs_026_react19_concurrent_boundary_fix [INFERRED]
- **OptiCore Error System (Spec 023)** — specs_023_error_classifier_extensible, specs_023_result_type, specs_023_opticore_error_boundary [INFERRED]
- **Infrastructure Hardening Stability Fixes** — specs_025_secure_storage_init_guard, specs_025_core_provider_singleton_safety, specs_025_theme_shadow_value [INFERRED]
- **OptiCoreProvider initializes ApiClient, React Query, and ThemeManager together** — docs_quick_start_opticoreprovider, docs_api_infrastructure_apiclient, docs_api_state_react_query_integration, docs_theme_thememanager [EXTRACTED 1.00]
- **Error taxonomy: BaseError -> RenderError / NonRenderError -> ApiError classified by ErrorClassifier** — docs_api_errors_base_error, docs_api_errors_render_error, docs_api_errors_non_render_error, docs_api_errors_error_classifier [EXTRACTED 1.00]
- **Offline sync pipeline: ConnectivityManager -> OfflineSyncManager -> SyncEngine -> ConflictResolver** — docs_api_infrastructure_connectivity_manager, docs_offline_offlineksynkmanager, docs_offline_conflict_resolution [EXTRACTED 1.00]

## Communities (109 total, 23 thin omitted)

### Community 0 - "Unified Config & Provider"

Cohesion: 0.05
Nodes (55): Spec 018: Unified Configuration & Provider, OptiCoreAdapters, ConfigValidator, CoreConfig Interface, CoreSetup, mockApiClientInstance, mockLoggerInstance, ApiConfig (+47 more)

### Community 1 - "Adapter System"

Cohesion: 0.05
Nodes (53): ClipboardAdapter, ConnectivitySnapshot, DeviceAdapter, LocalStorageAdapter, SecureStorageAdapter, resolveAllAdapters(), resolveClipboardAdapter(), resolveConnectivityAdapter() (+45 more)

### Community 2 - "Error System"

Cohesion: 0.05
Nodes (36): Spec 023: Error System Enhancements, ApiError, BaseError, SerializedError, TestError, ClassificationRule, DefaultErrorFallback(), DefaultErrorFallbackProps (+28 more)

### Community 3 - "Form Infrastructure"

Cohesion: 0.06
Nodes (39): FormExample(), SignUpForm, signUpSchema, styles, Input Masks (phone, currency, credit card), CardPattern, CardType, CurrencyLocaleConfig (+31 more)

### Community 4 - "Theme Infrastructure"

Cohesion: 0.09
Nodes (27): Spec 017 Theme Infrastructure Plan, Spec 017: Theme Infrastructure, CoreThemeConfig, LocalStorage, React Native Appearance API, darkTheme, lightTheme, RN_SHADOW_KEYS (+19 more)

### Community 5 - "Async Hooks"

Cohesion: 0.08
Nodes (20): useAsyncState(), UseAsyncStateReturn, useConnectivity(), useDebounce(), useKeyboard(), useLifecycle(), useMount(), isLandscape() (+12 more)

### Community 6 - "Package & Build Config"

Cohesion: 0.04
Nodes (44): devDependencies, @babel/core, babel-jest, @babel/preset-env, babel-preset-expo, @babel/preset-typescript, eslint, eslint-plugin-react-hooks (+36 more)

### Community 7 - "NPM Package Setup"

Cohesion: 0.06
Nodes (46): Plan 001: NPM Package Setup, Spec 001: NPM Package Setup & Foundation, Subpath Exports (tree-shaking), Tasks 001: NPM Package Setup, ApiClient (Axios wrapper), ConnectivityManager (NetInfo), LifecycleManager (AppState), Logger (singleton, colored levels) (+38 more)

### Community 8 - "Utility Functions"

Cohesion: 0.07
Nodes (29): filterNonNull(), groupBy(), sortBy(), unique(), formatDate(), isSameDay(), parseDate(), formatCurrency() (+21 more)

### Community 9 - "Spec Planning Docs"

Cohesion: 0.06
Nodes (38): Custom Hooks Plan (Spec 006), Core Providers Plan (Spec 008), Global Types Plan (Spec 009), Configuration Interface Plan (Spec 010), CoreConfig Interface (single config object), CoreSetup Initialization Utility, AsyncState<T> Discriminated Union, BaseStore (Zustand factory) (+30 more)

### Community 10 - "Offline Sync Engine"

Cohesion: 0.17
Nodes (17): Spec 019: Offline Sync Manager Rework, HttpMethod, DeadLetterItem, OfflineSyncExample(), Order, styles, PRIORITY_VALUES, NON_RETRYABLE_STATUS_CODES (+9 more)

### Community 11 - "API Client & Auth"

Cohesion: 0.10
Nodes (14): Spec 021: ApiClient Extensibility, mockedAxios, ApiKeyStrategy, ApiKeyStrategy, AuthRetryResult, AuthStrategy, BearerTokenStrategy, NoAuthStrategy (+6 more)

### Community 12 - "Community 12"

Cohesion: 0.17
Nodes (17): Spec 020: Logger Transport System, Spec 022: Forms Internationalization, Code Review 2026-02-11, Credit Card Mask & Luhn Validation, Currency Mask (locale-aware), Luhn Algorithm (validateCardNumber), Phone Mask (locale/pattern-based), ILogger (+9 more)

### Community 13 - "Community 13"

Cohesion: 0.06
Nodes (32): compilerOptions, alwaysStrict, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, jsx (+24 more)

### Community 14 - "Community 14"

Cohesion: 0.10
Nodes (5): err, IResult, ok, Result, ApiError

### Community 15 - "Community 15"

Cohesion: 0.10
Nodes (7): advanceTimersAndFlush(), flushPromises(), retryAsync(), waitForAsync(), waitForCondition(), MockApiResponse, User

### Community 16 - "Community 16"

Cohesion: 0.23
Nodes (14): create_new_agent_file(), log_error(), log_info(), log_success(), log_warning(), main(), parse_plan_data(), print_summary() (+6 more)

### Community 17 - "Community 17"

Cohesion: 0.13
Nodes (15): apiClient, connectivity, createPost(), fetchUserData(), lifecycle, logger, offlineQueue, refreshData() (+7 more)

### Community 18 - "Community 18"

Cohesion: 0.10
Nodes (21): Export Gap (state/hooks not exported), CoreProvider (React Layer), ApiClient, ConnectivityManager, LocalStorage, Logger, Spec 011: Testing Infrastructure, Spec 013: Architecture Gaps Resolution (+13 more)

### Community 19 - "Community 19"

Cohesion: 0.17
Nodes (13): runPerformanceTests(), createBaseStore(), TestActions, TestState, createCrudStore(), CrudApi, CrudStoreConfig, Identifiable (+5 more)

### Community 20 - "Community 20"

Cohesion: 0.17
Nodes (16): ErrorState, UserState, createAsyncState(), isError(), isIdle(), isLoading(), isSuccess(), toError() (+8 more)

### Community 21 - "Community 21"

Cohesion: 0.21
Nodes (3): ApiResponse, MockApiClient, MockResponseConfig

### Community 22 - "Community 22"

Cohesion: 0.16
Nodes (18): useConnectivity Hook, useLifecycle Hook, ApiClient HTTP Client, ApiClient Interceptors (addRequestInterceptor / addResponseInterceptor), Authentication Strategies (NoAuth, ApiKey, BearerToken), ConnectivityManager, Infrastructure API Reference Document, IStorage Interface (+10 more)

### Community 23 - "Community 23"

Cohesion: 0.17
Nodes (3): syncOfflineData(), AuthInterceptor, ApiClient

### Community 25 - "Community 25"

Cohesion: 0.18
Nodes (4): ConnectivityAdapter, ConnectivityCallback, ConnectivityState, ConnectivityManager

### Community 26 - "Community 26"

Cohesion: 0.12
Nodes (17): optional, optional, optional, optional, peerDependenciesMeta, expo-application, expo-clipboard, expo-device (+9 more)

### Community 27 - "Community 27"

Cohesion: 0.25
Nodes (4): LifecycleManager, Observer, LifecycleCallback, LifecycleState

### Community 28 - "Community 28"

Cohesion: 0.12
Nodes (15): author, bin, opticore-install-peers, description, engines, node, files, keywords (+7 more)

### Community 29 - "Community 29"

Cohesion: 0.19
Nodes (3): mockedAxios, mockLoggerError, Logger

### Community 30 - "Community 30"

Cohesion: 0.13
Nodes (15): exports, ./metro, ./offline, ./theme, import, default, require, import (+7 more)

### Community 33 - "Community 33"

Cohesion: 0.19
Nodes (14): AsyncState Helpers (toLoading, toSuccess, toError, isSuccess), AsyncState<T> Pattern (idle/loading/success/error), createBaseStore (Zustand + Immer + DevTools), createCrudStore (Pre-built CRUD Operations), State Management API Reference Document, StateObserver (outside-React Zustand subscription), Documentation Hub Index, OptiCore Module Map (+6 more)

### Community 35 - "Community 35"

Cohesion: 0.14
Nodes (14): scripts, build, clean, format, format:check, install:peers, lint, start (+6 more)

### Community 36 - "Community 36"

Cohesion: 0.17
Nodes (13): backWithData Navigation Pattern, Expo Router Integration, Navigation API Reference Document, RouteHelper Interface (push, replace, back, backWithData, reset), useRouteHelper Hook, ApiResponse<T> Type, AsyncValue<T> Discriminated Union, ErrorState and ErrorSeverity Types (+5 more)

### Community 37 - "Community 37"

Cohesion: 0.18
Nodes (13): FAQ Document, Offline Queue Persistence Across Restarts, OptiCore React Native Library, Result<T,E> vs Try-Catch, SecureStore Web Platform Limitation, Automatic Token Refresh (401 Retry), Conflict Resolution Strategies, Offline Sync Document (+5 more)

### Community 38 - "Community 38"

Cohesion: 0.15
Nodes (13): Flat File Organization (RN community standard), Utility Functions Plan (Spec 007), Array Utilities, Color Utilities, date-fns Library, Date Utilities, Formatters (phone, currency, percentage), Number Utilities (+5 more)

### Community 39 - "Community 39"

Cohesion: 0.24
Nodes (5): StateObserver, Listener, StateCallback, StateFilter, SubscribeOptions

### Community 41 - "Community 41"

Cohesion: 0.17
Nodes (7): ConnectionType, ConnectivityListener, NetworkState, AppState, LifecycleListener, LogEntry, LogLevel

### Community 43 - "Community 43"

Cohesion: 0.18
Nodes (12): Locale Formatting Flexible Matchers Fix, LogFormatter Numeric Level to String Fix, Spec 026 Plan: Test Suite Stabilization, React 19 Concurrent Mode ErrorBoundary Fix, Spec 026: Test Suite Stabilization, Spec 026 Tasks: Test Suite Stabilization, 604 Tests Passing (Spec 026 Outcome), any Type Replacements in src/ (+4 more)

### Community 44 - "Community 44"

Cohesion: 0.20
Nodes (3): get_feature_paths(), has_git(), common.sh script

### Community 45 - "Community 45"

Cohesion: 0.25
Nodes (4): createTestQueryClient(), renderWithQuery(), CoreProvider(), CoreProviderProps

### Community 46 - "Community 46"

Cohesion: 0.22
Nodes (8): deleteItemAsync, getItemAsync, mockSecureStorage, setItemAsync, @react-native-async-storage/async-storage, @react-native-async-storage/async-storage, AsyncStorage, mockStorage

### Community 47 - "Community 47"

Cohesion: 0.24
Nodes (11): Error Classification Plan (Spec 004), BaseError Abstract Class, Error Classification System (Spec 004), ErrorClassifier (auto categorization), ErrorType Enum (RENDER, NON_RENDER, NONE), Flutter opticore Error Categorization Pattern, NonRenderError Class (background/log only), RecoveryStrategy (retry/recovery patterns) (+3 more)

### Community 48 - "Community 48"

Cohesion: 0.56
Nodes (7): alpha(), contrast(), getLuminance(), darken(), hexToRgb(), lighten(), rgbToHex()

### Community 49 - "Community 49"

Cohesion: 0.20
Nodes (10): Hooks API Reference Document, useAsyncState Hook, useDebounce Hook, useKeyboard Hook, useMount Hook, useOrientation Hook, usePrevious Hook, useResponsive Hook (+2 more)

### Community 50 - "Community 50"

Cohesion: 0.20
Nodes (10): OptiCoreErrorBoundary React Component, React Query Integration via OptiCoreProvider, Authentication Flow Setup, OptiCoreErrorBoundary Setup Pattern, OptiCoreProvider Root Setup, Quick Start Guide, Test Coverage: 83.73% over 604 Tests, Mock Reference Table (AsyncStorage, NetInfo, SecureStore) (+2 more)

### Community 51 - "Community 51"

Cohesion: 0.20
Nodes (10): Async Form Validation via Zod refine, Built-in Zod Validators, Form Validation Error i18n, Forms Infrastructure Document, Input Masks (phoneMask, creditCardMask, currencyMask), Multi-Step Form Pattern, useFieldValidation Hook, useFormState Hook (+2 more)

### Community 52 - "Community 52"

Cohesion: 0.31
Nodes (5): ConflictResolver, mockLoggerError, mockLoggerWarn, ConflictHandler, ConflictStrategy

### Community 53 - "Community 53"

Cohesion: 0.29
Nodes (10): Provider Layer (Architecture), Configuration Reference Documentation, ApiConfig, ConfigValidator, CoreConfig Interface, coreSetup.init(), ErrorClassificationConfig, OptiCoreProvider (Configuration Entry Point) (+2 more)

### Community 54 - "Community 54"

Cohesion: 0.20
Nodes (9): AsyncValue, BaseState, ErrorState, LoadingState, LoadingStatus, Nullable, Optional, PaginationState (+1 more)

### Community 56 - "Community 56"

Cohesion: 0.22
Nodes (9): Array Utilities (filterNonNull, groupBy, unique, sortBy), Color Utilities (hexToRgb, rgbToHex, lighten, darken), Date Utilities powered by date-fns (formatDate, timeAgo, isToday), Formatting Utilities (formatPhone, formatCurrency, formatPercentage), Number Utilities (toInt, toDouble, clamp, random), Object Utilities (get, deepMerge, pick, omit), Platform Utilities (isIOS, isAndroid, copyToClipboard, getDeviceWidth), String Utilities (capitalize, truncate, maskSensitive, toCamelCase, isEmail) (+1 more)

### Community 57 - "Community 57"

Cohesion: 0.36
Nodes (9): ApiError Class, BaseError Abstract Class, ConfigValidationError Class, ErrorClassifier (RENDER / NON_RENDER / NONE), Error Handling API Reference Document, NonRenderError Class, Error Recovery Strategies (RetryStrategy, RefreshTokenStrategy, ClearCacheStrategy), RenderError Class (+1 more)

### Community 58 - "Community 58"

Cohesion: 0.22
Nodes (7): AppState, AppStateStatus, mockAddEventListener, mockRemoveEventListener, Platform, React, StyleSheet

### Community 60 - "Community 60"

Cohesion: 0.22
Nodes (9): dependencies, axios, date-fns, @hookform/resolvers, immer, react-hook-form, @tanstack/react-query, zod (+1 more)

### Community 61 - "Community 61"

Cohesion: 0.25
Nodes (9): ARCHITECTURE.md, Hooks Layer (Architecture), Infrastructure Layer (Architecture), Observer Pattern, Offline Queue Flow, Singleton Pattern, State Layer (Architecture), Strategy Pattern (AuthStrategy) (+1 more)

### Community 62 - "Community 62"

Cohesion: 0.36
Nodes (6): adopt(), fulfilled(), runPerformanceTests(), rejected(), step(), verb()

### Community 63 - "Community 63"

Cohesion: 0.22
Nodes (6): initialPagination, initialState, RouteParams, storageConfig, User, UserState

### Community 64 - "Community 64"

Cohesion: 0.32
Nodes (8): Built-in lightTheme and darkTheme, Theme colorUtils (hexToRgb, lighten, darken), createTheme Custom Theme Factory, Dark Mode System Follow and User Toggle, Theme Engine Document, Theme Interface Structure (colors, typography, spacing, borderRadius, shadows), ThemeManager Singleton, useTheme Hook

### Community 66 - "Community 66"

Cohesion: 0.36
Nodes (8): Error Layer (Architecture), Result Type Pattern (Architecture), DefaultErrorFallback Component, ClassificationRule Interface, ErrorClassifier (Extensible with Custom Rules), OptiCoreErrorBoundary, Result<T,E> Pattern, Spec 023 Tasks: Error System Enhancements

### Community 67 - "Community 67"

Cohesion: 0.43
Nodes (8): CoreProvider Singleton Safety, Spec 025 Plan: Infrastructure Hardening, SecureStorage Init Guard (readyPromise), Spec 025: Infrastructure Hardening, Spec 025 Tasks: Infrastructure Hardening, ThemeManager Idempotent Listener, ThemeManager Logger Integration, ThemeShadowValue (React Native Shadow Objects)

### Community 68 - "Community 68"

Cohesion: 0.39
Nodes (7): buildCommand(), detectExpo(), detectPackageManager(), main(), OPTIONAL, parseArgs(), REQUIRED

### Community 69 - "Community 69"

Cohesion: 0.39
Nodes (5): mapError(), mapSuccess(), match(), unwrap(), AsyncStatus

### Community 70 - "Community 70"

Cohesion: 0.25
Nodes (7): NavigateFunction, NavigationOptions, NavigationState, RouteGuard, RouteParams, ScreenConfig, TransitionType

### Community 71 - "Community 71"

Cohesion: 0.29
Nodes (7): Navigation Utilities Plan (Spec 005), RouteGuard / NavigationTypes (removed - app-level concern), Expo Router useRouter, NavigationParams Type, Navigation Utilities (Spec 005), useRouteHelper Hook, Navigation Utilities Tasks (Spec 005)

### Community 72 - "Community 72"

Cohesion: 0.43
Nodes (7): Breakpoints Interface, Spec 024 Plan: Hooks Configurability & Fixes, Spec 024: Hooks Configurability & Fixes, Spec 024 Tasks: Hooks Configurability, useFormState handleSubmit Memoization, useResponsive (Configurable Breakpoints), useSafeCall isMounted Guard

### Community 73 - "Community 73"

Cohesion: 0.33
Nodes (6): CounterState, DataState, User, AuthState, CrudStore, AsyncState

### Community 74 - "Community 74"

Cohesion: 0.29
Nodes (6): ErrorBoundaryState, ErrorHandler, ErrorMetadata, ErrorSeverity, RecoveryAction, StructuredError

### Community 75 - "Community 75"

Cohesion: 0.29
Nodes (6): AnyRouteParams, errorMetadata, navOptions, screenConfig, storageConfig, storageValue

### Community 76 - "Community 76"

Cohesion: 0.33
Nodes (5): compilerOptions, rootDir, exclude, extends, include

### Community 77 - "Community 77"

Cohesion: 0.33
Nodes (5): StorageAdapter, StorageConfig, StorageProvider, StorageResult, StorageValue

### Community 78 - "Community 78"

Cohesion: 0.40
Nodes (5): API.md Reference, CHANGELOG.md, MIGRATION.md, README.md, Spec 012: Documentation & Examples

### Community 79 - "Community 79"

Cohesion: 0.40
Nodes (4): HttpMethod, PaginatedResponse, PaginationMeta, RequestConfig

### Community 80 - "Community 80"

Cohesion: 0.40
Nodes (4): ReactTestRenderer, ReactTestRendererJSON, ReactTestRendererNode, TestRendererOptions

### Community 81 - "Community 81"

Cohesion: 0.50
Nodes (4): import, require, types, ./adapters

### Community 82 - "Community 82"

Cohesion: 0.50
Nodes (4): ./forms, import, require, types

### Community 83 - "Community 83"

Cohesion: 0.50
Nodes (4): ./state, import, require, types

### Community 84 - "Community 84"

Cohesion: 0.50
Nodes (4): ./utils, import, require, types

### Community 85 - "Community 85"

Cohesion: 0.50
Nodes (4): ./hooks, import, require, types

### Community 87 - "Community 87"

Cohesion: 0.50
Nodes (3): config, meta, paginated

### Community 90 - "Community 90"

Cohesion: 0.67
Nodes (3): Plan Template, Spec Template, Tasks Template

## Knowledge Gaps

- **444 isolated node(s):** `check-prerequisites.sh script`, `common.sh script`, `create-new-feature.sh script`, `SPECIFY_FEATURE`, `setup-plan.sh script` (+439 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Package & Build Config` to `Community 28`, `Community 46`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `@react-native-async-storage/async-storage` connect `Community 46` to `Package & Build Config`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `peerDependencies` connect `Package & Build Config` to `Community 28`, `Community 46`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `check-prerequisites.sh script`, `common.sh script`, `create-new-feature.sh script` to the rest of the system?**
  _454 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Unified Config & Provider` be split into smaller, more focused modules?**
  _Cohesion score 0.05191919191919192 - nodes in this community are weakly interconnected._
- **Should `Adapter System` be split into smaller, more focused modules?**
  _Cohesion score 0.05322953923837576 - nodes in this community are weakly interconnected._
- **Should `Error System` be split into smaller, more focused modules?**
  _Cohesion score 0.05337078651685393 - nodes in this community are weakly interconnected._
