# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase3.spec.ts >> Phase 3: The Client Ledger (List View & Drawers) >> Table Layout & Aesthetics
- Location: tests\phase3.spec.ts:11:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
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
  3  | test.describe('Phase 3: The Client Ledger (List View & Drawers)', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:5173');
> 6  |     await page.getByText('Client Health', { exact: true }).click({ force: true });
     |                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  7  |     await expect(page).toHaveURL(/.*\/clients/);
  8  |     await page.waitForTimeout(1000); // Let data load
  9  |   });
  10 | 
  11 |   test('Table Layout & Aesthetics', async ({ page }) => {
  12 |     // Check fixed header and specific styles
  13 |     const tableHeader = page.locator('thead').first();
  14 |     await expect(tableHeader).toBeVisible();
  15 |     await expect(tableHeader).toHaveClass(/sticky/); // should be sticky top
  16 | 
  17 |     // Check row hovers
  18 |     const firstRow = page.locator('tbody tr').first();
  19 |     await expect(firstRow).toBeVisible();
  20 |     await expect(firstRow).toHaveClass(/hover:bg-slate-50/); // typical row hover
  21 |   });
  22 | 
  23 |   test('Sorting & Filtering', async ({ page }) => {
  24 |     // Check if TableFilters component exists (Search, Status, etc)
  25 |     const searchInput = page.getByPlaceholder('Search clients...');
  26 |     await expect(searchInput).toBeVisible();
  27 | 
  28 |     // Perform a search
  29 |     await searchInput.fill('TestSearchClientQuery');
  30 |     // Wait for debounce
  31 |     await page.waitForTimeout(500);
  32 | 
  33 |     // Click to sort by Health Score
  34 |     const scoreHeader = page.getByText('Score').first();
  35 |     if (await scoreHeader.isVisible()) {
  36 |       await scoreHeader.click();
  37 |     }
  38 |   });
  39 | 
  40 |   test('Action Buttons & Detail Drawer', async ({ page }) => {
  41 |     // Clear any previous filters
  42 |     await page.getByPlaceholder('Search clients...').fill('');
  43 |     await page.waitForTimeout(500);
  44 | 
  45 |     const firstRow = page.locator('tbody tr').first();
  46 |     await expect(firstRow).toBeVisible();
  47 | 
  48 |     // Click the row to open drawer
  49 |     await firstRow.click({ force: true });
  50 | 
  51 |     // Drawer should slide in
  52 |     const drawer = page.locator('.fixed.right-0').first();
  53 |     await expect(drawer).toBeVisible({ timeout: 5000 });
  54 | 
  55 |     // Verify Tabs exist in Client Drawer
  56 |     await expect(page.getByText('Health', { exact: true }).first()).toBeVisible();
  57 |     await expect(page.getByText('Projects', { exact: true }).first()).toBeVisible();
  58 |     await expect(page.getByText('Trends', { exact: true }).first()).toBeVisible();
  59 |     await expect(page.getByText('Notes & Logs', { exact: true }).first()).toBeVisible();
  60 | 
  61 |     // Close drawer
  62 |     await page.keyboard.press('Escape');
  63 |     await expect(drawer).toBeHidden();
  64 |   });
  65 | });
  66 | 
```