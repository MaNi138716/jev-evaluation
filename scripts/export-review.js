import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadDataset } from '../src/dataset.js';
const file = new URL('../data/eval.jsonl', import.meta.url);
const dataset = loadDataset(file);
const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
const lines = ['# 数据集人工复核表', '', '**状态：尚未人工复核。所有勾选项均留空，不代表已确认。**', '',
  `对应 eval.jsonl SHA256：\`${sha}\``, '',
  '复核人：________　日期：________', '',
  '请先根据原文和题目规则独立判断，再核对 expected。不要依据模型预测改标签。',
  '本文件只是复核视图，不会被评测程序读取。修改这里不会改变正式数据；需要修订时同步更新构建脚本和 eval.jsonl，再更新 manifest。', '',
  '退款：当前要求退钱为 true；否定、政策咨询、已完成的退款和转述为 false。',
  '紧急度：routine=0；deadline_soon=1；service_blocked=2。本项目按明确的 impact 字段评分。', '',
  '银行四类：card_arrival=卡未送达；lost_or_stolen_card=卡丢失/被盗；pending_cash_withdrawal=取现处理中；request_refund=申请退款。', ''];
for (const item of dataset) {
  lines.push(`## ${item.id}`, '', `数据组：${item.group}`, '', '输入：', '```json', JSON.stringify(item.state, null, 2), '```', '',
    '题目及规则：', '```json', JSON.stringify(item.questions, null, 2), '```', '',
    '当前标准答案：', '```json', JSON.stringify(item.expected, null, 2), '```', '',
    `来源/依据：${item.provenance.rationale || `BANKING77 test，原始记录序号 ${item.provenance.row_index}，保留原标签 ${item.provenance.original_label}`}`, '',
    '- [ ] 我已阅读原文及规则，并独立核对答案', '- [ ] 标签有歧义，需要修改或说明', '', '复核意见：________', '');
}
const destination = new URL('../data/REVIEW.md', import.meta.url);
// Preserve human work: this exporter intentionally refuses to overwrite an existing review.
writeFileSync(destination, lines.join('\n'), { flag: 'wx' });
console.log(`Created a review sheet for ${dataset.length} examples. No model predictions or credentials included.`);
