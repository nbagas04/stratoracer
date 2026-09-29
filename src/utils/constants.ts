import { GlobalSettings, PlanConfig } from '../types/strategy';

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  maxReps: 8,
  targetTotalTimeMinutes: 480, // 8 hours
  allowancePercent: 5,
  longPitDurationSeconds: 210, // 3.5 minutes
  normalPitDurationSeconds: 51.6, // 0.86 minutes
  longPitCount: 3,
};

export const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'A',
    label: 'Plan A (Full Attack / Maximum Pace)',
    enabled: true,
    mode: 'Fuel-based',
    paceStr: '1:30',
    fuelPerLapStr: '2.5',
    tankCapacityStr: '100',
    durationStr: '60',
  },
  {
    id: 'B',
    label: 'Plan B (Balanced / Standard Pace)',
    enabled: true,
    mode: 'Fuel-based',
    paceStr: '1:32.5',
    fuelPerLapStr: '2.3',
    tankCapacityStr: '100',
    durationStr: '65',
  },
  {
    id: 'C',
    label: 'Plan C (Fuel Save / Lift & Coast)',
    enabled: false,
    mode: 'Time-based',
    paceStr: '1:30',
    fuelPerLapStr: '2.5',
    tankCapacityStr: '100',
    durationStr: '55',
  },
  {
    id: 'D',
    label: 'Plan D (Heavy Traffic / Wet Setup)',
    enabled: false,
    mode: 'Fuel-based',
    paceStr: '1:42',
    fuelPerLapStr: '2.8',
    tankCapacityStr: '100',
    durationStr: '70',
  },
  {
    id: 'E',
    label: 'Plan E (Sprint Stint / Soft Tyre)',
    enabled: false,
    mode: 'Fuel-based',
    paceStr: '1:30',
    fuelPerLapStr: '2.5',
    tankCapacityStr: '100',
    durationStr: '60',
  },
  {
    id: 'F',
    label: 'Plan F (Endurance Long Run)',
    enabled: false,
    mode: 'Fuel-based',
    paceStr: '1:30',
    fuelPerLapStr: '2.5',
    tankCapacityStr: '100',
    durationStr: '60',
  },
];

export interface PresetScenario {
  name: string;
  badge: string;
  targetMinutes: number;
  allowance: number;
  normalPitSec: number;
  longPitSec: number;
  longPitCount: number;
  maxReps: number;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    name: '4 Hours Sprint Enduro',
    badge: '4H Sprint',
    targetMinutes: 240,
    allowance: 5,
    normalPitSec: 48,
    longPitSec: 180,
    longPitCount: 2,
    maxReps: 6,
  },
  {
    name: '6 Hours Endurance',
    badge: '6H Enduro',
    targetMinutes: 360,
    allowance: 5,
    normalPitSec: 50,
    longPitSec: 200,
    longPitCount: 2,
    maxReps: 7,
  },
  {
    name: '8 Hours Endurance',
    badge: '8H Standard',
    targetMinutes: 480,
    allowance: 5,
    normalPitSec: 51.6,
    longPitSec: 210,
    longPitCount: 3,
    maxReps: 8,
  },
  {
    name: '12 Hours Sebring / Bathurst',
    badge: '12H Enduro',
    targetMinutes: 720,
    allowance: 4,
    normalPitSec: 55,
    longPitSec: 240,
    longPitCount: 4,
    maxReps: 12,
  },
  {
    name: '24 Hours Le Mans / Spa',
    badge: '24H Marathon',
    targetMinutes: 1440,
    allowance: 3,
    normalPitSec: 60,
    longPitSec: 300,
    longPitCount: 6,
    maxReps: 18,
  },
];
