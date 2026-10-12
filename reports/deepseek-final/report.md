# Evaluation report

Mode: **LIVE_API**

Status: completed_with_errors; examples: 36; dataset SHA256: `8bf7b347b87b86a690b419a245e7fbd7db94b3c639436e6de17cf627347335f8`

| Service | Task | Valid/total | Accuracy (all) | Macro F1 (all) | Brier / MAE (valid) |
|---|---|---:|---:|---:|---:|
| local | banking77_intent/intent | 24/24 | 100.0% | 1.0000 | 0.0048 |
| local | authored_refund_urgency/refund_requested | 8/12 | 66.7% | 0.7500 | 0.0001 |
| local | authored_refund_urgency/urgency | 8/12 | 66.7% | N/A | 0.0175 |

Classification uses exact match; Noul uses p >= 0.5; Score accuracy rounds to the nearest level and MAE uses the fractional score.
Failures count as incorrect in all-request accuracy/F1 and are excluded from Brier/MAE; always read coverage alongside those metrics.
Latency is end-to-end per request (including retries), shared by questions in the same request. Do not add per-question latencies.
The small four-intent subset and synthetic rubric checks do not establish general model superiority or calibrated confidence.
Brier uses the sum over classes for Choice (range 0–2), and binary squared error for Noul (range 0–1); do not average them together.
