import React from 'react';
import {
  FlagBanner,
  ArrowCounterClockwise,
  Gauge,
  Sparkle,
} from '@phosphor-icons/react';
import { PRESET_SCENARIOS, PresetScenario } from '../utils/constants';

interface HeaderProps {
  onSelectPreset: (preset: PresetScenario) => void;
  onResetToDefaults: () => void;
  activePresetName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  onResetToDefaults,
  activePresetName,
}) => {
  return (
    <header className="border-b border-race-border bg-race-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <FlagBanner size={22} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Strato<span className="text-cyan-400">Racer</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                PRO TIMING
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Gauge size={13} className="text-emerald-400" />
              Endurance Pit Stop & Stint Optimization Engine
            </p>
          </div>
        </div>

        {/* Quick Presets & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1 bg-[#090d13] p-1 rounded-lg border border-race-border">
            <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <Sparkle size={12} className="text-amber-400" /> Presets:
            </span>
            {PRESET_SCENARIOS.map((preset) => {
              const isActive = activePresetName === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => onSelectPreset(preset)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={preset.name}
                >
                  {preset.badge}
                </button>
              );
            })}
          </div>

          <button
            onClick={onResetToDefaults}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 bg-slate-900/80 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/60 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Reset form to default values"
          >
            <ArrowCounterClockwise size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
