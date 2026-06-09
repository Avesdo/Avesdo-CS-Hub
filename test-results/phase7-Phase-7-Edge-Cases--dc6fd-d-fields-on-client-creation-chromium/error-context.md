# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase7.spec.ts >> Phase 7: Edge Cases & Error States >> Missing required fields on client creation
- Location: tests\phase7.spec.ts:7:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Client Health' })

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Phase 7: Edge Cases & Error States', () => {
  4  |   // Add slow mo for animations
  5  |   test.use({ actionTimeout: 10000 });
  6  | 
  7  |   test('Missing required fields on client creation', async ({ page }) => {
  8  |     await page.goto('http://localhost:5173/');
  9  | 
  10 |     // Navigate to Clients page
> 11 |     await page.getByRole('link', { name: 'Client Health' }).click();
     |                                                             ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  12 | 
  13 |     // Click Add Client
  14 |     await page.getByRole('button', { name: 'Add Client' }).click();
  15 | 
  16 |     // The modal should open
  17 |     await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();
  18 | 
  19 |     // Click Create without filling out required fields
  20 |     const saveButton = page.getByRole('button', { name: 'Create Client', exact: true });
  21 |     
  22 |     // We shouldn't be able to just save it. The modal should remain visible with an error.
  23 |     await saveButton.click({ force: true });
  24 |     
  25 |     // Verify that we are still on the form
  26 |     await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();
  27 | 
  28 |     // Verify error message
  29 |     await expect(page.getByText('Client Name is required.')).toBeVisible();
  30 | 
  31 |     // Try filling it, then clear it to see error states if there are any custom errors
  32 |     await page.getByPlaceholder('Enter client name...').fill('Test Client');
  33 |     await page.getByPlaceholder('Enter client name...').fill('');
  34 |     
  35 |     await saveButton.click({ force: true });
  36 |     await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();
  37 |     
  38 |     // Close the drawer
  39 |     await page.getByRole('button', { name: 'Cancel' }).click();
  40 |   });
  41 | 
  42 |   test('State restoration on rapid switching', async ({ page }) => {
  43 |     await page.goto('http://localhost:5173/');
  44 | 
  45 |     // Navigate to Clients page
  46 |     await page.getByRole('link', { name: 'Client Health' }).click();
  47 | 
  48 |     // Open first client
  49 |     const firstClient = page.locator('tbody tr').first();
  50 |     await firstClient.click();
  51 | 
  52 |     // Drawer should open
  53 |     await expect(page.getByRole('button', { name: 'Health', exact: true })).toBeVisible();
  54 | 
  55 |     // Close it quickly
  56 |     await page.getByTitle('Close Drawer').click();
  57 | 
  58 |     // Drawer should be hidden
  59 |     await expect(page.getByRole('button', { name: 'Health', exact: true })).not.toBeVisible();
  60 | 
  61 |     // Switch rapidly to Add Client
  62 |     await page.getByRole('button', { name: 'Add Client' }).click();
  63 |     await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();
  64 |     await page.getByRole('button', { name: 'Cancel' }).click();
  65 | 
  66 |     // Switch to Projects
  67 |     await page.getByRole('link', { name: 'Project Tracker' }).click();
  68 |     await page.getByRole('button', { name: 'Add Project' }).click();
  69 |     await expect(page.getByRole('heading', { name: 'Add New Project' })).toBeVisible();
  70 |     await page.getByRole('button', { name: 'Cancel' }).click();
  71 |   });
  72 | });
  73 | 
```