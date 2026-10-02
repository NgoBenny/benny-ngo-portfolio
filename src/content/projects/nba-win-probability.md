---
title: Live NBA Win Probability
subtitle: baseline. / NBA live analytics
summary: An end-to-end system that turns NBA play-by-play into live win probabilities. A shared inference pipeline powers a multi-game dashboard, historical replay, and reliable game-state updates.
order: 1
category: Real-time systems / Machine learning
period: June 2026 — Present
technologies: [Python, Flask, WebSockets, scikit-learn, SQLite]
thumbnail: ../../assets/nba.jpg
thumbnailAlt: NBA dashboard showing a replay, two teams’ scores, win probabilities, and a probability trace.
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

My work spans the data pipeline, modeling and evaluation workflow, Flask API, and real-time interface. The system ingests historical and live NBA data, turns actions into consistent game states, computes features, and publishes model estimates. Historical replay uses the same processing path as live inference, making it possible to inspect behavior without waiting for a game to be underway.

## Engineering decisions

### Rebuild state when the feed changes

A live sports feed is not an append-only log. Plays can arrive twice or be corrected after later actions have been published. Treating every response as new data can double-count events or leave the clock, possession, and score inconsistent.

The adapters translate upstream responses into a canonical action representation. Stable-key reconciliation detects duplicates and edited actions, and a state rebuild applies the corrected history. This makes repeated polls idempotent and keeps downstream features aligned with the latest confirmed game state.

### Keep training and serving on the same path

Historical training, replay, and live inference share a versioned feature transformer. Pregame information is computed chronologically, so an estimate does not use results that were unavailable at that moment. Persisted team-strength and recent-form state supplies live inference with the same kind of context used during training.

Model bundles carry feature-schema information. Loading checks compatibility before accepting the bundle, rather than allowing a changed feature order to produce plausible-looking but incorrect predictions.

### Separate polling from the browser

A dedicated worker discovers games and polls upstream sources. It publishes snapshots through a shared SQLite broker; Flask and WebSocket clients consume those snapshots. Opening more dashboards therefore does not create more NBA polling loops. A renewable lease prevents duplicate workers on one host. This is a practical single-host design; a distributed broker would be appropriate if the application needed multiple hosts.

## Results and evaluation

The historical pipeline covers **6,562 games**, split chronologically into fitting, calibration/validation, and testing periods. The frozen evaluation for model version **20260801T225614Z** contains **1,310 held-out games and 627,786 snapshots**, from October 21, 2025 through June 13, 2026.

The selected situational logistic model reports a **0.14794 Brier score** and **0.01367 expected calibration error**, rounded to 0.148 and 0.014. Brier score measures the squared error of probability estimates; lower is better. Calibration checks whether events given similar probabilities occur at roughly that frequency. Snapshots within a game are correlated observations, not independent games.

The dashboard supports multiple games, probability traces, stale/reconnect states, and replay with pause, speed, and seek controls. Automated unit, integration, and API-contract checks accompany the pipeline, along with model compatibility and promotion checks.

## Limitations and lessons

These are historical test results, not proof of future live performance. Unusual endgames, upstream corrections, sparse early-season history, and roster changes can weaken estimates. Replay screenshots do not establish production readiness, and a production refit is a separate artifact from the evaluated bundle.

The central lesson is that a useful ML application depends on consistent state and reproducible evaluation as much as its estimator. Correcting a play, recovering a connection, and explaining uncertainty are part of the product. The source repository remains private; this case study presents the system and its measured evaluation.
