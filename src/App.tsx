import { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { PlanConfig, GlobalSettings, StrategyCombination } from './types/strategy';
import {
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_PLANS,
  PresetScenario,
} from './utils/constants';
import { calculatePlanMetrics, generateStrategyCombinations } from './utils/strategyEngine';
import { Header } from './components/Header';
import { GlobalSettingsCard } from './components/GlobalSettingsCard';
import { PlanCard } from './components/PlanCard';
import { SummaryCards } from './components/SummaryCards';
import { CombinationTable } from './components/CombinationTable';
import { StintTimelineModal } from './components/StintTimelineModal';

export function App() {
  const [plans, setPlans] = useLocalStorage<PlanConfig[]>('stratoracer_plans_v2', DEFAULT_PLANS);
  const [globalSettings, setGlobalSettings] = useLocalStorage<GlobalSettings>(
    'stratoracer_settings_v1',
    DEFAULT_GLOBAL_SETTINGS
  );
  const [activePresetName, setActivePresetName] = useState<string | undefined>('8 Hours Endurance');
  const [selectedCombination, setSelectedCombination] = useState<StrategyCombination | null>(null);

  // Calculate metrics per plan
  const calculatedMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculatePlanMetrics>> = {};
    for (const p of plans) {
      map[p.id] = calculatePlanMetrics(p);
    }
    return map;
  }, [plans]);

  // Generate combinations using pruning engine
  const {
    combinations,
    prunedBranchesCount,
    totalCombinationsSearched,
  } = useMemo(() => {
    return generateStrategyCombinations(plans, calculatedMap, globalSettings);
  }, [plans, calculatedMap, globalSettings]);

  // Handle plan updates
  const handlePlanChange = (index: number, updated: PlanConfig) => {
    const next = [...plans];
    next[index] = updated;
    setPlans(next);
  };

  // Handle preset selection
  const handleSelectPreset = (preset: PresetScenario) => {
    setActivePresetName(preset.name);
    setGlobalSettings({
      ...globalSettings,
      targetTotalTimeMinutes: preset.targetMinutes,
      allowancePercent: preset.allowance,
      normalPitDurationSeconds: preset.normalPitSec,
      longPitDurationSeconds: preset.longPitSec,
      longPitCount: preset.longPitCount,
      maxReps: preset.maxReps,
    });
  };

  // Reset all to original factory defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Kembalikan seluruh parameter balapan dan paket stint ke konfigurasi awal pit wall?')) {
      setPlans(DEFAULT_PLANS);
      setGlobalSettings(DEFAULT_GLOBAL_SETTINGS);
      setActivePresetName('8 Hours Endurance');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Telemetry Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Section 1: Global Parameters */}
        <section>
          <GlobalSettingsCard
            settings={globalSettings}
            activePresetName={activePresetName}
            onSelectPreset={handleSelectPreset}
            onResetToDefaults={handleResetToDefaults}
            onChange={(s) => {
              setGlobalSettings(s);
              setActivePresetName(undefined);
            }}
          />
        </section>

        {/* Section 2: Stint Plans (A through F) */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Stint Strategy Matrix (Plan A – F)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Pilih dan sesuaikan profil stint yang ingin disimulasikan. Mode Fuel-based mengalkulasi batas stint dari kapasitas tangki, sedangkan Mode Time-based menghitung kebutuhan bahan bakar untuk durasi target.
              </p>
            </div>
            <div className="text-xs sm:text-sm font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {plans.filter((p) => p.enabled).length} of {plans.length} Plans Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {plans.map((plan, idx) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                calculated={calculatedMap[plan.id]}
                onChange={(updated) => handlePlanChange(idx, updated)}
              />
            ))}
          </div>
        </section>

        {/* Section 3: Summary Insight Metrics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Telemetry Insights & Optimal Strategy
            </h2>
          </div>

          <SummaryCards
            combinations={combinations}
            settings={globalSettings}
            prunedBranchesCount={prunedBranchesCount}
            totalSearched={totalCombinationsSearched}
            onSelectRecommendation={() => {
              if (combinations.length > 0) {
                setSelectedCombination(combinations[0]);
              }
            }}
          />
        </section>

        {/* Section 4: Interactive Strategy Combinations Table */}
        <section className="space-y-3">
          <CombinationTable
            combinations={combinations}
            plans={plans}
            onSelectCombination={(comb) => setSelectedCombination(comb)}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-race-border bg-[#07090d] px-4 sm:px-6 py-5 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            StratoRacer v1.0 • High-Precision Endurance Pit Wall Engine
          </div>
          <div className="text-slate-400">
            Dikembangkan untuk Sim Racer & Tim Balap Ketahanan • Dikelola oleh Xenpul & Mikeyno24
          </div>
        </div>
      </footer>

      {/* Sequence Timeline Modal */}
      {selectedCombination && (
        <StintTimelineModal
          combination={selectedCombination}
          onClose={() => setSelectedCombination(null)}
        />
      )}
    </div>
  );
}

export default App;
