with open('ROADMAP.md', 'r') as f:
    content = f.read()

new_step = '''
### Step 14: Deep Linking, Performance, & UX Refinement [COMPLETED]
Scaling the application's capabilities onto your stable, verified framework.
*   **Data Integrity & Validation:** Migrated to Zod schemas to sanitize all incoming real-time Firebase data, protecting the UI from crash-inducing undefined variables.
*   **State Separation:** Refactored a bloated AppStateContext into atomic, perfectly segmented Zustand store selectors to eliminate unnecessary layout thrashing.
*   **Accessibility & UX:** Replaced custom dropdowns and modals with Radix UI Headless primitives to ensure perfect focus trapping, ARIA accessibility, and smooth CSS-based exit animations.
*   **Deep Linking:** Upgraded the UIContext to map Drawer navigation state to React Router `useSearchParams`, allowing power users to bookmark and share specific clients/projects natively.
*   **Code Splitting:** Split massive third-party dependencies (like `tiptap` in the Rich Text Editor) using `React.lazy` to drastically slash initial load times.
*   **Keyboard Shortcuts:** Integrated a robust `Cmd+K` global search hotkey for instant query focusing.
'''

content += new_step

with open('ROADMAP.md', 'w') as f:
    f.write(content)

print("ROADMAP updated")
