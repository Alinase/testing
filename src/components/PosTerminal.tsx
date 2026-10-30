import React, { useState } from 'react';
import { Product, SaleItem, ArchitectureMode, NetworkStatus, SaleRecord, User } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  AlertCircle, 
  Check, 
  Printer, 
  X,
  Package,
  Droplets,
  Wine,
  Milk,
  Sparkles,
  Shield,
  Flame,
  Zap,
  Battery,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PosTerminalProps {
  products: Product[];
  currentMode: ArchitectureMode;
  networkStatus: NetworkStatus;
  currentUser: User;
  onCompleteSale: (items: SaleItem[], totalZMW: number) => Promise<{ success: boolean; sale?: SaleRecord; error?: string }>;
  isProcessing: boolean;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  products,
  currentMode,
  networkStatus,
  currentUser,
  onCompleteSale,
  isProcessing
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [recentReceipt, setRecentReceipt] = useState<SaleRecord | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const categories = ['All', 'Staple Food', 'Beverages', 'Dairy', 'Household', 'Energy & Power'];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, totalZMW: (item.quantity + 1) * item.priceZMW }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        category: product.category,
        priceZMW: product.priceZMW,
        quantity: 1,
        totalZMW: product.priceZMW
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty, totalZMW: newQty * item.priceZMW };
        }
        return item;
      }).filter(Boolean) as SaleItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const grandTotalZMW = cart.reduce((sum, item) => sum + item.totalZMW, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutError(null);

    try {
      const result = await onCompleteSale(cart, grandTotalZMW);
      if (result.success && result.sale) {
        setRecentReceipt(result.sale);
        setCart([]);
      } else {
        // Handled as blocked sale or error
        setCheckoutError(result.error || 'Transaction was rejected by remote server.');
        if (result.sale) {
          setRecentReceipt(result.sale);
        }
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Fatal checkout error.');
    }
  };

  // Helper icon renderer
  const renderProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'Wine': return <Wine className="w-5 h-5 text-purple-600" />;
      case 'Milk': return <Milk className="w-5 h-5 text-amber-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Battery': return <Battery className="w-5 h-5 text-emerald-600" />;
      case 'Shield': return <Shield className="w-5 h-5 text-blue-600" />;
      default: return <Package className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Zambian retail commodities or scan barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {renderProductIcon(product.imageIcon)}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{product.unit}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Category: {product.category}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-base font-bold font-mono text-slate-900">
                    K{product.priceZMW.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                    title="Add to Sale"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">No commodities found matching filter.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-3 px-3 py-1.5 text-xs text-emerald-600 hover:underline font-medium"
              >
                Reset catalog filters
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Register Cart (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sticky top-20">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Current Sale Register</h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Architecture Behavioral Callout */}
            <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed ${
              currentMode === 'HYBRID'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : networkStatus === 'ONLINE'
                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {currentMode === 'HYBRID' ? (
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Hybrid Mode Engaged:</strong> Local device storage commits instantly. Even during power load-shedding or network cuts, selling continues uninterrupted.
                  </div>
                </div>
              ) : networkStatus === 'ONLINE' ? (
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pure SaaS (Online):</strong> Sale requires round-trip verification to cloud before issuing receipt.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pure SaaS (Disconnected):</strong> Warning! Attempting checkout will fail with network timeout and be recorded as <strong>lost revenue</strong>.
                  </div>
                </div>
              )}
            </div>

            {/* Cart Item List */}
            <div className="my-3 max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Cart is empty.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Select items from the catalog to begin transaction.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        K{item.priceZMW.toFixed(2)} × {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-bold font-mono text-slate-900 w-16 text-right">
                        K{item.totalZMW.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Error Message */}
            {checkoutError && (
              <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-semibold">Sale Blocked!</strong>
                  <p className="mt-0.5">{checkoutError}</p>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">K{grandTotalZMW.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Value Added Tax (16% inclusive):</span>
                <span className="font-mono">K{(grandTotalZMW * 0.16).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                <span>Total Due (ZMW):</span>
                <span className="font-mono text-base text-emerald-700">K{grandTotalZMW.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className={`w-full mt-4 py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                cart.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : currentMode === 'HYBRID'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/10'
                  : networkStatus === 'ONLINE'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/10'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/10'
              }`}
            >
              {isProcessing ? (
                <span>Executing Transaction...</span>
              ) : (
                <>
                  <span>
                    {currentMode === 'HYBRID'
                      ? `Complete Sale (Local-First · K${grandTotalZMW.toFixed(2)})`
                      : networkStatus === 'ONLINE'
                      ? `Commit Sale to Cloud (K${grandTotalZMW.toFixed(2)})`
                      : `Attempt Sale (Will Be Blocked · K${grandTotalZMW.toFixed(2)})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {recentReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400">Electronic Research Receipt</span>
              <button
                onClick={() => setRecentReceipt(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Store & Receipt Title */}
            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-slate-900">LUSAKA CENTRAL MART</h2>
              <p className="text-[11px] text-slate-500">Kalingalinga Branch · Lusaka, Zambia</p>
              <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                recentReceipt.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : recentReceipt.status === 'PENDING_SYNC'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                STATUS: {recentReceipt.status}
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-xs font-mono mb-4 text-slate-600">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-semibold text-slate-900">{recentReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(recentReceipt.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cloud Model:</span>
                <span className="font-semibold text-slate-900">{recentReceipt.mode}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{recentReceipt.cashierName || currentUser.name}</span>
              </div>
              {recentReceipt.syncLatencyMs !== undefined && (
                <div className="flex justify-between text-emerald-700">
                  <span>Sync Latency:</span>
                  <span>{recentReceipt.syncLatencyMs}ms</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100 mb-4 max-h-48 overflow-y-auto text-xs">
              {recentReceipt.items.map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <div className="truncate pr-2">
                    <span className="text-slate-800 font-medium">{item.name}</span>
                    <span className="text-slate-400 block text-[10px]">qty {item.quantity} @ K{item.priceZMW.toFixed(2)}</span>
                  </div>
                  <div className="font-mono text-slate-900 font-semibold">
                    K{item.totalZMW.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="border-t border-dashed border-slate-300 pt-3 mb-5 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>TOTAL (ZMW):</span>
              <span className="font-mono text-lg text-emerald-700">K{recentReceipt.totalZMW.toFixed(2)}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecentReceipt(null)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close Register
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
