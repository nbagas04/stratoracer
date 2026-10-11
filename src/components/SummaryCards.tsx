import React from 'react';
import { StrategyCombination, GlobalSettings } from '../types/strategy';
import { formatRaceTime, formatDeltaTime } from '../utils/formatters';

interface SummaryCardsProps {
  combinations: StrategyCombination[];
  settings: GlobalSettings;
  prunedBranchesCount: number;
  totalSearched: number;
  onSelectRecommendation?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  combinations,
  settings,
  prunedBranchesCount,
  onSelectRecommendation,
}) => {
  const best = combinations.length > 0 ? combinations[0] : null;
  const minTime = settings.targetTotalTimeMinutes * (1 - settings.allowancePercent / 100);
  const maxTime = settings.targetTotalTimeMinutes * (1 + settings.allowancePercent / 100);

  const delta = best ? formatDeltaTime(best.deltaMinutes, best.deltaPercent) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-race-surface border border-race-border rounded-xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-300">Valid Combinations</h3>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {combinations.length}
            </span>
            <span className="text-xs sm:text-sm text-slate-400 font-mono">verified strategies</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono truncate" title={`${prunedBranchesCount.toLocaleString()} variasi di luar parameter disaring`}>
            {prunedBranchesCount.toLocaleString()} variasi di luar parameter disaring
          </p>
        </div>
      </div>

      <div className="bg-race-surface border border-race-border rounded-xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-200">
            Optimal Strategy
          </h3>
        </div>
        <div className="mt-2 min-w-0">
          {best ? (
            <div className="space-y-1">
              <div className="text-sm sm:text-base font-bold text-white truncate" title={best.activePlansSummary}>
                {best.activePlansSummary}
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm">
                <span className="text-slate-200 font-bold">
                  {formatRaceTime(best.totalTimeMinutes)}
                </span>
                <span className={`font-semibold ${delta?.colorClass}`}>
                  {delta?.text}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 text-xs text-slate-400 pt-0.5">
                <span className="truncate">{best.totalPits} Pit Stops ({best.normalPits} Norm + {best.longPits} Long)</span>
                {onSelectRecommendation && (
                  <button
                    onClick={onSelectRecommendation}
                    className="text-sky-400 hover:text-sky-300 underline underline-offset-2 shrink-0 font-medium cursor-pointer"
                  >
                    Open Timeline
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-slate-400 py-1">
              Belum ada kombinasi yang memenuhi target durasi dalam jendela toleransi.
            </div>
          )}
        </div>
      </div>

      <div className="bg-race-surface border border-race-border rounded-xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-300">Target & Tolerance Window</h3>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {formatRaceTime(settings.targetTotalTimeMinutes)}
          </div>
          <div className="text-xs sm:text-sm font-mono text-slate-400 mt-1.5 flex flex-wrap items-center justify-between gap-1">
            <span className="text-slate-400">Window (±{settings.allowancePercent}%):</span>
            <span className="text-slate-200 font-semibold">
              {formatRaceTime(minTime, false)} to {formatRaceTime(maxTime, false)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-race-surface border border-race-border rounded-xl p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-300">Projected Laps & Fuel</h3>
        </div>
        <div className="mt-3">
          {best ? (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xl sm:text-2xl font-mono font-bold text-white">
                  {best.totalLaps.toFixed(1)} <span className="text-xs sm:text-sm font-normal text-slate-400">Laps</span>
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-slate-200">
                  {best.totalFuelLiters.toFixed(0)} <span className="text-xs sm:text-sm font-normal text-slate-400">Liters</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 truncate">
                Alokasi bahan bakar tim: min. ~{Math.ceil(best.totalFuelLiters)} Liter
              </p>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-slate-400 py-1">Menunggu konfigurasi paket stint yang valid...</div>
          )}
        </div>
      </div>
    </div>
  );
};
