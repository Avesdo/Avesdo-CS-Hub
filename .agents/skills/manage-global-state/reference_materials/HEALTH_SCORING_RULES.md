# Avesdo CS Hub - Health Scoring Rules

This document serves as the absolute source of truth for the Health Scoring system on the Avesdo CS Hub (`src/utils/scoringUtils.ts` and `src/utils/qualityUtils.ts`). All AI agents working on this codebase must strictly adhere to these definitions and mathematical logic.

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
Overall invoice and account payment health.
- **Current (100 pts):** Default status unless flagged otherwise.
- **Overdue / Suspended (0 pts):** If `paymentStatus` or `invoiceStatus` is `'Overdue'`, or if `projectStatus`, `status`, or `invoiceStatus` is `'Suspended'` or `'Suspend'`.
*(Note: A Client's financial score is an aggregate of its projects. If even one project is Overdue or Suspended (0 pts), the Client's overall financial health reflects that impact.)*

## 5. Client Sentiment & Onboarding CSAT (Max 100 Points)
Blended score tracking implementation sentiment, ongoing support feedback, and platform NPS.
- **Project Scope:** Projects *only* use **Onboarding CSAT** (submitted via the Onboarding Survey form). Both `scoringUtils.ts` (`calculateProjectHealth`) and `qualityUtils.ts` (`extractCsatMetrics`) MUST share identical calculation rules so the Project Health tab and Onboarding CSAT modal always match:
  - **5-Point Likert Text Responses:**
    - `Very Satisfied` / `Extremely Satisfied` / `Strongly Agree` / `Excellent` = `100`
    - `Satisfied` / `Somewhat Satisfied` / `Agree` / `Somewhat Agree` / `Good` = `75`
    - `Neutral` / `Neither` / `Acceptable` / `Fair` / `Average` = `50`
    - `Dissatisfied` / `Somewhat Dissatisfied` / `Disagree` / `Somewhat Disagree` / `Poor` = `25`
    - `Very Dissatisfied` / `Extremely Dissatisfied` / `Strongly Disagree` / `Terrible` = `0`
  - **Numeric Ratings:**
    - **10-Point Scale (NPS / Recommendation questions or values `> 5` and `<= 10`):** Scored out of 10 (`(val / 10) * 100`, e.g., `8` = `80%`).
    - **5-Point Scale (standard numeric ratings `<= 5`):** Scored out of 5 (`(val / 5) * 100`, e.g., `4` = `80%`).
  - **Excluded Fields:** Metadata keys (`id`, `submittedAt`, `updatedAt`, `submittedBy`, `projectId`, `status`, `createdAt`, `score`), unanswered values (`Unanswered`, `N/A`, empty strings), and open-ended comment/recognition questions (`comment`, `feedback`, `recognize`, `note`, `additional`) are excluded from the quantitative score average.
- **Client Scope:** Clients use an average of available data points across **Onboarding CSAT** (averaged across active projects), **Support CSAT** (from Happyfox), and **Platform NPS** (from Userpilot), discarding any pillar that is missing (`N/A`).
- **Missing Data (Dynamic Re-weighting):** If a project or client has *no* sentiment data available, the Sentiment pillar displays as `N/A` and its weight is discarded so the total health score dynamically re-weights across the remaining active pillars.

## 6. The Data Compiler (Happyfox & Userpilot)
- Operates on a **Snapshot Replacement** model. When a report is uploaded, it updates the database scores for clients/projects matched in that file.
- **Happyfox Support CSAT:** Raw feedback is grouped by parent Client Organization. Sums `Happy`, `Neutral`, and `Sad` tallies, then calculates a weighted score: `((Happy*100) + (Neutral*50) + (Sad*0)) / Total Feedback`.
- **Userpilot Platform NPS:** Raw feedback is grouped by parent Client Organization. Categorizes 0–10 scores into Promoters (9–10), Passives (7–8), and Detractors (0–6), then calculates a normalized 0–100 score: `((Promoters*100) + (Passives*50) + (Detractors*0)) / Total Feedback`.
