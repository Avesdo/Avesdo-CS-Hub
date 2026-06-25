---
name: manage-global-state
description: Triggers whenever you are working with Firestore databases, Zustand stores, Google Apps Script data pipelines, or health scoring logic.
---

# Database Integrity & Data Pipeline Rules

1. **Global Search Dependencies**: 
   - We use dynamic native connections via UUIDs to power text searches. 
   - NEVER duplicate a Client's name inside `projects` or `services`. 
   - `useAppStore` hooks dynamically attach the `companyName` to the data object before broadcasting to the UI.

2. **Drawer Triggering**: 
   - Global Search NEVER renders a Drawer directly. It passes an ID to `openDrawer(type, id)` so `UIContext` mounts the overlay safely.

3. **Data Intake Queue**: 
   - The Apps Script compiler (`AppsScriptCompiler.js`) writes unmatched entities to the `aliases` collection with `status: 'pending_approval'`. 
   - The AdminHub resolves these via the `resolveAlias` function.

4. **Health Scoring Engine**: 
   - Health scores are dynamically calculated in `src/utils/scoringUtils.ts` using weights pulled from the `settings` collection in Firestore. 
   - Changing settings immediately re-renders all scores.
