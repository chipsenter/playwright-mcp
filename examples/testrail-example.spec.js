/**
 * Example Playwright Test with TestRail Integration
 *
 * This example shows different ways to integrate TestRail updates
 * Run with: npx playwright test examples/testrail-example.spec.js
 */

import { test, expect } from '@playwright/test';
import { updateTestRailResult, extractCaseId } from '../utils/testrail-reporter.js';

// TestRail configuration (from Java framework)
const TESTRAIL_RUN_ID = 22;
const TESTRAIL_PROJECT_ID = 1;
const TESTRAIL_SUITE_ID = 1;

/**
 * Example 1: Simple test with manual TestRail update
 */
test('C123: Login with valid credentials', async ({ page }) => {
  const caseId = 123;
  const startTime = Date.now();

  try {
    // Test steps
    await page.goto('https://example.com/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('#login-button');

    // Verify login success
    await expect(page.locator('.welcome-message')).toBeVisible();

    // Calculate elapsed time
    const elapsed = `${Math.round((Date.now() - startTime) / 1000)}s`;

    // Update TestRail - Passed
    await updateTestRailResult(
      TESTRAIL_RUN_ID,
      caseId,
      1, // Status: Passed
      'Login successful - all validations passed',
      elapsed
    );
  } catch (error) {
    const elapsed = `${Math.round((Date.now() - startTime) / 1000)}s`;

    // Update TestRail - Failed
    await updateTestRailResult(
      TESTRAIL_RUN_ID,
      caseId,
      5, // Status: Failed
      `Test failed: ${error.message}\n\nStack trace:\n${error.stack}`,
      elapsed
    );

    throw error; // Re-throw to mark test as failed
  }
});

/**
 * Example 2: Using extractCaseId() for automatic case ID extraction
 */
test('C124: Logout functionality', async ({ page }) => {
  const caseId = extractCaseId(test.info().title); // Extracts 124 from title
  const startTime = Date.now();

  try {
    await page.goto('https://example.com/dashboard');
    await page.click('#logout-button');
    await expect(page).toHaveURL(/.*login/);

    const elapsed = `${Math.round((Date.now() - startTime) / 1000)}s`;
    await updateTestRailResult(TESTRAIL_RUN_ID, caseId, 1, 'Logout successful', elapsed);
  } catch (error) {
    const elapsed = `${Math.round((Date.now() - startTime) / 1000)}s`;
    await updateTestRailResult(TESTRAIL_RUN_ID, caseId, 5, `Failed: ${error.message}`, elapsed);
    throw error;
  }
});

/**
 * Example 3: Test with alternative naming format [C125]
 */
test('[C125] Password reset flow', async ({ page }) => {
  const caseId = extractCaseId(test.info().title);
  const startTime = Date.now();

  try {
    await page.goto('https://example.com/login');
    await page.click('a:has-text("Forgot Password")');
    await page.fill('#email', 'test@example.com');
    await page.click('#reset-button');
    await expect(page.locator('.success-message')).toContainText('Check your email');

    const elapsed = `${Math.round((Date.now() - startTime) / 1000)}s`;
    await updateTestRailResult(TESTRAIL_RUN_ID, caseId, 1, 'Password reset email sent', elapsed);
  } catch (error) {
    const elapsed = `${Math.round((Date.now() - startTime) / 1000)}s`;
    await updateTestRailResult(TESTRAIL_RUN_ID, caseId, 5, `Failed: ${error.message}`, elapsed);
    throw error;
  }
});

/**
 * Example 4: Using test.afterEach hook for automatic updates
 */
test.describe('User Management - Auto TestRail Updates', () => {
  // Automatically update TestRail after each test
  test.afterEach(async ({ }, testInfo) => {
    const caseId = extractCaseId(testInfo.title);
    if (!caseId) {
      console.log('⚠️  No TestRail case ID found in test title');
      return;
    }

    const statusId = testInfo.status === 'passed' ? 1 : 5;
    const comment = testInfo.error
      ? `Test failed: ${testInfo.error.message}\n\n${testInfo.error.stack}`
      : 'Test completed successfully';
    const elapsed = `${Math.round(testInfo.duration / 1000)}s`;

    await updateTestRailResult(TESTRAIL_RUN_ID, caseId, statusId, comment, elapsed);
  });

  test('@C126 Create new user', async ({ page }) => {
    await page.goto('https://example.com/admin/users');
    await page.click('#add-user-button');
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.click('#save-button');
    await expect(page.locator('.success-toast')).toContainText('User created');
  });

  test('@C127 Edit existing user', async ({ page }) => {
    await page.goto('https://example.com/admin/users/1');
    await page.fill('#name', 'Jane Doe');
    await page.click('#save-button');
    await expect(page.locator('.success-toast')).toContainText('User updated');
  });

  test('TestRail-128: Delete user', async ({ page }) => {
    await page.goto('https://example.com/admin/users/1');
    await page.click('#delete-button');
    await page.click('#confirm-delete');
    await expect(page.locator('.success-toast')).toContainText('User deleted');
  });
});

/**
 * Example 5: Test without TestRail case ID (will be skipped)
 */
test('Regular test without TestRail integration', async ({ page }) => {
  // This test won't update TestRail since there's no case ID in the title
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
