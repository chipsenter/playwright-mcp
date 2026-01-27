# TestRail Integration Guide

## How It Works - Automatic Updates ✨

TestRail integration is **now fully automatic**! Simply add a TestRail case ID to your test title and it will update automatically after each test run.

### ✅ Automatic Mode (Current Setup)

**When does TestRail update?**
- **Automatically** after EVERY test execution
- Runs in the `afterEach` hook in [utils/fixtures.js](utils/fixtures.js)
- Updates happen for **any test** with `C####` format in the title

**What gets updated?**
- ✅ Test status (Passed/Failed)
- ✅ Execution time (duration)
- ✅ Error messages and stack traces (if failed)
- ✅ Timestamp of execution

**Requirements:**
1. Test title must contain `C####` format (case ID)
2. Test must import from `utils/fixtures.js`
3. TestRail credentials in `.env` file
4. `TESTRAIL_RUN_ID` environment variable set (default: 22)

## Supported Case ID Formats

All these formats work automatically:

```javascript
test('C7204 uat admin login (smoke)', async ({ page }) => { ... });
test('[C1100] Create user', async ({ page }) => { ... });
test('@C2001 Login test', async ({ page }) => { ... });
test('TestRail-3050: Delete user', async ({ page }) => { ... });
```

## Quick Start - Build Your Test Suite

### Step 1: Create Your Test File

```javascript
import { test, expect } from '../utils/fixtures.js';

test.describe('My Test Suite', () => {

  // Just add C#### to the title - that's it!
  test('C1100 Test login functionality', async ({ page }) => {
    // Your test code
    await page.goto('https://example.com/login');
    // ... rest of test
  });

  test('C1101 Test logout functionality', async ({ page }) => {
    // Your test code
    await page.goto('https://example.com/logout');
    // ... rest of test
  });
});
```

### Step 2: Run Your Tests

```bash
# Run all tests - TestRail updates automatically!
npx playwright test

# Run specific test
npx playwright test tests/login-tests/login-uat-admin.spec.js

# Run with headed mode (browser visible)
npx playwright test --headed

# Run specific suite
npx playwright test tests/login-tests/
```

### Step 3: That's It! 🎉

TestRail updates automatically - no additional code needed!

## Configuration

### Environment Variables

Set these in your `.env` file or command line:

```bash
# TestRail Credentials (already in your .env)
TESTRAIL_URL=https://projecttestezr.testrail.io
TESTRAIL_USER=johan.lindstrom@pathwisek12.com
TESTRAIL_PASS=your-password

# TestRail Configuration
TESTRAIL_RUN_ID=22        # Your test run ID (default: 22)
TESTRAIL_PROJECT_ID=1     # Your project ID
TESTRAIL_SUITE_ID=1       # Your suite ID

# Enable/Disable TestRail (optional)
TESTRAIL_ENABLED=true     # Set to 'false' to disable updates
```

### Change Run ID for Different Test Runs

```bash
# Run tests and update a different TestRail run
TESTRAIL_RUN_ID=25 npx playwright test

# Or set it in your .env file
echo "TESTRAIL_RUN_ID=25" >> .env
```

## Disabling TestRail Updates

### Temporarily disable for all tests:
```bash
TESTRAIL_ENABLED=false npx playwright test
```

### Or set in .env:
```bash
TESTRAIL_ENABLED=false
```

## What Happens During Test Execution?

```
1. Test starts: "C7204 uat admin login (smoke)"
2. Test runs your code
3. Test finishes (pass/fail)
4. afterEach hook triggers automatically
5. Extracts case ID: 7204
6. Checks TestRail enabled: Yes
7. Updates TestRail with:
   - Status: Passed (1) or Failed (5)
   - Duration: 9s
   - Comment: "Test passed successfully" or error details
8. Console shows: ✅ TestRail updated: Case 7204 -> Passed
```

## TestRail Status Mapping

| Playwright Status | TestRail Status | Status ID |
|------------------|-----------------|-----------|
| passed           | Passed          | 1         |
| failed           | Failed          | 5         |
| skipped          | Untested        | 3         |

## Real Example - Your Current Test

[tests/login-tests/login-uat-admin.spec.js](tests/login-tests/login-uat-admin.spec.js)

