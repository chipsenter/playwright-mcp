const os = require('node:os');
const path = require('node:path');
const { defineConfig } = require('@playwright/test');
const { loadDotEnv } = require('./utils/loadEnv');

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

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
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
  ]
  // Note: To enable automatic TestRail updates for all tests:
  // Uncomment the line below to load global-setup.js
  // This will auto-update TestRail for ANY test with C#### in the title
  // globalSetup: require.resolve('./utils/global-setup.js')
});

