import {
  PlanConfig,
  CalculatedPlanInfo,
  GlobalSettings,
  StrategyCombination,
  StintStep,
} from '../types/strategy';
import { parseNumberInput, parsePaceInput } from './formatters';

/**
 * Calculates metrics for a single plan (A-F)
 */
export function calculatePlanMetrics(config: PlanConfig): CalculatedPlanInfo {
  const paceSeconds = parsePaceInput(config.paceStr);
  const fuelPerLap = parseNumberInput(config.fuelPerLapStr);
  const tankCapacity = parseNumberInput(config.tankCapacityStr);
  const rawDuration = parseNumberInput(config.durationStr);

  if (!config.enabled) {
    return {
      id: config.id,
      isValid: false,
      errorMessage: 'Plan is disabled',
      parsedPaceSeconds: paceSeconds || 0,
      parsedFuelPerLap: fuelPerLap,
      parsedTankCapacity: tankCapacity,
      durationMinutes: 0,
      laps: 0,
      fuelNeededPerStint: 0,
      isFuelOverCapacity: false,
    };
  }

  if (paceSeconds === null || paceSeconds <= 0) {
    return {
      id: config.id,
      isValid: false,
      errorMessage: 'Pace format invalid (e.g. 90 or 1:30)',
      parsedPaceSeconds: 0,
      parsedFuelPerLap: fuelPerLap,
      parsedTankCapacity: tankCapacity,
      durationMinutes: 0,
      laps: 0,
      fuelNeededPerStint: 0,
      isFuelOverCapacity: false,
    };
  }

  if (fuelPerLap <= 0) {
    return {
      id: config.id,
      isValid: false,
      errorMessage: 'Fuel/lap must be greater than 0',
      parsedPaceSeconds: paceSeconds,
      parsedFuelPerLap: fuelPerLap,
      parsedTankCapacity: tankCapacity,
      durationMinutes: 0,
      laps: 0,
      fuelNeededPerStint: 0,
      isFuelOverCapacity: false,
    };
  }

  if (config.mode === 'Fuel-based') {
    if (tankCapacity <= 0) {
      return {
        id: config.id,
        isValid: false,
        errorMessage: 'Tank capacity must be > 0',
        parsedPaceSeconds: paceSeconds,
        parsedFuelPerLap: fuelPerLap,
        parsedTankCapacity: tankCapacity,
        durationMinutes: 0,
        laps: 0,
        fuelNeededPerStint: 0,
        isFuelOverCapacity: false,
      };
    }

    // Python formula: duration = (tank / fuel) * pace / 60
    const laps = tankCapacity / fuelPerLap;
    const durationMinutes = laps * (paceSeconds / 60);

    return {
      id: config.id,
      isValid: true,
      parsedPaceSeconds: paceSeconds,
      parsedFuelPerLap: fuelPerLap,
      parsedTankCapacity: tankCapacity,
      durationMinutes,
      laps,
      fuelNeededPerStint: tankCapacity,
      isFuelOverCapacity: false,
    };
  } else {
    // Time-based
    if (rawDuration <= 0) {
      return {
        id: config.id,
        isValid: false,
        errorMessage: 'Duration must be > 0 min',
        parsedPaceSeconds: paceSeconds,
        parsedFuelPerLap: fuelPerLap,
        parsedTankCapacity: tankCapacity,
        durationMinutes: 0,
        laps: 0,
        fuelNeededPerStint: 0,
        isFuelOverCapacity: false,
      };
    }

    // Python formula: laps = (dur * 60) / pace; fuel_needed = laps * fuel
    const laps = (rawDuration * 60) / paceSeconds;
    const fuelNeeded = laps * fuelPerLap;
    const isFuelOverCapacity = tankCapacity > 0 && fuelNeeded > tankCapacity;

    return {
      id: config.id,
      isValid: true,
      parsedPaceSeconds: paceSeconds,
      parsedFuelPerLap: fuelPerLap,
      parsedTankCapacity: tankCapacity,
      durationMinutes: rawDuration,
      laps,
      fuelNeededPerStint: fuelNeeded,
      isFuelOverCapacity,
    };
  }
}

