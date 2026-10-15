---
name: manage-global-state
description: Use this skill whenever working with Firestore databases, Zustand stores, data compilers, Google Apps Script webhooks, or health scoring logic.
---

# Database Integrity & Data Pipeline Rules

1. **Global Search & Entity Dependencies**:
   - We use dynamic connections via IDs to power text searches and relational views.
   - NEVER duplicate a Client's name permanently inside `projects` or `services` records when a dynamic lookup from `useAppStore` is used.
   - `useAppStore` hooks dynamically attach `companyName` to project and service objects before broadcasting to the UI.

2. **Drawer & Modal Triggering**:
   - Global Search and table rows NEVER render a Drawer directly. They pass the drawer type and record ID to `openDrawer(type, id)` from `useUIStore.ts` so the app mounts the overlay safely and syncs the URL parameters (e.g., `?drawer=project&drawerId=123`).

3. **Data Intake & Alias Queue**:
   - When reports are imported via the Data Compiler, unmatched entities are written to the `aliases` collection with `status: 'pending_approval'`.
   - The Admin Hub resolves these via the `resolveAlias` function.

4. **Health Scoring Engine & CSAT Calculation**:
   - Health scores are dynamically calculated in `src/utils/scoringUtils.ts` and `src/utils/qualityUtils.ts` using configurable pillar weights stored in Firestore (`settings/global_config`).
   - Changing weights in Settings immediately recalculates scores across the Hub.
   - **Reference Guide**: Before modifying any health score, CSAT, NPS, or telemetry logic, you **MUST** read [HEALTH_SCORING_RULES.md](./reference_materials/HEALTH_SCORING_RULES.md).
