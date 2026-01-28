import { test, expect } from '../../utils/fixtures.js';
import { LoginPage } from '../../pages/ezr/LoginPage.js';
import { DashboardPage } from '../../pages/ezr/DashboardPage.js';
import { getEzRoutingBaseUrl } from '../../utils/ezrouting-test-config.js';

test.describe('Login Page Tests Validation', () => {
  const baseUrl = getEzRoutingBaseUrl();
  const email = process.env.AUTOMATION_SUPER_USER;
  const password = process.env.AUTOMATION_SUPER_PASSWORD;

  test('C7204 uat admin login (smoke) @smoke @sanity', async ({ page }) => {
    
    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in env/.env');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    const dashboard = new DashboardPage(page);

    await dashboard.searchAndSelectDistrict(
      'testqa',
      'Fox Point Joint No. 2 School District, WI testqa 07/18/2025 EZRouting'
    );
    const page1 = await dashboard.openRoutingInPopup();

    await expect(page1).toHaveURL(/routing-uat\.transact\.com/);
  });

  test('C7211 login page element validation @smoke @sanity', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const loginPage = new LoginPage(page);
    await loginPage.validateLoginPageElements();

  });

  test('C7212 parent registration modal validation @smoke @sanity', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await loginPage.openParentRegistrationModal();
    await expect(page.getByRole('heading')).toContainText('PARENT REGISTRATION');

    await loginPage.validateParentRegistrationModalElements();
    await loginPage.clickParentRegistrationModalCancel();
  });

    test('C7213 login with bad credentials @smoke @sanity', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const loginPage = new LoginPage(page);
    await loginPage.validateLoginPageElements();
    await loginPage.login('invalid@example.com', 'wrongpassword');
  });

    test('C7214 login with good credentials and log out @smoke @sanity', async ({ page }) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    await loginPage.validateLoginPageElements();
    await loginPage.login(email, password);
    await dashboard.validateNewLogo();
    await dashboard.logout();
    await loginPage.validateLoginPagePresent();

  });


});
