import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import { evaluate } from '../src/evaluation.js';
const root = fileURLToPath(new URL('../', import.meta.url));
async function main() {
  const settings = config();
  const args = process.argv.slice(2), allowed = ['--target', '--limit', '--out'];
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!allowed.includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Usage: --target both|local|jev [--limit N] [--out DIRECTORY]');
    options[args[i]] = args[i + 1];
  }
  const target = options['--target'] || 'both';
  if (!['both', 'local', 'jev'].includes(target)) throw new Error('Invalid target');
  const limit = options['--limit'] === undefined ? undefined : Number(options['--limit']);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) throw new Error('Limit must be a positive integer');
  if (target !== 'local' && !settings.jevKey) throw new Error('Missing TYPESAFE_API_KEY: copy .env.example to .env and configure the key. Use npm run demo for offline verification.');
  const targets = [];
  if (target !== 'jev') targets.push({ name: 'local', base: settings.localBase, model: 'local-gpt', key: settings.serviceKey });
  if (target !== 'local') targets.push({ name: 'jev', base: settings.jevBase, model: settings.jevModel, key: settings.jevKey });
  const outputDir = options['--out'] ? path.resolve(options['--out']) : path.join(root, 'reports/runs', new Date().toISOString().replace(/[:.]/g, '-'));
  const result = await evaluate({ datasetFile: path.join(root, 'data/eval.jsonl'), targets, outputDir, settings, limit });
  console.log(`Report: ${path.join(outputDir, 'report.md')}`);
  if (result.failures) { console.error('Some requests failed. Inspect raw.jsonl before interpreting quality.'); process.exitCode = 1; }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
