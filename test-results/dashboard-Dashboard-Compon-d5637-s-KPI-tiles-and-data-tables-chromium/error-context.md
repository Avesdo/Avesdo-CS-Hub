# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard Component Tests >> Dashboard loads KPI tiles and data tables
- Location: tests\dashboard.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Global Health Index')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Global Health Index')

```

```yaml
- paragraph: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard Component Tests', () => {
  4  |   test('Dashboard loads KPI tiles and data tables', async ({ page }) => {
  5  |     test.setTimeout(30000);
  6  |     
  7  |     // 1. Load Application (Dashboard is default route)
  8  |     await page.goto('http://localhost:5173');
  9  | 
  10 |     // 2. Verify KPI Tiles
> 11 |     await expect(page.getByText('Global Health Index')).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  12 |     await expect(page.getByText('Live Units')).toBeVisible();
  13 |     await expect(page.getByText('Launch Pipeline')).toBeVisible();
  14 |     await expect(page.getByText('Service Revenue')).toBeVisible();
  15 | 
  16 |     // 3. Verify Charts
  17 |     await expect(page.getByText('Portfolio Distribution').first()).toBeVisible();
  18 |     await expect(page.getByText('Quarterly Movers').first()).toBeVisible();
  19 | 
  20 |     // 4. Verify Action Required Widget (if it exists, we'll check conditionally or skip since it's dynamic)
  21 |   });
  22 | });
  23 | 
```