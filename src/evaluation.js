import { appendFileSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { loadDataset, requestFor } from './dataset.js';
import { validateResponse } from './contract.js';
import { postJSON } from './http-client.js';
import { scoreAnswer, summarize } from './metrics.js';
const sha = v => createHash('sha256').update(v).digest('hex');
export async function evaluate({ datasetFile, targets, outputDir, settings, demo = false, limit, client = postJSON }) {
  let cases = loadDataset(datasetFile);
  if (limit !== undefined) cases = cases.slice(0, limit);
  mkdirSync(outputDir, { recursive: true });
  const rawPath = path.join(outputDir, 'raw.jsonl');
  writeFileSync(rawPath, '', { flag: 'wx' }); // Refuse accidental overwrite of evidence.
  const rows = Object.fromEntries(targets.map(t => [t.name, []]));
  const start = new Date().toISOString();
  for (let i = 0; i < cases.length; i++) {
    const item = cases[i];
    // Alternate order to reduce systematic cold-start/time-of-day bias.
    for (const target of i % 2 ? [...targets].reverse() : targets) {
      const request = requestFor(item, target.model), started = performance.now();
      let response = null, error = null;
      try {
        response = await client(`${target.base}/v1/systemone`, request, { key: target.key, timeout: settings.timeout, retries: settings.retries });
        validateResponse(request, response);
      } catch (e) { error = { code: e.code || 'invalid_response', message: e.message, ...(e.details ? { details: e.details } : {}) }; }
      const elapsed = performance.now() - started;
      appendFileSync(rawPath, JSON.stringify({ timestamp: new Date().toISOString(), service: target.name, id: item.id, request_sha256: sha(JSON.stringify(request)), response, error, latency_ms: elapsed }) + '\n');
      for (const id of Object.keys(item.questions)) rows[target.name].push(scoreAnswer(item, id, response?.answers?.[id], elapsed, error));
      console.log(`[${i + 1}/${cases.length}] ${target.name} ${item.id}: ${error ? error.code : 'ok'}`);
    }
  }
  const summaries = Object.fromEntries(targets.map(t => [t.name, summarize(rows[t.name])]));
  const failures = Object.values(rows).flat().filter(x => x.error).length;
  const report = { mode: demo ? 'OFFLINE_DEMO_NOT_A_BENCHMARK' : 'LIVE_API', started_at: start, finished_at: new Date().toISOString(),
    status: failures ? 'completed_with_errors' : 'completed', node_version: process.version,
    dataset_sha256: sha(readFileSync(datasetFile)), selected_ids: cases.map(x => x.id), threshold: 0.5,
    targets: targets.map(({ name, base, model }) => ({ name, base, model })),
    retries: settings.retries, timeout_ms: settings.timeout, summaries,
  };
  writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
  writeFileSync(path.join(outputDir, 'predictions.json'), JSON.stringify(rows, null, 2) + '\n');
  const pct = x => x === null ? 'N/A' : `${(x * 100).toFixed(1)}%`;
  const lines = ['# Evaluation report', '', `Mode: **${report.mode}**`, '', `Status: ${report.status}; examples: ${cases.length}; dataset SHA256: \`${report.dataset_sha256}\``, '',
    '| Service | Task | Valid/total | Accuracy (all) | Macro F1 (all) | Brier / MAE (valid) |',
    '|---|---|---:|---:|---:|---:|'];
  for (const [service, tasks] of Object.entries(summaries)) for (const [task, s] of Object.entries(tasks)) lines.push(`| ${service} | ${task} | ${s.valid}/${s.total} | ${pct(s.accuracy_all)} | ${s.macro_f1_all === undefined ? 'N/A' : s.macro_f1_all.toFixed(4)} | ${(s.brier_valid ?? s.mae_valid)?.toFixed(4) ?? 'N/A'} |`);
  lines.push('', 'Classification uses exact match; Noul uses p >= 0.5; Score accuracy rounds to the nearest level and MAE uses the fractional score.',
    'Failures count as incorrect in all-request accuracy/F1 and are excluded from Brier/MAE; always read coverage alongside those metrics.',
    'Latency is end-to-end per request (including retries), shared by questions in the same request. Do not add per-question latencies.',
    'The small four-intent subset and synthetic rubric checks do not establish general model superiority or calibrated confidence.',
    'Brier uses the sum over classes for Choice (range 0–2), and binary squared error for Noul (range 0–1); do not average them together.', '');
  if (demo) lines.push('**This report uses fixed offline fixtures. It contains no Jev or GPT quality measurement.**', '');
  writeFileSync(path.join(outputDir, 'report.md'), lines.join('\n'));
  return { report, rows, failures };
}
