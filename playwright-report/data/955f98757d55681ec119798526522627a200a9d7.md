# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase1.spec.ts >> Phase 1: Global Navigation & Foundation Aesthetics >> Global Search Bar
- Location: tests\phase1.spec.ts:20:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder('Search clients, projects, or services...')

```

# Page snapshot

```yaml
- paragraph [ref=e6]: Loading Application Data...
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Phase 1: Global Navigation & Foundation Aesthetics', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:5173');
  6  |   });
  7  | 
  8  |   test('Sidebar & Routing', async ({ page }) => {
  9  |     // hover and click on Client Health
  10 |     const clientLink = page.getByText('Client Health', { exact: true });
  11 |     await expect(clientLink).toBeVisible();
  12 |     await clientLink.click();
  13 |     await expect(page).toHaveURL(/.*\/clients/);
  14 | 
  15 |     const projectLink = page.getByText('Project Tracker', { exact: true });
  16 |     await projectLink.click();
  17 |     await expect(page).toHaveURL(/.*\/projects/);
  18 |   });
  19 | 
  20 |   test('Global Search Bar', async ({ page }) => {
  21 |     const searchInput = page.getByPlaceholder('Search clients, projects, or services...');
  22 |     
  23 |     // Input & Focus
> 24 |     await searchInput.click();
     |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  25 |     await expect(searchInput).toBeFocused();
  26 |     // Verify focus ring classes based on .geminirules
  27 |     await expect(searchInput).toHaveClass(/focus:ring-primary\/20/);
  28 |     await expect(searchInput).toHaveClass(/focus:border-primary/);
  29 | 
  30 |     // Query Logic & Execution
  31 |     await searchInput.fill('test');
  32 |     // Wait for the dropdown to appear.
  33 |     const searchResultsContainer = page.locator('.z-50.absolute').first();
  34 |     // we need to wait for debounce (200ms) plus search
  35 |     await page.waitForTimeout(500);
  36 |     await expect(searchResultsContainer).toBeVisible({ timeout: 10000 });
  37 | 
  38 |     // Escape Key
  39 |     await page.keyboard.press('Escape');
  40 |     // The popover should be hidden
  41 |     await expect(searchResultsContainer).toBeHidden();
  42 |   });
  43 | 
  44 |   test('Header & Profile', async ({ page }) => {
  45 |     // The header should be present
  46 |     const header = page.locator('header').first();
  47 |     await expect(header).toBeVisible();
  48 |     
  49 |     // Test profile/avatar rendering (the initial 'A' for Admin usually or a user icon)
  50 |     // The top right usually has a button for user profile
  51 |     const profileBtn = page.getByTitle('User Profile').or(page.locator('header button').last());
  52 |     await expect(profileBtn).toBeVisible();
  53 |   });
  54 | 
  55 |   test('Overall Canvas Layout', async ({ page }) => {
  56 |     // Navigate to a main hub page first to check canvas layout
  57 |     await page.goto('http://localhost:5173/clients');
  58 |     // Wait for page to settle
  59 |     await page.waitForTimeout(500);
  60 | 
  61 |     // According to the rules, the dashboard layout container must have h-[calc(100vh-var(--header-height))]
  62 |     // We'll look for any main or div element that enforces this fixed canvas height constraint.
  63 |     const fixedCanvas = page.locator('.h-\\[calc\\(100vh-var\\(--header-height\\)\\)\\]');
  64 |     
  65 |     // If this fails, the UI needs to be updated to adhere to `.geminirules`
  66 |     await expect(fixedCanvas.first()).toBeVisible();
  67 |   });
  68 | });
  69 | 
```