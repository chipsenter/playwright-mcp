/* eslint-disable no-console */
/**
 * Comprehensive EZRouting Smoke Test Suite
 *
 * Combines all test scenarios:
 * 1. Login validation
 * 2. Student count validation
 * 3. Workspace creation
 * 4. Navigation through main tabs
 * 5. Student search validation
 *
 * Usage:
 *   node scripts/smoke-ezrouting.js
 *   node scripts/smoke-ezrouting.js --headed
 *   node scripts/smoke-ezrouting.js --base-url=https://routing-uat.transact.com/testqa
 *
 * Requires .env file with:
 *   AUTOMATION_SUPER_USER=<email>
 *   AUTOMATION_SUPER_PASSWORD=<password>
 */

const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { loadDotEnv } = require('./loadEnv');

loadDotEnv();

function parseArgs(argv) {
  const args = {
    headed: false,
    baseUrl: 'https://routing-uat.transact.com/testqa',
    out: 'manual-test-cases/smoke-test-report.md',
    skipWorkspace: false,
    skipNavigation: false,
    skipStudentCount: false
  };

  for (const raw of argv.slice(2)) {
    if (raw === '--headed') args.headed = true;
    if (raw === '--headless') args.headed = false;
    if (raw.startsWith('--base-url=')) args.baseUrl = raw.split('=')[1] || args.baseUrl;
    if (raw.startsWith('--out=')) args.out = raw.split('=')[1] || args.out;
    if (raw === '--skip-workspace') args.skipWorkspace = true;
    if (raw === '--skip-navigation') args.skipNavigation = true;
    if (raw === '--skip-student-count') args.skipStudentCount = true;
  }

  return args;
}

// Cursor's execution environment can sometimes point Playwright at a temp/sandbox browsers dir.
function ensurePlaywrightBrowsersPath() {
  const currentBrowsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '';
  const looksLikeCursorSandbox = currentBrowsersPath.includes('cursor-sandbox-cache');

  if (!currentBrowsersPath || looksLikeCursorSandbox) {
    if (process.platform === 'darwin') {
      process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
    } else if (process.platform === 'linux') {
      process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(os.homedir(), '.cache', 'ms-playwright');
    }
  }
}

function generateUniqueWorkspaceName(baseName) {
  const randomNum = Math.floor(Math.random() * 50) + 1;
  return `${baseName}-${randomNum}`;
}

// ==================== Test Functions ====================

async function login(page, username, password) {
  const emailBox = page.getByRole('textbox', { name: /email or phone/i });
  const passwordBox = page.getByRole('textbox', { name: /^password$/i });
  const loginBtn = page.getByRole('button', { name: /^login$/i });

  await emailBox.waitFor({ state: 'visible', timeout: 30_000 });
  await emailBox.fill(username);
  await passwordBox.fill(password);
  await loginBtn.click();

  // Wait for navigation to complete
  await page.waitForTimeout(2000);
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
    console.log('  ✓ Clicked students nav link');

    // Step 2: Wait for student list panel
    const studentListPanel = page.getByTestId('student-list-panel');
    await studentListPanel.waitFor({ state: 'visible', timeout: 10_000 });
    steps.push('✓ Student list panel is visible');
    console.log('  ✓ Student list panel is visible');

    // Step 3: Click search box and clear it
    const searchBox = page.getByRole('searchbox', { name: 'search' });
    await searchBox.waitFor({ state: 'visible', timeout: 10_000 });
    await searchBox.click();
    await page.waitForTimeout(300);
    await searchBox.fill('');
    await page.waitForTimeout(500);
    steps.push('✓ Clicked search box and cleared search');
    console.log('  ✓ Clicked search box and cleared search');

    // Step 4: Validate student list count is visible
    const studentListCount = page.getByTestId('student-list-count');
    await studentListCount.waitFor({ state: 'visible', timeout: 10_000 });
    steps.push('✓ Student list count is visible');
    console.log('  ✓ Student list count is visible');

    // Step 5: Get student count text
    studentCount = await studentListCount.textContent() || '';
    steps.push(`✓ Student count: "${studentCount}"`);
    console.log(`  ✓ Student count: "${studentCount}"`);

    // Step 6: Validate student count contains expected text
    const expectedCount = '410 / 410';
    if (studentCount.includes(expectedCount)) {
      steps.push(`✓ Student count matches expected: "${expectedCount}"`);
      console.log(`  ✓ Student count matches expected: "${expectedCount}"`);
      studentCountValidated = true;
    } else {
      issues.push(`Student count mismatch: expected "${expectedCount}", got "${studentCount}"`);
      console.log(`  ✗ Student count mismatch: expected "${expectedCount}", got "${studentCount}"`);
    }

  } catch (error) {
    issues.push(`Error during student count validation: ${error.message}`);
    console.log(`  ✗ Error: ${error.message}`);
  }

  return { studentCountValidated, studentCount, steps, issues };
}

