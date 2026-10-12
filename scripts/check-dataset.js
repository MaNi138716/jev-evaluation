import { fileURLToPath } from 'node:url';
import { loadDataset } from '../src/dataset.js';
const cases = loadDataset(fileURLToPath(new URL('../data/eval.jsonl', import.meta.url)));
if (cases.length < 20) throw new Error('Assignment requires at least 20 examples');
const counts = {};
for (const item of cases) for (const q of Object.values(item.questions)) counts[q.type] = (counts[q.type] || 0) + 1;
console.log(JSON.stringify({ examples: cases.length, labeled_answers: counts }, null, 2));
