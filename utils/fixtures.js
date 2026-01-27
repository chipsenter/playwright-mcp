import { test as base, expect } from '@playwright/test';
import { createNetworkMonitor } from './network-monitor.js';
import { updateTestRailResult, extractCaseId } from './testrail-reporter.js';

function isNetworkPerfEnabled() {
  const raw =
    process.env.TEST_NETWORK_PERF ||
    process.env.NETWORK_PERF ||
    process.env.npm_config_network_perf ||
    process.env.npm_config_network_perf_enabled; // fallback, just in case

  if (!raw) return false;
  const v = String(raw).trim().toLowerCase();
  return v === 'enabled' || v === 'true' || v === '1' || v === 'yes' || v === 'on';
}

function isTestRailEnabled() {
  const raw = process.env.TESTRAIL_ENABLED;
  if (raw === undefined || raw === null || raw === '') return true; // Default enabled
  const v = String(raw).trim().toLowerCase();
  return v !== 'false' && v !== '0' && v !== 'no' && v !== 'off' && v !== 'disabled';
}

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    if (!isNetworkPerfEnabled()) {
      await use(page);
      return;
    }

    const monitor = createNetworkMonitor(page, {
      thresholdMs: 1000,
      topN: 5,
      includeResourceTypes: ['xhr', 'fetch']
    });

    try {
      await use(page);
    } finally {
      // Best-effort: allow in-flight requests to settle briefly.
      try {
        await page.waitForLoadState('networkidle', { timeout: 2000 });
      } catch {
        // ignore
      }

      const label =
        typeof testInfo.titlePath === 'function'
          ? testInfo.titlePath().join(' > ')
          : testInfo.title;

      await monitor.writeReport({ label, mode: 'append' });
      await monitor.stop();
    }
  }
});

/**
 * Global afterEach hook - Automatically updates TestRail for all tests
 * Runs for ANY test with C#### format in the title (e.g., C7204, C1100)
 */
test.afterEach(async ({ }, testInfo) => {
  // Skip if TestRail is disabled
  if (!isTestRailEnabled()) {
    return;
  }

  // Extract case ID from test title
  const caseId = extractCaseId(testInfo.title);

  // Skip if no TestRail case ID found
  if (!caseId) {
    return;
  }

  // Get TestRail run ID from environment or use default
  const runId = parseInt(process.env.TESTRAIL_RUN_ID || '22');

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

  // Update TestRail (will log success/failure but won't throw)
  await updateTestRailResult(runId, caseId, statusId, comment, elapsed);
});

export { expect };
