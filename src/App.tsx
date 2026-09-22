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
import { Car, Lightning, Compass } from '@phosphor-icons/react';

export function App() {
  const [plans, setPlans] = useLocalStorage<PlanConfig[]>('stratoracer_plans_v1', DEFAULT_PLANS);
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
    if (window.confirm('Reset semua input strategi ke pengaturan awal?')) {
      setPlans(DEFAULT_PLANS);
      setGlobalSettings(DEFAULT_GLOBAL_SETTINGS);
      setActivePresetName('8 Hours Endurance');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Telemetry Header */}
      <Header
        onSelectPreset={handleSelectPreset}
        onResetToDefaults={handleResetToDefaults}
        activePresetName={activePresetName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Section 1: Global Parameters */}
        <section>
          <GlobalSettingsCard
            settings={globalSettings}
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
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Car size={18} className="text-cyan-400" />
                Stint Strategy Plans (Plan A – F)
              </h2>
              <p className="text-xs text-slate-400">
                Aktifkan stint yang ingin dibandingkan. Mode Fuel-based menghitung durasi dari tangki; Mode Time-based menghitung kebutuhan liter.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {plans.filter((p) => p.enabled).length} dari {plans.length} plan aktif
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Lightning size={18} className="text-amber-400" weight="fill" />
              Telemetry Insights & Summary
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
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-cyan-400" />
            <span>
              StratoRacer v1.0 • Client-side Zero Lag Calculation Engine
            </span>
          </div>
          <div className="text-slate-400">
            Endurance Racing Strategy Planner • Auto-saved to Browser Storage
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