/**
 * Builds the chronological timeline of stints and pit stops
 */
function buildStintSequence(
  counts: Array<{ planInfo: CalculatedPlanInfo; label: string; count: number }>,
  normalPitMinutes: number,
  longPitMinutes: number,
  longPitCount: number
): StintStep[] {
  const steps: StintStep[] = [];
  let currentTime = 0;
  let stepNumber = 1;

  // Flatten active stints
  const flattenedStints: Array<{ planInfo: CalculatedPlanInfo; label: string }> = [];
  for (const item of counts) {
    for (let i = 0; i < item.count; i++) {
      flattenedStints.push({ planInfo: item.planInfo, label: item.label });
    }
  }

  const totalStints = flattenedStints.length;
  const totalPits = totalStints - 1;
  const longPitsToPlace = Math.min(longPitCount, totalPits);

  // Distribute long pits across the available pit slots evenly
  const isLongPitSlot: boolean[] = new Array(totalPits).fill(false);
  if (longPitsToPlace > 0) {
    for (let i = 0; i < longPitsToPlace; i++) {
      // distribute evenly
      const slotIndex = Math.floor(((i + 0.5) * totalPits) / longPitsToPlace);
      isLongPitSlot[slotIndex] = true;
    }
  }

  for (let s = 0; s < totalStints; s++) {
    const stint = flattenedStints[s];
    currentTime += stint.planInfo.durationMinutes;

    steps.push({
      stepNumber: stepNumber++,
      type: 'stint',
      planId: stint.planInfo.id,
      planLabel: stint.label,
      durationMinutes: stint.planInfo.durationMinutes,
      laps: stint.planInfo.laps,
      fuelLiters: stint.planInfo.fuelNeededPerStint,
      cumulativeTimeMinutes: currentTime,
    });

    // If not last stint, add pit stop
    if (s < totalStints - 1) {
      const isLong = isLongPitSlot[s];
      const pitDuration = isLong ? longPitMinutes : normalPitMinutes;
      currentTime += pitDuration;

      steps.push({
        stepNumber: stepNumber++,
        type: 'pit',
        pitType: isLong ? 'long' : 'normal',
        durationMinutes: pitDuration,
        cumulativeTimeMinutes: currentTime,
      });
    }
  }

  return steps;
}

/**
 * Searches for all valid stint combinations matching race target time +/- allowance
 * with branch-and-bound pruning
 */
