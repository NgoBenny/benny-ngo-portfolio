---
title: UFC Win Predictor
subtitle: fight analysis / research platform
summary: A pre-fight prediction platform with chronological features, calibrated models, and a Flask dashboard. A provisional logistic–CatBoost winner blend is tracked separately from archived benchmarks and experimental finish forecasts.
order: 3
category: Applied machine learning
period: July 2026 — Present
technologies: [Python, Flask, scikit-learn, XGBoost, CatBoost, Docker]
thumbnail: ../../assets/ufc.png
thumbnailAlt: UFC prediction dashboard in its bone and burgundy theme, with event selection, fighter search, matchup controls, and a loaded fight card.
caption: An application screenshot showing the event and fighter-analysis interface. Displayed forecasts are research outputs; they are not evidence of future predictive performance.
sourceVisibility: private
highlights:
  - value: "0.683"
    label: Archived baseline ROC-AUC
  - value: "496"
    label: Retrospective baseline bouts
  - value: "0.056"
    label: Archived baseline ECE
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

This project estimates UFC win probabilities and makes matchup information inspectable through a Flask dashboard and JSON API. My work connects cached data ingestion, chronological feature construction, model comparison, versioned bundles, and the application interface. The modeling workflow compares calibrated logistic regression, XGBoost, and CatBoost candidates, with separate evaluation and promotion decisions.

## Engineering decisions

### Freeze features before each event

Using a fighter’s current record to predict an old bout would quietly reveal information from the future. The modeling pipeline constructs features chronologically and freezes them before each event. Training and evaluation therefore use the information available at the point an estimate could have been made.

Cached, resumable ingestion makes repeated research runs practical. Ambiguous external-history identities are quarantined for review instead of being joined by a loose name match. This prevents one apparently convenient merge from changing the history of the wrong fighter.

### Calibrate and version the model

A model can rank fighters reasonably while expressing too much confidence. Calibration is a separate part of the workflow, and candidate selection uses documented gates. Bundles include the model’s schema and source cutoff so an evaluation can be tied to a specific artifact.

The documented active local winner model is provisional version **`d070d9928e1f`**: a fixed blend of 75% calibrated prior logistic probabilities and 25% calibrated CatBoost probabilities. Promotion followed an explicit decision accepting an unresolved age-35+ heavyweight subgroup exception; it does not establish that veteran bias is solved. Method and round estimators and their experimental gates remain unchanged. The application continues to separate the independent estimate, external-history experiments, and market-aware research.

Promotion checks fitted-component identity and cold-load probability equivalence, preserves current serving metadata, and saves the bundle atomically with a rollback receipt. Rollback restores the earlier winner components while retaining subsequent valid card, odds, and fighter-state refreshes. Publishing repository code alone does not deploy the trained bundle.

### Connect research to an inspectable interface

The dashboard provides event-card navigation, fighter search, and matchup analysis. A JSON API connects the displayed state to the data and models. Automated validation accompanies ingestion and evaluation, and a small offline fixture can demonstrate the mechanics without relying on live source availability.

That fixture is intentionally small and includes fictional examples. Its outputs verify the pipeline; they do not establish predictive quality. Keeping those uses distinct is part of making the application understandable.

Dashboard fixes guard against stale search responses, handle panels opened during initial loading, and attribute headline metrics to the appropriate model version. Documented browser checks exercised card selections, fighter dossiers, hypothetical matchups, audit filters, and mobile layout; these checks cover observed flows rather than guaranteeing an error-free application.

## Results and evaluation

The archived logistic baseline **`77cbd074a6f5`**, using schema 21 and an August 29, 2026 source cutoff, reports **0.68320 ROC-AUC**, **0.22493 Brier score**, and **0.05635 expected calibration error** over **496 retrospectively inspected bouts** from September 6, 2025 through August 29, 2026. These values describe that baseline, not the newly active provisional blend.

ROC-AUC describes how well the model ranks winners above losers across classification thresholds; it is not a percentage accuracy claim. Brier score measures probability error, while calibration error compares forecast confidence with observed outcomes. The calibration result is approximately 5.6 percentage points.

The model card identifies this period as a **retrospective benchmark**, because the results have been inspected. These values are not a new untouched test or prospective live result. They differ from the earlier 492-bout figures in my resume, so this case study reports the artifact and context explicitly.

Earlier-fold validation of the fixed blend covered **1,107 unique bouts** across four chronological folds. Pooled log loss decreased from **0.65609 to 0.65408**, with an event-bootstrap 95% paired-difference interval of **−0.00413 to −0.00014**. These are historical development results, not prospective confirmation. One supported subgroup—38 heavyweight bouts involving a fighter aged 35+ against a younger opponent—exceeded the predetermined log-loss deterioration margin. The validation report initially retained the blend as a shadow; the later promotion review records the explicit exception and provisional promotion.

## Limitations and lessons

The audit identified uneven behavior for some veteran-fighter groups, calibration weaknesses, and less reliable finish forecasts. External-history and finish-model candidates require separate evidence and promotion gates. Source availability and incomplete fighter records also affect coverage.

Fresh paired-fight confirmation remains pending against the existing 100-resolved-bout, eight-event target. Displayed stability intervals capture logistic refit variation and exclude CatBoost fitting uncertainty. The initial full-card request took approximately 32 seconds on the documented machine; loading latency remains a limitation.

The value of this project is the complete research-to-application workflow and the ability to inspect its limitations. Model probabilities are uncertain research estimates, not betting advice. Building the platform reinforced that honest evaluation, identity handling, and reproducibility belong in the product alongside its predictions. The source remains private; this page presents the architecture and documented results.
