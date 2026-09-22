import React from 'react';
import {
  Trophy,
  ListBullets,
  GasCan,
  ShieldCheck,
  Target,
  Sparkle,
} from '@phosphor-icons/react';
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
      {/* 1. Combinations Counter */}
      <div className="bg-race-panel border border-race-border rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Valid Combinations</span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ListBullets size={16} weight="bold" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {combinations.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">opsi strategi</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>{prunedBranchesCount.toLocaleString()} cabang dipangkas (pruned)</span>
          </p>
        </div>
      </div>

      {/* 2. Recommended Optimal Strategy */}
      <div className="bg-gradient-to-br from-cyan-950/30 via-race-panel to-race-panel border border-cyan-500/30 rounded-2xl p-4.5 shadow-md flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sparkle size={14} className="text-amber-400" />
            Rekomendasi Utama
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy size={16} weight="fill" />
          </div>
        </div>
        <div className="mt-2">
          {best ? (
            <div>
              <div className="text-sm font-semibold text-white truncate" title={best.activePlansSummary}>
                {best.activePlansSummary}
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                <span className="text-slate-300 font-bold">
                  {formatRaceTime(best.totalTimeMinutes)}
                </span>
                <span className={`font-semibold ${delta?.colorClass}`}>
                  {delta?.text}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                <span>{best.totalPits} Pit ({best.longPits}L + {best.normalPits}N)</span>
                {onSelectRecommendation && (
                  <button
                    onClick={onSelectRecommendation}
                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 ml-auto font-medium cursor-pointer"
                  >
                    Buka Timeline
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1">
              Tidak ada kombinasi yang cocok dengan target ± toleransi.
            </div>
          )}
        </div>
      </div>

      {/* 3. Target Race Duration & Tolerance */}
      <div className="bg-race-panel border border-race-border rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Target & Window</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target size={16} weight="bold" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {formatRaceTime(settings.targetTotalTimeMinutes)}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-between">
            <span>Window ±{settings.allowancePercent}%:</span>
            <span className="text-cyan-300 font-medium">
              {formatRaceTime(minTime, false)} – {formatRaceTime(maxTime, false)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Best Strategy Laps & Fuel */}
      <div className="bg-race-panel border border-race-border rounded-2xl p-4.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Estimasi Laps & Bensin</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GasCan size={16} weight="bold" />
          </div>
        </div>
        <div className="mt-3">
          {best ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-mono font-bold text-emerald-400">
                  {best.totalLaps.toFixed(1)} <span className="text-xs font-normal text-slate-400">Laps</span>
                </span>
                <span className="text-sm font-mono text-cyan-300 font-semibold">
                  {best.totalFuelLiters.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">Liter</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Kebutuhan bensin kru: ~{Math.ceil(best.totalFuelLiters)} L total
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1">Menunggu input plan valid...</div>
          )}
        </div>
      </div>
    </div>
  );
};
