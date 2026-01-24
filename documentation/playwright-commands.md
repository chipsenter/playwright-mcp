# Playwright Test Commands Reference

## Running Tests

### Using npm scripts (recommended)

```bash
# Run all tests headless
npm test

# Run all tests with browser visible
npm run test:headed

# Run all tests and view Allure report
npm run test:allure
```

### Direct Playwright commands

```bash
# Run all tests headless
npx playwright test

# Run all tests with browser visible
npx playwright test --headed

# Run in UI mode (interactive test runner)
npx playwright test --ui

# Run in debug mode
npx playwright test --debug

# Run specific test file
npx playwright test tests/login-uat-admin.spec.ts

# Run all tests in a folder
npx playwright test tests/

# Run tests matching a pattern
npx playwright test --grep "login"

# Run tests in parallel (default)
npx playwright test --workers=4

# Run tests in headed mode with specific browser
npx playwright test --headed --project=chromium
```

## Allure Reports

```bash
# Generate Allure report from results
npm run allure:generate

# Open previously generated Allure report
npm run allure:open

# Serve Allure report (generates and opens in browser)
npm run allure:serve

# Run tests and serve Allure report
npm run test:allure
```

## Manual Test Scripts

These are custom Node.js scripts in the `scripts/` folder:

```bash
# Student count test (headed by default)
node scripts/student-count-test.js

# Student count test headless
node scripts/student-count-test.js --headless

# Student count test with custom output
node scripts/student-count-test.js --out=custom-report.md

# Workspace creation test (headed by default)
node scripts/workspace-creation-test.js

# Workspace creation test headless
node scripts/workspace-creation-test.js --headless

# Navigation test
node scripts/manual-navigation-test.js

# Navigation test headed
node scripts/manual-navigation-test.js --headed

# Smoke test
npm run smoke

# Smoke test headed
npm run smoke:headed
```

## Viewing Test Reports

```bash
# Open HTML report (generated after test run)
npx playwright show-report

# View Allure report
npm run allure:serve
```

## Debugging & Development

```bash
# Run single test in debug mode
npx playwright test tests/login-uat-admin.spec.ts --debug

# Run with trace viewer
npx playwright test --trace on

# Open trace viewer for failed tests
npx playwright show-trace

# Generate test code (Playwright codegen)
npx playwright codegen https://routing-uat.transact.com/testqa

# Generate test with specific device
npx playwright codegen --device="iPhone 13" https://routing-uat.transact.com/testqa
```

## Installation & Setup

```bash
# Install Playwright browsers
npx playwright install

# Install specific browser
npx playwright install chromium

# Install with dependencies
npx playwright install --with-deps
```

## Environment Setup

Make sure you have a `.env` file with:
```
AUTOMATION_SUPER_USER=your-email@example.com
AUTOMATION_SUPER_PASSWORD=your-password
```

## Test Organization

- **tests/** - Playwright test specs (`.spec.ts` files)
- **scripts/** - Custom Node.js test scripts (`.js` files)
- **pages/** - Page Object Model classes (`.ts` files)
- **manual-test-cases/** - Markdown reports from manual test scripts
- **allure-results/** - Allure test results (generated)
- **allure-report/** - Allure HTML report (generated)
