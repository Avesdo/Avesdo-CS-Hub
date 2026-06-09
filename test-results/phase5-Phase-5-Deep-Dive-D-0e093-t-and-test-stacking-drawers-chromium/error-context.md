# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase5.spec.ts >> Phase 5: Deep Dive Drawers & Automations >> Create data, verify cascade on name edit, and test stacking drawers
- Location: tests\phase5.spec.ts:15:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByText('Add New', { exact: true })

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Phase 5: Deep Dive Drawers & Automations', () => {
  4   |   const timestamp = new Date().getTime();
  5   |   const testClientName = `Cascade Client ${timestamp}`;
  6   |   const editClientName = `Cascade Edited ${timestamp}`;
  7   |   const testProjectName = `Cascade Project ${timestamp}`;
  8   | 
  9   |   test.beforeEach(async ({ page }) => {
  10  |     // Navigate and set up data
  11  |     await page.goto('http://localhost:5173');
  12  |     await page.waitForTimeout(1000); // Allow load
  13  |   });
  14  | 
  15  |   test('Create data, verify cascade on name edit, and test stacking drawers', async ({ page }) => {
  16  |     test.setTimeout(45000);
  17  | 
  18  |     // 1. Create a Client
> 19  |     await page.getByText('Add New', { exact: true }).click({ force: true });
      |                                                      ^ Error: locator.click: Test timeout of 45000ms exceeded.
  20  |     await page.waitForTimeout(300);
  21  |     await page.getByText('Client', { exact: true }).last().click({ force: true });
  22  |     
  23  |     await page.getByPlaceholder('Enter client name...').fill(testClientName);
  24  |     await page.getByText('Select Type').click({ force: true });
  25  |     await page.locator('.absolute button').first().click({ force: true });
  26  |     await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
  27  |     await page.waitForTimeout(1000);
  28  | 
  29  |     // Navigate back to Dashboard to clear UI state
  30  |     await page.goto('http://localhost:5173/');
  31  |     await page.waitForTimeout(1000);
  32  | 
  33  |     // 2. Create a Project attached to the Client
  34  |     await page.getByRole('button', { name: 'Add New' }).click({ force: true });
  35  |     await page.waitForTimeout(300);
  36  |     await page.getByText('Project', { exact: true }).click({ force: true });
  37  |     
  38  |     await page.getByPlaceholder('Enter project name...').fill(testProjectName);
  39  |     await page.locator('input[placeholder="0"]').fill('100');
  40  |     
  41  |     // Select Attached Client
  42  |     await page.getByText('Select Attached Clients...').click({ force: true });
  43  |     await page.waitForTimeout(300);
  44  |     // Click the exact client we just created
  45  |     await page.getByText(testClientName, { exact: true }).last().click({ force: true });
  46  |     await page.getByText('Add New Project').click({ force: true }); // Click title to close dropdown
  47  |     await page.waitForTimeout(300);
  48  | 
  49  |     await page.getByRole('button', { name: 'Create Project' }).click({ force: true });
  50  |     await page.waitForTimeout(1000);
  51  | 
  52  |     // Navigate back to Dashboard to clear UI state
  53  |     await page.goto('http://localhost:5173/');
  54  |     await page.waitForTimeout(1000);
  55  | 
  56  |     // 3. Open Client Drawer and Edit Name
  57  |     await page.getByRole('link', { name: 'Client Health' }).click();
  58  |     await expect(page).toHaveURL(/.*\/clients/);
  59  |     
  60  |     await page.getByPlaceholder('Search clients...').fill(testClientName);
  61  |     await page.waitForTimeout(500);
  62  |     await page.getByText(testClientName).first().click({ force: true });
  63  |     
  64  |     // Verify Slide-out Drawer is visible by checking for the client name heading
  65  |     await expect(page.locator('h2', { hasText: testClientName }).first()).toBeVisible();
  66  |     await page.waitForTimeout(500); // Wait for slide-in animation to finish
  67  |     
  68  |     // Click Edit Name icon
  69  |     await page.locator('button[title="Edit Name"]').click({ force: true });
  70  |     // Use the drawer locator directly to find the input
  71  |     const editInput = page.locator('.fixed.right-0 input[type="text"]').first();
  72  |     await editInput.fill(editClientName);
  73  |     await editInput.press('Enter');
  74  |     await page.waitForTimeout(1000); // Wait for the DB update and toast
  75  |     
  76  |     // Verify name changed in the drawer
  77  |     await expect(page.getByText(editClientName).first()).toBeVisible();
  78  | 
  79  |     // 4. Stacking Drawers & Cascade verification
  80  |     // Navigate to projects tab inside client drawer
  81  |     await page.getByText('Projects', { exact: true }).first().click({ force: true });
  82  |     await page.waitForTimeout(300);
  83  |     // Switch to All or Onboarding filter to see the new project
  84  |     await page.getByRole('button', { name: 'All', exact: true }).click({ force: true });
  85  |     await page.waitForTimeout(300);
  86  | 
  87  |     // Click on the project to open Project Drawer on top
  88  |     await page.getByText(testProjectName).first().click({ force: true });
  89  | 
  90  |     // Verify Project Drawer is stacked (z-index higher than client drawer)
  91  |     const projectDrawer = page.locator('.fixed.right-0').last();
  92  |     await expect(projectDrawer.locator('h2', { hasText: testProjectName })).toBeVisible();
  93  |     await page.waitForTimeout(500);
  94  | 
  95  |     // Verify cascade: the project drawer should show the NEW client name
  96  |     await expect(projectDrawer.getByText(editClientName).first()).toBeVisible();
  97  |     
  98  |     // Close top drawer
  99  |     let allCloseBtns = await page.locator('button[title="Close Drawer"]').all();
  100 |     if (allCloseBtns.length > 0) {
  101 |         await allCloseBtns[allCloseBtns.length - 1].click({ force: true });
  102 |         await page.waitForTimeout(500);
  103 |     }
  104 |     // Client drawer should still be there
  105 |     await expect(page.locator('h2', { hasText: editClientName }).first()).toBeVisible();
  106 | 
  107 |     // Close client drawer
  108 |     allCloseBtns = await page.locator('button[title="Close Drawer"]').all();
  109 |     if (allCloseBtns.length > 0) {
  110 |         await allCloseBtns[allCloseBtns.length - 1].click({ force: true });
  111 |         await page.waitForTimeout(500);
  112 |     }
  113 |   });
  114 | });
  115 | 
```