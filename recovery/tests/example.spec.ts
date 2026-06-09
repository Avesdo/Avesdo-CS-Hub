import { test, expect } from '@playwright/test';

test.describe('Avesdo CS Hub Baseline E2E Tests', () => {

  test('app successfully loads and displays global search', async ({ page }) => {
    // Navigate to local dev server
    await page.goto('http://localhost:5173');

    // Wait for the app to hydrate
    await page.waitForLoadState('networkidle');

    // Verify title
    await expect(page).toHaveTitle(/Avesdo/i);

    // Verify Global Search exists
    const searchInput = page.getByPlaceholder('Search clients, projects, services...');
    await expect(searchInput).toBeVisible();
  });

  test('user can open the Add Project modal', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click the Add New button
    const addNewBtn = page.getByText('Add New', { exact: true });
    await expect(addNewBtn).toBeVisible();
    await addNewBtn.click();

    // Click Project
    const addProjectOption = page.getByText('Project', { exact: true }).last();
    await expect(addProjectOption).toBeVisible();
    await addProjectOption.click();

    // Verify Modal exists
    const modalTitle = page.getByText('Create New Project');
    await expect(modalTitle).toBeVisible();
  });

});