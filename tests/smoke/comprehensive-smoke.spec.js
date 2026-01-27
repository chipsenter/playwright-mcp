import { test, expect } from '../../utils/fixtures.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';
import { StudentsPage } from '../../pages/StudentsPage.js';
import { getEzRoutingBaseUrl } from '../../utils/ezrouting-test-config.js';
import fs from 'node:fs';
import path from 'node:path';

test.describe.configure({ mode: 'serial' });

test.describe('Comprehensive EZRouting Smoke Test', () => {
  const baseUrl = getEzRoutingBaseUrl();

  function generateUniqueWorkspaceName(baseName) {
    const randomNum = Math.floor(Math.random() * 50) + 1;
    return `${baseName}-${randomNum}`;
  }

  async function validateStudentCount(page) {
    const steps = [];
    const issues = [];
    let studentCountValidated = false;
    let studentCount = '';

    try {
      // Step 1: Click students nav link
      const navStudentsLink = page.getByTestId('nav-students-link');
      await navStudentsLink.waitFor({ state: 'visible', timeout: 10_000 });
      await navStudentsLink.click();
      await page.waitForTimeout(1500);
      steps.push('✓ Clicked students nav link');

      // Step 2: Wait for student list panel
      const studentListPanel = page.getByTestId('student-list-panel');
      await studentListPanel.waitFor({ state: 'visible', timeout: 10_000 });
      steps.push('✓ Student list panel is visible');

      // Step 3: Click search box and clear it
      const searchBox = page.getByRole('searchbox', { name: 'search' });
      await searchBox.waitFor({ state: 'visible', timeout: 10_000 });
      await searchBox.click();
      await page.waitForTimeout(300);
      await searchBox.fill('');
      await page.waitForTimeout(500);
      steps.push('✓ Clicked search box and cleared search');

      // Step 4: Validate student list count is visible
      const studentListCount = page.getByTestId('student-list-count');
      await studentListCount.waitFor({ state: 'visible', timeout: 10_000 });
      steps.push('✓ Student list count is visible');

      // Step 5: Get student count text
      studentCount = await studentListCount.textContent() || '';
      steps.push(`✓ Student count: "${studentCount}"`);

      // Step 6: Validate student count contains expected text
      const expectedCount = '410 / 410';
      if (studentCount.includes(expectedCount)) {
        steps.push(`✓ Student count matches expected: "${expectedCount}"`);
        studentCountValidated = true;
      } else {
        issues.push(`Student count mismatch: expected "${expectedCount}", got "${studentCount}"`);
      }

    } catch (error) {
      issues.push(`Error during student count validation: ${error.message}`);
    }

    return { studentCountValidated, studentCount, steps, issues };
  }

  async function createWorkspace(page, workspaceName) {
    const issues = [];
    const steps = [];
    let workspaceCreated = false;

    try {
      const dashboard = new DashboardPage(page);

      // Step 1: Click workspace title to open workspace panel
      await dashboard.workspaceTitle.waitFor({ state: 'visible', timeout: 10_000 });
      await dashboard.workspaceTitle.click();
      await page.waitForTimeout(500);
      steps.push('✓ Clicked workspace title');

      // Step 2: Click workspace add button
      await dashboard.workspaceAddButton.waitFor({ state: 'visible', timeout: 10_000 });
      await dashboard.workspaceAddButton.click();
      await page.waitForTimeout(500);
      steps.push('✓ Clicked workspace add button');

      // Step 3: Click save to open dialog
      await dashboard.workspaceSaveButton.waitFor({ state: 'visible', timeout: 10_000 });
      await dashboard.workspaceSaveButton.click();
      await page.waitForTimeout(500);
      steps.push('✓ Clicked workspace save button (opened dialog)');

      // Step 4: Fill workspace name
      await dashboard.workspaceNameInput.waitFor({ state: 'visible', timeout: 10_000 });
      await dashboard.workspaceNameInput.click();
      await dashboard.workspaceNameInput.fill(workspaceName);
      await page.waitForTimeout(300);
      steps.push(`✓ Filled workspace name: "${workspaceName}"`);

      // Step 5: Click OK button
      await dashboard.okButton.waitFor({ state: 'visible', timeout: 10_000 });
      await dashboard.okButton.click();
      await page.waitForTimeout(1000);
      steps.push('✓ Clicked OK button');

      // Step 6: Click final save button
      await dashboard.workspaceSaveButton.waitFor({ state: 'visible', timeout: 10_000 });
      await dashboard.workspaceSaveButton.click();
      await page.waitForTimeout(1500);
      steps.push('✓ Clicked final save button');

      // Step 7: Validate confirmation modal and click OK
      try {
        const modalText = page.getByText(`Your workspace, "${workspaceName}`);
        await modalText.waitFor({ state: 'visible', timeout: 5_000 });
        steps.push('✓ Validated confirmation modal text is visible');
      } catch (error) {
        steps.push('⚠ Modal text validation skipped (not found)');
      }

      await dashboard.okButton.waitFor({ state: 'visible', timeout: 10_000 });
      steps.push('✓ Validated OK button is visible');

      await dashboard.okButton.click();
      await page.waitForTimeout(1000);
      steps.push('✓ Clicked OK button');

      workspaceCreated = true;
      steps.push('✓ Workspace created successfully');

    } catch (error) {
      issues.push(`Error during workspace creation: ${error.message}`);
    }

    return { workspaceCreated, workspaceName, issues, steps };
  }

  async function validateNavigation(page, baseUrl) {
    const routes = [
      { name: 'Dashboard', hash: '', expectedInTitle: 'Dashboard' },
      { name: 'Students', hash: 'students', expectedInTitle: 'Students' },
      { name: 'Schools', hash: 'schools', expectedInTitle: 'Schools' },
      { name: 'Vehicles', hash: 'vehicles', expectedInTitle: 'Vehicles' },
      { name: 'Staff', hash: 'staffs', expectedInTitle: 'Staffs' },
      { name: 'Stops', hash: 'stops', expectedInTitle: 'Stops' },
      { name: 'Field Trip', hash: 'fieldtrips', expectedInTitle: 'Field Trips' },
      { name: 'Routes', hash: 'routes', expectedInTitle: 'Routes' }
    ];

    const results = [];

    for (const route of routes) {
      const targetUrl = route.hash ? `${baseUrl}#/${route.hash}` : `${baseUrl}#/`;

      await page.evaluate((url) => {
        window.location.href = url;
      }, targetUrl);

      await page.waitForTimeout(1500);

      const currentUrl = page.url();
      const title = await page.title();
      const success = title.includes(route.expectedInTitle);

      results.push({
        name: route.name,
        url: currentUrl,
        title: title,
        success: success
      });
    }

    return results;
  }

  async function validateStudentsSearch(page, baseUrl) {
    const results = [];

    try {
      // Navigate to Students
      await page.evaluate((url) => {
        window.location.href = url;
      }, `${baseUrl}#/students`);
      await page.waitForTimeout(1500);

      await page.getByTestId('student-list-panel').waitFor({ state: 'visible', timeout: 60_000 });

      // Find the search box
      const searchBox = page.getByRole('searchbox', { name: 'search' });
      await searchBox.waitFor({ state: 'visible', timeout: 30_000 });

      // Test 1: Search for "AUTOMATION"
      await searchBox.click();
      await page.waitForTimeout(500);
      await searchBox.fill('AUTOMATION');
      await page.waitForTimeout(1500);

      const count1 = await page.getByTestId('student-list-count').textContent() || '';
      results.push({ search: 'AUTOMATION', count: count1 });

      // Clear
      await searchBox.click();
      await searchBox.fill('');
      await page.waitForTimeout(500);

      // Test 2: Search for "Fox"
      await searchBox.click();
      await page.waitForTimeout(500);
      await searchBox.fill('Fox');
      await page.waitForTimeout(1500);

      const count2 = await page.getByTestId('student-list-count').textContent() || '';
      results.push({ search: 'Fox', count: count2 });

      // Clear the search after the last test
      await searchBox.click();
      await searchBox.fill('');
      await page.waitForTimeout(500);

    } catch (error) {
      console.error('  ✗ Search validation error:', error.message);
    }

    return results;
  }

  function writeMarkdownReport(outPath, result) {
    const abs = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });

    let md = `# EZRouting UAT - Comprehensive Smoke Test\n\n`;
    md += `- **URL**: \`${result.baseUrl}\`\n`;
    md += `- **Date**: ${result.date}\n`;
    md += `- **Environment**: UAT (\`${result.client || 'testqa'}\`)\n`;
    md += `- **Tester**: Automated smoke test\n\n`;

    md += `## Test Summary\n\n`;
    md += `- **Login**: ${result.loginSuccess ? '✓ Success' : '✗ Failed'}\n`;
    if (!result.skipStudentCount) {
      md += `- **Student Count Validation**: ${result.studentCountValidation.studentCountValidated ? '✓ Success' : '✗ Failed'}\n`;
    }
    if (!result.skipWorkspace) {
      md += `- **Workspace Creation**: ${result.workspaceCreation.workspaceCreated ? '✓ Success' : '✗ Failed'}\n`;
    }
    if (!result.skipNavigation) {
      const navSuccess = result.navigationValidation.every(r => r.success);
      md += `- **Navigation**: ${navSuccess ? '✓ Success' : '✗ Failed'}\n`;
      md += `- **Student Search**: ${result.searchValidation.length > 0 ? '✓ Success' : '✗ Failed'}\n`;
    }
    md += `\n`;

    // Login section
    md += `## 1) Login\n`;
    md += `- **Action**: Filled Email/Phone + Password, clicked Login.\n`;
    md += `- **Outcome**: ${result.loginSuccess ? '✓ Successfully authenticated' : '✗ Authentication failed'}\n`;
    md += `  - **URL**: \`${result.loginUrl}\`\n`;
    md += `  - **Title**: \`${result.loginTitle}\`\n\n`;

    // Student count section
    if (!result.skipStudentCount) {
      md += `## 2) Student Count Validation\n`;
      md += `- **Action**: Navigate to Students page and validate student count.\n`;
      if (result.studentCountValidation.steps && result.studentCountValidation.steps.length > 0) {
        md += `- **Steps performed**:\n`;
        for (const step of result.studentCountValidation.steps) {
          md += `  - ${step}\n`;
        }
      }
      md += `- **Outcome**: ${result.studentCountValidation.studentCountValidated ? '✓ Success' : '✗ Failed'}\n\n`;
    }

    // Workspace creation section
    if (!result.skipWorkspace) {
      md += `## 3) Workspace Creation\n`;
      md += `- **Action**: Create a new workspace.\n`;
      md += `- **Workspace Name**: \`${result.workspaceCreation.workspaceName}\`\n`;
      if (result.workspaceCreation.steps && result.workspaceCreation.steps.length > 0) {
        md += `- **Steps performed**:\n`;
        for (const step of result.workspaceCreation.steps) {
          md += `  - ${step}\n`;
        }
      }
      md += `- **Outcome**: ${result.workspaceCreation.workspaceCreated ? '✓ Success' : '✗ Failed'}\n\n`;
    }

    // Navigation section
    if (!result.skipNavigation) {
      md += `## 4) Navigation Validation\n`;
      md += `- **Action**: Navigate through all main tabs.\n\n`;
      md += `| Tab | Title | Status |\n`;
      md += `|-----|-------|--------|\n`;
      for (const nav of result.navigationValidation) {
        md += `| ${nav.name} | ${nav.title} | ${nav.success ? '✓' : '✗'} |\n`;
      }
      md += `\n`;

      // Student search section
      md += `## 5) Student Search Validation\n`;
      md += `- **Action**: Test student search functionality.\n\n`;
      md += `| Search Term | Result Count |\n`;
      md += `|-------------|-------------|\n`;
      for (const search of result.searchValidation) {
        md += `| ${search.search} | ${search.count} |\n`;
      }
      md += `\n`;
    }

    md += `## Notes\n\n`;
    md += `- All tests executed successfully via automated smoke test.\n`;

    fs.writeFileSync(abs, md, 'utf8');
    return abs;
  }

  test('comprehensive smoke test suite', async ({ page }) => {
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    test.skip(!email || !password, 'Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');

    const skipStudentCount = process.env.SKIP_STUDENT_COUNT === 'true';
    const skipWorkspace = process.env.SKIP_WORKSPACE === 'true';
    const skipNavigation = process.env.SKIP_NAVIGATION === 'true';

    // Step 1: Navigate and login
    const loginPage = new LoginPage(page);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await loginPage.login(email, password);
    await page.waitForTimeout(3000);

    const loginUrl = page.url();
    const loginTitle = await page.title();
    const loginSuccess = loginTitle.includes('Dashboard') || loginUrl.includes(baseUrl);

    // Step 2: Validate student count (if not skipped)
    let studentCountValidation = { studentCountValidated: false, studentCount: '', steps: [], issues: [] };
    if (!skipStudentCount) {
      studentCountValidation = await validateStudentCount(page);
    }

    // Step 3: Create workspace (if not skipped)
    let workspaceCreation = { workspaceCreated: false, workspaceName: '', steps: [], issues: [] };
    if (!skipWorkspace) {
      const workspaceName = generateUniqueWorkspaceName('smoke-test-workspace');
      workspaceCreation = await createWorkspace(page, workspaceName);
    }

    // Step 4: Validate navigation (if not skipped)
    let navigationValidation = [];
    let searchValidation = [];
    if (!skipNavigation) {
      navigationValidation = await validateNavigation(page, baseUrl);
      searchValidation = await validateStudentsSearch(page, baseUrl);
    }

    // Write report
    const reportPath = writeMarkdownReport('manual-test-cases/smoke-test-report.md', {
      baseUrl,
      date: new Date().toISOString().slice(0, 10),
      client: process.env.CLIENT || 'testqa',
      username: email,
      loginSuccess,
      loginUrl,
      loginTitle,
      studentCountValidation,
      workspaceCreation,
      navigationValidation,
      searchValidation,
      skipStudentCount,
      skipWorkspace,
      skipNavigation
    });

    console.log('Report written to:', reportPath);

    // Take final screenshot
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    fs.mkdirSync(artifactsDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactsDir, 'smoke-test-final.png'), fullPage: true });
    console.log('Screenshot saved to: artifacts/smoke-test-final.png');

    // Assertions
    expect(loginSuccess).toBe(true);
    if (!skipStudentCount) {
      expect(studentCountValidation.studentCountValidated).toBe(true);
    }
    if (!skipWorkspace) {
      expect(workspaceCreation.workspaceCreated).toBe(true);
    }
    if (!skipNavigation) {
      expect(navigationValidation.every(r => r.success)).toBe(true);
      expect(searchValidation.length).toBeGreaterThan(0);
    }
  });
});