```javascript
import { test, expect } from '../../utils/fixtures.js';
import { LoginPage } from '../../pages/LoginPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';

// TestRail is automatic! Just include C7204 in the title
test('C7204 uat admin login (smoke)', async ({ page }) => {
  const email = process.env.AUTOMATION_SUPER_USER;
  const password = process.env.AUTOMATION_SUPER_PASSWORD;

  test.skip(!email || !password, 'Missing credentials');

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);

  const dashboard = new DashboardPage(page);
  await dashboard.searchAndSelectDistrict(
    'testqa',
    'Fox Point Joint No. 2 School District, WI testqa 07/18/2025 EZRouting'
  );
  const page1 = await dashboard.openRoutingInPopup();

  await expect(page1).toHaveURL(/routing-uat\.transact\.com/);

  // TestRail automatically updates here - no manual code needed!
});
```

**Result:** TestRail Case C7204 is automatically updated after test completes.

## Building Complete Test Suites

### Example: Authentication Suite

```javascript
import { test, expect } from '../utils/fixtures.js';

test.describe('Authentication Suite - Run ID 22', () => {

  test('C7204 UAT admin login (smoke)', async ({ page }) => {
    // Your login test
  });

  test('C7205 TA user login', async ({ page }) => {
    // Your TA login test
  });

  test('C7206 Super admin login', async ({ page }) => {
    // Your super admin test
  });

  test('C7207 Invalid password rejection', async ({ page }) => {
    // Your negative test
  });
});
```

**Run the suite:**
```bash
npx playwright test tests/auth-suite.spec.js
```

**Result:** All 4 TestRail cases updated automatically!

## Multiple Test Suites with Different Run IDs

You can override the run ID per test file:

```javascript
import { test, expect } from '../utils/fixtures.js';

// Override run ID for this suite
test.beforeAll(() => {
  process.env.TESTRAIL_RUN_ID = '25';
});

test.describe('New Feature Suite', () => {
  test('C8001 New feature test', async ({ page }) => {
    // This will update TestRail Run 25
  });
});
```

## Manual Updates (Alternative)

If you need more control, you can still manually update TestRail:

```javascript
import { test, expect } from '../utils/fixtures.js';
import { updateTestRailResult } from '../utils/testrail-reporter.js';

test('My custom test', async ({ page }) => {
  // Your test code

  // Manual update with custom comment
  await updateTestRailResult(
    22,     // runId
    7204,   // caseId
    1,      // statusId (1=passed, 5=failed)
    'Custom comment with more details',
    '30s'   // elapsed time
  );
});
```

## CLI Usage (Bulk Updates)

You can also update TestRail via command line:

```bash
# Update single test case
node utils/testrail-integration.js --runId 22 --caseId 7204 --status 1 --comment "Passed" --elapsed "10s"

# Bulk update from JSON file
node utils/testrail-integration.js --runId 22 --results results.json

# Get run information
node utils/testrail-integration.js --runId 22
```

## Troubleshooting

### No TestRail updates happening?

1. Check case ID format in test title: `C####`
2. Verify importing from `utils/fixtures.js`
3. Check `.env` has TestRail credentials
4. Ensure `TESTRAIL_ENABLED` is not set to `false`
5. Verify run ID exists in TestRail

### Authentication errors?

- Check `.env` file has correct credentials
- Verify `TESTRAIL_PASS` is set (not just `TESTRAIL_API_KEY`)
- Test connection: `node utils/testrail-integration.js --runId 22`

### Tests without C#### tags?

Tests without TestRail case IDs are skipped automatically. They run normally but don't update TestRail.

## Benefits of Automatic Integration

✅ **Zero boilerplate** - No manual update code in tests
✅ **Consistent** - All tests update the same way
✅ **Maintainable** - Changes in one place (fixtures.js)
✅ **Flexible** - Easy to enable/disable globally
✅ **Reliable** - Won't break test execution if TestRail is down
✅ **Fast** - Updates happen in parallel with test cleanup

## Summary

**To use TestRail integration:**
1. ✅ Add `C####` to your test title
2. ✅ Import from `utils/fixtures.js`
3. ✅ Run your tests normally
4. ✅ TestRail updates automatically!

**That's it!** No manual `updateTestRailResult()` calls needed.

---

## Command Reference

```bash
# Run test with automatic TestRail update
npx playwright test tests/login-tests/login-uat-admin.spec.js

# Run with different run ID
TESTRAIL_RUN_ID=25 npx playwright test

# Disable TestRail temporarily
TESTRAIL_ENABLED=false npx playwright test

# Run in headed mode
npx playwright test --headed

# Run specific suite
npx playwright test tests/login-tests/

# Run all tests
npx playwright test
```

For more examples, see:
- [examples/automatic-testrail-suite.spec.js](examples/automatic-testrail-suite.spec.js)
- [tests/login-tests/login-uat-admin.spec.js](tests/login-tests/login-uat-admin.spec.js)
- [utils/TESTRAIL-README.md](utils/TESTRAIL-README.md)
