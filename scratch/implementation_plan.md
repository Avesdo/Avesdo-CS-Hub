# Implement Form State Transitions & Client Portal Save Progress

Based on your instructions, here is the plan to ensure the Survey transitions map perfectly to your workflow and that clients have a smooth experience filling it out.

## Open Questions

- **"The survey will not be available on the client portal and onboarding tab."**
  I assumed this was a typo and you meant "The survey will **now** be available", since the next bullet mentions the client opening the link to complete it. Let me know if I misunderstood!
  
- **Save Progress Button on other forms:**
  Should the "Save Progress" button also be available for the Client QA and Project Certification forms on the Client Portal? Or should it strictly be added to the Onboarding Survey for now?

## Proposed Changes

### 1. `src/components/modals/projectProfile/ProjectOnboardingTab.tsx`
- **Milestone Configuration:** Update the `MILESTONES` array, specifically the `Onboarding Survey` node.
  - Remove the "Generate Survey" action button if the project phase is "Not Started".
  - If the phase is "Onboarding Survey Sent" and the survey hasn't been generated, display text: *"Please generate the survey and send the link to the client."* alongside the **Generate Survey** button.
  - If the survey is generated but not submitted, display: *"Survey dispatched. Awaiting client submission."* and change the button to **View Survey**.
  - If the survey is submitted, display: *"Survey successfully received and recorded."*

### 2. `src/components/ui/DynamicForm.tsx`
- **Add Save Progress Action:** Add an optional `onSaveProgress` callback prop.
- Render a **"Save Progress"** ghost button next to the primary "Submit" button on the final page of the form, or globally next to the "Next/Submit" buttons so clients can save at any point without reaching the last page. 

### 3. `src/pages/ClientPortal.tsx`
- **Support In Progress State:** 
  - Update the dashboard rendering logic to display an **"In Progress"** badge (e.g., using a blue tint instead of the yellow "Pending" tint) if a form's status is `'In Progress'`.
  - Pass the new `onSaveProgress` handler into the `DynamicForm`. When triggered, this handler will save the current form data directly to the database with `status: 'In Progress'`, without routing the client to the success screen.

### 4. `src/components/modals/OnboardingSurveyModal.tsx` (and other QA modals if applicable)
- **Support In Progress State:** Ensure the internal views gracefully handle the `'In Progress'` status for previewing what the client has saved so far.

## Verification Plan

### Manual Verification
1. Open a new project (Not Started). Verify the Client Portal is blank and the Onboarding Survey node has no Generate button.
2. Change the project phase to "Onboarding Survey Sent". Verify the Generate Survey button appears with the correct prompt text.
3. Click Generate Survey. Verify the text changes to "Survey dispatched", the Client Portal now shows the survey, and the button changes to "View Survey".
4. Open the survey on the Client Portal. Fill out a few fields and click "Save Progress".
5. Return to the Client Portal Dashboard. Verify the survey now shows an "In Progress" badge.
6. Complete the survey and click "Submit". Verify it routes to the Success screen.
7. Check the internal project profile. Verify the phase automatically advanced to "Onboarding Survey Received" and the node reflects the completed status.