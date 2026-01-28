import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { defineConfig } from '@playwright/test';
import { loadDotEnv } from './utils/loadEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cursor's environment sometimes points Playwright at a temp/sandbox browsers dir.
// Prefer the normal Playwright cache location when possible.
const currentBrowsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '';
const looksLikeCursorSandbox = currentBrowsersPath.includes('cursor-sandbox-cache');
if (!currentBrowsersPath || looksLikeCursorSandbox) {
  if (process.platform === 'darwin') {
    process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  } else if (process.platform === 'linux') {
    process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(os.homedir(), '.cache', 'ms-playwright');
  }
}

loadDotEnv(path.join(__dirname, '.env'));

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    // { width: 1280, height: 720 } - Default Playwright (HD)
    // { width: 1366, height: 768 } - Common laptop
    // { width: 1920, height: 1080 } - Full HD (current)
    // { width: 2560, height: 1440 } - 2K
    // { width: 3840, height: 2160 } - 4K
    viewport: { width: 1366, height: 768 }, // Full HD resolution
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  reporter: [
    ['list'],
    ['html'],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: false
    }]
  ],

  // Note: To enable automatic TestRail updates for all tests:
  // Uncomment the line below to load global-setup.js
  // This will auto-update TestRail for ANY test with C#### in the title
  // globalSetup: './utils/global-setup.js'
});
