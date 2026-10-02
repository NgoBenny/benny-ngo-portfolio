---
title: UFC Win Predictor
subtitle: fight analysis / research platform
summary: A pre-fight prediction platform with chronological features, calibrated models, and a Flask dashboard. Versioned evaluation keeps the independent model’s evidence separate from experimental forecasts.
order: 3
category: Applied machine learning
period: July 2026 — Present
technologies: [Python, Flask, scikit-learn, XGBoost, Docker]
thumbnail: ../../assets/ufc.png
thumbnailAlt: UFC prediction dashboard in its bone and burgundy theme, with event selection, fighter search, matchup controls, and a loaded fight card.
caption: An application screenshot showing the event and fighter-analysis interface. Displayed forecasts are research outputs; they are not evidence of future predictive performance.
sourceVisibility: private
highlights:
  - value: "0.683"
    label: Retrospective ROC-AUC
  - value: "496"
    label: Benchmark bouts
  - value: "0.056"
    label: Benchmark calibration error
architecture:
  - title: Ingestion
    detail: Cached fight history
  - title: Features
    detail: Freeze before each fight
  - title: Models
    detail: Calibration + selection
  - title: Application
    detail: Flask API + dashboard
---

## The problem

Pre-fight prediction needs more than a classifier and a table of fighter statistics. Historical features must reflect what was known before the fight, fighter identities must be consistent, and the interface needs to distinguish measured model behavior from experimental forecasts.

This project estimates UFC win probabilities and makes matchup information inspectable through a Flask dashboard and JSON API. My work connects cached data ingestion, chronological feature construction, model comparison, versioned bundles, and the application interface. The pipeline compares calibrated logistic regression and XGBoost candidates rather than assuming a more complex model is necessarily better.

## Engineering decisions

### Freeze features before each event

Using a fighter’s current record to predict an old bout would quietly reveal information from the future. The modeling pipeline constructs features chronologically and freezes them before each event. Training and evaluation therefore use the information available at the point an estimate could have been made.

Cached, resumable ingestion makes repeated research runs practical. Ambiguous external-history identities are quarantined for review instead of being joined by a loose name match. This prevents one apparently convenient merge from changing the history of the wrong fighter.

### Calibrate and version the model

A model can rank fighters reasonably while expressing too much confidence. Calibration is a separate part of the workflow, and candidate selection uses documented gates. Bundles include the model’s schema and source cutoff so an evaluation can be tied to a specific artifact.

The inspected independent model is logistic regression, even though XGBoost is part of the comparison pipeline. The application separates the independent estimate, external-history experiments, and market-aware research. Passing a retrospective comparison does not automatically promote a challenger into the active model.

### Connect research to an inspectable interface

The dashboard provides event-card navigation, fighter search, and matchup analysis. A JSON API connects the displayed state to the data and models. Automated validation accompanies ingestion and evaluation, and a small offline fixture can demonstrate the mechanics without relying on live source availability.

That fixture is intentionally small and includes fictional examples. Its outputs verify the pipeline; they do not establish predictive quality. Keeping those uses distinct is part of making the application understandable.

## Results and evaluation

The inspected **77cbd074a6f5** bundle uses schema 21 with a source cutoff of August 29, 2026. Its selected independent estimate reports **0.68320 ROC-AUC**, **0.22493 Brier score**, and **0.05635 expected calibration error** over **496 bouts** in the September 6, 2025–August 29, 2026 benchmark.

ROC-AUC describes how well the model ranks winners above losers across classification thresholds; it is not a percentage accuracy claim. Brier score measures probability error, while calibration error compares forecast confidence with observed outcomes. The calibration result is approximately 5.6 percentage points.

The model card identifies this period as a **retrospective benchmark**, because the results have been inspected. These values are not a new untouched test or prospective live result. They differ from the earlier 492-bout figures in my resume, so this case study reports the artifact and context explicitly.

## Limitations and lessons

The audit identified uneven behavior for some veteran-fighter groups, calibration weaknesses, and less reliable finish forecasts. External-history and finish-model candidates require separate evidence and promotion gates. Source availability and incomplete fighter records also affect coverage.

The value of this project is the complete research-to-application workflow and the ability to inspect its limitations. Model probabilities are uncertain research estimates, not betting advice. Building the platform reinforced that honest evaluation, identity handling, and reproducibility belong in the product alongside its predictions. The source remains private; this page presents the architecture and documented results.
