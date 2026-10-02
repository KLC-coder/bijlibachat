export const appliancePresets = [
  { name: 'AC', watts: 1500, hoursPerDay: 8, essential: false, category: 'heavy' },
  { name: 'Geyser', watts: 2000, hoursPerDay: 1, essential: false, category: 'heavy' },
  { name: 'Fan', watts: 60, hoursPerDay: 12, essential: true, category: 'essential' },
  { name: 'Study Light', watts: 20, hoursPerDay: 6, essential: true, category: 'essential' },
  { name: 'Refrigerator', watts: 150, usageMode: 'duty-cycle', dutyCyclePercent: 40, essential: true, category: 'essential' },
  { name: 'Bulb', watts: 10, hoursPerDay: 6, essential: false, category: 'light' },
  { name: 'Washing Machine', watts: 500, usageMode: 'cycles', cyclesPerWeek: 3, hoursPerCycle: 1, essential: false, category: 'heavy' },
  { name: 'TV', watts: 80, hoursPerDay: 5, essential: false, category: 'entertainment' },
];
