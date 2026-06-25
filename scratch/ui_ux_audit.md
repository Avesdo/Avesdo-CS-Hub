# Avesdo CS Hub: UI/UX & Workflow Audit

This document maps out the entire frontend architecture of the CS Hub. Use this as a menu to decide which specific workflows or UI layouts you want to rethink. 

## 1. Global UI Elements
*These elements are omnipresent and handle navigation and system feedback.*
*   **Sidebar Navigation:** The main left-hand menu routing users between ledgers.
*   **Global Search (`CMD+K`):** A unified search bar allowing users to jump directly to any Client, Project, or Service from any page.
*   **Global Toaster (Notifications):** The unified slide-in alerts (e.g., "Project Saved Successfully" or "Export Failed").

## 2. Primary Pages (The Ledgers)
*These are the massive data tables where users spend most of their time filtering and scanning.*
*   **Dashboard:** High-level KPI tiles, health distribution charts, and lists of recently launched projects or active services.
*   **Client Health:** The master ledger of all Developers/Brokerages, displaying their rolled-up health scores, financial standing, and active project counts.
*   **Project Tracker:** The master ledger of all individual construction projects, displaying their timelines, phases, unit counts, and health scores.
*   **Service Hub:** The master ledger of all billable/operational tasks, displaying what is being worked on, by whom, and its current status.
*   **Settings:** The admin configuration page where dropdown taxonomies, scoring math thresholds, and global team lists are managed.

## 3. Creation Workflows (Modals)
*These are the workflows used to inject new data into the system. They slide down from the top of the screen.*
*   **Add Client Workflow:** Captures company name, billing email, and basic contact information.
*   **Add Project Workflow:** The heaviest creation flow. Captures Developer mapping, timeline dates, unit counts, project managers, and initial phases.
*   **Add Service Workflow:** Captures the specific task, maps it to a Project, assigns a team member, and sets a due date and status.

## 4. Deep-Dive & Editing Workflows (Drawers)
*These are the workflows used to view deep analytics or edit existing data. They slide in from the right side of the screen.*
*   **Client Drawer:** A deep dive into a specific client. Shows their overarching health score, financial standing, and a sub-table of all the Projects they own.
*   **Project Drawer:** A deep dive into a specific construction project. Contains tabs for editing Timeline Dates, toggling active Features, and viewing operational activity history.
*   **Service Drawer:** A deep dive into a specific task. Contains tabs for updating the service status, logging outcomes (Won/Lost), and assigning personnel.
*   **Dashboard Drilldown Drawer:** When a user clicks a chart on the dashboard (e.g., "Show me all Red Health clients"), this drawer slides out to reveal the raw table data behind that chart segment.