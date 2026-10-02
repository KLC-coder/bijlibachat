export function calculateDailyKwh(watts, quantity, hoursPerDay) {
  const power = Number(watts) || 0;
  const count = Number(quantity) || 0;
  const usageHours = Number(hoursPerDay) || 0;

  return (power * count * usageHours) / 1000;
}

export function calculateMonthlyKwh(dailyKwh) {
  return (Number(dailyKwh) || 0) * 30;
}

export function getDailyUsageHours(item) {
  if (item.usageMode === 'cycles') {
    const cyclesPerWeek = Math.max(0, Number(item.cyclesPerWeek) || 0);
    const hoursPerCycle = Math.max(0, Number(item.hoursPerCycle) || 0);
    return Math.min(24, (cyclesPerWeek * hoursPerCycle) / 7);
  }

  if (item.usageMode === 'duty-cycle') {
    const dutyCyclePercent = Math.min(100, Math.max(0, Number(item.dutyCyclePercent) || 0));
    return (dutyCyclePercent / 100) * 24;
  }

  return Math.min(24, Math.max(0, Number(item.hoursPerDay) || 0));
}

export function calculateApplianceDailyKwh(item) {
  return calculateDailyKwh(item.watts, item.quantity, getDailyUsageHours(item));
}

export function isProtectedAppliance(name) {
  const normalized = String(name || '').toLowerCase();

  return (
    normalized.includes('fan') ||
    normalized.includes('study light') ||
    normalized.includes('light') ||
    normalized.includes('refrigerator') ||
    normalized.includes('fridge') ||
    normalized.includes('bulb')
  );
}

export function generateOptimizationPlan(items, targetUnits) {
  const safeTarget = Math.max(0, Number(targetUnits) || 0);
  const protectedItems = items.filter((item) => item.essential || isProtectedAppliance(item.name));
  const adjustableItems = items
    .filter((item) => !item.essential && !isProtectedAppliance(item.name))
    .map((item) => ({
      ...item,
      dailyKwh: calculateApplianceDailyKwh(item),
    }))
    .filter((item) => item.dailyKwh > 0);

  const targetDailyReduction = safeTarget / 30;
  const totalAdjustableKwh = adjustableItems.reduce((total, item) => total + item.dailyKwh, 0);
  const reductionRatio = totalAdjustableKwh > 0 && targetDailyReduction > 0
    ? Math.min(targetDailyReduction / totalAdjustableKwh, 0.45)
    : 0;
  const actions = reductionRatio > 0 ? adjustableItems.map((item, index) => {
    const dailyUsageHours = getDailyUsageHours(item);
    const reductionMinutes = Number((dailyUsageHours * 60 * reductionRatio).toFixed(1));
    const reductionKwh = item.dailyKwh * reductionRatio;
    const cyclesPerWeekReduction = item.usageMode === 'cycles'
      ? item.cyclesPerWeek * reductionRatio
      : 0;
    const dutyCyclePointReduction = item.usageMode === 'duty-cycle'
      ? item.dutyCyclePercent * reductionRatio
      : 0;
    const name = String(item.name || '').toLowerCase();
    const reductionDuration = reductionMinutes < 1
      ? `${Math.max(1, Math.round(reductionMinutes * 60))} seconds`
      : `${Math.round(reductionMinutes)} minutes`;
    const recommendation = item.usageMode === 'cycles'
      ? cyclesPerWeekReduction < 1
        ? `Skip one cycle about every ${(1 / cyclesPerWeekReduction).toFixed(1)} weeks.`
        : `Reduce use by about ${cyclesPerWeekReduction.toFixed(1)} cycles per week.`
      : item.usageMode === 'duty-cycle'
        ? `Reduce estimated active use by ${reductionDuration} per day (about ${dutyCyclePointReduction.toFixed(1)} percentage points lower).`
        : `Reduce runtime by ${reductionDuration} per day.`;
    const habit = name.includes('wash')
      ? 'Run full loads and shift flexible cycles to off-peak times if your tariff offers them.'
      : name === 'ac' || name.includes('air conditioner')
        ? 'Use a slightly higher temperature setting and clean filters regularly; avoid peak periods when practical.'
        : name.includes('geyser') || name.includes('water heater')
          ? 'Heat water only when needed and use a timer; shift heating off-peak if your tariff offers it.'
          : 'Switch it off when not in use and shift flexible use off-peak if your tariff offers it.';

    return {
      id: item.id ?? `action-${index}`,
      name: item.name,
      reductionKwh: Number(reductionKwh.toFixed(4)),
      minutes: reductionMinutes,
      cyclesPerWeekReduction: Number(cyclesPerWeekReduction.toFixed(3)),
      dutyCyclePointReduction: Number(dutyCyclePointReduction.toFixed(2)),
      usageMode: item.usageMode || 'daily',
      recommendation,
      habit,
      quantity: item.quantity,
      totalDailyKwh: item.dailyKwh,
    };
  }) : [];

  const plannedMonthlyUnits = actions.reduce(
    (total, action) => total + action.reductionKwh * 30,
    0,
  );

  const summary =
    actions.length > 0
      ? reductionRatio < targetDailyReduction / totalAdjustableKwh
        ? 'Savings are spread across adjustable loads, but the target exceeds the 45% runtime limit.'
        : 'Savings are spread across all adjustable loads while essentials stay protected.'
      : 'No meaningful reduction was found without touching protected essentials.';

  return {
    protectedItems,
    actions,
    plannedMonthlyUnits: Number(plannedMonthlyUnits.toFixed(2)),
    targetMonthlyUnits: safeTarget,
    targetDailyReduction: Number(targetDailyReduction.toFixed(2)),
    summary,
  };
}
