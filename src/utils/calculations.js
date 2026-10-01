export function calculateDailyKwh(watts, quantity, hoursPerDay) {
  const power = Number(watts) || 0;
  const count = Number(quantity) || 0;
  const usageHours = Number(hoursPerDay) || 0;

  return (power * count * usageHours) / 1000;
}

export function calculateMonthlyKwh(dailyKwh) {
  return (Number(dailyKwh) || 0) * 30;
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
  const safeTarget = Number(targetUnits) || 0;
  const protectedItems = items.filter((item) => item.essential || isProtectedAppliance(item.name));
  const adjustableItems = items
    .filter((item) => !item.essential && !isProtectedAppliance(item.name))
    .map((item) => ({
      ...item,
      dailyKwh: calculateDailyKwh(item.watts, item.quantity, item.hoursPerDay),
    }))
    .filter((item) => item.dailyKwh > 0)
    .sort((a, b) => b.dailyKwh - a.dailyKwh);

  const targetDailyReduction = safeTarget / 30;
  let remainingReduction = targetDailyReduction;
  const actions = [];

  for (const item of adjustableItems) {
    if (remainingReduction <= 0.05) break;

    const maxReduction = Math.min(item.dailyKwh * 0.45, remainingReduction);
    if (maxReduction <= 0.05) continue;

    const reductionMinutes = Math.min(
      item.hoursPerDay * 60,
      Math.max(15, (maxReduction / item.dailyKwh) * item.hoursPerDay * 60),
    );

    const reductionKwh = calculateDailyKwh(item.watts, item.quantity, reductionMinutes / 60);
    const safeReduction = Math.min(maxReduction, reductionKwh);

    if (safeReduction <= 0.05) continue;

    actions.push({
      name: item.name,
      reductionKwh: Number(safeReduction.toFixed(2)),
      minutes: Math.round(reductionMinutes),
      quantity: item.quantity,
      totalDailyKwh: item.dailyKwh,
    });

    remainingReduction = Number((remainingReduction - safeReduction).toFixed(3));
  }

  const summary =
    actions.length > 0
      ? `Target met with a conservative reduction plan built only from adjustable loads.`
      : 'No meaningful reduction was found without touching protected essentials.';

  return {
    protectedItems,
    actions,
    targetMonthlyUnits: safeTarget,
    targetDailyReduction: Number(targetDailyReduction.toFixed(2)),
    summary,
  };
}
