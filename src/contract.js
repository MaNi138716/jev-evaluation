import { AppError } from './errors.js';
export const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const description = v => typeof v === 'string' ? v.trim().length > 0 : object(v) || Array.isArray(v);
const own = (o, k) => Object.hasOwn(o, k);
const safeKey = k => /^[a-zA-Z0-9_-]{1,64}$/.test(k) && !['__proto__', 'prototype', 'constructor'].includes(k);
export function validateRequest(body) {
  const errors = [];
  const check = (condition, path, message) => { if (!condition) errors.push({ path, message }); };
  if (!object(body)) throw new AppError(422, 'validation_error', 'Expected a JSON object');
  check(Object.keys(body).every(k => ['state', 'model', 'questions'].includes(k)), '$', 'Unknown top-level field');
  check(description(body.state), 'state', 'Required: nonempty text, object or array');
  check(JSON.stringify(body.state ?? '').length <= 32000, 'state', 'Maximum serialized length is 32000');
  check(typeof body.model === 'string' && body.model.trim().length > 0 && body.model.length <= 128, 'model', 'Required: nonempty model name, max 128 characters');
  check(object(body.questions), 'questions', 'Required: map of named questions');
  if (object(body.questions)) {
    const entries = Object.entries(body.questions);
    check(entries.length >= 1 && entries.length <= 16, 'questions', 'Supply 1 to 16 questions');
    for (const [id, q] of entries) {
      const p = `questions.${id}`;
      check(safeKey(id), p, 'Use 1–64 letters, digits, underscore or hyphen; reserved names forbidden');
      if (!object(q)) { check(false, p, 'Expected an object'); continue; }
      check(Object.keys(q).every(k => ['type', 'instructions', 'criteria'].includes(k)), p, 'Unknown question field');
      check(['choice', 'noul', 'score'].includes(q.type), `${p}.type`, 'Use choice, noul or score');
      check(description(q.instructions), `${p}.instructions`, 'Required: nonempty text, object or array');
      check(JSON.stringify(q.instructions ?? '').length <= 8000, `${p}.instructions`, 'Maximum serialized length is 8000');
      if (q.type === 'choice') {
        check(object(q.criteria) && Object.keys(q.criteria).length >= 2 && Object.keys(q.criteria).length <= 255,
          `${p}.criteria`, 'Choice requires a map of 2–255 options');
        if (object(q.criteria)) for (const [key, v] of Object.entries(q.criteria)) {
          check(safeKey(key) && (v === null || description(v)), `${p}.criteria.${key}`, 'Invalid option name or description');
        }
      } else if (q.type === 'score') {
        check(Array.isArray(q.criteria) && q.criteria.length >= 2 && q.criteria.length <= 10 && q.criteria.every(description),
          `${p}.criteria`, 'Score requires 2–10 ordered descriptions');
      } else if (q.type === 'noul' && own(q, 'criteria')) {
        check(object(q.criteria) && Object.keys(q.criteria).every(k => ['true', 'false'].includes(k) && description(q.criteria[k])),
          `${p}.criteria`, 'Noul criteria may only contain true/false descriptions');
      }
      check(JSON.stringify(q.criteria ?? '').length <= 16000, `${p}.criteria`, 'Maximum serialized length is 16000');
    }
  }
  if (errors.length) throw new AppError(422, 'validation_error', 'Request validation failed', errors);
  return body;
}
const probability = x => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 1;
const keysEqual = (a, b) => object(a) && Object.keys(a).length === b.length && b.every(k => own(a, k));
export function optionKeys(q) {
  return q.type === 'score' ? q.criteria.map((_, i) => String(i)) : Object.keys(q.criteria);
}
export function distribution(p, keys) {
  if (!keysEqual(p, keys) || !Object.values(p).every(probability)) throw new Error('Invalid probability keys or values');
  const sum = Object.values(p).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) > 0.001) throw new Error('Probabilities must sum to one (tolerance 0.001)');
  return Object.fromEntries(keys.map(k => [k, p[k] / sum]));
}
export function confidence(p, ordered = false) {
  const values = Object.values(p), n = values.length, max = Math.max(...values);
  if (!ordered) return Math.max(0, Math.min(1, (max - 1 / n) / (1 - 1 / n)));
  const mode = values.indexOf(max);
  const spread = values.reduce((s, v, i) => s + v * Math.abs(i - mode), 0);
  const uniform = values.reduce((s, _, i) => s + Math.abs(i - (n - 1) / 2), 0) / n;
  return Math.max(0, Math.min(1, 1 - spread / uniform));
}
export function typedAnswer(q, raw) {
  if (!object(raw)) throw new Error('Missing answer');
  if (q.type === 'noul') {
    if (!probability(raw.noul)) throw new Error('Noul must be a probability');
    return { type: 'noul', noul: raw.noul, confidence: Math.abs(2 * raw.noul - 1) };
  }
  const keys = optionKeys(q), p = distribution(raw.probabilities, keys);
  if (q.type === 'choice') {
    const choice = keys.reduce((best, k) => p[k] > p[best] ? k : best, keys[0]);
    return { type: 'choice', choice, probabilities: p, confidence: confidence(p) };
  }
  return { type: 'score', score: keys.reduce((s, k) => s + Number(k) * p[k], 0),
    legend: Object.fromEntries(keys.map((k, i) => [k, typeof q.criteria[i] === 'string' ? q.criteria[i] : JSON.stringify(q.criteria[i])])),
    probabilities: p, confidence: confidence(p, true) };
}
// Jev rounds the wire probabilities/legend to two decimals while `score` keeps full precision,
// so the recomputed weighted mean cannot match a vendor score exactly: the live Jev response in
// the OpenRouter tutorial reports score 1.99 for probabilities {0: 0, 1: 0, 2: 1}, a gap of
// exactly 0.01 that floating point turns into 0.010000000000000009. Allow a gap that grows with
// the number of levels (0.05 for a three-level scale) while still rejecting scores that
// contradict their own distribution, fall outside the scale, or carry a mismatched legend.
const scoreTolerance = levels => Math.max(0.05, 0.01 * (levels - 1));
// Validate actual wire responses without overwriting vendor probabilities/confidence.
export function validateResponse(request, response) {
  if (!object(response) || typeof response.model !== 'string' || !keysEqual(response.answers, Object.keys(request.questions))) throw new Error('Response must contain model and exactly the requested answers');
  for (const [id, q] of Object.entries(request.questions)) {
    const a = response.answers[id];
    if (!object(a) || a.type !== q.type) throw new Error(`Wrong answer type: ${id}`);
    const computed = typedAnswer(q, a);
    if (q.type === 'noul') {
      if (own(a, 'confidence') && !probability(a.confidence)) throw new Error(`Invalid confidence: ${id}`);
    } else {
      if (!probability(a.confidence)) throw new Error(`Invalid confidence: ${id}`);
      if (q.type === 'choice' && (!own(a.probabilities, a.choice) || a.probabilities[a.choice] < Math.max(...Object.values(a.probabilities)) - 1e-6)) throw new Error(`Choice must be an argmax: ${id}`);
      if (q.type === 'score' && (typeof a.score !== 'number' || !Number.isFinite(a.score) || a.score < 0 || a.score > q.criteria.length - 1 || Math.abs(a.score - computed.score) > scoreTolerance(q.criteria.length) || !keysEqual(a.legend, optionKeys(q)))) throw new Error(`Invalid score or legend: ${id}`);
    }
  }
  return response;
}
