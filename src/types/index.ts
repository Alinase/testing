export type ArchitectureMode = 'HYBRID' | 'SAAS';
export type NetworkStatus = 'ONLINE' | 'OFFLINE';
export type UserRole = 'RESEARCHER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  affiliation: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  priceZMW: number;
  stock: number;
  barcode: string;
  unit: string;
  imageIcon: string;
}

export interface SaleItem {
  id: string;
  name: string;
  category: string;
  priceZMW: number;
  quantity: number;
  totalZMW: number;
}

export interface SaleRecord {
  id: string;
  receiptNumber: string;
  timestamp: number;
  mode: ArchitectureMode;
  status: 'COMPLETED' | 'BLOCKED' | 'PENDING_SYNC';
  items: SaleItem[];
  totalZMW: number;
  syncLatencyMs?: number;
  powerCutSurviving?: boolean;
  cloudReceivedAt?: number;
  cashierName?: string;
  storeName?: string;
  failureReason?: string;
}

export interface TelemetryMetrics {
  completedSales: number;
  blockedSales: number;
  revenueLostZMW: number;
  revenueProtectedZMW: number;
  salesWaitingSync: number;
  salesSynced: number;
  avgSyncTimeMs: number;
  // Specific model breakdowns
  hybridCompleted: number;
  hybridBlocked: number;
  hybridProtectedRevenue: number;
  saasCompleted: number;
  saasBlocked: number;
  saasLostRevenue: number;
}
