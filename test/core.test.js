import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { config } from '../src/config.js';
import { validateRequest, validateResponse, typedAnswer, confidence } from '../src/contract.js';
import { createServer } from '../src/server.js';
import { createOpenAIProvider, buildModelRequest } from '../src/provider.js';
import { postJSON } from '../src/http-client.js';
import { summarize, scoreAnswer } from '../src/metrics.js';
import { loadDataset, requestFor } from '../src/dataset.js';
import { evaluate } from '../src/evaluation.js';
import { parseCSV, buildDataset } from '../scripts/build-dataset.js';
const choice = { type: 'choice', instructions: 'Route this ticket', criteria: { billing: 'Payment', tech: 'Bug' } };
const noul = { type: 'noul', instructions: 'Is a refund requested?' };
const score = { type: 'score', instructions: 'How urgent?', criteria: ['Low', 'Medium', 'High'] };
const request = { model: 'jev-latest', state: 'Please refund me', questions: { route: choice, refund: noul, urgency: score } };
const fixture = () => ({ model: 'fixture', answers: {
  route: typedAnswer(choice, { probabilities: { billing: 0.8, tech: 0.2 } }),
  refund: typedAnswer(noul, { noul: 0.9 }), urgency: typedAnswer(score, { probabilities: { 0: 0, 1: 0.5, 2: 0.5 } }),
}, usage: { input_tokens: 1, output_tokens: 1 } });
async function withServer(options, fn) {
  const server = createServer({ settings: config({}), provider: async () => fixture(), ...options });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try { await fn(`http://127.0.0.1:${server.address().port}`); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
test('shared state, mixed types, structured descriptions and null choice descriptions', () => {
  assert.equal(validateRequest(request), request);
  validateRequest({ ...request, state: ['one', 'two'], questions: { q: { ...choice, instructions: { question: 'route' }, criteria: { a: null, b: ['description'] } } } });
});
test('malformed requests include paths and never silently coerce', () => {
  const bad = [null, {}, { ...request, state: 12 }, { ...request, questions: {} },
    { ...request, model: '' }, { ...request, questions: { q: { ...choice, criteria: { only: 'one' } } } },
    { ...request, questions: { q: { ...score, criteria: ['one'] } } },
    { ...request, questions: { q: { ...noul, criteria: { yes: 'yes' } } } },
    { ...request, questions: { q: { type: 'text', instructions: 'hi' } } },
    JSON.parse('{"state":"x","model":"jev-latest","questions":{"__proto__":{"type":"noul","instructions":"x"}}}')];
  for (const value of bad) assert.throws(() => validateRequest(value), e => e.status === 422);
});
test('confidence and fractional score match documented formulas', () => {
  assert.equal(confidence({ a: 0.5, b: 0.5 }), 0);
  assert.equal(confidence({ a: 1, b: 0 }), 1);
  assert.ok(Math.abs(confidence({ a: 0.6, b: 0.3, c: 0.1 }) - 0.4) < 1e-12);
  const a = typedAnswer(score, { probabilities: { 0: 0, 1: 0.5, 2: 0.5 } });
  assert.equal(a.score, 1.5); assert.equal(a.confidence, 0.25);
  assert.equal(typedAnswer(noul, { noul: 0.5 }).confidence, 0);
});
test('reject invalid distributions and out-of-range noul', () => {
  for (const p of [{ billing: 0.1, tech: 0.1 }, { billing: 1 }, { billing: -1, tech: 2 }, { billing: '0.5', tech: 0.5 }, { billing: NaN, tech: 1 }]) assert.throws(() => typedAnswer(choice, { probabilities: p }));
  assert.throws(() => typedAnswer(noul, { noul: 1.1 }));
});
test('Jev Noul without confidence is valid; wrong choice and missing answer are rejected', () => {
  const r = fixture(); delete r.answers.refund.confidence;
  validateResponse(request, r);
  r.answers.route.choice = 'tech'; assert.throws(() => validateResponse(request, r));
  const missing = fixture(); delete missing.answers.urgency; assert.throws(() => validateResponse(request, missing));
});
test('live Jev wire answers stay valid when probabilities are rounded but score is not', () => {
  // Shape captured from the live Jev API in OpenRouter's tutorial: probabilities/legend are
  // rounded to two decimals while `score` keeps full precision, so the recomputed weighted mean
  // (2.00) differs from the reported score (1.99). Rejecting this would fail every Score answer.
  const jevRequest = { model: 'typesafe/jev-1.13', state: { ticket: 'blank checkout page' },
    questions: { team: choice, urgency: score } };
  const wire = { id: 'gen-dec-1', model: 'typesafe/jev-1.13-20260917', provider: 'TypeSafe', answers: {
    team: { type: 'choice', choice: 'billing', confidence: 0.67, probabilities: { billing: 0.78, tech: 0.22 } },
    urgency: { type: 'score', score: 1.99, confidence: 0.99, probabilities: { 0: 0, 1: 0, 2: 1 },
      legend: { 0: 'Low', 1: 'Medium', 2: 'High' } },
  }, usage: { input_tokens: 476, output_tokens: 70, cost: 0.000019992 } };
  validateResponse(jevRequest, wire);
  const offScale = structuredClone(wire); offScale.answers.urgency.score = 2.5; assert.throws(() => validateResponse(jevRequest, offScale));
  const contradicts = structuredClone(wire); contradicts.answers.urgency.score = 1.5; assert.throws(() => validateResponse(jevRequest, contradicts));
  const badLegend = structuredClone(wire); delete badLegend.answers.urgency.legend[2]; assert.throws(() => validateResponse(jevRequest, badLegend));
});
test('HTTP supports health and mixed named answers', async () => withServer({}, async base => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  const r = await postJSON(`${base}/v1/systemone`, request, { retries: 0 });
  assert.deepEqual(Object.keys(r.answers), ['route', 'refund', 'urgency']); validateResponse(request, r);
}));
test('HTTP rejects malformed JSON, media type, body size, wrong route/method and model', async () => withServer({}, async base => {
  for (const [body, headers, status] of [
    ['{', { 'Content-Type': 'application/json' }, 400],
    ['{}', { 'Content-Type': 'application/json' }, 422],
    ['{}', { 'Content-Type': 'text/plain' }, 415],
    [JSON.stringify({ ...request, state: 'x'.repeat(140000) }), { 'Content-Type': 'application/json' }, 413],
    [JSON.stringify({ ...request, model: 'invented-model' }), { 'Content-Type': 'application/json' }, 422],
  ]) {
    const r = await fetch(`${base}/v1/systemone`, { method: 'POST', headers, body });
    assert.equal(r.status, status); assert.ok((await r.json()).error.code);
  }
  assert.equal((await fetch(`${base}/v1/systemone`)).status, 405);
  assert.equal((await fetch(`${base}/missing`)).status, 404);
}));
test('optional local authentication is enforced', async () => withServer({ settings: config({ SERVICE_API_KEY: 'test-only' }) }, async base => {
  const r = await fetch(`${base}/v1/systemone`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
  assert.equal(r.status, 401);
  await postJSON(`${base}/v1/systemone`, request, { key: 'test-only', retries: 0 });
}));
test('oversized chunked bodies receive JSON 413 instead of a socket reset', async () => withServer({}, async base => {
  const response = await new Promise((resolve, reject) => {
    const req = http.request(`${base}/v1/systemone`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' } }, res => {
      let body = ''; res.setEncoding('utf8'); res.on('data', x => { body += x; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject); req.write('x'.repeat(70000)); req.end('x'.repeat(70000));
  });
  assert.equal(response.status, 413); assert.equal(response.body.error.code, 'body_too_large');
}));
test('missing OpenAI credentials produce actionable 503 without a network call', async () => withServer({ provider: createOpenAIProvider(config({})) }, async base => {
  const r = await fetch(`${base}/v1/systemone`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
  assert.equal(r.status, 503); assert.equal((await r.json()).error.code, 'missing_api_key');
}));
test('OpenAI request hides question ids and requests strict schema', () => {
  const r = buildModelRequest(request, 'my-model');
  assert.equal(r.model, 'my-model'); assert.equal(r.store, false);
  assert.equal(r.text.format.strict, true);
  assert.deepEqual(Object.keys(JSON.parse(r.input).questions), ['q0', 'q1', 'q2']);
  assert.equal(r.text.format.schema.additionalProperties, false);
});
test('OpenAI adapter parses Responses wire format and preserves actual model and usage', async () => {
  const provider = createOpenAIProvider(config({ OPENAI_API_KEY: 'test-only' }), async (url, body) => {
    assert.ok(url.endsWith('/responses')); assert.ok(body.input.includes('Please refund me'));
    return { status: 'completed', model: 'snapshot-model', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ q0: { probabilities: { billing: 0.8, tech: 0.2 } }, q1: { noul: 0.9 }, q2: { probabilities: { 0: 0, 1: 0.5, 2: 0.5 } } }) }] }], usage: { input_tokens: 10, output_tokens: 20 } };
  });
  const r = await provider(request); validateResponse(request, r);
  assert.equal(r.model, 'snapshot-model'); assert.equal(r.usage.output_tokens, 20);
});
test('refused, truncated, malformed and missing model answers fail closed', async () => {
  for (const response of [
    { status: 'incomplete' },
    { status: 'completed', output: [{ content: [{ type: 'refusal' }] }] },
    { status: 'completed', output: [{ content: [{ type: 'output_text', text: '{' }] }] },
    { status: 'completed', output: [{ content: [{ type: 'output_text', text: '{}' }] }] },
  ]) await assert.rejects(createOpenAIProvider(config({ OPENAI_API_KEY: 'test-only' }), async () => response)(request), e => e.status === 502);
});
test('HTTP client retries 429/529, does not retry 401, redacts upstream body', async () => {
  let calls = 0;
  const fetchImpl = async () => ++calls < 3 ? new Response('secret body', { status: calls === 1 ? 429 : 529 }) : Response.json({ ok: true });
  assert.deepEqual(await postJSON('https://example.invalid', {}, { fetchImpl, sleepImpl: async () => {}, retries: 2 }), { ok: true });
  assert.equal(calls, 3); calls = 0;
  await assert.rejects(postJSON('https://example.invalid', {}, { fetchImpl: async () => { calls++; return new Response('secret body', { status: 401 }); } }), e => e.details.upstream_status === 401 && !e.message.includes('secret'));
  assert.equal(calls, 1);
});
test('timeouts and non-JSON upstream responses have distinct errors', async () => {
  await assert.rejects(postJSON('https://example.invalid', {}, { retries: 0, fetchImpl: async () => { const e = new Error(); e.name = 'TimeoutError'; throw e; } }), e => e.status === 504);
  await assert.rejects(postJSON('https://example.invalid', {}, { retries: 0, fetchImpl: async () => new Response('not json') }), e => e.code === 'upstream_invalid_json');
});
test('metric arithmetic counts errors, threshold ties, and fractional scores correctly', () => {
  const item = { id: 'a', group: 'g', questions: { q: noul }, expected: { q: true } };
  const rows = [scoreAnswer(item, 'q', { noul: 0.5 }, 10), scoreAnswer({ ...item, expected: { q: false } }, 'q', { noul: 0.8 }, 20), scoreAnswer(item, 'q', null, 30, { code: 'timeout' })];
  const m = summarize(rows)['g/q'];
  assert.equal(m.accuracy_all, 1 / 3); assert.equal(m.accuracy_valid, 0.5); assert.equal(m.coverage, 2 / 3);
  assert.ok(Math.abs(m.brier_valid - 0.445) < 1e-12); assert.equal(m.confusion_matrix.true.__error__, 1);
  const s = scoreAnswer({ ...item, questions: { q: score }, expected: { q: 2 } }, 'q', { score: 1.6 }, 10);
  assert.equal(s.correct, true); assert.ok(Math.abs(summarize([s])['g/q'].mae_valid - 0.4) < 1e-12);
});
test('CSV escaped quotes and embedded newlines parse correctly', () => {
  assert.deepEqual(parseCSV('text,label\n"a,""b""\nc",x\n'), [['text', 'label'], ['a,"b"\nc', 'x']]);
});
test('dataset meets requirements, provenance matches source, and rebuild is deterministic', () => {
  const file = new URL('../data/eval.jsonl', import.meta.url), before = readFileSync(file, 'utf8');
  const cases = loadDataset(file); assert.equal(cases.length, 36);
  const labels = cases.filter(x => x.group === 'authored_refund_urgency').map(x => x.expected.refund_requested);
  assert.equal(labels.filter(Boolean).length, 6);
  for (const item of cases) {
    assert.deepEqual(Object.keys(requestFor(item, 'jev-latest')), ['model', 'state', 'questions']);
    if (item.group === 'banking77_intent') assert.equal(item.expected.intent, item.provenance.original_label);
  }
  buildDataset(); assert.equal(readFileSync(file, 'utf8'), before);
});
test('evaluation keeps failures and raw evidence, omits credentials, produces report', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'jev-test-'));
  try {
    const { report, failures } = await evaluate({ datasetFile: new URL('../data/eval.jsonl', import.meta.url),
      targets: [{ name: 'broken', base: 'https://example.invalid', key: 'DO-NOT-LOG', model: 'jev-latest' }],
      settings: config({}), outputDir: dir, limit: 2, client: async () => { throw new Error('network failure'); } });
    assert.equal(failures, 2); assert.equal(report.status, 'completed_with_errors');
    assert.equal(report.summaries.broken['banking77_intent/intent'].accuracy_all, 0);
    assert.equal(readFileSync(path.join(dir, 'raw.jsonl'), 'utf8').trim().split('\n').length, 2);
    assert.ok(!JSON.stringify(report).includes('DO-NOT-LOG'));
    assert.ok(readFileSync(path.join(dir, 'report.md'), 'utf8').includes('LIVE_API'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
