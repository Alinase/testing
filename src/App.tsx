import React, { useState, useEffect } from 'react';
import { ArchitectureMode, NetworkStatus, SaleRecord, SaleItem, User, TelemetryMetrics } from './types';
import { INITIAL_PRODUCTS, DEFAULT_USERS } from './data/mockProducts';
import { StorageService } from './services/storage';
import { CloudApi } from './services/cloudApi';
import { Navbar } from './components/Navbar';
import { SimulationControlBar } from './components/SimulationControlBar';
import { ResultsPanel } from './components/ResultsPanel';
import { PosTerminal } from './components/PosTerminal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SyncQueueViewer } from './components/SyncQueueViewer';
import { ResearchProtocolModal } from './components/ResearchProtocolModal';
import { AuthModal } from './components/AuthModal';
import { Zap, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'analytics' | 'queue' | 'protocol'>('pos');
  const [mode, setMode] = useState<ArchitectureMode>('HYBRID');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('ONLINE');
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [queue, setQueue] = useState<SaleRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USERS[0]);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isProcessingSale, setIsProcessingSale] = useState<boolean>(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [powerCutNotice, setPowerCutNotice] = useState<{ recovered: boolean; count: number } | null>(null);
  const [isBlackoutFlicker, setIsBlackoutFlicker] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from storage & check power-cut recovery
  useEffect(() => {
    const savedMode = StorageService.getMode();
    const savedNetwork = StorageService.getNetworkStatus();
    let savedSales = StorageService.getLocalSales();
    const savedQueue = StorageService.getOfflineQueue();

    setMode(savedMode);
    setNetworkStatus(savedNetwork);
    setQueue(savedQueue);

    // Check if page rebooted from a simulated load shedding power cut
    const recovery = StorageService.checkPowerCutRecovery();
    if (recovery.recovered) {
      setPowerCutNotice(recovery);
      // Mark surviving sales
      savedSales = savedSales.map(s => {
        if (s.status === 'PENDING_SYNC') {
          return { ...s, powerCutSurviving: true };
        }
        return s;
      });
      StorageService.saveLocalSales(savedSales);
    } else if (savedSales.length === 0) {
      // Seed initial realistic baseline demonstration sales for research presentation
      const initialSeed: SaleRecord[] = [
        {
          id: 'sale_init_01',
          receiptNumber: 'RCP-2026-0012',
          timestamp: Date.now() - 3600000,
          mode: 'HYBRID',
          status: 'COMPLETED',
          items: [
            { id: 'prod_01', name: 'Breakfast Meal 25kg (National Milling)', category: 'Staple Food', priceZMW: 330, quantity: 1, totalZMW: 330 },
            { id: 'prod_03', name: 'White Spoon Sugar 2kg (Zambia Sugar)', category: 'Staple Food', priceZMW: 68, quantity: 2, totalZMW: 136 }
          ],
          totalZMW: 466.00,
          syncLatencyMs: 42,
          cloudReceivedAt: Date.now() - 3599958,
          cashierName: 'Chileshe Mwape',
          storeName: 'Lusaka Central Mart'
        },
        {
          id: 'sale_init_02',
          receiptNumber: 'RCP-2026-0013',
          timestamp: Date.now() - 1800000,
          mode: 'SAAS',
          status: 'COMPLETED',
          items: [
            { id: 'prod_04', name: 'D’lite Cooking Oil 2L (Trade Kings)', category: 'Staple Food', priceZMW: 95, quantity: 2, totalZMW: 190 },
            { id: 'prod_05', name: 'Manzi Natural Mineral Water 500ml', category: 'Beverages', priceZMW: 8.5, quantity: 4, totalZMW: 34 }
          ],
          totalZMW: 224.00,
          syncLatencyMs: 110,
          cloudReceivedAt: Date.now() - 1799890,
          cashierName: 'Chileshe Mwape',
          storeName: 'Lusaka Central Mart'
        }
      ];
      savedSales = initialSeed;
      StorageService.saveLocalSales(savedSales);
    }

    setSales(savedSales);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Switch architecture mode
  const handleModeChange = (newMode: ArchitectureMode) => {
    setMode(newMode);
    StorageService.setMode(newMode);
    showToast(`Switched cloud model to: ${newMode === 'HYBRID' ? 'Hybrid Offline-First' : 'Pure SaaS'}`);
  };

  // Toggle simulated internet connection
  const handleToggleNetwork = async () => {
    const nextStatus = networkStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setNetworkStatus(nextStatus);
    StorageService.setNetworkStatus(nextStatus);

    if (nextStatus === 'ONLINE') {
      showToast('Internet connection RESTORED. Cloud datacenter is reachable.');
      // Auto-trigger background sync if Hybrid mode has pending items
      const currentQueue = StorageService.getOfflineQueue();
      if (currentQueue.length > 0) {
        await executeSync(currentQueue, true);
      }
    } else {
      showToast('Internet connection CUT. Operating in simulated offline blackout.');
    }
  };

  // Simulate load shedding power cut
  const handleTriggerPowerCut = () => {
    StorageService.triggerPowerCut();
    setIsBlackoutFlicker(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  // Checkout execution
  const handleCompleteSale = async (items: SaleItem[], totalZMW: number): Promise<{ success: boolean; sale?: SaleRecord; error?: string }> => {
    setIsProcessingSale(true);
    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = Date.now();

    const saleDraft: SaleRecord = {
      id: `sale_${now}_${Math.random().toString(36).substring(2, 7)}`,
      receiptNumber: receiptNum,
      timestamp: now,
      mode,
      status: 'COMPLETED',
      items,
      totalZMW,
      cashierName: currentUser.name,
      storeName: 'Lusaka Central Mart'
    };

    try {
      if (mode === 'HYBRID') {
        if (networkStatus === 'ONLINE') {
          // Commit to cloud
          const cloudRes = await CloudApi.commitSale(saleDraft, true);
          const finalSale: SaleRecord = cloudRes.sale || {
            ...saleDraft,
            cloudReceivedAt: Date.now(),
            syncLatencyMs: 38
          };

          const updatedSales = [finalSale, ...sales];
          setSales(updatedSales);
          StorageService.saveLocalSales(updatedSales);
          showToast(`Hybrid Sale ${receiptNum} completed & synced to cloud in ${finalSale.syncLatencyMs}ms`);
          return { success: true, sale: finalSale };
        } else {
          // Save to local device storage & append to offline queue
          const offlineSale: SaleRecord = {
            ...saleDraft,
            status: 'PENDING_SYNC'
          };

          const updatedSales = [offlineSale, ...sales];
          const updatedQueue = [...queue, offlineSale];

          setSales(updatedSales);
          setQueue(updatedQueue);
          StorageService.saveLocalSales(updatedSales);
          StorageService.saveOfflineQueue(updatedQueue);

          showToast(`Hybrid Sale ${receiptNum} saved locally! Queued for auto-sync once connection returns.`);
          return { success: true, sale: offlineSale };
        }
      } else {
        // Pure SaaS Mode
        if (networkStatus === 'ONLINE') {
          const cloudRes = await CloudApi.commitSale(saleDraft, true);
          const finalSale: SaleRecord = cloudRes.sale || {
            ...saleDraft,
            cloudReceivedAt: Date.now(),
            syncLatencyMs: 95
          };

          const updatedSales = [finalSale, ...sales];
          setSales(updatedSales);
          StorageService.saveLocalSales(updatedSales);
          showToast(`Pure SaaS Sale ${receiptNum} confirmed by cloud round-trip.`);
          return { success: true, sale: finalSale };
        } else {
          // Network offline -> Pure SaaS rejects transaction outright
          const blockedSale: SaleRecord = {
            ...saleDraft,
            status: 'BLOCKED',
            failureReason: 'ERR_TIMEOUT: Pure SaaS cloud server unreachable during network outage.'
          };

          const updatedSales = [blockedSale, ...sales];
          setSales(updatedSales);
          StorageService.saveLocalSales(updatedSales);

          return {
            success: false,
            sale: blockedSale,
            error: 'Pure SaaS Error: Cannot complete sale without active internet connection. Transaction blocked and K' + totalZMW.toFixed(2) + ' recorded as lost revenue.'
          };
        }
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsProcessingSale(false);
    }
  };

  // Reconcile pending queue
  const executeSync = async (batch: SaleRecord[], isOnline: boolean) => {
    if (batch.length === 0 || !isOnline) return;
    setIsSyncingQueue(true);

    try {
      const res = await CloudApi.syncBatch(batch, isOnline);
      if (res.success && res.processed) {
        // Update sales records matching the processed queue items
        const processedMap = new Map(res.processed.map(p => [p.id, p]));
        const updatedSales = sales.map(s => {
          if (processedMap.has(s.id)) {
            return processedMap.get(s.id)!;
          }
          return s;
        });

        setSales(updatedSales);
        setQueue([]);
        StorageService.saveLocalSales(updatedSales);
        StorageService.saveOfflineQueue([]);
        showToast(`Auto-reconciliation complete: ${res.syncedCount} queued sales successfully synced to cloud!`);
      }
    } catch (err) {
      console.error('Queue sync failure:', err);
    } finally {
      setIsSyncingQueue(false);
    }
  };

  const handleManualSync = async () => {
    if (networkStatus !== 'ONLINE') {
      showToast('Cannot synchronize: Internet is currently cut. Restore connection first.');
      return;
    }
    await executeSync(queue, true);
  };

  const handleRestoreAndSync = async () => {
    setNetworkStatus('ONLINE');
    StorageService.setNetworkStatus('ONLINE');
    await executeSync(queue, true);
  };

  // Automated Scenario Test Runner (for rapid presentations and empirical evaluation)
  const handleRunAutoExperiment = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    showToast('Starting automated multi-scenario outage trial...');

    try {
      // 1. Online Hybrid sale
      setMode('HYBRID');
      StorageService.setMode('HYBRID');
      setNetworkStatus('ONLINE');
      StorageService.setNetworkStatus('ONLINE');
      await new Promise(r => setTimeout(r, 600));

      await handleCompleteSale([
        { id: 'prod_01', name: 'Breakfast Meal 25kg', category: 'Staple Food', priceZMW: 330, quantity: 1, totalZMW: 330 }
      ], 330);

      // 2. Cut connection & execute Hybrid offline sale
      await new Promise(r => setTimeout(r, 800));
      setNetworkStatus('OFFLINE');
      StorageService.setNetworkStatus('OFFLINE');
      showToast('Trial: Internet cut! Executing Hybrid sale during outage...');

      await new Promise(r => setTimeout(r, 800));
      await handleCompleteSale([
        { id: 'prod_10', name: 'TotalEnergies LPG Gas 6kg', category: 'Energy & Power', priceZMW: 215, quantity: 1, totalZMW: 215 },
        { id: 'prod_03', name: 'White Spoon Sugar 2kg', category: 'Staple Food', priceZMW: 68, quantity: 2, totalZMW: 136 }
      ], 351);

      // 3. Switch to SaaS while offline and attempt checkout
      await new Promise(r => setTimeout(r, 800));
      setMode('SAAS');
      StorageService.setMode('SAAS');
      showToast('Trial: Switched to Pure SaaS while offline! Attempting sale...');

      await new Promise(r => setTimeout(r, 800));
      await handleCompleteSale([
        { id: 'prod_11', name: 'Solar Emergency LED Bulb 15W', category: 'Energy & Power', priceZMW: 125, quantity: 2, totalZMW: 250 }
      ], 250);

      // 4. Restore connection & switch back to Hybrid
      await new Promise(r => setTimeout(r, 800));
      setMode('HYBRID');
      StorageService.setMode('HYBRID');
      setNetworkStatus('ONLINE');
      StorageService.setNetworkStatus('ONLINE');
      showToast('Trial: Restoring connection and auto-reconciling queue...');

      const latestQueue = StorageService.getOfflineQueue();
      await executeSync(latestQueue, true);

      showToast('Automated trial complete! Check the Research Dashboard for comparative statistics.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDownloadCSV = () => {
    CloudApi.downloadCSV(sales);
    showToast('Research dataset CSV downloaded successfully.');
  };

  const handleResetData = async () => {
    StorageService.clearAllData();
    await CloudApi.resetCloud();
    setSales([]);
    setQueue([]);
    showToast('Study database successfully reset.');
  };

  const metrics: TelemetryMetrics = StorageService.calculateMetrics(sales, queue);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans transition-opacity ${
      isBlackoutFlicker ? 'opacity-0 bg-black' : 'opacity-100'
    }`}>
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenUserModal={() => setShowAuthModal(true)}
        pendingQueueCount={queue.length}
      />

      {/* 2. Simulation Control Bar */}
      <SimulationControlBar
        mode={mode}
        onModeChange={handleModeChange}
        networkStatus={networkStatus}
        onToggleNetwork={handleToggleNetwork}
        onTriggerPowerCut={handleTriggerPowerCut}
        onRunAutoExperiment={handleRunAutoExperiment}
        isSimulating={isSimulating}
      />

      {/* 3. Research Results KPI Panel */}
      <ResultsPanel metrics={metrics} currentMode={mode} />

      {/* Power Cut Recovery Alert Banner */}
      {powerCutNotice && (
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <Zap className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                <strong>Load-Shedding Blackout Survived:</strong> System rebooted successfully. All{' '}
                <span className="font-mono font-bold underline">{powerCutNotice.count} unsynced sales</span> survived in client durable storage with zero data loss!
              </span>
            </div>
            <button
              onClick={() => setPowerCutNotice(null)}
              className="p-1 text-emerald-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'pos' && (
          <PosTerminal
            products={INITIAL_PRODUCTS}
            currentMode={mode}
            networkStatus={networkStatus}
            currentUser={currentUser}
            onCompleteSale={handleCompleteSale}
            isProcessing={isProcessingSale}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            sales={sales}
            metrics={metrics}
            onDownloadCSV={handleDownloadCSV}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'queue' && (
          <SyncQueueViewer
            queue={queue}
            networkStatus={networkStatus}
            onSyncQueue={handleManualSync}
            isSyncing={isSyncingQueue}
            onRestoreNetworkAndSync={handleRestoreAndSync}
          />
        )}

        {activeTab === 'protocol' && (
          <ResearchProtocolModal onClose={() => setActiveTab('pos')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>UNZA NASREC: 2026-JAN: 030</strong> · Principal Investigator: Alinase Nyirenda · Dr. Simon Tembo (Supervisor)
          </div>
          <div className="text-slate-400">
            A Comparative Study of Cloud Service Models in Cloud Computing: A Case Study of Zambia
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* User Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onSelectUser={setCurrentUser}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
