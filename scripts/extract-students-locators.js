/* eslint-disable no-console */
/**
 * Extract all data-testid locators from the Students page
 *
 * Usage:
 *   node scripts/extract-students-locators.js
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { loadDotEnv } = require('./loadEnv');

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
  await page.waitForTimeout(3000);
}

async function extractLocators(page) {
  // Navigate to Students page
  const studentsLink = page.getByTestId('nav-students-link');
  await studentsLink.waitFor({ state: 'visible', timeout: 10_000 });
  await studentsLink.click();
  await page.waitForTimeout(2000);

  // Extract all elements with data-testid attribute
  const locators = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid]');
    const locatorMap = {};

    elements.forEach(el => {
      const testId = el.getAttribute('data-testid');
      const tagName = el.tagName.toLowerCase();
      const text = el.textContent?.trim().substring(0, 50) || '';
      const className = el.className || '';
      const role = el.getAttribute('role') || '';

      if (!locatorMap[testId]) {
        locatorMap[testId] = {
          testId,
          tagName,
          role,
          className,
          text,
          count: 1
        };
      } else {
        locatorMap[testId].count++;
      }
    });

    return Object.values(locatorMap);
  });

  return locators;
}

function writeLocatorsFile(locators) {
  const outputPath = path.join(process.cwd(), 'pages', 'locators', 'students-locators.json');

  const organized = {
    metadata: {
      extractedAt: new Date().toISOString(),
      page: 'Students',
      totalUniqueLocators: locators.length
    },
    locators: locators.sort((a, b) => a.testId.localeCompare(b.testId))
  };

  fs.writeFileSync(outputPath, JSON.stringify(organized, null, 2), 'utf8');
  return outputPath;
}

function generateJavaScriptLocators(locators) {
  const outputPath = path.join(process.cwd(), 'pages', 'locators', 'students-locators.js');

  let js = `// Auto-generated locators for Students page\n`;
  js += `// Generated at: ${new Date().toISOString()}\n\n`;
  js += `export const StudentsLocators = {\n`;

  locators.sort((a, b) => a.testId.localeCompare(b.testId)).forEach(loc => {
    // Convert testId to valid camelCase property name
    // 1. Remove/replace invalid characters, handle spaces and hyphens
    // 2. Convert to camelCase properly
    let camelCase = loc.testId
      // Replace spaces and hyphens with a marker
      .replace(/[\s-]+(.)/g, (_match, chr) => chr.toUpperCase())
      // Remove any remaining special characters except alphanumeric
      .replace(/[^a-zA-Z0-9]/g, '')
      // Ensure first character is lowercase (valid JS property)
      .replace(/^./, (chr) => chr.toLowerCase());

    // If the result is empty or starts with a number, prefix with underscore
    if (!camelCase || /^[0-9]/.test(camelCase)) {
      camelCase = '_' + camelCase;
    }

    const comment = loc.text ? ` // ${loc.text.substring(0, 40)}` : '';
    js += `  ${camelCase}: '${loc.testId}',${comment}\n`;
  });

  js += `};\n`;

  fs.writeFileSync(outputPath, js, 'utf8');
  return outputPath;
}

async function main() {
  loadDotEnv(path.join(process.cwd(), '.env'));
  ensurePlaywrightBrowsersPath();
  const { chromium } = require('playwright');

  const username = process.env.AUTOMATION_SUPER_USER;
  const password = process.env.AUTOMATION_SUPER_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env file');
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('🔐 Logging in to UAT...');
    await page.goto('https://routing-uat.transact.com/testqa', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });
    await login(page, username, password);

    console.log('📊 Navigating to Students page...');
    console.log('🔍 Extracting locators...');
    const locators = await extractLocators(page);

    console.log(`\n✅ Found ${locators.length} unique data-testid locators\n`);

    // Print summary
    console.log('Locators found:');
    locators.slice(0, 10).forEach(loc => {
      const countStr = loc.count > 1 ? ` (${loc.count} instances)` : '';
      console.log(`  - ${loc.testId}${countStr}`);
    });
    if (locators.length > 10) {
      console.log(`  ... and ${locators.length - 10} more`);
    }

    // Write JSON file
    const jsonPath = writeLocatorsFile(locators);
    console.log(`\n📝 JSON locators written to: ${jsonPath}`);

    // Write JavaScript file
    const jsPath = generateJavaScriptLocators(locators);
    console.log(`📝 JavaScript locators written to: ${jsPath}`);

    console.log('\n✨ Done! Browser will stay open for 5 seconds...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
