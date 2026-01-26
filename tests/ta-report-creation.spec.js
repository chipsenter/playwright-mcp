import { test, expect } from './fixtures.js';

test.describe('TA Report Creation', () => {
  const baseUrl = 'https://transauditor.qa.geodataintelligence.com/pwcsva#/';

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


  
});
