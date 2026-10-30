import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

interface SaleItem {
  id: string;
  name: string;
  category: string;
  priceZMW: number;
  quantity: number;
  totalZMW: number;
}

interface SaleRecord {
  id: string;
  receiptNumber: string;
  timestamp: number;
  mode: 'HYBRID' | 'SAAS';
  status: 'COMPLETED' | 'BLOCKED' | 'PENDING_SYNC';
  items: SaleItem[];
  totalZMW: number;
  syncLatencyMs?: number;
  powerCutSurviving?: boolean;
  cloudReceivedAt?: number;
  cashierName?: string;
  storeName?: string;
}

const DATA_FILE = path.resolve(process.cwd(), 'cloud_research_data.json');

// Initialize database
function loadData(): { sales: SaleRecord[]; resetCount: number } {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading cloud_research_data.json, reinitializing:', err);
  }
  return { sales: [], resetCount: 0 };
}

function saveData(data: { sales: SaleRecord[]; resetCount: number }) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing cloud_research_data.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Endpoints for UNZA Research Cloud Backend
  app.get('/api/cloud/health', (req: Request, res: Response) => {
    const data = loadData();
    const completedSales = data.sales.filter(s => s.status === 'COMPLETED');
    const totalCloudRevenueZMW = completedSales.reduce((acc, s) => acc + (s.totalZMW || 0), 0);

    res.json({
      status: 'ONLINE',
      cloudRegion: 'af-south-1 (Lusaka Data Gateway)',
      serverTime: Date.now(),
      totalCloudSales: completedSales.length,
      totalCloudRevenueZMW,
      researchRef: 'UNZA-NASREC-2026-JAN-030'
    });
  });

  app.get('/api/cloud/sales', (req: Request, res: Response) => {
    const data = loadData();
    res.json({
      success: true,
      sales: data.sales,
      totalCount: data.sales.length
    });
  });

  app.post('/api/cloud/sales', (req: Request, res: Response) => {
    const sale: SaleRecord = req.body;
    if (!sale || !sale.id) {
      return res.status(400).json({ success: false, message: 'Invalid sale transaction payload.' });
    }

    const data = loadData();
    sale.cloudReceivedAt = Date.now();
    if (!sale.syncLatencyMs && sale.timestamp) {
      sale.syncLatencyMs = Math.max(0, sale.cloudReceivedAt - sale.timestamp);
    }

    // Upsert sale
    const existingIndex = data.sales.findIndex(s => s.id === sale.id);
    if (existingIndex >= 0) {
      data.sales[existingIndex] = sale;
    } else {
      data.sales.unshift(sale);
    }

    saveData(data);
    res.json({
      success: true,
      message: 'Sale successfully committed to Cloud Datacenter',
      sale
    });
  });

  app.post('/api/cloud/sync', (req: Request, res: Response) => {
    const { batch }: { batch: SaleRecord[] } = req.body;
    if (!Array.isArray(batch)) {
      return res.status(400).json({ success: false, message: 'Expected batch array of sales.' });
    }

    const data = loadData();
    const now = Date.now();
    const processed: SaleRecord[] = [];

    for (const item of batch) {
      const sale: SaleRecord = { ...item };
      sale.cloudReceivedAt = now;
      sale.status = 'COMPLETED';
      // Calculate empirical sync latency from original offline creation to cloud arrival
      sale.syncLatencyMs = Math.max(0, now - (sale.timestamp || now));

      const existingIndex = data.sales.findIndex(s => s.id === sale.id);
      if (existingIndex >= 0) {
        data.sales[existingIndex] = sale;
      } else {
        data.sales.unshift(sale);
      }
      processed.push(sale);
    }

    saveData(data);
    res.json({
      success: true,
      syncedCount: processed.length,
      processed,
      serverTime: now
    });
  });

  app.post('/api/cloud/reset', (req: Request, res: Response) => {
    const data = loadData();
    const newDb = { sales: [], resetCount: data.resetCount + 1 };
    saveData(newDb);
    res.json({
      success: true,
      message: 'Cloud research sales ledger successfully cleared.'
    });
  });

  app.get('/api/cloud/export/csv', (req: Request, res: Response) => {
    const data = loadData();
    const headers = [
      'Transaction_ID',
      'Receipt_Number',
      'Timestamp_ISO',
      'Architecture_Mode',
      'Transaction_Status',
      'Total_ZMW',
      'Items_Count',
      'Sync_Latency_ms',
      'Power_Cut_Survived',
      'Cloud_Received_ISO',
      'Cashier',
      'Store_Location'
    ];

    const rows = data.sales.map(s => [
      `"${s.id}"`,
      `"${s.receiptNumber}"`,
      `"${new Date(s.timestamp).toISOString()}"`,
      `"${s.mode}"`,
      `"${s.status}"`,
      s.totalZMW.toFixed(2),
      s.items ? s.items.reduce((acc, i) => acc + (i.quantity || 1), 0) : 0,
      s.syncLatencyMs ?? 0,
      s.powerCutSurviving ? 'YES' : 'NO',
      s.cloudReceivedAt ? `"${new Date(s.cloudReceivedAt).toISOString()}"` : '""',
      `"${s.cashierName || 'Cashier'}"`,
      `"${s.storeName || 'Lusaka Central Mart'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="unza_cloud_study_sales_data.csv"');
    res.send(csvContent);
  });

  // Vite middleware in dev or static files in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cloud Resilience server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
