/**
 * Global Test Setup
 *
 * Automatically updates TestRail for all tests with C#### case IDs in their titles
 */

import { test } from '@playwright/test';
import { updateTestRailResult, extractCaseId } from './testrail-reporter.js';

// TestRail configuration
const TESTRAIL_RUN_ID = parseInt(process.env.TESTRAIL_RUN_ID || '22');
const TESTRAIL_ENABLED = process.env.TESTRAIL_ENABLED !== 'false'; // Default enabled

/**
 * Global afterEach hook - runs after EVERY test automatically
 * Updates TestRail if:
 * 1. Test title contains C#### format (e.g., C7204, C1100)
 * 2. TESTRAIL_ENABLED is not set to 'false'
 */
test.afterEach(async ({ }, testInfo) => {
  // Skip if TestRail is disabled
  if (!TESTRAIL_ENABLED) {
    return;
  }

  // Extract case ID from test title
  const caseId = extractCaseId(testInfo.title);

  // Skip if no TestRail case ID found
  if (!caseId) {
    return;
  }

  // Map Playwright status to TestRail status
  const statusId = testInfo.status === 'passed' ? 1 : testInfo.status === 'failed' ? 5 : 3;

  // Build comment with error details if failed
  let comment = '';
  if (testInfo.status === 'passed') {
    comment = `Test passed successfully`;
  } else if (testInfo.status === 'failed' && testInfo.error) {
    comment = `Test failed: ${testInfo.error.message}\n\nStack trace:\n${testInfo.error.stack}`;
  } else if (testInfo.status === 'skipped') {
    comment = 'Test skipped';
  } else {
    comment = `Test completed with status: ${testInfo.status}`;
  }

  // Calculate elapsed time
  const elapsed = `${Math.round(testInfo.duration / 1000)}s`;

  // Update TestRail
  await updateTestRailResult(TESTRAIL_RUN_ID, caseId, statusId, comment, elapsed);
});

console.log(`✅ Global TestRail integration enabled (Run ID: ${TESTRAIL_RUN_ID})`);
