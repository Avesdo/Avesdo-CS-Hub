# Onboarding Tab UI Layout Plan (V2)

Thank you for the additional context on KYC and the actor responsibilities. Here is the updated architectural roadmap for the `ProjectOnboardingTab`.

## 1. Top Section: Global Setup & Links
Since KYC data is a massive wall of text that is rarely referenced after initial creation, placing it directly above the timeline would destroy the visual hierarchy and push the most important content (the timeline) below the fold.

**The Refined Plan:**
At the top of the tab, we will have a single, sleek "Quick Actions" bar containing:
- **Client Portal Link**: A pill containing the portal URL, a "Copy" icon, and a "Preview" button.
- **View KYC Details Button**: A subtle ghost button (`<FileText /> View KYC`). Clicking this will open the KYC data in a **Slide-Over Drawer** or **Modal**, keeping it completely out of the way of the main interface but easily accessible when needed.

## 2. Middle Section: The Implementation Timeline
We will build a vertical stepper mapping exactly to your 8 milestones. 

Based on your clarification regarding *who* does *what*, we will enhance the timeline UI by adding **Actor Badges** (e.g., a small `Internal` or `Client` pill) next to the milestone titles. This adds massive value for your CS team at a glance.

### Timeline Mapping
1. **Not Started** (Survey Sent)
2. **Onboarding Survey Received**
   - *Trigger*: `[View Survey]` (Opens Survey Modal)
3. **Setup in Progress** (Awaiting Inputs)
   - *Trigger*: `[Deliverables Checklist]` (Opens Deliverables Modal)
   - *Note*: As requested, this maps perfectly to the start of site setup and is collaborative.
4. **Primary QA** 
   - *Badge*: `Internal`
   - *Trigger*: `[Primary QA Form]`
5. **Client QA**
   - *Badge*: `Client`
   - *Trigger*: `[Client QA Form]`
6. **Secondary QA**
   - *Badge*: `Internal`
   - *Trigger*: `[Secondary QA Form]`
7. **Project Certification**
   - *Badge*: `Client`
   - *Trigger*: `[Certification Form]`
8. **Released**

### Node UI Mechanics
- **Completed**: Solid green circle + Check icon. Action buttons become `[View]`.
- **Active Phase**: Pulsing primary blue circle. Action buttons become `[Start]`.
- **Pending Phase**: Hollow grey circle.

## 3. Top-Right: Phase Override Dropdown
A "Current Phase" dropdown picker at the very top right of the timeline section, allowing a manager to manually override the timeline's active node at any time (reading from `settings.phases`).

---

## User Review Required
> [!IMPORTANT]
> **Does this refinement solve the KYC real estate issue?**
> By throwing KYC into a separate modal/drawer triggered by a top-bar button, the timeline becomes the absolute focus of the page.
> 
> Let me know if you approve this V2 layout plan!