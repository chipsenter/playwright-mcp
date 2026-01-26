import { test, expect } from './fixtures.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RoutesPage } from '../pages/RoutesPage.js';
import { getEzRoutingBaseUrl } from '../utils/ezrouting-test-config.js';

test.describe('Show Students on Routes Page', () => {
  test('should display routed students count in modal', async ({ page }) => {
    const baseUrl = getEzRoutingBaseUrl();
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    // Step 1: Open Chrome and navigate to UAT
    console.log('Step 1: Navigating to UAT...');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Step 2: Login
    console.log('Step 2: Logging in...');
    const loginPage = new LoginPage(page);
    await loginPage.login(email, password);
    await page.waitForTimeout(2000);

    // Step 3: Click Routes nav button
    console.log('Step 3: Navigating to Routes page...');
    const routesPage = new RoutesPage(page);
    await routesPage.navigateToRoutes();

    // Step 4: Validate user landed on Routes URL
    console.log('Step 4: Validating Routes URL...');
    const currentUrl = page.url();
    expect(currentUrl).toContain('#/routes');
    expect(currentUrl).toContain(baseUrl);
    console.log(`✓ Successfully navigated to Routes: ${currentUrl}`);

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Step 5: Click Show Students dropdown
    console.log('Step 5: Clicking Show Students dropdown...');
    await routesPage.clickShowStudentsDropdown();

    // Step 6: Click Show Routed Students
    console.log('Step 6: Clicking Show Routed Students...');
    await routesPage.clickShowRoutedStudents();

    // Wait for content to load after clicking
    await page.waitForTimeout(3000);

    // Step 7: Validate number of students in the modal displayed
    console.log('Step 7: Validating student count in modal...');
    const studentCount = await routesPage.getStudentCountFromModal();

    expect(studentCount).not.toBeNull();
    expect(studentCount).toBeGreaterThan(0);
    console.log(`✓ Student count in modal: ${studentCount}`);

    // Take a screenshot of the modal for verification
    await page.screenshot({ path: 'artifacts/routed-students-modal.png', fullPage: true });
    console.log('✓ Screenshot saved to artifacts/routed-students-modal.png');
  });
});
