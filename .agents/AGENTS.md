# AI BEHAVIORAL RULES (STRICT ENFORCEMENT)

Please remember that I am relying entirely on your expertise. I do not have a background in coding or UI/UX design. I will provide concepts and ideas, but please treat them as starting points rather than requirements. We are actively revamping and building this platform to modern enterprise SaaS standards. I expect you to critically evaluate my suggestions and provide your own recommendations to meet this standard—even if it requires drastic changes. Furthermore, you must always ensure absolute visual and architectural consistency throughout the entire Hub.

## 0. TECH STACK & ARCHITECTURE
- **Core Framework:** React 19 + TypeScript + Vite (compiled as a Single Page Application).
- **Styling & UI Primitives:** Tailwind CSS + PostCSS, Radix UI (dialogs, dropdowns, popovers, tabs), Framer Motion (fluid animations), Lucide React (icons), and `@dnd-kit` (drag-and-drop).
- **State Management, Global Data & UI Routing:** Zustand (`useAppStore.ts` for data hydrated live from Firestore, `useUIStore.ts` for overlays, drawers, modals, and URL state).
- **Backend & Hosting:** Firebase 10 (Cloud Firestore NoSQL Database and Firebase Hosting).
- **Data Pipeline & Notifications:** In-app Admin Data Compilers for Happyfox, Userpilot, TMS, and Academy imports, paired with a Google Apps Script webhook (`scripts/Code.gs`) for automated email alerts.
- **Automated Testing:** Vitest + React Testing Library (`npx vitest run`) for unit and component verification.
- **Budget Constraint:** We are operating on a strict $0 budget. Do not introduce any paid tools, APIs, or services.

## 1. COMMUNICATION & WORKFLOW
- **NO CODING JARGON:** Explain your actions and plans in simple, non-technical English.
- **LIVE SERVER:** Automatically run `npm run dev` in the background whenever the user might need to view the app locally.
- **VERIFY CHANGES:** Never modify a file blindly. When adding or updating code, you MUST meticulously check that all variables, hooks, and functions you reference are properly imported and defined in the file. When performing string replacements, strictly ensure you do not accidentally sever closing brackets or parentheses. Always proactively run `npm run lint` and `npm run build` (or `npm run verify`), along with relevant unit tests (`npx vitest run`), to verify compilation before presenting results. Do not leave the workspace broken.
- **DEPLOYMENT & BACKUPS (BATCH RELEASES):** We do not deploy every minor change. Instead, wait for a logical milestone where a cohesive "batch" of updates is complete and locally stable. When a milestone is reached, proactively recommend a deployment to the user. However, NEVER assume the user has finished testing locally. You must explicitly ask the user and wait for their direct confirmation that "it is actually all good" before running any backup or deployment (`npm run verify`, `git push`, `firebase deploy`) commands.
- **SMART TIERED EXECUTION (DIRECT VS. SUB-AGENTS):**
  - **Small & Medium Tasks (1–3 files, bug fixes, UI tweaks, logic updates):** Execute the changes and run verification (`npm run lint`, `npm run build`) directly as the primary agent without spawning sub-agents. This keeps turnaround fast and avoids unnecessary handoff overhead.
  - **Large Multi-Part Features (4+ files or brand-new modules):** Break the task down and invoke specialized sub-agents in parallel only when the scope genuinely benefits from parallel execution.
- **TYPESCRIPT SAFETY:** Always ensure new code is strictly type-safe. The Firebase `npm run build` command will aggressively halt deployment if it detects missing types. Do not leave implicit `any` errors.
- **CODEBASE MODULARITY (ASK FIRST):** Aim to keep new files and components under 400 lines of code. However, if an existing file exceeds 400 lines during a feature update or bug fix, **do NOT automatically split or refactor it unprompted**. Instead, complete the requested change cleanly, flag the file size to the user, and ask for permission before splitting it into smaller components.

*(Note: Granular UI constraints and Database logic are organized in dynamic Skills (`build-ui-components` and `manage-global-state`) to keep your core memory fast and focused. Read their `SKILL.md` files whenever relevant tasks are requested.)*
