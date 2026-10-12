import { readFileSync } from 'node:fs';
import { validateRequest, object } from './contract.js';
export function loadDataset(file) {
  const cases = readFileSync(file, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
  const ids = new Set();
  for (const item of cases) {
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new Error('Dataset ids must be unique nonempty strings');
    ids.add(item.id);
    if (!item.group || !object(item.provenance)) throw new Error(`Missing provenance/group: ${item.id}`);
    validateRequest({ model: 'jev-latest', state: item.state, questions: item.questions });
    if (!object(item.expected) || Object.keys(item.expected).length !== Object.keys(item.questions).length) throw new Error(`Expected answers mismatch: ${item.id}`);
    for (const [id, q] of Object.entries(item.questions)) {
      const y = item.expected[id];
      if (q.type === 'choice' && (typeof y !== 'string' || !Object.hasOwn(q.criteria, y))) throw new Error(`Invalid choice ground truth: ${item.id}`);
      if (q.type === 'noul' && typeof y !== 'boolean') throw new Error(`Invalid boolean ground truth: ${item.id}`);
      if (q.type === 'score' && (!Number.isInteger(y) || y < 0 || y >= q.criteria.length)) throw new Error(`Invalid score ground truth: ${item.id}`);
    }
  }
  if (!cases.length) throw new Error('Empty dataset');
  return cases;
}
export function requestFor(item, model) {
  // Ground truth, provenance and ids never leave the evaluator.
  return { model, state: item.state, questions: item.questions };
}
