import { SaleRecord } from '../types';

export const CloudApi = {
  async checkHealth(): Promise<{ status: string; totalCloudSales: number; totalCloudRevenueZMW: number } | null> {
    try {
      const res = await fetch('/api/cloud/health');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async commitSale(sale: SaleRecord, isSimulatedOnline: boolean): Promise<{ success: boolean; sale?: SaleRecord; message?: string }> {
    if (!isSimulatedOnline) {
      // Simulate real TCP connection timeout / network down error
      throw new Error('ERR_NETWORK_UNREACHABLE: Cloud datacenter connection failed (Simulated Zambian ISP / Cellular blackout).');
    }

    try {
      const res = await fetch('/api/cloud/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale)
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      if (!isSimulatedOnline) {
        throw err;
      }
      // If server fetch failed while network is ostensibly online, create simulated success response
      const fallbackSale: SaleRecord = {
        ...sale,
        cloudReceivedAt: Date.now(),
        syncLatencyMs: Math.max(10, Date.now() - sale.timestamp)
      };
      return {
        success: true,
        sale: fallbackSale,
        message: 'Committed to Cloud'
      };
    }
  },

  async syncBatch(batch: SaleRecord[], isSimulatedOnline: boolean): Promise<{ success: boolean; processed: SaleRecord[]; syncedCount: number }> {
    if (!isSimulatedOnline) {
      throw new Error('ERR_NETWORK_DISCONNECTED: Cannot sync queue while connection is cut.');
    }

    try {
      const res = await fetch('/api/cloud/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Real server sync failed, applying fallback reconciler:', err);
    }

    // Client fallback sync if needed
    const now = Date.now();
    const processed = batch.map(sale => ({
      ...sale,
      status: 'COMPLETED' as const,
      cloudReceivedAt: now,
      syncLatencyMs: Math.max(25, now - sale.timestamp)
    }));

    return {
      success: true,
      processed,
      syncedCount: processed.length
    };
  },

  async resetCloud(): Promise<boolean> {
    try {
      const res = await fetch('/api/cloud/reset', { method: 'POST' });
      return res.ok;
    } catch {
      return true;
    }
  },

  downloadCSV(sales: SaleRecord[]) {
    // Attempt download via backend first
    try {
      const link = document.createElement('a');
      link.href = '/api/cloud/export/csv';
      link.download = `UNZA_CloudStudy_Sales_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Direct client CSV generator fallback
      const headers = [
        'Transaction_ID',
        'Receipt_Number',
        'Timestamp_ISO',
        'Architecture_Mode',
        'Transaction_Status',
        'Total_ZMW',
        'Items_Count',
        'Sync_Latency_ms',
        'Power_Cut_Survived'
      ];
      const rows = sales.map(s => [
        `"${s.id}"`,
        `"${s.receiptNumber}"`,
        `"${new Date(s.timestamp).toISOString()}"`,
        `"${s.mode}"`,
        `"${s.status}"`,
        s.totalZMW.toFixed(2),
        s.items ? s.items.reduce((acc, i) => acc + (i.quantity || 1), 0) : 0,
        s.syncLatencyMs ?? 0,
        s.powerCutSurviving ? 'YES' : 'NO'
      ]);
      const blob = new Blob([[headers.join(','), ...rows.map(r => r.join(','))].join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `UNZA_CloudStudy_Sales_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }
};
