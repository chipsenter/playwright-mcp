/**
 * Example Test Suite with AUTOMATIC TestRail Integration
 *
 * Simply add C#### to your test title and TestRail updates automatically!
 * No need for manual updateTestRailResult() calls.
 */

import { test, expect } from '../utils/fixtures.js';

// Example suite demonstrating automatic TestRail updates
test.describe('User Management Suite', () => {

  // Test 1 - Will automatically update TestRail case C1100
  test('C1100 Create new user with valid data', async ({ page }) => {
    await page.goto('https://example.com/users');
    await page.click('#add-user');
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.click('#save');

    await expect(page.locator('.success-message')).toContainText('User created');
  });

  // Test 2 - Will automatically update TestRail case C1101
  test('C1101 Edit existing user information', async ({ page }) => {
    await page.goto('https://example.com/users/1');
    await page.fill('#name', 'Jane Doe');
    await page.click('#save');

    await expect(page.locator('.success-message')).toContainText('User updated');
  });

  // Test 3 - Will automatically update TestRail case C1102
  test('[C1102] Delete user with confirmation', async ({ page }) => {
    await page.goto('https://example.com/users/1');
    await page.click('#delete');
    await page.click('#confirm');

    await expect(page.locator('.success-message')).toContainText('User deleted');
  });

  // Test 4 - Different format, still works! Updates TestRail case C1103
  test('@C1103 Search for users by name', async ({ page }) => {
    await page.goto('https://example.com/users');
    await page.fill('#search', 'John');
    await page.click('#search-button');

    await expect(page.locator('.user-list')).toContainText('John');
  });

  // Test 5 - Another format! Updates TestRail case C1104
  test('TestRail-1104: Filter users by role', async ({ page }) => {
    await page.goto('https://example.com/users');
    await page.selectOption('#role-filter', 'admin');

    await expect(page.locator('.user-list')).toBeVisible();
  });

  // Test 6 - This test has NO TestRail ID, so it won't update TestRail
  test('Regular test without TestRail integration', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
  });
});

test.describe('Login Tests Suite', () => {

  // Test 7 - Updates TestRail case C2001
  test('C2001 Login with valid credentials (smoke)', async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('#login-button');

    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 8 - Updates TestRail case C2002
  test('C2002 Login fails with invalid password', async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'wrongpassword');
    await page.click('#login-button');

    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});
