import { test, expect } from '../../utils/fixtures.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';

test('uat admin login (smoke)', async ({ page }) => {
  const email = process.env.AUTOMATION_SUPER_USER;
  const password = process.env.AUTOMATION_SUPER_PASSWORD;

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
