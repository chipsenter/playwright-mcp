import { test, expect } from './fixtures.js';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { getEzRoutingBaseUrl } from '../utils/ezrouting-test-config.js';

test.describe('Workspace Creation', () => {
  test('should create a new workspace with unique name', async ({ page }) => {
    const baseUrl = getEzRoutingBaseUrl();
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    // Login
    const loginPage = new LoginPage(page);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await loginPage.login(email, password);
    await page.waitForTimeout(2000);

    const dashboard = new DashboardPage(page);

    // Generate unique workspace name
    const randomNum = Math.floor(Math.random() * 50) + 1;
    const workspaceName = `playwright-test-workspace-${randomNum}`;

    // Click workspace title to open workspace panel
    await dashboard.workspaceTitle.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceTitle.click();
    await page.waitForTimeout(500);

    // Click workspace add button
    await dashboard.workspaceAddButton.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceAddButton.click();
    await page.waitForTimeout(500);

    // Click save to open dialog
    await dashboard.workspaceSaveButton.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceSaveButton.click();
    await page.waitForTimeout(500);

    // Fill workspace name
    await dashboard.workspaceNameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceNameInput.click();
    await dashboard.workspaceNameInput.fill(workspaceName);
    await page.waitForTimeout(300);

    // Click OK button
    await dashboard.okButton.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.okButton.click();
    await page.waitForTimeout(1000);

    // Click final save button
    await dashboard.workspaceSaveButton.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceSaveButton.click();
    await page.waitForTimeout(1500);

    // Validate and click OK on confirmation modal
    await expect(dashboard.okButton).toBeVisible({ timeout: 10_000 });
    await dashboard.okButton.click();
    await page.waitForTimeout(1000);

    // Verify workspace was created by checking workspace editor contains the name
    const workspaceEditor = dashboard.workspaceEditor;
    await expect(workspaceEditor).toBeVisible();
    const editorText = await workspaceEditor.textContent();
    expect(editorText).toContain(workspaceName);
  });
});
