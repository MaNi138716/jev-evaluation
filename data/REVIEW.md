# 数据集人工复核表

**状态：已由项目作者人工复核（2026-10-12）。结论：36 条样本的输入、题目规则与标准答案均无问题，未提出任何修改。**
修改这里不会改变正式数据；需要修订时同步更新构建脚本和 eval.jsonl，再更新 manifest。

退款：当前要求退钱为 true；否定、政策咨询、已完成的退款和转述为 false。
紧急度：routine=0；deadline_soon=1；service_blocked=2。本项目按明确的 impact 字段评分。

银行四类：card_arrival=卡未送达；lost_or_stolen_card=卡丢失/被盗；pending_cash_withdrawal=取现处理中；request_refund=申请退款。

## banking77-test-10

数据组：banking77_intent

输入：
```json
"How do I track my card?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "card_arrival"
}
```

来源/依据：BANKING77 test，原始记录序号 10，保留原标签 card_arrival

复核意见：无

## banking77-test-22

数据组：banking77_intent

输入：
```json
"How long should my new card take to arrive?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "card_arrival"
}
```

来源/依据：BANKING77 test，原始记录序号 22，保留原标签 card_arrival

复核意见：无

## banking77-test-31

数据组：banking77_intent

输入：
```json
"I was expecting my new card and am wondering why I haven't received it yet?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "card_arrival"
}
```

来源/依据：BANKING77 test，原始记录序号 31，保留原标签 card_arrival

复核意见：无

## banking77-test-28

数据组：banking77_intent

输入：
```json
"I ordered a card a week ago, and it's still not here. What do I do?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "card_arrival"
}
```

来源/依据：BANKING77 test，原始记录序号 28，保留原标签 card_arrival


复核意见：无

## banking77-test-30

数据组：banking77_intent

输入：
```json
"My card hasn't arrived yet."
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "card_arrival"
}
```

来源/依据：BANKING77 test，原始记录序号 30，保留原标签 card_arrival


复核意见：无

## banking77-test-6

数据组：banking77_intent

输入：
```json
"Do you know if there is a tracking number for the new card you sent me?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "card_arrival"
}
```

来源/依据：BANKING77 test，原始记录序号 6，保留原标签 card_arrival


复核意见：无

## banking77-test-459

数据组：banking77_intent

输入：
```json
"I need help with a lost card"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "lost_or_stolen_card"
}
```

来源/依据：BANKING77 test，原始记录序号 459，保留原标签 lost_or_stolen_card

复核意见：无

## banking77-test-442

数据组：banking77_intent

输入：
```json
"Someone stole my card. I need to report it stolen. I made a police report already, but how do I report it with you?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "lost_or_stolen_card"
}
```

来源/依据：BANKING77 test，原始记录序号 442，保留原标签 lost_or_stolen_card

复核意见：无

## banking77-test-450

数据组：banking77_intent

输入：
```json
"card is lost, please help"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "lost_or_stolen_card"
}
```

来源/依据：BANKING77 test，原始记录序号 450，保留原标签 lost_or_stolen_card

复核意见：无

## banking77-test-471

数据组：banking77_intent

输入：
```json
"My card is lost! What do I do now?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "lost_or_stolen_card"
}
```

来源/依据：BANKING77 test，原始记录序号 471，保留原标签 lost_or_stolen_card

复核意见：无

## banking77-test-474

数据组：banking77_intent

输入：
```json
"How do I report a stolen card?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "lost_or_stolen_card"
}
```

来源/依据：BANKING77 test，原始记录序号 474，保留原标签 lost_or_stolen_card

复核意见：无

## banking77-test-478

数据组：banking77_intent

输入：
```json
"My card got stolen!"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "lost_or_stolen_card"
}
```

来源/依据：BANKING77 test，原始记录序号 478，保留原标签 lost_or_stolen_card

复核意见：无

## banking77-test-234

数据组：banking77_intent

输入：
```json
"How long with my cash withdrawal stay pending for?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "pending_cash_withdrawal"
}
```

来源/依据：BANKING77 test，原始记录序号 234，保留原标签 pending_cash_withdrawal

复核意见：无

## banking77-test-229

数据组：banking77_intent

输入：
```json
"I have a pending transaction in my app. How is it still pending if I pulled the cash out from the ATM earlier?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "pending_cash_withdrawal"
}
```

来源/依据：BANKING77 test，原始记录序号 229，保留原标签 pending_cash_withdrawal

复核意见：无

## banking77-test-209

数据组：banking77_intent

输入：
```json
"Are you sure when the withdrawal will show?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "pending_cash_withdrawal"
}
```

来源/依据：BANKING77 test，原始记录序号 209，保留原标签 pending_cash_withdrawal

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-236

数据组：banking77_intent

输入：
```json
"My account was charged for a withdraw I tried to make that was decline."
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "pending_cash_withdrawal"
}
```

来源/依据：BANKING77 test，原始记录序号 236，保留原标签 pending_cash_withdrawal

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-237

数据组：banking77_intent

输入：
```json
"how long does it take to post atm with drawl"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "pending_cash_withdrawal"
}
```

来源/依据：BANKING77 test，原始记录序号 237，保留原标签 pending_cash_withdrawal

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-211

数据组：banking77_intent

输入：
```json
"Why is a transaction showing as pending when I recieved cash from an ATM?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "pending_cash_withdrawal"
}
```

来源/依据：BANKING77 test，原始记录序号 211，保留原标签 pending_cash_withdrawal

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-1715

数据组：banking77_intent

输入：
```json
"What's the refund process?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "request_refund"
}
```

来源/依据：BANKING77 test，原始记录序号 1715，保留原标签 request_refund

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-1706

数据组：banking77_intent

