import React from 'react';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { GlobalSettings } from '../types/strategy';
import { formatRaceTime } from '../utils/formatters';
import { PRESET_SCENARIOS, PresetScenario } from '../utils/constants';

interface GlobalSettingsCardProps {
  settings: GlobalSettings;
  onChange: (updated: GlobalSettings) => void;
  onSelectPreset: (preset: PresetScenario) => void;
  onResetToDefaults: () => void;
  activePresetName?: string;
}

export const GlobalSettingsCard: React.FC<GlobalSettingsCardProps> = ({
  settings,
  onChange,
  onSelectPreset,
  onResetToDefaults,
  activePresetName,
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

      {/* Card Header */}
      <div className="pb-4 mb-4 border-b border-race-border/60">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Parameter Strategi Balapan
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Konfigurasi target durasi lomba, batas toleransi waktu (allowance), dan regulasi pit stop
        </p>
      </div>

      {/* Quick Race Presets */}
      <div className="mb-6 space-y-2">
        <div className="text-xs sm:text-sm font-bold text-slate-200">
          Preset Skenario Balapan
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isActive = activePresetName === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-[#0d131c] hover:bg-slate-800/80 border border-race-border/80'
                }`}
                title={`${preset.name} (${preset.targetMinutes} menit)`}
              >
                <span>{preset.badge}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onResetToDefaults}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-400/90 bg-transparent hover:bg-slate-800/30 border border-slate-800/60 hover:border-rose-900/40 rounded-lg flex items-center gap-1 transition-all opacity-60 hover:opacity-100 cursor-pointer"
            title="Kembalikan semua parameter ke nilai default"
          >
            <ArrowCounterClockwise size={12} />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* 2-Column Parameter Grid (Saran A) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-5 border-t border-race-border/50">
        {/* Column 1: Race Timing & Tolerance */}
        <div className="space-y-4">
          <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-300 pb-1.5 border-b border-race-border/40">
            Target Waktu & Toleransi
          </div>

          {/* 1. Target Race Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Target Durasi Balapan
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                {formatRaceTime(settings.targetTotalTimeMinutes)}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={settings.targetTotalTimeMinutes || ''}
                onChange={(e) => handleNumberChange('targetTotalTimeMinutes', e.target.value)}
                className="w-full bg-[#0a0e16] border border-race-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 rounded-xl pl-3.5 pr-16 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
                placeholder="480"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  menit
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Total durasi lomba yang dituju (contoh: 240m = 4 jam, 480m = 8 jam, 1440m = 24 jam)
            </p>
          </div>

          {/* 2. Allowance % + Valid Window */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Jendela Toleransi Waktu (± %)
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                ±{(settings.targetTotalTimeMinutes * (settings.allowancePercent / 100)).toFixed(1)}m margin
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={settings.allowancePercent || ''}
                  onChange={(e) => handleNumberChange('allowancePercent', e.target.value)}
                  className="w-full bg-[#0a0e16] border border-race-border focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
                  placeholder="5"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <span className="text-xs sm:text-sm font-mono text-slate-400">
                    %
                  </span>
                </div>
              </div>
              {/* Valid Duration without background */}
              <div className="text-xs font-mono text-slate-400 shrink-0 flex items-center justify-center gap-1.5 py-1">
                <span>Rentang Target:</span>
                <span className="text-slate-300">{formatRaceTime(minTime)}</span>
                <span className="text-slate-500">➔</span>
                <span className="text-slate-300">{formatRaceTime(maxTime)}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Batas toleransi deviasi total waktu finish terhadap target lomba (±{(settings.targetTotalTimeMinutes * (settings.allowancePercent / 100)).toFixed(1)} menit)
            </p>
          </div>

          {/* 3. Max Repetitions (Max Reps) */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-200 block">
              Maks. Repetisi Stint per Plan
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={settings.maxReps}
                onChange={(e) => handleNumberChange('maxReps', e.target.value)}
                className="w-full bg-[#0a0e16] border border-race-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 rounded-xl pl-3.5 pr-14 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
                placeholder="8"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  stint
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Batas maksimum perulangan stint untuk masing-masing profil plan (Plan A–F)
            </p>
          </div>
        </div>

        {/* Column 2: Pit Lane Rules */}
        <div className="space-y-4">
          <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-300 pb-1.5 border-b border-race-border/40">
            Regulasi & Durasi Pit Stop
          </div>

          {/* 4. Normal Pit Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Durasi Pit Stop Reguler (Refuel)
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                {(settings.normalPitDurationSeconds / 60).toFixed(2)}m
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={settings.normalPitDurationSeconds || ''}
                onChange={(e) => handleNumberChange('normalPitDurationSeconds', e.target.value)}
                className="w-full bg-[#0a0e16] border border-race-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 rounded-xl pl-3.5 pr-16 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
                placeholder="51.6"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  detik
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Estimasi durasi pit stop standar untuk pengisian bahan bakar (fuel only / splash & go)
            </p>
          </div>

          {/* 5. Long Pit Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                Durasi Pit Stop Servis Panjang
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                {(settings.longPitDurationSeconds / 60).toFixed(2)}m
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={settings.longPitDurationSeconds || ''}
                onChange={(e) => handleNumberChange('longPitDurationSeconds', e.target.value)}
                className="w-full bg-[#0a0e16] border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/40 rounded-xl pl-3.5 pr-16 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
                placeholder="210"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  detik
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Estimasi durasi pit stop khusus untuk pergantian pembalap (driver change) atau servis rem/ban
            </p>
          </div>

          {/* 6. Long Pit Count */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-200 block">
              Jumlah Pit Stop Servis Panjang
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={settings.longPitCount}
                onChange={(e) => handleNumberChange('longPitCount', e.target.value)}
                className="w-full bg-[#0a0e16] border border-race-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 rounded-xl pl-3.5 pr-14 py-2.5 text-sm font-mono text-white placeholder-slate-600 transition-colors"
                placeholder="3"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  pit stop
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Total pit stop servis panjang yang wajib atau dialokasikan selama balapan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
