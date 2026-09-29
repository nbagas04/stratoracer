import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-race-border bg-race-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Strato<span className="text-cyan-400">Racer</span>
          </h1>
          <span className="hidden sm:inline-block h-5 w-[1px] bg-race-border" />
          <p className="hidden sm:block text-xs font-mono text-slate-400 uppercase tracking-widest">
            Pit Wall Strategy & Telemetry Engine
          </p>
        </div>

        {/* Tactical Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[11px] sm:text-xs font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase">Pit Wall Active</span>
        </div>
      </div>
    </header>
  );
};
