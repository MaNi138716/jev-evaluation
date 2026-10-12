const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const quantile = (a, p) => a.length ? [...a].sort((x, y) => x - y)[Math.ceil(a.length * p) - 1] : null;
export function summarize(rows) {
  const groups = {};
  for (const row of rows) {
    const key = `${row.group}/${row.question}`;
    (groups[key] ??= []).push(row);
  }
  return Object.fromEntries(Object.entries(groups).map(([key, items]) => {
    const valid = items.filter(x => !x.error), type = items[0].type;
    const correct = valid.filter(x => x.correct).length;
    const stats = { type, total: items.length, valid: valid.length, failures: items.length - valid.length,
      coverage: valid.length / items.length, accuracy_all: correct / items.length,
      accuracy_valid: valid.length ? correct / valid.length : null,
      latency_ms_p50: quantile(valid.map(x => x.latency_ms), 0.5), latency_ms_p95: quantile(valid.map(x => x.latency_ms), 0.95) };
    if (type === 'score') {
      stats.mae_valid = mean(valid.map(x => Math.abs(x.raw_score - x.expected)));
      stats.rounded_accuracy_all = stats.accuracy_all;
    } else {
      const labels = type === 'noul' ? [false, true] : Object.keys(items[0].criteria);
      const confusion = Object.fromEntries(labels.map(label => [String(label), Object.fromEntries([...labels.map(String), '__error__'].map(p => [p, 0]))]));
      for (const row of items) confusion[String(row.expected)][row.error ? '__error__' : String(row.predicted)]++;
      stats.confusion_matrix = confusion;
      stats.macro_f1_all = mean(labels.map(label => {
        const tp = items.filter(x => !x.error && x.expected === label && x.predicted === label).length;
        const fp = items.filter(x => !x.error && x.expected !== label && x.predicted === label).length;
        const fn = items.filter(x => x.expected === label && (x.error || x.predicted !== label)).length;
        return 2 * tp + fp + fn ? 2 * tp / (2 * tp + fp + fn) : 0;
      }));
      stats.brier_valid = mean(valid.map(x => x.brier));
      stats.balanced_accuracy_all = mean(labels.map(label => {
        const actual = items.filter(x => x.expected === label);
        return actual.length ? actual.filter(x => !x.error && x.correct).length / actual.length : null;
      }).filter(x => x !== null));
    }
    return [key, stats];
  }));
}
export function scoreAnswer(item, id, answer, latency_ms, error = null) {
  const q = item.questions[id], expected = item.expected[id];
  const row = { id: item.id, group: item.group, question: id, type: q.type, expected, criteria: q.criteria, latency_ms };
  if (error) return { ...row, error, correct: false };
  let predicted, brier;
  if (q.type === 'noul') { predicted = answer.noul >= 0.5; brier = (answer.noul - Number(expected)) ** 2; }
  if (q.type === 'choice') { predicted = answer.choice; brier = Object.entries(answer.probabilities).reduce((s, [k, p]) => s + (p - Number(k === expected)) ** 2, 0); }
  if (q.type === 'score') predicted = Math.round(answer.score);
  return { ...row, predicted, correct: predicted === expected, ...(brier !== undefined ? { brier } : {}),
    ...(q.type === 'score' ? { raw_score: answer.score } : {}), answer };
}