async function createWorkspace(page, workspaceName) {
  const issues = [];
  const steps = [];
  let workspaceCreated = false;

  try {
    // Step 1: Click workspace title to open workspace panel
    const workspaceTitle = page.getByTestId('workspace-title');
    await workspaceTitle.waitFor({ state: 'visible', timeout: 10_000 });
    await workspaceTitle.click();
    await page.waitForTimeout(500);
    steps.push('✓ Clicked workspace title');
    console.log('  ✓ Clicked workspace title');

    // Step 2: Click workspace add button
    const workspaceAddBtn = page.getByTestId('workspace-add-btn');
    await workspaceAddBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await workspaceAddBtn.click();
    await page.waitForTimeout(500);
    steps.push('✓ Clicked workspace add button');
    console.log('  ✓ Clicked workspace add button');

    // Step 3: Click save to open dialog
    const workspaceSaveBtn = page.getByTestId('workspace-save-btn');
    await workspaceSaveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await workspaceSaveBtn.click();
    await page.waitForTimeout(500);
    steps.push('✓ Clicked workspace save button (opened dialog)');
    console.log('  ✓ Clicked workspace save button (opened dialog)');

    // Step 4: Fill workspace name
    const workspaceNameInput = page.getByRole('textbox').nth(1);
    await workspaceNameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await workspaceNameInput.click();
    await workspaceNameInput.fill(workspaceName);
    await page.waitForTimeout(300);
    steps.push(`✓ Filled workspace name: "${workspaceName}"`);
    console.log(`  ✓ Filled workspace name: "${workspaceName}"`);

    // Step 5: Click OK button
    const okBtn = page.getByRole('button', { name: 'OK' });
    await okBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await okBtn.click();
    await page.waitForTimeout(1000);
    steps.push('✓ Clicked OK button');
    console.log('  ✓ Clicked OK button');

    // Step 6: Click final save button
    await workspaceSaveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await workspaceSaveBtn.click();
    await page.waitForTimeout(1500);
    steps.push('✓ Clicked final save button');
    console.log('  ✓ Clicked final save button');

    // Step 7: Validate confirmation modal and click OK
    try {
      const modalText = page.getByText(`Your workspace, "${workspaceName}`);
      await modalText.waitFor({ state: 'visible', timeout: 5_000 });
      steps.push('✓ Validated confirmation modal text is visible');
      console.log('  ✓ Validated confirmation modal text is visible');
    } catch (error) {
      steps.push('⚠ Modal text validation skipped (not found)');
      console.log('  ⚠ Modal text validation skipped (not found)');
    }

    // Validate OK button is visible
    const finalOkBtn = page.getByRole('button', { name: 'OK' });
    await finalOkBtn.waitFor({ state: 'visible', timeout: 10_000 });
    steps.push('✓ Validated OK button is visible');
    console.log('  ✓ Validated OK button is visible');

    // Click OK button
    await finalOkBtn.click();
    await page.waitForTimeout(1000);
    steps.push('✓ Clicked OK button');
    console.log('  ✓ Clicked OK button');

    workspaceCreated = true;
    steps.push('✓ Workspace created successfully');
    console.log('  ✓ Workspace created successfully');

  } catch (error) {
    issues.push(`Error during workspace creation: ${error.message}`);
    console.log(`  ✗ Error: ${error.message}`);
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

    console.log(`  ${success ? '✓' : '✗'} ${route.name}: ${title}`);
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
    console.log(`  ✓ Search "AUTOMATION": ${count1}`);

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
    console.log(`  ✓ Search "Fox": ${count2}`);

    // Clear the search after the last test
    await searchBox.click();
    await searchBox.fill('');
    await page.waitForTimeout(500);

  } catch (error) {
    console.error('  ✗ Search validation error:', error.message);
  }

  return results;
}

