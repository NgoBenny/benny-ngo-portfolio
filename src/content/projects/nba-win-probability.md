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
    label: Held-out Brier score
  - value: "627,786"
    label: Test snapshots
  - value: "1,310"
    label: Held-out games
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

## Results and evaluation

The historical pipeline covers 6,562 games, split chronologically into fitting, calibration/validation, and testing periods. The frozen evaluation for model version 20260801T225614Z contains 1,310 held-out games and 627,786 snapshots, from October 21, 2025 through June 13, 2026.

The selected situational logistic model reports a 0.14794 Brier score and 0.01367 expected calibration error, rounded to 0.148 and 0.014. Brier score measures the squared error of probability estimates; lower is better. Calibration checks whether events given similar probabilities occur at roughly that frequency. Snapshots within a game are correlated observations, not independent games.

The dashboard supports multiple games, probability traces, stale/reconnect states, and action replay. Completed live-shadow games remain selectable after slate rollover and support playback of recorded predictions. Evaluation history is grouped by night, sealed bundle, and runtime identity; missing evidence remains unavailable. On-demand box scores use a separate cache and request budget and are hidden during recorded replay.

Offline regression checks cover archive replay, evaluation history, stale content, failure handling, and box-score isolation. CI runs all dashboard regression suites. Live operational acceptance requires separate evidence.

## Limitations and lessons

Future live performance remains unverified by these historical tests. Unusual endgames, upstream corrections, sparse early-season history, and roster changes can weaken estimates. Replay screenshots show the interface only; a production refit is a separate artifact from the evaluated bundle.

Neither October 3 nor October 4, 2026 counted as a passing promotion night. October 4 met opening, closing, and checkpoint coverage checks, but runtime-specific acceptance failed other gates. The recovery and stoppage-aware freshness changes still need live validation. Promotion requires at least three passing nights and twenty unique completed games.

An isolated v2 collector archives player box scores, injury reports, schedules, and lineup evidence using receipt-time cutoffs, reproducible exports, and resumable checkpoints. Backfills remain retrospective, unavailable evidence stays unknown, and this work does not establish deployment of a v2 prediction model.

This project has pushed me to spend as much time on game state and collection failures as on the model. A prediction needs the right inputs, and users need to know when the feed has stopped advancing. The source repository remains private.
