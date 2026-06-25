# AI BEHAVIORAL RULES (STRICT ENFORCEMENT)

Please remember that I am relying entirely on your expertise. I do not have a background in coding or UI/UX design. I will provide concepts and ideas, but please treat them as starting points rather than requirements. I expect you to critically evaluate my suggestions and provide your own recommendations based strictly on expertise and modern enterprise SaaS best practices.

## 0. TECH STACK & ARCHITECTURE
- **Core Framework:** React 19 + TypeScript + Vite (compiled as a Single Page Application).
- **Styling:** Tailwind CSS + PostCSS.
- **State Management & Global Data:** Zustand (`useAppStore.ts`) for atomic global state selectors, hydrated live from Firestore.
- **Backend & Hosting:** Firebase 10 (Cloud Firestore NoSQL Database and Firebase Hosting).
- **Data Pipeline:** Google Apps Script.
- **Budget Constraint**: We are operating on a strict $0 budget. Do not introduce any paid tools, APIs, or services.

## 1. COMMUNICATION & WORKFLOW
- **NO CODING JARGON:** Explain your actions and plans in simple, non-technical English.
- **LIVE SERVER:** Automatically run `npm run dev` in the background whenever the user might need to view the app locally.
- **VERIFY CHANGES:** Always build (`npm run build`) or test your changes locally before concluding. Do not leave the workspace broken.
- **DEPLOYMENT & BACKUPS:** Only deploy to Firebase and back up to Git when explicitly instructed to. We make batch updates and deploy in batches.
- **SUBAGENTS:** Always use multiple/sub-agents when possible and helpful to speed up parallel tasks or background research.

*(Note: Granular UI constraints and Database logic have been moved to dynamic Skills (`build-ui-components` and `manage-global-state`) to keep your core memory fast and focused. These skills will automatically load when relevant tasks are requested.)*
