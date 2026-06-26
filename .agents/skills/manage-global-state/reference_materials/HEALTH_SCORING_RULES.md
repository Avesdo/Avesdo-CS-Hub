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

## 3. Feature Adoption (Max 100 Points)
Ratio of features currently being used on a project against all available add-on features.
- **Formula:** `50 + (Active Add-on Features / Total Available Add-on Features) * 50`
- **Logic:** Projects start with a 50-point baseline to represent "Core Platform" usage. The remaining 50 points represent the adoption of available add-on features.

## 4. Financial Standing (Max 100 Points)
Overall invoice payment health. Simplified binary logic based purely on project status.
- **Current (100 pts):** If `projectStatus` is anything other than Suspended.
- **Overdue (0 pts):** If `projectStatus === 'Suspended'`.
*(Note: A Client's financial score is an aggregate of its projects. If even one project is Suspended (0 pts), the Client's overall financial health is severely impacted.)*

## 5. Client Sentiment (Max 100 Points)
Blended score tracking both implementation sentiment and ongoing support feedback.
- **Project Scope:** Projects *only* use **Onboarding CSAT** (submitted via onboarding form).
- **Client Scope:** Clients use a combination of **Onboarding CSAT** (averaged across all their active projects) and **Support CSAT** (from the Happyfox Satisfaction Report).
- **Averaging Logic:** A strict 50/50 split.
  - If both exist: `(Onboarding CSAT + Support CSAT) / 2`
  - If only Onboarding exists: 100% Onboarding CSAT
  - If only Support exists: 100% Support CSAT
- **Missing Data (Dynamic Re-weighting):** If a project or client has *no* CSAT data available, the CSAT pillar displays as "N/A" and its weight is gracefully discarded. The overall Total Score dynamically re-weights out of the remaining active pillars so it is not unfairly penalized.

## 6. The Data Compiler (Happyfox & Userpilot)
- Operates on a **Snapshot Replacement** model. When a report is uploaded, it overwrites the existing database scores for any clients/projects found in that file.
- **Happyfox Support CSAT:** Raw feedback must be grouped by the parent Client Organization (not individual users). It sums `Happy`, `Neutral`, and `Sad` tallies, then calculates a weighted score: `((Happy*100) + (Neutral*50) + (Sad*0)) / Total Feedback`. It saves a rich object to the DB containing the score and the raw breakdown.
