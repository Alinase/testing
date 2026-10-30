import React from 'react';
import { SaleRecord, NetworkStatus } from '../types';
import { Database, RefreshCw, CheckCircle, Wifi, WifiOff, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

interface SyncQueueViewerProps {
  queue: SaleRecord[];
  networkStatus: NetworkStatus;
  onSyncQueue: () => Promise<void>;
  isSyncing: boolean;
  onRestoreNetworkAndSync: () => Promise<void>;
}

export const SyncQueueViewer: React.FC<SyncQueueViewerProps> = ({
  queue,
  networkStatus,
  onSyncQueue,
  isSyncing,
  onRestoreNetworkAndSync
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-mono">
              CLIENT-SIDE DURABLE QUEUE
            </span>
            <span className="text-xs text-slate-500">
              Survives Browser Restarts & Electrical Blackouts
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Offline Reconciliation Queue Inspector
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            When network is unavailable, transactions are securely committed to local device storage. Once connectivity resumes, this queue reconciles asynchronously with the cloud.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {networkStatus === 'ONLINE' ? (
            <button
              type="button"
              disabled={queue.length === 0 || isSyncing}
              onClick={onSyncQueue}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Reconciling with Cloud...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Queue Now ({queue.length})</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onRestoreNetworkAndSync}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              title="Restores connection and immediately triggers background reconciliation"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Restore Internet & Reconcile</span>
            </button>
          )}
        </div>
      </div>

      {/* Queue State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Pending Transactions</span>
            <div className="text-2xl font-bold font-mono text-slate-900">{queue.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Total Pending Revenue</span>
            <div className="text-2xl font-bold font-mono text-emerald-700">
              K{queue.reduce((acc, q) => acc + q.totalZMW, 0).toFixed(2)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Internet Telemetry</span>
            <div className="text-base font-bold font-mono text-slate-900 flex items-center gap-1.5 mt-0.5">
              {networkStatus === 'ONLINE' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700">ONLINE (Cloud Reachable)</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-rose-700">OFFLINE (Queuing Active)</span>
                </>
              )}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            networkStatus === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {networkStatus === 'ONLINE' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Queue Item List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Buffered In-Memory & Storage Queue</h3>
          <span className="text-xs text-slate-500 font-mono">FIFO Execution Order</span>
        </div>

        {queue.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
            <h4 className="text-sm font-semibold text-slate-800">Queue is completely synchronized</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All transactions have been verified and saved to the remote cloud datastore. Cut the internet connection in the top bar to test queue buffering.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item, idx) => {
              const secondsWaiting = Math.max(1, Math.round((Date.now() - item.timestamp) / 1000));
              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900">{item.receiptNumber}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                          QUEUED
                        </span>
                        {item.powerCutSurviving && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                            Surviving Reboot
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Buffered {secondsWaiting}s ago ({new Date(item.timestamp).toLocaleTimeString()})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <div className="text-sm font-bold font-mono text-slate-900">
                      K{item.totalZMW.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {item.cashierName || 'Cashier'} · {item.storeName || 'Lusaka Central'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
