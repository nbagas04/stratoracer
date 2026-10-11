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

const PLAN_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-slate-800', text: 'text-sky-300', border: 'border-slate-700' },
  B: { bg: 'bg-slate-800', text: 'text-emerald-300', border: 'border-slate-700' },
  C: { bg: 'bg-slate-800', text: 'text-amber-300', border: 'border-slate-700' },
  D: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
  E: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
  F: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
};

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  calculated,
  onChange,
}) => {
  const badge = PLAN_BADGES[plan.id] || PLAN_BADGES.A;

  const handleUpdate = (fields: Partial<PlanConfig>) => {
    onChange({
      ...plan,
      ...fields,
    });
  };

  return (
    <div
      className={`rounded-xl border transition-colors flex flex-col overflow-hidden relative ${
        !plan.enabled
          ? 'bg-race-surface/50 border-race-border/50 opacity-50'
          : 'bg-race-surface border-race-border hover:border-slate-600'
      }`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-race-border bg-[#11161d]">
        <div className="flex items-center justify-between gap-3">
          {/* Plan Badge + Editable Name */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span
              className={`w-7 h-7 rounded ${badge.bg} ${badge.text} border ${badge.border} flex items-center justify-center font-mono font-bold text-xs shrink-0`}
            >
              {plan.id}
            </span>
            <div className="relative flex-1 min-w-0 group">
              <input
                type="text"
                aria-label={`Plan ${plan.id} custom label`}
                value={plan.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                placeholder={`Plan ${plan.id}`}
                className="w-full bg-transparent hover:bg-slate-800/50 focus:bg-slate-800/80 text-sm sm:text-base font-bold text-slate-100 rounded px-1.5 py-0.5 border border-transparent hover:border-race-border focus:border-slate-400 outline-none transition-colors truncate"
              />
              <PencilSimple
                size={12}
                className="absolute right-2 top-2 text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={plan.enabled}
            onClick={() => handleUpdate({ enabled: !plan.enabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-[#11161d] ${
              plan.enabled ? 'bg-sky-500 hover:bg-sky-400' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={plan.enabled ? 'Nonaktifkan Paket Stint' : 'Aktifkan Paket Stint'}
          >
            <span className="sr-only">Toggle Plan {plan.id}</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                plan.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 p-0.5 bg-[#0d1117] rounded-lg border border-race-border">
          <button
            type="button"
            onClick={() => handleUpdate({ mode: 'Fuel-based' })}
            disabled={!plan.enabled}
            className={`py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              plan.mode === 'Fuel-based'
                ? 'bg-slate-700 text-white font-semibold'
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
            className={`py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              plan.mode === 'Time-based'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hourglass size={14} />
            <span>Time-based</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label htmlFor={`plan-${plan.id}-pace`} className="font-semibold text-slate-200">
              Target Lap Time / Pace <span className="text-slate-400 text-[10px] sm:text-xs font-normal">(sec or mm:ss)</span>
            </label>
            {calculated.parsedPaceSeconds > 0 && (
              <span className="font-mono text-sky-400 text-xs font-semibold">
                {formatPace(calculated.parsedPaceSeconds)}
              </span>
            )}
          </div>
          <input
            id={`plan-${plan.id}-pace`}
            type="text"
            disabled={!plan.enabled}
            value={plan.paceStr}
            onChange={(e) => handleUpdate({ paceStr: e.target.value })}
            placeholder="e.g. 1:30.5 or 90.5"
            className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-500 disabled:opacity-50 transition-colors focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`plan-${plan.id}-fuel`} className="text-xs sm:text-sm font-semibold text-slate-200 block">
            Fuel Consumption <span className="text-slate-400 text-[10px] sm:text-xs font-normal">(Liters / lap)</span>
          </label>
          <input
            id={`plan-${plan.id}-fuel`}
            type="text"
            inputMode="decimal"
            disabled={!plan.enabled}
            value={plan.fuelPerLapStr}
            onChange={(e) => handleUpdate({ fuelPerLapStr: e.target.value })}
            placeholder="e.g. 2.35"
            className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-500 disabled:opacity-50 transition-colors focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`plan-${plan.id}-tank`} className="text-xs sm:text-sm font-semibold text-slate-200 block">
            Tank Capacity <span className="text-slate-400 text-[10px] sm:text-xs font-normal">(Liters)</span>
          </label>
          <input
            id={`plan-${plan.id}-tank`}
            type="text"
            inputMode="decimal"
            disabled={!plan.enabled}
            value={plan.tankCapacityStr}
            onChange={(e) => handleUpdate({ tankCapacityStr: e.target.value })}
            placeholder="e.g. 100"
            className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-500 disabled:opacity-50 transition-colors focus:outline-none"
          />
        </div>

        {plan.mode === 'Time-based' && (
          <div className="space-y-1 p-2.5 rounded-lg bg-[#0d1117] border border-race-border">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label htmlFor={`plan-${plan.id}-duration`} className="font-semibold text-slate-200">
                Target Stint Duration <span className="text-slate-400 text-[10px] sm:text-xs font-normal">(minutes)</span>
              </label>
            </div>
            <input
              id={`plan-${plan.id}-duration`}
              type="text"
              inputMode="decimal"
              disabled={!plan.enabled}
              value={plan.durationStr}
              onChange={(e) => handleUpdate({ durationStr: e.target.value })}
              placeholder="e.g. 60"
              className="w-full bg-[#161b22] border border-race-border focus:border-slate-400 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder-slate-500 disabled:opacity-50 transition-colors focus:outline-none"
            />
          </div>
        )}

        {/* Visual Tank Warning Alert */}
        {plan.enabled && plan.mode === 'Time-based' && calculated.isFuelOverCapacity && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
            <WarningCircle size={16} className="text-rose-400 shrink-0 mt-0.5" weight="fill" />
            <div>
              <p className="font-semibold">Fuel Overflow Warning!</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">
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
      <div className="p-3 bg-[#11161d] border-t border-race-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 rounded-lg bg-[#161b22] border border-race-border/50">
            <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold block">
              Stint Duration
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-white block truncate">
              {calculated.isValid ? `${calculated.durationMinutes.toFixed(1)}m` : '-'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block truncate">
              {calculated.isValid ? formatRaceTime(calculated.durationMinutes, false) : '0m'}
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#161b22] border border-race-border/50">
            <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold block">
              Est. Laps
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-100 block truncate">
              {calculated.isValid ? `${calculated.laps.toFixed(2)}` : '-'}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block truncate">
              laps / stint
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#161b22] border border-race-border/50">
            <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold block">
              Fuel Needed
            </span>
            <span
              className={`text-xs sm:text-sm font-mono font-bold block truncate ${
                calculated.isFuelOverCapacity ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {calculated.isValid ? `${calculated.fuelNeededPerStint.toFixed(1)}L` : '-'}
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
