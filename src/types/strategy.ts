export type PlanMode = 'Fuel-based' | 'Time-based';

export interface PlanConfig {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  label: string; // e.g., "Plan A" or custom name "Driver 1 (Pro)"
  enabled: boolean;
  mode: PlanMode;
  paceStr: string; // e.g. "90" or "1:30" or "1:30,5"
  fuelPerLapStr: string; // e.g. "2.5" or "2,5"
  tankCapacityStr: string; // e.g. "100" (Tank size in Litres)
  durationStr: string; // e.g. "80" (Stint duration in minutes for Time-based)
}

export interface CalculatedPlanInfo {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  isValid: boolean;
  errorMessage?: string;
  parsedPaceSeconds: number;
  parsedFuelPerLap: number;
  parsedTankCapacity: number;
  durationMinutes: number; // calculated duration in minutes
  laps: number; // laps per stint
  fuelNeededPerStint: number; // Litres per stint
  isFuelOverCapacity: boolean; // warning for Time-based if fuel needed > tank
}

export interface GlobalSettings {
  maxReps: number; // e.g. 8
  targetTotalTimeMinutes: number; // e.g. 480 (8 hours)
  allowancePercent: number; // e.g. 5 (%)
  longPitDurationSeconds: number; // e.g. 210 (3.5 min)
  normalPitDurationSeconds: number; // e.g. 51.6 (0.86 min)
  longPitCount: number; // e.g. 3
}

export interface StintStep {
  stepNumber: number;
  type: 'stint' | 'pit';
  planId?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  planLabel?: string;
  durationMinutes: number;
  laps?: number;
  fuelLiters?: number;
  pitType?: 'normal' | 'long';
  cumulativeTimeMinutes: number;
}

export interface StrategyCombination {
  id: string;
  planCounts: Record<string, number>; // { A: 2, B: 3, ... }
  activePlansSummary: string; // e.g. "2x A, 3x B"
  totalStints: number;
  normalPits: number;
  longPits: number;
  totalPits: number;
  planTimeMinutes: number;
  pitTimeMinutes: number;
  totalTimeMinutes: number;
  deltaMinutes: number; // totalTimeMinutes - targetTotalTimeMinutes
  deltaPercent: number;
  totalLaps: number;
  totalFuelLiters: number;
  stintSequence: StintStep[];
}
