# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase6.spec.ts >> Phase 6: Admin Hub & Settings >> Review Settings profile and organization preferences
- Location: tests\phase6.spec.ts:46:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Settings' })

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Constants for test data
  4  | const testAccountManager = `Test Manager ${Date.now()}`;
  5  | 
  6  | test.describe('Phase 6: Admin Hub & Settings', () => {
  7  |   // Use a slow mo to ensure animations complete if needed
  8  |   test.use({ actionTimeout: 10000 });
  9  | 
  10 |   test('Verify Admin Hub logs and Archives', async ({ page }) => {
  11 |     await page.goto('http://localhost:5173/');
  12 |     
  13 |     // Navigate to Admin Hub via Sidebar
  14 |     await page.getByRole('link', { name: 'Admin Hub' }).click();
  15 |     await expect(page).toHaveURL(/.*\/admin/);
  16 |     await expect(page.getByRole('heading', { name: 'Admin Hub' })).toBeVisible();
  17 | 
  18 |     // Verify Audit Trail Tab is active by default
  19 |     await expect(page.getByRole('button', { name: 'Audit Trail' })).toBeVisible();
  20 |     await expect(page.getByText('System audit logs and archived records.')).toBeVisible();
  21 | 
  22 |     // Test Audit Filters
  23 |     await page.getByRole('button', { name: 'Clients' }).click();
  24 |     await page.getByRole('button', { name: 'Projects' }).click();
  25 |     await page.getByRole('button', { name: 'Services' }).click();
  26 |     await page.getByRole('button', { name: 'Settings' }).click();
  27 |     await page.getByRole('button', { name: 'All' }).click();
  28 | 
  29 |     // Test Audit Search
  30 |     const searchInput = page.getByPlaceholder('Search logs...');
  31 |     await searchInput.fill('Test search');
  32 |     await page.waitForTimeout(300);
  33 |     await searchInput.fill('');
  34 | 
  35 |     // Switch to Archives Tab
  36 |     await page.getByRole('button', { name: 'Archives' }).click();
  37 |     await expect(page.getByPlaceholder('Search archives...')).toBeVisible();
  38 | 
  39 |     // Test Archive Sub-filters
  40 |     await page.getByRole('button', { name: 'Projects' }).click();
  41 |     await page.getByRole('button', { name: 'Services' }).click();
  42 |     await page.getByRole('button', { name: 'Settings' }).click();
  43 |     await page.getByRole('button', { name: 'Clients' }).click();
  44 |   });
  45 | 
  46 |   test('Review Settings profile and organization preferences', async ({ page }) => {
  47 |     await page.goto('http://localhost:5173/');
  48 | 
  49 |     // Navigate to Settings via Sidebar
> 50 |     await page.getByRole('link', { name: 'Settings' }).click();
     |                                                        ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  51 |     await expect(page).toHaveURL(/.*\/settings/);
  52 |     await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  53 | 
  54 |     // Verify default tab 'Organization' is active
  55 |     await expect(page.getByText('Account Managers')).toBeVisible();
  56 | 
  57 |     // Add a new Account Manager
  58 |     const managerInput = page.getByPlaceholder('New Account Manager...');
  59 |     await managerInput.fill(testAccountManager);
  60 |     await page.getByRole('button', { name: 'Add' }).first().click();
  61 | 
  62 |     // Verify the toast
  63 |     await expect(page.getByText(`'${testAccountManager}' was successfuly added to Account Managers.`)).toBeVisible();
  64 | 
  65 |     // Switch to Workflows Tab
  66 |     await page.getByRole('button', { name: 'Workflow & Status' }).click();
  67 |     await expect(page.getByRole('heading', { name: 'Project Status' })).toBeVisible();
  68 | 
  69 |     // Switch to Products Tab
  70 |     await page.getByRole('button', { name: 'Features & Services' }).click();
  71 |     await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();
  72 | 
  73 |     // Switch to Health Scoring Tab
  74 |     await page.getByRole('button', { name: 'Scoring Engine' }).click();
  75 |     await expect(page.getByRole('heading', { name: /Client Pillar Weights/ })).toBeVisible();
  76 |     await expect(page.getByRole('heading', { name: 'KPI Thresholds' })).toBeVisible();
  77 |     
  78 |     // Test Scoring Save
  79 |     await page.getByRole('button', { name: 'Save Rules' }).click();
  80 |     await expect(page.getByText('Scoring Rules Saved!')).toBeVisible();
  81 |   });
  82 | });
  83 | 
```