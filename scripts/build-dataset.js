import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const sha = text => createHash('sha256').update(text).digest('hex');
// RFC4180-style quoted fields, including embedded newlines and escaped quotes.
export function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw new Error('Unterminated CSV quote');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}
export function buildDataset() {
  const raw = readFileSync(path.join(root, 'data/source/banking77-test.csv'));
  const checksum = sha(raw);
  if (checksum !== 'd12d6e3bc4c3103966ae786dc435913c0c563dfa328f5a3646d0e62cfeeb474d') throw new Error('Source checksum changed; review and update provenance before rebuilding');
  const source = parseCSV(raw.toString('utf8')).slice(1).map(([text, label], index) => ({ text, label, index }));
  const criteria = {
    card_arrival: 'An ordered card has not arrived; asking where it is or about its delivery.',
    lost_or_stolen_card: 'An existing card has been lost or stolen.',
    pending_cash_withdrawal: 'An ATM cash withdrawal remains pending.',
    request_refund: 'Requesting a refund of a card payment or asking how to obtain one.',
  };
  const cases = [];
  for (const label of Object.keys(criteria)) {
    const selected = source.filter(x => x.label === label)
      .sort((a, b) => sha(`41:${a.index}:${a.text}`).localeCompare(sha(`41:${b.index}:${b.text}`))).slice(0, 6);
    if (selected.length !== 6) throw new Error(`Not enough examples for ${label}`);
    for (const item of selected) cases.push({
      id: `banking77-test-${item.index}`, group: 'banking77_intent', state: item.text,
      questions: { intent: { type: 'choice', instructions: 'Classify the primary banking intent into one of these four known categories.', criteria } },
      expected: { intent: item.label },
      provenance: { dataset: 'PolyAI/banking77', split: 'test', row_index: item.index, original_label: item.label,
        source_url: 'https://raw.githubusercontent.com/PolyAI-LDN/task-specific-datasets/master/banking_data/test.csv',
        source_sha256: checksum, license: 'CC-BY-4.0', adaptation: 'Text and label unchanged; four-class subset.' },
    });
  }
  const authored = [
    ['Please return the money for my subscription. There is no rush.', 'routine', true, 0, 'Direct money-return request; routine impact.'],
    ['I am not requesting a refund. Please email my receipt.', 'routine', false, 0, 'Explicit negation; receipt request only.'],
    ['Please reverse my payment. I can wait until next week.', 'routine', true, 0, 'Payment reversal is a refund request; routine impact.'],
    ['The refund has arrived. Thank you, no further action needed.', 'routine', false, 0, 'Past completed refund, no current request.'],
    ['Could you give me my money back before tomorrow?', 'deadline_soon', true, 1, 'Current refund request with near deadline.'],
    ['What is your refund policy? I only need information by tomorrow.', 'deadline_soon', false, 1, 'Policy question is not a request to return money.'],
    ['I need a refund for the duplicate charge today, please.', 'deadline_soon', true, 1, 'Direct refund request with same-day deadline.'],
    ['Do not refund the order; correct the invoice today.', 'deadline_soon', false, 1, 'Explicitly rejects a refund, asks for invoice correction.'],
    ['Our entire team cannot access the paid service. Please refund this payment.', 'service_blocked', true, 2, 'Explicit refund and complete service blockage.'],
    ['The checkout is completely down. Restore it; we do not want a refund.', 'service_blocked', false, 2, 'Restoration request, explicit refund negation.'],
    ['Nothing works and I cannot use my account at all. I want my payment returned.', 'service_blocked', true, 2, 'Refund paraphrase with complete inability to use service.'],
    ['All users are locked out. My colleague mentioned a refund, but I am only asking you to restore access.', 'service_blocked', false, 2, 'Mention/quotation is not a current refund request.'],
  ];
  authored.forEach(([message, impact, refund, urgency, rationale], i) => cases.push({
    id: `authored-${String(i + 1).padStart(2, '0')}`, group: 'authored_refund_urgency', state: { message, impact },
    questions: {
      refund_requested: { type: 'noul', instructions: 'Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.', criteria: { true: 'A current explicit refund, reversal or money-back request.', false: 'No current request for money to be returned.' } },
      urgency: { type: 'score', instructions: 'Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.', criteria: ['routine: no imminent deadline or complete service blockage', 'deadline_soon: near deadline without complete service blockage', 'service_blocked: the service is completely unusable'] },
    }, expected: { refund_requested: refund, urgency },
    provenance: { dataset: 'project-authored-v1', author: 'AI-assisted project examples; not independently human-annotated', license: 'CC0-1.0', rationale,
      label_method: 'Labels assigned from explicit textual rules before any Jev or baseline API calls.' },
  }));
  writeFileSync(path.join(root, 'data/eval.jsonl'), cases.map(x => JSON.stringify(x)).join('\n') + '\n');
  writeFileSync(path.join(root, 'data/manifest.json'), JSON.stringify({ version: 1, examples: cases.length, question_answers: 48,
    selection: 'First 6 per selected class after ascending SHA256(41:zero_based_row_index:text); no model-based selection',
    source_sha256: checksum, dataset_sha256: sha(readFileSync(path.join(root, 'data/eval.jsonl'))),
    counts: { banking77_intent: 24, authored_refund_urgency: 12, choice: 24, noul: 12, score: 12 },
  }, null, 2) + '\n');
  return cases;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`Built ${buildDataset().length} labeled examples.`);
