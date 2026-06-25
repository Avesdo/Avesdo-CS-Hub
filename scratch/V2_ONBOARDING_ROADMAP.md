# V2 Onboarding Architecture Roadmap

**AI INSTRUCTION:** This document outlines the holistic strategy for moving all external onboarding operations (Google Forms, Google Sheets) directly into the CS Hub. It is the roadmap for the "V2 Onboarding Overhaul" currently happening on a parallel development branch.

## 1. The Goal
Transition the Avesdo CS Hub from an internal tracking ledger into a full-scale enterprise operational platform. We are eliminating all reliance on Google Forms and Google Sheets for Client QA, Primary/Secondary QA, Onboarding Surveys, and Deliverable Checklists.

## 2. Core Constraints & Strategy
*   **$0 Budget:** We remain strictly within the free tiers of Firebase (Firestore and Hosting).
*   **No Client Logins:** Clients will access their surveys and checklists via secure "Magic Links" rather than being forced to create accounts.
*   **Dynamic Intelligence:** Checklists and Forms must support conditional logic (e.g., question 2 only shows if question 1 is "Yes") and feature-dependencies (checklist items only generate if the project has the required feature enabled).

## 3. The 3-Stage Development Plan

### Stage 1: The Internal "Onboarding Hub" (Project Drawer)
Upgrade the internal Project Drawer to handle onboarding centrally.
*   Create an "Onboarding" tab in the Project Drawer.
*   Display raw KYC data fed from Sales/HubSpot.
*   Build native, interactive UIs for CS Managers to complete **Primary QA** and **Secondary QA** directly inside the Hub (saving results to Firestore).
*   Provide a centralized view showing the status of all other onboarding components.

### Stage 2: The Template Engine (Admin Hub)
Build the foundational intelligence in the Settings area.
*   Build a "Form Manager" where CS Admins can define the Onboarding Survey, Client QA, and Project Certification templates.
*   Build a "Checklist Manager" where CS Admins define deliverable tasks.
*   Implement the **Dependency Engine**: Allow form questions to have `dependsOn` logic.
*   Implement **Feature Mapping**: Allow checklist tasks to be explicitly linked to core/premium features so they only spawn for relevant projects.
*   Implement master CSV exporting for all historical submissions.

### Stage 3: The "Magic Link" Client Portal
Build the client-facing UI using secure public routing.
*   Build a responsive, Avesdo-branded public page (e.g., `/client/onboarding/:projectId/:secureToken`).
*   When a client opens the link, the React app queries Firestore for their specific required forms and dynamic checklist.
*   Clients can submit forms and update their checklist directly in the browser, with the data pushing instantly back to the internal CS Hub.