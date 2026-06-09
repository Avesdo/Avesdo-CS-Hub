# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clients.spec.ts >> Client Health Component Tests >> Navigates to Client Health, creates a client, uses drawers, and deletes
- Location: tests\clients.spec.ts:8:3

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
  3  | test.describe('Client Health Component Tests', () => {
  4  |   const timestamp = new Date().getTime();
  5  |   const testClientName = `[E2E TEST] Client ${timestamp}`;
  6  |   const testNote = `[E2E TEST] Initial Note ${timestamp}`;
  7  | 
  8  |   test('Navigates to Client Health, creates a client, uses drawers, and deletes', async ({ page }) => {
  9  |     test.setTimeout(45000);
  10 |     
  11 |     // 1. Load Application
  12 |     await page.goto('http://localhost:5173');
  13 | 
  14 |     // 2. Navigate to Client Health
> 15 |     await page.getByText('Client Health', { exact: true }).click({ force: true });
     |                                                            ^ Error: locator.click: Test timeout of 45000ms exceeded.
  16 |     await expect(page).toHaveURL(/.*\/clients/);
  17 | 
  18 |     // 3. Create a test client
  19 |     await page.getByText('Add Client', { exact: true }).click({ force: true });
  20 |     await page.waitForTimeout(500);
  21 |     
  22 |     await page.getByPlaceholder('Enter client name...').fill(testClientName);
  23 |     
  24 |     // Select Type
  25 |     await page.getByText('Select Type').click({ force: true });
  26 |     await page.locator('.absolute button').first().click({ force: true }); 
  27 |     
  28 |     // Add note
  29 |     await page.getByPlaceholder('Enter an optional note...').fill(testNote);
  30 | 
  31 |     await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
  32 | 
  33 |     // 4. Verify Client in Table and open Drawer
  34 |     await expect(page.getByText(testClientName).first()).toBeVisible();
  35 |     await page.getByText(testClientName).first().click({ force: true });
  36 |     await page.waitForTimeout(500);
  37 | 
  38 |     // 5. Test Tabs in Drawer
  39 |     await page.locator('button:has-text("Projects")').first().click({ force: true });
  40 |     await expect(page.getByText('Active Projects').first()).toBeVisible();
  41 |     
  42 |     await page.locator('button:has-text("Services")').first().click({ force: true });
  43 |     await expect(page.getByText('Active Services').first()).toBeVisible();
  44 |     
  45 |     await page.getByText('Trends').click({ force: true });
  46 |     await expect(page.getByText('Score Trajectory').first()).toBeVisible();
  47 |     
  48 |     await page.getByText('Notes').click({ force: true });
  49 |     await expect(page.getByText(testNote).first()).toBeVisible();
  50 | 
  51 |     // 6. Cleanup (Delete Client)
  52 |     // Wait for the delete process
  53 |     // Currently, delete logic is in Actions -> Permanently Delete
  54 |     // (If actions dropdown exists, click it)
  55 |     await page.getByText('Overview').click({ force: true }); // Back to overview
  56 |     
  57 |     // We'll skip complex deletion here since e2e.spec.ts covers it, but let's try to verify the client exists in table.
  58 |     await page.locator('.fixed.inset-0.bg-black\\/40').last().click({ position: { x: 10, y: 10 } }); // Click outside to close drawer
  59 |     
  60 |     await page.getByPlaceholder('Search clients...').fill(testClientName);
  61 |     await expect(page.getByText(testClientName).first()).toBeVisible();
  62 |   });
  63 | });
  64 | 
```