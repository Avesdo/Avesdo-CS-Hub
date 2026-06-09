import { test, expect } from '@playwright/test';

test.describe('Client Health Component Tests', () => {
  test('Navigates to Client Health and loads table', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('link', { name: 'Client Health' }).click();
    await expect(page).toHaveURL(/.*\/clients/);
      await expect(page.getByRole('heading', { name: 'Client Health' })).toBeVisible();
  });
    // 4. Verify Client in Table and open Drawer
    await expect(page.getByText(testClientName).first()).toBeVisible();
    await page.getByText(testClientName).first().click({ force: true });
    await page.waitForTimeout(500);

    // 5. Test Tabs in Drawer
    await page.getByText('Projects').click({ force: true });
    await expect(page.getByText('Active Projects').first()).toBeVisible();
    
    await page.getByText('Services').click({ force: true });
    await expect(page.getByText('Active Services').first()).toBeVisible();
    
    await page.getByText('Trends').click({ force: true });
    await expect(page.getByText('Score Trajectory').first()).toBeVisible();
    
    await page.getByText('Notes').click({ force: true });
    await expect(page.getByText(testNote).first()).toBeVisible();
    // 5. Test Tabs in Drawer
    await page.getByText('Projects').nth(1).click({ force: true });
    await expect(page.getByText('Active Projects').first()).toBeVisible();
    
    await page.getByText('Services').nth(1).click({ force: true });
    await expect(page.getByText('Active Services').first()).toBeVisible();
    // 5. Test Tabs in Drawer
    await page.locator('button:has-text("Projects")').first().click({ force: true });
    await expect(page.getByText('Active Projects').first()).toBeVisible();
    
    await page.locator('button:has-text("Services")').first().click({ force: true });
    await expect(page.getByText('Active Services').first()).toBeVisible();