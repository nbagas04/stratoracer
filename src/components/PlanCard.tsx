import React from 'react';
import {
  GasPump,
  Hourglass,
  WarningCircle,
  PencilSimple,
} from '@phosphor-icons/react';
import { PlanConfig, CalculatedPlanInfo } from '../types/strategy';
import { formatPace, formatRaceTime } from '../utils/formatters';

interface PlanCardProps {
  plan: PlanConfig;
  calculated: CalculatedPlanInfo;
  onChange: (updated: PlanConfig) => void;
}

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string; activeBorder: string }> = {
  A: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', activeBorder: 'border-cyan-500/60' },
  B: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', activeBorder: 'border-emerald-500/60' },
  C: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', activeBorder: 'border-amber-500/60' },
  D: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', activeBorder: 'border-purple-500/60' },
  E: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', activeBorder: 'border-pink-500/60' },
  F: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', activeBorder: 'border-indigo-500/60' },
};

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  calculated,
  onChange,
}) => {
  const colors = PLAN_COLORS[plan.id] || PLAN_COLORS.A;

  const handleUpdate = (fields: Partial<PlanConfig>) => {
    onChange({
      ...plan,
      ...fields,
    });
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden relative ${
        !plan.enabled
          ? 'bg-race-panel/40 border-race-border/40 opacity-55 hover:opacity-75'
          : `bg-race-panel border-race-border hover:${colors.activeBorder} shadow-lg`
      }`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-race-border/60 bg-[#090d14]/60">
        <div className="flex items-center justify-between gap-3">
          {/* Plan Badge + Editable Name */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span
              className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center font-mono font-bold text-sm sm:text-base shrink-0`}
            >
              {plan.id}
            </span>
            <div className="relative flex-1 min-w-0 group">
              <input
                type="text"
                value={plan.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                placeholder={`Plan ${plan.id}`}
                className="w-full bg-transparent hover:bg-slate-900/60 focus:bg-slate-900/90 text-sm sm:text-base font-bold text-slate-100 rounded px-1.5 py-0.5 border border-transparent hover:border-race-border focus:border-cyan-500 outline-none transition-colors truncate"
              />
              <PencilSimple
                size={12}
                className="absolute right-2 top-2 text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={plan.enabled}
            onClick={() => handleUpdate({ enabled: !plan.enabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-[#090d14] ${
              plan.enabled ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-slate-700/80 hover:bg-slate-700'
            }`}
            title={plan.enabled ? 'Nonaktifkan Paket Stint' : 'Aktifkan Paket Stint'}
          >
            <span className="sr-only">Toggle Plan {plan.id}</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                plan.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Mode Selector (Fuel-based vs Time-based) */}
        <div className="mt-3 grid grid-cols-2 p-0.5 bg-[#070a0f] rounded-lg border border-race-border/80">
          <button
            type="button"
            onClick={() => handleUpdate({ mode: 'Fuel-based' })}
            disabled={!plan.enabled}
            className={`py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
              plan.mode === 'Fuel-based'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GasPump size={14} />
            <span>Fuel-based</span>
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ mode: 'Time-based' })}
            disabled={!plan.enabled}
            className={`py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
              plan.mode === 'Time-based'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hourglass size={14} />
            <span>Time-based</span>
          </button>
        </div>
      </div>

      {/* Card Inputs Body */}
      <div className="p-4 space-y-3">
        {/* Pace Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="font-semibold text-slate-200">
              Target Lap Time / Pace <span className="text-slate-400 text-[10px] sm:text-xs font-normal">(sec or mm:ss)</span>
            </label>
            {calculated.parsedPaceSeconds > 0 && (
              <span className="font-mono text-cyan-400 text-xs font-semibold">
                {formatPace(calculated.parsedPaceSeconds)}
              </span>
            )}
          </div>
          <input
            type="text"
            disabled={!plan.enabled}
            value={plan.paceStr}
            onChange={(e) => handleUpdate({ paceStr: e.target.value })}
            placeholder="e.g. 1:30.5 or 90.5"
            className="w-full bg-[#0a0e16] border border-race-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-600 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Fuel Per Lap */}
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-slate-200 block">
            Fuel Consumption <span className="text-slate-400 text-[10px] sm:text-xs font-normal">(Liters / lap)</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            disabled={!plan.enabled}
            value={plan.fuelPerLapStr}
            onChange={(e) => handleUpdate({ fuelPerLapStr: e.target.value })}
            placeholder="e.g. 2.35"
            className="w-full bg-[#0a0e16] border border-race-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-600 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Tank Capacity */}
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-slate-200 block">
            Tank Capacity <span className="text-slate-400 text-[10px] sm:text-xs font-normal">(Liters)</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            disabled={!plan.enabled}
            value={plan.tankCapacityStr}
            onChange={(e) => handleUpdate({ tankCapacityStr: e.target.value })}
            placeholder="e.g. 100"
            className="w-full bg-[#0a0e16] border border-race-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-600 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Stint Duration (If Time-based) */}
        {plan.mode === 'Time-based' && (
          <div className="space-y-1 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-fadeIn">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="font-semibold text-amber-200">
                Target Stint Duration <span className="text-amber-400/80 text-[10px] sm:text-xs font-normal">(minutes)</span>
              </label>
            </div>
            <input
              type="text"
              inputMode="decimal"
              disabled={!plan.enabled}
              value={plan.durationStr}
              onChange={(e) => handleUpdate({ durationStr: e.target.value })}
              placeholder="e.g. 60"
              className="w-full bg-[#0a0e16] border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/40 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-amber-200 placeholder-slate-600 disabled:opacity-50 transition-colors"
            />
          </div>
        )}

        {/* Visual Tank Warning Alert */}
        {plan.enabled && plan.mode === 'Time-based' && calculated.isFuelOverCapacity && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
            <WarningCircle size={16} className="text-rose-400 shrink-0 mt-0.5" weight="fill" />
            <div>
              <p className="font-semibold">Fuel Overflow Warning!</p>
              <p className="text-[11px] text-rose-400/90 mt-0.5">
                Stint ini memerlukan <strong>{calculated.fuelNeededPerStint.toFixed(1)}L</strong>, melebihi kapasitas tangki (<strong>{calculated.parsedTankCapacity}L</strong>). Mobil berisiko kehabisan fuel di lintasan sebelum stint berakhir.
              </p>
            </div>
          </div>
        )}

        {/* Error message if invalid */}
        {plan.enabled && !calculated.isValid && calculated.errorMessage && (
          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-1.5">
            <WarningCircle size={14} className="shrink-0 text-rose-400" />
            <span>{calculated.errorMessage}</span>
          </div>
        )}
      </div>

      {/* Computed Telemetry Footer */}
      <div className="p-3 bg-[#080c12] border-t border-race-border/60">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 rounded-lg bg-[#0d121a]">
            <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold block">
              Stint Duration
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-white block truncate">
              {calculated.isValid ? `${calculated.durationMinutes.toFixed(1)}m` : '—'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block truncate">
              {calculated.isValid ? formatRaceTime(calculated.durationMinutes, false) : '0m'}
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#0d121a]">
            <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold block">
              Est. Laps
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-400 block truncate">
              {calculated.isValid ? `${calculated.laps.toFixed(2)}` : '—'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block truncate">
              laps / stint
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#0d121a]">
            <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold block">
              Fuel Needed
            </span>
            <span
              className={`text-xs sm:text-sm font-mono font-bold block truncate ${
                calculated.isFuelOverCapacity ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {calculated.isValid ? `${calculated.fuelNeededPerStint.toFixed(1)}L` : '—'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block truncate">
              L / stint
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
