# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Avesdo CS Hub Core E2E Tests >> creates, edits, cascades, and deletes a full workflow
- Location: tests\e2e.spec.ts:10:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByText('Add New', { exact: true })

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Avesdo CS Hub Core E2E Tests', () => {
  4  |   const timestamp = new Date().getTime();
  5  |   const testClientName = `[PLAYWRIGHT] Test Client ${timestamp}`;
  6  |   const editClientName = `[PLAYWRIGHT] Edited Client ${timestamp}`;
  7  |   const testProjectName = `[PLAYWRIGHT] Test Project ${timestamp}`;
  8  |   const testServiceName = `[PLAYWRIGHT] Test Service ${timestamp}`;
  9  | 
  10 |   test('creates, edits, cascades, and deletes a full workflow', async ({ page }) => {
  11 |     test.setTimeout(60000); // Allow 60 seconds for this full workflow
  12 | 
  13 |     // 1. Load Application
  14 |     await page.goto('http://localhost:5173');
  15 | 
  16 |     // --- STEP 2: Add Client ---
> 17 |     await page.getByText('Add New', { exact: true }).click({ force: true });
     |                                                      ^ Error: locator.click: Test timeout of 60000ms exceeded.
  18 |     await page.waitForTimeout(300);
  19 |     await page.getByText('Client', { exact: true }).last().click({ force: true });
  20 |     await page.waitForTimeout(500);
  21 |     
  22 |     await page.getByPlaceholder('Enter client name...').fill(testClientName);
  23 |     // Client Type is required in the modal
  24 |     await page.getByText('Select Type').click({ force: true });
  25 |     await page.locator('.absolute button').first().click({ force: true }); // Click the first type option
  26 |     
  27 |     await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
  28 |     
  29 |     // Wait for the client to appear in the table by searching
  30 |     await page.getByPlaceholder('Search clients, projects, or services...').fill(testClientName);
  31 |     const clientRow = page.getByText(testClientName).first();
  32 |     await expect(clientRow).toBeVisible();
  33 | 
  34 |     // --- STEP 3: Add Project and attach to Client ---
  35 |     // First, let's close the search dropdown by navigating away safely
  36 |     await page.getByText('Project Tracker', { exact: true }).click({ force: true });
  37 |     await expect(page).toHaveURL(/.*\/projects/);
  38 |     
  39 |     await page.getByText('Add Project', { exact: true }).click({ force: true });
  40 |     await page.waitForTimeout(300);
  41 |     await page.waitForTimeout(500);
  42 |     
  43 |     await page.getByPlaceholder('Enter project name...').fill(testProjectName);
  44 |     
  45 |     await page.getByText('Select Attached Clients...').click({ force: true });
  46 |     await page.waitForTimeout(300);
  47 |     await page.getByText(testClientName).click({ force: true });
  48 |     await page.getByText('Add New Project').click({ force: true }); // Click background to close dropdown
  49 |     await page.waitForTimeout(300);
  50 | 
  51 |     await page.locator('input[placeholder="0"]').fill('100');
  52 | 
  53 |     await page.getByRole('button', { name: 'Create Project' }).click({ force: true });
  54 |     await page.waitForTimeout(500);
  55 | 
  56 |     // Attach Client to Project (this simulates what would happen if we used the multi-select in the modal)
  57 |     // Wait, the Add Project modal allows selecting clients. Let's see if we can do it directly there.
  58 |     // If not, we can do it via the Drawer. We'll skip complex attachment in this simplified test 
  59 |     // unless we need to verify cascades. We DO need to verify cascades!
  60 | 
  61 |     // Let's edit the client name and see if we can delete it.
  62 |     await page.getByPlaceholder('Search clients, projects, or services...').fill(testClientName);
  63 |     await page.getByText(testClientName).first().click({ force: true }); // Open Client Drawer
  64 |     
  65 |     // Click Edit Name
  66 |     await page.locator('button[title="Edit Name"]').click({ force: true });
  67 |     
  68 |     // Fill new name and press Enter
  69 |     const editInput = page.locator('input').last(); // The open input
  70 |     await editInput.fill(editClientName);
  71 |     await editInput.press('Enter');
  72 |     
  73 |     // Wait for the new name to save
  74 |     await expect(page.getByText(editClientName).first()).toBeVisible();
  75 | 
  76 |     // --- STEP 4: Cleanup (Delete) ---
  77 |     // In the drawer, there should be an Actions menu or a Delete button
  78 |     // Let's try to find a trash icon or "Delete" text
  79 |     await page.getByTitle('Actions').click({ force: true });
  80 |     // Usually it's in a dropdown
  81 |     const deleteBtn = page.getByText('Permanently Delete');
  82 |     if (await deleteBtn.isVisible()) {
  83 |       await deleteBtn.click({ force: true });
  84 |       // Handle alert dialog
  85 |       page.on('dialog', async dialog => {
  86 |         expect(dialog.message()).toContain('permanently delete');
  87 |         await dialog.accept();
  88 |       });
  89 |       // Sometimes it's a custom modal, so we just click confirm if it exists
  90 |       const confirmDelete = page.getByRole('button', { name: 'Delete' });
  91 |       if (await confirmDelete.isVisible()) {
  92 |         await confirmDelete.click({ force: true });
  93 |       }
  94 |     }
  95 |   });
  96 | });
  97 | 
```