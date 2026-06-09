import { test, expect } from '@playwright/test';

test.describe('Service Hub Component Tests', () => {
  test('Navigates to Service Hub and loads table', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Service Hub' }).click();
    await expect(page).toHaveURL(/.*\/services/);
      await expect(page.getByRole('heading', { name: 'Service Hub' })).toBeVisible();
  });
    await page.getByText('Select Client').click({ force: true });
    await page.waitForTimeout(300);
    // Click the first available client in the dropdown list
    // 3. Create a test client first so we have one to attach
    await page.getByText('Client Health', { exact: true }).click({ force: true });
    await page.getByText('Add Client', { exact: true }).click({ force: true });
    await page.getByPlaceholder('Enter client name...').fill(`[E2E Service Dep] Client ${timestamp}`);
    await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
    await page.waitForTimeout(500);

    // Navigate to Service Hub
    await page.getByText('Service Hub', { exact: true }).click({ force: true });
    await expect(page).toHaveURL(/.*\/services/);

    // 4. Create a test service
    await page.getByText('Add Service', { exact: true }).click({ force: true });