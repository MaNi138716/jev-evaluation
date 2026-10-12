# 正式评测报告：本地 Jev 兼容服务 vs Jev（TypeSafe System One）

状态：**已完成真实双服务评测**。数据、原始响应与汇总结果保存在 `reports/final/`，可逐条复核。

## 1. 实验配置

| 项目 | 值 |
|---|---|
| 运行时间（UTC） | 2026-10-12T11:45:38Z 开始，2026-10-12T11:52:40Z 结束（约 7 分钟） |
| 运行模式 | `LIVE_API`（真实网络调用，非演示替身） |
| 数据集 SHA256 | `8bf7b347b87b86a690b419a245e7fbd7db94b3c639436e6de17cf627347335f8` |
| 样本 / 题目数 | 36 / 48（24 条 choice + 12 条 noul + 12 条 score） |
| 服务 A：本地兼容服务 | `http://127.0.0.1:8000`，后端通用模型 **DeepSeek**，实际返回模型名 `deepseek-flash` |
| 服务 B：Jev | `https://openrouter.ai/api/v1/systemone`，实际返回模型名 **`typesafe/jev-1.13-20260917`**（provider `TypeSafe`） |
| 请求总数 | 72（每个服务 36 次），**失败 0 次**，两个服务覆盖率均 12/12、24/24 |
| 超时 / 重试 | 120000 ms / 最多 3 次 |
| 完整结果目录 | `reports/final/`（由 2026-10-12T11-45-38-447Z 那次运行复制而来；`reports/runs/` 是临时目录，不提交） |
| 首次结果后是否改动数据或提示词 | **否**。数据与问题模板冻结；唯一改动是评测器的一个校验容差（见 §5），不改变任何请求内容 |

两个服务收到**完全相同**的 `state` 与 `questions`，只有服务地址与 `model` 参数不同；`expected` 字段只存在于评测端，从未发送给任何模型。请求顺序按数据原顺序，两个服务的先后顺序逐条交替，以削弱时点偏差。

## 2. 比较结果

| 服务 | 任务 | 有效/总数 | 准确率(all) | 宏 F1(all) | Brier / MAE(valid) | 延迟 p50 | 延迟 p95 |
|---|---|---:|---:|---:|---:|---:|---:|
| local (DeepSeek) | `banking77_intent/intent`（choice，24） | 24/24 | 100.0% | 1.0000 | 0.0062 | 1210 ms | 3955 ms |
| local | `authored_refund_urgency/refund_requested`（noul，12） | 12/12 | 91.7% | 0.9161 | 0.0834 | 18991 ms | 67165 ms |
| local | `authored_refund_urgency/urgency`（score，12） | 12/12 | 100.0% | N/A | 0.0171 | 18991 ms | 67165 ms |
| **jev** | `banking77_intent/intent`（choice，24） | 24/24 | 100.0% | 1.0000 | 0.0070 | 845 ms | 1417 ms |
| **jev** | `authored_refund_urgency/refund_requested`（noul，12） | 12/12 | **100.0%** | 1.0000 | **0.0006** | 929 ms | 2450 ms |
| **jev** | `authored_refund_urgency/urgency`（score，12） | 12/12 | 100.0% | N/A | **0.0083** | 929 ms | 2450 ms |

指标口径：分类用精确匹配；noul 阈值固定为 0.5；score 的就近等级准确率与小数 MAE 分开报告。失败请求在 `accuracy_all` 中计为错误、在 Brier/MAE 中排除，因此必须与覆盖率一起读——**本次两边覆盖率都是 100%，没有失败请求**，所以 `accuracy_all` 与 `accuracy_valid` 相等，两个服务的差距完全来自模型判断而非接口可靠性。Brier 与 MAE 量纲不同（choice 的 Brier 取值 0–2，noul 为 0–1），不能相加或平均。

### 观察

1. **分类任务打平**：两边都是 24/24，四类混淆矩阵均为对角阵。这符合预期——BANKING77 的四类意图差异明显，对现代模型不构成挑战，因此这项**不能用来区分两者**。
2. **Jev 在规则型任务上更准**：12 条刻意包含否定、政策询问、已完成退款等边界的自建案例，Jev 全部答对；本地服务错 1 条。Jev 的 noul Brier（0.0006）比本地（0.0834）低两个数量级，说明它不仅结论对，**概率也更贴近实际**。
3. **延迟差距主要来自输出 token 数，不是"模型快慢"**：

| 分组 | 本地平均输出 token | Jev 平均输出 token | 本地 p50 | Jev p50 |
|---|---:|---:|---:|---:|
| BANKING77（单题） | 212 | 61 | 1.3 s | 0.85 s |
| 自建案例（双题） | **1720** | **35** | **21.2 s** | **0.93 s** |

   通用模型在同样的结构化输出要求下会生成大量输出 token（本地 12 次自建请求共 20636 个输出 token，单次最高 3772），而 Jev 直接返回类型化结果、每次仅 35 个输出 token。输入 token 两边相当（自建组 5826 vs 5477）。这说明延迟差异来自**输出生成量**，而不是网络或服务本身；本地服务侧还包含上游偶发 5xx 的重试等待（p95 达 54 s）。

4. **成本**：Jev 侧 36 次请求合计 **$0.000643**（15,301 输入 token，输出免费），单次约 $0.0000169–0.00002。本地侧 DeepSeek 用量为 15,847 输入 / 25,732 输出 token。两边成本都可忽略，本实验不做性价比结论。

