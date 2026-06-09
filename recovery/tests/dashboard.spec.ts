import { test, expect } from '@playwright/test';

test.describe('Dashboard Component Tests', () => {
  test('Dashboard loads KPI tiles and data tables', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.getByText('Global Health Index')).toBeVisible();
    await expect(page.getByText('Live Units')).toBeVisible();
    await expect(page.getByText('Launch Pipeline')).toBeVisible();
    await expect(page.getByText('Service Revenue')).toBeVisible();
    // 2. Verify KPI Tiles
    await expect(page.getByText('Global Health Index')).toBeVisible();
    await expect(page.getByText('Live Units')).toBeVisible();
    await expect(page.getByText('Launch Pipeline')).toBeVisible();
    await expect(page.getByText('Service Revenue')).toBeVisible();

    // 3. Verify Charts
    await expect(page.getByText('Portfolio Distribution').first()).toBeVisible();
    await expect(page.getByText('Quarterly Movers').first()).toBeVisible();

    // 4. Verify Action Required Widget (if it exists, we'll check conditionally or skip since it's dynamic)