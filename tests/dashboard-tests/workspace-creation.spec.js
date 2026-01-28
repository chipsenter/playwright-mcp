import { test, expect } from '../../utils/fixtures.js';
import { LoginPage } from '../../pages/ezr/LoginPage.js';
import { DashboardPage } from '../../pages/ezr/DashboardPage.js';
import { getEzRoutingBaseUrl } from '../../utils/ezrouting-test-config.js';

test.describe('Workspace Creation', () => {
  // Shared workspace name that can be reused across tests in this describe block
  let sharedWorkspaceName = null;

  // Helper function to generate or retrieve workspace name
  function getWorkspaceName() {
    if (!sharedWorkspaceName) {
      const randomNum = Math.floor(Math.random() * 50) + 1;
      sharedWorkspaceName = `playwright-test-workspace-${randomNum}`;
    }
    return sharedWorkspaceName;
  }

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

    // Generate unique workspace name (shared across tests in this describe block)
    const workspaceName = getWorkspaceName();

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

  test('should update a workspace', async ({ page }) => {
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

    // Click any workspace in the list 
    await dashboard.workspaceList.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceList.click();
    await page.waitForTimeout(500);
    await dashboard.workspaceSaveButton.click();

    const workspaceName = getWorkspaceName();
    //update the workspace name
    await dashboard.workspaceNameInput.fill(workspaceName);
    await dashboard.workspaceUpdateOkButton.click();
    await page.waitForTimeout(500);

    //verify the workspace name was updated
    await expect(page.getByText(workspaceName)).toBeVisible();

    // save new updated workspace 
    await expect(page.locator('body')).toContainText('Update Workspace');

  });

  test('should delete the workspace', async ({ page }) => {
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

    // Click any workspace in the list 
    await dashboard.workspaceList.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceList.click();
    await page.waitForTimeout(500);
    await dashboard.workspaceDeleteButton.click();
    await expect(page.getByRole('heading', { name: 'Delete Workspace' })).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete')).toBeVisible();
    await expect(page.getByRole('paragraph')).toContainText('Are you sure you want to delete');
    await dashboard.yesButton.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.yesButton.click();
    await page.waitForTimeout(1000);
  });
});
