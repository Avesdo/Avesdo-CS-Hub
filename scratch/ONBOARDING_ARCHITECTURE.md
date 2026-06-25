# Avesdo CS Hub: Onboarding Architecture & Automation

This document outlines the strategic architecture for replacing external Google Forms and Sheets with a native, intelligent, $0-cost Firebase onboarding engine.

## The Goal
Transition the Avesdo Client Success workflow from disconnected external tools into a unified, enterprise-grade SaaS experience natively within the CS Hub.

## The 3-Stage Roadmap

### Stage 1: The Internal "Onboarding Hub" (Project Drawer)
*   **Goal:** Eliminate internal Google Forms and centralize onboarding data visibility.
*   **Implementation:** Add a new "Onboarding" tab to the internal Project Drawer.
*   **Features:**
    *   Display raw KYC data (fed from HubSpot/Sales).
    *   Native UI for CS Managers to execute the **Primary QA** and **Secondary QA** workflows directly in the portal.
    *   Read-only views of client-submitted survey data.

### Stage 2: The Template Engine (Admin Hub)
*   **Goal:** Build a custom form and checklist builder to standardize data collection.
*   **Implementation:** Add a "Form & Checklist Manager" to the Admin Hub `Settings.tsx` interface.
*   **Features:**
    *   **Conditional Logic Engine:** Ability to create "Depends On" rules for survey questions (e.g., Question 5 only appears if Question 4 is "Yes").
    *   **Feature-Dependent Checklists:** Ability to tag deliverable tasks with specific "Features." When a project is created, the system auto-generates a unique checklist containing only the baseline tasks + tasks tied to their purchased features.

### Stage 3: The "Magic Link" Client Portal
*   **Goal:** Provide a premium, branded experience for clients to complete onboarding without requiring a user login.
*   **Implementation:** Create a secure, public-facing React route (e.g., `/client/onboarding/:projectId/:token`).
*   **Features:**
    *   Clients click a secure emailed link to access a branded Avesdo portal.
    *   Clients complete the **Onboarding Survey**, **Client QA**, and **Project Certification** natively on this screen.
    *   Clients can view and interact with their customized **Deliverables Checklist**.
    *   All data saves instantly to Firestore, updating the internal CS Hub in real-time.