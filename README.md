# mcp-playwright

Comprehensive Playwright test automation suite for EZRouting UAT testing with Page Object Model, Allure reporting, and automated smoke tests.

## Features

- **Pure JavaScript** - All tests and page objects written in modern JavaScript (no TypeScript)
- **Comprehensive Smoke Test Suite** - Combined test scenarios for login, student count, workspace creation, navigation, and search
- **Page Object Model** - Reusable page objects for maintainable test code
- **Allure Reporting** - Rich test reports with screenshots and traces
- **Environment-based Configuration** - Secure credential management via .env
- **Multiple Test Scenarios** - Individual test scripts and combined smoke tests
- **Automatic Browser Management** - Handles browser installation and cleanup
- **Auto-generated Locators** - Extract page locators automatically with `extract-students-locators.js`

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
AUTOMATION_SUPER_USER=your-email@example.com
AUTOMATION_SUPER_PASSWORD=your-password

# Optional: Set default client (defaults to testqa if not specified)
CLIENT=testqa
```

**Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

## Running Tests

### Playwright Test Suite (Recommended)

Run all tests using the Playwright Test runner for parallel execution, automatic retries, and rich reporting:

```bash
# Run all tests headless (default)
npm test

# Run tests with browser visible
npm run test:headed

# Run tests and view Allure report
npm run test:allure

# Run specific test suite
npx playwright test tests/student-count.spec.js
npx playwright test tests/workspace-creation.spec.js
npx playwright test tests/navigation.spec.js
npx playwright test tests/student-search.spec.js

# Run tests matching a pattern
npx playwright test --grep "Student"

# Run in debug mode
npx playwright test --debug

# Run in UI mode (interactive)
npx playwright test --ui
```

### Client-Specific Testing

Tests can target different clients/districts using the `CLIENT` environment variable. The framework supports multiple clients with different data sets:

```bash
# Run tests for clarknv client (ARVILLE DEPOT workspace data)
CLIENT=clarknv npx playwright test

# Run specific test with client
CLIENT=clarknv npx playwright test --grep "ARVILLE DEPOT" --headed

# Run tests via npm script with client
npm run test:headed -- --client=clarknv

# Set default client in .env file
echo "CLIENT=clarknv" >> .env
```

**Available clients:**
- `testqa` - Default test client (410 students)
- `clarknv` - Clark County NV client (ARVILLE DEPOT with 25,811 students)

The client parameter is read in this order of precedence:
1. `CLIENT` or `TEST_CLIENT` environment variable
2. npm config variable (`npm run test -- --client=clarknv`)
3. Defaults to `testqa`

**Note:** Some tests require specific clients. For example, `workspace-depot-validation.spec.js` requires the `clarknv` client to access ARVILLE DEPOT data.

```

**Available test suites:**
- `login-uat-admin.spec.js` - Admin login and district selection
- `student-count.spec.js` - Student count validation (410 / 410)
- `workspace-creation.spec.js` - Workspace creation with unique naming
- `workspace-depot-validation.spec.js` - Workspace with ARVILLE DEPOT validation (requires clarknv client)
- `navigation.spec.js` - Navigation through all main tabs (8 tests)
- `student-search.spec.js` - Student search and filter validation (5 tests)

### Legacy Smoke Test Script

Standalone smoke test script (runs all scenarios sequentially):

```bash
# Run comprehensive smoke test
npm run smoke

# Run with browser visible
npm run smoke:headed

# Skip specific test sections
npm run smoke -- --skip-workspace
```

## Allure Reports

View interactive Allure test reports:

```bash
# Generate and serve Allure report
npm run allure:serve

# Generate report only
npm run allure:generate

# Open previously generated report
npm run allure:open
```

Allure reports include:
- Test execution timeline
- Screenshots on failure
- Detailed step-by-step logs
- Test history and trends

## Project Structure

```
mcp-playwright/
├── pages/                      # Page Object Model (JavaScript)
│   ├── locators/              # Auto-generated locators
│   │   ├── students-locators.js   # Students page locators (2328 locators)
│   │   └── students-locators.json # Students locators metadata
│   ├── LoginPage.js           # Login page locators and actions
│   ├── DashboardPage.js       # Dashboard and workspace locators
│   └── StudentsPage.js        # Students page locators
├── tests/                     # Playwright test specs (17 tests, JavaScript)
│   ├── login-uat-admin.spec.js      # Admin login test
│   ├── student-count.spec.js        # Student count validation
│   ├── workspace-creation.spec.js   # Workspace creation
│   ├── workspace-depot-validation.spec.js  # Workspace with ARVILLE DEPOT (clarknv)
│   ├── navigation.spec.js           # Navigation tests (8 tests)
│   └── student-search.spec.js       # Search and filter tests (5 tests)
├── scripts/                   # Utility scripts
│   ├── smoke-ezrouting.js     # Legacy smoke test script
│   ├── extract-students-locators.js # Auto-extract page locators
│   ├── page-inspector.js      # Page element inspector for debugging
│   ├── notify-test-results.js # Auto-notify Slack with test results
│   └── loadEnv.js            # Environment loader
├── utils/                     # Shared utilities
│   ├── ezrouting-test-config.js  # Client and environment configuration
│   ├── slack-notifier.js      # Slack notification sender
│   └── s3-uploader.js         # S3 uploader for Allure reports
├── documentation/             # Project documentation
│   └── playwright-commands.md # Command reference guide
├── manual-test-cases/         # Generated test reports (markdown)
├── artifacts/                 # Screenshots and debug files
├── allure-results/           # Allure test results (generated)
├── allure-report/            # Allure HTML report (generated)
├── config/                   # Environment configurations
│   └── environments.json     # Environment URLs
├── .env                      # Environment variables (not in git)
├── .env.example             # Example environment file
├── playwright.config.cjs     # Playwright configuration
└── package.json             # Dependencies and scripts
```

