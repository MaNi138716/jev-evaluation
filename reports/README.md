# 报告目录说明

本目录保存实验结果证据。`reports/runs/` 是每次运行自动生成的临时目录，已在 `.gitignore` 中排除；下面这些目录是**挑选后随仓库提交**的固定证据。

| 目录 | 是什么 | 模式 | 模型 | 样本 | 失败 |
|---|---|---|---|---:|---:|
| [`final/`](final/) | **正式交付结果**：本地服务与 Jev 的完整双服务对比（72 次请求） | `LIVE_API` | `deepseek-flash` / `typesafe/jev-1.13-20260917` | 36 | 0 |
| [`connectivity-2026-10-11/`](connectivity-2026-10-11/) | Jev 直连被拒的首次证据（1 条样本，HTTP 451） | `LIVE_API` | `deepseek-flash` | 1 | jev 侧 1 |
| [`jev-blocked-2026-10-12/`](jev-blocked-2026-10-12/) | Jev 直连被拒的复测证据（3 条样本，全部 HTTP 451） | `LIVE_API` | — | 3 | 3 |
| [`offline-demo/`](offline-demo/) | 不消耗额度的端到端演示，用固定均匀概率替身 | `OFFLINE_DEMO_NOT_A_BENCHMARK` | `offline-uniform-fixture` | 36 | 0 |
| [`deepseek-only/`](deepseek-only/) | 历史记录：只有本地服务（Jev 尚未接通）时的一次运行 | `LIVE_API` | `deepseek-flash` | 36 | 1 |
| [`deepseek-final/`](deepseek-final/) | 历史记录：同上，早于接通 Jev | `LIVE_API` | `deepseek-flash` | 36 | 4 |

每个目录含四个文件：

| 文件 | 内容 |
|---|---|
| `report.md` | 可读的任务对比表 |
| `summary.json` | 准确率、宏 F1、覆盖率、Brier、MAE、延迟、混淆矩阵、数据哈希 |
| `predictions.json` | 逐题预测、标准答案与对错 |
| `raw.jsonl` | 每次请求的原始响应、错误、耗时、模型名、token 用量与费用 |

## 怎么读

- **只有 `mode` 为 `LIVE_API` 的结果才是真实模型调用**；`OFFLINE_DEMO_NOT_A_BENCHMARK` 是固定替身，不能当作成绩。
- 失败请求在 `accuracy_all` 中计为错误，所以必须同时看 `Valid/total`（覆盖率）。Jev 那一栏的 `0/N` 表示**请求被拒**，不是"模型判错"。
- `reports/jev-blocked-2026-10-12/` 与 `connectivity-2026-10-11/` 里的 `0.0%` 同理：HTTP 451 是地区可用性限制，**不能解释为 Jev 的准确率为零**。
- `deepseek-only/` 与 `deepseek-final/` 保留下来是为了保持时间线完整（先只有本地服务、后接通 Jev），正式结论以 `final/` 为准。

## 复现

见仓库根目录 `README.md` 第 2、4、5 节，或 `docs/NEXT_STEPS_ZH.md` 的「复现本次评测」。命令行参数与退出码语义见 `README.md` 第 5 节。
