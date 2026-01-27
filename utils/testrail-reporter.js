/**
 * TestRail Reporter Helper
 *
 * Helper functions to integrate TestRail updates with Playwright tests
 *
 * Usage in test files:
 *   import { updateTestRailResult, createTestRailResults } from './utils/testrail-reporter.js';
 *
 *   test('Login functionality', async ({ page }) => {
 *     // Your test code
 *     await updateTestRailResult(22, 123, 1, 'Test passed successfully');
 *   });
 */

import { TestRailClient, parseElapsed } from './testrail-integration.js';

let client = null;

/**
 * Get or create TestRail client instance
 */
function getClient() {
  if (!client) {
    try {
      client = new TestRailClient();
    } catch (error) {
      console.warn('⚠️  TestRail client initialization failed:', error.message);
      return null;
    }
  }
  return client;
}

/**
 * Update a single test result in TestRail
 *
 * @param {number} runId - TestRail run ID
 * @param {number} caseId - TestRail case ID
 * @param {number} statusId - Status (1=Passed, 5=Failed)
 * @param {string} comment - Optional comment
 * @param {string} elapsed - Optional duration (e.g., "30s", "2m")
 * @param {string} version - Optional version/build
 * @returns {Promise<Object|null>} TestRail response or null if failed
 */
export async function updateTestRailResult(runId, caseId, statusId, comment = '', elapsed = null, version = null) {
  const trClient = getClient();
  if (!trClient) return null;

  const result = {
    status_id: statusId,
    comment: comment || '',
  };

  if (elapsed) {
    result.elapsed = parseElapsed(elapsed);
  }

  if (version) {
    result.version = version;
  }

  try {
    const response = await trClient.addResultForCase(runId, caseId, result);
    console.log(`✅ TestRail updated: Case ${caseId} -> ${statusId === 1 ? 'Passed' : 'Failed'}`);
    return response;
  } catch (error) {
    console.error(`❌ TestRail update failed for case ${caseId}:`, error.message);
    return null;
  }
}

/**
 * Update multiple test results in bulk
 *
 * @param {number} runId - TestRail run ID
 * @param {Array} results - Array of result objects
 * @returns {Promise<Object|null>} TestRail response or null if failed
 *
 * Example results array:
 * [
 *   { case_id: 123, status_id: 1, comment: 'Passed', elapsed: '30s' },
 *   { case_id: 124, status_id: 5, comment: 'Failed: timeout', elapsed: '1m' }
 * ]
 */
export async function updateTestRailResults(runId, results, version = null) {
  const trClient = getClient();
  if (!trClient) return null;

  // Add version to all results if provided
  const formattedResults = results.map(result => {
    const formatted = { ...result };
    if (version && !formatted.version) {
      formatted.version = version;
    }
    if (formatted.elapsed) {
      formatted.elapsed = parseElapsed(formatted.elapsed);
    }
    return formatted;
  });

  try {
    const response = await trClient.addResultsForCases(runId, formattedResults);
    console.log(`✅ TestRail bulk update: ${results.length} cases updated`);
    return response;
  } catch (error) {
    console.error('❌ TestRail bulk update failed:', error.message);
    return null;
  }
}

/**
 * Create TestRail results array from Playwright test results
 *
 * @param {Array} testResults - Playwright test results
 * @param {Function} getCaseIdFn - Function to extract case ID from test
 * @returns {Array} Array of TestRail result objects
 *
 * Example getCaseIdFn:
 *   (test) => {
 *     const match = test.title.match(/C(\d+)/);
 *     return match ? parseInt(match[1]) : null;
 *   }
 */
export function createTestRailResults(testResults, getCaseIdFn) {
  return testResults
    .map(test => {
      const caseId = getCaseIdFn(test);
      if (!caseId) return null;

      const statusId = test.status === 'passed' ? 1 : test.status === 'failed' ? 5 : 3;
      const comment = test.error ? `${test.error.message}\n\n${test.error.stack}` : '';
      const elapsed = test.duration ? `${Math.round(test.duration / 1000)}s` : null;

      return {
        case_id: caseId,
        status_id: statusId,
        comment: comment,
        elapsed: elapsed,
      };
    })
    .filter(result => result !== null);
}

/**
 * Get TestRail run information
 *
 * @param {number} runId - TestRail run ID
 * @returns {Promise<Object|null>} Run details or null if failed
 */
export async function getTestRailRun(runId) {
  const trClient = getClient();
  if (!trClient) return null;

  try {
    return await trClient.getRun(runId);
  } catch (error) {
    console.error(`❌ Failed to fetch TestRail run ${runId}:`, error.message);
    return null;
  }
}

/**
 * Extract TestRail case IDs from test title
 * Supports formats: C123, [C123], @C123, TestRail-123
 *
 * @param {string} title - Test title
 * @returns {number|null} Case ID or null if not found
 */
export function extractCaseId(title) {
  // Match patterns: C123, [C123], @C123, TestRail-123
  const patterns = [
    /\bC(\d+)\b/,           // C123
    /\[C(\d+)\]/,           // [C123]
    /@C(\d+)/,              // @C123
    /TestRail[:-](\d+)/i,   // TestRail-123 or TestRail:123
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
}

/**
 * Example Playwright reporter implementation
 * Add to playwright.config.js:
 *
 * reporter: [
 *   ['list'],
 *   ['./utils/testrail-reporter.js', { runId: 22 }]
 * ]
 */
export default class TestRailReporter {
  constructor(options = {}) {
    this.runId = options.runId || parseInt(process.env.TESTRAIL_RUN_ID);
    this.projectId = options.projectId || parseInt(process.env.TESTRAIL_PROJECT_ID);
    this.suiteId = options.suiteId || parseInt(process.env.TESTRAIL_SUITE_ID);
    this.version = options.version || process.env.TESTRAIL_VERSION;
    this.results = [];

    if (!this.runId) {
      console.warn('⚠️  TestRail runId not provided. Set via options or TESTRAIL_RUN_ID env variable.');
    }
  }

  onBegin(config, suite) {
    console.log(`\n🧪 TestRail Reporter initialized (Run ID: ${this.runId})\n`);
  }

  onTestEnd(test, result) {
    const caseId = extractCaseId(test.title);
    if (!caseId) {
      return; // Skip tests without TestRail case ID
    }

    const statusId = result.status === 'passed' ? 1 : result.status === 'failed' ? 5 : 3;
    const comment = result.error
      ? `${result.error.message}\n\nStack trace:\n${result.error.stack}`
      : `Test ${result.status}`;

    const elapsed = result.duration ? `${Math.round(result.duration / 1000)}s` : null;

    this.results.push({
      case_id: caseId,
      status_id: statusId,
      comment: comment,
      elapsed: elapsed,
    });

    console.log(`  📝 TestRail Case ${caseId}: ${result.status}`);
  }

  async onEnd(result) {
    if (!this.runId || this.results.length === 0) {
      console.log('\n⚠️  No TestRail results to upload\n');
      return;
    }

    console.log(`\n📤 Uploading ${this.results.length} results to TestRail Run ${this.runId}...\n`);

    try {
      await updateTestRailResults(this.runId, this.results, this.version);
      console.log('✅ TestRail results uploaded successfully!\n');
    } catch (error) {
      console.error('❌ Failed to upload TestRail results:', error.message, '\n');
    }
  }
}
