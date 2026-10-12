import { setTimeout as sleep } from 'node:timers/promises';
import { AppError } from './errors.js';
export async function postJSON(url, body, { key = '', timeout = 60000, retries = 2, fetchImpl = fetch, sleepImpl = sleep } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    let response;
    try {
      response = await fetchImpl(url, {
        method: 'POST', redirect: 'error',
        headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
        body: JSON.stringify(body), signal: AbortSignal.timeout(timeout),
      });
    } catch (error) {
      if (attempt < retries) { await sleepImpl(500 * 2 ** attempt); continue; }
      const timedOut = ['TimeoutError', 'AbortError'].includes(error.name);
      throw new AppError(timedOut ? 504 : 502, timedOut ? 'upstream_timeout' : 'upstream_network_error', timedOut ? 'Upstream request timed out' : 'Cannot connect to upstream service');
    }
    if (!response.ok) {
      const status = response.status;
      const retryAfter = response.headers.get('retry-after');
      await response.body?.cancel();
      if ((status === 429 || status >= 500) && attempt < retries) {
        const seconds = Number(retryAfter);
        const wait = retryAfter && Number.isFinite(seconds) ? seconds * 1000 : 500 * 2 ** attempt;
        await sleepImpl(Math.max(0, Math.min(wait, 10000)));
        continue;
      }
      throw new AppError(502, 'upstream_http_error', `Upstream returned HTTP ${status}`, { upstream_status: status });
    }
    try { return await response.json(); }
    catch { throw new AppError(502, 'upstream_invalid_json', 'Upstream response is not valid JSON'); }
  }
}