输入：
```json
"Hello I changed my mind and really need a refund on one of things I bought recently. Can you please cancel the transaction and get my money back. Please it's urgent."
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "request_refund"
}
```

来源/依据：BANKING77 test，原始记录序号 1706，保留原标签 request_refund

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-1718

数据组：banking77_intent

输入：
```json
"I want to get an item refunded"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "request_refund"
}
```

来源/依据：BANKING77 test，原始记录序号 1718，保留原标签 request_refund

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-1700

数据组：banking77_intent

输入：
```json
"How do I get refunded?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "request_refund"
}
```

来源/依据：BANKING77 test，原始记录序号 1700，保留原标签 request_refund

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-1694

数据组：banking77_intent

输入：
```json
"Can I have an item refunded?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "request_refund"
}
```

来源/依据：BANKING77 test，原始记录序号 1694，保留原标签 request_refund

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## banking77-test-1680

数据组：banking77_intent

输入：
```json
"Hello- It is urgent I get a refund on this product. The merchant has not been helpful, what can I do now to get this resolved ASAP?"
```

题目及规则：
```json
{
  "intent": {
    "type": "choice",
    "instructions": "Classify the primary banking intent into one of these four known categories.",
    "criteria": {
      "card_arrival": "An ordered card has not arrived; asking where it is or about its delivery.",
      "lost_or_stolen_card": "An existing card has been lost or stolen.",
      "pending_cash_withdrawal": "An ATM cash withdrawal remains pending.",
      "request_refund": "Requesting a refund of a card payment or asking how to obtain one."
    }
  }
}
```

当前标准答案：
```json
{
  "intent": "request_refund"
}
```

来源/依据：BANKING77 test，原始记录序号 1680，保留原标签 request_refund

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-01

数据组：authored_refund_urgency

输入：
```json
{
  "message": "Please return the money for my subscription. There is no rush.",
  "impact": "routine"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": true,
  "urgency": 0
}
```

来源/依据：Direct money-return request; routine impact.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-02

数据组：authored_refund_urgency

输入：
```json
{
  "message": "I am not requesting a refund. Please email my receipt.",
  "impact": "routine"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": false,
  "urgency": 0
}
```

来源/依据：Explicit negation; receipt request only.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-03

数据组：authored_refund_urgency

输入：
```json
{
  "message": "Please reverse my payment. I can wait until next week.",
  "impact": "routine"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": true,
  "urgency": 0
}
```

来源/依据：Payment reversal is a refund request; routine impact.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-04

数据组：authored_refund_urgency

输入：
```json
{
  "message": "The refund has arrived. Thank you, no further action needed.",
  "impact": "routine"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": false,
  "urgency": 0
}
```

来源/依据：Past completed refund, no current request.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-05

数据组：authored_refund_urgency

输入：
```json
{
  "message": "Could you give me my money back before tomorrow?",
  "impact": "deadline_soon"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": true,
  "urgency": 1
}
```

来源/依据：Current refund request with near deadline.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-06

数据组：authored_refund_urgency

输入：
```json
{
  "message": "What is your refund policy? I only need information by tomorrow.",
  "impact": "deadline_soon"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": false,
  "urgency": 1
}
```

来源/依据：Policy question is not a request to return money.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-07

数据组：authored_refund_urgency

输入：
```json
{
  "message": "I need a refund for the duplicate charge today, please.",
  "impact": "deadline_soon"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": true,
  "urgency": 1
}
```

来源/依据：Direct refund request with same-day deadline.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-08

数据组：authored_refund_urgency

输入：
```json
{
  "message": "Do not refund the order; correct the invoice today.",
  "impact": "deadline_soon"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": false,
  "urgency": 1
}
```

来源/依据：Explicitly rejects a refund, asks for invoice correction.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-09

数据组：authored_refund_urgency

输入：
```json
{
  "message": "Our entire team cannot access the paid service. Please refund this payment.",
  "impact": "service_blocked"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": true,
  "urgency": 2
}
```

来源/依据：Explicit refund and complete service blockage.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-10

数据组：authored_refund_urgency

输入：
```json
{
  "message": "The checkout is completely down. Restore it; we do not want a refund.",
  "impact": "service_blocked"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": false,
  "urgency": 2
}
```

来源/依据：Restoration request, explicit refund negation.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-11

数据组：authored_refund_urgency

输入：
```json
{
  "message": "Nothing works and I cannot use my account at all. I want my payment returned.",
  "impact": "service_blocked"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": true,
  "urgency": 2
}
```

来源/依据：Refund paraphrase with complete inability to use service.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）

## authored-12

数据组：authored_refund_urgency

输入：
```json
{
  "message": "All users are locked out. My colleague mentioned a refund, but I am only asking you to restore access.",
  "impact": "service_blocked"
}
```

题目及规则：
```json
{
  "refund_requested": {
    "type": "noul",
    "instructions": "Is the speaker currently asking for money to be returned? A refund-policy question, a past completed refund, quoted mentions, and an explicitly negated request are false.",
    "criteria": {
      "true": "A current explicit refund, reversal or money-back request.",
      "false": "No current request for money to be returned."
    }
  },
  "urgency": {
    "type": "score",
    "instructions": "Apply the impact rubric to state.impact. Use the message only as context. This is an explicit policy compliance task, not a subjective emotion rating.",
    "criteria": [
      "routine: no imminent deadline or complete service blockage",
      "deadline_soon: near deadline without complete service blockage",
      "service_blocked: the service is completely unusable"
    ]
  }
}
```

当前标准答案：
```json
{
  "refund_requested": false,
  "urgency": 2
}
```

来源/依据：Mention/quotation is not a current refund request.

- [x] 我已阅读原文及规则，并独立核对答案
- [ ] 标签有歧义，需要修改或说明

复核意见：无（2026-10-12，复核人整体确认）
