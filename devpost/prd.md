---
doc: prd
status: approved
product: BijliBachat
---

# BijliBachat Product Requirements

## Overview

BijliBachat helps a household estimate its electricity use appliance by appliance and identify practical opportunities to reduce modeled consumption. The primary experience is a compact, single-page dashboard; its output is guidance based on user-entered estimates, not a promise of bill savings.

## Intended User

A household member who wants a quick, understandable estimate of where electricity is used and what flexible usage could be reduced. The user may not have a detailed energy audit, so the product must make assumptions visible and keep entry straightforward.

## The Core Journey

1. The user opens the dashboard and sees the household overview, empty states, and appliance controls.
2. The user adds common devices with quick-add presets or opens the custom appliance form.
3. For a custom device, the user enters its name, quantity, wattage, and one usage pattern: hours per day, cycles per week plus hours per cycle, or percent active in a 24-hour day. The user may mark it essential.
4. The dashboard immediately calculates each device's daily and 30-day kWh, ranks the top usage contributors, and updates household totals and the estimated energy charge.
5. The user reviews and can remove appliances or change a load's user-selected essential status.
6. The user enters a monthly kWh reduction goal and creates an action plan. The dashboard lists protected essentials and practical, device-specific adjustments for eligible loads, together with estimated planned units and rupee savings.

## Dashboard Requirements

- **Household overview:** Display total modeled monthly kWh, daily average kWh, estimated monthly energy charge, and count of protected loads.
- **Usage breakdown:** Rank up to five appliances by modeled monthly kWh and provide a useful empty state before appliances are added.
- **Tariff control:** Allow the user to edit an estimated INR/kWh rate. Recalculate the energy-charge estimate and displayed savings when the rate changes. State that the result excludes other bill charges.
- **Appliance quick add:** Offer presets for AC, geyser, fan, study light, refrigerator, bulb, washing machine, and TV with representative power and usage assumptions.
- **Custom appliance form:** Capture name, positive quantity, positive wattage, a usage mode and its relevant values, and an optional essential flag. Validate entered values and do not add invalid entries.
- **Live appliance list:** Show name, quantity, power, usage pattern, daily kWh, monthly kWh, user-selected priority, and a remove action. Recalculate totals immediately after adding, removing, or changing priority.
- **Reduction planner:** Accept a monthly target in kWh and create an action plan on request. Communicate when the requested target exceeds the achievable modeled plan.
- **Plan details:** Show planned units toward the goal, estimated savings at the current rate, protected loads, and a recommendation per eligible appliance. Recommendations must be actionable and reflect whether usage is hours-based, cycle-based, or duty-cycle-based.
- **Responsive single-page navigation:** Provide links to overview, appliances, and bill optimizer sections, with readable layout on desktop and narrow screens.

## Calculation and Protection Requirements

- Treat 1 kWh as 1 unit and estimate a month as 30 days.
- Convert watts and modeled daily runtime into daily kWh; derive monthly kWh from the daily value.
- Estimate the monthly energy charge as modeled monthly kWh multiplied by the editable INR/kWh rate.
- Never include a user-marked essential or a built-in protected name match in proposed reductions. Built-in matches include fan, study light/light, refrigerator/fridge, and bulb.
- Spread modeled reduction evenly as a proportion across eligible loads, with a maximum 45% reduction ratio. If there is no eligible usage, show that there is no meaningful safe reduction.
- Present calculated costs and savings as estimates. Actual bills and appliance consumption may differ.

## Acceptance Criteria

- Adding a preset or valid custom appliance updates the appliance list and dashboard calculations without a page reload.
- Daily, cycles-per-week, and duty-cycle inputs each produce the corresponding average daily usage and 30-day estimate.
- Removing an appliance or changing its user-selected priority updates totals and invalidates the previously generated plan.
- A generated plan identifies protected loads and only contains actions for eligible adjustable loads.
- When the target exceeds the 45% cap or available adjustable consumption, planned units remain below the target and the UI explains the constraint.
- With no eligible consumption, the UI presents an empty/no-practical-savings outcome rather than inventing actions.
- The user can change the tariff and see the estimate update; no claim suggests the rate is an exact complete bill calculation.

## Out of Scope

Cloud accounts or persistence, utility or smart-meter integrations, real-time monitoring, historical charts, appliance control, tariff lookup, multi-user households, and guaranteed savings are excluded from this MVP. See [scope.md](scope.md) for the approved boundaries.