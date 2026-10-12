# Evaluation report

Mode: **LIVE_API**

Status: completed_with_errors; examples: 1; dataset SHA256: `8bf7b347b87b86a690b419a245e7fbd7db94b3c639436e6de17cf627347335f8`

| Service | Task | Valid/total | Accuracy (all) | Macro F1 (all) | Brier / MAE (valid) |
|---|---|---:|---:|---:|---:|
| local | banking77_intent/intent | 1/1 | 100.0% | 0.2500 | 0.0200 |
| jev | banking77_intent/intent | 0/1 | 0.0% | 0.0000 | N/A |

Classification uses exact match; Noul uses p >= 0.5; Score accuracy rounds to the nearest level and MAE uses the fractional score.
Failures count as incorrect in all-request accuracy/F1 and are excluded from Brier/MAE; always read coverage alongside those metrics.
Latency is end-to-end per request (including retries), shared by questions in the same request. Do not add per-question latencies.
The small four-intent subset and synthetic rubric checks do not establish general model superiority or calibrated confidence.
Brier uses the sum over classes for Choice (range 0–2), and binary squared error for Noul (range 0–1); do not average them together.