## Environment Configuration

Environment URLs are configured in `config/environments.json`:

- **Dev**: `https://routing-dev.transact.com`
- **QA**: `https://routing-qa.transact.com`
- **UAT**: `https://routing-uat.transact.com`
- **Prod**: `https://www.ezrouting.com`

## Test Reports

All test runs generate reports:

- **Smoke tests**: Markdown reports in `manual-test-cases/`
- **Playwright tests**: HTML report via `npx playwright show-report`
- **Allure reports**: Interactive reports via `npm run allure:serve`
- **Screenshots**: Saved to `artifacts/` on test completion or failure

## Debugging Tests

```bash
# Run in debug mode
npx playwright test --debug

# Run in UI mode (interactive)
npx playwright test --ui

# View trace for failed tests
npx playwright show-trace

# Generate test code (Codegen)
npx playwright codegen https://routing-uat.transact.com/testqa

# Inspect page elements for finding selectors
node scripts/page-inspector.js students
node scripts/page-inspector.js routes
node scripts/page-inspector.js routes --click 'a:has-text("Show Students")'
```

### Page Inspector

Use the page inspector to discover selectors and elements on any page:

```bash
# Inspect a specific page
node scripts/page-inspector.js <page-name>

# Inspect after clicking an element
node scripts/page-inspector.js <page-name> --click '<selector>'

# Available pages: dashboard, students, schools, vehicles, staff, stops, fieldtrips, routes
```

The inspector displays:
- All visible buttons with testIds
- All links with testIds
- All elements with data-testid attributes
- All input fields and forms
- All modals/panels/dialogs
- Screenshot saved to artifacts/

## Documentation

For a comprehensive command reference, see [documentation/playwright-commands.md](documentation/playwright-commands.md)

## Troubleshooting

### Browser installation issues

If browsers aren't found, ensure Playwright browsers path is correct:

```bash
npx playwright install chromium --with-deps
```

### Environment variable issues

Verify your `.env` file exists and contains the required variables:

```bash
cat .env
```

### Test failures

1. Check the generated screenshots in `artifacts/`
2. View the Allure report for detailed logs: `npm run allure:serve`
3. Run tests in headed mode to see what's happening: `npm run smoke:headed`

## Contributing

When adding new tests:

1. Use Page Object Model pattern (add locators to `pages/` as JavaScript classes)
2. Follow existing naming conventions (`.spec.js` for tests, `.js` for page objects)
3. Use ES6 module syntax (`import/export`) for consistency
4. Update documentation as needed
5. Ensure tests clean up after themselves (e.g., unique workspace names)

## Technology Stack

- **Playwright 1.59.0-alpha**: Browser automation framework
- **JavaScript (ES6+)**: All tests and page objects (no TypeScript)
- **Node.js**: Runtime environment
- **Allure**: Test reporting framework
- **@playwright/mcp**: AI-assisted browser automation

## Notes

- **17 total tests** across 6 test suites
- Tests run in parallel by default for faster execution
- All tests use headless mode by default for CI/CD compatibility
- Workspace creation uses random numbers (1-50) for unique naming
- Student count validation expects "410 / 410" in UAT testqa environment
- Some tests require specific clients (e.g., workspace-depot-validation requires clarknv)
- Browser automatically closes after test completion
- Automatic screenshots on failure, traces on retry
- Sensitive data (screenshots, reports, .env) excluded via `.gitignore`

## Test Coverage

| Test Suite | Tests | Description |
|------------|-------|-------------|
| login-uat-admin.spec.js | 1 | Admin login and district selection |
| student-count.spec.js | 1 | Validates student count displays "410 / 410" |
| workspace-creation.spec.js | 1 | Creates workspace with unique name |
| workspace-depot-validation.spec.js | 1 | Creates and activates workspace with ARVILLE DEPOT (clarknv) |
| navigation.spec.js | 8 | Tests all main navigation tabs |
| student-search.spec.js | 5 | Search, filter dropdowns, and filter options validation |
| **Total** | **17** | Comprehensive UAT validation |

## Slack Notifications

Post test execution updates to Slack automatically.

### Setup

Add your Slack webhook URL to `.env`:

```bash
SLACK_WEBHOOK_DEBUG_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Usage

```bash
# Manual notifications
npm run notify:started      # Notify test execution started
npm run notify:completed    # Notify test execution completed
npm run notify:failed       # Notify test execution failed

# Run tests with automatic Slack notifications
npm run test:notify

# Custom notifications
node utils/slack-notifier.js --status started --env uat --client testqa
node utils/slack-notifier.js --status completed --passed 14 --failed 0 --env uat
node utils/slack-notifier.js --status failed --passed 10 --failed 4 --env uat
```

### Message Format

Slack messages include:
- 🚀 Test execution status (started/completed/failed)
- Environment (UAT, QA, Dev, Prod)
- Client/district name
- Browser type
- Git branch and commit
- Triggered by (git author)
- Test results (passed/failed/total)
- Pass rate percentage

### CI/CD Integration

Use in your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Notify Slack - Started
  run: npm run notify:started

- name: Run Tests
  run: npm test

- name: Notify Slack - Results
  if: always()
  run: |
    if [ $? -eq 0 ]; then
      npm run notify:completed
    else
      npm run notify:failed
    fi
```

## Auto-generated Locators

Extract all data-testid locators from any page automatically:

```bash
# Extract Students page locators
node scripts/extract-students-locators.js
```

This generates:
- `pages/locators/students-locators.json` - Complete locator data with metadata
- `pages/locators/students-locators.js` - JavaScript constants for use in tests

Currently includes 2328 unique locators from the Students page.