export function generateStrategyCombinations(
  plans: PlanConfig[],
  calculatedMap: Record<string, CalculatedPlanInfo>,
  settings: GlobalSettings
): {
  combinations: StrategyCombination[];
  activePlansCount: number;
  prunedBranchesCount: number;
  totalCombinationsSearched: number;
} {
  const activePlans: Array<{
    info: CalculatedPlanInfo;
    config: PlanConfig;
  }> = [];

  for (const p of plans) {
    const calc = calculatedMap[p.id];
    if (p.enabled && calc && calc.isValid && calc.durationMinutes > 0) {
      activePlans.push({ info: calc, config: p });
    }
  }

  if (activePlans.length === 0) {
    return {
      combinations: [],
      activePlansCount: 0,
      prunedBranchesCount: 0,
      totalCombinationsSearched: 0,
    };
  }

  const baseTotal = settings.targetTotalTimeMinutes;
  const minTotal = baseTotal * (1 - settings.allowancePercent / 100);
  const maxTotal = baseTotal * (1 + settings.allowancePercent / 100);

  const normalPitMinutes = settings.normalPitDurationSeconds / 60;
  const longPitMinutes = settings.longPitDurationSeconds / 60;
  const longPitCount = Math.max(0, Math.floor(settings.longPitCount));
  const maxReps = Math.max(1, Math.min(25, Math.floor(settings.maxReps)));

  const combinations: StrategyCombination[] = [];
  let totalSearched = 0;
  let prunedBranches = 0;

  // Recursively search combinations
  function search(depth: number, currentCounts: number[], currentPlanTime: number) {
    totalSearched++;

    // Pruning: if current plan time already exceeds maxTotal, stop here
    if (currentPlanTime > maxTotal) {
      prunedBranches++;
      return;
    }

    if (depth === activePlans.length) {
      const totalStints = currentCounts.reduce((acc, val) => acc + val, 0);

      // Must have at least enough stints for mandatory long pit stops:
      // total_plans >= long_pit_count + 1
      if (totalStints >= longPitCount + 1) {
        const normalPits = totalStints - longPitCount - 1;
        const totalPits = normalPits + longPitCount; // equals totalStints - 1
        const pitTimeMinutes = normalPits * normalPitMinutes + longPitCount * longPitMinutes;
        const totalTimeMinutes = currentPlanTime + pitTimeMinutes;

        if (totalTimeMinutes >= minTotal && totalTimeMinutes <= maxTotal) {
          // Prepare planCounts mapping for all 6 plans (A-F)
          const planCounts: Record<string, number> = {
            A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
          };
          const activeSummaryParts: string[] = [];
          const stintBuilderData: Array<{ planInfo: CalculatedPlanInfo; label: string; count: number }> = [];

          let totalLaps = 0;
          let totalFuel = 0;

          activePlans.forEach((ap, idx) => {
            const count = currentCounts[idx];
            planCounts[ap.config.id] = count;
            if (count > 0) {
              activeSummaryParts.push(`${count}x ${ap.config.label || ap.config.id}`);
              stintBuilderData.push({
                planInfo: ap.info,
                label: ap.config.label || `Plan ${ap.config.id}`,
                count,
              });
              totalLaps += count * ap.info.laps;
              totalFuel += count * ap.info.fuelNeededPerStint;
            }
          });

          const deltaMinutes = totalTimeMinutes - baseTotal;
          const deltaPercent = (deltaMinutes / baseTotal) * 100;

          const stintSequence = buildStintSequence(
            stintBuilderData,
            normalPitMinutes,
            longPitMinutes,
            longPitCount
          );

          combinations.push({
            id: `strat-${combinations.length + 1}-${currentCounts.join('-')}`,
            planCounts,
            activePlansSummary: activeSummaryParts.join(', ') || 'None',
            totalStints,
            normalPits,
            longPits: longPitCount,
            totalPits,
            planTimeMinutes: currentPlanTime,
            pitTimeMinutes,
            totalTimeMinutes,
            deltaMinutes,
            deltaPercent,
            totalLaps,
            totalFuelLiters: totalFuel,
            stintSequence,
          });
        }
      }
      return;
    }

    const planDuration = activePlans[depth].info.durationMinutes;

    for (let rep = 0; rep <= maxReps; rep++) {
      const addedTime = rep * planDuration;
      // Branch Pruning: if even partial stint time exceeds maxTotal, break early since rep increases
      if (currentPlanTime + addedTime > maxTotal) {
        prunedBranches += (maxReps - rep + 1);
        break;
      }

      currentCounts.push(rep);
      search(depth + 1, currentCounts, currentPlanTime + addedTime);
      currentCounts.pop();
    }
  }

  search(0, [], 0);

  // Default sorting:
  // 1. Closest total time to target total time (lowest Math.abs(deltaMinutes))
  // 2. Fewest pit stops (lowest totalPits)
  // 3. Most total laps
  combinations.sort((a, b) => {
    const deltaDiff = Math.abs(a.deltaMinutes) - Math.abs(b.deltaMinutes);
    if (Math.abs(deltaDiff) > 0.001) {
      return deltaDiff;
    }
    const pitDiff = a.totalPits - b.totalPits;
    if (pitDiff !== 0) {
      return pitDiff;
    }
    return b.totalLaps - a.totalLaps;
  });

  return {
    combinations,
    activePlansCount: activePlans.length,
    prunedBranchesCount: prunedBranches,
    totalCombinationsSearched: totalSearched,
  };
}
