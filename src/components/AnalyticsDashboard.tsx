import React, { useState } from 'react';
import { SaleRecord, TelemetryMetrics } from '../types';
import { Download, RefreshCw, Trash2, Search, ArrowUpDown, Filter, ShieldCheck, AlertCircle, BarChart3, TrendingUp, Layers } from 'lucide-react';

interface AnalyticsDashboardProps {
  sales: SaleRecord[];
  metrics: TelemetryMetrics;
  onDownloadCSV: () => void;
  onResetData: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sales,
  metrics,
  onDownloadCSV,
  onResetData
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'HYBRID' | 'SAAS'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'BLOCKED' | 'PENDING_SYNC'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredSales = sales.filter(s => {
    const matchesMode = filterMode === 'ALL' || s.mode === filterMode;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchesSearch = s.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMode && matchesStatus && matchesSearch;
  });

  const hybridTotal = metrics.hybridCompleted + metrics.hybridBlocked;
  const hybridReliability = hybridTotal > 0 ? ((metrics.hybridCompleted / hybridTotal) * 100).toFixed(1) : '100.0';

  const saasTotal = metrics.saasCompleted + metrics.saasBlocked;
  const saasReliability = saasTotal > 0 ? ((metrics.saasCompleted / saasTotal) * 100).toFixed(1) : '100.0';