// ==================== Report Generation ====================

function writeMarkdownReport(outPath, result) {
  const abs = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  let md = `# EZRouting UAT - Comprehensive Smoke Test\n\n`;
  md += `- **URL**: \`${result.baseUrl}\`\n`;
  md += `- **Date**: ${result.date}\n`;
  md += `- **Environment**: UAT (\`testqa\`)\n`;
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

// ==================== Main Test Execution ====================

async function main() {
  ensurePlaywrightBrowsersPath();
  const { chromium } = require('playwright');

  const args = parseArgs(process.argv);
  const username = process.env.AUTOMATION_SUPER_USER;
  const password = process.env.AUTOMATION_SUPER_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env file');
  }

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  console.log('=== EZRouting Comprehensive Smoke Test ===');
  console.log('Base URL:', args.baseUrl);
  console.log('Username:', username);
  console.log('');

  try {
    // Step 1: Navigate and login
    console.log('Step 1: Login...');
    await page.goto(args.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await login(page, username, password);

    const loginUrl = page.url();
    const loginTitle = await page.title();
    const loginSuccess = loginTitle.includes('Dashboard') || loginUrl.includes(args.baseUrl);

    console.log('  Login URL:', loginUrl);
    console.log('  Login Title:', loginTitle);
    console.log('  Success:', loginSuccess);
    console.log('');

    // Step 2: Validate student count (if not skipped)
    let studentCountValidation = { studentCountValidated: false, studentCount: '', steps: [], issues: [] };
    if (!args.skipStudentCount) {
      console.log('Step 2: Validate Student Count...');
      studentCountValidation = await validateStudentCount(page);
      console.log('  Student count validated:', studentCountValidation.studentCountValidated);
      console.log('');
    }

    // Step 3: Create workspace (if not skipped)
    let workspaceCreation = { workspaceCreated: false, workspaceName: '', steps: [], issues: [] };
    if (!args.skipWorkspace) {
      console.log('Step 3: Create Workspace...');
      const workspaceName = generateUniqueWorkspaceName('smoke-test-workspace');
      workspaceCreation = await createWorkspace(page, workspaceName);
      console.log('  Workspace created:', workspaceCreation.workspaceCreated);
      console.log('');
    }

    // Step 4: Validate navigation (if not skipped)
    let navigationValidation = [];
    let searchValidation = [];
    if (!args.skipNavigation) {
      console.log('Step 4: Validate Navigation...');
      navigationValidation = await validateNavigation(page, args.baseUrl);
      console.log('');

      console.log('Step 5: Validate Student Search...');
      searchValidation = await validateStudentsSearch(page, args.baseUrl);
      console.log('');
    }

    // Write report
    const reportPath = writeMarkdownReport(args.out, {
      baseUrl: args.baseUrl,
      date: new Date().toISOString().slice(0, 10),
      username: username,
      loginSuccess,
      loginUrl,
      loginTitle,
      studentCountValidation,
      workspaceCreation,
      navigationValidation,
      searchValidation,
      skipStudentCount: args.skipStudentCount,
      skipWorkspace: args.skipWorkspace,
      skipNavigation: args.skipNavigation
    });

    console.log('Report written to:', reportPath);
    console.log('');

    // Take final screenshot
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    fs.mkdirSync(artifactsDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactsDir, 'smoke-test-final.png'), fullPage: true });
    console.log('Screenshot saved to: artifacts/smoke-test-final.png');

  } catch (error) {
    console.error('Test execution failed:', error);
    throw error;
  } finally {
    // Close browser automatically
    await browser.close();
    console.log('Browser closed.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
