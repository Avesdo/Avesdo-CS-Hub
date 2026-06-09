# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Hub & Settings Component Tests >> Navigates to Admin Hub and verifies System Logs
- Location: tests\admin.spec.ts:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Admin Hub' })

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Hub & Settings Component Tests', () => {
  4  |   test('Navigates to Admin Hub and verifies System Logs', async ({ page }) => {
  5  |     test.setTimeout(30000);
  6  |     
  7  |     // 1. Load Application
  8  |     await page.goto('http://localhost:5173');
  9  | 
  10 |     // 2. Navigate to Admin Hub
> 11 |     await page.getByRole('link', { name: 'Admin Hub' }).click();
     |                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  12 |     await expect(page).toHaveURL(/.*\/admin/);
  13 | 
  14 |     // 3. Verify Admin Hub Components
  15 |     await expect(page.getByText('System audit logs').first()).toBeVisible();
  16 |     await expect(page.getByText('Audit Trail').first()).toBeVisible();
  17 |   });
  18 | 
  19 |   test('Navigates to Settings and tests Dropdowns', async ({ page }) => {
  20 |     // 1. Load Application
  21 |     await page.goto('http://localhost:5173');
  22 |     
  23 |     // 2. Navigate to Settings
  24 |     await page.getByRole('link', { name: 'Settings' }).click();
  25 |     await expect(page).toHaveURL(/.*\/settings/);
  26 | 
  27 |     const timestamp = new Date().getTime();
  28 |     const testType = `[E2E] Type ${timestamp}`;
  29 |     
  30 |     // We target the exact container for Client Types to find the Add button
  31 |     const clientTypesSection = page.locator('h3:has-text("Client Types")').locator('..').locator('..');
  32 |     const input = clientTypesSection.locator('input[placeholder="New Client Type..."]');
  33 |     const addButton = clientTypesSection.locator('button', { hasText: 'Add' });
  34 | 
  35 |     await input.fill(testType);
  36 |     await addButton.click({ force: true });
  37 | 
  38 |     // Verify it was added
  39 |     await expect(page.getByText(testType)).toBeVisible();
  40 |   });
  41 | });
  42 | 
```