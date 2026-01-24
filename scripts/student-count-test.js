/* eslint-disable no-console */
/**
 * Scenario: EZRouting UAT - Validate student count
 *
 * Usage:
 *   node scripts/student-count-test.js
 *
 * Options:
 *   --headed            Run headed (default is headed for this manual test)
 *   --headless          Run headless
 *   --out=<path>        Output markdown path (default: manual-test-cases/student-count-test.md)
 *   --base-url=<url>    Base URL (default: https://routing-uat.transact.com/testqa)
 *
 * Requires .env file with:
 *   AUTOMATION_SUPER_USER=<email>
 *   AUTOMATION_SUPER_PASSWORD=<password>
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { loadDotEnv } = require('./loadEnv');

function parseArgs(argv) {
  const args = {
    headed: true,
    out: 'manual-test-cases/student-count-test.md',
    baseUrl: 'https://routing-uat.transact.com/testqa'
  };

  for (const raw of argv.slice(2)) {
    if (raw === '--headed') args.headed = true;
    if (raw === '--headless') args.headed = false;
    if (raw.startsWith('--out=')) args.out = raw.split('=')[1] || args.out;
    if (raw.startsWith('--base-url=')) args.baseUrl = raw.split('=')[1] || args.baseUrl;
  }

  return args;
}

function ensurePlaywrightBrowsersPath() {
  const current = process.env.PLAYWRIGHT_BROWSERS_PATH || '';
  const looksLikeCursorSandbox = current.includes('cursor-sandbox-cache');
  if (!current || looksLikeCursorSandbox) {
    if (process.platform === 'darwin') {
      process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
    } else if (process.platform === 'linux') {
      process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(os.homedir(), '.cache', 'ms-playwright');
    }
  }
}

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

async function validateDashboard(page) {
  const title = await page.title();
  const url = page.url();
  const isDashboard = title.includes('Dashboard');

  return {
    title,
    url,
    isDashboard
  };
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

    // Take a screenshot for debugging
    const debugDir = path.join(process.cwd(), 'artifacts');
    fs.mkdirSync(debugDir, { recursive: true });
    await page.screenshot({
      path: path.join(debugDir, 'student-count-error.png'),
      fullPage: true
    });
  }

  return { studentCountValidated, studentCount, steps, issues };
}

function writeMarkdownReport(outPath, result) {
  const abs = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  let md = `# EZRouting UAT - Student Count Test\n\n`;
  md += `- **URL**: \`${result.baseUrl}\`\n`;
  md += `- **Date**: ${result.date}\n`;
  md += `- **Environment**: UAT (\`testqa\`)\n`;
  md += `- **Tester**: Claude Code agent (automated browser test)\n\n`;

  md += `## Scenario\n\n`;
  md += `Login to UAT, validate dashboard landing, navigate to Students page, and verify student count displays "410 / 410".\n\n`;

  md += `## Credentials\n\n`;
  md += `- **Username**: \`${result.username}\`\n`;
  md += `- **Password**: **redacted** (from .env)\n\n`;

  md += `## Steps taken / outcomes\n\n`;

  md += `### 1) Login\n`;
  md += `- **Action**: Filled **Email or Phone** + **Password**, clicked **Login**.\n`;
  md += `- **Outcome**: ${result.loginSuccess ? 'Successfully authenticated' : 'Authentication status unclear'}.\n`;
  md += `  - **URL**: \`${result.loginUrl}\`\n`;
  md += `  - **Title**: \`${result.loginTitle}\`\n\n`;

  md += `### 2) Validate Dashboard\n`;
  md += `- **Action**: Checked if user landed on Dashboard page.\n`;
  md += `- **Outcome**: ${result.dashboardValidation.isDashboard ? '✓ Landed on Dashboard' : '✗ Did not land on Dashboard'}.\n`;
  md += `  - **Title**: \`${result.dashboardValidation.title}\`\n`;
  md += `  - **URL**: \`${result.dashboardValidation.url}\`\n\n`;

  md += `### 3) Validate Student Count\n`;
  md += `- **Action**: Navigate to Students page and validate student count.\n`;

  if (result.studentCountValidation.steps && result.studentCountValidation.steps.length > 0) {
    md += `- **Steps performed**:\n`;
    for (const step of result.studentCountValidation.steps) {
      md += `  - ${step}\n`;
    }
  }

  if (result.studentCountValidation.studentCountValidated) {
    md += `- **Outcome**: ✓ Student count validated successfully\n\n`;
  } else {
    md += `- **Outcome**: ✗ Student count validation failed\n\n`;
  }

  md += `## Notes / issues observed\n\n`;

  if (result.studentCountValidation.issues.length > 0) {
    md += `### Issues encountered:\n`;
    for (const issue of result.studentCountValidation.issues) {
      md += `- ${issue}\n`;
    }
    md += `\n`;
  }

  md += result.additionalNotes || '- No additional issues observed.\n';

  fs.writeFileSync(abs, md, 'utf8');
  return abs;
}

async function main() {
  loadDotEnv(path.join(process.cwd(), '.env'));
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

  console.log('=== Student Count Test ===');
  console.log('Navigating to:', args.baseUrl);
  console.log('Username:', username);
  console.log('');

  // Step 1: Navigate and login
  console.log('Step 1: Login...');
  await page.goto(args.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await login(page, username, password);

  const loginUrl = page.url();
  const loginTitle = await page.title();
  const loginSuccess = loginTitle.includes('Dashboard');

  console.log('  Login URL:', loginUrl);
  console.log('  Login Title:', loginTitle);
  console.log('  Success:', loginSuccess);
  console.log('');

  // Step 2: Validate dashboard
  console.log('Step 2: Validate Dashboard...');
  const dashboardValidation = await validateDashboard(page);
  console.log('  Is Dashboard:', dashboardValidation.isDashboard);
  console.log('');

  // Step 3: Validate student count
  console.log('Step 3: Validate Student Count...');
  const studentCountValidation = await validateStudentCount(page);
  console.log('  Student count validated:', studentCountValidation.studentCountValidated);
  if (studentCountValidation.issues.length > 0) {
    console.log('  Issues:', studentCountValidation.issues);
  }
  console.log('');

  // Write report
  const reportPath = writeMarkdownReport(args.out, {
    baseUrl: args.baseUrl,
    date: new Date().toISOString().slice(0, 10),
    username: username,
    loginSuccess,
    loginUrl,
    loginTitle,
    dashboardValidation,
    studentCountValidation,
    additionalNotes: '- Test executed successfully via automated script.\n'
  });

  console.log('Report written to:', reportPath);
  console.log('');

  // Close browser automatically
  await browser.close();
  console.log('Browser closed.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
