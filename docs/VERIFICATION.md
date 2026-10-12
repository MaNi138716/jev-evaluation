# 交付验证记录

最后更新：2026-10-12。系统：Windows；Node.js：v24.19.0。所有命令与输出均可复现，原始证据保存在仓库内（见每节末尾路径）。

## 1. 离线验证（不消耗任何 API 额度）

| 检查 | 命令 | 结果 |
|---|---|---|
| 单元测试 | `npm test` | **20 项通过，0 失败** |
| 数据校验 | `npm run data:check` | 36 条样本；choice 24、noul 12、score 12 |
| 数据重建 | `npm run data:build` | 与已保存的 JSONL 字节内容一致，源文件 SHA256 校验通过 |
| 离线端到端演示 | `npm run demo` | 36 次本地 HTTP 请求全部成功；48 个答案通过合约校验（`OFFLINE_DEMO_NOT_A_BENCHMARK`，不调用任何模型） |
| 未配置 Key 时运行正式评测 | `scripts/evaluate.js` | 以非零退出码退出并提示缺少配置，不生成虚假的双服务报告 |
| 本地服务未配置模型 Key | 测试覆盖 | 返回 503 `missing_api_key`，不发起网络请求 |

离线演示报告见 `reports/offline-demo/`。其中的指标属于均匀概率固定替身，**不能作为任何模型的成绩**。

## 2. 真实双服务评测（正式交付结果）

| 项目 | 结果 |
|---|---|
| 命令 | `node --env-file=.env scripts/evaluate.js --target both`（评测端自动启停本地服务） |
| 运行模式 | `LIVE_API` |
| 时间（UTC） | 2026-10-12T11:45:38Z → 11:52:40Z |
| 请求数 | 72（本地 36 + Jev 36），**失败 0**，两边覆盖率均 100% |
| 数据集 SHA256 | `8bf7b347b87b86a690b419a245e7fbd7db94b3c639436e6de17cf627347335f8` |
| 本地服务实际模型 | `deepseek-flash` |
| Jev 实际模型 | `typesafe/jev-1.13-20260917`（provider `TypeSafe`） |
| Jev 侧费用 | 36 次请求合计 US$0.000643（15,301 输入 token；输出免费） |
| 结果 | 分类任务两边均 24/24；Jev 在 noul 与 score 任务均 12/12，本地服务 noul 11/12 |

结果目录：`reports/final/`（`report.md`、`summary.json`、`predictions.json`、`raw.jsonl`）。分析见 `docs/REPORT.md`。

## 3. Jev 接入路径验证

| 检查 | 结果 | 证据 |
|---|---|---|
| 直连 `api.typesafe.ai/v1/systemone` | **HTTP 451**，正文 `{"title":"Typesafe is not available in your region.","status":451}` | `reports/connectivity-2026-10-11/`、`reports/jev-blocked-2026-10-12/` |
| 直连只读 `GET /v1/models` | 同样 451（说明与请求格式无关） | `docs/REPORT.md` §5 |
| 经 OpenRouter 接入点 `openrouter.ai/api/v1/systemone` | **成功返回**，模型 `typesafe/jev-1.13-20260917` | `reports/final/raw.jsonl` |
| OpenRouter 密钥状态 | `is_free_tier: true`、账户 `total_credits: 0`，本次实测免费额度足够跑完 36 条 | OpenRouter `GET /api/v1/key`、`GET /api/v1/credits`（本地探测，未保存响应） |

451 表示当前请求来源地区受官方可用性限制，**不能据此推断密钥有效性、余额或模型质量**；同样，本记录也不把"经 OpenRouter 调用成功"解释为直连可用。

## 4. 评测器缺陷与修复记录

| 问题 | 发现方式 | 修复 |
|---|---|---|
| `score` 一致性校验容差过严（0.01） | 用官方文档中从线上真实抓取的 Jev 响应测试 `validateResponse`，`score=1.99` 对 `probabilities{0:0,1:0,2:1}` 的重算值 2.00，浮点差 `0.010000000000000009`，被判无效 | 容差改为按等级数计算（`Math.max(0.05, 0.01*(levels-1))`）；仍拒绝分数越界、legend 不匹配、与自身分布明显矛盾的答案。新增回归测试 |

修复前，正式实验的 12 条 Jev `score` 答案中有 3 条会被误判为 `invalid_response`，紧急度准确率会假性从 100% 降到 75%。该修复只影响评测器的接受门槛，不改变任何发送给服务的内容。

## 5. 数据来源可复现性

- 公开分类数据：BANKING77 测试集，源文件 SHA256 `d12d6e3bc4c3103966ae786dc435913c0c563dfa328f5a3646d0e62cfeeb474d`，抽样规则与许可证见 `data/README.md`。
- 自建案例：12 条，AI 辅助编写，规则与依据逐条记录在 `provenance.rationale`，以 CC0-1.0 提供。
- 数据清单见 `data/manifest.json`；逐条人工复核表见 `data/REVIEW.md`。
- **人工复核已完成**：项目作者于 2026-10-12 复核 36 条样本的输入、题目规则与标准答案，未提出修改。复核在首次真实评测之后进行，因此**不构成盲审**；标准答案未依据模型预测调整，正式评测所用数据哈希与复核后文件一致。
- 复核表仅记录整体确认，仓库内没有独立第三方的逐条复核记录；如需更强的标签可信度，应另找未接触过模型结果的人重新盲审。

## 6. 仍未完成的事项

1. **GitHub 发布**：仓库尚未 `git init` / 推送。`.env` 与 `.env.backup-before-run` 已被 `.gitignore` 排除；`reports/runs/` 被忽略，交付结果在 `reports/final/`。
2. **统计强度**：36 条样本、无独立调参集、无显著性检验；结论只适用于本数据集与本次模型版本。
3. **直连 TypeSafe 路径未验证**：本机地区受限，只验证了 OpenRouter 接入点；换环境后应重跑 `scripts/check-jev-access.js` 确认。
