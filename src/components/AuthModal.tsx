import React from 'react';
import { User, UserRole } from '../types';
import { DEFAULT_USERS } from '../data/mockProducts';
import { Shield, Store, Check, X } from 'lucide-react';

interface AuthModalProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentUser, onSelectUser, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">User Authentication & Role Switcher</h3>
            <p className="text-xs text-slate-500">Select research persona or store cashier profile</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {DEFAULT_USERS.map(user => {
            const isSelected = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    user.role === 'RESEARCHER'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'RESEARCHER' ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <Store className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{user.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        user.role === 'RESEARCHER'
                          ? 'bg-emerald-200/60 text-emerald-900'
                          : 'bg-blue-200/60 text-blue-900'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{user.affiliation}</p>
                    <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Switching profiles allows demonstrating both administrator researcher analytics and live cashier point-of-sale operations.
          </p>
        </div>
      </div>
    </div>
  );
};
