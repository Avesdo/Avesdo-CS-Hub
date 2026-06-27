---
name: build-ui-components
description: Triggers whenever you are asked to build, modify, or debug UI components, layouts, drawers, modals, tables, or styles.
---

# Premium SaaS UI Standards

When building or modifying UI components, you MUST adhere to the following established "Linear-like" SaaS standards:

1. **Typography & Colors**:
   - **Font**: Use the default sans-serif font family (`Inter`).
   - **Colors**: Rely on Tailwind's `primary` color (`bg-primary`, `text-primary`) for all brand-colored elements. NEVER use hardcoded hex values like `[#00bdd9]`. All interactive elements MUST use semantic Tailwind classes like `focus:ring-primary/20`.
   - **Capitalization Rule**: Do NOT use ALL CAPS (no `uppercase` CSS classes or raw capital strings) in the UI menus, buttons, or headers. Use standard Title Case or lowercase for a softer SaaS look.

2. **Layout Architecture**:
   - Standardize on fixed-canvas page layouts (`h-[calc(100vh-var(--header-height))]`).
   - Use `bg-white` for main data pages (not `bg-slate-50`).
   - Implement sticky headers (`z-40`, `bg-white/90 backdrop-blur-md`) without a bottom border separator.
   - Utilize scroll-aware collapsing logic for top-level KPI cards so they hide (`max-h-0`, `opacity-0`) on scroll to maximize vertical screen real estate for data grids.

3. **Drawers & Modals**:
   - Overlays live at `z-[120]`, bodies at `z-[130]`.
   - Drawers stack from the right. Z-Index MUST cascade using: `100 + (Math.max(0, drawerIndex) * 20)` to prevent tearing.
   - Drawer overlays must use a frosted glassmorphic backdrop (`bg-black/40 backdrop-blur-sm`).
   - Drawer headers must use a two-tone aesthetic: a clean `bg-white` inner block against a `bg-slate-50` full-height pane, with an absolute-positioned blurred gradient aura (`blur-3xl`) anchored top-right.

4. **Fluid Motion & Aesthetics**:
   - Interactive elements and drawers MUST use `duration-300 ease-in-out` transitions.
   - ALWAYS include enter/exit animations. Use `<AnimatePresence>` from Framer Motion for custom React dropdowns, or Radix UI data-state animations (`animate-in` / `animate-out`).

5. **KPI Tiles & Health Metrics**:
   - Primary metric icon should be on the left.
   - Retain an absolute right-side blurred gradient aura for a soft background.
   - Include Framer Motion hover effects (`whileHover={{ y: -4, scale: 1.01 }}`).
   - Health metrics (Adoption, Users, Engagement) must use radial progress gauges or large tabular numerals.
   - Missing telemetry data should be robustly handled and render as a clean `--` rather than defaulting to `0` or breaking layout.
   - Use interactive `UITooltip` components for subtitles, triggered by hover on an `AlertCircle` icon or the header itself.
   - For complex metric details, wrap the content inside the `UITooltip` with a `HealthTooltipCard` to explain scoring logic and status thresholds (Healthy, Warning, Critical) on hover.

6. **Action Buttons**:
   - **Primary Actions**: Use `rounded-lg` with a custom soft-blue glow on hover (`hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]`). Add micro-animations to icons (e.g., `group-hover:rotate-90`).
   - **Secondary Actions**: Use ghost buttons (`bg-slate-100 hover:bg-slate-200`) with `rounded-lg` radius. Add subtle bounce animations (`group-hover:-translate-y-0.5`).

7. **Context Menus & Dropdowns**:
   - **Style**: Use frosted glassmorphism: `bg-white/95 backdrop-blur-md` and `border-slate-200/60`. No flat white backgrounds.
   - **Hover States**: Highlight rows and icons dynamically with the primary theme color (`hover:bg-primary/5 group-hover:text-primary`).
   - Avoid hardcoding minimum widths for dropdowns. Use dynamic shrink-wrapping (`min-w-[160px]`).
   - **Radix UI Constraint**: Always set `modal={false}` on Radix `DropdownMenu.Root` and `Popover.Root` instances inside tables or action bars to ensure native click-outside events fire correctly.
   - **Dropdown Escape Safety**: When capturing the `Escape` key to close a dropdown, you MUST call `e.stopPropagation()`.

