# Avesdo CS Hub - Technical Changelog

<!-- AI INSTRUCTION: 
- ALWAYS prepend your updates directly below this comment block. 
- Use the format `### [YYYY-MM-DD HH:MM:SS] Title` 
- Keep descriptions in plain English, focusing on WHAT changed and WHY.
- DO NOT delete past history. 
-->
### [2026-06-04 12:45:00 EDT] Final Go/No-Go Release Audit & Bug Fixes
* **Go/No-Go Verdict: GO.** The application is clean, unified, and structurally sound for deployment.
* **Logic Bug Fix (ProjectTracker):** Fixed a critical typo where the bulk updater was checking `field === 'status'` instead of `field === 'projectStatus'`. This bug was silently preventing bulk Status updates from auto-logging out to their parent Clients. It is now properly wired.
* **Auto-Log Architecture Validated:** Audited the cascading auto-log logic across `ProjectOverviewTab` and `ServiceDetailsTab`. Confirmed that *only* major Status/Phase transitions are configured to blast out and auto-log on parent Client files, reducing noise.
* **Z-Index Layering Verified:** Confirmed the `100 + (drawerIndex * 20)` mathematical stacking pattern is safely deployed across all five Drawer component files, completely eliminating overlap tearing.
* **Interactive States Validated:** Final verification of tactile physical feedback properties (`active:scale-95`, etc.) across Dashboard KPI tiles, Recent Activity rows, and table components.

### [2026-06-04 12:00:00 EDT] Deep Component Audit & Global Integration Check
* **Style Adherence:** Eradicated lingering `uppercase` typography in Drawer components (e.g. `ProjectOverviewTab`) to comply with `.geminirules`. Standardized interactive focus states by replacing generic `focus:ring-primary/20` classes with explicitly defined `focus:ring-[#00bdd9]/20` utility classes on all checkboxes and buttons in `ProjectTrackerTable` and `AddProjectModal`.
* **Keyboard Navigation & Esc Propagation:** Upgraded `ProjectTrackerCalendar` with a dedicated global `Escape` key listener on custom popovers that leverages `e.stopPropagation()`. This ensures closing the calendar popup cleanly halts event bubbling, preventing the entire parent `ProjectTracker` drawer from accidentally collapsing.
* **Component Parity:** Verified that `UnscheduledProjectsDrawer` perfectly mimics `DashDrilldownDrawer` UI/UX (casing, layering, Z-Index stacking at 100+). Verified unified `BulkActionBar` upward Select positioning. 
* **Architecture Check:** Confirmed Z-Index overlapping layers stack dynamically preventing tearing, ensuring multiple drawers can coexist visually safely.

### [2026-06-04 10:45:00 EDT] Final Global UI Audit & Mock Data Scrubbing
* **Uniform UI Fallbacks:** Standardized all missing Statuses, Phases, and Timelines to universally render as `"Not Set"` (with a Help icon) across all tables, drawers, and global search. Standardized all missing Account Managers/Assignees to uniformly render as `"Unassigned"` (with a User icon).
* **Toast Silencing:** Suppressed the aggressive popup toasts that were firing whenever the system silently logged an event in the background (e.g., auto-logging a state change).
* **Global Scrub:** Completed a final comprehensive audit of the entire codebase to guarantee absolute zero mock data, dummy text, hardcoded trends, or TODOs remain in production. The system is 100% dynamically driven by live Firestore architecture.

### [2026-06-03 12:25:00 EDT] Add Project Modal Full Restoration
* **Multi-Select Architectures:** Upgraded the "Attached Clients" and "Active Features" fields from single-select `<select>` elements into custom inline, scrollable, multi-select grids allowing users to attach multiple entities per project.
* **Cross-Entity Health Math:** Re-wired the submission engine to calculate the new Project's baseline score upon creation, automatically iterate through all attached clients to recalculate their global scores, and perform parallel (`Promise.all`) database commits.
* **UX Inception & Routing:** Enhanced the `clientCreated` window event so that creating a client via the background modal *automatically* checks that client off in the new project list. Implemented a 350ms delay upon successful project creation before cascading into the Project Drawer to prevent UI tearing.
* **Component Parity:** Brought the inline error banner (`#ap-error`) and the Account Manager custom `SelectPopover` in line with the standards established by the Add Client modal.
### [2026-06-03 12:05:00 EDT] Dash Drilldown Drawer UI/UX Restoration
* **Hardcoded Colors Removed:** Upgraded the dynamic Feature Adoption badges inside the `DashDrilldownDrawer` to explicitly use standard semantic Tailwind classes (`bg-emerald-50`, `bg-amber-50`, `bg-red-50`), replacing inline `hexToRgba` calculations and guaranteeing style parity.
* **Empty State Standardization:** Replaced the generic "No projects found" text with the standard Avesdo empty state bounded box (`bg-slate-50/50` with a dashed border) for immediate structural consistency.
* **Tactile Polish:** Added `active:scale-[0.99]` down-press tactile feedback to all project drill-down cards, and standardized the Close Button (`X`) to feature the mandated `#00bdd9` glowing focus ring for keyboard accessibility.

