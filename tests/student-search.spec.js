import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { StudentsPage } from '../pages/StudentsPage.js';

test.describe('Student Search Validation', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    // Login
    const loginPage = new LoginPage(page);
    await page.goto('https://routing-uat.transact.com/testqa', { waitUntil: 'domcontentloaded' });
    await loginPage.login(email, password);
    await page.waitForTimeout(2000);

    // Navigate to Students page
    const studentsPage = new StudentsPage(page);
    await studentsPage.navigateToStudents();
    await studentsPage.waitForStudentList();
  });

  test('should search for "AUTOMATION" and show results', async ({ page }) => {
    const studentsPage = new StudentsPage(page);

    // Search for AUTOMATION
    await studentsPage.searchBox.click();
    await page.waitForTimeout(500);
    await studentsPage.searchBox.fill('AUTOMATION');
    await page.waitForTimeout(1500);

    // Verify student list count is visible and contains result
    const count = await studentsPage.getStudentCount();
    expect(count).toContain('/ 410');

    // Clear search
    await studentsPage.clearSearch();
    await page.waitForTimeout(500);
  });

  test('should search for "Fox" and show results', async ({ page }) => {
    const studentsPage = new StudentsPage(page);

    // Search for Fox
    await studentsPage.searchBox.click();
    await page.waitForTimeout(500);
    await studentsPage.searchBox.fill('Fox');
    await page.waitForTimeout(1500);

    // Verify student list count is visible and contains result
    const count = await studentsPage.getStudentCount();
    expect(count).toContain('/ 410');

    // Verify results are filtered
    const countNumber = parseInt(count.split('/')[0].trim());
    expect(countNumber).toBeLessThan(410);
    expect(countNumber).toBeGreaterThan(0);

    // Clear search
    await studentsPage.clearSearch();
    await page.waitForTimeout(500);
  });

  test('should clear search and show all students', async ({ page }) => {
    const studentsPage = new StudentsPage(page);

    // First search for something
    await studentsPage.searchBox.click();
    await page.waitForTimeout(500);
    await studentsPage.searchBox.fill('Fox');
    await page.waitForTimeout(1500);

    // Clear search
    await studentsPage.clearSearch();
    await page.waitForTimeout(500);

    // Verify all students are shown
    const count = await studentsPage.getStudentCount();
    expect(count).toContain('410 / 410');
  });
});
