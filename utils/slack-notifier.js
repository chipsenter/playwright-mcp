/**
 * Slack Notifier for Test Results
 *
 * Posts test execution updates to Slack channel (matches Java framework format)
 *
 * Usage:
 *   node utils/slack-notifier.js --status started --env uat --client testqa
 *   node utils/slack-notifier.js --status completed --passed 14 --failed 0 --env uat --duration "2m 15s"
 *
 * Options:
 *   --status <started|completed|failed>  Test run status
 *   --env <dev|qa|uat|prod>             Environment
 *   --client <client-name>               Client/district name (default: testqa)
 *   --passed <number>                    Number of tests passed
 *   --failed <number>                    Number of tests failed
 *   --skipped <number>                   Number of tests skipped (default: 0)
 *   --total <number>                     Total number of tests
 *   --duration <string>                  Test duration (e.g., "2m 15s")
 *   --upload-s3 <true|false>             Upload report to S3 (default: true)
 *   --report-url <url>                   S3 report URL (auto-generated if not provided)
 */

import { uploadAllureReport } from './s3-uploader.js';
import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';

// Load environment variables
function loadEnv() {
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
}

loadEnv();

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    status: 'started',
    env: 'uat',
    client: 'testqa',
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    duration: '0s',
    uploadS3: true,
    reportUrl: null,
    app: 'ezr'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      if (['passed', 'failed', 'total', 'skipped'].includes(key)) {
        options[key] = parseInt(value, 10);
      } else if (key === 'upload-s3' || key === 'uploadS3') {
        options.uploadS3 = value === 'true';
      } else if (key === 'report-url' || key === 'reportUrl') {
        options.reportUrl = value;
      } else {
        options[key] = value;
      }
    }
  }

  return options;
}

// Get git information
function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const author = execSync('git log -1 --pretty=format:"%an"').toString().trim();
    const commit = execSync('git rev-parse --short HEAD').toString().trim();

    return { branch, author, commit };
  } catch (error) {
    return { branch: 'unknown', author: 'unknown', commit: 'unknown' };
  }
}

// Format Slack message for test execution (matches Java framework format)
async function formatSlackMessage(options, gitInfo) {
  const { status, env, client, passed, failed, skipped, total, duration, uploadS3, reportUrl, app } = options;
  const { branch, author } = gitInfo;

  let statusEmoji = '🚀';
  let title = `${app.toUpperCase()} UI Suite Execution Started`;
  let statusLine = '⏳ *Status:* Running...';

  const totalTests = total || (passed + failed + skipped);
  const passRate = totalTests > 0 ? ((passed / totalTests) * 100) : 0;

  if (status === 'completed') {
    statusEmoji = '✅';
    title = `${app.toUpperCase()} UI Suite Results ${env.toUpperCase()}`;
    statusLine = '✅ *Status:* Completed Successfully';
  } else if (status === 'failed') {
    statusEmoji = '❌';
    title = `${app.toUpperCase()} UI Suite Results ${env.toUpperCase()}`;
    statusLine = '❌ *Status:* Failed';
  }

  // Handle S3 report upload for Allure
  let allureReportLink = '`Report upload disabled`';
  if (status === 'completed' || status === 'failed') {
    if (uploadS3) {
      try {
        console.log('📤 Uploading Allure report to S3...');
        const s3ReportUrl = reportUrl || await uploadAllureReport(env);
        allureReportLink = s3ReportUrl
          ? `<${s3ReportUrl}|View Report>`
          : '`Report upload failed`';
      } catch (error) {
        console.error('S3 upload error:', error.message);
        allureReportLink = '`Report upload failed`';
      }
    }
  }

  // Build message text for started status
  if (status === 'started') {
    const messageText = `*${title}*\n` +
      `• *App:* \`${app}\`\n` +
      `• *Env:* \`${env}\`\n` +
      `• *Client:* \`${client}\`\n` +
      `• *Browser:* \`chromium\`\n` +
      `• *Branch:* \`${branch}\`\n` +
      `• *Triggered By:* \`${author}\`\n\n` +
      statusLine;

    return {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: messageText
          }
        }
      ]
    };
  }

  // Build message text for completed/failed status
  const messageText = `*${title}*\n` +
    `• *App:* \`${app}\`\n` +
    `• *Total Tests:* \`${totalTests}\`\n` +
    `• *Passes:* \`${passed}\`\n` +
    `• *Failures:* \`${failed}\`\n` +
    `• *Skipped:* \`${skipped}\`\n` +
    `• *Duration:* \`${duration}\`\n` +
    `• *Email Notification:* \`false\`\n` +
    `• *Automation Score:* \`${passRate.toFixed(2)}%\`\n` +
    `• *Allure Report:* ${allureReportLink}\n\n` +
    statusLine;

  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: messageText
        }
      }
    ]
  };
}

// Post message to Slack
async function postToSlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_DEBUG_URL;

  if (!webhookUrl) {
    console.error('❌ SLACK_WEBHOOK_DEBUG_URL not found in .env file');
    process.exit(1);
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      console.log('✅ Message posted to Slack successfully!');
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to post to Slack:', response.status, errorText);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error posting to Slack:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('📢 Slack Notifier\n');

  const options = parseArgs();
  const gitInfo = getGitInfo();

  console.log('Options:', options);
  console.log('Git Info:', gitInfo);

  const message = await formatSlackMessage(options, gitInfo);

  console.log('\n📤 Posting to Slack...\n');
  await postToSlack(message);
}

main();
