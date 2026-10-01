---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. App shell and appliance form deliver a working dashboard**
  Becomes usable: The app loads with a premium dashboard, quick-add chips, custom appliance form, and live list state.
  Why now: This proves the main user flow end to end early and gives every later slice a working base.
  PRD ref: `prd.md > The Core Journey` (steps 1-3)
  Spec ref: `spec.md > Components`, `spec.md > File Structure`
  Build: Scaffold the Vite React app, add the premium one-page layout, implement the quick-add controls and custom form, and wire the appliance list to local state.
  Verify (mechanical): `npm run build` completed successfully, and the app rendered in the browser without runtime errors.
  Learner check: Open the app, add a few appliances, and confirm the dashboard feels polished and the data appears immediately.
  Commit: `Create BijliBachat dashboard and appliance form`

- [x] **2. Energy calculations and totals update live**
  Becomes usable: Each appliance shows daily and monthly kWh, and total household load updates immediately.
  Why now: The core value of the product depends on truthful kWh math before any optimization logic is added.
  PRD ref: `prd.md > Live Energy Calculation`
  Spec ref: `spec.md > Data Model`, `spec.md > Components`
  Build: Add calculation helpers for daily kWh and 30-day totals, and connect them to the table and summary cards.
  Verify (mechanical): Run the build and inspect totals after adding appliances.
  Learner check: Add a few sample devices and confirm the displayed totals reflect the numbers you entered.
  Commit: `Add live kWh calculations and totals`

- [x] **3. Bill reduction and protection rules work**
  Becomes usable: The user can enter a target reduction, run optimization, and receive a realistic plan while essential loads remain protected.
  Why now: This is the unique kernel of the app and must appear before any optional polish.
  PRD ref: `prd.md > Bill Reduction Engine`, `prd.md > Essential Protection Rules`, `prd.md > Action Plan Output`
  Spec ref: `spec.md > Components`, `spec.md > Important Failure Modes`
  Build: Add the optimizer logic with protected essentials, adjustable-heavy loads, and daily action-plan generation.
  Verify (mechanical): Enter a realistic target and confirm the action plan only reduces adjustable loads.
  Learner check: Try a target such as 50 units and confirm essential loads remain untouched.
  Commit: `Add reduction engine and safe action plan`

## Hands-on Checkpoints

- [x] Early usable behavior explored — initial dashboard and calculation flow checked in the browser.
- [x] Final kick-the-tires exploration and feedback completed — build verified in a live browser session.

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — the app flow was reviewed in the live code and browser.
- [x] Optional edit and transfer reflection addressed — offered and covered during the build flow.
- [x] `devpost/app-map.html` generated from finished code and checked.

Activity and evidence: Verified via `npm run build`; live app was opened at `http://localhost:5173`; optimization logic was exercised in-browser with a 50 unit target.
Route and stops: App shell → form → appliance table → optimization engine → action plan.
Edit outcome: Kept the implemented app and final design as built.
Reflection: Covered during the build through the key flow of calculating load, protecting essentials, and generating daily reductions.
Activity mode: live app and editor.

## Revisions

- [Updated the core app shape to a premium single-page dashboard to match the PRD and product brief] — the plan discovered that a compact dashboard with visible totals and action-plan output was the clearest proof of concept.
