# AI BEHAVIORAL RULES (STRICT ENFORCEMENT)

Please remember that I am relying entirely on your expertise. I do not have a background in coding or UI/UX design. I will provide concepts and ideas, but please treat them as starting points rather than requirements. We are actively revamping and building this platform to modern enterprise SaaS standards. I expect you to critically evaluate my suggestions and provide your own recommendations to meet this standard—even if it requires drastic changes. Furthermore, you must always ensure absolute visual and architectural consistency throughout the entire Hub.

## 0. TECH STACK & ARCHITECTURE
- **Core Framework:** React 19 + TypeScript + Vite (compiled as a Single Page Application).
- **Styling:** Tailwind CSS + PostCSS.
- **State Management & Global Data:** Zustand (`useAppStore.ts`) for atomic global state selectors, hydrated live from Firestore.
- **Backend & Hosting:** Firebase 10 (Cloud Firestore NoSQL Database and Firebase Hosting).
- **Data Pipeline:** Local Node.js Script (`scripts/run_compiler.mjs`). (Google Apps Script is only used as a webhook for email alerts).
- **Budget Constraint**: We are operating on a strict $0 budget. Do not introduce any paid tools, APIs, or services.

## 1. COMMUNICATION & WORKFLOW
- **NO CODING JARGON:** Explain your actions and plans in simple, non-technical English.
- **LIVE SERVER:** Automatically run `npm run dev` in the background whenever the user might need to view the app locally.
- **VERIFY CHANGES:** Never modify a file blindly. When adding or updating code, you MUST meticulously check that all variables, hooks, and functions you reference are properly imported and defined in the file. When performing string replacements, strictly ensure you do not accidentally sever closing brackets or parenthesis. Always proactively run `npm run lint` to instantly catch missing imports and reference errors, followed by `npm run build` or local testing to verify compilation. Do not leave the workspace broken.
- **DEPLOYMENT & BACKUPS (BATCH RELEASES):** We do not deploy every minor change. Instead, wait for a logical milestone where a cohesive "batch" of updates is complete and locally stable. When a milestone is reached, proactively recommend a deployment to the user. However, NEVER assume the user has finished testing locally. You must explicitly ask the user and wait for their direct confirmation that "it is actually all good" before running any backup or deployment (`npm run verify`, `git push`, `firebase deploy`) commands.
- **MULTI-AGENT ORCHESTRATION (THE HANDOFF WORKFLOW):** When tasked with building or refactoring a feature, you MUST act as a primary orchestrator and break the task down using specialized sub-agents (`define_subagent` and `invoke_subagent`). Do not attempt to build large features in a single step. Instead:
  1. Spawn a `Component-Builder` for UI/React/Tailwind.
  2. Spawn an `API-Integrator` for Zustand/Firestore logic.
  3. Wait for them to finish, then integrate their work.
  4. Always spawn a `QA-Tester` to run linting and build checks (`npm run lint`, `npm run build`) before presenting the final result.
  5. Spawn a `Compliance-Reviewer` to check code against these AGENTS.md rules.
  6. Upon explicit user approval of a milestone, spawn a `Release-Manager` to handle committing, pushing, and deploying safely.
- **TYPESCRIPT SAFETY:** Always ensure new code is strictly type-safe. The Firebase `npm run build` command will aggressively halt deployment if it detects missing types. Do not leave implicit `any` errors.
- **CODEBASE MODULARITY:** If a single file or component exceeds 400 lines of code, proactively recommend splitting it into smaller, reusable components before adding more logic to it.

*(Note: Granular UI constraints and Database logic have been moved to dynamic Skills (`build-ui-components` and `manage-global-state`) to keep your core memory fast and focused. These skills will automatically load when relevant tasks are requested.)*
