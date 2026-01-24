/* eslint-disable no-console */
/**
 * Scenario: EZRouting UAT testqa - edit first student, toggle SPED/WHEELCHAIR, save, measure save time.
 *
 * Usage:
 *   node scripts/student-save-time-testqa.js
 *
 * Options:
 *   --headed                  Run headed (default is headless)
 *   --toggle=wheelchair|sped  Which checkbox to toggle (default: wheelchair)
 *   --out=manual-test-cases/student-save-time-headless.md
 *   --base-url=https://routing-uat.transact.com/testqa
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { loadDotEnv } = require('./loadEnv');

function parseArgs(argv) {
  const args = {
    headed: false,
    toggle: 'wheelchair',
    out: 'manual-test-cases/student-save-time-headless.md',
    baseUrl: 'https://routing-uat.transact.com/testqa'
  };

  for (const raw of argv.slice(2)) {
    if (raw === '--headed') args.headed = true;
    if (raw.startsWith('--toggle=')) args.toggle = raw.split('=')[1] || args.toggle;
    if (raw.startsWith('--out=')) args.out = raw.split('=')[1] || args.out;
    if (raw.startsWith('--base-url=')) args.baseUrl = raw.split('=')[1] || args.baseUrl;
  }

  if (!['wheelchair', 'sped'].includes(args.toggle)) {
    throw new Error(`Invalid --toggle value "${args.toggle}". Use wheelchair|sped.`);
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

function extractUpdatedTimestamp(text) {
  // Example: "Last updated by johan @ January 24, 2026 11:56 AM ..."
  const m = text.match(/@\s+([A-Za-z]+\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+(AM|PM))/);
  return m ? m[1] : null;
}

async function getLastUpdatedLine(page) {
  // Avoid grabbing giant container text; pick the shortest matching line.
  const line = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('div, span, p'))
      .map((el) => (el.textContent || '').trim())
      .filter((t) => t.startsWith('Last updated by') && t.includes('@') && t.length < 350);
    if (!texts.length) return null;
    texts.sort((a, b) => a.length - b.length);
    return texts[0];
  });
  return typeof line === 'string' ? line : null;
}

async function maybeLogin(page, username, password) {
  const emailBox = page.getByRole('textbox', { name: /email or phone/i });
  const passwordBox = page.getByRole('textbox', { name: /^password$/i });
  const loginBtn = page.getByRole('button', { name: /^login$/i });

  if (await emailBox.isVisible().catch(() => false)) {
    await emailBox.fill(username);
    await passwordBox.fill(password);
    await loginBtn.click();
  }
}

async function openStudents(page, baseUrl) {
  // Using hash route is the most reliable in this environment.
  await page.goto(`${baseUrl}#/students`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByTestId('student-list-panel').waitFor({ state: 'visible', timeout: 60_000 });
  await page.locator('[data-testid^="student-card-"]').first().waitFor({ state: 'visible', timeout: 60_000 });
}

async function openFirstStudentForEdit(page, baseUrl) {
  const firstCard = page.locator('[data-testid^="student-card-"]').first();
  const testId = await firstCard.getAttribute('data-testid');
  if (!testId) throw new Error('Unable to read first student-card data-testid.');

  const studentId = testId.split('-').pop();
  if (!studentId) throw new Error(`Unexpected student-card testid: ${testId}`);

  // Navigating by hash route is the most reliable way to open the record in automation.
  await page.goto(`${baseUrl}#/student/${studentId}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByTestId('student-wheelchair-checkbox').waitFor({ state: 'attached', timeout: 60_000 });

  return { studentId };
}

async function toggleFlag(page, which) {
  if (which === 'sped') {
    // Recorded as an <input> with data-testid="SPED-checkbox"
    const sped = page.locator('[data-testid="SPED-checkbox"]');
    await sped.waitFor({ state: 'attached', timeout: 30_000 });
    try {
      await sped.click();
    } catch {
      await sped.click({ force: true });
    }
    return { toggled: 'SPED' };
  }

  // Wheelchair is a wrapper; click the nested input if present.
  const wrapper = page.getByTestId('student-wheelchair-checkbox');
  await wrapper.waitFor({ state: 'visible', timeout: 30_000 });
  const input = wrapper.locator('input');
  const inputEl = (await input.count()) ? input.first() : null;
  const before = inputEl ? await inputEl.isChecked().catch(() => null) : null;

  // Try clicking wrapper/label first (some layouts have label intercepting input clicks).
  try {
    await wrapper.click();
  } catch {
    // ignore and try other strategies below
  }

  if (inputEl) {
    const afterWrapperClick = await inputEl.isChecked().catch(() => null);
    if (before !== null && afterWrapperClick === before) {
      const label = wrapper.locator('label').first();
      if (await label.count()) {
        try {
          await label.click();
        } catch {
          await label.click({ force: true });
        }
      } else {
        await inputEl.click({ force: true });
      }
    }
  }

  return { toggled: 'WHEELCHAIR' };
}

async function clickSave(page) {
  // Save control is a material-icon text "save" in the action nav; no stable testid.
  await page.evaluate(() => {
    const leafs = Array.from(document.querySelectorAll('*'))
      .filter((el) => el.children.length === 0 && (el.textContent || '').trim() === 'save');
    const el = leafs[0];
    if (!el) throw new Error('Save icon not found');
    const clickable = el.closest('a,button,[role="button"],li,div') || el;
    clickable.click();
  });
}

async function measureSave(page) {
  const beforeLine = await getLastUpdatedLine(page);
  const beforeTs = beforeLine ? extractUpdatedTimestamp(beforeLine) : null;

  const start = Date.now();
  await clickSave(page);

  // Wait until the "Last updated by" timestamp changes.
  const timeoutAt = Date.now() + 60_000;
  let afterLine = beforeLine;
  let afterTs = beforeTs;

  while (Date.now() < timeoutAt) {
    await page.waitForTimeout(250);
    const currentLine = await getLastUpdatedLine(page);
    const currentTs = currentLine ? extractUpdatedTimestamp(currentLine) : null;
    if (currentTs && beforeTs && currentTs !== beforeTs) {
      afterLine = currentLine;
      afterTs = currentTs;
      break;
    }
    if (currentTs && !beforeTs) {
      afterLine = currentLine;
      afterTs = currentTs;
      break;
    }
  }

  const elapsedMs = Date.now() - start;

  return {
    elapsedMs,
    lastUpdatedBefore: beforeTs || '(unparsed)',
    lastUpdatedAfter: afterTs || '(unparsed)',
    lastUpdatedLineBeforeWasPresent: Boolean(beforeLine),
    lastUpdatedLineAfterWasPresent: Boolean(afterLine)
  };
}

function writeMarkdownReport(outPath, result) {
  const abs = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  const md =
    `# EZRouting UAT — student save timing (headless)\n\n` +
    `- **URL**: \`${result.baseUrl}\`\n` +
    `- **Date**: ${result.date}\n` +
    `- **Run type**: Headless (Playwright)\n\n` +
    `## Scenario\n\n` +
    `Students → open first student → toggle **${result.toggled}** → Save → measure save time.\n\n` +
    `## Result\n\n` +
    `- **Student record**: (redacted)\n` +
    `- **Save completion signal**: \`Last updated by ... @ <timestamp>\` changed\n` +
    `- **Before**: \`${result.lastUpdatedBefore}\`\n` +
    `- **After**: \`${result.lastUpdatedAfter}\`\n` +
    `- **Save duration**: **${result.elapsedMs} ms**\n\n` +
    `## Notes\n\n` +
    `- This report intentionally omits student PII.\n`;

  fs.writeFileSync(abs, md, 'utf8');
  return abs;
}

async function main() {
  loadDotEnv(path.join(process.cwd(), '.env'));
  ensurePlaywrightBrowsersPath();
  // IMPORTANT: require Playwright only after PLAYWRIGHT_BROWSERS_PATH is finalized.
  // Cursor can inject a sandbox path that doesn't contain installed browsers.
  const { chromium } = require('playwright');

  const args = parseArgs(process.argv);
  const username = process.env.AUTOMATION_SUPER_USER;
  const password = process.env.AUTOMATION_SUPER_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing AUTOMATION_SUPER_USER or AUTOMATION_SUPER_PASSWORD in environment/.env');
  }

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  try {
    // Start fresh to force login in headless runs.
    await context.clearCookies();

    await page.goto(args.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await maybeLogin(page, username, password);

    // Give the app a moment to transition after login.
    await page.waitForTimeout(1500);

    await openStudents(page, args.baseUrl);
    const { studentId } = await openFirstStudentForEdit(page, args.baseUrl);
    const { toggled } = await toggleFlag(page, args.toggle);
    const timing = await measureSave(page);

    const reportPath = writeMarkdownReport(args.out, {
      baseUrl: args.baseUrl,
      date: new Date().toISOString().slice(0, 10),
      toggled,
      studentId,
      ...timing
    });

    console.log(JSON.stringify({ toggled, studentId, ...timing, reportPath }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

