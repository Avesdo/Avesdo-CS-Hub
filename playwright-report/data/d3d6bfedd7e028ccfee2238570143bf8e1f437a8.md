# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects.spec.ts >> Project Tracker Component Tests >> Navigates to Project Tracker, creates project, and tests filters
- Location: tests\projects.spec.ts:7:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByText('Client Health', { exact: true })

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Project Tracker Component Tests', () => {
  4  |   const timestamp = new Date().getTime();
  5  |   const testProjectName = `[E2E TEST] Project ${timestamp}`;
  6  | 
  7  |   test('Navigates to Project Tracker, creates project, and tests filters', async ({ page }) => {
  8  |     test.setTimeout(45000);
  9  |     
  10 |     // 1. Load Application
  11 |     await page.goto('http://localhost:5173');
  12 | 
  13 |     // 3. Create a test client first so we have one to attach
> 14 |     await page.getByText('Client Health', { exact: true }).click({ force: true });
     |                                                            ^ Error: locator.click: Test timeout of 45000ms exceeded.
  15 |     await page.getByText('Add Client', { exact: true }).click({ force: true });
  16 |     await page.getByPlaceholder('Enter client name...').fill(`[E2E Project Dep] Client ${timestamp}`);
  17 |     await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
  18 |     await page.waitForTimeout(500);
  19 | 
  20 |     // Navigate to Project Tracker
  21 |     await page.getByText('Project Tracker', { exact: true }).click({ force: true });
  22 |     await expect(page).toHaveURL(/.*\/projects/);
  23 | 
  24 |     // 4. Create a test project
  25 |     await page.getByText('Add Project', { exact: true }).click({ force: true });
  26 |     await page.waitForTimeout(500);
  27 |     
  28 |     await page.getByPlaceholder('Enter project name...').fill(testProjectName);
  29 |     
  30 |     await page.getByText('Select Attached Clients...').click({ force: true });
  31 |     await page.waitForTimeout(300);
  32 |     await page.locator('.custom-thin-scroll button').first().click({ force: true });
  33 |     // Click on the modal background to close the dropdown
  34 |     await page.getByText('Add New Project').first().click({ force: true });
  35 |     await page.waitForTimeout(300);
  36 | 
  37 |     await page.locator('input[placeholder="0"]').fill('100');
  38 | 
  39 |     await page.getByRole('button', { name: 'Create Project' }).click({ force: true });
  40 |     await page.waitForTimeout(500);
  41 | 
  42 |     // 4. Verify Project appears in global search (Drawer might not open automatically unless handled)
  43 |     await page.getByPlaceholder('Search projects...').fill(testProjectName);
  44 |     
  45 |     // Test that the project row appears
  46 |     const projectRow = page.getByText(testProjectName).first();
  47 |     await expect(projectRow).toBeVisible();
  48 |     
  49 |     // 5. Test Filters
  50 |     // Click on Phase filter
  51 |     await page.getByText('All Phases').click({ force: true });
  52 |     await page.getByText('Sales').click({ force: true });
  53 |     
  54 |     // Click on Status filter
  55 |     await page.getByText('All Statuses').click({ force: true });
  56 |     await page.getByText('Active').click({ force: true });
  57 |   });
  58 | });
  59 | 
```