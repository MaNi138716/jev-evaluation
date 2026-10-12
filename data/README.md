# 数据来源与标注

## BANKING77 子集：24 条分类数据

- 作者：Iñigo Casanueva、Tadas Temcinas、Daniela Gerz、Matthew Henderson、Ivan Vulić。
- 论文：[Efficient Intent Detection with Dual Sentence Encoders（2020）](https://arxiv.org/abs/2003.04807)。
- 原始仓库：[PolyAI-LDN/task-specific-datasets](https://github.com/PolyAI-LDN/task-specific-datasets)。
- [Hugging Face 数据卡](https://huggingface.co/datasets/PolyAI/banking77)。
- [下载文件](https://raw.githubusercontent.com/PolyAI-LDN/task-specific-datasets/master/banking_data/test.csv)，保存为 `source/banking77-test.csv`。
- 授权：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。此数据不属于本项目自己创造的数据。
- 获取日期：2026-10-11。源文件 SHA256：`d12d6e3bc4c3103966ae786dc435913c0c563dfa328f5a3646d0e62cfeeb474d`。

固定选择 `card_arrival`、`lost_or_stolen_card`、`pending_cash_withdrawal`、`request_refund` 四类，每类取 6 条。类内按 `SHA256("41:" + 原始零基行号 + ":" + 原始文本)` 升序排序，取前 6 条。行号指 CSV 数据记录，不包含表头；带换行的引号字段算一个记录。

所有原始文本和分类标签保持不变。改动仅是抽取四类子集、增加统一问题模板和 provenance。这是四分类评测，不是完整的 77 分类成绩。选样过程不使用模型结果。`data/eval.jsonl` 每条记录含原始行号和标签，可对照源 CSV 复核。

## 自建案例：12 条、24 个答案

案例由本项目借助 AI 编写，没有假称来自公开人工标注数据集，也没有独立人工复核。每条都保存标签依据 `provenance.rationale`。这些自建示例以 CC0-1.0 提供。

每条包含两个问题：

1. `refund_requested`：6 真、6 假。当前明确要求退款、撤销付款或返还款项为真；否定、只询问政策、已完成的退款和转述为假。
2. `urgency`：0/1/2 各 4 条。由明确的 `impact` 字段按规则映射，分别是 routine、deadline_soon、service_blocked。文本用于背景，不把“模型猜测的情绪”作为标准答案。

这组数据验证规则执行和边界表达，不是现实紧急程度泛化能力的充分证据。所有标签在调用任何模型前确定，尤其没有用 Jev 输出作为 ground truth。两个服务均能看见同样的 impact 字段；没有把 expected 字段发送给模型。

## 重建与局限

`npm run data:build` 根据固定源文件和代码内案例重建数据；`npm run data:check` 校验每条标准答案和题型。构建前校验源文件 SHA256；输出 manifest 还记录整个 JSONL 的 SHA256。源码和已生成数据同时提交，避免运行时联网拉取造成漂移。

小规模英语数据、仅四个银行意图、人工规则容易、自建案例的 AI 辅助来源、公开数据可能进入模型训练集，都会限制结果解释。未划分调参集，所以应先冻结问题模板再跑实验；如果根据错例改提示词，应另找未见过的数据验证，不能把调参后成绩称为无偏测试结果。