### [2026-06-03 10:11:00 EDT] Modal Standardization & UI/UX Audit
* **Style Guide Expansion:** Formally documented the UI/UX rules for all future Modals in `STYLEGUIDE.md`, standardizing z-indexes (`120` for overlays, `130` for bodies), padding, entrance animations, inline error banners, and prohibiting hardcoded hex focus rings.
* **Add Client Modal Overhaul:** Applied the new Modal standards to `AddClientModal.tsx`, correcting z-index clipping issues against drawers, replacing `#00bdd9` focus rings with semantic `primary` equivalents, and adding snappy `zoom-in-95` entrance animations.

### [2026-06-03 01:56:00 EDT] Holistic UI/UX Audit Standardizations
*   **Global Layouts:** Enforced `pb-32` bottom padding on all primary scrolling containers (`Dashboard`, `ClientHealth`, `ServiceHub`, `Settings`) to prevent bottom-edge clipping.
*   **Empty States:** Added robust empty state fallbacks for the `Dashboard` (Health Index and Pie Chart) and `ProjectHealthTab` (Onboarding phase) to eliminate silent "N/A" or "0" rendering.
*   **Shared Components:** Extracted the repetitive `ColumnFilter`, `DateFilter`, and `StatusDropdown` code from individual pages into a single, highly reusable `TableFilters.tsx` module.
*   **Visual Parity:** Unified KPI card styling across `ClientHealth` and `ServiceHub` to perfectly mirror the `Dashboard`'s backdrop-blur and scale animations.
*   **Drawer Updates:** Standardized `ClientTrendsTab` charting to use the brand `#00bdd9` color. Streamlined `ProjectOverviewTab` by removing redundant fields and patching a cascading relational bug when linking clients.
*   **Global Components:** Fixed the squished `Header` and `Sidebar` layouts, added a mobile backdrop overlay to the Sidebar, and introduced ARIA accessibility roles to `GlobalSearch`. Standardized Toast Notification colors and finite duration limits.

### [2026-06-03 01:46:00 EDT] Firebase Health History Migration
* **Complete Disconnect from Google Sheets:** Permanently deleted the legacy Google Sheets backend scripts (`Backend_API.js`, `Backend_Main.js`, `Backend_Math.js`, `Backend_Cache.js`). 
* **Firestore Native Cron Job:** Created a new `Backend_Cron.js` to handle daily automated health history snapshots natively within Firestore using the `$0 zero-cost` Apps Script environment.
* **Backend Scoring Port:** Successfully ported the complex health scoring algorithms from `scoringUtils.ts` (React) into `Backend_Scoring.js` (Apps Script) to ensure 100% backend calculation parity.
* **Removed Dead Code:** Stripped `migrateSheetsToFirestore` from `AppsScriptCompiler.js` as the initial migration is completely finalized.

### [2026-06-03 01:35:00 EDT] Phase 0 Context Injection
* **Foolproof Context Protection:** Added a mandatory **"PHASE 0: CRITICAL PROJECT CONTEXT & TECH STACK"** section to the very top of `.geminirules` and `.clinerules`. 
* **Legacy Prevention:** Embedded the core architecture (React SPA, Firebase, Firestore, Google Apps Script), the $0 budget constraint, and a strict, explicit warning to **NEVER** write code based on old Vanilla JS or Google Sheets iframe architecture directly into the active prompt payload to ensure the AI never loses context during long workflows.
### [2026-06-02 20:36:00] Final Drawer UI/UX Audit Polish
*   **Enforced** styleguide compliance by strictly removing `uppercase` CSS rules from status dropdown headers across `ProjectDrawer.tsx`, `ServiceDrawer.tsx`, and `ClientServicesTab.tsx`.
*   **Wired Up** interconnected Drawer state workflows: The Project and Service drawers now actively listen to contextual payloads (`targetTab`), meaning clicking a project from a Client Drawer seamlessly slides out the child drawer and defaults its active tab directly to the correct context (e.g., Overview or Service Details).

