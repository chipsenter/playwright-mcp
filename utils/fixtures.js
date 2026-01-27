import { test as base, expect } from '@playwright/test';
import { createNetworkMonitor } from './network-monitor.js';

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

export { expect };
