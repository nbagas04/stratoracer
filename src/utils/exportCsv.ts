import { StrategyCombination } from '../types/strategy';
import { formatRaceTime } from './formatters';

export function exportCombinationsToCsv(
  combinations: StrategyCombination[],
  filename = 'stratoracer_strategy_combinations.csv'
): void {
  if (combinations.length === 0) return;

  const headers = [
    'Strategy ID',
    'Plan A',
    'Plan B',
    'Plan C',
    'Plan D',
    'Plan E',
    'Plan F',
    'Total Stints',
    'Normal Pits',
    'Long Pits',
    'Total Pits',
    'Race Time (Formatted)',
    'Total Time (Minutes)',
    'Delta to Target (Minutes)',
    'Delta (%)',
    'Estimated Total Laps',
    'Estimated Total Fuel (L)',
  ];

  const rows = combinations.map((c, index) => [
    `#${index + 1}`,
    c.planCounts.A ?? 0,
    c.planCounts.B ?? 0,
    c.planCounts.C ?? 0,
    c.planCounts.D ?? 0,
    c.planCounts.E ?? 0,
    c.planCounts.F ?? 0,
    c.totalStints,
    c.normalPits,
    c.longPits,
    c.totalPits,
    `"${formatRaceTime(c.totalTimeMinutes)}"`,
    c.totalTimeMinutes.toFixed(2),
    (c.deltaMinutes > 0 ? `+${c.deltaMinutes.toFixed(2)}` : c.deltaMinutes.toFixed(2)),
    `${c.deltaPercent.toFixed(2)}%`,
    c.totalLaps.toFixed(2),
    c.totalFuelLiters.toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
