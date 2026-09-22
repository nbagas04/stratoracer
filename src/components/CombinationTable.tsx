import React, { useState, useMemo } from 'react';
import {
  DownloadSimple,
  MagnifyingGlass,
  Funnel,
  CaretUp,
  CaretDown,
  Clock,
  Eye,
  Rows,
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
  A: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  B: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  C: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  D: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  E: { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30' },
  F: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
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

  // Toggle sort order or field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    return combinations.filter((item) => {
      // Plan filter
      if (filterPlan !== 'all') {
        if ((item.planCounts[filterPlan] ?? 0) <= 0) return false;
      }

      // Text search
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

  // Pagination
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
    <div className="bg-race-panel border border-race-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Header & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-race-border/80 bg-[#090d14]/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Rows size={18} className="text-cyan-400" />
              Tabel Kombinasi Strategi
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300">
              {filteredData.length} dari {combinations.length} opsi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Klik baris mana saja untuk melihat visualisasi alur timeline stint & pit stop
          </p>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <MagnifyingGlass
              size={14}
              className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari strategi / pit..."
              className="bg-[#0c1018] border border-race-border focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 w-44 sm:w-52 transition-colors outline-none"
            />
          </div>

          {/* Filter by Plan */}
          <div className="flex items-center gap-1 bg-[#0c1018] border border-race-border rounded-xl px-2 py-1">
            <Funnel size={13} className="text-slate-400" />
            <select
              value={filterPlan}
              onChange={(e) => {
                setFilterPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1 font-mono"
            >
              <option value="all" className="bg-slate-900">Semua Plan</option>
              {enabledPlans.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  Hanya Plan {p.id} ({p.label})
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExport}
            disabled={sortedData.length === 0}
            className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Download CSV file of current strategy table"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-race-border/80 bg-[#080b10] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3.5 w-12 text-center">#</th>
              <th className="py-3 px-3.5 min-w-[200px]">Stint Breakdown</th>
              <th className="py-3 px-3 w-16 text-center">Stints</th>
              <th
                onClick={() => handleSort('totalPits')}
                className="py-3 px-3 text-center cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Pits</span>
                  {sortField === 'totalPits' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalTime')}
                className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Race Duration</span>
                  {sortField === 'totalTime' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('delta')}
                className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Delta to Target</span>
                  {sortField === 'delta' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalLaps')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Est. Laps</span>
                  {sortField === 'totalLaps' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalFuel')}
                className="py-3 px-3.5 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Est. Fuel</span>
                  {sortField === 'totalFuel' && (
                    sortOrder === 'asc' ? <CaretUp size={12} /> : <CaretDown size={12} />
                  )}
                </div>
              </th>
              <th className="py-3 px-3 w-16 text-center">Action</th>
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
                    onClick={() => onSelectCombination(item)}
                    className={`hover:bg-cyan-500/[0.04] transition-colors cursor-pointer group ${
                      isOptimal ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3.5 text-center text-slate-400 group-hover:text-cyan-400">
                      {isOptimal ? (
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 inline-flex items-center justify-center text-[10px] font-bold">
                          ★
                        </span>
                      ) : (
                        rank
                      )}
                    </td>

                    {/* Stint Distribution Badges */}
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

                    {/* Total Stints */}
                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {item.totalStints}
                    </td>

                    {/* Pits Breakdown */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-bold text-cyan-300">{item.totalPits}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.longPits}L / {item.normalPits}N
                      </div>
                    </td>

                    {/* Total Duration */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Clock size={13} className="text-cyan-400" />
                        {formatRaceTime(item.totalTimeMinutes)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.totalTimeMinutes.toFixed(2)} min
                      </div>
                    </td>

                    {/* Delta */}
                    <td className="py-3 px-3.5">
                      <span className={`font-semibold ${delta.colorClass}`}>
                        {delta.text}
                      </span>
                    </td>

                    {/* Laps */}
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">
                      {item.totalLaps.toFixed(1)}
                    </td>

                    {/* Fuel */}
                    <td className="py-3 px-3.5 text-right font-bold text-emerald-400">
                      {item.totalFuelLiters.toFixed(1)} L
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCombination(item);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                        title="Lihat Urutan Stint"
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
                  Tidak ada data kombinasi yang sesuai dengan kriteria filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:p-4 border-t border-race-border/80 bg-[#090d14]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span>Menampilkan:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#0c1018] border border-race-border text-slate-200 rounded px-2 py-1 outline-none cursor-pointer"
          >
            <option value={10}>10 baris</option>
            <option value={25}>25 baris</option>
            <option value={50}>50 baris</option>
            <option value={100}>100 baris</option>
          </select>
          <span>
            Halaman {currentPage} dari {totalPages} ({sortedData.length} item)
          </span>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-[#0c1018] border border-race-border text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sebelumnya
          </button>
          <span className="px-2 text-slate-400 font-bold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 rounded bg-[#0c1018] border border-race-border text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
};