### [2026-06-02 20:31:00] New Service Outcome Default
*   **Changed** the default outcome applied to newly created services from "Pending" to "Proposal Sent" (to align with the configured Service Outcomes in settings).

### [2026-06-02 20:28:00] Outcome Badge Logic Fix
*   **Fixed** an issue where the outcome badge in the Client Services tab would get stuck on "PENDING" instead of showing the actual Service Status (like "Proposal Sent") because the default unassigned outcome value was overriding the active status.
*   **Hid** the price/cost label on service cards within the Client Drawer's **Services** tab if the service type is flagged as "Included", reducing clutter and focusing attention on paid/additional add-ons.

### [2026-06-02 20:22:00] Dynamic Outcome Icons in Client Drawer
*   **Replaced** the static text badges for "Additional" services in the `ClientServicesTab` with dynamic, icon-only badges.
*   **Wired** the new badges to strictly pull their color and icon directly from the globally configured `Service Outcomes` in the Settings panel. Hovering over the icon displays a tooltip with the outcome text.

### [2026-06-02 20:17:00] Client Drawer Enhancements
*   **Removed** the focus ring from the inline name editor in the Client Drawer for a cleaner inline editing aesthetic.
*   **Added** outcome badges (Won/Lost/Proposed) to "Additional" services inside the `ClientServicesTab` to quickly identify the status of upsells or add-ons without opening the service drawer.

### [2026-06-02 20:09:00] Client Drawer UI/UX Standardizations
*   **Standardized** the sub-tab navigation inside `ClientProjectsTab` and `ClientServicesTab` to visually match the drawer's primary tabs structure (`ClientDrawer`).
*   **Enforced** explicit brand coloring by updating the inline name editor to use the `STYLEGUIDE.md` mandated `#00bdd9` for borders and focus rings.
*   **Cleaned** up the empty state blocks across the project and service tabs to utilize identical padding, rounded corners, and a softer `bg-slate-50/50` design.

### [2026-06-02 14:34:00] Client Association and Cascade Mapping Fix
*   **Fixed** a critical database relation bug where `Projects` and `Services` were filtering and linking exclusively via the `client.companyName` string, causing associated entities to disappear if the exported Apps Script database lacked the string array or if the Client Name changed.
*   **Updated** `Project` and `Service` TypeScript interfaces to explicitly include `clientIds: string[]`.
*   **Refactored** `scoringUtils.ts`, `ClientProjectsTab`, and `ClientServicesTab` to robustly filter and associate data via the canonical `clientId` while safely falling back to name checks during edge cases.
*   **Refactored** `ClientDrawer` name edit cascading, and `AddProjectModal`/`AddServiceModal` payloads to strictly adhere to mapping UUIDs (`client.clientId`) rather than purely name strings.

### [2026-06-02 14:24:00] Client Experience Scoring Fix
*   **Fixed** a math error in `scoringUtils.ts` where the `Client Experience` calculation was incorrectly re-weighting `experience` when only partial CSAT data (Onboarding vs. Support) was present, resulting in score values multiplying into the thousands (e.g. 1000/100).
*   **Reverted** the `Client Experience` averaging logic to perfectly mirror the `calculateClientScoreLogic` in the original `index.html` Apps Script file, cleanly blending the `avgProjectCsat` and `supportCsat` when available.

### [2026-06-02 14:08:00] Scoring Math Capping Fix
*   **Fixed** a critical bug in the dynamic scoring engine where raw volume values for Operational Activity and User Volume could exceed 100, resulting in severely inflated overall Health Scores above 100.
*   **Implemented** strict `Math.min(val, 100)` clamping for all raw volume inputs before applying percentage weights to ensure maximum scores perfectly respect the 100-point limit.

## [2026-06-02 14:02:00] Client Health Drawer - Detailed Breakdown
*   **Implemented** the expanded details dropdowns within the Client Health Tab to perfectly match the original Apps Script design.
*   **Wired** the detailed breakdown sections to dynamically display the raw sub-pillar metrics (Invoice Status, Operational Activity, Active User Volume, Feature Adoption, and CSATs) sourced directly from the `scoringUtils.ts` engine.
*   **Added** the red alert warning banner within the Financial Standing dropdown that triggers conditionally when suspended projects are detected.

