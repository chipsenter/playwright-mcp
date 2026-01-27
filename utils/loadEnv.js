const fs = require('node:fs');
const path = require('node:path');

function stripQuotes(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function loadDotEnv(envPath = path.join(process.cwd(), '.env')) {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = stripQuotes(trimmed.slice(idx + 1));
    if (!key) continue;

    // Don't override env already set by the shell/CI.
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

module.exports = { loadDotEnv };
