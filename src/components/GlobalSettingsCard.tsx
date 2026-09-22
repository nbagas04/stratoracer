import React from 'react';
import {
  SlidersHorizontal,
  Clock,
  Percent,
  Timer,
  Wrench,
  Hash,
  Info,
} from '@phosphor-icons/react';
import { GlobalSettings } from '../types/strategy';
import { formatRaceTime } from '../utils/formatters';

interface GlobalSettingsCardProps {
  settings: GlobalSettings;
  onChange: (updated: GlobalSettings) => void;
}

export const GlobalSettingsCard: React.FC<GlobalSettingsCardProps> = ({
  settings,
  onChange,
}) => {
  const minTime = settings.targetTotalTimeMinutes * (1 - settings.allowancePercent / 100);
  const maxTime = settings.targetTotalTimeMinutes * (1 + settings.allowancePercent / 100);

  const handleNumberChange = (field: keyof GlobalSettings, value: string) => {
    // Support Indonesian comma
    const sanitized = value.replace(',', '.');
    const num = parseFloat(sanitized);
    onChange({
      ...settings,
      [field]: isNaN(num) ? 0 : num,
    });
  };

  return (
    <div className="bg-race-panel/90 border border-race-border rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Subtle telemetry accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-race-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <SlidersHorizontal size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              Global Strategy Parameters
            </h2>
            <p className="text-xs text-slate-400">
              Target race duration, tolerance window, and pit lane service rules
            </p>
          </div>
        </div>

        {/* Live Window Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090d14] border border-cyan-900/40 text-xs font-mono">
          <span className="text-slate-400">Valid Window:</span>
          <span className="text-cyan-300 font-semibold">
            {formatRaceTime(minTime)}
          </span>
          <span className="text-slate-500">➔</span>
          <span className="text-cyan-300 font-semibold">
            {formatRaceTime(maxTime)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5">
        {/* Target Race Time */}
        <div className="lg:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-cyan-400" />
              Target Race Duration
            </span>
            <span className="font-mono text-cyan-400 font-semibold text-xs">
              {formatRaceTime(settings.targetTotalTimeMinutes)}
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={settings.targetTotalTimeMinutes || ''}
              onChange={(e) => handleNumberChange('targetTotalTimeMinutes', e.target.value)}
              className="w-full bg-[#0a0e16] border border-race-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
              placeholder="e.g. 480"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-400 pointer-events-none">
              menit
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            e.g. 480m = 8h, 720m = 12h, 1440m = 24h
          </p>
        </div>

        {/* Allowance % */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Percent size={14} className="text-amber-400" />
            Allowance (± %)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={settings.allowancePercent || ''}
              onChange={(e) => handleNumberChange('allowancePercent', e.target.value)}
              className="w-full bg-[#0a0e16] border border-race-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
              placeholder="e.g. 5"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-400 pointer-events-none">
              %
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            ±{(settings.targetTotalTimeMinutes * (settings.allowancePercent / 100)).toFixed(1)}m tolerance
          </p>
        </div>

        {/* Normal Pit Duration (Seconds) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Timer size={14} className="text-emerald-400" />
              Normal Pit
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {(settings.normalPitDurationSeconds / 60).toFixed(2)}m
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={settings.normalPitDurationSeconds || ''}
              onChange={(e) => handleNumberChange('normalPitDurationSeconds', e.target.value)}
              className="w-full bg-[#0a0e16] border border-race-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
              placeholder="e.g. 51.6"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-400 pointer-events-none">
              detik
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Fuel only / standard stop
          </p>
        </div>

        {/* Long Pit Duration (Seconds) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wrench size={14} className="text-blue-400" />
              Long Pit
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {(settings.longPitDurationSeconds / 60).toFixed(2)}m
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={settings.longPitDurationSeconds || ''}
              onChange={(e) => handleNumberChange('longPitDurationSeconds', e.target.value)}
              className="w-full bg-[#0a0e16] border border-race-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
              placeholder="e.g. 210"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-400 pointer-events-none">
              detik
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Brake / driver service
          </p>
        </div>

        {/* Long Pit Count & Max Reps */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Hash size={14} className="text-purple-400" />
              Long Pit Count
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={settings.longPitCount}
              onChange={(e) => handleNumberChange('longPitCount', e.target.value)}
              className="w-full bg-[#0a0e16] border border-race-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
              placeholder="e.g. 3"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-400 pointer-events-none">
              kali
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Max Reps:</span>
            <input
              type="number"
              min={1}
              max={25}
              value={settings.maxReps}
              onChange={(e) => handleNumberChange('maxReps', e.target.value)}
              className="w-14 bg-[#090d13] border border-race-border rounded px-1.5 py-0.5 text-xs font-mono text-center text-cyan-300"
              title="Global Maximum Repetitions per Plan"
            />
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="mt-4 pt-3 border-t border-race-border/40 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={14} className="text-cyan-400 shrink-0" />
        <span>
          Rumus pit stop: <code className="font-mono text-slate-300">Total Pit = Stint - 1</code>. 
          Long pit dilakukan sebanyak <strong className="text-slate-200">{settings.longPitCount}x</strong>, 
          dan sisanya otomatis dialokasikan ke normal pit stop.
        </span>
      </div>
    </div>
  );
};
