"import { test, expect } from '@playwright/test';\n\ntest.describe('Phase 5: Deep Dive Drawers & Automations', () => {\n  const timestamp = new Date().getTime();\n  const testClientName = `Cascade Client ${timestamp}`;\n  const editClientName = `Cascade Edited ${timestamp}`;\n  const testProjectName = `Cascade Project ${timestamp}`;\n\n  test.beforeEach(async ({ page }) => {\n    // Navigate and set up data\n    await page.goto('http://localhost:5173');\n    await page.waitForTimeout(1000); // Allow load\n  });\n\n  test('Create data, verify cascade on name edit, and test stacking drawers', async ({ page }) => {\n    test.setTimeout(45000);\n\n    // 1. Create a Client\n    await page.getByText('Add New', { exact: true }).click({ force: true });\n    await page.waitForTimeout(300);\n    await page.getByText('Client', { exact: true }).last().click({ force: true });\n    \n    await page.getByPlaceholder('Enter client name...').fill(testClientName);\n    await page.getByText('Select Type').click({ force: true });\n    await page.locator('.absolute button').first().click({ force: true });\n    await page.getByRole('button', { name: 'Create Client' }).click({ force: true });\n    await page.waitForTimeout(1000);\n\n    // 2. Create a Project attached to the Client\n    await page.getByText('Add New', { exact: true }).click({ force: true });\n    await page.waitForTimeout(300);\n    await page.getByText('Project', { exact: true }).last().click({ force: true });\n    \n    await page.getByPlaceholder('Enter project name...').fill(testProjectName);\n    await page.locator('input[placeholder=\"0\"]').fill('100');\n    \n    await page.getByText('Select Attached Clients...').click({ force: true });\n    await page.waitForTimeout(300);\n    await page.getByText(testClientName).click({ force: true });\n    await page.getByText('Add New Project').click({ force: true }); // click away\n    await page.waitForTimeout(300);\n\n    await page.getByRole('button', { name: 'Create Project' }).click({ force: true });\n    await page.
<truncated 2178 bytes>
    await page.getByRole('button', { name: 'Create Client' }).click({ force: true });
    await page.waitForTimeout(1000);

    // Close the drawer that opened automatically
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 2. Create a Project attached to the Client
    await page.getByText('Select Attached Clients...').click({ force: true });
    await page.waitForTimeout(300);
    await page.getByText(testClientName).last().click({ force: true });
    await page.getByText('Add New Project').click({ force: true }); // click away
    await page.waitForTimeout(300);
    // Close the drawer that opened automatically
    await page.locator('button[title="Close Drawer"]').click({ force: true });
    await page.waitForTimeout(500);
    // Close top drawer
    await page.locator('button[title="Close Drawer"]').last().click({ force: true });
    await page.waitForTimeout(500);
    // Client drawer should still be there
    await expect(clientDrawer).toBeVisible();

    // Close client drawer
    await page.locator('button[title="Close Drawer"]').first().click({ force: true });
    // Close the drawer that opened automatically using Escape
    await page.keyboard.press('Escape');
    // Navigate back to Dashboard to clear UI state
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(1000);

    // 2. Create a Project attached to the Client
    await page.getByRole('button', { name: 'Add New' }).click({ force: true });
    await page.waitForTimeout(300);
    await page.getByText('Project', { exact: true }).click({ force: true });
    await page.mouse.click(10, 10);
    // Select Attached Client
    await page.getByText('Select Attached Clients...').click({ force: true });
    await page.waitForTimeout(300);
    // Click the exact client we just created
    await page.getByText(testClientName, { exact: true }).last().click({ force: true });
    await page.getByText('Add New Project').click({ force: true }); // Click title to close dropdown
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="0"]').fill('100');

    // Select Attached Client
    await page.getByText('Select Attached Clients...').click({ force: true });
    await page.waitForTimeout(300);
    // Click the first available client in the multiselect dropdown (which is the one we just created)
    await page.locator('.absolute button').first().click({ force: true });
    await page.getByText('Add New Project').click({ force: true }); // Click title to close dropdown
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: 'Create Project' }).click({ force: true });
    await page.waitForTimeout(1000);

    // 3. Open Client Drawer and Edit Name
    await page.getByRole('link', { name: 'Client Health' }).click();
    await page.waitForTimeout(1000); // Wait for the DB update and toast
    // Close client drawer
    await page.keyboard.press('Escape');
    // Close top drawer
    await page.keyboard.press('Escape');
    await page.getByText('Projects', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(300);
    // Switch to All or Onboarding filter to see the new project
    await page.getByRole('button', { name: 'All' }).click({ force: true });
    await page.waitForTimeout(300);

    // Click on the project to open Project Drawer on top
    await page.getByText(testProjectName).first().click({ force: true });
    // Switch to All or Onboarding filter to see the new project
    await page.getByRole('button', { name: 'All', exact: true }).click({ force: true });
    await page.waitForTimeout(300);