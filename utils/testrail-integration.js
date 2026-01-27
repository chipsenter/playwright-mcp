/**
 * TestRail Integration for Test Results
 *
 * Updates test cases in TestRail after test execution
 *
 * Usage:
 *   node utils/testrail-integration.js --runId 22 --caseId 123 --status 1 --comment "Test passed"
 *   node utils/testrail-integration.js --runId 22 --results results.json
 *
 * Options:
 *   --runId <number>              TestRail run ID (required)
 *   --projectId <number>          TestRail project ID
 *   --suiteId <number>            TestRail suite ID
 *   --caseId <number>             Single test case ID to update
 *   --status <1|5>                Test status (1=Passed, 5=Failed)
 *   --comment <string>            Comment for the test result
 *   --elapsed <string>            Test duration (e.g., "30s", "2m")
 *   --results <file>              JSON file with multiple results
 *   --version <string>            Version/build number
 *
 * TestRail Status Codes:
 *   1 = Passed
 *   5 = Failed
 *   2 = Blocked
 *   3 = Untested (default)
 *   4 = Retest
 */

import fs from 'node:fs';
import path from 'node:path';

// Note: Environment variables are loaded by playwright.config.cjs
// No need to load .env again when running from CLI, use loadEnv from utils/loadEnv.js
let envLoaded = false;

function ensureEnvLoaded() {
  if (envLoaded || process.env.TESTRAIL_URL) return;

  try {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.warn('⚠️  .env file not found');
      return;
    }
    const raw = fs.readFileSync(envPath, 'utf8');

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;

      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!key) continue;

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    envLoaded = true;
  } catch (error) {
    console.warn('⚠️  Failed to load .env:', error.message);
  }
}

// Only load env if running as CLI script
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureEnvLoaded();
}

/**
 * TestRail API Client
 */
class TestRailClient {
  constructor() {
    this.baseUrl = process.env.TESTRAIL_URL;
    this.user = process.env.TESTRAIL_USER;
    // Try password first, then API key (some TestRail instances prefer password)
    this.apiKey = process.env.TESTRAIL_PASS || process.env.TESTRAIL_API_KEY;

    if (!this.baseUrl || !this.user || !this.apiKey) {
      throw new Error('❌ TestRail credentials not found in .env file. Required: TESTRAIL_URL, TESTRAIL_USER, TESTRAIL_PASS or TESTRAIL_API_KEY');
    }

    // Remove trailing slash from baseUrl
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  /**
   * Make API request to TestRail
   */
  async apiRequest(method, endpoint, data = null) {
    const url = `${this.baseUrl}/index.php?/api/v2/${endpoint}`;

    // Create Basic Auth header
    const auth = Buffer.from(`${this.user}:${this.apiKey}`).toString('base64');

    const options = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TestRail API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`TestRail API request failed: ${error.message}`);
    }
  }

  /**
   * Get test run details
   */
  async getRun(runId) {
    console.log(`📋 Fetching test run ${runId}...`);
    return await this.apiRequest('GET', `get_run/${runId}`);
  }

  /**
   * Add result for a single test case
   */
  async addResultForCase(runId, caseId, result) {
    console.log(`📝 Adding result for case ${caseId} in run ${runId}...`);
    return await this.apiRequest('POST', `add_result_for_case/${runId}/${caseId}`, result);
  }

  /**
   * Add results for multiple test cases in bulk
   */
  async addResultsForCases(runId, results) {
    console.log(`📝 Adding ${results.length} results to run ${runId}...`);
    return await this.apiRequest('POST', `add_results_for_cases/${runId}`, { results });
  }

  /**
   * Get all tests in a run
   */
  async getTests(runId) {
    console.log(`📋 Fetching tests for run ${runId}...`);
    return await this.apiRequest('GET', `get_tests/${runId}`);
  }

  /**
   * Create a new test run
   */
  async addRun(projectId, data) {
    console.log(`🆕 Creating new test run in project ${projectId}...`);
    return await this.apiRequest('POST', `add_run/${projectId}`, data);
  }

  /**
   * Get project details
   */
  async getProject(projectId) {
    console.log(`📋 Fetching project ${projectId}...`);
    return await this.apiRequest('GET', `get_project/${projectId}`);
  }

  /**
   * Get suite details
   */
  async getSuite(suiteId) {
    console.log(`📋 Fetching suite ${suiteId}...`);
    return await this.apiRequest('GET', `get_suite/${suiteId}`);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    runId: null,
    projectId: null,
    suiteId: null,
    caseId: null,
    status: null,
    comment: '',
    elapsed: null,
    results: null,
    version: null,
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      if (['runId', 'projectId', 'suiteId', 'caseId', 'status'].includes(key)) {
        options[key] = parseInt(value, 10);
      } else {
        options[key] = value;
      }
    }
  }

  return options;
}

