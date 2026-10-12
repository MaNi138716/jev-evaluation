import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { config } from '../src/config.js';
import { createServer } from '../src/server.js';
import { typedAnswer, optionKeys } from '../src/contract.js';
import { evaluate } from '../src/evaluation.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const settings = { ...config({}), retries: 0 };
// Plumbing fixture only. It does not read expected labels or infer from state.
const provider = async request => ({ model: 'offline-uniform-fixture', usage: { input_tokens: 0, output_tokens: 0 },
  answers: Object.fromEntries(Object.entries(request.questions).map(([id, q]) => {
    const keys = q.type === 'noul' ? [] : optionKeys(q);
    return [id, typedAnswer(q, q.type === 'noul' ? { noul: 0.5 } : { probabilities: Object.fromEntries(keys.map(k => [k, 1 / keys.length])) })];
  })),
});
const server = createServer({ settings, provider });
server.listen(0, '127.0.0.1');
await once(server, 'listening');
try {
  const outputDir = path.join(root, 'reports/runs', `demo-${Date.now()}`);
  const { failures } = await evaluate({ datasetFile: path.join(root, 'data/eval.jsonl'), targets: [{ name: 'offline_fixture', model: 'local-gpt', base: `http://127.0.0.1:${server.address().port}` }], outputDir, settings, demo: true });
  console.log(`OFFLINE DEMO ONLY: ${path.join(outputDir, 'report.md')}`);
  if (failures) process.exitCode = 1;
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
