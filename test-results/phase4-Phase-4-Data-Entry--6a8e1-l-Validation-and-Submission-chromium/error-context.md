# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase4.spec.ts >> Phase 4: Data Entry & Form Validation (Modals) >> Add Service Modal Validation and Submission
- Location: tests\phase4.spec.ts:70:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Add New', { exact: true })

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Phase 4: Data Entry & Form Validation (Modals)', () => {
  4  |   const timestamp = new Date().getTime();
  5  |   const testClientName = `Test Client Phase 4 ${timestamp}`;
  6  |   const testProjectName = `Test Project Phase 4 ${timestamp}`;
  7  |   const testServiceName = `Test Service Phase 4 ${timestamp}`;
  8  | 
  9  |   test.beforeEach(async ({ page }) => {
  10 |     await page.goto('http://localhost:5173');
  11 |     await page.waitForTimeout(1000); // Let data load
  12 |   });
  13 | 
  14 |   test('Add Client Modal Validation and Submission', async ({ page }) => {
  15 |     // Open Add Client Modal
  16 |     await page.getByText('Add New', { exact: true }).click({ force: true });
  17 |     await page.waitForTimeout(300);
  18 |     await page.getByText('Client', { exact: true }).last().click({ force: true });
  19 |     
  20 |     const modal = page.locator('.z-\\[130\\]').first();
  21 |     await expect(modal).toBeVisible();
  22 | 
  23 |     // Form Validation: try submitting without required fields
  24 |     await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
  25 |     // Assuming HTML5 validation prevents default, or we can check if modal is still open
  26 |     await expect(modal).toBeVisible();
  27 | 
  28 |     // Fill the required fields
  29 |     await page.getByPlaceholder('Enter client name...').fill(testClientName);
  30 |     
  31 |     // Select Type
  32 |     await page.getByText('Select Type').click({ force: true });
  33 |     await page.locator('.absolute button').first().click({ force: true });
  34 | 
  35 |     // Submit
  36 |     await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
  37 |     
  38 |     // Wait for modal to close
  39 |     await expect(modal).toBeHidden({ timeout: 5000 });
  40 |   });
  41 | 
  42 |   test('Add Project Modal Validation and Submission', async ({ page }) => {
  43 |     // Open Add Project Modal
  44 |     await page.getByText('Add New', { exact: true }).click({ force: true });
  45 |     await page.waitForTimeout(300);
  46 |     await page.getByText('Project', { exact: true }).last().click({ force: true });
  47 |     
  48 |     const modal = page.locator('.z-\\[130\\]').first();
  49 |     await expect(modal).toBeVisible();
  50 | 
  51 |     // Fill the required fields
  52 |     await page.getByPlaceholder('Enter project name...').fill(testProjectName);
  53 |     await page.locator('input[placeholder="0"]').fill('100');
  54 | 
  55 |     // Select Attached Client
  56 |     await page.getByText('Select Attached Clients...').click({ force: true });
  57 |     await page.waitForTimeout(300);
  58 |     // Click the first available client in the multiselect dropdown
  59 |     await page.locator('.absolute button').first().click({ force: true });
  60 |     await page.getByText('Add New Project').click({ force: true }); // Click title to close dropdown
  61 |     await page.waitForTimeout(300);
  62 | 
  63 |     // Submit
  64 |     await page.getByRole('button', { name: 'Create Project' }).click({ force: true });
  65 |     
  66 |     // Wait for modal to close
  67 |     await expect(modal).toBeHidden({ timeout: 5000 });
  68 |   });
  69 | 
  70 |   test('Add Service Modal Validation and Submission', async ({ page }) => {
  71 |     // Open Add Service Modal
> 72 |     await page.getByText('Add New', { exact: true }).click({ force: true });
     |                                                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  73 |     await page.waitForTimeout(300);
  74 |     await page.getByText('Service', { exact: true }).last().click({ force: true });
  75 |     
  76 |     const modal = page.locator('.z-\\[130\\]').first();
  77 |     await expect(modal).toBeVisible();
  78 | 
  79 |     // Fill the required fields
  80 |     // Using simple input mapping since CreatableSelect might have an input
  81 |     const serviceInput = page.getByPlaceholder('Select or enter a service name...');
  82 |     await serviceInput.fill(testServiceName);
  83 |     // Select Type
  84 |     await page.getByText('Select Service Type').click({ force: true });
  85 |     await page.locator('.absolute button').first().click({ force: true });
  86 | 
  87 |     // Select Client
  88 |     await page.getByText('Select Client').click({ force: true });
  89 |     await page.locator('.absolute button').first().click({ force: true });
  90 | 
  91 |     // Submit
  92 |     await page.getByRole('button', { name: 'Create Service' }).click({ force: true });
  93 |     
  94 |     // Wait for modal to close
  95 |     await expect(modal).toBeHidden({ timeout: 5000 });
  96 |   });
  97 | });
  98 | 
```