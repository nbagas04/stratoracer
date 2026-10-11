import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-race-border bg-race-surface sticky top-0 z-30 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              StratoRacer
            </h1>
            <span className="text-[11px] font-mono text-slate-400 font-medium">v1.0</span>
          </div>
          <span className="hidden sm:inline-block h-4 w-[1px] bg-race-border" />
          <p className="hidden sm:block text-xs font-mono text-slate-400">
            Endurance Strategy Engine
          </p>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono text-slate-400 bg-race-panel border border-race-border">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Telemetry Active</span>
        </div>
      </div>
    </header>
  );
};
