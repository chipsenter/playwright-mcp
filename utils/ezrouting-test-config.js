/**
 * EZRouting test runtime configuration helpers.
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
  const explicitBaseUrl = process.env.EZROUTING_BASE_URL;
  if (explicitBaseUrl) return explicitBaseUrl.replace(/\/+$/, '');

  const host = (process.env.EZROUTING_BASE_HOST || 'https://routing-uat.transact.com').replace(/\/+$/, '');
  const client = getClient().replace(/^\/+|\/+$/g, '');
  return `${host}/${client}`;
}

