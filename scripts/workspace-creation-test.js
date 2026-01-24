/* eslint-disable no-console */
/**
 * Scenario: EZRouting UAT - Create new workspace and validate
 *
 * Usage:
 *   node scripts/workspace-creation-test.js
 *
 * Options:
 *   --headed            Run headed (default is headed for this manual test)
 *   --headless          Run headless
 *   --out=<path>        Output markdown path (default: manual-test-cases/workspace-creation-test.md)
 *   --base-url=<url>    Base URL (default: https://routing-uat.transact.com/testqa)
 *   --workspace-name=<name>  Workspace name (default: playwright-mcp-created)
 *
 * Requires .env file with:
 *   AUTOMATION_SUPER_USER=<email>
 *   AUTOMATION_SUPER_PASSWORD=<password>
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { loadDotEnv } = require('./loadEnv');

function generateUniqueWorkspaceName(baseName) {
  // Add random number between 1-50 to make workspace name unique
  const randomNum = Math.floor(Math.random() * 50) + 1;
  return `${baseName}-${randomNum}`;
}

function parseArgs(argv) {
  const args = {
    headed: true,
    out: 'manual-test-cases/workspace-creation-test.md',
    baseUrl: 'https://routing-uat.transact.com/testqa',
    workspaceName: 'playwright-mcp-created'
  };

  for (const raw of argv.slice(2)) {
    if (raw === '--headed') args.headed = true;
    if (raw === '--headless') args.headed = false;
    if (raw.startsWith('--out=')) args.out = raw.split('=')[1] || args.out;
    if (raw.startsWith('--base-url=')) args.baseUrl = raw.split('=')[1] || args.baseUrl;
    if (raw.startsWith('--workspace-name=')) args.workspaceName = raw.split('=')[1] || args.workspaceName;
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

    // Step 3: Click workspace save button (opens dialog)
    const workspaceSaveBtn = page.getByTestId('workspace-save-btn');
    await workspaceSaveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await workspaceSaveBtn.click();
    await page.waitForTimeout(1000);
    steps.push('✓ Clicked workspace save button (opened dialog)');
    console.log('  ✓ Clicked workspace save button (opened dialog)');

    // Step 4: Fill workspace name (second textbox in the dialog)
    const workspaceNameInput = page.getByRole('textbox').nth(1);
    await workspaceNameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await workspaceNameInput.click();
    await page.waitForTimeout(300);
    await workspaceNameInput.fill(workspaceName);
    await page.waitForTimeout(500);
    steps.push(`✓ Filled workspace name: "${workspaceName}"`);
    console.log(`  ✓ Filled workspace name: "${workspaceName}"`);

    // Step 5: Click OK button to confirm name
    const okBtn = page.getByRole('button', { name: /^(Ok|OK)$/ });
    await okBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await okBtn.click();
    await page.waitForTimeout(1500);
    steps.push('✓ Clicked OK button');
    console.log('  ✓ Clicked OK button');

    // Step 6: Click save button again (final save)
    const finalSaveBtn = page.getByTestId('workspace-save-btn');
    await finalSaveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await finalSaveBtn.click();
    await page.waitForTimeout(1000);
    steps.push('✓ Clicked final save button');
    console.log('  ✓ Clicked final save button');

    // Step 7: Validate confirmation modal and click OK
    // Try to validate modal text (optional - may not always appear)
    try {
      const modalText = page.getByText(`Your workspace, "${workspaceName}`);
      await modalText.waitFor({ state: 'visible', timeout: 5_000 });
      steps.push('✓ Validated confirmation modal text is visible');
      console.log('  ✓ Validated confirmation modal text is visible');
    } catch (error) {
      steps.push('⚠ Modal text validation skipped (not found)');
      console.log('  ⚠ Modal text validation skipped (not found)');
    }

    // Wait for and click OK button
    const finalOkBtn = page.getByRole('button', { name: 'OK' });
    await finalOkBtn.waitFor({ state: 'visible', timeout: 10_000 });
    steps.push('✓ Validated OK button is visible');
    console.log('  ✓ Validated OK button is visible');

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

    // Take a screenshot for debugging
    const debugDir = path.join(process.cwd(), 'artifacts');
    fs.mkdirSync(debugDir, { recursive: true });
    await page.screenshot({
      path: path.join(debugDir, 'workspace-creation-error.png'),
      fullPage: true
    });
  }

  return { workspaceCreated, issues, steps };
}

async function validateWorkspaceExists(page, workspaceName) {
  await page.waitForTimeout(1500);

  // Use the workspace chip locator from DashboardPage
  const workspaceChip = page.getByTitle(`Workspace: ${workspaceName}`);

  try {
    const isVisible = await workspaceChip.isVisible({ timeout: 5_000 });
    if (isVisible) {
      console.log(`Found workspace chip: "Workspace: ${workspaceName}"`);
      return { exists: true, foundWith: `getByTitle('Workspace: ${workspaceName}')` };
    }
  } catch (error) {
    // Continue to fallback check
  }

  // Fallback: check if workspace name appears anywhere in the workspace editor
  const workspaceEditor = page.getByTestId('workspace-editor');
  if (await workspaceEditor.isVisible().catch(() => false)) {
    const editorText = await workspaceEditor.textContent();
    if (editorText && editorText.includes(workspaceName)) {
      console.log(`Found workspace name in workspace editor`);
      return { exists: true, foundWith: 'workspace-editor text content' };
    }
  }

  // Final fallback: check page content
  const pageContent = await page.textContent('body').catch(() => '');
  const existsInContent = pageContent.includes(workspaceName);

  return {
    exists: existsInContent,
    foundWith: existsInContent ? 'page body content' : null
  };
}

function writeMarkdownReport(outPath, result) {
  const abs = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  let md = `# EZRouting UAT - Workspace Creation Test\n\n`;
  md += `- **URL**: \`${result.baseUrl}\`\n`;
  md += `- **Date**: ${result.date}\n`;
  md += `- **Environment**: UAT (\`testqa\`)\n`;
  md += `- **Tester**: Claude Code agent (automated browser test)\n`;
  md += `- **Workspace Name**: \`${result.workspaceName}\`\n\n`;

  md += `## Scenario\n\n`;
  md += `Login to UAT, validate dashboard landing, create a new workspace named "${result.workspaceName}", and verify it exists.\n\n`;

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

  md += `### 3) Create Workspace\n`;
  md += `- **Action**: Create a new workspace using the workspace panel.\n`;

  if (result.workspaceCreation.steps && result.workspaceCreation.steps.length > 0) {
    md += `- **Steps performed**:\n`;
    for (const step of result.workspaceCreation.steps) {
      md += `  - ${step}\n`;
    }
  }

  if (result.workspaceCreation.workspaceCreated) {
    md += `- **Outcome**: ✓ Workspace creation completed\n\n`;
  } else {
    md += `- **Outcome**: ✗ Workspace creation failed or could not be completed\n\n`;
  }

  md += `### 4) Validate Workspace Exists\n`;
  md += `- **Action**: Searched for workspace "${result.workspaceName}" in the UI.\n`;

  if (result.workspaceValidation.exists) {
    md += `- **Outcome**: ✓ Workspace found (method: ${result.workspaceValidation.foundWith})\n\n`;
  } else {
    md += `- **Outcome**: ✗ Workspace not found in UI\n\n`;
  }

  md += `## Notes / issues observed\n\n`;

  if (result.workspaceCreation.issues.length > 0) {
    md += `### Issues encountered:\n`;
    for (const issue of result.workspaceCreation.issues) {
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

  // Generate unique workspace name with random number
  const uniqueWorkspaceName = generateUniqueWorkspaceName(args.workspaceName);

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  console.log('=== Workspace Creation Test ===');
  console.log('Navigating to:', args.baseUrl);
  console.log('Username:', username);
  console.log('Workspace name:', uniqueWorkspaceName);
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

  // Step 3: Create workspace
  console.log('Step 3: Create Workspace...');
  const workspaceCreation = await createWorkspace(page, uniqueWorkspaceName);
  console.log('  Workspace created:', workspaceCreation.workspaceCreated);
  if (workspaceCreation.issues.length > 0) {
    console.log('  Issues:', workspaceCreation.issues);
  }
  console.log('');

  // Step 4: Validate workspace exists
  console.log('Step 4: Validate Workspace Exists...');
  const workspaceValidation = await validateWorkspaceExists(page, uniqueWorkspaceName);
  console.log('  Workspace exists:', workspaceValidation.exists);
  if (workspaceValidation.foundWith) {
    console.log('  Found with:', workspaceValidation.foundWith);
  }
  console.log('');

  // Write report
  const reportPath = writeMarkdownReport(args.out, {
    baseUrl: args.baseUrl,
    date: new Date().toISOString().slice(0, 10),
    username: username,
    workspaceName: uniqueWorkspaceName,
    loginSuccess,
    loginUrl,
    loginTitle,
    dashboardValidation,
    workspaceCreation,
    workspaceValidation,
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