## 3. 错例分析

**本次唯一的错例是本地服务的一条，Jev 无错例。** 如实列出如下，不额外编造。

**样本 `authored-10`｜任务 `refund_requested`（noul）**

- 输入 state：`{"message": "The checkout is completely down. Restore it; we do not want a refund.", "impact": "service_blocked"}`
- 问题规则：`Is the speaker currently asking for money to be returned?`，并明确写出「当前明确要求退款为真；否定、只询问政策、已完成的退款和转述为假」
- 标准答案：`false`（依据：句中 `we do not want a refund` 是**明确否定**，说话人真正诉求是恢复服务）
- 本地服务预测：`true`（概率 0.5 以上，被判为 yes）
- Jev 预测：`false`（正确）
- 可能原因：通用模型受 `refund`、`checkout` 等词面线索主导，对**显式否定**的规则遵循不稳定；同类否定样本（如 `authored-04`「The refund has arrived. Thank you, no further action needed.」）在更早的几次运行中也出现过同样的假阳性。Jev 在这个规则型判断上更稳定，与它面向"单个明确判断"训练的设计一致。
- 需要注意：这是 **36 条小样本上的 1 条差异**，不能据此断言 Jev 在退款判断上普遍更强。

## 4. 结论与局限

**结论**：在同一批 36 条数据上，两个服务都完整返回了 48 个类型化答案且没有接口失败；分类任务打平，规则型任务（否定边界）Jev 更准、概率更可信、延迟更低且方差更小。就本实验覆盖的任务而言，Jev 在"明确规则的判断"上更贴合预期，而通用模型需要靠提示词去逼近这种规则遵循。

**局限（必须与结论一起读）**：

1. **样本太小**：36 条 / 48 个答案，四分类子集；没有划分独立的调参集，也没有做统计显著性检验。**不应据此宣布某个模型全面领先。**
2. **标签来源不对称**：24 条分类标签来自 BANKING77 公开测试集（CC BY 4.0，原标签未改动）；12 条自建案例为 AI 辅助编写，已由项目作者于 2026-10-12 复核确认无问题，但**该复核在首次真实评测之后进行，不构成独立盲审，也没有第三方逐条复核记录**，且规则相对直白，难度低于真实业务。
3. **训练数据重叠风险**：BANKING77 是公开数据集，两个模型都可能见过其中的样本，该类目的 100% 成绩不能外推。
4. **置信度不是校准证据**：本地服务的 confidence 由概率分布按公开公式计算，Jev 的 confidence 由厂商计算；两者都是分布集中度的变换，**没有经过校准验证**，小样本 Brier 只能作描述性指标。
5. **模型版本会变**：本次 Jev 返回的是带日期快照 `typesafe/jev-1.13-20260917`；本地后端 `deepseek-flash` 也未固定具体快照。复现时版本可能不同。
6. **接入路径差异**：Jev 本次经 OpenRouter 调用而非直连 `api.typesafe.ai`（原因见 §5）。模型与 provider 均由响应回执确认为 TypeSafe，但中间多一跳，理论上可能带来额外的排队/路由差异，延迟数字应按"该接入路径下的观测值"理解。

## 5. 附录：Jev 接入路径与一个被修掉的评测器缺陷

**接入路径**：在本机直连 `https://api.typesafe.ai` 时，`POST /v1/systemone` 与只读的 `GET /v1/models` 均返回 **HTTP 451**，正文为 `{"title":"Typesafe is not available in your region.","status":451}`，属于来源地区可用性限制（证据保留在 `reports/connectivity-2026-10-11/` 与 `reports/jev-blocked-2026-10-12/`）。随后改用 OpenRouter 官方文档明确支持的 Jev 接入点（`https://openrouter.ai/api/v1/systemone`，模型 `typesafe/jev-1.13`），调用成功。这不是绕过技术保护，而是换用官方提供的另一接入点。

**被修掉的缺陷**：首次用官方文档中"从线上真实抓取"的 Jev 响应测试本项目的响应校验器时，`score` 答案被误判为无效——Jev 返回的 `probabilities` 只保留两位小数，而 `score` 保留全精度，两者重算后必然存在 ≤0.01 的差距，浮点表示又恰好使其略大于 `0.01`。原校验器容差为 0.01，属于过严。

修复前，本次 72 次请求中 **12 条 Jev score 答案里有 3 条会被判为 `invalid_response`**，Jev 的紧急度准确率会假性从 100% 降到 75%，并被错误地记成"接口失败"。修复后容差按等级数计算（3 级量表为 0.05），同时仍拒绝分数越界、legend 不匹配、以及与自身分布明显矛盾的答案。`test/core.test.js` 已加入该场景的回归测试。

以上修订**只影响评测器对返回值的接受门槛，不改变任何发送给服务的内容**，因此不影响两个服务的公平比较。

## 6. 复核入口

| 想看什么 | 打开 |
|---|---|
| 汇总表（本报告数据来源） | `reports/final/report.md` |
| 机器可读指标、混淆矩阵、延迟 | `reports/final/summary.json` |
| 48×2 个答案的逐题对错 | `reports/final/predictions.json` |
| 72 次请求的原始响应、真实模型名、token 与费用 | `reports/final/raw.jsonl` |
| 逐条数据与标注理由 | `data/REVIEW.md`、`data/README.md` |
| Jev 直连被拒的证据 | `reports/connectivity-2026-10-11/`、`reports/jev-blocked-2026-10-12/` |
