import React from 'react';
import { User } from '../types';
import { UserCheck, Shield, Store, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'pos' | 'analytics' | 'queue' | 'protocol';
  setActiveTab: (tab: 'pos' | 'analytics' | 'queue' | 'protocol') => void;
  currentUser: User;
  onOpenUserModal: () => void;
  pendingQueueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenUserModal,
  pendingQueueCount
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            CR
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              CloudResilience
            </span>
            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
              UNZA Research Prototype · NASREC 030
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'pos'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            POS Register
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Research Dashboard
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap relative ${
              activeTab === 'queue'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Sync Queue
            {pendingQueueCount > 0 && (
              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-100 text-amber-800">
                {pendingQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('protocol')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'protocol'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Ethics Protocol
          </button>
        </nav>

        {/* Zone 3: Active User Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            title="Click to switch role / user"
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
              {currentUser.role === 'RESEARCHER' ? (
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <Store className="w-3.5 h-3.5 text-blue-700" />
              )}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 leading-none">
                {currentUser.role === 'RESEARCHER' ? 'Principal Investigator' : 'Store Cashier'}
              </span>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:inline" />
          </button>
        </div>
      </div>
    </header>
  );
};
