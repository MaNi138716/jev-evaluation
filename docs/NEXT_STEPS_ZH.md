# 当前状态与剩余事项

最后更新：2026-10-12。本文件取代此前的"现在怎么完成项目"待办清单。

## 已经完成

| 作业要求 | 状态 | 位置 |
|---|---|---|
| ≥20 条带标签样本 | ✅ 36 条样本 / 48 个标准答案 | `data/eval.jsonl`、`data/REVIEW.md` |
| 至少一个分类任务 | ✅ BANKING77 四类意图（24 条 choice） | `data/README.md` |
| 至少一个布尔或 rubric 任务 | ✅ 退款判断（12 条 noul）+ 紧急度三级量表（12 条 score） | `data/README.md` |
| 说明例子与标签来源 | ✅ 论文、仓库、许可证、源文件 SHA256、确定性抽样规则、逐条 provenance | `data/README.md`、`data/manifest.json` |
| 不用 Jev 输出当 ground truth | ✅ 标签在调用任何模型前固定 | `data/README.md` |
| Jev 兼容服务（state + 多个命名 questions） | ✅ `POST /v1/systemone` | `src/server.js`、`examples/request.json` |
| 支持数据集用到的三种题型 | ✅ choice / noul / score | `src/contract.js` |
| 每题返回类型化答案与置信度 | ✅ 含 noul 的补充置信度（官方无此字段，已在文档标注） | `docs/API_COMPATIBILITY.md` |
| 校验非法请求并返回有用错误 | ✅ 400/401/404/405/413/415/422/502/503/504 + 字段级错误 | `test/core.test.js` |
| 记录与 Jev 的有意差异 | ✅ 含接入路径与评测器容差 | `docs/API_COMPATIBILITY.md` |
| 用同一数据集评测两个服务并比较 | ✅ **72 次请求、0 失败**，两边覆盖率 100% | `reports/final/` |
| 报告与结论 | ✅ 含实验配置、比较结果、错例分析、局限 | `docs/REPORT.md` |
| 验证记录 | ✅ 离线 20 项测试 + 真实评测 + 缺陷修复记录 | `docs/VERIFICATION.md` |
| 标签人工复核 | ✅ 项目作者复核 36 条，未提出修改（注：复核在首次评测之后进行，非盲审） | `data/REVIEW.md` |

**核心结果**（详见 `docs/REPORT.md`）：

| 任务 | 本地服务（DeepSeek） | Jev（`typesafe/jev-1.13-20260917`） |
|---|---|---|
| 意图分类 choice（24） | 100.0%（F1 1.0000，Brier 0.0062） | 100.0%（F1 1.0000，Brier 0.0070） |
| 退款判断 noul（12） | 91.7%（F1 0.9161，Brier 0.0834） | **100.0%**（F1 1.0000，Brier 0.0006） |
| 紧急度 score（12） | 100.0%（MAE 0.0171） | 100.0%（**MAE 0.0083**） |
| 延迟 p50 / p95 | 1.7 s / 54 s（自建组受输出 token 数拖累） | **0.88 s / 2.45 s** |
| 费用 | 15,847 输入 + 25,732 输出 token | **US$0.000643**（36 次，输入计费、输出免费） |

## 剩余事项（只剩一件）

### 发布到 GitHub

```bash
cd E:\2026-09-07\jev-evaluation
git init
git add .
git status          # 确认没有 .env / .env.backup-before-run
git commit -m "Implement Jev-compatible service and evaluation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jev-evaluation.git
git push -u origin main
```

提交前检查：

- `git status` 里**不应出现** `.env`、`.env.backup-before-run`（`.gitignore` 已排除 `.env*`，只放行 `.env.example`）。
- `reports/runs/` 已被忽略，不会上传历次临时实验；交付结果在 `reports/final/`。
- 仓库根目录的 `reports/final/raw.jsonl` 含真实模型名与 token 用量，但**不含任何密钥**（可自行搜索确认）。
- 项目自带 GitHub Actions（`.github/workflows/test.yml`），推送后会自动运行无密钥测试：`npm test`、`npm run data:check`、`npm run demo`。

## 复现本次评测

```powershell
cd E:\2026-09-07\jev-evaluation
$node = 'C:\Program Files\nodejs\node.exe'

# 离线自检（不消耗额度）
& $node test/core.test.js
& $node scripts/check-dataset.js

# 全量双服务评测（自动启停本地服务）
$srv = Start-Process -FilePath $node -ArgumentList '--env-file=.env','src/server.js' -WorkingDirectory 'E:\2026-09-07\jev-evaluation' -PassThru
$ok = $false
for ($i = 0; $i -lt 40 -and -not $ok; $i++) { try { Invoke-RestMethod http://127.0.0.1:8000/health -TimeoutSec 1 | Out-Null; $ok = $true } catch { Start-Sleep -Milliseconds 250 } }
if (-not $ok) { throw '本地服务没起来' }
& $node --env-file=.env scripts/evaluate.js --target both
Stop-Process -Id $srv.Id -Force
```

`.env` 需要配置四项（模板见 `.env.example`）：通用模型后端的 `OPENAI_API_KEY`/`OPENAI_BASE_URL`/`OPENAI_MODEL`，以及 Jev 侧的 `TYPESAFE_API_KEY`/`JEV_BASE_URL`/`JEV_MODEL`。Jev 可用 OpenRouter 接入点（`https://openrouter.ai/api` + `typesafe/jev-1.13`），免费额度即可跑完本实验。

## 一句话状态

**代码、数据、双服务真实评测、报告与标签复核都已完成；只剩"推到 GitHub"一件事。**

> 如果今后要修改任何标签：必须同步修改构建源、跑 `npm run data:build` 重建 `data/eval.jsonl`，并**重新运行评测**——否则报告里的数据哈希会与新数据不一致，`reports/final/` 的证据也随之失效。复核表本身不参与评测，单独改它不会影响数据。
