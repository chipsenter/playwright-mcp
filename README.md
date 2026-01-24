# mcp-playwright

Comprehensive Playwright test automation suite for EZRouting UAT testing with Page Object Model, Allure reporting, and automated smoke tests.

## Features

- **Comprehensive Smoke Test Suite** - Combined test scenarios for login, student count, workspace creation, navigation, and search
- **Page Object Model** - Reusable page objects for maintainable test code
- **Allure Reporting** - Rich test reports with screenshots and traces
- **Environment-based Configuration** - Secure credential management via .env
- **Multiple Test Scenarios** - Individual test scripts and combined smoke tests
- **Automatic Browser Management** - Handles browser installation and cleanup

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
npx playwright test tests/student-count.spec.ts
npx playwright test tests/workspace-creation.spec.ts
npx playwright test tests/navigation.spec.ts
npx playwright test tests/student-search.spec.ts

# Run tests matching a pattern
npx playwright test --grep "Student"

# Run in debug mode
npx playwright test --debug

# Run in UI mode (interactive)
npx playwright test --ui
```

**Available test suites:**
- `login-uat-admin.spec.ts` - Admin login and district selection
- `student-count.spec.ts` - Student count validation (410 / 410)
- `workspace-creation.spec.ts` - Workspace creation with unique naming
- `navigation.spec.ts` - Navigation through all main tabs (8 tests)
- `student-search.spec.ts` - Student search functionality (3 tests)

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
├── pages/                      # Page Object Model
│   ├── LoginPage.ts           # Login page locators and actions
│   ├── DashboardPage.ts       # Dashboard and workspace locators
│   └── StudentsPage.ts        # Students page locators
├── tests/                     # Playwright test specs (14 tests)
│   ├── login-uat-admin.spec.ts      # Admin login test
│   ├── student-count.spec.ts        # Student count validation
│   ├── workspace-creation.spec.ts   # Workspace creation
│   ├── navigation.spec.ts           # Navigation tests (8 tests)
│   └── student-search.spec.ts       # Search tests (3 tests)
├── scripts/                   # Utility scripts
│   ├── smoke-ezrouting.js     # Legacy smoke test script
│   └── loadEnv.js            # Environment loader
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
```

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

1. Use Page Object Model pattern (add locators to `pages/`)
2. Follow existing naming conventions
3. Update documentation as needed
4. Ensure tests clean up after themselves (e.g., unique workspace names)

## Notes

- **14 total tests** across 5 test suites
- Tests run in parallel by default for faster execution
- All tests use headless mode by default for CI/CD compatibility
- Workspace creation uses random numbers (1-50) for unique naming
- Student count validation expects "410 / 410" in UAT testqa environment
- Browser automatically closes after test completion
- Automatic screenshots on failure, traces on retry
- Sensitive data (screenshots, reports, .env) excluded via `.gitignore`

## Test Coverage

| Test Suite | Tests | Description |
|------------|-------|-------------|
| login-uat-admin.spec.ts | 1 | Admin login and district selection |
| student-count.spec.ts | 1 | Validates student count displays "410 / 410" |
| workspace-creation.spec.ts | 1 | Creates workspace with unique name |
| navigation.spec.ts | 8 | Tests all main navigation tabs |
| student-search.spec.ts | 3 | Tests search functionality |
| **Total** | **14** | Comprehensive UAT validation |
