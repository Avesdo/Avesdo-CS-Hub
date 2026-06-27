# Avesdo CS Hub

## Project Overview
This project is a custom, interactive Single Page Application (SPA) built to serve as the central operational hub for the Client Success team at Avesdo Technologies. 

It tracks and manages the overall health and lifecycle of **Clients**, **Projects**, and **Services**.

## Tech Stack & Infrastructure
The technology stack is exceptionally modern, follows top-tier industry standards, and completely replaces our legacy Google Sheets/Apps Script architecture.

* **Core Framework:** React 19 + TypeScript + Vite (compiled as a Single Page Application).
* **Styling & UI:** Tailwind CSS + PostCSS, heavily utilizing Radix UI primitives for accessible, animated headless components (Modals, Dropdowns).
* **State & Routing:** Zustand for atomic global state selectors, combined with React Router for URL-based deep linking (bookmarkable drawers/modals).
* **Backend & Hosting:** Firebase 10 (Cloud Firestore NoSQL Database and Firebase Hosting).
* **Data Integrity:** Zod schemas validate and sanitize all real-time data incoming from Firebase `onSnapshot` listeners to prevent UI crashes.
* **Testing & Code Quality:** Playwright for E2E, Vitest for unit/component testing, ESLint, and Prettier are properly configured.
* **Data Pipeline:** A local Node.js script (`scripts/run_compiler.mjs`) parses Userpilot/Happyfox CSVs and utilizes high-speed bulk writes for structured metrics. It writes any unknown entity names into a "Data Intake" approval queue (`aliases` collection) for manual resolution.
* **Health Scoring Engine:** A centralized `scoringUtils.ts` engine dynamically recalculates Client and Project health scores live based on weights configured in the Firestore `settings` collection.
* **Cost Constraint:** The entire application runs on a strict $0 zero-cost Google ecosystem.

## Global State Management & Deep Linking
- **Zustand Store:** The application relies on Zustand (`useAppStore.ts`) for centralized global state. We use atomic selectors to prevent unnecessary re-renders.
- **Data Hydration:** Massive normalized JSON payloads are pulled from Firestore on initial load directly into Zustand via `useFirebaseSync.ts`.
- **URL Routing:** Modals and slide-out Drawers are mapped to `react-router-dom` search parameters using human-readable slugs (e.g., `?project=hundredth-square` or `?client=avesdo-developments`). This enables beautiful bookmarking, sharing, and native back-button support without layout thrashing.

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
**Architecture Note (Data Integrity):** The UI requires the string `companyName` to power the Global Search bar. However, we strictly **DO NOT** store duplicated `companyName` strings inside `projects` or `services` in the database to prevent siloing. Instead, the Zustand store (`useAppStore.ts`) and global hooks dynamically resolve the UUID connections via React `useMemo` hooks in real-time. This guarantees perfect data integrity without expensive batch updates.
