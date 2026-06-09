# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase2.spec.ts >> Phase 2: The Dashboard >> KPI Tiles & Calculations
- Location: tests\phase2.spec.ts:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Global Health Index').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Global Health Index').first()

```

```yaml
- paragraph: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Phase 2: The Dashboard', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:5173');
  6  |     // Wait for data to load
  7  |     await page.waitForTimeout(1000);
  8  |   });
  9  | 
  10 |   test('KPI Tiles & Calculations', async ({ page }) => {
  11 |     const kpiNames = ['Global Health Index', 'Live Units', 'Launch Pipeline', 'Service Revenue'];
  12 |     for (const name of kpiNames) {
  13 |       const tile = page.getByText(name).first();
> 14 |       await expect(tile).toBeVisible();
     |                          ^ Error: expect(locator).toBeVisible() failed
  15 |     }
  16 |   });
  17 | 
  18 |   test('Dash Drilldown Drawer', async ({ page }) => {
  19 |     // According to plan, clicking a KPI tile opens a drawer.
  20 |     // We will test the 'Launch Pipeline' tile since it's project based, 
  21 |     // which aligns best with DashDrilldownDrawer if they fix it to open drawer.
  22 |     // If it navigates, this fails.
  23 |     const pipelineTile = page.locator('div').filter({ hasText: /^Launch Pipeline/ }).first();
  24 |     await expect(pipelineTile).toBeVisible();
  25 |     await pipelineTile.click();
  26 | 
  27 |     // Expect a drawer to slide in from right
  28 |     // The drawer container usually has `fixed` and `right-0`
  29 |     const drawer = page.locator('.fixed.right-0').first();
  30 |     await expect(drawer).toBeVisible({ timeout: 5000 });
  31 |     
  32 |     // Press escape to close
  33 |     await page.keyboard.press('Escape');
  34 |     await expect(drawer).toBeHidden();
  35 |   });
  36 | 
  37 |   test('Widgets (Unscheduled Projects, Recent Activity)', async ({ page }) => {
  38 |     // Unscheduled Projects
  39 |     const unscheduledWidget = page.getByText('Unscheduled Projects').first();
  40 |     await expect(unscheduledWidget).toBeVisible();
  41 | 
  42 |     // Click 'View All' or similar button within the widget
  43 |     const viewAllBtn = page.getByRole('button', { name: /View All/i }).first();
  44 |     await expect(viewAllBtn).toBeVisible();
  45 |     await viewAllBtn.click();
  46 | 
  47 |     // Verify UnscheduledProjectsDrawer opens
  48 |     const drawer = page.locator('.fixed.right-0').first();
  49 |     await expect(drawer).toBeVisible();
  50 |     await page.keyboard.press('Escape');
  51 |     await expect(drawer).toBeHidden();
  52 | 
  53 |     // Recent Activity
  54 |     const activityWidget = page.getByText('Recent Activity').first();
  55 |     await expect(activityWidget).toBeVisible();
  56 |   });
  57 | });
  58 | 
```