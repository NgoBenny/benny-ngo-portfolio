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

A basketball score tells you who is ahead, but not how likely that lead is to hold. The same five-point advantage can mean something very different in the first quarter and the final minute. This project brings that context into a browser dashboard: a win estimate after each confirmed play, a trace of how the game has changed, and controls for exploring historical games.

My work spans the data pipeline, modeling and evaluation workflow, Flask API, and real-time interface. The system ingests historical and live NBA data, turns actions into consistent game states, computes features, and publishes model estimates. Historical action replay uses the live processing path. A separate recorded replay plays back saved live-shadow prediction snapshots, preserving collection gaps rather than reconstructing missing predictions.

## Engineering decisions

### Rebuild state when the feed changes

A live sports feed is not an append-only log. Plays can arrive twice or be corrected after later actions have been published. Treating every response as new data can double-count events or leave the clock, possession, and score inconsistent.

The adapters translate upstream responses into a canonical action representation. Stable-key reconciliation detects duplicates and edited actions, and a state rebuild applies the corrected history. This makes repeated polls idempotent and keeps downstream features aligned with the latest confirmed game state.

### Keep training and serving on the same path

Historical training, replay, and live inference share a versioned feature transformer. Pregame information is computed chronologically, so an estimate does not use results that were unavailable at that moment. Persisted team-strength and recent-form state supplies live inference with the same kind of context used during training.

Model bundles carry feature-schema information. Loading checks compatibility before accepting the bundle, rather than allowing a changed feature order to produce plausible-looking but incorrect predictions.

### Separate polling from the browser

A dedicated worker discovers games and polls upstream sources. It publishes snapshots through a shared SQLite broker; Flask and WebSocket clients consume those snapshots. Opening more dashboards therefore does not create more NBA polling loops. A renewable lease prevents duplicate workers on one host. This is a practical single-host design; a distributed broker would be appropriate if the application needed multiple hosts.

Scoreboard discovery and per-game play-by-play polling recover independently through bounded endpoint cooldowns and fresh-session retries. Successful duplicate responses do not refresh the age of unchanged play content. Persisted content hashes and first-observed timestamps retain freshness information across restarts, while filesystem status-write failures are reported separately from upstream errors.

## Results and evaluation

The historical pipeline covers **6,562 games**, split chronologically into fitting, calibration/validation, and testing periods. The frozen evaluation for model version **20260801T225614Z** contains **1,310 held-out games and 627,786 snapshots**, from October 21, 2025 through June 13, 2026.

The selected situational logistic model reports a **0.14794 Brier score** and **0.01367 expected calibration error**, rounded to 0.148 and 0.014. Brier score measures the squared error of probability estimates; lower is better. Calibration checks whether events given similar probabilities occur at roughly that frequency. Snapshots within a game are correlated observations, not independent games.

The dashboard supports multiple games, probability traces, stale/reconnect states, and action replay. Completed live-shadow games remain selectable after slate rollover and support playback of recorded predictions. Evaluation history is grouped by night, sealed bundle, and runtime identity; missing evidence remains unavailable. On-demand box scores use a separate cache and request budget and are hidden during recorded replay.

Offline regression checks cover archive replay, evaluation history, stale content, failure handling, and box-score isolation. CI runs all dashboard regression suites. These checks establish tested behavior, not live operational acceptance.

## Limitations and lessons

These are historical test results, not proof of future live performance. Unusual endgames, upstream corrections, sparse early-season history, and roster changes can weaken estimates. Replay screenshots do not establish production readiness, and a production refit is a separate artifact from the evaluated bundle.

October 3 and 4, 2026 provided incident and rehearsal evidence, not passing promotion nights. October 4 met opening, closing, and checkpoint coverage checks, but runtime-specific acceptance still failed other gates. Recovery and stoppage-aware freshness changes require further live validation; promotion remains contingent on at least three passing nights and twenty unique completed games.

An isolated v2 collector archives player box scores, injury reports, schedules, and lineup evidence using receipt-time cutoffs, reproducible exports, and resumable checkpoints. Backfills remain retrospective, unavailable evidence stays unknown, and this work does not establish deployment of a v2 prediction model.

The central lesson is that a useful ML application depends on consistent state and reproducible evaluation as much as its estimator. Correcting a play, recovering a connection, and explaining uncertainty are part of the product. The source repository remains private; this case study presents the system and its measured evaluation.
