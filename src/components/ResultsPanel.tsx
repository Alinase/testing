import React from 'react';
import { TelemetryMetrics, ArchitectureMode } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, Clock, ShieldCheck, Database } from 'lucide-react';

interface ResultsPanelProps {
  metrics: TelemetryMetrics;
  currentMode: ArchitectureMode;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ metrics, currentMode }) => {
  const saasTotal = metrics.saasCompleted + metrics.saasBlocked;
  const saasReliability = saasTotal > 0 ? Math.round((metrics.saasCompleted / saasTotal) * 100) : 100;
  
  const hybridTotal = metrics.hybridCompleted + metrics.hybridBlocked;
  const hybridReliability = hybridTotal > 0 ? Math.round((metrics.hybridCompleted / hybridTotal) * 100) : 100;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Empirical Research Dimensions (UNZA Thesis Metrics)
            </h2>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">
              Active Evaluation: <strong className="text-slate-700">{currentMode === 'HYBRID' ? 'Hybrid Offline-First' : 'Pure SaaS'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Hybrid Reliability:</span>
              <span className="font-mono font-bold text-emerald-600">{hybridReliability}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Pure SaaS Reliability:</span>
              <span className={`font-mono font-bold ${saasReliability < 100 ? 'text-rose-600' : 'text-slate-700'}`}>
                {saasReliability}%
              </span>
            </div>
          </div>
        </div>

        {/* 6 Key Dimension Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Sales Completed */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Sales Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {metrics.completedSales}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Hybrid: <span className="font-mono text-emerald-700 font-semibold">{metrics.hybridCompleted}</span> · SaaS: <span className="font-mono text-blue-700 font-semibold">{metrics.saasCompleted}</span>
              </div>
            </div>
          </div>

          {/* 2. Sales Blocked */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Sales Blocked</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <div className={`text-xl font-bold font-mono tabular-nums ${metrics.blockedSales > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {metrics.blockedSales}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Outage dropouts (SaaS: {metrics.saasBlocked})
              </div>
            </div>
          </div>

          {/* 3. Revenue Lost */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Revenue Lost</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <div className={`text-xl font-bold font-mono tabular-nums ${metrics.revenueLostZMW > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                K{metrics.revenueLostZMW.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Blocked transaction value
              </div>
            </div>
          </div>

          {/* 4. Sales Waiting to Sync */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Waiting to Sync</span>
              <Database className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {metrics.salesWaitingSync}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                In device durable queue
              </div>
            </div>
          </div>

          {/* 5. Sales Synced */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Sales Synced</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {metrics.salesSynced}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Committed to remote cloud
              </div>
            </div>
          </div>

          {/* 6. Average Time to Sync */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Sync Time</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {metrics.avgSyncTimeMs > 0 ? `${metrics.avgSyncTimeMs}ms` : '--'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Reconciliation latency
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