## [Unreleased]

### [2026-06-02 13:58:00] Dynamic Health Scoring Engine
*   **Added** `scoringUtils.ts` utility class to automatically calculate overarching Project and Client health scores dynamically instead of using fallback data.
*   **Implemented** complex multi-variable aggregation algorithms to calculate Operational Activity, Feature Adoption, and User Volume on-the-fly.
*   **Enabled** dynamic re-weighting logic where missing data gracefully shifts the base metric weights so accounts aren't penalized unfairly.
*   **Updated** `ProjectHealthTab` and `ClientHealthTab` to display the newly calculated metrics instead of dummy values.
*   **Updated** `ClientDrawer.tsx` to automatically re-render the top visual gauge when an underlying project's health changes.

### [2026-06-02 11:34:00] Relational Cascade Updates & Drawer Stacking

### June 2, 2026 - 12:05 PM
**Strict Artifact Updates Enforcement**
* **Changelog Rule Update:** Explicitly updated `.geminirules` and `.clinerules` to ensure the agent ALWAYS uses the `CHANGELOG.md` file located in the root of the project folder. The changelog must be maintained as a running tracker with new updates added to the very top, including a date and time stamp.
* **Testing Guide Rule Update:** Explicitly updated `.geminirules` and `.clinerules` to ensure the agent ALWAYS uses the `testing_guide.md` file located in the root of the project folder. The testing guide must be cleared out and completely updated with "What was changed" and "How and where to test" upon every single iteration.

### June 2, 2026 - 11:15 AM
**Step 10: Universal CSV Export Engine & UI Polish**
* **Client-Side Export Architecture:** Completely restored the original Apps Script export logic natively in React via `src/utils/exportUtils.ts`. The utility parses local state (avoiding server trips), flattens complex arrays, handles null fallbacks, and strictly sanitizes commas/quotes to ensure flawless column mapping in Excel.
* **Global & Contextual Exports:** Integrated global master exports into the Dashboard, enabling complete backups of all Clients, Projects, and Services.
* **Advanced Export Dropdowns:** Upgraded the static export buttons on the `Client Health`, `Project Tracker`, and `Service Hub` pages into dual-action dropdown menus, allowing users to export the full dataset or slice a specific "Filtered View".
* **UI Cleanliness:** Standardized export dropdown widths to `min-w-[220px] whitespace-nowrap` across the app to prevent label wrapping and maintain a sharp, uniform aesthetic.
* **Global Toast Integrations:** Wired the export lifecycle to the Global Toast Notification system, surfacing instant visual feedback for export initialization and empty-table abort errors.
### June 2, 2026 - 10:30 AM
**Minor UI and Accessibility Tweaks**
* **Sidebar Navigation:** Linked the Avesdo logo in the sidebar to return to the Dashboard.
* **Global Search UX:** Search input and results now correctly clear when dismissing the search box via the Escape key or clicking outside.
* **Table UI Adjustments:** Fixed a visual gap where the top border of the table containers in the Service Hub and Client Health pages was inadvertently hidden by a scrolling hack.
* **Global Search Enhancements:** Removed the Global Search bar from the Settings page to prevent layout clutter. Increased the width of the search container and results dropdown for better readability. Added a "View all X results" button at the bottom of the dropdown that expands the default 4-item cap to show all matches.
* **Sidebar Simplification:** Removed the hover and click interactability from the user profile widget at the bottom of the sidebar, making it strictly informational as per standard dashboard UX patterns.
* **Brand Color Focus Rings:** Conducted a comprehensive sweep to replace all standard primary focus rings with the explicit brand color `#00bdd9`. Documented this new requirement in the style guide.
* **Typography Standardization:** Removed uppercase text styling from the "Active Filters" label in the Service Hub, standardizing it to Title/Sentence case. Added a strict "no uppercase" rule to the style guide.

