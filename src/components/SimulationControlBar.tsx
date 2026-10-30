import React, { useState } from 'react';
import { ArchitectureMode, NetworkStatus } from '../types';
import { Wifi, WifiOff, Zap, RefreshCw, Play, Info } from 'lucide-react';

interface SimulationControlBarProps {
  mode: ArchitectureMode;
  onModeChange: (mode: ArchitectureMode) => void;
  networkStatus: NetworkStatus;
  onToggleNetwork: () => void;
  onTriggerPowerCut: () => void;
  onRunAutoExperiment: () => void;
  isSimulating: boolean;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({
  mode,
  onModeChange,
  networkStatus,
  onToggleNetwork,
  onTriggerPowerCut,
  onRunAutoExperiment,
  isSimulating
}) => {
  const [showPowerCutConfirm, setShowPowerCutConfirm] = useState(false);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Cloud Architecture:
            </span>
            <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700/60">
              <button
                type="button"
                onClick={() => onModeChange('HYBRID')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
                  mode === 'HYBRID'
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                Hybrid Offline-First
              </button>
              <button
                type="button"
                onClick={() => onModeChange('SAAS')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
                  mode === 'SAAS'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                Pure SaaS
              </button>
            </div>
            
            {/* Mode Explanatory Pill */}
            <div className="text-xs text-slate-300 max-w-md hidden xl:block">
              {mode === 'HYBRID' ? (
                <span className="text-emerald-300">
                  Local-first commit + auto-sync queue. Sales continue uninterrupted during outages.
                </span>
              ) : (
                <span className="text-blue-300">
                  Cloud-synchronous commit. Outages immediately block checkout and trigger lost revenue.
                </span>
              )}
            </div>
          </div>

          {/* Right: Outage & Experiment Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Connection Toggle Button */}
            <button
              type="button"
              onClick={onToggleNetwork}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                networkStatus === 'ONLINE'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-rose-600 text-white border border-rose-500 hover:bg-rose-500'
              }`}
              title="Click to cut or restore internet connectivity"
            >
              {networkStatus === 'ONLINE' ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Internet: Online</span>
                  <span className="text-[10px] text-emerald-400 font-normal">(Click to Cut)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Internet: CUT (Offline)</span>
                  <span className="text-[10px] text-rose-200 font-normal">(Click to Restore)</span>
                </>
              )}
            </button>

            {/* Power Cut Button */}
            <button
              type="button"
              onClick={() => setShowPowerCutConfirm(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-2 transition-colors"
              title="Simulates load shedding power cut. Restarts page to test local data survival."
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Power Cut (Reboot)</span>
            </button>

            {/* Automated Comparative Experiment Runner */}
            <button
              type="button"
              disabled={isSimulating}
              onClick={onRunAutoExperiment}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
              title="Executes automated multi-scenario test batch comparing Hybrid vs SaaS under network drops"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Testing Scenarios...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                  <span>Run Outage Trial</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Power Cut Confirmation Modal */}
      {showPowerCutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Simulate Load-Shedding Blackout</h3>
                <p className="text-xs text-slate-400">UNZA Fault Tolerance Empirical Test</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              This action simulates an abrupt commercial electrical failure common in Zambian retail centers. The page will instantly crash and reload.
              <br /><br />
              <strong className="text-emerald-400">Hypothesis to verify:</strong> Any unsynced sales stored in the device's persistent offline queue will survive intact and resume synchronization once restored.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPowerCutConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPowerCutConfirm(false);
                  onTriggerPowerCut();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Cut Power & Reboot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
