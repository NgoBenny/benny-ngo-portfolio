---
title: Live NBA Win Probability
subtitle: baseline. / NBA live analytics
summary: An end-to-end system that turns NBA play-by-play into live win probabilities. A shared inference pipeline powers a multi-game dashboard, with state reconciliation, recorded-game replay, and visible collection health.
order: 1
category: Real-time systems / Machine learning
period: June 2026 — Present
technologies: [Python, Flask, WebSockets, scikit-learn, SQLite]
thumbnail: ../../assets/nba.png
thumbnailAlt: NBA dashboard in its cobalt and ice-blue theme, showing a historical replay, team scores, win probabilities, and a probability trace.
caption: An application screenshot in historical replay mode. The displayed game state illustrates the interface; benchmark results come from the separate frozen evaluation.
sourceVisibility: private
highlights:
  - value: "0.148"
    label: Frozen v1 Brier score
  - value: "627,786"
    label: Frozen v1 test snapshots
  - value: "1,310"
    label: Frozen v1 held-out games
architecture:
  - title: NBA feeds
    detail: Historical + live adapters
  - title: Game state
    detail: Reconcile corrected plays
  - title: Inference
    detail: Shared features + bundle
  - title: Dashboard
    detail: Flask + WebSockets
---

## The problem

A five-point lead means something different in the first quarter than in the final minute. I built this dashboard to follow that change: it estimates win probability after each confirmed play, plots the estimates over the game, and lets users explore historical games.

I worked on the data pipeline, model evaluation, Flask API, and live interface. The system reads historical and live NBA data, builds game state from the actions, computes features, and publishes estimates. Historical action replay uses the same processing path as live inference. Recorded replay is separate: it plays saved live-shadow prediction snapshots and leaves collection gaps intact.

## Engineering decisions

### Rebuild state when the feed changes

Plays can arrive twice or be corrected after later actions have been published. Treating every response as new data can double-count events or leave the clock, possession, and score inconsistent.

The adapters convert upstream responses into a common action format. Stable keys identify duplicates and edited actions, then a state rebuild applies the corrected history. Repeated polls can therefore process the same response without duplicating events, and features use the latest confirmed state.

### Keep training and serving on the same path

Historical training, replay, and live inference share a versioned feature transformer. Pregame information is computed chronologically, so an estimate does not use results that were unavailable at that moment. Persisted team-strength and recent-form state supplies live inference with the same kind of context used during training.

Each model bundle records its feature schema. The loader checks compatibility before accepting it, since a changed feature order can produce plausible-looking predictions from the wrong inputs.

### Separate polling from the browser

A dedicated worker discovers games and polls upstream sources. It publishes snapshots through a shared SQLite broker for Flask and WebSocket clients to read. Opening another dashboard doesn’t start another NBA polling loop. A renewable lease prevents duplicate workers on one host; running across multiple hosts would require a distributed broker.

Scoreboard discovery and per-game play-by-play polling recover independently through bounded endpoint cooldowns and fresh-session retries. Successful duplicate responses do not refresh the age of unchanged play content. Persisted content hashes and first-observed timestamps retain freshness information across restarts, while filesystem status-write failures are reported separately from upstream errors.

Recovery reports separate a provider request succeeding, a prediction resuming after new play, and a final score being confirmed. Missing timing evidence stays unadjudicated. A successful response containing unchanged plays does not establish prediction recovery.

### Keep candidate evaluation out of serving

A sealed candidate can run alongside v1 through a bounded background queue. Comparisons go to a separate log, with persisted-record, write-error, and drop counts. The candidate does not publish to the dashboard or enter v1’s acceptance journal. This isolates comparison work from serving; it is not a measured claim of zero runtime overhead.

### Preserve final-score corrections

Terminal-score validation rejects inconsistent Game End inputs and retains the last valid estimate with a warning. Reporting preserves the first reconciled final, then records later corrections in a hash-linked ledger. Observed source conflicts are reported separately without changing acceptance deadlines or historical verdicts. The ledger records the collector’s observations; it does not independently prove which provider caused a conflict.

## Results and evaluation

The historical pipeline covers 6,562 games, split chronologically into fitting, calibration/validation, and testing periods. The frozen evaluation for model version 20260801T225614Z contains 1,310 held-out games and 627,786 snapshots, from October 21, 2025 through June 13, 2026.

The selected situational logistic model reports a 0.14794 Brier score and 0.01367 expected calibration error, rounded to 0.148 and 0.014. Brier score measures the squared error of probability estimates; lower is better. Calibration checks whether events given similar probabilities occur at roughly that frequency. Snapshots within a game are correlated observations, not independent games.

The dashboard supports multiple games, probability traces, stale/reconnect states, and action replay. Completed live-shadow games remain selectable after slate rollover and support playback of recorded predictions. Evaluation history is grouped by night, sealed bundle, and runtime identity; missing evidence remains unavailable. On-demand box scores use a separate cache and request budget and are hidden during recorded replay.

Offline regression checks cover archive replay, evaluation history, stale content, failure handling, and box-score isolation. CI runs all dashboard regression suites. Live operational acceptance requires separate evidence.

The rebound-possession investigation exposed a difference between historical training rows and live payloads. The offline 1.1 experiment produced identical scores because the historical rows lacked the stale possession field involved in the live failures. A separate replay tool therefore compares input rules on the exact archived payloads and first requires reproduction of logged probabilities.

The proposed confirmation uses a fixed sample of fresh regular-season games, explicit exclusion rules, and one runtime identity. A successful replay run only establishes reproduction; it does not establish a confirmation pass or authorize a serving change. Candidate input corrections and recent preseason checkpoint results do not inherit the frozen v1 benchmark above.

## Limitations and lessons

Future live performance remains unverified by these historical tests. Unusual endgames, upstream corrections, sparse early-season history, and roster changes can weaken estimates. Replay screenshots show the interface only; a production refit is a separate artifact from the evaluated bundle.

Later slates provide more coverage and recovery evidence, but input quality remains a separate requirement. The October 13, 2026 audit captured all checkpoints and ultimately reconciled every final, yet failed after invalid terminal scores reached published predictions. Subsequent fixes require evidence from their own runtime. ESPN prediction fallback remains disabled pending its separate live-validation gates.

Promotion requires at least three operationally passing nights and twenty unique games from those nights under one sealed bundle and runtime. Calibration is checked separately on the first twenty expected games and all 120 checkpoints; later games cannot replace missing or failed evidence in that fixed sample.

An isolated v2 collector archives player box scores, injury reports, schedules, and lineup evidence using receipt-time cutoffs, reproducible exports, and resumable checkpoints. Backfills remain retrospective, unavailable evidence stays unknown, and this work does not establish deployment of a v2 prediction model.

This project has pushed me to spend as much time on game state and collection failures as on the model. A prediction needs the right inputs, and users need to know when the feed has stopped advancing. The source repository remains private.
