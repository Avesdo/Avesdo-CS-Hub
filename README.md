# Avesdo CS Hub

## Project Overview
This project is a custom, interactive Single Page Application (SPA) built to serve as the central operational hub for the Client Success team at Avesdo Technologies. 

It tracks and manages the overall health and lifecycle of **Clients**, **Projects**, and **Services**.

## Tech Stack & Infrastructure
The technology stack is exceptionally modern, follows top-tier industry standards, and completely replaces our legacy Google Sheets/Apps Script architecture.

* **Core Framework:** React 19 + TypeScript + Vite (compiled as a Single Page Application).
* **Styling:** Tailwind CSS + PostCSS.
* **State Management:** TanStack React Query perfectly layered with native React Context.
* **Backend & Hosting:** Firebase 10 (Cloud Firestore NoSQL Database and Firebase Hosting).
* **Testing & Code Quality:** Playwright for E2E, Vitest for unit/component testing, ESLint, and Prettier are properly configured.
* **Data Pipeline:** Google Apps Script (runs isolated in the background to ingest Drive files and securely call the Gemini API). The Admin Hub also includes a dedicated tool to parse and ingest bulk JSON/Excel initial state data directly into Firestore.
* **Cost Constraint:** The entire application runs on a strict $0 zero-cost Google ecosystem.

## Global State Management
- **Context API:** The application uses native React Context (`AppStateContext.tsx` and `UIContext.tsx`) for global state management. It intentionally avoids Redux to remain lightweight and native.
- **Data Hydration:** Massive normalized JSON payloads are pulled from Firestore on initial load into `AppStateContext`.

## Core Database Schema & Relationships
Firestore data is intentionally denormalized for speed. When a root record updates, cascading updates are executed to preserve Global Search integrity.

- **`clients` collection:** The root entity.
  - `clientId`
  - `companyName` (String)
- **`projects` collection:** 
  - `clientIds: string[]` (References back to the client UUID)
- **`services` collection:**
  - `clientIds: string[]`
  - `projectId: string`

**Architecture Note (Data Integrity):** The UI requires the string `companyName` to power the Global Search bar. However, we strictly **DO NOT** store duplicated `companyName` strings inside `projects` or `services` in the database to prevent siloing. Instead, `AppStateContext.tsx` dynamically resolves the UUID connections via a React `useMemo` hook in real-time. This guarantees perfect data integrity without expensive batch updates.
