# V2 Redesign Directory Constraint
When working on the UI/UX redesign (V2), you MUST target all file edits, reads, and terminal commands to the `../Avesdo_CS_Hub_V2` directory. The current directory (`Avesdo_CS_Hub`) is reserved ONLY for live v1 bug fixes. Always double-check your file paths before editing to ensure you are modifying the V2 codebase and not V1.

# Budget and Tech Stack Constraints
1. **$0 Budget Rule**: We are operating on a strict $0 budget. Do not introduce any paid tools, APIs, or services unless there is absolutely no other alternative and you have received explicit user approval.
2. **Google Ecosystem**: Prefer Google ecosystem tools (Firebase, Google Cloud, Apps Script) whenever backend or cloud services are needed, maximizing the free tiers.
3. **Enterprise UI Standard**: Utilize modern, free, open-source libraries like `shadcn/ui`, `Tailwind CSS`, and `Framer Motion` to achieve a premium, "Linear-like" SaaS aesthetic.

# Typography Constraint
Do not use ALL CAPS (uppercase CSS classes or raw capital strings) in the UI. We prefer standard capitalization or lowercase for a more premium, softer SaaS look.

# Premium SaaS UI Standards
When building or modifying UI components, you MUST adhere to the following established "Linear-like" SaaS standards:

1. **Typography & Colors**:
   - **Font**: Use the default sans-serif font family (`Inter`).
   - **Colors**: Rely on Tailwind's `primary` color (`bg-primary`, `text-primary`, `text-primary/90`) for all brand-colored elements (buttons, active states, hover effects) to ensure theme consistency.
   - **Capitalization Rule**: Do NOT use ALL CAPS (no `uppercase` CSS classes or raw capital strings) in the UI menus, buttons, or headers. Use standard Title Case or lowercase for a more premium, softer SaaS look.

2. **Page Backgrounds & Layout Architecture**:
   - Use `bg-white` for main data pages (not `bg-slate-50`).
   - Implement sticky headers (`z-40`, `bg-white`) without a bottom border separator.
   - Utilize scroll-aware collapsing logic for top-level KPI cards so they hide (`max-h-0`, `opacity-0`) on scroll to maximize vertical screen real estate for data grids.

3. **KPI Tiles**:
   - Primary metric icon should be on the left.
   - Retain an absolute right-side blurred gradient aura for a soft background.
   - Include Framer Motion hover effects (`whileHover={{ y: -4, scale: 1.01 }}`).
   - Use interactive `UITooltip` components for subtitles, triggered by hover on an `AlertCircle` icon.

4. **Action Buttons**:
   - **Primary Actions (Create/Add)**: Use `rounded-lg` with a custom soft-blue glow on hover (`hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]`). Add interactive micro-animations to icons (e.g., `group-hover:rotate-90` on a Plus icon).
   - **Secondary Actions (Export/View)**: Use ghost buttons (`bg-slate-100 hover:bg-slate-200`) with `rounded-lg` radius. Add subtle bounce animations to icons (`group-hover:-translate-y-0.5`).

5. **Context Menus & Dropdowns**:
   - **Style**: Avoid flat white backgrounds. Use frosted glassmorphism: `bg-white/95 backdrop-blur-md` and `border-slate-200/60`.
   - **Structure**: Do not use uppercase text headers; keep menus clean and minimal.
   - **Animation**: ALWAYS include enter/exit animations. Use `<AnimatePresence>` from Framer Motion for custom React dropdowns, or Radix UI data-state animations (`data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2`) for Popovers.
   - **Hover States**: Highlight rows and icons dynamically with the primary theme color (`hover:bg-primary/5 group-hover:text-primary`).

6. **Empty States**:
   - Never use plain text for empty states. Always include a soft, muted icon centered above the text to make the empty state look intentional, rewarding, and polished.

7. **Scrollbars**:
   - Avoid clunky native scrollbars. Always apply the `custom-thin-scroll` utility class to scrollable containers, dropdowns, and data tables for a sleek, minimal profile.

8. **Sidebars & Navigation**:
   - Active navigation states must be distinctly highlighted (e.g., `bg-sidebar-primary text-sidebar-primary-foreground`).
   - All interactive navigation elements must include focus rings (`focus-visible:ring-2 focus-visible:ring-primary/20`) for accessibility.

9. **Slide-over Drawers (Drilldowns)**:
   - Drawer overlays must use a frosted glassmorphic backdrop (`bg-black/40 backdrop-blur-sm`).
   - Drawers must slide in smoothly from the right edge using Framer Motion or `animate-in slide-in-from-right`.

10. **Toolbars & Segmented Controls**:
    - Sticky toolbars must use `bg-white/95 backdrop-blur-md` with a subtle bottom border (`border-slate-100`).
    - Segmented controls (e.g., List/Calendar toggles) should utilize Framer Motion (`layoutId`) to slide a crisp white pill (`bg-white shadow-sm`) between options, shifting active text and icons to `text-primary`.
    - Tab switchers must soften inactive states (`text-slate-500 hover:text-slate-700`) and highlight the active state in `text-primary`.

11. **Search Boxes & Inputs**:
    - Resting backgrounds should be `bg-slate-50/50 hover:bg-slate-50` to provide a subtle contrast against pure white containers.
    - Focus states must be highly visible and branded (`focus:border-primary/50 focus:ring-4 focus:ring-primary/10`).

12. **Data Tables & Filters**:
    - **Sorting**: Implement a 3-state sorting toggle (ASC -> DESC -> DEFAULT) for data tables. Hide the active sort indicator when a table is in its default sorting state to reduce visual noise. Always show a subtle `ArrowUpDown` icon on hover to indicate sortability.
    - **Active Filters**: Use a soft brand tint (`bg-primary/5 text-primary border-primary/10`) for active filter pills. Avoid heavy borders or generic gray backgrounds. Wrap filter lists in Framer Motion `<AnimatePresence>` for smooth entry and exit animations.
    - **Clear Actions**: "Clear All" buttons should use a subtle ghost style (e.g. `text-red-600 bg-transparent hover:bg-red-50`) so they do not compete visually with the filter pills.

13. **Dynamic Dropdowns & Modals**:
    - Avoid hardcoding minimum widths for dropdowns (`w-[260px]`). Instead, use dynamic shrink-wrapping (`min-w-[160px]`) so dropdowns elegantly hug short text but expand safely.
    - **Radix UI Constraint**: Always set `modal={false}` on Radix `DropdownMenu.Root` and `Popover.Root` instances inside tables or action bars to ensure native click-outside events fire correctly and prevent overlapping menus.

14. **Floating Action Bars**:
    - Floating contextual bars (e.g., bulk actions) must use `bg-white/95 backdrop-blur-md` with `rounded-2xl` and a deep shadow (`shadow-[0_8px_30px_rgb(0,0,0,0.12)]`).
    - Use `whitespace-nowrap` on all interactive buttons within the bar to prevent multiline breakage when layout widths flex.

15. **Drawer Headers**:
    - Drawer headers must use a two-tone aesthetic: a clean `bg-white` inner block spanning the header against a pure `bg-slate-50` full-height pane.
    - Feature an absolute-positioned blurred gradient aura (`blur-3xl`) anchored top-right in the header to visually reinforce the brand or state color.
    - Icons must sit in a `rounded-xl` square container featuring an inset shadow (`shadow-inner`).
    - Inner project/item cards must use `rounded-2xl` corners with smooth `hover:-translate-y-0.5 hover:border-primary/30` floating animations.
