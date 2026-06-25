# Deep-Dive UX/UI Audit: Dashboard & Global Search

This audit evaluates the structure, data presentation, and usability of the Dashboard and Global Search. The goal is to move from a "kitchen-sink" data display to a highly focused, modern SaaS (Linear-style) command center.

## 1. Global Search
**Current State:**
A search input in the top header that opens a custom dropdown box. It searches Clients, Projects, and Services, displaying up to 4 of each.

**UX Critique:**
While functional, standard search inputs with dropdowns are prone to feeling cramped and offer limited keyboard navigation. They also block the UI directly beneath them awkwardly.

**Proposed Better Solution: The Command Menu (Cmd+K)**
- Replace the small dropdown with a **Global Command Modal** (using `shadcn/ui` Command component).
- When a user clicks search or hits `Cmd+K`, a large, centered modal appears, dimming the background.
- **Why it’s better:** It provides massively more real estate to show rich results (like status badges and managers), supports perfect keyboard arrow navigation, and allows us to add "Quick Actions" (e.g., "Create New Project", "Go to Settings") directly into the search bar.

---

## 2. Dashboard Structure & Layout
**Current State:**
A very long, vertically stacked page with 5 rows of data. 

**UX Critique:**
The visual hierarchy is flat. Everything is treated with the same level of importance, resulting in cognitive overload and forcing the user to scroll heavily. Operationally critical items (like "Action Required") are buried in the middle right, while passive data (like a giant Doughnut chart) takes up prime real estate.

**Proposed Better Structure:**
We need to shift from a "Grid of Widgets" to a **"Main Content + Action Sidebar"** layout (a 70/30 split).

*   **Left Column (70% - Analytics & Trends):**
    *   Top KPIs
    *   Implementation Pipeline (Funnel/Kanban summary)
    *   Feature Adoption & Manager Workload
*   **Right Column (30% - Operational & Actionable):**
    *   **Action Required** (Pinned to the top right so it's always visible)
    *   Quarterly Movers (Who needs attention?)
    *   Recent Activity Feed (Combining services and launches)

---

## 3. Widget-by-Widget Analysis

### A. Portfolio Distribution (Doughnut Chart)
*   **Data Presented:** Number of Healthy, Warning, and At-Risk clients.
*   **Critique:** Doughnut charts are visually heavy but poor for precise data comparison. It currently takes up a massive amount of screen space for just 3 data points.
*   **Better Layout:** Convert this into a **Horizontal Stacked Progress Bar** (similar to your Project Delivery Health widget). It takes 1/10th the vertical space, is easier to read instantly, and looks much more premium.

### B. Action Required (Suspended / At Risk)
*   **Data Presented:** Projects/Clients needing immediate attention.
*   **Critique:** This is arguably the most important widget for a Customer Success Manager, but it's competing for attention with the doughnut chart.
*   **Better Layout:** Move this to the top of a persistent Right-Hand Action Sidebar. Strip away the heavy borders and use a clean, minimalist list with high-contrast red/orange alert icons.

### C. Implementation Pipeline
*   **Data Presented:** Horizontal node diagram showing how many projects are in each phase.
*   **Critique:** Beautiful concept, but when you have 6+ phases, the horizontal layout gets cramped and text wraps awkwardly.
*   **Better Layout:** Change to a clean **Vertical Stepper** or a **Bar Chart / Funnel**. It allows phase names to breathe and visually scales better regardless of how many phases exist.

### D. Manager Workload
*   **Data Presented:** Number of Active vs Onboarding projects per manager.
*   **Critique:** Currently a list with buttons. You have to read the numbers to understand who has more work.
*   **Better Layout:** Convert this to a **Horizontal Bar Chart** per manager. Humans process bar lengths instantly. A stacked bar (Active + Onboarding) next to the manager's avatar would make workload distribution obvious at a glance.

### E. Recent Services & Recent Launches
*   **Data Presented:** Two separate lists of recent completed items at the very bottom.
*   **Critique:** Takes up a lot of space and splits user attention.
*   **Better Layout:** Combine these into a single **"Recent Activity Feed"** component. Use a chronological vertical timeline with small icons (Rocket for launch, Briefcase for service). It tells a better story of what the team is accomplishing day-by-day.

### F. Missing Widgets
*   **Missing:** "My Assignments" or "My Priorities". If an individual CSM logs in, they want a filtered view of *their* at-risk accounts or *their* upcoming launches prominently displayed, rather than having to hunt through the global filters.

---

> [!IMPORTANT]
> **Action Required**
> Do you agree with moving toward the **Command Menu (Cmd+K)** for search, and restructuring the Dashboard into a **70/30 (Analytics / Action)** split with the optimized widget layouts described above?
> 
> If you approve, I will draft the technical implementation plan to rebuild the Dashboard using `shadcn/ui` components.