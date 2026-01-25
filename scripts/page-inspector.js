/**
 * Reusable Page Inspector for debugging and discovering selectors
 *
 * Usage:
 *   node scripts/page-inspector.js <page-name> [--click <selector>]
 *
 * Examples:
 *   node scripts/page-inspector.js students
 *   node scripts/page-inspector.js routes
 *   node scripts/page-inspector.js routes --click 'a:has-text("Show Students")'
 *
 * Available pages: dashboard, students, schools, vehicles, staff, stops, fieldtrips, routes
 */

import { chromium } from 'playwright';
import { LoginPage } from '../pages/LoginPage.js';
import fs from 'node:fs';
import path from 'node:path';

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!key) continue;

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnv();

// Page hash mappings
const PAGE_HASHES = {
  'dashboard': '/dashboard',
  'students': '/students',
  'schools': '/schools',
  'vehicles': '/vehicles',
  'staff': '/staff',
  'stops': '/stops',
  'fieldtrips': '/fieldtrips',
  'routes': '/routes'
};

async function inspectPage() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const pageName = args[0];
  const clickSelector = args.includes('--click') ? args[args.indexOf('--click') + 1] : null;

  if (!pageName || !PAGE_HASHES[pageName]) {
    console.error('❌ Usage: node scripts/page-inspector.js <page-name> [--click <selector>]');
    console.error(`   Available pages: ${Object.keys(PAGE_HASHES).join(', ')}`);
    process.exit(1);
  }

  console.log(`🔍 Inspecting ${pageName} page...\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate and login
    console.log('📍 Navigating to UAT...');
    await page.goto('https://routing-uat.transact.com/testqa', { waitUntil: 'domcontentloaded' });

    console.log('🔐 Logging in...');
    const loginPage = new LoginPage(page);
    const email = process.env.AUTOMATION_SUPER_USER;
    const password = process.env.AUTOMATION_SUPER_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in .env');
    }

    await loginPage.login(email, password);
    await page.waitForTimeout(3000);

    // Navigate to the specified page
    console.log(`📄 Navigating to ${pageName} page...`);
    const currentUrl = page.url();
    const baseUrl = currentUrl.split('#')[0];
    const targetHash = PAGE_HASHES[pageName];

    await page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#${targetHash}`);

    await page.waitForFunction((hash) => {
      return window.location.hash.includes(hash);
    }, targetHash, { timeout: 10_000 });

    await page.waitForTimeout(2000);

    // If --click option provided, click the element first
    if (clickSelector) {
      console.log(`\n🖱️  Clicking element: ${clickSelector}...\n`);
      const element = page.locator(clickSelector).first();
      await element.waitFor({ state: 'visible', timeout: 10_000 });
      await element.click();
      await page.waitForTimeout(1000);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Find all buttons
    console.log('🔘 BUTTONS:\n');
    const buttons = await page.locator('button').evaluateAll(btns => {
      return btns.map((btn, idx) => ({
        index: idx,
        text: btn.textContent?.trim(),
        id: btn.id,
        className: btn.className,
        testId: btn.getAttribute('data-testid'),
        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
      })).filter(b => b.visible && b.text);
    });

    buttons.slice(0, 20).forEach(btn => {
      console.log(`  [${btn.index}] "${btn.text}"`);
      if (btn.testId) console.log(`      testId: ${btn.testId}`);
      if (btn.id) console.log(`      id: ${btn.id}`);
    });
    if (buttons.length > 20) console.log(`  ... and ${buttons.length - 20} more buttons`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2. Find all links (anchor tags)
    console.log('🔗 LINKS (visible anchor tags):\n');
    const links = await page.locator('a').evaluateAll(anchors => {
      return anchors.map((a, idx) => ({
        index: idx,
        text: a.textContent?.trim(),
        href: a.getAttribute('href'),
        testId: a.getAttribute('data-testid'),
        visible: a.offsetWidth > 0 && a.offsetHeight > 0
      })).filter(l => l.visible && l.text && l.text.length < 50);
    });

    links.slice(0, 20).forEach(link => {
      console.log(`  [${link.index}] "${link.text}"`);
      if (link.testId) console.log(`      testId: ${link.testId}`);
      if (link.href) console.log(`      href: ${link.href}`);
    });
    if (links.length > 20) console.log(`  ... and ${links.length - 20} more links`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 3. Find all elements with data-testid
    console.log('🏷️  ELEMENTS WITH data-testid:\n');
    const testIds = await page.locator('[data-testid]').evaluateAll(elements => {
      return elements
        .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0)
        .map(el => ({
          testId: el.getAttribute('data-testid'),
          tagName: el.tagName,
          text: el.textContent?.trim().substring(0, 40)
        }))
        .slice(0, 30);
    });

    testIds.forEach(el => {
      console.log(`  ${el.testId}: <${el.tagName}> "${el.text}"`);
    });
    if (testIds.length >= 30) console.log(`  ... (showing first 30)`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 4. Find all input fields
    console.log('📝 INPUT FIELDS:\n');
    const inputs = await page.locator('input, textarea, select').evaluateAll(fields => {
      return fields
        .filter(f => f.offsetWidth > 0 && f.offsetHeight > 0)
        .map((f, idx) => ({
          index: idx,
          type: f.type || f.tagName,
          placeholder: f.placeholder,
          id: f.id,
          name: f.name,
          testId: f.getAttribute('data-testid')
        }));
    });

    inputs.forEach(input => {
      console.log(`  [${input.index}] <${input.type}> ${input.placeholder || input.name || input.id || 'no label'}`);
      if (input.testId) console.log(`      testId: ${input.testId}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 5. Find modals/panels/dialogs
    console.log('🪟 MODALS/PANELS/DIALOGS:\n');
    const modals = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="panel"], [class*="sidebar"]').evaluateAll(elements => {
      return elements
        .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0)
        .map((el, idx) => ({
          index: idx,
          tagName: el.tagName,
          className: el.className?.toString().substring(0, 60),
          role: el.getAttribute('role'),
          text: el.textContent?.substring(0, 100)
        }));
    });

    modals.forEach(modal => {
      console.log(`  [${modal.index}] <${modal.tagName}> class="${modal.className}"`);
      console.log(`      role: ${modal.role || 'none'}`);
      console.log(`      text: ${modal.text}...\n`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Take a screenshot
    const screenshotPath = `artifacts/page-inspector-${pageName}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    console.log(`\n📄 Current page title: ${await page.title()}`);
    console.log(`📍 Current URL: ${page.url()}`);

    console.log('\n✅ Inspection complete! Browser will remain open for manual inspection.');
    console.log('Press Ctrl+C to close when done.\n');

    // Keep browser open for manual inspection
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: `artifacts/page-inspector-error.png`, fullPage: true });
  }
}

inspectPage();
