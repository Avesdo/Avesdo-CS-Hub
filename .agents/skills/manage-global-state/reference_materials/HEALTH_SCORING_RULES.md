# Avesdo CS Hub - Health Scoring Rules

This document serves as the absolute source of truth for the Health Scoring system on the Avesdo CS Hub. All AI agents working on this codebase must strictly adhere to these definitions and mathematical logic.

## 1. Platform Engagement (Max 100 Points)
Tracks project utilization via page views based on Userpilot data. Split into two 50-point chunks:
- **Breadth (50 pts):** Based on the number of distinct core tagged pages used.
  - 4+ distinct pages = 50 pts
  - 2-3 distinct pages = 35 pts
  - 1 distinct page = 15 pts
  - 0 distinct pages = 0 pts
- **Depth (50 pts):** Based on the total volume of page views per month.
  - 200+ avg monthly views = 50 pts
  - 100-199 avg monthly views = 35 pts
  - 25-99 avg monthly views = 15 pts
  - <25 avg monthly views = 0 pts
- **Missing Data:** If there is no telemetry data available (not recorded), the UI gracefully displays `--` instead of `0` in modals, though it still mathematically contributes `0` points towards the overall score calculation.

## 2. Active Users (Max 100 Points)
Tracks user activity on a project based on Userpilot data. Split into two 50-point chunks:
- **Volume (50 pts):** Number of unique active users on a project.
  - 5+ active users = 50 pts
  - 3-4 active users = 35 pts
  - 1-2 active users = 15 pts
  - 0 active users = 0 pts
- **Frequency (50 pts):** Average number of sessions per user.
  - 10+ avg sessions = 50 pts
  - 4-9 avg sessions = 35 pts
  - 1-3 avg sessions = 15 pts
  - 0 avg sessions = 0 pts
- **Missing Data:** Similar to Engagement, if telemetry data is not recorded, the UI displays `--` instead of `0`, while structurally providing `0` to the overall score.

## 3. Feature Adoption (Max 100 Points)
Ratio of features currently being used on a project against all available add-on features.
- **Formula:** `50 + (Active Add-on Features / Total Available Add-on Features) * 50`
- **Logic:** Projects start with a 50-point baseline to represent "Core Platform" usage. The remaining 50 points represent the adoption of available add-on features.

## 4. Financial Standing (Max 100 Points)
Overall invoice payment health. Simplified binary logic based purely on project status or invoice status.
- **Current (100 pts):** Default status unless flagged otherwise.
- **Overdue (0 pts):** If `projectStatus`, `status`, or `invoiceStatus` is exactly `'Suspended'` or `'Suspend'`.
*(Note: A Client's financial score is an aggregate of its projects. If even one project is Suspended (0 pts), the Client's overall financial health is severely impacted.)*

## 5. Client Sentiment (Max 100 Points)
Blended score tracking implementation sentiment, ongoing support feedback, and platform NPS.
- **Project Scope:** Projects *only* use **Onboarding CSAT** (submitted via onboarding form).
- **Client Scope:** Clients use a combination of **Onboarding CSAT** (averaged across active projects), **Support CSAT** (from Happyfox), and **Platform NPS** (from Userpilot).
- **Averaging Logic:** A strict average of all available data points (up to 3).
  - Calculates the average of `Onboarding CSAT`, `Support CSAT`, and `Platform NPS`.
  - Discards any data point that is missing or "N/A" before averaging.
- **Missing Data (Dynamic Re-weighting):** If a project or client has *no* CSAT data available, the CSAT pillar displays as "N/A" and its weight is gracefully discarded. The overall Total Score dynamically re-weights out of the remaining active pillars so it is not unfairly penalized.

## 6. The Data Compiler (Happyfox & Userpilot)
- Operates on a **Snapshot Replacement** model. When a report is uploaded, it overwrites the existing database scores for any clients/projects found in that file.
- **Happyfox Support CSAT:** Raw feedback must be grouped by the parent Client Organization (not individual users). It sums `Happy`, `Neutral`, and `Sad` tallies, then calculates a weighted score: `((Happy*100) + (Neutral*50) + (Sad*0)) / Total Feedback`. It saves a rich object to the DB containing the score and the raw breakdown.
- **Userpilot Platform NPS:** Raw feedback must be grouped by the parent Client Organization. It categorizes 0-10 scores into Promoters (9-10), Passives (7-8), and Detractors (0-6). Then calculates a normalized 0-100 score for our ecosystem: `((Promoters*100) + (Passives*50) + (Detractors*0)) / Total Feedback`. It saves a rich object to the DB containing the score and the array of raw qualitative user feedback.
