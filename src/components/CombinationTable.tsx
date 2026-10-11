import React, { useState, useMemo } from 'react';
import {
  DownloadSimple,
  MagnifyingGlass,
  Funnel,
  CaretUp,
  CaretDown,
  Eye,
} from '@phosphor-icons/react';
import { StrategyCombination, PlanConfig } from '../types/strategy';
import { formatRaceTime, formatDeltaTime } from '../utils/formatters';
import { exportCombinationsToCsv } from '../utils/exportCsv';

interface CombinationTableProps {
  combinations: StrategyCombination[];
  plans: PlanConfig[];
  onSelectCombination: (comb: StrategyCombination) => void;
}

type SortField = 'delta' | 'totalPits' | 'totalTime' | 'totalLaps' | 'totalFuel';
type SortOrder = 'asc' | 'desc';

const PLAN_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-slate-800', text: 'text-sky-300', border: 'border-slate-700' },
  B: { bg: 'bg-slate-800', text: 'text-emerald-300', border: 'border-slate-700' },
  C: { bg: 'bg-slate-800', text: 'text-amber-300', border: 'border-slate-700' },
  D: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
  E: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
  F: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
};

export const CombinationTable: React.FC<CombinationTableProps> = ({
  combinations,
  plans,
  onSelectCombination,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('delta');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    return combinations.filter((item) => {
      if (filterPlan !== 'all') {
        if ((item.planCounts[filterPlan] ?? 0) <= 0) return false;
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesSummary = item.activePlansSummary.toLowerCase().includes(query);
        const matchesPits = `${item.totalPits} pit`.includes(query);
        const matchesTime = formatRaceTime(item.totalTimeMinutes).toLowerCase().includes(query);
        if (!matchesSummary && !matchesPits && !matchesTime) return false;
      }

      return true;
    });
  }, [combinations, filterPlan, searchTerm]);

  const sortedData = useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'delta':
          comparison = Math.abs(a.deltaMinutes) - Math.abs(b.deltaMinutes);
          break;
        case 'totalPits':
          comparison = a.totalPits - b.totalPits;
          break;
        case 'totalTime':
          comparison = a.totalTimeMinutes - b.totalTimeMinutes;
          break;
        case 'totalLaps':
          comparison = a.totalLaps - b.totalLaps;
          break;
        case 'totalFuel':
          comparison = a.totalFuelLiters - b.totalFuelLiters;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredData, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleExport = () => {
    exportCombinationsToCsv(sortedData);
  };

  const enabledPlans = plans.filter((p) => p.enabled);

  return (
    <div className="bg-race-surface border border-race-border rounded-xl shadow-xl overflow-hidden flex flex-col">
      {/* Header & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-race-border bg-[#11161d] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Pit Wall Strategy Matrix
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
              {filteredData.length} of {combinations.length} strategies
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pilih salah satu skenario untuk membedah urutan stint, pit window, dan kalkulasi race clock
          </p>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <MagnifyingGlass
              size={14}
              className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              aria-label="Search plan, pits, or duration"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search plan, pits, duration..."
              className="bg-[#0d1117] border border-race-border focus:border-slate-400 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 w-44 sm:w-56 transition-colors outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#0d1117] border border-race-border rounded-lg px-2 py-1">
            <Funnel size={13} className="text-slate-400" />
            <select
              aria-label="Filter by Plan"
              value={filterPlan}
              onChange={(e) => {
                setFilterPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1 font-mono"
            >
              <option value="all" className="bg-slate-900">All Plans</option>
              {enabledPlans.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  Plan {p.id} ({p.label})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={sortedData.length === 0}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Unduh tabel perbandingan strategi dalam format CSV"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-race-border bg-[#0d1117] text-slate-300 font-mono uppercase tracking-wider text-xs font-bold">
              <th scope="col" className="py-3 px-3.5 w-12 text-center">#</th>
              <th scope="col" className="py-3 px-3.5 min-w-[200px]">Stint Breakdown</th>
              <th scope="col" className="py-3 px-3 w-16 text-center">Total Stints</th>
              <th
                scope="col"
                aria-sort={sortField === 'totalPits' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="py-3 px-3 text-center"
              >
                <button
                  type="button"
                  onClick={() => handleSort('totalPits')}
                  className="w-full flex items-center justify-center gap-1 font-mono uppercase tracking-wider text-xs font-bold text-slate-300 hover:text-white transition-colors focus:outline-none focus:text-sky-300"
                >
                  <span>Pit Stops</span>
                  {sortField === 'totalPits' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortField === 'totalTime' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="py-3 px-3.5"
              >
                <button
                  type="button"
                  onClick={() => handleSort('totalTime')}
                  className="flex items-center gap-1 font-mono uppercase tracking-wider text-xs font-bold text-slate-300 hover:text-white transition-colors focus:outline-none focus:text-sky-300"
                >
                  <span>Race Duration</span>
                  {sortField === 'totalTime' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortField === 'delta' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="py-3 px-3.5"
              >
                <button
                  type="button"
                  onClick={() => handleSort('delta')}
                  className="flex items-center gap-1 font-mono uppercase tracking-wider text-xs font-bold text-slate-300 hover:text-white transition-colors focus:outline-none focus:text-sky-300"
                >
                  <span>Delta to Target</span>
                  {sortField === 'delta' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortField === 'totalLaps' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="py-3 px-3 text-right"
              >
                <button
                  type="button"
                  onClick={() => handleSort('totalLaps')}
                  className="w-full flex items-center justify-end gap-1 font-mono uppercase tracking-wider text-xs font-bold text-slate-300 hover:text-white transition-colors focus:outline-none focus:text-sky-300"
                >
                  <span>Est. Total Laps</span>
                  {sortField === 'totalLaps' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortField === 'totalFuel' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="py-3 px-3.5 text-right"
              >
                <button
                  type="button"
                  onClick={() => handleSort('totalFuel')}
                  className="w-full flex items-center justify-end gap-1 font-mono uppercase tracking-wider text-xs font-bold text-slate-300 hover:text-white transition-colors focus:outline-none focus:text-sky-300"
                >
                  <span>Est. Total Fuel</span>
                  {sortField === 'totalFuel' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </button>
              </th>
              <th scope="col" className="py-3 px-3 w-16 text-center">Timeline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-race-border/40 font-mono">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const rank = (currentPage - 1) * pageSize + index + 1;
                const delta = formatDeltaTime(item.deltaMinutes, item.deltaPercent);
                const isOptimal = rank === 1 && sortField === 'delta';

                return (
                  <tr
                    key={item.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Strategy rank ${rank}: ${item.activePlansSummary}, duration ${formatRaceTime(item.totalTimeMinutes)}`}
                    onClick={() => onSelectCombination(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectCombination(item);
                      }
                    }}
                    className={`hover:bg-slate-800/40 focus:bg-slate-800/60 focus:outline-none focus:ring-1 focus:ring-slate-500/50 transition-colors cursor-pointer group ${
                      isOptimal ? 'bg-sky-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 text-center text-slate-400 group-hover:text-slate-200">
                      {isOptimal ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-sky-400 border border-slate-700">
                          #1
                        </span>
                      ) : (
                        rank
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {Object.entries(item.planCounts).map(([id, count]) => {
                          if (count <= 0) return null;
                          const badge = PLAN_BADGES[id] || PLAN_BADGES.A;
                          return (
                            <span
                              key={id}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {count}x {id}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {item.totalStints}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="font-bold text-white">{item.totalPits}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.normalPits} Norm / {item.longPits} Long
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white">
                        {formatRaceTime(item.totalTimeMinutes)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.totalTimeMinutes.toFixed(2)} min
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className={`font-semibold ${delta.colorClass}`}>
                        {delta.text}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-200 font-bold">
                      {item.totalLaps.toFixed(1)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-bold text-slate-200">
                      {item.totalFuelLiters.toFixed(1)} L
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCombination(item);
                        }}
                        aria-label={`Buka visualisasi alur timeline stint rank ${rank}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-500/50"
                        title="Buka visualisasi alur timeline stint"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs font-mono">
                  Tidak ditemukan kombinasi strategi yang cocok dengan filter atau kata kunci pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:p-4 border-t border-race-border bg-[#11161d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span>Show:</span>
          <select
            aria-label="Strategies per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#0d1117] border border-race-border text-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <span>
            Page {currentPage} of {totalPages} ({sortedData.length} strategies)
          </span>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-[#0d1117] border border-race-border text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-2 text-slate-400 font-bold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 rounded bg-[#0d1117] border border-race-border text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
