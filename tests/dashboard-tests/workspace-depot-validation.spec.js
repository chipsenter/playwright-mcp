import { test, expect } from '../../utils/fixtures.js';
import { LoginPage } from '../../pages/ezr/LoginPage.js';
import { DashboardPage } from '../../pages/ezr/DashboardPage.js';
import { StudentsPage } from '../../pages/ezr/StudentsPage.js';

test.describe('Workspace Depot Validation', () => {
  test('should create and activate workspace with ARVILLE DEPOT', async ({ page }) => {
    // Use clarknv client for ARVILLE DEPOT
    const baseUrl = 'https://routing-uat.transact.com/clarknv';
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    // Login
    console.log('Logging in to clarknv...');
    const loginPage = new LoginPage(page);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await loginPage.login(email, password);
    await page.waitForTimeout(2000);

    const dashboard = new DashboardPage(page);
    const studentsPage = new StudentsPage(page);

    // Generate unique workspace name
    const randomNum = Math.floor(Math.random() * 50) + 1;
    const workspaceName = `playwright-test-workspace-${randomNum}`;

    console.log('Step 1: Opening workspace panel...');
    await dashboard.workspaceTitle.waitFor({ state: 'visible', timeout: 10_000 });
    await dashboard.workspaceTitle.click();
    await page.waitForTimeout(1000);

    console.log('Step 2: Clicking workspace add button...');
    await studentsPage.clickWorkspaceAddBtn();
    await page.waitForTimeout(1000);

    console.log('Step 3: Clicking Depots dropdown...');
    await studentsPage.clickDepotsDropdown();
    await page.waitForTimeout(1500);

    console.log('Step 4: Selecting ARVILLE DEPOT...');
    await studentsPage.selectDepot('ARVILLE DEPOT');
    await page.waitForTimeout(1500);

    console.log('Step 5: Validating workspace student count is visible...');
    await expect(studentsPage.workspaceEditor.getByTestId('workspace-student-count-value')).toBeVisible();

    console.log('Step 6: Validating student count value...');
    await expect(studentsPage.workspaceEditor.getByTestId('workspace-student-count-value')).toContainText('25,811 / 304,363');

    console.log('Step 7: Closing Depots dropdown...');
    await studentsPage.clickDepotsDropdown();
    await page.waitForTimeout(1000);

    console.log('Step 8: Clicking workspace save button to open name dialog...');
    await studentsPage.workspaceSaveBtn.click({ force: true });
    await page.waitForTimeout(1500);

    console.log(`Step 9: Filling workspace name: ${workspaceName}...`);
    // Wait for the dialog and find the input within it
    const dialogInput = page.locator('.mbox').getByRole('textbox');
    await dialogInput.waitFor({ state: 'visible', timeout: 10_000 });
    await dialogInput.click();
    await dialogInput.fill(workspaceName);
    await page.waitForTimeout(500);

    console.log('Step 10: Clicking OK button...');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(2000);

    console.log('Step 11: Clicking workspace activate button...');
    await studentsPage.clickWorkspaceActivateBtn();
    await page.waitForTimeout(1000);

    console.log('Step 12: Validating activation confirmation...');
    await expect(page.locator('body')).toContainText('Activating a Workspace');

    console.log('Step 13: Clicking Yes button...');
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForTimeout(3000);

    console.log('Step 14: Validating workspace item is active...');
    const workspaceItem = page.locator('[data-testid*="workspace-item-"]').filter({ hasText: workspaceName });
    await expect(workspaceItem).toContainText('Active', { timeout: 10_000 });

    console.log('Step 15: Validating workspace selector...');
    await expect(studentsPage.workspaceSelector).toContainText(workspaceName);

    console.log('Step 16: Validating dashboard students total...');
    await expect(studentsPage.dashboardStudentsTotalValue).toContainText('25,811');

    console.log('✓ Workspace depot validation completed successfully');
  });
});
