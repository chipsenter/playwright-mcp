/**
 * EZRouting test runtime configuration helpers.
 *
 * Precedence for environment:
 * 1) EZROUTING_BASE_URL (explicit full URL override)
 * 2) TEST_ENV / ENV (e.g., DEV, UAT, QA, PROD)
 * 3) EZROUTING_BASE_HOST (legacy host override)
 * 4) default: UAT (https://routing-uat.transact.com)
 *
 * Precedence for client:
 * 1) TEST_CLIENT / CLIENT (shell/CI env vars; also override .env because loadDotEnv() won't overwrite)
 * 2) npm config var (when running: `npm run test --client=clarknv`)
 * 3) CLI arg (useful for node scripts, e.g. `node ... --client=clarknv`)
 * 4) default: "testqa"
 */

function getArgValue(argv, name) {
  const eqPrefix = `${name}=`;
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === name) return argv[i + 1];
    if (token && token.startsWith(eqPrefix)) return token.slice(eqPrefix.length);
  }
  return undefined;
}

export function getClient() {
  const fromEnv = process.env.TEST_CLIENT || process.env.CLIENT;
  if (fromEnv) return fromEnv;

  // When running via npm scripts without `--`:
  // `npm run test --client=clarknv` exposes `npm_config_client=clarknv`.
  const fromNpm = process.env.npm_config_client;
  if (fromNpm) return fromNpm;

  const fromArg = getArgValue(process.argv, '--client');
  if (fromArg) return fromArg;

  return 'testqa';
}

export function getEzRoutingBaseUrl() {
  // Allow explicit full URL override
  const explicitBaseUrl = process.env.EZROUTING_BASE_URL;
  if (explicitBaseUrl) return explicitBaseUrl.replace(/\/+$/, '');

  // Get environment (DEV, UAT, PROD) - defaults to UAT
  const env = (process.env.TEST_ENV || process.env.ENV || 'UAT').toLowerCase();

  // Construct base host based on environment
  let host;
  if (env === 'prod' || env === 'production') {
    host = 'https://www.ezrouting.com';
  } else if (env === 'dev' || env === 'development') {
    host = 'https://routing-dev.transact.com';
  } else if (env === 'qa') {
    host = 'https://routing-qa.transact.com';
  } else {
    // Default to UAT
    host = 'https://routing-uat.transact.com';
  }

  // Allow explicit host override (legacy support)
  if (process.env.EZROUTING_BASE_HOST) {
    host = process.env.EZROUTING_BASE_HOST.replace(/\/+$/, '');
  }

  const client = getClient().replace(/^\/+|\/+$/g, '');
  return `${host}/${client}`;
}

