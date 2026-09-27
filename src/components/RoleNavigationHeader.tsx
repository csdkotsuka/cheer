import React from 'react';
import { ShieldCheck, Building2, User, LogOut, LogIn, ArrowRightLeft, RefreshCw, Key } from 'lucide-react';
import type { AppMode } from '../utils/tenantStorage';
import type { Tenant, Customer } from '../types/tenant';
import type { AuthUser } from '../types/auth';
import { ROLE_DEFINITIONS } from '../types/auth';

interface RoleNavigationHeaderProps {
  currentMode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
  activeTenant: Tenant;
  activeCustomer: Customer;
  tenants?: Tenant[];
  customers?: Customer[];
  onSelectTenant?: (tenantId: string) => void;
  onSelectCustomer?: (customerId: string) => void;
  currentUser: AuthUser | null;
  onOpenLoginModal?: () => void;
  onOpenPasswordModal?: () => void;
  onLogout: () => void;
  cloudStatus?: 'synced' | 'syncing' | 'offline';
  onSyncFirestore?: () => void;
  isSyncingFirestore?: boolean;
}

export const RoleNavigationHeader: React.FC<RoleNavigationHeaderProps> = ({
  currentMode,
  onSwitchMode,
  activeTenant,
  activeCustomer: _activeCustomer,
  currentUser,
  onOpenLoginModal,
  onOpenPasswordModal,
  onLogout,
  cloudStatus = 'synced',
  onSyncFirestore,
  isSyncingFirestore = false,
}) => {
  const userRole = currentUser?.role || 'customer';
  const roleMeta = currentUser ? ROLE_DEFINITIONS[userRole] : ROLE_DEFINITIONS.customer;

  // If customer role, show sleek personal header bar
  if (userRole === 'customer') {
    return (
      <div className="w-full bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-sm sticky top-0 z-50 text-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
          {/* Left: App Logo & User space name */}
          <div className="flex items-center gap-2">
            <img
              src={activeTenant.appIconUrl || '/cheer_icon.png'}
              alt="Cheer"
              className="w-5 h-5 rounded-md object-cover shadow-xs border border-white/20"
            />
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Cheer
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold text-slate-300">
              {ROLE_DEFINITIONS.customer.label}
            </span>
          </div>

          {/* Right: Vertical Stack: マイページ & ログアウト (No sync/email badge in customer mode) */}
          <div className="flex flex-col items-end gap-1">
            {currentUser && onOpenPasswordModal && (
              <button
                type="button"
                onClick={onOpenPasswordModal}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                title="マイページ"
              >
                <User className="w-3 h-3 text-pink-400" />
                <span>マイページ</span>
              </button>
            )}

            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-300 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                title="ログアウト"
              >
                <LogOut className="w-3 h-3" />
                <span>ログアウト</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-90 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                title="ログイン"
              >
                <LogIn className="w-3 h-3" />
                <span>ログイン</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Provider or Admin Role View
  return (
    <div className="w-full bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-50 transition-all text-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: App Brand & STUDIO切替 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={activeTenant.appIconUrl || '/cheer_icon.png'}
              alt="Cheer"
              className="w-5 h-5 rounded-md object-cover shadow-xs border border-white/20"
            />
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent hidden sm:inline">
              Cheer
            </span>
          </div>

          {/* STUDIO切替 Framed Container enclosing 3 Mode Buttons with Clear Boundaries */}
          <div className="flex items-stretch border border-slate-700 rounded-xl overflow-hidden bg-slate-950/80 shadow-sm">
          {/* Label inside the frame */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-indigo-300 font-bold text-xs tracking-wider border-r border-slate-700 select-none">
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>切替</span>
          </div>

          {/* Buttons with distinct border dividers */}
          <div className="flex items-stretch divide-x divide-slate-700 bg-slate-900">
            {/* 1. Cheer Master (Admin Tab): ONLY visible to Admin */}
            {userRole === 'admin' && (
              <button
                type="button"
                onClick={() => onSwitchMode('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition-all ${
                  currentMode === 'admin'
                    ? 'bg-indigo-600 text-white font-extrabold shadow-inner ring-1 ring-inset ring-indigo-400'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="Cheer Master"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span>{ROLE_DEFINITIONS.admin.label}</span>
              </button>
            )}

            {/* 2. Pro Partner (Provider Tab): Visible to Admin and Provider */}
            <button
              type="button"
              onClick={() => onSwitchMode('provider')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentMode === 'provider'
                  ? 'bg-amber-600 text-white font-extrabold shadow-inner ring-1 ring-inset ring-amber-400'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Pro Partner"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{ROLE_DEFINITIONS.provider.label}</span>
            </button>

            {/* 3. My Lounge (Customer Tab): Visible to Admin, Provider, and Customer */}
            <button
              type="button"
              onClick={() => onSwitchMode('customer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentMode === 'customer'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-inner ring-1 ring-inset ring-emerald-400'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="My Lounge"
            >
              <User className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>{ROLE_DEFINITIONS.customer.label}</span>
            </button>
          </div>
        </div>
      </div>

        {/* Right: Vertical Sync Stack, User Profile & Logout */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-[11px]">
          {/* Vertical Stack: Firebase Sync & Cloud Status */}
          <div className="flex flex-col items-center sm:items-end gap-1">
            {onSyncFirestore && (
              <button
                type="button"
                onClick={onSyncFirestore}
                disabled={isSyncingFirestore}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-950/90 border border-indigo-500 hover:bg-indigo-900 text-indigo-200 text-[10px] font-bold transition-all shadow-xs disabled:opacity-50"
                title="ローカルの全データ(テナント・顧客・日報・評価)をFirebase (Firestore) に即時同期"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingFirestore ? 'animate-spin text-amber-400' : 'text-indigo-400'}`} />
                <span>{isSyncingFirestore ? '同期中...' : '🔥 Firebase同期'}</span>
              </button>
            )}

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[9px] text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${cloudStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : cloudStatus === 'syncing' ? 'bg-amber-400 animate-spin' : 'bg-rose-400'}`} />
              <span>{cloudStatus === 'synced' ? 'Cloud同期済' : cloudStatus === 'syncing' ? '同期中' : 'オフライン'}</span>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <span>{currentUser?.name}</span>
              <span className="text-[10px] text-indigo-300 font-mono">({roleMeta.badge})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{currentUser?.email}</span>
          </div>

          {/* Vertical Stack: Password & Logout */}
          <div className="flex flex-col items-end gap-1">
            {onOpenPasswordModal && (
              <button
                type="button"
                onClick={onOpenPasswordModal}
                className="w-full justify-center flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold transition-all shadow-xs text-xs cursor-pointer"
                title="パスワード設定・変更"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>パスワード</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="w-full justify-center flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-300 font-bold transition-all shadow-xs text-xs cursor-pointer"
              title="ログアウト"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
