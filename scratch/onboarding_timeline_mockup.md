# Onboarding Tab Design & Timeline Mockup

Here is the exact structural layout and a visual mockup of how the new **Project Onboarding Tab** will look and function.

## 1. Top Section: Global Setup
At the very top of the tab, before the timeline begins, we will house the foundational project setup elements in sleek, full-width section cards:

1. **Client Portal Access**: A clean card showing the portal URL with a "Copy Link" and "Preview" button.
2. **KYC Details**: A collapsible section (using smooth Framer Motion animation) that houses the rich text editor for KYC notes.

---

## 2. Main Section: Implementation Timeline
Below the setup cards, we will introduce the vertical stepper. It will use a continuous vertical line down the left side, with circular nodes representing each milestone. 

The active phase will be highlighted in primary brand colors, while future phases are greyed out, and completed phases show a green checkmark.

### Visual Mockup

> **Implementation Timeline**
>
> 🟢 **1. Not Started (Survey Sent)**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Status: Completed`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ View Survey Form ]
>
> 🟢 **2. Onboarding Survey Received**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Status: Completed on Oct 12, 2023`
>
> 🔵 **3. Setup in Progress (Awaiting Inputs)** `← ACTIVE PHASE`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Platform configuration and deliverable tracking is currently underway.*
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ View Deliverables Checklist ]
>
> ⚪ **4. Primary QA**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Status: Pending`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ Start Primary QA ]
>
> ⚪ **5. Client QA**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Status: Pending`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ Open Client QA Form ]
>
> ⚪ **6. Secondary QA**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Status: Pending`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ Start Secondary QA ]
>
> ⚪ **7. Project Certification**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Status: Pending`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ View Certification ]
>
> ⚪ **8. Released**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Status: Pending`
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ Mark as Released ]

---

## 3. UI/UX Mechanics
- **Contextual Actions**: Notice how the buttons to open the modals (e.g., `[ View Deliverables Checklist ]`) are embedded *directly inside* the relevant milestone. This completely replaces the old, disconnected "Action Card Grid".
- **Auto-Progression**: As forms are submitted, the timeline will automatically detect the completion state and highlight the next node as the "Active Phase".
- **Styling**: The nodes will use enterprise SaaS aesthetics: soft glowing halos for the active node (`ring-4 ring-primary/20`), crisp white cards for the active step's content, and muted/ghost styling for future steps.

## User Review Required
> [!IMPORTANT]
> **Does this mockup align with your vision for the onboarding flow?**
> If you approve, I will immediately begin rewriting `ProjectOnboardingTab.tsx` to implement this design!