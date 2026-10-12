# Jev 兼容服务与评测项目

本项目根据[作业要求](https://gist.github.com/wsxiaoys/2362cba0700d44c53d89cd92fee05916)实现：准备带标准答案的数据，用通用大模型实现 Jev 风格的 HTTP 接口，然后用同一批输入对比两种服务。

**当前状态（2026-10-12）：已完成 36 条数据的真实双服务全量评测——本地服务 36 次 + Jev 36 次，共 72 次请求，全部成功、零失败，两个服务覆盖率均为 100%。结果与逐条原始响应在 [`reports/final/`](reports/final/)，结论与错例分析见 [正式评测报告](docs/REPORT.md)。20 项离线测试通过。Jev 经 OpenRouter 官方接入点调用（本机直连 `api.typesafe.ai` 返回 HTTP 451，地区不可用，证据见 `reports/connectivity-2026-10-11/`）。数据已由项目作者人工复核，未提出修改（见 `data/REVIEW.md`）。**尚未发布 GitHub**，这是唯一剩余事项，步骤见 [当前状态与剩余事项](docs/NEXT_STEPS_ZH.md)。**

本轮实际使用 DeepSeek 作为通用模型后端；后文的 OpenAI/GPT 说明保留为另一种配置方案。使用 DeepSeek 时不需要 OpenAI 额度。现有变量名仍是 `OPENAI_API_KEY`，但请求发送到 `.env` 中配置的 DeepSeek 地址。真实密钥只存在本机 `.env`，不在模板或 ZIP 中。

Jev 有两种接入方式：直连 TypeSafe 官方接口，或经 [OpenRouter 官方接入点](https://openrouter.ai/docs/guides/community/jev)（后者只需 OpenRouter 密钥，无需 TypeSafe 账号，`model` 用 `typesafe/jev-1.13`）。本机直连返回 451，实际评测走的是 OpenRouter：

```dotenv
OPENAI_API_KEY=填写DeepSeek密钥
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-flash

# 方式一（本机实测采用）：OpenRouter
JEV_BASE_URL=https://openrouter.ai/api
JEV_MODEL=typesafe/jev-1.13
TYPESAFE_API_KEY=填写OpenRouter密钥

# 方式二：直连 TypeSafe（在官方支持的地区使用）
# JEV_BASE_URL=https://api.typesafe.ai
# JEV_MODEL=jev-latest
# TYPESAFE_API_KEY=填写TypeSafe密钥
```

两种方式的响应结构一致，评测代码不需要区分；报告里的模型名以响应回执为准（本次为 `typesafe/jev-1.13-20260917`）。

无需手动开服务即可做单条真实连通性检查：`npm run smoke`。原始数据是 `data/eval.jsonl`，便于逐条阅读和做笔记的版本是 [人工复核表](data/REVIEW.md)。

## 1. 项目做什么

例如把“我的银行卡还没到”交给服务，询问它属于哪个业务类别；也可以针对同一段客服消息，同时判断“是否要求退款”和“紧急程度”。调用者提供 `state`（背景信息）和多个 `questions`（判定规则），服务返回结构化结果。

```text
带标签数据 ──只提取 state/questions──┬── Jev（TypeSafe / OpenRouter）──┐
                                  └── 本地 HTTP 服务 ──┤
                                       └── 通用模型     │
标准答案（只留在评测端）────────────────────────────────┴── 对比报告
```

技术方案：Node.js 22.9+、原生 HTTP 服务、OpenAI Responses API + Structured Outputs、Node 内置测试框架。没有第三方运行依赖，不需要 `npm install`。

| 作业要求 | 对应实现 | 状态 |
|---|---|---|
| 至少 20 条带标签样本 | `data/eval.jsonl`：36 条样本、48 个标准答案 | ✅ |
| 分类任务 | BANKING77 测试集，4 类 × 6 条，原始标签不变 | ✅ |
| 布尔/量表任务 | 12 条自建退款判断及明确规则的紧急度案例 | ✅ |
| 共用 state、多个命名 questions | `POST /v1/systemone`，支持三种类型混合 | ✅ |
| 类型答案及置信度 | `choice`、`noul`、`score`，逐题返回 | ✅ |
| 非法请求处理 | 400/401/413/415/422 等结构化错误 | ✅ |
| 同数据对比两种服务 | `scripts/evaluate.js`，逐条原始结果及汇总报告 | ✅ 72 次请求、0 失败，见 `reports/final/` |
| 可复现与来源 | 固定源文件 SHA256、固定抽样规则、逐条 provenance | ✅ |
| 标签人工复核 | `data/REVIEW.md`，项目作者复核 36 条，未提出修改 | ✅ |

## 2. 先在没有 Key 的情况下运行

先安装 Node.js 22.9 或更新版本（本机已用 24.19 验证），并用终端进入本项目目录。下面是通用命令：

```bash
node --version
npm test
npm run data:check
npm run demo
```

`demo` 会临时启动本地 HTTP 服务、处理全部 36 条数据、生成报告，然后自动退出。它使用均匀概率的固定测试替身，**既没有调用 GPT，也没有调用 Jev**。用它验证安装、接口、数据流和报告生成是否正常。

报告路径会输出到终端：`reports/runs/demo-时间戳/report.md`。交付时保存的一份示例在 `reports/offline-demo/report.md`。

### 这台 Windows 电脑可直接使用的命令

当前电脑的 PATH 中存在一个不能正常运行的 `node`，但 `C:\Program Files\nodejs\node.exe` 可用。PowerShell 使用绝对路径即可：

```powershell
cd E:\2026-09-07\jev-evaluation
$nodeExe = 'C:\Program Files\nodejs\node.exe'
& $nodeExe --version
& $nodeExe --test test/core.test.js
& $nodeExe scripts/check-dataset.js
& $nodeExe scripts/demo.js
```

你换到其他电脑时使用自己安装的 Node 路径，或直接用正常的 `node` / `npm`。

## 3. 申请并配置 API Key

需要两把密钥：一把给通用模型后端，一把给 Jev（或 OpenRouter）。

1. **通用模型后端**：在 [OpenAI 平台](https://platform.openai.com/)创建 API Key（本次实验用 DeepSeek，见文首配置示例），确保账户能调用所选模型。API 额度与网页聊天产品分开配置。
2. **Jev**，二选一：
   - [TypeSafe 官方快速开始](https://docs.typesafe.ai/introduction/quickstart)创建 TypeSafe Key（需官方支持的地区）；
   - [OpenRouter](https://openrouter.ai/settings/keys) 创建 Key —— **不需要 TypeSafe 账号，也不必须先充值**：本次实测在账户 `total_credits: 0` 的情况下用新用户免费额度跑完了全部 36 条 Jev 请求，合计约 US$0.00064。
3. 在本项目目录复制配置：

```powershell
Copy-Item .env.example .env
notepad .env
```

在 `.env` 中填入真实值（Jev 部分按上面选定的方式填写，两种方式的完整示例见文首）：

```dotenv
OPENAI_API_KEY=你的通用模型密钥
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

TYPESAFE_API_KEY=你的Jev或OpenRouter密钥
JEV_MODEL=jev-latest
JEV_BASE_URL=https://api.typesafe.ai
```

其余配置保留示例默认值。模型名可以改成账户实际可用、支持结构化输出的模型；这里的模型只是默认实现选择，不代表最新或最优。正式实验建议使用平台可用的固定版本，并保留返回的实际模型名。

`.env` 已被 `.gitignore` 排除。不要把真实密钥写进代码、README、截图或 GitHub。项目只把密钥放进认证请求头，不写进评测报告。

## 4. 启动大模型服务

打开第一个 PowerShell 窗口：

```powershell
cd E:\2026-09-07\jev-evaluation
& 'C:\Program Files\nodejs\node.exe' --env-file-if-exists=.env src/server.js
```

正常会显示 `http://127.0.0.1:8000`。通用环境也可以执行 `npm start`。保持该窗口打开，按 `Ctrl+C` 停止。修改 `.env` 后重启服务。

打开第二个 PowerShell 窗口检查：

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

健康检查只检查 HTTP 服务是否启动，不会消耗模型请求，也不代表 Key 有效。以下请求才会调用模型：

```powershell
cd E:\2026-09-07\jev-evaluation
$body = Get-Content -Raw -Encoding UTF8 examples/request.json
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/v1/systemone `
  -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 10
```

如果设置了 `SERVICE_API_KEY`，手工调用时需要再加 `-Headers @{ Authorization = 'Bearer 你的本地服务密钥' }`。评测脚本会从 `.env` 自动读取该项。

## 5. 运行正式对比

确保第一个窗口中的服务仍在运行，在第二个窗口执行。建议先用 1 条样本检查两个 Key 和接口，成功后再运行全部数据：

```powershell
cd E:\2026-09-07\jev-evaluation
$nodeExe = 'C:\Program Files\nodejs\node.exe'
& $nodeExe --env-file-if-exists=.env scripts/evaluate.js --target both --limit 1
& $nodeExe --env-file-if-exists=.env scripts/evaluate.js --target both
```

通用写法：`npm run evaluate -- --target both`。只评测一个服务时，用 `--target local` 或 `--target jev`。`--limit` 只是连通性检查，只有全量实验才覆盖全部题型。

无需手动开服务的一次性写法（自动启停本地服务，已实测）：

```powershell
cd E:\2026-09-07\jev-evaluation
$node = 'C:\Program Files\nodejs\node.exe'
$srv = Start-Process -FilePath $node -ArgumentList '--env-file=.env','src/server.js' -WorkingDirectory 'E:\2026-09-07\jev-evaluation' -PassThru
$ok = $false
for ($i = 0; $i -lt 40 -and -not $ok; $i++) { try { Invoke-RestMethod http://127.0.0.1:8000/health -TimeoutSec 1 | Out-Null; $ok = $true } catch { Start-Sleep -Milliseconds 250 } }
if (-not $ok) { throw '本地服务没起来' }
& $node --env-file=.env scripts/evaluate.js --target both
Stop-Process -Id $srv.Id -Force
```

本次交付使用的完整实验就是这条命令，产物已复制到 `reports/final/`；结果解读见 [正式评测报告](docs/REPORT.md)。

完整实验对每个服务发送 36 次请求，合计 72 次（不含重试）。每个本地请求会调用一次通用模型；12 条自建案例在单次请求内同时回答两个问题。网络/限流重试可能额外产生请求和费用。本次 Jev 侧 36 次请求合计约 US$0.00064。

每次实验会生成一个新目录 `reports/runs/时间戳/`：

| 文件 | 用途 |
|---|---|
| `report.md` | 可直接阅读的任务对比表 |
| `summary.json` | 准确率、宏 F1、覆盖率、Brier、MAE、延迟及混淆矩阵 |
| `predictions.json` | 逐题预测、标准答案和错误 |
| `raw.jsonl` | 每次请求的原始响应、错误、耗时和请求哈希；边跑边保存 |

`accuracy_all` 把失败请求也计为错误；`accuracy_valid` 只算有效结果，必须与覆盖率一起看。`noul >= 0.5` 为真；`score` 用原始小数算 MAE，用四舍五入后的等级算准确率。数据规模小，不应仅凭这个实验宣布某个模型全面领先。

没有 Key 时正式命令会退出并说明缺失配置，不会回退到假模型。出现失败时退出码为 1，同时保留已生成的报告。修复问题后重跑会生成新目录；不自动混合两次实验。

## 6. 如何理解并讲解你的实现

建议按下面顺序阅读代码：

1. `scripts/build-dataset.js`：从公开测试集确定性抽样，添加有明确标签规则的案例。
2. `src/contract.js`：验证请求结构，检查概率，计算类型答案及置信度。
3. `src/provider.js`：生成动态 JSON Schema，把状态和问题交给 GPT，并解析输出。
4. `src/server.js`：对外提供 HTTP 接口，处理认证和错误。
5. `src/evaluation.js`、`src/metrics.js`：发送相同任务，保留响应，与标准答案比较。
6. `test/core.test.js`：验证错误场景、接口行为、第三方响应解析、指标和数据可复现性。

关键设计：标准答案只存在评测端，不会发给任何模型；模型输出概率后，由普通代码选最大概率类别、计算加权评分和置信度。模型自己声称的概率并不等于经过统计校准的概率。

详细解释见 [实现与实验方法](docs/METHODOLOGY.md)；真实评测结论见 [正式评测报告](docs/REPORT.md)；接口差异见 [兼容性说明](docs/API_COMPATIBILITY.md)；来源和许可证见 [数据说明](data/README.md)；全部验证记录见 [交付验证记录](docs/VERIFICATION.md)。

## 7. 整理报告并提交 GitHub

本仓库已完成第 1–5 步，只剩第 6 步（推送）：

1. ✅ 真实评测已完成：`mode` 为 `LIVE_API`、`selected_ids` 含 36 条、两个服务都在。
2. ✅ 失败数为 0，两个服务覆盖率均为 100%，质量差异来自模型判断而非接口可靠性。
3. ✅ 错例分析已写入 [正式评测报告](docs/REPORT.md)（本次唯一错例为本地服务的 `authored-10`）。
4. ✅ 完整实验结果已复制到 `reports/final/`，含原始响应。`reports/runs/` 默认不提交，避免误上传临时实验。
5. ✅ 报告已按 `docs/REPORT_TEMPLATE.md` 的结构填写为 `docs/REPORT.md`，README 顶部状态已更新。
6. ⬜ 在 GitHub 创建一个空仓库（例如 `jev-evaluation`），然后在项目目录执行：

```bash
git init
git add .
git status
git commit -m "Implement Jev-compatible service and evaluation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jev-evaluation.git
git push -u origin main
```

先将 `YOUR_USERNAME` 替换成自己的用户名。提交前用 `git status` 确认没有 `.env`、`.env.backup-before-run`（`.gitignore` 已排除 `.env*`，只放行 `.env.example`）。如果已有 `origin`，先用 `git remote -v` 查看，不要重复添加。项目包含 GitHub Actions，推送后会运行无密钥测试。

## 8. 常见问题

| 现象 | 处理 |
|---|---|
| `node` 无法运行 | 使用上述 Node 完整路径；确保版本至少 22.9 |
| `missing_api_key` / 503 | 检查 `.env` 位于项目根目录，填好 `OPENAI_API_KEY` 后重启 |
| `Missing TYPESAFE_API_KEY` | 在 `.env` 配置 Jev Key；暂时没有就运行离线 demo |
| 详情为 **451** | 来源地区不可用（TypeSafe 直连的官方提示）。改用 OpenRouter 接入点：`JEV_BASE_URL=https://openrouter.ai/api` + `JEV_MODEL=typesafe/jev-1.13` + OpenRouter 密钥 |
| 详情为 **402** | OpenRouter 账户额度不足；免费额度用尽后需充值 |
| `upstream_http_error`，详情为 401/403 | 检查对应平台 Key 和账户权限 |
| 详情为 400/404 | 检查模型名是否可用，以及模型是否支持 Responses/JSON Schema |
| 详情为 429 | 检查额度/限流；客户端已配置有上限的重试 |
| 详情为 502（`upstream_http_error`） | 上游偶发故障；客户端已重试，重跑一次通常即恢复。失败会被如实记录，不会算成正确答案 |
| `Invalid score or legend` | 厂商返回的 `score` 与两位小数的 `probabilities` 不可能严格自洽，校验器容差已按等级数放宽（3 级为 0.05） |
| `upstream_timeout` / 网络错误 | 检查网络连接和代理；必要时调整 `.env` 中的超时 |
| `EADDRINUSE` | 8000 端口被占用，同时修改 `PORT` 和 `LOCAL_BASE_URL` |
| `invalid_model_output` | 模型输出不合约；不会把损坏的答案当成成功结果 |

API 依据：[Jev 官方接口](https://docs.typesafe.ai/api)、[置信度定义](https://docs.typesafe.ai/confidence)、[OpenRouter 的 Jev 接入说明](https://openrouter.ai/docs/guides/community/jev)、[OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)。查阅日期：2026-10-12。