/**
 * Parse elapsed time (e.g., "2m 30s" or "45s") to seconds string
 */
function parseElapsed(elapsed) {
  if (!elapsed) return null;

  const minutes = elapsed.match(/(\d+)m/);
  const seconds = elapsed.match(/(\d+)s/);

  let totalSeconds = 0;
  if (minutes) totalSeconds += parseInt(minutes[1]) * 60;
  if (seconds) totalSeconds += parseInt(seconds[1]);

  return totalSeconds > 0 ? `${totalSeconds}s` : null;
}

/**
 * Update a single test case result
 */
async function updateSingleTestCase(client, options) {
  const { runId, caseId, status, comment, elapsed, version } = options;

  if (!runId || !caseId || status === null) {
    console.error('❌ Missing required parameters: --runId, --caseId, and --status are required');
    process.exit(1);
  }

  const result = {
    status_id: status,
    comment: comment || '',
  };

  if (elapsed) {
    result.elapsed = parseElapsed(elapsed);
  }

  if (version) {
    result.version = version;
  }

  try {
    const response = await client.addResultForCase(runId, caseId, result);
    console.log('✅ Test result updated successfully!');
    console.log(`   Case ID: ${caseId}`);
    console.log(`   Status: ${status === 1 ? 'Passed' : 'Failed'}`);
    console.log(`   Result ID: ${response.id}`);
  } catch (error) {
    console.error('❌ Failed to update test result:', error.message);
    process.exit(1);
  }
}

/**
 * Update multiple test cases from a results file
 */
async function updateMultipleTestCases(client, options) {
  const { runId, results: resultsFile, version } = options;

  if (!runId || !resultsFile) {
    console.error('❌ Missing required parameters: --runId and --results are required');
    process.exit(1);
  }

  // Read results file
  const resultsPath = path.resolve(resultsFile);
  if (!fs.existsSync(resultsPath)) {
    console.error(`❌ Results file not found: ${resultsPath}`);
    process.exit(1);
  }

  let resultsData;
  try {
    const fileContent = fs.readFileSync(resultsPath, 'utf8');
    resultsData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Failed to parse results file: ${error.message}`);
    process.exit(1);
  }

  // Prepare results array
  const results = resultsData.map(item => {
    const result = {
      case_id: item.caseId || item.case_id,
      status_id: item.status || item.status_id,
      comment: item.comment || '',
    };

    if (item.elapsed) {
      result.elapsed = parseElapsed(item.elapsed);
    }

    if (version) {
      result.version = version;
    }

    return result;
  });

  try {
    const response = await client.addResultsForCases(runId, results);
    console.log(`✅ Successfully updated ${results.length} test results!`);
    console.log(`   Run ID: ${runId}`);
    console.log(`   Results added: ${results.length}`);
  } catch (error) {
    console.error('❌ Failed to update test results:', error.message);
    process.exit(1);
  }
}

/**
 * Get run information
 */
async function getRunInfo(client, options) {
  const { runId } = options;

  if (!runId) {
    console.error('❌ Missing required parameter: --runId');
    process.exit(1);
  }

  try {
    const run = await client.getRun(runId);
    console.log('\n📊 Test Run Information:');
    console.log(`   ID: ${run.id}`);
    console.log(`   Name: ${run.name}`);
    console.log(`   Suite ID: ${run.suite_id}`);
    console.log(`   Project ID: ${run.project_id}`);
    console.log(`   Passed Count: ${run.passed_count}`);
    console.log(`   Failed Count: ${run.failed_count}`);
    console.log(`   Untested Count: ${run.untested_count}`);
    console.log(`   URL: ${client.baseUrl}/index.php?/runs/view/${run.id}\n`);
  } catch (error) {
    console.error('❌ Failed to fetch run info:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧪 TestRail Integration\n');

  const options = parseArgs();
  console.log('Options:', options);

  try {
    const client = new TestRailClient();

    // If only runId is provided (no case or results), show run info
    if (options.runId && !options.caseId && !options.results) {
      await getRunInfo(client, options);
    }
    // If results file is provided, update multiple cases
    else if (options.results) {
      await updateMultipleTestCases(client, options);
    }
    // Otherwise, update single case
    else {
      await updateSingleTestCase(client, options);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use in other modules
export { TestRailClient, parseElapsed };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
