import React, { useState } from 'react';
import {
  X,
  FlagBanner,
  Check,
  Copy,
  Clock,
  GasPump,
  Timer,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { StrategyCombination } from '../types/strategy';
import { formatRaceTime, formatDeltaTime } from '../utils/formatters';

interface StintTimelineModalProps {
  combination: StrategyCombination | null;
  onClose: () => void;
}

const STINT_COLORS: Record<string, { bg: string; text: string; border: string; barBg: string }> = {
  A: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', barBg: 'bg-cyan-500' },
  B: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', barBg: 'bg-emerald-500' },
  C: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', barBg: 'bg-amber-500' },
  D: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', barBg: 'bg-purple-500' },
  E: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30', barBg: 'bg-pink-500' },
  F: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', barBg: 'bg-indigo-500' },
};

export const StintTimelineModal: React.FC<StintTimelineModalProps> = ({
  combination,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!combination) return null;

  const delta = formatDeltaTime(combination.deltaMinutes, combination.deltaPercent);

  const handleCopySummary = () => {
    const text = `StratoRacer Strategy Plan:
Strategy: ${combination.activePlansSummary}
Total Time: ${formatRaceTime(combination.totalTimeMinutes)} (${delta.text})
Pit Stops: ${combination.totalPits} (${combination.longPits} Long, ${combination.normalPits} Normal)
Estimated Laps: ${combination.totalLaps.toFixed(2)}
Estimated Fuel: ${combination.totalFuelLiters.toFixed(1)} L`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-race-panel border border-race-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-race-border bg-[#0a0e16] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                STRATEGY TIMELINE
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {combination.activePlansSummary}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono">
              <span>{formatRaceTime(combination.totalTimeMinutes)}</span>
              <span className="text-slate-600">•</span>
              <span className={delta.colorClass}>{delta.text}</span>
              <span className="text-slate-600">•</span>
              <span>{combination.totalPits} Pit Stops</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-lg bg-slate-900 border border-race-border text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy strategy details"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 border border-race-border text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* High-level Bar Visualization */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#070b10] border-b border-race-border/70">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-cyan-400" /> Race Progress Bar
            </span>
            <span>Total Duration: {formatRaceTime(combination.totalTimeMinutes)}</span>
          </div>

          <div className="h-6 w-full rounded-lg overflow-hidden bg-slate-950 flex p-0.5 border border-race-border">
            {combination.stintSequence.map((step, idx) => {
              const widthPct = (step.durationMinutes / combination.totalTimeMinutes) * 100;
              if (step.type === 'stint' && step.planId) {
                const color = STINT_COLORS[step.planId] || STINT_COLORS.A;
                return (
                  <div
                    key={idx}
                    style={{ width: `${widthPct}%` }}
                    className={`${color.barBg} h-full border-r border-slate-950/40 relative group transition-opacity hover:opacity-90 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950`}
                    title={`${step.planLabel || step.planId}: ${step.durationMinutes.toFixed(1)}m`}
                  >
                    {widthPct > 6 ? step.planId : ''}
                  </div>
                );
              } else {
                // Pit stop
                const isLong = step.pitType === 'long';
                return (
                  <div
                    key={idx}
                    style={{ width: `${Math.max(widthPct, 2)}%` }}
                    className={`${
                      isLong ? 'bg-amber-400' : 'bg-slate-300'
                    } h-full relative group transition-opacity flex items-center justify-center`}
                    title={`Pit (${isLong ? 'Long' : 'Normal'}): ${(step.durationMinutes * 60).toFixed(0)}s`}
                  />
                );
              }
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-slate-400">
            {Object.entries(combination.planCounts)
              .filter(([, count]) => count > 0)
              .map(([id, count]) => {
                const color = STINT_COLORS[id] || STINT_COLORS.A;
                return (
                  <div key={id} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${color.barBg}`} />
                    <span>
                      Plan {id} ({count}x)
                    </span>
                  </div>
                );
              })}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              <span>Normal Pit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Long Pit</span>
            </div>
          </div>
        </div>

        {/* Detailed Timeline Steps */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {/* Start Line */}
          <div className="flex items-center gap-3 text-xs font-mono text-cyan-400 pb-1">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <FlagBanner size={12} weight="bold" />
            </div>
            <span>RACE START — Lap 0 (Full Fuel Load)</span>
          </div>

          {/* Sequence Steps */}
          <div className="relative pl-3 space-y-3 border-l-2 border-race-border ml-3">
            {combination.stintSequence.map((step, idx) => {
              if (step.type === 'stint') {
                const color = STINT_COLORS[step.planId || 'A'] || STINT_COLORS.A;
                return (
                  <div
                    key={idx}
                    className="relative pl-6 group"
                  >
                    {/* Node circle */}
                    <div
                      className={`absolute -left-[19px] top-1.5 w-4 h-4 rounded-full ${color.barBg} border-2 border-[#090d14]`}
                    />
                    <div className="bg-[#0c1018] border border-race-border rounded-xl p-3 hover:border-slate-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${color.bg} ${color.text} border ${color.border}`}
                          >
                            STINT #{step.stepNumber} • {step.planLabel || `Plan ${step.planId}`}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Race Clock: <strong className="text-slate-200">{formatRaceTime(step.cumulativeTimeMinutes)}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-race-border/50 text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-cyan-400" />
                          <span>
                            {step.durationMinutes.toFixed(1)}m ({formatRaceTime(step.durationMinutes, false)})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowsClockwise size={13} className="text-amber-400" />
                          <span>{step.laps?.toFixed(1)} Laps</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GasPump size={13} className="text-emerald-400" />
                          <span>{step.fuelLiters?.toFixed(1)} L Fuel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Pit stop step
                const isLong = step.pitType === 'long';
                return (
                  <div key={idx} className="relative pl-6">
                    {/* Node square */}
                    <div
                      className={`absolute -left-[18px] top-1 w-3.5 h-3.5 rounded-sm ${
                        isLong ? 'bg-amber-400' : 'bg-slate-400'
                      } border-2 border-[#090d14]`}
                    />
                    <div className="bg-[#090c13] border border-race-border/70 rounded-lg px-3 py-2 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Timer size={14} className={isLong ? 'text-amber-400' : 'text-slate-400'} />
                        <span className="font-semibold text-slate-200">
                          {isLong ? 'PIT STOP (Long Service Stop)' : 'PIT STOP (Normal Pit Stop)'}
                        </span>
                        <span className="text-slate-400">
                          • {(step.durationMinutes * 60).toFixed(1)} detik
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        Clock: {formatRaceTime(step.cumulativeTimeMinutes)}
                      </span>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* Finish Line */}
          <div className="flex items-center gap-3 text-xs font-mono text-emerald-400 pt-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <FlagBanner size={12} weight="bold" />
            </div>
            <span>
              CHECKERED FLAG — {formatRaceTime(combination.totalTimeMinutes)} ({combination.totalLaps.toFixed(1)} total laps)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-race-border bg-[#090c13] flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Total Fuel: <strong className="text-white">{combination.totalFuelLiters.toFixed(1)}L</strong> | Total Laps: <strong className="text-white">{combination.totalLaps.toFixed(1)}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
