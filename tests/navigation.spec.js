import { test, expect } from './fixtures.js';
import { LoginPage } from '../pages/LoginPage.js';
import { getEzRoutingBaseUrl } from '../utils/ezrouting-test-config.js';

test.describe.configure({ mode: 'serial' });

test.describe('Navigation Validation', () => {
  const baseUrl = getEzRoutingBaseUrl();

  test.beforeEach(async ({ page }) => {
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    // Login before each test
    const loginPage = new LoginPage(page);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await loginPage.login(email, password);
    await page.waitForTimeout(3000);
  });

  test('should navigate to Dashboard', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/`);

    // Wait for URL to change and title to update
    await page.waitForFunction(() => window.location.hash === '#/', { timeout: 5000 });
    await page.waitForFunction(() => document.title.includes('Dashboard'), { timeout: 10000 });

    const title = await page.title();
    expect(title).toContain('Dashboard');
  });

  test('should navigate to Students', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/students`);

    // Wait for URL to change and title to update
    await page.waitForFunction(() => window.location.hash === '#/students', { timeout: 5000 });
    await page.waitForFunction(() => document.title.includes('Students'), { timeout: 10000 });

    const title = await page.title();
    expect(title).toContain('Students');
  });

  test('should navigate to Schools', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/schools`);

    await page.waitForFunction(() => window.location.hash === '#/schools', { timeout: 5000 });
    await page.waitForFunction(() => document.title.includes('Schools'), { timeout: 10_000 });

    const title = await page.title();
    expect(title).toContain('Schools');
  });

  test('should navigate to Vehicles', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/vehicles`);
    await page.waitForTimeout(1500);

    const title = await page.title();
    expect(title).toContain('Vehicles');
  });

  test('should navigate to Staff', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/staffs`);
    
    await page.waitForFunction(() => window.location.hash === '#/staffs', { timeout: 5000 });
    await page.waitForFunction(() => document.title.includes('Staffs'), { timeout: 10_000 });
  });

  test('should navigate to Stops', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/stops`);

    await page.waitForFunction(() => window.location.hash === '#/stops', { timeout: 5000 });
    await page.waitForFunction(() => document.title.includes('Stops'), { timeout: 10_000 });
  });

  test('should navigate to Field Trips', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/fieldtrips`);
    await page.waitForTimeout(1500);

    const title = await page.title();
    expect(title).toContain('Field Trips');
  });

  test('should navigate to Routes', async ({ page }) => {
    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/routes`);

    await page.waitForFunction(() => window.location.hash === '#/routes', { timeout: 5000 });
    await page.waitForFunction(() => document.title.includes('Routes'), { timeout: 10_000 });
  });
});
