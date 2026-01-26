import fs from 'node:fs';
import path from 'node:path';

function safeUrlToEndpoint(url, method) {
  try {
    const u = new URL(url);
    return `${method} ${u.pathname}`;
  } catch {
    return `${method} ${url}`;
  }
}

function bytesToHuman(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Attach a network monitor to a Playwright `page` that records slow requests
 * and can write a report to `test-results/network-results/network-report`.
 *
 * What it captures (per request):
 * - endpoint: "METHOD /path"
 * - response time (ms): end-to-end (request -> requestfinished)
 * - size: from response `content-length` header when present
 *
 * Defaults:
 * - thresholdMs: 1000
 * - topN: 5
 * - includeResourceTypes: ['xhr', 'fetch']
 */
export function createNetworkMonitor(page, options = {}) {
  const {
    thresholdMs = 1000,
    topN = 5,
    includeResourceTypes = ['xhr', 'fetch'],
    outDir = path.join(process.cwd(), 'test-results', 'network-results'),
    reportFileName = 'network-report'
  } = options;

  /** @type {WeakMap<import('@playwright/test').Request, number>} */
  const startTimes = new WeakMap();
  /** @type {Array<{ endpoint: string; url: string; method: string; status: number | null; durationMs: number; sizeBytes: number | null; resourceType: string; }>} */
  const records = [];

  const onRequest = (request) => {
    const rt = request.resourceType?.() ?? '';
    if (includeResourceTypes.length > 0 && !includeResourceTypes.includes(rt)) return;
    startTimes.set(request, Date.now());
  };

  const onRequestFinished = async (request) => {
    const rt = request.resourceType?.() ?? '';
    if (includeResourceTypes.length > 0 && !includeResourceTypes.includes(rt)) return;

    const start = startTimes.get(request);
    if (!start) return;

    const durationMs = Date.now() - start;
    if (durationMs < thresholdMs) return;

    let status = null;
    let sizeBytes = null;
    try {
      const response = await request.response();
      if (response) {
        status = response.status();
        const headers = response.headers?.() ?? {};
        const cl = headers['content-length'];
        if (cl) {
          const parsed = parseInt(cl, 10);
          if (!Number.isNaN(parsed)) sizeBytes = parsed;
        }
      }
    } catch {
      // ignore
    }

    const url = request.url();
    const method = request.method();
    records.push({
      endpoint: safeUrlToEndpoint(url, method),
      url,
      method,
      status,
      durationMs,
      sizeBytes,
      resourceType: rt
    });
  };

  const onRequestFailed = (request) => {
    // Keep start times map clean.
    startTimes.delete(request);
  };

  page.on('request', onRequest);
  page.on('requestfinished', onRequestFinished);
  page.on('requestfailed', onRequestFailed);

  function getTopSlow() {
    return [...records]
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, topN);
  }

  async function stop() {
    page.off('request', onRequest);
    page.off('requestfinished', onRequestFinished);
    page.off('requestfailed', onRequestFailed);
  }

  /**
   * Writes/appends the slowest endpoints to the report file.
   *
   * @param {{ label?: string; mode?: 'append' | 'overwrite' }} [writeOptions]
   * @returns {Promise<{ reportPath: string; topSlow: ReturnType<typeof getTopSlow> }>}
   */
  async function writeReport(writeOptions = {}) {
    const { label = '', mode = 'append' } = writeOptions;
    const topSlow = getTopSlow();

    fs.mkdirSync(outDir, { recursive: true });
    const reportPath = path.join(outDir, reportFileName);

    const now = new Date().toISOString();
    let block = '';
    block += `\n=== Network Report (${now})${label ? ` - ${label}` : ''} ===\n`;

    if (topSlow.length === 0) {
      block += `No endpoints slower than ${thresholdMs}ms.\n`;
    } else {
      block += `Top ${Math.min(topN, topSlow.length)} slow endpoints (> ${thresholdMs}ms), slowest first:\n`;
      block += `endpoint | status | time_ms | size\n`;
      block += `---|---:|---:|---:\n`;
      for (const r of topSlow) {
        block += `${r.endpoint} | ${r.status ?? '-'} | ${r.durationMs} | ${bytesToHuman(r.sizeBytes)}\n`;
      }
    }

    if (mode === 'overwrite') {
      fs.writeFileSync(reportPath, block.trimStart(), 'utf8');
    } else {
      fs.appendFileSync(reportPath, block, 'utf8');
    }

    return { reportPath, topSlow };
  }

  return {
    stop,
    writeReport,
    getTopSlow
  };
}

