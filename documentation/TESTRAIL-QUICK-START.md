# TestRail Quick Start

## ✨ It's Automatic!

TestRail updates **automatically** for any test with `C####` in the title.

## 3 Simple Steps

### 1. Write Your Test
```javascript
import { test, expect } from '../utils/fixtures.js';

test('C7204 uat admin login (smoke)', async ({ page }) => {
  // Your test code here
  await page.goto('...');
  // ... test steps
});
```

### 2. Run Your Test
```bash
npx playwright test tests/login-tests/login-uat-admin.spec.js
```

### 3. Done! 🎉
TestRail is automatically updated with:
- ✅ Pass/Fail status
- ✅ Execution time
- ✅ Error details (if failed)

## Your Test Command

```bash
# Run with browser visible
npx playwright test tests/login-tests/login-uat-admin.spec.js --headed

# Run headless (faster)
npx playwright test tests/login-tests/login-uat-admin.spec.js
```

## Supported Case ID Formats

All these work:
- `C7204 test name`
- `[C7204] test name`
- `@C7204 test name`
- `TestRail-7204: test name`

## Configuration

Already set in your `.env`:
```bash
TESTRAIL_URL=https://projecttestezr.testrail.io
TESTRAIL_USER=johan.lindstrom@pathwisek12.com
TESTRAIL_PASS=your-password
TESTRAIL_RUN_ID=22
```

## Change Run ID

```bash
# Temporary
TESTRAIL_RUN_ID=25 npx playwright test

# Or update .env file
echo "TESTRAIL_RUN_ID=25" >> .env
```

## Disable TestRail

```bash
TESTRAIL_ENABLED=false npx playwright test
```

## Build a Suite

```javascript
import { test, expect } from '../utils/fixtures.js';

test.describe('My Suite', () => {
  test('C1100 first test', async ({ page }) => { ... });
  test('C1101 second test', async ({ page }) => { ... });
  test('C1102 third test', async ({ page }) => { ... });
});
```

**Run it:**
```bash
npx playwright test tests/my-suite.spec.js
```

**Result:** All 3 cases update TestRail automatically!

## That's It!

No manual `updateTestRailResult()` calls needed.
Just add `C####` to test titles and run your tests.

---

📖 **Full Guide:** [TESTRAIL-INTEGRATION-GUIDE.md](TESTRAIL-INTEGRATION-GUIDE.md)
