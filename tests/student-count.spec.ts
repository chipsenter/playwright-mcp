import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { StudentsPage } from '../pages/StudentsPage';

test.describe('Student Count Validation', () => {
  test('should display correct student count after clearing search', async ({ page }) => {
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    // Login
    const loginPage = new LoginPage(page);
    await page.goto('https://routing-uat.transact.com/testqa', { waitUntil: 'domcontentloaded' });
    await loginPage.login(email!, password!);
    await page.waitForTimeout(2000);

    // Navigate to Students page
    const studentsPage = new StudentsPage(page);
    await studentsPage.navigateToStudents();
    await studentsPage.waitForStudentList();

    // Clear search to show all students
    await studentsPage.clearSearch();
    await page.waitForTimeout(500);

    // Validate student count
    const studentCount = await studentsPage.getStudentCount();
    expect(studentCount).toContain('410 / 410');
  });
});
