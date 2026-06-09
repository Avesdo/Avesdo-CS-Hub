import { test, expect } from '@playwright/test';

test.describe('Project Tracker Component Tests', () => {
  test('Navigates to Project Tracker and loads table', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Project Tracker' }).click();
    await expect(page).toHaveURL(/.*\/projects/);
      await expect(page.getByRole('heading', { name: 'Project Tracker' })).toBeVisible();
  });
    await page.getByText('Select Attached Clients...').click({ force: true });
    await page.waitForTimeout(300);
    await page.locator('.custom-thin-scroll button').first().click({ force: true });
    // 3. Create a test client first so we have one to attach
    await page.getByText('Client Health', { exact: true }).click({ force: true });
    await page.getByText('Add Client', { exact: true }).click({ force: true });
    await page.getByPlaceholder('Enter client name...').fill(`[E2E Project Dep] Client ${timestamp}`);
    await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
    await page.waitForTimeout(500);

    // Navigate to Project Tracker
    await page.getByText('Project Tracker', { exact: true }).click({ force: true });
    await expect(page).toHaveURL(/.*\/projects/);
    await page.getByText('Select Attached Clients...').click({ force: true });
    await page.waitForTimeout(300);
    await page.locator('.custom-thin-scroll button').first().click({ force: true });
    // Click on the modal background to close the dropdown
    await page.getByText('Add New Project').first().click({ force: true });
    await page.waitForTimeout(300);

    await page.locator('input[placeholder="0"]').fill('100');