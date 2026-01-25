/**
 * S3 Uploader for Allure Reports
 *
 * Uploads Allure HTML reports to S3 bucket
 *
 * Usage:
 *   node scripts/s3-uploader.js
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Get all files recursively from a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Get MIME type for file
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.xml': 'application/xml'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Upload Allure report to S3
export async function uploadAllureReport(env = 'uat', startTime = null, endTime = null) {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    console.error('❌ Missing AWS credentials in .env file');
    console.error('   Required: AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
    return null;
  }

  const allureReportDir = path.join(process.cwd(), 'allure-report');

  if (!fs.existsSync(allureReportDir)) {
    console.error('❌ Allure report directory not found:', allureReportDir);
    console.error('   Generate report first: npm run allure:generate');
    return null;
  }

  try {
    // Create S3 client
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    // Generate unique report path based on timestamp
    const timestamp = startTime || new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `playwright-reports/${env}/${timestamp}`;

    console.log(`📤 Uploading Allure report to S3...`);
    console.log(`   Bucket: ${bucket}`);
    console.log(`   Path: ${reportPath}`);

    // Get all files in allure-report directory
    const allFiles = getAllFiles(allureReportDir);
    console.log(`   Files to upload: ${allFiles.length}`);

    let uploadedCount = 0;

    // Upload each file
    for (const filePath of allFiles) {
      const relativePath = path.relative(allureReportDir, filePath);
      const s3Key = `${reportPath}/${relativePath}`;
      const contentType = getMimeType(filePath);

      try {
        const fileContent = fs.readFileSync(filePath);

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: s3Key,
          Body: fileContent,
          ContentType: contentType
          // Note: ACL removed - bucket must have public-read policy configured
        });

        await s3Client.send(command);
        uploadedCount++;

        // Show progress every 10 files
        if (uploadedCount % 10 === 0) {
          console.log(`   Uploaded ${uploadedCount}/${allFiles.length} files...`);
        }
      } catch (error) {
        console.error(`   Error uploading ${relativePath}:`, error.message);
      }
    }

    console.log(`✅ Successfully uploaded ${uploadedCount}/${allFiles.length} files`);

    // Construct the public URL to the report
    const reportUrl = `https://${bucket}.s3.${region}.amazonaws.com/${reportPath}/index.html`;
    console.log(`📊 Report URL: ${reportUrl}`);

    return reportUrl;

  } catch (error) {
    console.error('❌ Error uploading to S3:', error.message);
    return null;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const env = args[0] || 'uat';

  uploadAllureReport(env)
    .then((url) => {
      if (url) {
        console.log('\n✅ Upload complete!');
        process.exit(0);
      } else {
        console.log('\n❌ Upload failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
