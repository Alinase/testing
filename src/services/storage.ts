import { ArchitectureMode, NetworkStatus, SaleRecord, TelemetryMetrics } from '../types';

const STORAGE_KEYS = {
  SALES: 'unza_study_sales_ledger_v1',
  QUEUE: 'unza_study_offline_queue_v1',
  NETWORK: 'unza_study_network_status_v1',
  MODE: 'unza_study_architecture_mode_v1',
  POWER_CUT: 'unza_study_power_cut_event_v1',
  RECOVERY_ALERT: 'unza_study_recovery_alert_v1'
};

export const StorageService = {
  getLocalSales(): SaleRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLocalSales(sales: SaleRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (err) {
      console.error('Failed to write sales to local storage:', err);
    }
  },

  getOfflineQueue(): SaleRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOfflineQueue(queue: SaleRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
    } catch (err) {
      console.error('Failed to write queue to local storage:', err);
    }
  },

  getNetworkStatus(): NetworkStatus {
    try {
      const status = localStorage.getItem(STORAGE_KEYS.NETWORK);
      return (status as NetworkStatus) || 'ONLINE';
    } catch {
      return 'ONLINE';
    }
  },

  setNetworkStatus(status: NetworkStatus) {
    try {
      localStorage.setItem(STORAGE_KEYS.NETWORK, status);
    } catch (err) {
      console.error('Failed to set network status:', err);
    }
  },

  getMode(): ArchitectureMode {
    try {
      const mode = localStorage.getItem(STORAGE_KEYS.MODE);
      return (mode as ArchitectureMode) || 'HYBRID';
    } catch {
      return 'HYBRID';
    }
  },

  setMode(mode: ArchitectureMode) {
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
    } catch (err) {
      console.error('Failed to set architecture mode:', err);
    }
  },

  triggerPowerCut() {
    const queue = this.getOfflineQueue();
    const payload = {
      triggeredAt: Date.now(),
      unsyncedCount: queue.length,
      queueSampleIds: queue.map(q => q.id)
    };
    localStorage.setItem(STORAGE_KEYS.POWER_CUT, JSON.stringify(payload));
  },

  checkPowerCutRecovery(): { recovered: boolean; count: number; timestamp?: number } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.POWER_CUT);
      if (raw) {
        const payload = JSON.parse(raw);
        localStorage.removeItem(STORAGE_KEYS.POWER_CUT);
        // Mark that recovery was successful
        return {
          recovered: true,
          count: payload.unsyncedCount || 0,
          timestamp: payload.triggeredAt
        };
      }
    } catch (err) {
      console.error('Error checking power cut recovery:', err);
    }
    return { recovered: false, count: 0 };
  },

  calculateMetrics(sales: SaleRecord[], queue: SaleRecord[]): TelemetryMetrics {
    let completed = 0;
    let blocked = 0;
    let revLost = 0;
    let revProtected = 0;
    let synced = 0;
    let totalSyncTime = 0;
    let syncCount = 0;

    let hybridCompleted = 0;
    let hybridBlocked = 0;
    let hybridProtected = 0;

    let saasCompleted = 0;
    let saasBlocked = 0;
    let saasLost = 0;

    for (const s of sales) {
      if (s.status === 'COMPLETED') {
        completed++;
        if (s.mode === 'HYBRID') {
          hybridCompleted++;
          hybridProtected += s.totalZMW || 0;
          revProtected += s.totalZMW || 0;
        } else {
          saasCompleted++;
        }

        if (s.syncLatencyMs && s.syncLatencyMs > 0) {
          totalSyncTime += s.syncLatencyMs;
          syncCount++;
          synced++;
        } else if (s.cloudReceivedAt) {
          synced++;
        }
      } else if (s.status === 'BLOCKED') {
        blocked++;
        if (s.mode === 'SAAS') {
          saasBlocked++;
          saasLost += s.totalZMW || 0;
          revLost += s.totalZMW || 0;
        } else {
          hybridBlocked++;
        }
      } else if (s.status === 'PENDING_SYNC') {
        // Pending sync is still counted as completed for the cashier in Hybrid mode!
        completed++;
        hybridCompleted++;
        hybridProtected += s.totalZMW || 0;
        revProtected += s.totalZMW || 0;
      }
    }

    const avgSyncTimeMs = syncCount > 0 ? Math.round(totalSyncTime / syncCount) : 0;

    return {
      completedSales: completed,
      blockedSales: blocked,
      revenueLostZMW: revLost,
      revenueProtectedZMW: revProtected,
      salesWaitingSync: queue.length,
      salesSynced: synced,
      avgSyncTimeMs,
      hybridCompleted,
      hybridBlocked,
      hybridProtectedRevenue: hybridProtected,
      saasCompleted,
      saasBlocked,
      saasLostRevenue: saasLost
    };
  },

  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
    localStorage.removeItem(STORAGE_KEYS.POWER_CUT);
  }
};