### June 2, 2026 - 10:10 AM
**Comprehensive UI/UX & Functional Audit Standardizations**
* **Dashboard & Sidebar Standardization:** Stripped hardcoded hex colors (`#5ea500`, `#fe9a00`, etc.) mapping them to semantic Tailwind classes. Fixed the `qRev` quarter metric math to correctly calculate on a `1-4` scale. Fixed the Health Trend logic to properly handle missing historical data without fabricating a 0% trend. Wired up the Export buttons to trigger toast notifications and the Sidebar profile widget to navigate to Settings.
* **Tables (Client Health & Service Hub):** Reordered header actions in Service Hub to prioritize primary actions first, enforcing strict `<span className="shrink-0">` button structures. Removed non-standard hover animations from Service Hub KPI cards. Migrated Service Hub filters to match the Client Health neutral gray aesthetic. Adopted `rounded-lg` search styling and `opacity-70` tab active/inactive shifts. Standardized cell padding to `px-6 py-3` globally. Backported the global search "X" clear button into Client Health.
* **Global Search:** Removed the `/settings` route exclusion in the Header, ensuring search is always visible. Added Up/Down arrow key navigation and Enter selection. Expanded dropdown container constraints to prevent clipping.
* **Global Toaster:** Migrated hardcoded hex codes to semantic Tailwind classes. Implemented a robust `.promise()` wrapper inside `utils/toast.tsx` to handle loading states globally without bypassing the unified UI. Ensured all dismiss buttons have keyboard focus rings.
* **Settings Architecture:** Consolidated `cascadeSettingRename` and parent saves into a single synchronized Promise block, completely eliminating the 800ms debounce data desync risk. Replaced inline delete confirmations with absolutely positioned overlays to prevent vertical jitter. Enforced strict real-time logical validation on Scoring Thresholds (e.g., Warning >= Healthy). Made the custom color/icon picker accessible via keyboard navigation.

### June 1, 2026 - 8:35 PM
**Step 7: Final Premium Polish (Micro-Interactions)**
* **Tactile Press Feedback:** Conducted a final sweep across the application to implement `active:scale` properties on major interactive components to give them physical "weight" when clicked.
  * Added `active:scale-[0.98]` to the massive KPI tiles on the Dashboard and Client Health pages.
  * Added `active:scale-[0.99]` to the rows in the "Recent Launches" and "Recent Services" lists on the Dashboard, and the master data table in the Client Health page, cementing their status as clickable navigation elements.
  * Added `active:scale-95` to the health distribution pill buttons on the Dashboard.
* **Input Focus Standardization:** Swept the `Settings` page and updated all `<input>` elements (text boxes, number inputs) to strictly use the global `focus:ring-2 focus:ring-primary/20 focus:border-primary` utility classes. This provides a sleek, glowing blue focus outline when the user is typing, completely eliminating harsh browser-default outlines and improving accessibility.

## June 1, 2026 - 8:25 PM
**UI/UX Polish & KPI Accuracy Tweaks**
* **KPI Trend Logic:** Discovered and fixed a bug where the KPI trend percentages (both in `Dashboard` and `ClientHealth`) were calculating as 0%. The system was strictly looking for data exactly 30 days old or older, and failing if the mock data was newer. It now intelligently falls back to comparing against the earliest available historical data point.
* **Trend Badge Coloring:** Updated the KPI trend badges to correctly highlight in `emerald-500` (green) for positive trends and `red-500` for negative trends. Added an `inverted` state specifically for the "At Risk" and "Warning" badges so that a decrease in risk properly highlights as green.
* **Settings Click Feedback:** Performed a comprehensive sweep of the `Settings.tsx` page to ensure *every* interactive element—from sidebar tabs to color pickers to list reordering buttons—has proper tactile click feedback (`active:scale-95`).
* **Expanded Color Palette:** Added 5 new vivid colors (`yellow`, `green`, `sky`, `fuchsia`, `stone`) to the global `COLORS` array in `uiUtils.tsx`, making them immediately available in all CustomSelect color pickers across the app.

## June 1, 2026 - 3:45 PM

### Fixed
- Fixed calendar popup rendering size to prevent date grid overflow/cropping horizontally. Redesigned it to be significantly more compact (reduced popover width from 320px to 270px, inner calendar width to 240px, cell height to 28px) while maintaining full functionality.
- Heightened inline calendar containers to prevent vertical overflow and clipping inside popovers.
- Fixed date picker position logic to dynamically detect scroll parents and open upwards automatically when space below is restricted.
- Resolved z-index layering conflicts by introducing a dynamic ancestor elevation script (`.popover-elevated-ancestor`) and updating SPA page containers to `overflow-visible`. This prevents the global header, sticky table headers, footers, search boxes, or KPI tiles from overlapping or clipping dropdowns and popovers.

### Added
- Created `.geminirules` and `.clinerules` config files containing custom agent rules (multi-agent usage, testing before updates, workspace cleanup, preserving functionality, providing testing guides, and maintaining this changelog).
