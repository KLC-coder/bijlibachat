---
doc: spec
status: approved
product: BijliBachat
---

# BijliBachat Technical Specification

## Technical Blueprint

- **Client:** React single-page application built with Vite.
- **Runtime model:** All appliance, form, tariff, target, and generated-plan state lives in the browser's React state. There is no API, database, authentication, or persistence layer.
- **Calculation boundary:** Pure energy and optimization helpers live in `src/utils/calculations.js`; appliance defaults live in `src/data/appliancePresets.js`; `src/App.jsx` owns the dashboard state and connects calculations to the UI.
- **Presentation:** `src/App.jsx` renders the dashboard and `src/App.css` / `src/index.css` provide application and global styling.
- **Currency and locale:** Format modeled charges as INR using `Intl.NumberFormat` with the `en-IN` locale.

## Data Model

An appliance record contains:

| Field | Meaning |
| --- | --- |
| `id` | Client-generated identity for list and plan rendering |
| `name` | User-facing appliance name |
| `quantity` | Number of appliances represented |
| `watts` | Rated power per appliance in watts |
| `usageMode` | `daily`, `cycles`, or `duty-cycle` |
| `hoursPerDay` | Typical hours per day for `daily` mode |
| `cyclesPerWeek` | Typical weekly cycles for `cycles` mode |
| `hoursPerCycle` | Typical hours per cycle for `cycles` mode |
| `dutyCyclePercent` | Estimated active share of a 24-hour day for `duty-cycle` mode |
| `essential` | User-selected protection flag |

Derived appliance rows add `dailyKwh`, `monthlyKwh`, and `averageDailyHours`. Dashboard state also includes the editable tariff rate, requested monthly target, and the most recently generated plan.

## Calculation Architecture

Inputs are coerced to numbers and invalid/missing numeric values default to zero inside calculation helpers. Form submission separately rejects blank names and non-positive quantity, wattage, or relevant usage values. Daily hour input is limited to 24; hours per cycle are limited to 24. Average cycle usage is capped at 24 hours per day.

Let $W$ be watts per appliance, $Q$ quantity, and $H$ modeled average hours per day:

$$
E_{daily} = \frac{W \times Q \times H}{1000} \quad \text{kWh/day}
$$

Usage hours are derived by mode:

- **Daily:** $H = \min(24, \max(0, hoursPerDay))$.
- **Cycles:** $H = \min(24, (cyclesPerWeek \times hoursPerCycle) / 7)$.
- **Duty cycle:** $H = 24 \times clamp(dutyCyclePercent, 0, 100) / 100$.

For a 30-day modeled month and tariff $R$ INR/kWh:

$$
E_{monthly} = E_{daily} \times 30
$$

$$
Bill_{estimate} = \sum E_{monthly} \times \max(0, R)
$$

### Protected Loads and Optimizer

An appliance is excluded from optimization if `essential` is true or its lowercased name contains `fan`, `study light`, `light`, `refrigerator`, `fridge`, or `bulb`. The preset set includes AC, geyser, fan, study light, refrigerator, bulb, washing machine, and TV; refrigerator uses duty-cycle mode and washing machine uses cycles mode.

For requested monthly target $T$ kWh, the optimizer calculates daily target $T/30$. It totals modeled daily kWh for non-protected loads and chooses one shared reduction ratio:

$$
r = \begin{cases}
\min((T/30) / E_{adjustable,daily}, 0.45), & E_{adjustable,daily} > 0 \\
0, & \text{otherwise}
\end{cases}
$$

Each eligible appliance receives a modeled daily reduction of $E_{item,daily} \times r$. The action expresses that share in its native usage mode: reduced minutes per day, fewer cycles per week, or reduced duty-cycle percentage points. Recommendations also include a practical habit based on appliance type. Planned monthly units are the sum of action reductions multiplied by 30. Because the ratio is capped, the output can be lower than the requested goal; it is an estimate rather than a guarantee.

## State and Update Behavior

- Adding a preset or valid custom appliance appends a client-generated record and clears the current plan.
- Removing an appliance or toggling its user-selected essential flag updates the list and clears the current plan.
- The generated plan reflects the appliance set and target at the time it was created. The target input itself does not rerun the optimizer until the user creates another plan.
- The tariff is applied when displaying the monthly estimate and plan savings, so changing it updates displayed rupee amounts without rerunning the usage optimizer.
- Reloading the page resets appliance data, form state, target, tariff, and plan to their in-app defaults.

## Important Failure Modes and Constraints

- Empty appliance list: show empty states and zero totals; creating a plan yields no meaningful actions.
- All loads protected or zero modeled adjustable energy: do not recommend reductions to protected loads.
- Goal above available modeled savings or the 45% ratio cap: report the plan's actual modeled units and constraint rather than implying the target is met.
- Missing or invalid form data: do not append an appliance; values must be positive and applicable to the selected usage mode.
- User-entered watts and usage may not match measured consumption. Tariff calculations omit fixed fees, taxes, tiers, and other charges.
- Name-based protection uses substring matching, so a custom name containing a protected term may be protected even if the user did not explicitly mark it essential.

## Verification

- Run `npm run build` to verify the production client bundle.
- Exercise preset and custom appliance entry, all three usage modes, live totals, removal and priority changes, tariff edits, and action-plan generation in the browser.
- For the optimizer, verify that only adjustable loads receive actions, no action exceeds the shared 45% ratio, and protected-only or empty input produces no fabricated savings.