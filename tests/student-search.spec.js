import { test, expect } from './fixtures.js';
import { LoginPage } from '../pages/LoginPage.js';
import { StudentsPage } from '../pages/StudentsPage.js';
import { getEzRoutingBaseUrl } from '../utils/ezrouting-test-config.js';

test.describe('Student Search Validation', () => {
  const baseUrl = getEzRoutingBaseUrl();

  test.beforeEach(async ({ page }) => {
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    // Login
    const loginPage = new LoginPage(page);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
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

  test('should validate all student filter dropdowns are visible', async ({ page }) => {
    const studentsPage = new StudentsPage(page);

    console.log('Step 1: Validating student filters dropdown is visible...');
    await expect(studentsPage.studentFiltersDropdown).toBeVisible();

    console.log('Step 2: Clicking student schools dropdown...');
    await studentsPage.clickSchoolsDropdown();
    await page.waitForTimeout(500);

    console.log('Step 3: Validating all dropdown filters are visible...');
    await expect(studentsPage.studentSchoolsDropdown).toBeVisible();
    await expect(studentsPage.studentGradesDropdown).toBeVisible();
    await expect(studentsPage.studentVehiclesDropdown).toBeVisible();
    await expect(studentsPage.studentOperationsDropdown).toBeVisible();
    await expect(studentsPage.studentReportsDropdown).toBeVisible();

    console.log('✓ All student filter dropdowns validated successfully');
  });

  test('should validate students filter dropdown options', async ({ page }) => {
    const studentsPage = new StudentsPage(page);

    console.log('Step 1: Clicking student filters dropdown once...');
    await studentsPage.clickFiltersDropdown();
    await page.waitForTimeout(2000);

    console.log('Step 2: Validating student filters dropdown is visible...');
    await expect(studentsPage.studentFiltersDropdown).toBeVisible();

    console.log('Step 3: Validating all filter options are visible...');
    // Wait for the first filter to become visible before checking others
    await studentsPage.filterAny.waitFor({ state: 'visible', timeout: 10_000 });

    await expect(studentsPage.filterAny).toBeVisible();
    await expect(studentsPage.filterCustomFilters).toBeVisible();
    await expect(studentsPage.filterGeneral).toBeVisible();
    await expect(studentsPage.filterRiders).toBeVisible();
    await expect(studentsPage.filterTransportPrograms).toBeVisible();
    await expect(studentsPage.filterTransportPlans).toBeVisible();
    await expect(studentsPage.filterBusSchedules).toBeVisible();
    await expect(studentsPage.filterRidership).toBeVisible();
    await expect(studentsPage.filterFamilyId).toBeVisible();
    await expect(studentsPage.filterContacts).toBeVisible();
    await expect(studentsPage.filterParents).toBeVisible();
    await expect(studentsPage.filterLocation).toBeVisible();
    await expect(studentsPage.filterBusRegions).toBeVisible();
    await expect(studentsPage.filterCustomRegions).toBeVisible();
    await expect(studentsPage.filterStudentInfo).toBeVisible();
    await expect(studentsPage.filterEthnicities).toBeVisible();
    await expect(studentsPage.filterTransportCodes).toBeVisible();
    await expect(studentsPage.filterAdvancedSearch).toBeVisible();

    console.log('✓ All student filter options validated successfully');
  });
});
