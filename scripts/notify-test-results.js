/**
 * Automatically notify Slack with Playwright test results
 *
 * This script reads the latest Playwright test results and posts them to Slack
 *
 * Usage:
 *   node scripts/notify-test-results.js --status started
 *   node scripts/notify-test-results.js --status completed
 *   node scripts/notify-test-results.js --status failed
 */

import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    status: 'completed',
    env: process.env.TEST_ENV || 'uat',
    client: process.env.TEST_CLIENT || 'testqa',
    browser: process.env.TEST_BROWSER || 'chromium',
    uploadS3: process.env.UPLOAD_S3 !== 'false'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      if (key === 'upload-s3' || key === 'uploadS3') {
        options[key] = value === 'true';
      } else {
        options[key] = value;
      }
    }
  }

  return options;
}

// Read Playwright HTML report to get test results
function parsePlaywrightHtmlReport() {
  try {
    const reportPath = path.join(process.cwd(), 'playwright-report', 'index.html');

    if (!fs.existsSync(reportPath)) {
      console.warn('⚠️  Playwright HTML report not found');
      return null;
    }

    const htmlContent = fs.readFileSync(reportPath, 'utf8');

    // Parse test counts from HTML
    // Look for patterns like: "14 passed" "0 failed" "0 flaky" "0 skipped"
    const passedMatch = htmlContent.match(/(\d+)\s+passed/i);
    const failedMatch = htmlContent.match(/(\d+)\s+failed/i);
    const skippedMatch = htmlContent.match(/(\d+)\s+skipped/i);
    const durationMatch = htmlContent.match(/Total time:\s*([^<]+)/i);

    const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;
    const skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
    const duration = durationMatch ? durationMatch[1].trim() : '0s';

    return { passed, failed, skipped, duration };

  } catch (error) {
    console.error('Error parsing HTML report:', error.message);
    return null;
  }
}

// Parse test results from test-results directory
function parseTestResults() {
  try {
    const testResultsDir = path.join(process.cwd(), 'test-results');

    if (!fs.existsSync(testResultsDir)) {
      console.warn('⚠️  test-results directory not found');
      return { passed: 0, failed: 0, skipped: 0, duration: '0s' };
    }

    const files = fs.readdirSync(testResultsDir);

    // Count directories that contain "passed" or "failed" in their names
    let passed = 0;
    let failed = 0;

    files.forEach(file => {
      const filePath = path.join(testResultsDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        const lowerFile = file.toLowerCase();
        if (lowerFile.includes('passed')) {
          passed++;
        } else if (lowerFile.includes('failed')) {
          failed++;
        }
      }
    });

    return { passed, failed, skipped: 0, duration: 'unknown' };

  } catch (error) {
    console.error('Error reading test results:', error.message);
    return { passed: 0, failed: 0, skipped: 0, duration: '0s' };
  }
}

// Get test results from multiple sources
function getTestResults() {
  // Try HTML report first (most accurate)
  let results = parsePlaywrightHtmlReport();

  if (!results || (results.passed === 0 && results.failed === 0)) {
    // Fallback to test-results directory
    results = parseTestResults();
  }

  if (!results) {
    results = { passed: 0, failed: 0, skipped: 0, duration: '0s' };
  }

  return results;
}

// Generate Allure report before uploading
function generateAllureReport() {
  try {
    console.log('📊 Generating Allure report...');
    execSync('npx allure generate allure-results --clean -o allure-report', {
      stdio: 'inherit'
    });
    console.log('✅ Allure report generated');
    return true;
  } catch (error) {
    console.error('⚠️  Failed to generate Allure report:', error.message);
    return false;
  }
}

// Main function
async function main() {
  const options = parseArgs();

  console.log('📢 Notifying Slack about test results...\n');

  // If status is completed or failed, try to get actual test results
  if (options.status === 'completed' || options.status === 'failed') {
    // Generate Allure report first
    const allureGenerated = generateAllureReport();

    // Get test results
    const results = getTestResults();

    console.log(`Found test results: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`);
    console.log(`Duration: ${results.duration}`);

    // Build the slack-notifier command
    const slackNotifierArgs = [
      '--status', options.status,
      '--env', options.env,
      '--client', options.client,
      '--browser', options.browser,
      '--passed', results.passed.toString(),
      '--failed', results.failed.toString(),
      '--skipped', results.skipped.toString(),
      '--total', (results.passed + results.failed + results.skipped).toString(),
      '--duration', results.duration,
      '--upload-s3', allureGenerated && options.uploadS3 ? 'true' : 'false'
    ];

    // Call the slack-notifier
    execSync(`node scripts/slack-notifier.js ${slackNotifierArgs.join(' ')}`, {
      stdio: 'inherit'
    });

  } else {
    // For "started" status, just notify without results
    const slackNotifierArgs = [
      '--status', options.status,
      '--env', options.env,
      '--client', options.client,
      '--browser', options.browser
    ];

    execSync(`node scripts/slack-notifier.js ${slackNotifierArgs.join(' ')}`, {
      stdio: 'inherit'
    });
  }
}

main();
