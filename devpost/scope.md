---
doc: scope
status: approved
product: BijliBachat
---

# BijliBachat Scope

## Product Goal

BijliBachat is a single-page household electricity dashboard that helps a user estimate appliance energy use, understand the largest contributors, and create a practical reduction plan without recommending cuts to essential loads.

## MVP Scope

- Provide a responsive dashboard for one household in one browser session.
- Let users add common appliances from presets or enter a custom appliance's name, quantity, rated watts, and usage pattern.
- Support daily hours, cycles per week with hours per cycle, and estimated duty-cycle usage.
- Calculate daily and 30-day energy use per appliance and household totals.
- Show a ranked monthly usage breakdown, estimated energy charge using an editable INR-per-kWh rate, and an appliance list.
- Let users mark or unmark custom loads as essential and remove appliances.
- Accept a monthly kWh reduction goal and generate proportional usage recommendations for adjustable loads.
- Protect user-marked essentials and built-in protected appliance name matches from optimizer reductions.
- Show the requested goal, planned units, estimated rupee savings, protected loads, and appliance-specific actions and habits.

## Boundaries and Non-goals

- The product is an educational planning estimate, not a utility bill, audit, or measurement of actual consumption.
- It does not connect to smart meters, utility accounts, appliance APIs, or external tariff data.
- It does not include accounts, cloud storage, household sharing, historical tracking, notifications, or an administration interface. Appliance data is held in client-side application state and is not persisted across reloads.
- It does not control appliances, schedule devices, or guarantee that a savings goal will be achieved.
- The INR estimate covers modeled energy charges only; fixed fees, taxes, tiered pricing, time-of-use rates, and other bill adjustments are not modeled.
- Optimization is a heuristic: reductions are distributed proportionally across eligible loads and capped at 45% of modeled runtime. It is not a tariff-aware optimizer or a personalized engineering assessment.
- The MVP focuses on a single household dashboard, not a multi-page onboarding flow or a mobile-native application.

## Assumptions

- Users can provide reasonable estimates of appliance wattage and use; actual draw can vary by device and operating conditions.
- One energy unit is treated as one kilowatt-hour (kWh), and a month is modeled as 30 days.
- The default tariff is an editable estimate of INR 8 per kWh; users should replace it with a suitable energy rate for their context.
- Fan, light, bulb, and refrigerator name matches are protected by the optimizer in addition to loads the user explicitly marks essential.

## Success Criteria

- A user can add preset and custom appliances and see the list and totals update immediately.
- Daily and 30-day kWh calculations follow the entered power, quantity, and usage pattern.
- A user can create a reduction plan that clearly separates protected loads from adjustable loads and never proposes reducing a protected load.
- The dashboard communicates that units, costs, and savings are estimates and does not imply that the target is guaranteed.
- The production build completes and the primary flow can be exercised in a browser without runtime errors.