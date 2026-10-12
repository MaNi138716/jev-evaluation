// One sample per live service; starts and closes the local HTTP service automatically.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { config } from '../src/config.js';
import { createServer } from '../src/server.js';
import { evaluate } from '../src/evaluation.js';
const root = fileURLToPath(new URL('../', import.meta.url));
async function main() {
  const settings = { ...config(), retries: 0 };
  if (!settings.openaiKey || !settings.jevKey) throw new Error('Configure both model and Jev keys in .env first.');
  const server = createServer({ settings });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const outputDir = path.join(root, 'reports/runs', `smoke-${Date.now()}`);
    const result = await evaluate({ datasetFile: path.join(root, 'data/eval.jsonl'), targets: [
      { name: 'local', base: `http://127.0.0.1:${server.address().port}`, model: 'local-gpt', key: settings.serviceKey },
      { name: 'jev', base: settings.jevBase, model: settings.jevModel, key: settings.jevKey },
    ], outputDir, settings: { ...settings, timeout: settings.timeout + 5000 }, limit: 1 });
    console.log(`Smoke report: ${path.join(outputDir, 'report.md')}`);
    console.log('Connectivity check only: one classification sample, not the complete benchmark.');
    if (result.failures) process.exitCode = 1;
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