8. **Empty States**:
   - Never use plain text for empty states. Always include a soft, muted icon centered above the text.

9. **Scrollbars**:
   - Avoid clunky native scrollbars. Always apply the `custom-thin-scroll` utility class to scrollable containers and dropdowns.

10. **Toolbars & Segmented Controls**:
    - Sticky toolbars must use `bg-white/95 backdrop-blur-md` with a subtle bottom border.
    - Segmented controls (List/Calendar toggles) should utilize Framer Motion (`layoutId`) to slide a crisp white pill between options, shifting active text to `text-primary`.

11. **Search Boxes & Inputs**:
    - Resting backgrounds should be `bg-slate-50/50 hover:bg-slate-50`. Focus states must be highly visible (`focus:border-primary/50 focus:ring-4 focus:ring-primary/10`).

12. **Data Tables & Filters**:
    - **Sorting**: Implement a 3-state sorting toggle (ASC -> DESC -> DEFAULT). Hide the active sort indicator on default state.
    - **Active Filters**: Use a soft brand tint (`bg-primary/5 text-primary border-primary/10`) for active filter pills. Wrap filter lists in `<AnimatePresence>`.
    - **Clear Actions**: Use a subtle ghost style (`text-red-600 bg-transparent hover:bg-red-50`).

13. **Floating Action Bars**:
    - Must use `bg-white/95 backdrop-blur-md` with `rounded-2xl` and a deep shadow (`shadow-[0_8px_30px_rgb(0,0,0,0.12)]`). Use `whitespace-nowrap` on interactive buttons.

14. **Split-Pane Profile Modals**:
    - **Architecture**: Use a split-pane layout with a Left Sidebar (`bg-slate-50 border-r w-[280px]`) for persistent metadata, and a right pane for content.
    - **Navigation**: Use a sleek horizontal sticky header spanning the right pane (`bg-white/95 backdrop-blur-md sticky top-0 z-40`), using Framer Motion `layoutId` for smooth active tab underlines.
    - **Inline Edits**: Hide inline "Edit" actions by default and reveal them on hover (`group/name hover:opacity-100`). Use auto-resizing textareas for titles instead of fixed inputs.
    - **Destructive Actions**: Rename dangerous actions (e.g., Delete) to "Archive". Use left-aligned ghost buttons (`text-slate-400 hover:bg-red-50 hover:text-red-500`) at the bottom of the sidebar to prevent accidental clicks.

15. **Profile Inner Tabs & Nested Data**:
    - Replicate premium KPI tiles (e.g., Total Projects) using context-appropriate Lucide icons inside inner tabs.
    - Inject a persistent, rounded Search box directly to the right of the sticky glassmorphic tab switcher for instant local filtering.
    - **Exclusion Logic**: Completely exclude inactive/Cancelled items from aggregate KPI counts and lifecycle tabs (like "Closed"), but explicitly retain them in the "All" tab.
    - Synchronize nested list cards with dynamic badges and resolve date timestamps gracefully with an "Unscheduled" fallback.

16. **Unsaved Changes Protection**:
    - Build custom inline discard overlays instead of native `window.confirm`.
    - Use a frosted glass backdrop (`backdrop-blur-sm`) covering the modal content with a Framer Motion bounce-in prompt card.
    - Intercept Radix UI `onInteractOutside` and `onEscapeKeyDown` to route through the custom dirty check logic rather than force-closing.

17. **Toolbar Spacing Math**:
    - To perfectly center an `ActiveFilterBar` vertically between top View Controls and the bottom Table Grid, the toolbar container MUST use `gap-3` and `pb-3`, while the subsequent Table wrapper MUST have `mt-0`. This guarantees a symmetrical `0.75rem` spacing.
