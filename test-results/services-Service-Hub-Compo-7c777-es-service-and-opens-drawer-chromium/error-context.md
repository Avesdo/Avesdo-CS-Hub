# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services.spec.ts >> Service Hub Component Tests >> Navigates to Service Hub, creates service, and opens drawer
- Location: tests\services.spec.ts:7:3

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
  3  | test.describe('Service Hub Component Tests', () => {
  4  |   const timestamp = new Date().getTime();
  5  |   const testServiceName = `[E2E TEST] Service ${timestamp}`;
  6  | 
  7  |   test('Navigates to Service Hub, creates service, and opens drawer', async ({ page }) => {
  8  |     test.setTimeout(45000);
  9  |     
  10 |     // 1. Load Application
  11 |     await page.goto('http://localhost:5173');
  12 | 
  13 |     // 3. Create a test client first so we have one to attach
> 14 |     await page.getByText('Client Health', { exact: true }).click({ force: true });
     |                                                            ^ Error: locator.click: Test timeout of 45000ms exceeded.
  15 |     await page.getByText('Add Client', { exact: true }).click({ force: true });
  16 |     await page.getByPlaceholder('Enter client name...').fill(`[E2E Service Dep] Client ${timestamp}`);
  17 |     await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
  18 |     await page.waitForTimeout(500);
  19 | 
  20 |     // Navigate to Service Hub
  21 |     await page.getByText('Service Hub', { exact: true }).click({ force: true });
  22 |     await expect(page).toHaveURL(/.*\/services/);
  23 | 
  24 |     // 4. Create a test service
  25 |     await page.getByText('Add Service', { exact: true }).click({ force: true });
  26 |     await page.waitForTimeout(500);
  27 |     
  28 |     await page.getByPlaceholder('Select or enter a service name...').fill(testServiceName);
  29 |     await page.keyboard.press('Enter');
  30 |     await page.waitForTimeout(300);
  31 | 
  32 |     await page.getByText('Select Service Type').click({ force: true });
  33 |     await page.waitForTimeout(300);
  34 |     await page.getByText('Included', { exact: true }).first().click({ force: true });
  35 |     await page.waitForTimeout(300);
  36 | 
  37 |     await page.getByText('Select Client').click({ force: true });
  38 |     await page.waitForTimeout(300);
  39 |     // Click the first available client in the dropdown list
  40 |     await page.locator('.absolute.z-50 button, .absolute.z-50 div[role="option"]').first().click({ force: true });
  41 |     await page.getByText('Service Details').click({ force: true }); // Click background to close dropdown
  42 |     await page.waitForTimeout(300);
  43 | 
  44 |     await page.getByRole('button', { name: 'Create Service' }).click({ force: true });
  45 |     await page.waitForTimeout(500);
  46 | 
  47 |     // 4. Verify Service appears in global search
  48 |     await page.getByPlaceholder('Search services...').fill(testServiceName);
  49 |     
  50 |     const serviceRow = page.getByText(testServiceName).first();
  51 |     await expect(serviceRow).toBeVisible();
  52 |     
  53 |     // 5. Open Drawer and check details
  54 |     await serviceRow.click({ force: true });
  55 |     
  56 |     await expect(page.getByText('Service Details').first()).toBeVisible();
  57 |     
  58 |     // Verify tabs
  59 |     await page.getByText('Features').click({ force: true });
  60 |     await expect(page.getByText('Features').first()).toBeVisible();
  61 |     
  62 |     await page.getByText('Notes').click({ force: true });
  63 |     await expect(page.getByText('Notes').first()).toBeVisible();
  64 |   });
  65 | });
  66 | 
```