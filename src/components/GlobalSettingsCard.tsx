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
    <div className="bg-race-surface border border-race-border rounded-xl p-5 sm:p-6">
      <div className="pb-4 mb-4 border-b border-race-border">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Global Race Parameters
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Konfigurasi target durasi lomba, jendela toleransi waktu (allowance), dan regulasi pit stop
        </p>
      </div>

      <div className="mb-6 space-y-2">
        <div className="text-xs sm:text-sm font-semibold text-slate-300">
          Race Presets
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isActive = activePresetName === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  isActive
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-race-panel hover:bg-slate-800 border border-race-border'
                }`}
                title={`${preset.name} (${preset.targetMinutes}m)`}
              >
                <span>{preset.badge}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onResetToDefaults}
            className="px-2.5 py-1.5 text-xs font-mono text-slate-400 hover:text-rose-300 bg-race-panel hover:bg-slate-800 border border-race-border hover:border-rose-900/60 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kembalikan semua parameter ke nilai default"
          >
            <ArrowCounterClockwise size={12} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-5 border-t border-race-border">
        <div className="space-y-4">
          <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-400 pb-1.5 border-b border-race-border">
            Race Timing & Tolerance
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="target-race-duration" className="text-xs sm:text-sm font-medium text-slate-300">
                Target Race Duration
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                {formatRaceTime(settings.targetTotalTimeMinutes)}
              </span>
            </div>
            <div className="relative">
              <input
                id="target-race-duration"
                type="text"
                inputMode="decimal"
                value={settings.targetTotalTimeMinutes || ''}
                onChange={(e) => handleNumberChange('targetTotalTimeMinutes', e.target.value)}
                className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 focus:outline-none rounded-lg pl-3 pr-14 py-2 text-sm font-mono text-white placeholder-slate-500 transition-colors"
                placeholder="480"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  min
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Total durasi balapan yang dituju (contoh: 240m = 4 jam, 480m = 8 jam, 1440m = 24 jam)
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="allowance-percent" className="text-xs sm:text-sm font-medium text-slate-300">
                Allowance Window (± %)
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                ±{(settings.targetTotalTimeMinutes * (settings.allowancePercent / 100)).toFixed(1)}m margin
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  id="allowance-percent"
                  type="text"
                  inputMode="decimal"
                  value={settings.allowancePercent || ''}
                  onChange={(e) => handleNumberChange('allowancePercent', e.target.value)}
                  className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 focus:outline-none rounded-lg pl-3 pr-8 py-2 text-sm font-mono text-white placeholder-slate-500 transition-colors"
                  placeholder="5"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-xs sm:text-sm font-mono text-slate-400">
                    %
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400 shrink-0 flex items-center justify-center gap-1.5 py-1">
                <span>Valid Range:</span>
                <span className="text-slate-300">{formatRaceTime(minTime)}</span>
                <span className="text-slate-400 font-semibold">to</span>
                <span className="text-slate-300">{formatRaceTime(maxTime)}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Batas toleransi deviasi total waktu finish terhadap target durasi (±{(settings.targetTotalTimeMinutes * (settings.allowancePercent / 100)).toFixed(1)} menit)
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="max-reps" className="text-xs sm:text-sm font-medium text-slate-300 block">
              Max Repetitions per Plan
            </label>
            <div className="relative">
              <input
                id="max-reps"
                type="text"
                inputMode="numeric"
                value={settings.maxReps}
                onChange={(e) => handleNumberChange('maxReps', e.target.value)}
                className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 focus:outline-none rounded-lg pl-3 pr-14 py-2 text-sm font-mono text-white placeholder-slate-500 transition-colors"
                placeholder="8"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  stints
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Batas maksimum perulangan stint untuk masing-masing profil plan (Plan A to F)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-400 pb-1.5 border-b border-race-border">
            Pit Lane Regulations
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="normal-pit-duration" className="text-xs sm:text-sm font-medium text-slate-300">
                Normal Pit Duration
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                {(settings.normalPitDurationSeconds / 60).toFixed(2)}m
              </span>
            </div>
            <div className="relative">
              <input
                id="normal-pit-duration"
                type="text"
                inputMode="decimal"
                value={settings.normalPitDurationSeconds || ''}
                onChange={(e) => handleNumberChange('normalPitDurationSeconds', e.target.value)}
                className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 focus:outline-none rounded-lg pl-3 pr-14 py-2 text-sm font-mono text-white placeholder-slate-500 transition-colors"
                placeholder="51.6"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  sec
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Estimasi durasi pit stop standar untuk pengisian bahan bakar (fuel only / splash & go)
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="long-pit-duration" className="text-xs sm:text-sm font-medium text-slate-300">
                Long Pit Duration
              </label>
              <span className="font-mono text-slate-400 text-xs sm:text-sm">
                {(settings.longPitDurationSeconds / 60).toFixed(2)}m
              </span>
            </div>
            <div className="relative">
              <input
                id="long-pit-duration"
                type="text"
                inputMode="decimal"
                value={settings.longPitDurationSeconds || ''}
                onChange={(e) => handleNumberChange('longPitDurationSeconds', e.target.value)}
                className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 focus:outline-none rounded-lg pl-3 pr-14 py-2 text-sm font-mono text-white placeholder-slate-500 transition-colors"
                placeholder="210"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  sec
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Estimasi durasi pit stop khusus untuk pergantian pembalap (driver change) atau servis rem/ban
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="long-pit-count" className="text-xs sm:text-sm font-medium text-slate-300 block">
              Long Pit Count
            </label>
            <div className="relative">
              <input
                id="long-pit-count"
                type="text"
                inputMode="numeric"
                value={settings.longPitCount}
                onChange={(e) => handleNumberChange('longPitCount', e.target.value)}
                className="w-full bg-[#0d1117] border border-race-border focus:border-slate-400 focus:outline-none rounded-lg pl-3 pr-14 py-2 text-sm font-mono text-white placeholder-slate-500 transition-colors"
                placeholder="3"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  stops
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
