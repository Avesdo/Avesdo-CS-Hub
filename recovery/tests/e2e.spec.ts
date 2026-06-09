import { test, expect } from '@playwright/test';

test.describe('Avesdo CS Hub Core E2E Tests', () => {
  test('Application boots and navigation links are visible', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Client Health' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Project Tracker' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Service Hub' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin Hub' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
  });
});

    // --- STEP 3: Add Project and attach to Client ---
    // First, let's close the search dropdown by pressing Escape or reloading
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    await page.getByText('Add New', { exact: true }).click({ force: true });
    await page.waitForTimeout(300);
    await page.getByText('Project', { exact: true }).last().click({ force: true });
    // --- STEP 3: Add Project and attach to Client ---
    // First, let's close the search dropdown by navigating away safely
    await page.getByText('Project Tracker', { exact: true }).click({ force: true });
    await expect(page).toHaveURL(/.*\/projects/);
    
    await page.getByText('Add Project', { exact: true }).click({ force: true });
    await page.waitForTimeout(300);
    await page.getByText('Select Attached Clients...').click({ force: true });
    await page.waitForTimeout(300);
    await page.getByText(testClientName).click({ force: true });
    await page.getByText('Add New Project').click({ force: true }); // Click background to close dropdown
    await page.waitForTimeout(300);

    await page.locator('input[placeholder="0"]').fill('100');