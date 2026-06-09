"import { test, expect } from '@playwright/test';\n\ntest.describe('Phase 7: Edge Cases & Error States', () => {\n  // Add slow mo for animations\n  test.use({ actionTimeout: 10000 });\n\n  test('Missing required fields on client creation', async ({ page }) => {\n    await page.goto('http://localhost:5173/');\n\n    // Click Add Client\n    await page.getByRole('button', { name: 'Add Client' }).click();\n\n    // The drawer should open\n    await expect(page.getByRole('heading', { name: 'Create New Client' })).toBeVisible();\n\n    // Click Save without filling out required fields\n    // We expect standard HTML5 validation to block form submission\n    // Or our custom validation if any exists. \n    // In our implementation, since the input has `required`, Playwright's click might actually submit, \n    // but the browser handles the error. Let's see if the drawer stays open.\n    const saveButton = page.getByRole('button', { name: 'Save Client', exact: true });\n    \n    // We shouldn't be able to just save it. The drawer should remain visible.\n    await saveButton.click({ force: true });\n    \n    // Verify that we are still on the form (drawer still open)\n    await expect(page.getByRole('heading', { name: 'Create New Client' })).toBeVisible();\n\n    // Try filling it, then clear it to see error states if there are any custom errors\n    await page.getByLabel('Company Name').fill('Test Client');\n    await page.getByLabel('Company Name').fill('');\n    \n    await saveButton.click({ force: true });\n    await expect(page.getByRole('heading', { name: 'Create New Client' })).toBeVisible();\n    \n    // Close the drawer\n    await page.getByRole('button', { name: 'Cancel' }).click();\n  });\n\n  test('State restoration on rapid switching', async ({ page }) => {\n    await page.goto('http://localhost:5173/');\n\n    // Open first client\n    const firstClient = page.locator('.group.relative.flex.items-start.gap-3.p-4.transition-all').first();\n    await firstClient.click();\n\n    // Drawer should open\n   
<truncated 815 bytes>
    await page.goto('http://localhost:5173/');

    // Navigate to Clients page
    await page.getByRole('link', { name: 'Clients' }).click();

    // Click Add Client
    await page.getByRole('button', { name: 'Add Client' }).click();
    // Navigate to Clients page
    await page.getByRole('link', { name: 'Client Health' }).click();

    // The modal should open
    await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();

    // Click Create without filling out required fields
    const saveButton = page.getByRole('button', { name: 'Create Client', exact: true });
    
    // We shouldn't be able to just save it. The modal should remain visible with an error.
    await saveButton.click({ force: true });
    
    // Verify that we are still on the form
    await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();

    // Verify error message
    await expect(page.getByText('Client Name is required.')).toBeVisible();

    // Try filling it, then clear it to see error states if there are any custom errors
    await page.getByLabel('Client Name').fill('Test Client');
    await page.getByLabel('Client Name').fill('');
    // Try filling it, then clear it to see error states if there are any custom errors
    await page.getByPlaceholder('Enter client name...').fill('Test Client');
    await page.getByPlaceholder('Enter client name...').fill('');
    
    await saveButton.click({ force: true });
    await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();
    
    // Close the drawer
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('State restoration on rapid switching', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Navigate to Clients page
    await page.getByRole('link', { name: 'Client Health' }).click();

    // Open first client
    const firstClient = page.locator('tbody tr').first();

    // Drawer should open
    // Drawer should open
    await expect(page.getByRole('button', { name: 'Health', exact: true })).toBeVisible();

    // Close it quickly
    await page.getByTitle('Close Drawer').click();

    // Drawer should be hidden
    await expect(page.getByRole('button', { name: 'Health', exact: true })).not.toBeVisible();
    await page.getByRole('button', { name: 'Add Project' }).click();
    // Switch rapidly to Add Client
    await page.getByRole('button', { name: 'Add Client' }).click();
    await expect(page.getByRole('heading', { name: 'Add New Client' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    // Switch to Projects
    await page.getByRole('link', { name: 'Project Tracker' }).click();
    await page.getByRole('button', { name: 'Add Project' }).click();
    await expect(page.getByRole('heading', { name: 'Create New Project' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();