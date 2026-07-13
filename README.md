# Avesdo CS Hub

## Project Overview
This project is a custom, interactive Single Page Application (SPA) built to serve as the central operational hub for the Client Success team at Avesdo Technologies. 

It tracks and manages the overall health and lifecycle of **Clients**, **Projects**, and **Services**, and provides continuous team training via the **Academy** module.

## Tech Stack & Infrastructure
The technology stack is exceptionally modern, follows top-tier industry standards, and completely replaces our legacy Google Sheets/Apps Script architecture.

* **Core Framework:** React 19 + TypeScript + Vite (compiled as a Single Page Application).
* **Styling & UI:** Tailwind CSS + PostCSS. All form controls are unified under a strict `formControlVariants` cva paradigm. Headless, accessible components (Modals, Dropdowns) are powered by Radix UI.
* **State & Routing:** Zustand handles 100% of global state across two atomic stores (`useAppStore` for data, `useUIStore` for UI routing). This pairs tightly with React Router and `popstate` listeners for URL-based deep linking (bookmarkable drawers/modals).
* **Backend & Hosting:** Firebase 10 (Cloud Firestore NoSQL Database and Firebase Hosting).
* **Data Integrity:** Zod schemas validate and sanitize all real-time data incoming from Firebase `onSnapshot` listeners to prevent UI crashes.
* **Testing & Code Quality:** Playwright for E2E, Vitest for unit/component testing, ESLint, and Prettier are properly configured.
* **Data Pipeline:** A local Node.js script (`scripts/run_compiler.mjs`) parses Userpilot/Happyfox CSVs and utilizes high-speed bulk writes for structured metrics. It writes any unknown entity names into a "Data Intake" approval queue (`aliases` collection) for manual resolution.
* **Health Scoring Engine:** A centralized `scoringUtils.ts` engine dynamically recalculates Client and Project health scores live based on weights configured in the Firestore `settings` collection.
* **Health Snapshots:** A daily snapshot service (`snapshotService.ts`) automatically records historical health scores upon app load to power the trend analysis graphs.
* **Academy:** A built-in learning management system (`useAcademyStore.ts`) that tests team members on product knowledge using quizzes.
* **Cost Constraint:** The entire application runs on a strict $0 zero-cost Google ecosystem.

## Global State Management & Deep Linking
- **Zustand Data Store:** The application relies on `useAppStore.ts` for centralized global entity data. We use atomic selectors to prevent unnecessary re-renders.
- **Zustand UI Store:** The application relies on `useUIStore.ts` to coordinate 30+ modals, drawers, and nested overlays without prop drilling.
- **Data Hydration:** Massive normalized JSON payloads are pulled from Firestore on initial load directly into `useAppStore` via `useFirebaseSync.ts`.
- **URL Routing:** Modals and slide-out Drawers are mapped to search parameters using human-readable slugs (e.g., `?project=hundredth-square`). `useUIStore.ts` natively intercepts `popstate` events to automatically open/close drawers based on URL changes, enabling beautiful bookmarking and native back-button support without layout thrashing.

## Core Database Schema & Relationships
Firestore data is intentionally denormalized for speed. When a root record updates, cascading updates are executed to preserve Global Search integrity.

- **`clients` collection:** The root entity.
  - `clientId`
  - `companyName` (String)
- **`projects` collection:** 
  - `clientIds: string[]` (References back to the client UUID)
- **`services` collection:**
  - `clientIds: string[]`
  - `projectIds: string[]` (Supports multiple assigned projects)
  - `managers: string[]` (Supports multiple assigned managers)
- **`quizzes` and `quiz_attempts` collections:** Manage the Academy knowledge checks and employee scores.
**Architecture Note (Data Integrity):** The UI requires the string `companyName` to power the Global Search bar. However, we strictly **DO NOT** store duplicated `companyName` strings inside `projects` or `services` in the database to prevent siloing. Instead, the Zustand store (`useAppStore.ts`) and global hooks dynamically resolve the UUID connections via React `useMemo` hooks in real-time. This guarantees perfect data integrity without expensive batch updates.
