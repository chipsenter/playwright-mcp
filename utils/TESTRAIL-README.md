# TestRail Integration

Comprehensive TestRail integration for updating test case results from Playwright tests.

## Configuration

All TestRail credentials are configured in the `.env` file:

```env
TESTRAIL_URL=https://projecttestezr.testrail.io
TESTRAIL_USER=johan.lindstrom@pathwisek12.com
TESTRAIL_API_KEY=/eZ/N3EZf7PhD/7.2.Is-gGz0E2rhIoAetvNURGkq
```

## TestRail Parameters

Match the Java framework parameters:
- **runId**: TestRail test run ID (e.g., `22`)
- **projectId**: TestRail project ID (e.g., `1`)
- **suiteId**: TestRail suite ID (e.g., `1`)

## Usage Methods

### 1. Command Line - Single Test Case

Update a single test case result:

```bash
# Update single test case as passed
node utils/testrail-integration.js --runId 22 --caseId 123 --status 1 --comment "Test passed successfully" --elapsed "30s"

# Update single test case as failed
node utils/testrail-integration.js --runId 22 --caseId 124 --status 5 --comment "Test failed: timeout error" --elapsed "1m 15s"
```

### 2. Command Line - Bulk Update

Update multiple test cases from a JSON file:

```bash
# Create results file (see testrail-results-example.json)
node utils/testrail-integration.js --runId 22 --results testrail-results-example.json --version "v1.0.0"
```

### 3. Command Line - Get Run Info

View test run information:

```bash
node utils/testrail-integration.js --runId 22
```

### 4. Programmatic Usage in Tests

Import the helper functions in your Playwright tests:

```javascript
import { updateTestRailResult, extractCaseId } from './utils/testrail-reporter.js';

test('C123: Login functionality', async ({ page }) => {
  const caseId = extractCaseId(test.info().title); // Extracts 123 from "C123: Login functionality"

  try {
    // Your test code
    await page.goto('https://example.com/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password');
    await page.click('#login-button');

    // Update TestRail on success
    await updateTestRailResult(22, caseId, 1, 'Test passed successfully', '30s');
  } catch (error) {
    // Update TestRail on failure
    await updateTestRailResult(22, caseId, 5, `Test failed: ${error.message}`, '45s');
    throw error;
  }
});
```

### 5. Playwright Reporter Integration

Add the TestRail reporter to your `playwright.config.js`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['html'],
    ['./utils/testrail-reporter.js', {
      runId: 22,        // TestRail run ID
      projectId: 1,     // TestRail project ID
      suiteId: 1,       // TestRail suite ID
      version: 'v1.0.0' // Optional version
    }]
  ],
  // ... other config
});
```

Or use environment variables:

```bash
export TESTRAIL_RUN_ID=22
export TESTRAIL_PROJECT_ID=1
export TESTRAIL_SUITE_ID=1
export TESTRAIL_VERSION=v1.0.0

npx playwright test
```

### 6. Test Naming Convention

To automatically link tests to TestRail cases, use one of these naming formats:

```javascript
test('C123: Login with valid credentials', async ({ page }) => { ... });
test('[C124] Logout functionality', async ({ page }) => { ... });
test('@C125 Password reset flow', async ({ page }) => { ... });
test('TestRail-126: User registration', async ({ page }) => { ... });
```

The `extractCaseId()` function automatically extracts the case ID from these formats.

## TestRail Status Codes

- `1` = Passed ✅
- `5` = Failed ❌
- `2` = Blocked 🚫
- `3` = Untested (default) ⚪
- `4` = Retest 🔄

## Result JSON Format

When using bulk updates, create a JSON file with this format:

```json
[
  {
    "caseId": 123,
    "status": 1,
    "comment": "Test passed successfully",
    "elapsed": "30s"
  },
  {
    "caseId": 124,
    "status": 5,
    "comment": "Test failed: timeout error",
    "elapsed": "1m 15s"
  }
]
```

## Helper Functions

### Available Functions

- `updateTestRailResult(runId, caseId, statusId, comment, elapsed, version)` - Update single test case
- `updateTestRailResults(runId, results, version)` - Bulk update multiple test cases
- `getTestRailRun(runId)` - Get run information
- `extractCaseId(title)` - Extract TestRail case ID from test title
- `createTestRailResults(testResults, getCaseIdFn)` - Convert Playwright results to TestRail format

### Example: After Test Hook

```javascript
import { test } from '@playwright/test';
import { updateTestRailResult, extractCaseId } from './utils/testrail-reporter.js';

test.afterEach(async ({ }, testInfo) => {
  const caseId = extractCaseId(testInfo.title);
  if (!caseId) return;

  const statusId = testInfo.status === 'passed' ? 1 : 5;
  const comment = testInfo.error ? testInfo.error.message : 'Test completed';
  const elapsed = `${Math.round(testInfo.duration / 1000)}s`;

  await updateTestRailResult(22, caseId, statusId, comment, elapsed);
});
```

## Integration with Slack Notifier

Combine with the Slack notifier for complete reporting:

```bash
# Run tests
npx playwright test

# Update TestRail
node utils/testrail-integration.js --runId 22 --results results.json

# Send Slack notification
node utils/slack-notifier.js --status completed --passed 14 --failed 0 --env uat --duration "2m 15s"
```

## Error Handling

The integration includes comprehensive error handling:
- Invalid credentials → Clear error message
- Missing parameters → Validation errors
- API failures → Detailed error logs
- Network issues → Graceful degradation

All errors are logged but won't fail your test execution.

## Example Workflow

```bash
# 1. Run Playwright tests with TestRail reporter
TESTRAIL_RUN_ID=22 npx playwright test

# 2. Or manually update results after tests
node utils/testrail-integration.js --runId 22 --results results.json

# 3. Get run summary
node utils/testrail-integration.js --runId 22

# 4. Send Slack notification
node utils/slack-notifier.js --status completed --passed 14 --failed 0
```

## Tips

1. **Use Test Title IDs**: Add TestRail case IDs to test titles for automatic mapping
2. **Bulk Updates**: Use bulk update for better performance with many tests
3. **Error Context**: Include detailed error messages and stack traces in comments
4. **Duration Tracking**: Always include elapsed time for performance monitoring
5. **Version Tagging**: Use version parameter to track results across builds
