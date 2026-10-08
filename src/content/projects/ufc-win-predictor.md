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

For an old fight, the model needs the information available before that fight. It also needs to match the right fighter records. I built the pipeline and dashboard around those constraints, with labels that distinguish evaluated model outputs from experimental forecasts.

The app estimates UFC win probabilities and lets users explore matchups through a Flask dashboard and JSON API. I worked on cached ingestion, chronological features, model comparisons, versioned bundles, and the interface. The modeling workflow compares calibrated logistic regression, XGBoost, and CatBoost candidates; evaluation and promotion are separate decisions.

## Engineering decisions

### Freeze features before each event

Using a fighter’s current record to predict an old bout would leak future results into the inputs. The pipeline builds features chronologically and freezes them before each event, so training and evaluation use only information available at that point.

Ingestion caches data and resumes interrupted runs. Ambiguous fighter identities from external histories go into quarantine for review. A loose name match can attach another fighter’s history to the wrong person.

### Calibrate and version the model

A model can rank fighters reasonably and still be overconfident. I evaluate calibration separately and use documented criteria to select candidates. Each bundle records its schema and source cutoff so the results identify the model that produced them.

The documented active local winner model is provisional version `d070d9928e1f`. It blends 75% calibrated prior logistic probabilities with 25% calibrated CatBoost probabilities. The promotion decision explicitly accepted an unresolved exception for the age-35+ heavyweight subgroup. Veteran bias remains unresolved, and method and round estimators keep their existing experimental gates. The app shows the independent estimate separately from external-history experiments and market-aware research.

Promotion checks fitted-component identity and cold-load probability equivalence, preserves current serving metadata, and saves the bundle atomically with a rollback receipt. Rollback restores the earlier winner components while retaining subsequent valid card, odds, and fighter-state refreshes. Publishing repository code alone does not deploy the trained bundle.

### Show the model’s limits in the interface

Users can browse event cards, search for fighters, and compare matchups. A JSON API supplies the dashboard with data and model outputs. Automated checks cover ingestion and evaluation. A small offline fixture makes it possible to run a demo when live sources are unavailable.

The fixture contains fictional examples and verifies the pipeline mechanics. It cannot establish predictive quality.

Search requests guard against stale responses. Panels opened during initial loading populate once initialization finishes, and headline metrics identify their model version. The documented browser checks exercised card selections, fighter dossiers, hypothetical matchups, audit filters, and mobile layout. They cover those flows, with other bugs still possible.

## Results and evaluation

The archived logistic baseline `77cbd074a6f5` uses schema 21 and an August 29, 2026 source cutoff. It reports 0.68320 ROC-AUC, 0.22493 Brier score, and 0.05635 expected calibration error over 496 retrospectively inspected bouts from September 6, 2025 through August 29, 2026. These are the baseline’s scores; the newly active provisional blend has separate results.

ROC-AUC describes how well the model ranks winners above losers across classification thresholds; it is not a percentage accuracy claim. Brier score measures probability error, while calibration error compares forecast confidence with observed outcomes. The calibration result is approximately 5.6 percentage points.

The results for this period have already been inspected, so the model card labels it a retrospective benchmark. It is neither an untouched test nor a prospective live result. The 496-bout benchmark also differs from the earlier 492-bout figures in my resume.

Earlier-fold validation of the fixed blend covered 1,107 unique bouts across four chronological folds. Pooled log loss decreased from 0.65609 to 0.65408, with an event-bootstrap 95% paired-difference interval of −0.00413 to −0.00014. This was historical development, with prospective confirmation still pending. In 38 heavyweight bouts involving a fighter aged 35+ against a younger opponent, the blend exceeded the predetermined log-loss deterioration margin. The validation report initially kept it as a shadow candidate. The later promotion review records the explicitly accepted exception and provisional promotion.

## Limitations and lessons

The audit identified uneven behavior for some veteran-fighter groups, calibration weaknesses, and less reliable finish forecasts. External-history and finish-model candidates require separate evidence and promotion gates. Source availability and incomplete fighter records also affect coverage.

Fresh paired-fight confirmation remains pending against the existing 100-resolved-bout, eight-event target. Displayed stability intervals capture logistic refit variation and exclude CatBoost fitting uncertainty. The initial full-card request took approximately 32 seconds on the documented machine; loading latency remains a limitation.

Working on the app has made fighter identity and reproducible evaluation recurring parts of the modeling work. Its probabilities remain uncertain research estimates and should not be treated as betting advice. The source remains private.
