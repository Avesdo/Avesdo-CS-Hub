"import { test, expect } from '@playwright/test';\n\ntest.describe('Phase 3: The Client Ledger (List View & Drawers)', () => {\n  test.beforeEach(async ({ page }) => {\n    await page.goto('http://localhost:5173');\n    await page.getByText('Client Health', { exact: true }).click({ force: true });\n    await expect(page).toHaveURL(/.*\\/clients/);\n    await page.waitForTimeout(1000); // Let data load\n  });\n\n  test('Table Layout & Aesthetics', async ({ page }) => {\n    // Check fixed header and specific styles\n    const tableHeader = page.locator('thead').first();\n    await expect(tableHeader).toBeVisible();\n    await expect(tableHeader).toHaveClass(/sticky/); // should be sticky top\n\n    // Check row hovers\n    const firstRow = page.locator('tbody tr').first();\n    await expect(firstRow).toBeVisible();\n    await expect(firstRow).toHaveClass(/hover:bg-slate-50/); // typical row hover\n  });\n\n  test('Sorting & Filtering', async ({ page }) => {\n    // Check if TableFilters component exists (Search, Status, etc)\n    const searchInput = page.getByPlaceholder('Search clients...');\n    await expect(searchInput).toBeVisible();\n\n    const typeFilter = page.getByRole('button', { name: /Type/i }).first();\n    await expect(typeFilter).toBeVisible();\n\n    // Perform a search\n    await searchInput.fill('TestSearchClientQuery');\n    // Wait for debounce\n    await page.waitForTimeout(500);\n\n    // Click to sort by Health Score\n    const scoreHeader = page.getByText('Score').first();\n    if (await scoreHeader.isVisible()) {\n      await scoreHeader.click();\n    }\n  });\n\n  test('Action Buttons & Detail Drawer', async ({ page }) => {\n    // Clear any previous filters\n    await page.getByPlaceholder('Search clients...').fill('');\n    await page.waitForTimeout(500);\n\n    const firstRow = page.locator('tbody tr').first();\n    await expect(firstRow).toBeVisible();\n\n    // Click the row to open drawer\n    await firstRow.click({ force: true });\n\n    // Drawer should slide in\n    const drawer 
<truncated 518 bytes>
  test('Sorting & Filtering', async ({ page }) => {
    // Check if TableFilters component exists (Search, Status, etc)
    const searchInput = page.getByPlaceholder('Search clients...');
    await expect(searchInput).toBeVisible();

    // Perform a search
    await searchInput.fill('TestSearchClientQuery');
    // Wait for debounce
    await page.waitForTimeout(500);

    // Click to sort by Health Score
    const scoreHeader = page.getByText('Score').first();
    if (await scoreHeader.isVisible()) {
      await scoreHeader.click();
    }
  });

  test('Action Buttons & Detail Drawer', async ({ page }) => {
    // Clear any previous filters
    await page.getByPlaceholder('Search clients...').fill('');
    await page.waitForTimeout(500);

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Click the row to open drawer
    await firstRow.click({ force: true });

    // Drawer should slide in
    const drawer = page.locator('.fixed.right-0').first();
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Verify Tabs exist in Client Drawer
    await expect(page.getByText('Health', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Projects', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Trends', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Notes & Logs', { exact: true }).first()).toBeVisible();

    // Close drawer
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });
});