# 接口兼容性说明

研究依据是 TypeSafe 的[官方 API 文档](https://docs.typesafe.ai/api)，不是第三方同名网站。查阅日期：2026-10-11；**2026-10-12 已用真实凭据完成线上验证**：36 条样本、48 个答案经 `POST /v1/systemone` 全部成功返回并通过本项目校验器，返回模型为 `typesafe/jev-1.13-20260917`（provider `TypeSafe`）。验证结论见第 3 节。

共同部分：`POST /v1/systemone` 接收必填 `model`、共享 `state` 和按名字组织的 `questions`。响应顶层是 `model`、`answers`、`usage`，没有自行添加的 `result` 包装。支持 `choice`、`noul` 和 `score`，以及结构化 instructions/criteria。具体 HTTP 调用见 `examples/request.json`。

| 类型 | 输入 criteria | 输出 |
|---|---|---|
| choice | 2–255 个选项的对象；描述可为文本、对象、数组或 null | 最大概率的 choice、各选项 probabilities、confidence |
| noul | 可选 true/false 描述 | 表示 yes 概率的 noul，取值 0–1 |
| score | 2–10 个由低到高的等级描述 | 从 0 开始的概率加权 score、legend、probabilities、confidence |

本地 `choice`/`score` 的置信度实现参考[官方置信度公式](https://docs.typesafe.ai/confidence)。置信度是分布的集中程度，不是“正确率保证”。分数可为小数。概率允许 0.001 的舍入误差，通过校验后重新归一化；更大误差直接返回 502。

明确的实现差异：

- Jev 的 `noul` 没有独立 confidence。为了满足作业“每题有 confidence”，本服务额外返回 `abs(2*p-1)`。这是附加字段；评测器接受官方不带该字段的回答。
- 实际推理由 OpenAI 通用模型完成；概率是模型生成的估计值，没有训练概率头，也未进行校准。不能因为字段一致就称为 Jev 内部复现。
- 一个请求里的所有问题使用一次 GPT 请求，因此无法保证 Jev 所描述的问题推理隔离。问题在提示中要求独立处理，并用中性 q0/q1 映射隐藏原问题名称。
- 本地接受 `jev-latest`、`local-gpt` 和配置的 `OPENAI_MODEL` 作为请求 model；都映射到配置的 GPT。响应返回真正执行的模型名，不假冒 Jev。
- 本地限制 16 题、128 KiB 请求体、state 序列化 32000 字符、instructions 8000 字符、criteria 16000 字符。这些是本地资源限制，不能视为官方上限。
- 本地问题及选项名字限制为 1–64 个字母、数字、下划线、连字符，并禁止原型相关保留名；未知字段被拒绝。这个子集比官方更严格。
- 本地可选 `SERVICE_API_KEY`；默认仅绑定 127.0.0.1。官方 Jev 使用其平台 Bearer Key。
- 本地错误对象固定为 `{error:{code,message,details?}}`，不承诺逐字匹配官方错误正文。请求校验失败为 422，JSON 语法错误为 400，过大为 413，类型错误为 415；上游错误为 502，超时为 504，未配置 OpenAI Key 为 503。
- 超时/网络失败/429/5xx 最多重试 `MAX_RETRIES` 次；两层客户端（评测到本地、本地到上游模型）各有自己的上限，可能导致额外上游请求。Retry-After 支持秒数形式，最大等待 10 秒；日期形式使用指数退避。**451 与 4xx 不重试**，避免对明确拒绝反复请求。
- **Jev 的接入路径由配置决定**：直连 `https://api.typesafe.ai`（`JEV_MODEL=jev-latest`）或经 [OpenRouter 官方接入点](https://openrouter.ai/docs/guides/community/jev) `https://openrouter.ai/api/v1/systemone`（`JEV_MODEL=typesafe/jev-1.13`）。两条路径请求/响应结构一致，评测代码不区分；报告中的模型名一律以响应回执为准。本机直连返回 451（地区不可用），实际评测走 OpenRouter。
- **评测器对 `score` 自洽性的容差按等级数放宽**：厂商返回的 `probabilities`/`legend` 保留两位小数，而 `score` 保留全精度，重算的加权平均不可能严格相等（官方文档中一条真实响应为 `score=1.99` 对 `{0:0,1:0,2:1}` 重算 2.00，差值经浮点表示为 `0.010000000000000009`）。校验器因此使用 `max(0.05, 0.01 × (等级数-1))` 的容差，仍拒绝分数越界、`legend` 键不匹配、以及与自身分布明显矛盾的答案。这是评测端门槛，不是服务端行为。

不实现训练、微调、计费、流式返回、管理控制台或官方 SDK 的完整替代。这些并非本作业的必要接口。

## 3. 线上验证结论（2026-10-12）

用真实凭据对 Jev 发起 36 次 `POST /v1/systemone`（72 次请求的另一半为本地服务），结果如下：

| 官方文档约定 | 本项目假设 | 线上验证结果 |
|---|---|---|
| `choice` 返回 `choice` / `probabilities` / `confidence` | 校验 choice 属于 probabilities 且为最大概率项 | ✅ 24/24 通过 |
| `score` 返回 `score` / `legend` / `probabilities` / `confidence`，`probabilities` 与 `legend` 以等级序号字符串为键 | 以 `"0".."n-1"` 为键校验 | ✅ 12/12 通过 |
| `score` = 各级编号 × 概率求和 | 用同一公式重算并比对 | ✅ 12/12 通过（容差修正后，见上） |
| `noul` 只返回 `noul`，**不带** `confidence` | 允许缺失，缺失时不计算置信度 | ✅ 12/12 通过 |
| 响应 `model` 为实际服务的版本快照 | 原样记录、不冒充 | ✅ 记录为 `typesafe/jev-1.13-20260917` |
| 题目 id 与请求一致 | 要求 answers 键集合完全一致 | ✅ 36/36 通过 |

仍未验证的部分：直连 `api.typesafe.ai` 路径（本机地区限制）、厂商侧限流与配额上限、结构化 `instructions`/`criteria`（对象或数组形式）——本数据集只使用了字符串形式。
