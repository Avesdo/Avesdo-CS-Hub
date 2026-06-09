"import { test, expect } from '@playwright/test';\n\n// Constants for test data\nconst testAccountManager = `Test Manager ${Date.now()}`;\n\ntest.describe('Phase 6: Admin Hub & Settings', () => {\n  // Use a slow mo to ensure animations complete if needed\n  test.use({ actionTimeout: 10000 });\n\n  test('Verify Admin Hub logs and Archives', async ({ page }) => {\n    await page.goto('http://localhost:5173/');\n    \n    // Navigate to Admin Hub via Sidebar\n    await page.getByRole('link', { name: 'Admin Hub' }).click();\n    await expect(page).toHaveURL(/.*\\/admin/);\n    await expect(page.getByRole('heading', { name: 'Admin Hub' })).toBeVisible();\n\n    // Verify Audit Trail Tab is active by default\n    await expect(page.getByRole('button', { name: 'Audit Trail' })).toBeVisible();\n    await expect(page.getByText('System audit logs and archived records.')).toBeVisible();\n\n    // Test Audit Filters\n    await page.getByRole('button', { name: 'Clients' }).click();\n    await page.getByRole('button', { name: 'Projects' }).click();\n    await page.getByRole('button', { name: 'Services' }).click();\n    await page.getByRole('button', { name: 'Settings' }).click();\n    await page.getByRole('button', { name: 'All' }).click();\n\n    // Test Audit Search\n    const searchInput = page.getByPlaceholder('Search logs...');\n    await searchInput.fill('Test search');\n    await page.waitForTimeout(300);\n    await searchInput.fill('');\n\n    // Switch to Archives Tab\n    await page.getByRole('button', { name: 'Archives' }).click();\n    await expect(page.getByPlaceholder('Search archives...')).toBeVisible();\n\n    // Test Archive Sub-filters\n    await page.getByRole('button', { name: 'Projects' }).click();\n    await page.getByRole('button', { name: 'Services' }).click();\n    await page.getByRole('button', { name: 'Settings' }).click();\n    await page.getByRole('button', { name: 'Clients' }).click();\n  });\n\n  test('Review Settings profile and organization preferences', async ({ page }) => {\n    await page.go
<truncated 1589 bytes>
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    // Switch to Workflows Tab
    await page.getByRole('button', { name: 'Workflow & Status' }).click();
    await expect(page.getByText('Project Statuses')).toBeVisible();

    // Switch to Products Tab
    await page.getByRole('button', { name: 'Features & Services' }).click();
    await expect(page.getByText('Features & Modules')).toBeVisible();

    // Switch to Health Scoring Tab
    await page.getByRole('button', { name: 'Scoring Engine' }).click();
    await expect(page.getByText('Pillar Weights')).toBeVisible();
    // Switch to Workflows Tab
    await page.getByRole('button', { name: 'Workflow & Status' }).click();
    await expect(page.getByRole('heading', { name: 'Project Status' })).toBeVisible();

    // Switch to Products Tab
    await page.getByRole('button', { name: 'Features & Services' }).click();
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();

    // Switch to Health Scoring Tab
    await page.getByRole('button', { name: 'Scoring Engine' }).click();
    await expect(page.getByRole('heading', { name: /Client Pillar Weights/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'KPI Thresholds' })).toBeVisible();
    
    // Test Scoring Save
    await page.getByRole('button', { name: 'Save Rules' }).click();