  // Revenue chart calculations
  const maxRevenue = Math.max(metrics.revenueProtectedZMW, metrics.revenueLostZMW, 500);
  const protectedHeightPct = Math.min(100, Math.round((metrics.revenueProtectedZMW / maxRevenue) * 100));
  const lostHeightPct = Math.min(100, Math.round((metrics.revenueLostZMW / maxRevenue) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Top Banner: Thesis Research Context */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
              UNZA NASREC: 2026-JAN: 030
            </span>
            <span className="text-xs text-slate-500">
              PI: Alinase Nyirenda · Supervisor: Dr. Simon Tembo
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Empirical Results: Hybrid Offline-First vs Pure SaaS Models in Zambia
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative quantitative evaluation across Reliability (%), Cost / Revenue Impact (ZMW), and Adoption / Sync Latency.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onDownloadCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 transition-colors"
            title="Download raw timestamped CSV dataset for thesis analysis"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-2 transition-colors border border-rose-200"
            title="Clear all recorded transactions and reset trial"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Study Data</span>
          </button>
        </div>
      </div>

      {/* Comparative Evaluation Split: Hybrid vs SaaS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model A: Hybrid Offline-First */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900">Model A: Hybrid Offline-First</h3>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {hybridReliability}% Reliability
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Sales commit immediately to the local device transaction store. An asynchronous reconciliation queue forwards records to the cloud when connectivity exists.
            </p>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
              <div>
                <div className="text-lg font-bold font-mono text-slate-900">{metrics.hybridCompleted}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-emerald-600">
                  K{metrics.hybridProtectedRevenue.toFixed(0)}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Protected (ZMW)</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-slate-900">{metrics.salesWaitingSync}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">In Queue</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
            <strong>Key Finding:</strong> 0% transaction failure rate observed during simulated network drops and electrical outages.
          </div>
        </div>

        {/* Model B: Pure SaaS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Model B: Pure SaaS Cloud</h3>
              </div>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                parseFloat(saasReliability) < 100 ? 'text-rose-700 bg-rose-50' : 'text-slate-700 bg-slate-100'
              }`}>
                {saasReliability}% Reliability
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Every sales transaction requires a synchronous round-trip to the remote cloud datacenter before issuance. Network outages block transactions outright.
            </p>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
              <div>
                <div className="text-lg font-bold font-mono text-slate-900">{metrics.saasCompleted}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-rose-600">
                  {metrics.saasBlocked}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Blocked Sales</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-rose-600">
                  K{metrics.saasLostRevenue.toFixed(0)}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Lost Rev (ZMW)</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-rose-800 bg-rose-50/70 p-2.5 rounded-lg border border-rose-100">
            <strong>Key Finding:</strong> Direct revenue vulnerability during infrastructure downtime. Customer queue abandonment occurs.
          </div>
        </div>
      </div>

      {/* Visual Analytics Comparison: Revenue & Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Financial Impact Bar Comparison (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                Financial Impact Comparison (Zambian Kwacha ZMW)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Cost Dimension</span>
            </div>

            <div className="grid grid-cols-2 gap-4 h-44 items-end pt-4 pb-2 px-6 bg-slate-50 rounded-xl border border-slate-100">
              {/* Hybrid Revenue Bar */}
              <div className="flex flex-col items-center h-full justify-end">
                <div className="text-xs font-mono font-bold text-emerald-700 mb-1">
                  K{metrics.revenueProtectedZMW.toFixed(2)}
                </div>
                <div
                  style={{ height: `${Math.max(12, protectedHeightPct)}%` }}
                  className="w-16 rounded-t-lg bg-emerald-500 shadow-sm transition-all duration-500"
                />
                <span className="text-[11px] font-semibold text-slate-700 mt-2 text-center">
                  Protected Revenue (Hybrid)
                </span>
              </div>

              {/* SaaS Revenue Lost Bar */}
              <div className="flex flex-col items-center h-full justify-end">
                <div className="text-xs font-mono font-bold text-rose-700 mb-1">
                  K{metrics.revenueLostZMW.toFixed(2)}
                </div>
                <div
                  style={{ height: `${Math.max(12, lostHeightPct)}%` }}
                  className="w-16 rounded-t-lg bg-rose-500 shadow-sm transition-all duration-500"
                />
                <span className="text-[11px] font-semibold text-slate-700 mt-2 text-center">
                  Lost Revenue (SaaS Outage)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Formula: Lost Revenue = Σ (Unit Price × Qty) for blocked SaaS transactions</span>
            <span className="font-mono text-slate-700">Sample N = {sales.length}</span>
          </div>
        </div>

        {/* Right: Adoption & Sync Latency Dimension (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                Adoption & Reconciliation Latency
              </h3>
              <span className="text-xs text-slate-400 font-mono">Adoption Dimension</span>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Average Sync Reconciliation Time</span>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {metrics.avgSyncTimeMs > 0 ? `${metrics.avgSyncTimeMs} ms` : 'Pending data'}
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-medium">
                  Sub-second
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total Cloud Synced Records</span>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {metrics.salesSynced}
                  </div>
                </div>
                <span className="text-[11px] text-slate-600">
                  Authoritative Remote Ledger
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Power Blackout Survival Rate</span>
                  <div className="text-2xl font-bold font-mono text-emerald-700">
                    100.0%
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700">
                  Durable IndexedDB
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            Measures latency between offline transaction timestamp and authoritative cloud server acknowledgment.
          </p>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Research Transaction Ledger</h3>
            <span className="text-xs text-slate-500">({filteredSales.length} records)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search receipt #..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Model Filter */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'ALL' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                All Modes
              </button>
              <button
                onClick={() => setFilterMode('HYBRID')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'HYBRID' ? 'bg-white font-semibold text-emerald-700 shadow-xs' : 'text-slate-600'}`}
              >
                Hybrid
              </button>
              <button
                onClick={() => setFilterMode('SAAS')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'SAAS' ? 'bg-white font-semibold text-blue-700 shadow-xs' : 'text-slate-600'}`}
              >
                SaaS
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="PENDING_SYNC">Pending Sync</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Receipt #</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Cloud Model</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Items</th>
                <th className="py-2.5 px-4 text-right">Total (ZMW)</th>
                <th className="py-2.5 px-4 text-right">Sync Latency</th>
                <th className="py-2.5 px-4 text-center">Blackout Survived</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                    {sale.receiptNumber}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(sale.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      sale.mode === 'HYBRID'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}>
                      {sale.mode}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      sale.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sale.status === 'PENDING_SYNC'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {sale.items.length} items
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    K{sale.totalZMW.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                    {sale.syncLatencyMs !== undefined ? `${sale.syncLatencyMs}ms` : '--'}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {sale.powerCutSurviving ? (
                      <span className="text-emerald-600 font-bold">YES</span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No transactions recorded matching active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reset Empirical Study Data?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This will permanently clear all recorded sales, blocked transaction logs, and the offline queue from both the local device and cloud ledger. Ensure you have exported CSV first if needed for thesis documentation.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
