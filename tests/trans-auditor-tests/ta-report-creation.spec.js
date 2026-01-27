import { test, expect } from '../../utils/fixtures.js';
import { TaDashboardPage } from '../../pages/trans-auditor-pages/TaDashboardPage.js';

test.describe('TA Report Creation', () => {
  const baseUrl = 'https://transauditor.qa.geodataintelligence.com/pwcsva#/';

  // Set TestRail Run ID for this test suite
  test.beforeAll(() => {
    process.env.TESTRAIL_RUN_ID = '219';
  });

  test('should create and export Planned vs Actual report', async ({ page }) => {
    const username = process.env.TA_USERNAME;
    const password = process.env.TA_PASSWORD;

    test.skip(!username || !password, 'Missing TA_USERNAME or TA_PASSWORD in .env');

    // Navigate to TransAuditor
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Login
    await page.getByRole('textbox', { name: 'Username Username' }).click();
    await page.getByRole('textbox', { name: 'Username Username' }).fill(username);
    await page.getByRole('textbox', { name: 'Password Password' }).click();
    await page.getByRole('textbox', { name: 'Password Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);

    // Click Planned vs. Actual report button
    await page.getByRole('button', { name: 'Planned vs. Actual' }).click();
    await page.waitForTimeout(500);

    // Select Trip Type - AM
    await page.getByText('Trip Type: (All)').click();
    await page.getByRole('checkbox', { name: 'AM' }).check();

    // Select date range
    await page.getByRole('textbox', { name: 'Select Date(s) Select Date(s)' }).click();
    await page.getByRole('button', { name: '5', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Multi-day' }).check();
    await page.getByRole('button', { name: '26', exact: true }).click();

    // Sort by Trip column
    await page.getByRole('table').getByText('Trip', { exact: true }).click();
    await page.getByRole('table').getByText('Trip', { exact: true }).click();

    // Sort by Planned Arrival
    await page.getByRole('button', { name: 'Planned Arrival' }).click();

    // Export report
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;

    // Verify download started
    expect(download).toBeTruthy();

    // Logout
    await page.locator('i').nth(2).click();
    await page.getByText('Logout').click();

    // Verify logged out - login form visible
    await expect(page.getByRole('textbox', { name: 'Username Username' })).toBeVisible();
  });

  test('C7205 validate dashboard elements present', async ({ page }) => {
    const username = process.env.TA_USERNAME;
    const password = process.env.TA_PASSWORD;

    test.skip(!username || !password, 'Missing TA_USERNAME or TA_PASSWORD in .env');

    // Navigate to TransAuditor
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Initialize page object
    const dashboard = new TaDashboardPage(page);

    // Login
    await dashboard.login(username, password);

    // Validate main navigation buttons
    await dashboard.validateMainNavigation();

    // Validate overview section
    await dashboard.validateOverview();

    // Validate dashboard links
    await dashboard.validateDashboardLinks();

    // Validate alerts section
    await dashboard.validateAlerts();

    // Validate incident tracking
    await dashboard.validateIncidentTracking();
  });

    test('C6811 validate dashboard elements present', async ({ page }) => {
    const username = process.env.TA_USERNAME;
    const password = process.env.TA_PASSWORD;

    test.skip(!username || !password, 'Missing TA_USERNAME or TA_PASSWORD in .env');

    // Navigate to TransAuditor
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Initialize page object
    const dashboard = new TaDashboardPage(page);

    // Login
    await dashboard.login(username, password);

    // Validate main navigation buttons
    await dashboard.clickPlannedVsActual();

    // Validate Planned vs. Actual page elements
    await expect(dashboard.searchInput).toBeVisible();
    await expect(dashboard.selectDateInput).toBeVisible();
    await expect(dashboard.exportButton).toBeVisible();
    await expect(dashboard.pvaAllButton).toBeVisible();
    await expect(dashboard.pvaAmButton).toBeVisible();
    await expect(dashboard.pvaPmButton).toBeVisible();
    await expect(dashboard.pvaMiscButton).toBeVisible();

  });

   test('C7206 validate incident tracking elements present', async ({ page }) => {
    const username = process.env.TA_USERNAME;
    const password = process.env.TA_PASSWORD;

    test.skip(!username || !password, 'Missing TA_USERNAME or TA_PASSWORD in .env');

    // Navigate to TransAuditor
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Initialize page object
    const dashboard = new TaDashboardPage(page);

    // Login
    await dashboard.login(username, password);

    // Validate main navigation buttons
    await dashboard.clickIncidentTracking();

    // Validate Incident Tracking page elements
    await dashboard.clickIncidentPlusButton();
    await dashboard.validateIncidentNewTicketModalElement();

  });

});
