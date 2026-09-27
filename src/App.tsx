import React, { useState, useEffect, useCallback } from 'react';
import { RoleNavigationHeader } from './components/RoleNavigationHeader';
import { AdminPlatformView } from './components/AdminPlatformView';
import { ProviderAdminView } from './components/ProviderAdminView';
import { CustomerPortalView } from './components/CustomerPortalView';
import { LoginModal } from './components/LoginModal';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { ProPartnerLandingPage } from './components/pages/ProPartnerLandingPage';
import { MyLoungeGuidePage } from './components/pages/MyLoungeGuidePage';
import type { Tenant, Customer, GenericDailyLog, GenericEvalRecord } from './types/tenant';
import type { AppMode } from './utils/tenantStorage';
import type { AuthUser } from './types/auth';
import {
  getCurrentUser,
  setCurrentUser,
  logout,
} from './utils/authStorage';
import {
  getTenants,
  saveTenants,
  getCustomers,
  saveCustomers,
  getActiveTenantId,
  saveActiveTenantId,
  getActiveCustomerId,
  saveActiveCustomerId,
  getAppMode,
  saveAppMode,
  getGenericDailyLogs,
  saveGenericDailyLogs,
  getGenericEvalRecords,
  saveGenericEvalRecords,
  getPlatformMasterIcon,
} from './utils/tenantStorage';
import { updateFavicon } from './utils/favicon';
import {
  getDailyLogs,
  saveDailyLogs,
  getPTDocks,
  savePTDocks,
  getConcertGoal,
  saveConcertGoal,
  getSavedAvatarStyle,
  saveAvatarStyle,
} from './utils/storage';
import type { DailyLog, PTEvalDock } from './types';
import type { ConcertGoal, AvatarStyle } from './utils/storage';
import {
  subscribeDailyLogs,
  saveDailyLogToFirestore,
  subscribePTDocks,
  subscribeConcertGoal,
  saveConcertGoalToFirestore,
  subscribeTenants,
  saveTenantToFirestore,
  subscribeCustomers,
  saveCustomerToFirestore,
  subscribeAllGenericDailyLogs,
  saveGenericDailyLogToFirestore,
  subscribeAllGenericEvalRecords,
  saveGenericEvalRecordToFirestore,
  subscribePublicTemplates,
  syncAllLocalDataToFirestore,
} from './firebase/firestoreService';
import { savePublicTemplates } from './data/publicTemplates';
import { generateSecureUuid, ensureTenantUuid, ensureCustomerUuid } from './utils/uuid';

export const App: React.FC = () => {
  // Current Authenticated User
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => !getCurrentUser());
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);

  // Subpage for PR/Guides: 'none' | 'pr-partner' | 'guide-lounge'
  const [subPage, setSubPage] = useState<'none' | 'pr-partner' | 'guide-lounge'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page');
      if (p === 'pr-partner' || p === 'guide-lounge') return p;
    } catch {}
    return 'none';
  });

  // Mode: 'admin' | 'provider' | 'customer'
  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mode');
      if (m === 'admin' || m === 'provider' || m === 'customer') return m;
    } catch {}
    const user = getCurrentUser();
    if (user?.role === 'customer') return 'customer';
    if (user?.role === 'provider') return 'provider';
    return getAppMode();
  });

  // Tenants and Customers State
  const [tenants, setTenants] = useState<Tenant[]>(getTenants());
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());

  // Active Selected IDs (URL query has precedence, supports both UUID and legacy ID)
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tenant');
      if (t) {
        const allTenants = getTenants();
        const matched = allTenants.find((item) => item.uuid === t || item.id === t);
        if (matched) return matched.id;
        return t;
      }
    } catch {}
    const user = getCurrentUser();
    if (user?.tenantId) return user.tenantId;
    return getActiveTenantId();
  });

  const [activeCustomerId, setActiveCustomerId] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('customer') || params.get('user');
      if (c) {
        const allCusts = getCustomers();
        const matched = allCusts.find((item) => item.uuid === c || item.id === c);
        if (matched) return matched.id;
        return c;
      }
    } catch {}
    const user = getCurrentUser();
    if (user?.customerId) return user.customerId;
    return getActiveCustomerId();
  });

  // Legacy data for HISA-CARAT backward compatibility
  const [legacyDailyLogs, setLegacyDailyLogs] = useState<DailyLog[]>(getDailyLogs());
  const [legacyPtDocks, setLegacyPtDocks] = useState<PTEvalDock[]>(getPTDocks());
  const [concertGoal, setConcertGoal] = useState<ConcertGoal>(getConcertGoal());
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState<AvatarStyle | null>(
    getSavedAvatarStyle() || 'dot'
  );
  const [cloudStatus, setCloudStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Customer Generic Logs & Evals for the active customer
  const [genericDailyLogs, setGenericDailyLogs] = useState<GenericDailyLog[]>([]);
  const [genericEvalRecords, setGenericEvalRecords] = useState<GenericEvalRecord[]>([]);

  // Find active tenant & customer objects
  const activeTenant: Tenant =
    tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const tenantCustomers = customers.filter((c) => c.tenantId === activeTenant.id);
  const activeCustomer: Customer =
    tenantCustomers.find((c) => c.id === activeCustomerId) ||
    tenantCustomers[0] ||
    customers[0];

  // Sync state to URL with tenant & customer UUIDs (never leak raw ID/text in URL)
  const updateUrl = useCallback(
    (page: string, mode: string, tenant: Tenant, customer: Customer) => {
      try {
        const url = new URL(window.location.href);
        if (page !== 'none') {
          url.searchParams.set('page', page);
          url.searchParams.delete('mode');
          url.searchParams.delete('tenant');
          url.searchParams.delete('customer');
          url.searchParams.delete('user');
        } else {
          url.searchParams.delete('page');
          url.searchParams.set('mode', mode);
          if (mode === 'provider' || mode === 'customer') {
            const tenantParam = tenant.uuid || tenant.id;
            url.searchParams.set('tenant', tenantParam);
          } else {
            url.searchParams.delete('tenant');
          }
          if (mode === 'customer') {
            const customerParam = customer.uuid || customer.id;
            url.searchParams.set('customer', customerParam);
          } else {
            url.searchParams.delete('customer');
          }
        }
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.warn('URL update note:', e);
      }
    },
    []
  );

  useEffect(() => {
    updateUrl(subPage, appMode, activeTenant, activeCustomer);
  }, [subPage, appMode, activeTenant, activeCustomer, updateUrl]);

  // Listen to browser popstate (back/forward) with UUID resolution
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tParam = params.get('tenant');
        const cParam = params.get('customer') || params.get('user');
        const mParam = params.get('mode');
        const pParam = params.get('page');

        if (pParam === 'pr-partner' || pParam === 'guide-lounge') {
          setSubPage(pParam);
        } else {
          setSubPage('none');
        }

        if (mParam === 'admin' || mParam === 'provider' || mParam === 'customer') {
          setAppMode(mParam);
        }

        if (tParam) {
          const matchedTenant = tenants.find((t) => t.uuid === tParam || t.id === tParam);
          if (matchedTenant) setActiveTenantId(matchedTenant.id);
        }

        if (cParam) {
          const matchedCust = customers.find((c) => c.uuid === cParam || c.id === cParam);
          if (matchedCust) setActiveCustomerId(matchedCust.id);
        }
      } catch {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [tenants, customers]);

  // Refresh logs when active customer or tenant changes
  useEffect(() => {
    if (activeCustomer && activeTenant) {
      const logs = getGenericDailyLogs(activeCustomer.id, activeTenant.id);
      const evals = getGenericEvalRecords(activeCustomer.id, activeTenant.id);
      setGenericDailyLogs(logs);
      setGenericEvalRecords(evals);
    }
  }, [activeCustomer, activeTenant]);

  // Master Firestore real-time listeners for all SaaS data
  useEffect(() => {
    // 1. Sync & listen Tenants
    const unsubTenants = subscribeTenants(
      (remoteTenants) => {
        if (remoteTenants && remoteTenants.length > 0) {
          const withUuid = remoteTenants.map((t) => {
            const ensured = ensureTenantUuid(t);
            if (!t.uuid) {
              saveTenantToFirestore(ensured).catch(() => {});
            }
            return ensured;
          });
          setTenants(withUuid);
          saveTenants(withUuid);
          setCloudStatus('synced');
        }
      },
      () => setCloudStatus('offline')
    );

    // 2. Sync & listen Customers
    const unsubCustomers = subscribeCustomers(
      (remoteCustomers) => {
        if (remoteCustomers && remoteCustomers.length > 0) {
          const withUuid = remoteCustomers.map((c) => {
            const ensured = ensureCustomerUuid(c);
            if (!c.uuid) {
              saveCustomerToFirestore(ensured).catch(() => {});
            }
            return ensured;
          });
          setCustomers(withUuid);
          saveCustomers(withUuid);
          setCloudStatus('synced');
        }
      },
      () => setCloudStatus('offline')
    );

    // 3. Sync & listen Generic Daily Logs
    const unsubDailyLogs = subscribeAllGenericDailyLogs(
      (remoteLogs) => {
        if (remoteLogs && remoteLogs.length > 0) {
          setCloudStatus('synced');
        }
      },
      () => setCloudStatus('offline')
    );

    // 4. Sync & listen Generic Eval Records
    const unsubEvalRecords = subscribeAllGenericEvalRecords(
      (remoteEvals) => {
        if (remoteEvals && remoteEvals.length > 0) {
          setCloudStatus('synced');
        }
      },
      () => setCloudStatus('offline')
    );

    // 4.5 Sync & listen Public Templates
    const unsubTemplates = subscribePublicTemplates(
      (remoteTemplates) => {
        if (remoteTemplates && remoteTemplates.length > 0) {
          savePublicTemplates(remoteTemplates);
        }
      },
      (err) => console.warn('Public templates listen notice:', err)
    );

    // 5. Legacy HISA-CARAT listeners
    const unsubDaily = subscribeDailyLogs(
      (remoteLogs) => {
        setLegacyDailyLogs(remoteLogs);
        saveDailyLogs(remoteLogs);
        setCloudStatus('synced');
      },
      () => setCloudStatus('offline')
    );

    const unsubPT = subscribePTDocks(
      (remoteDocks) => {
        setLegacyPtDocks(remoteDocks);
        savePTDocks(remoteDocks);
        setCloudStatus('synced');
      },
      () => setCloudStatus('offline')
    );

    const unsubGoal = subscribeConcertGoal(
      (remoteGoal) => {
        setConcertGoal(remoteGoal);
        saveConcertGoal(remoteGoal);
        setCloudStatus('synced');
      },
      () => setCloudStatus('offline')
    );

    // 6. Auto-seed: immediately upload all local data to Firestore if not yet populated
    syncAllLocalDataToFirestore()
      .then((res) => {
        console.log('🔥 Initial Firestore sync completed:', res);
        setCloudStatus('synced');
      })
      .catch((err) => {
        console.warn('Initial Firestore sync notice:', err);
      });

    return () => {
      unsubTenants();
      unsubCustomers();
      unsubDailyLogs();
      unsubEvalRecords();
      unsubTemplates();
      unsubDaily();
      unsubPT();
      unsubGoal();
    };
  }, []);

  // Handle Login
  const handleLogin = (user: AuthUser) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    setSubPage('none');

    if (user.role === 'customer') {
      setAppMode('customer');
      saveAppMode('customer');
      const targetTenantId = user.tenantId || 'tenant-carat-hisa';
      const targetCustomerId = user.customerId || 'cust-hisa-01';
      setActiveTenantId(targetTenantId);
      saveActiveTenantId(targetTenantId);
      setActiveCustomerId(targetCustomerId);
      saveActiveCustomerId(targetCustomerId);
    } else if (user.role === 'provider') {
      setAppMode('provider');
      saveAppMode('provider');
      if (user.tenantId) {
        setActiveTenantId(user.tenantId);
        saveActiveTenantId(user.tenantId);
      }
    } else {
      setAppMode('admin');
      saveAppMode('admin');
    }
  };

  // Handle Consumer Self-Registration
  const handleRegisterConsumer = ({
    user,
    tenant,
    customer,
  }: {
    user: AuthUser;
    tenant: Tenant;
    customer: Customer;
  }) => {
    setTenants((prev) => [tenant, ...prev]);
    setCustomers((prev) => [customer, ...prev]);
    setCurrentUserState(user);
    setCurrentUser(user);
    setSubPage('none');
    setAppMode('customer');
    saveAppMode('customer');
    setActiveTenantId(tenant.id);
    saveActiveTenantId(tenant.id);
    setActiveCustomerId(customer.id);
    saveActiveCustomerId(customer.id);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentUserState(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      url.searchParams.delete('tenant');
      url.searchParams.delete('customer');
      url.searchParams.delete('user');
      url.searchParams.delete('page');
      window.history.replaceState({}, '', url.pathname);
    } catch {}
    setAppMode('customer');
    saveAppMode('customer');
    setIsLoginModalOpen(true);
  };

  // Mode switcher with strict role check
  const handleSwitchMode = (mode: AppMode) => {
    setSubPage('none');
    if (currentUser?.role === 'customer') {
      setAppMode('customer');
      saveAppMode('customer');
      return;
    }
    if (currentUser?.role === 'provider' && mode === 'admin') {
      return;
    }
    setAppMode(mode);
    saveAppMode(mode);
  };

  // Select Tenant
  const handleSelectTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    saveActiveTenantId(tenantId);

    const currentBelongs = customers.some(
      (c) => c.id === activeCustomerId && c.tenantId === tenantId
    );
    if (!currentBelongs) {
      const firstTenantCust = customers.find((c) => c.tenantId === tenantId);
      if (firstTenantCust) {
        setActiveCustomerId(firstTenantCust.id);
        saveActiveCustomerId(firstTenantCust.id);
      }
    }
  };

  // Select Customer
  const handleSelectCustomer = (customerId: string) => {
    const targetCust = customers.find((c) => c.id === customerId);
    if (targetCust) {
      setActiveCustomerId(customerId);
      saveActiveCustomerId(customerId);
      if (targetCust.tenantId !== activeTenantId) {
        setActiveTenantId(targetCust.tenantId);
        saveActiveTenantId(targetCust.tenantId);
      }
    }
  };

  // Save updated tenant (from Provider view)
  const handleSaveTenant = async (updatedTenant: Tenant) => {
    const updated = tenants.map((t) => (t.id === updatedTenant.id ? updatedTenant : t));
    setTenants(updated);
    saveTenants(updated);
    try {
      await saveTenantToFirestore(updatedTenant);
      setCloudStatus('synced');
    } catch (err) {
      console.warn('Firestore tenant save notice:', err);
    }
  };

  // Create new tenant (from Admin view)
  const handleCreateTenant = async (newTenant: Tenant) => {
    const tenantWithUuid = ensureTenantUuid(newTenant);
    const updated = [tenantWithUuid, ...tenants];
    setTenants(updated);
    saveTenants(updated);
    setActiveTenantId(tenantWithUuid.id);
    saveActiveTenantId(tenantWithUuid.id);

    const defaultCust: Customer = {
      id: `cust-${tenantWithUuid.id.replace('tenant-', '')}-01`,
      uuid: generateSecureUuid(),
      tenantId: tenantWithUuid.id,
      name: `${tenantWithUuid.name} 会員1号`,
      nickname: '会員さま',
      joinedDate: new Date().toISOString().slice(0, 10),
      customGoal: '毎日の記録を続けて目標達成！',
      status: 'active',
    };
    const updatedCustomers = [...customers, defaultCust];
    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);
    setActiveCustomerId(defaultCust.id);
    saveActiveCustomerId(defaultCust.id);

    try {
      await saveTenantToFirestore(tenantWithUuid);
      await saveCustomerToFirestore(defaultCust);
      setCloudStatus('synced');
    } catch (err) {
      console.warn('Firestore tenant create notice:', err);
    }
  };

  // Create new customer (from Provider view)
  const handleCreateCustomer = async (newCustomer: Customer) => {
    const customerWithUuid = ensureCustomerUuid(newCustomer);
    const updated = [...customers, customerWithUuid];
    setCustomers(updated);
    saveCustomers(updated);
    setActiveCustomerId(customerWithUuid.id);
    saveActiveCustomerId(customerWithUuid.id);
    try {
      await saveCustomerToFirestore(customerWithUuid);
      setCloudStatus('synced');
    } catch (err) {
      console.warn('Firestore customer create notice:', err);
    }
  };

  // Update existing customer (from Provider view)
  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    const updated = customers.map((c) =>
      c.id === updatedCustomer.id ? updatedCustomer : c
    );
    setCustomers(updated);
    saveCustomers(updated);
    try {
      await saveCustomerToFirestore(updatedCustomer);
      setCloudStatus('synced');
    } catch (err) {
      console.warn('Firestore customer update notice:', err);
    }
  };

  // Manual one-click sync all local data to Firestore
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const handleManualSyncFirestore = async () => {
    setIsSyncingAll(true);
    setCloudStatus('syncing');
    try {
      const result = await syncAllLocalDataToFirestore();
      setCloudStatus('synced');
      alert(`🎉 Firebase (Firestore) への全データ同期が完了しました！\n\n・事業者(Tenants): ${result.tenantsCount}件\n・顧客(Customers): ${result.customersCount}件\n・日々の記録(Daily Logs): ${result.dailyLogsCount}件\n・定期評価(Eval Records): ${result.evalRecordsCount}件\n\nFirestoreコンソールでもコレクションが作成され確認できます。`);
    } catch (err: any) {
      console.error('Manual Firestore sync error:', err);
      setCloudStatus('offline');
      const errCode = err?.code || 'unknown';
      const errMsg = err?.message || String(err);
      
      let hint = '';
      if (errCode === 'permission-denied' || errMsg.includes('insufficient permissions')) {
        hint = '【原因】Firestoreのセキュリティルールで書き込みが拒否されています。\nFirebase Console > Firestore Database >「ルール」タブで、\nallow read, write: if true; に設定し「公開」してください。';
      } else if (errCode === 'not-found' || errMsg.includes('not exist')) {
        hint = '【原因】Firestoreデータベースがまだ作成されていません。\nFirebase Console >「Firestore Database」を開き、「データベースの作成」を実行してください。';
      } else {
        hint = 'Firebaseコンソールの設定（Firestore Databaseの作成状態・セキュリティルール）をご確認ください。';
      }

      alert(`⚠️ Firebaseへの同期エラー\n\n[エラー]: ${errCode}\n${errMsg}\n\n${hint}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Refresh active records for current customer & tenant
  const refreshActiveRecords = () => {
    if (activeCustomer && activeTenant) {
      const logs = getGenericDailyLogs(activeCustomer.id, activeTenant.id);
      const evals = getGenericEvalRecords(activeCustomer.id, activeTenant.id);
      setGenericDailyLogs(logs);
      setGenericEvalRecords(evals);
    }
  };

  // Save Generic Daily Log
  const handleSaveGenericDailyLog = async (newLog: GenericDailyLog) => {
    const existingIndex = genericDailyLogs.findIndex((l) => l.date === newLog.date);
    let updated: GenericDailyLog[];
    if (existingIndex >= 0) {
      updated = [...genericDailyLogs];
      updated[existingIndex] = newLog;
    } else {
      updated = [newLog, ...genericDailyLogs];
    }
    setGenericDailyLogs(updated);
    saveGenericDailyLogs(activeCustomer.id, updated);

    // Save to Firestore generic daily logs collection
    try {
      await saveGenericDailyLogToFirestore(newLog);
      setCloudStatus('synced');
    } catch (err) {
      console.warn('Firestore generic log sync notice:', err);
    }

    if (activeCustomer.id === 'cust-hisa-01') {
      try {
        const legacyFormat: DailyLog = {
          id: newLog.id,
          date: newLog.date,
          condition: newLog.condition || 'good',
          fatigueLevel: newLog.sliderValues?.fatigueLevel ?? 2,
          painVas: newLog.sliderValues?.painVas ?? 3,
          allodyniaLevel: 0,
          painLocations: [],
          exercises: {
            chairSquats: !!newLog.checkStates?.chairSquats,
            towelGather: !!newLog.checkStates?.towelGather,
            husbandSoleCare: !!newLog.checkStates?.husbandSoleCare,
            tensTherapy: !!newLog.checkStates?.tensTherapy,
            calfStretch: !!newLog.checkStates?.calfStretch,
            walking: !!newLog.checkStates?.walking,
          },
          pslDoseMg: newLog.numericValues?.pslDoseMg ?? 6,
          bodyTemp: newLog.numericValues?.bodyTemp ?? 36.5,
          stepCount: newLog.numericValues?.stepCount ?? 3500,
          weather: newLog.weather || 'sunny',
          oshiEnergy: newLog.energyLevel ?? 90,
          memo: newLog.memo,
          createdAt: newLog.createdAt,
        };
        await saveDailyLogToFirestore(legacyFormat);
      } catch (err) {
        console.warn('Firestore sync note:', err);
      }
    }
  };

  // Save Generic Eval Record
  const handleSaveGenericEvalRecord = async (newRecord: GenericEvalRecord) => {
    const existingIndex = genericEvalRecords.findIndex((r) => r.id === newRecord.id);
    let updated: GenericEvalRecord[];
    if (existingIndex >= 0) {
      updated = [...genericEvalRecords];
      updated[existingIndex] = newRecord;
    } else {
      updated = [...genericEvalRecords, newRecord];
    }
    setGenericEvalRecords(updated);
    saveGenericEvalRecords(activeCustomer.id, updated);

    // Save to Firestore generic eval records collection
    try {
      await saveGenericEvalRecordToFirestore(newRecord);
      setCloudStatus('synced');
    } catch (err) {
      console.warn('Firestore generic eval sync notice:', err);
    }
  };

  // Avatar Style selector
  const handleSelectAvatarStyle = (style: AvatarStyle) => {
    setSelectedAvatarStyle(style);
    saveAvatarStyle(style);
  };

  // Concert goal saver
  const handleSaveConcertGoal = async (goal: ConcertGoal) => {
    setConcertGoal(goal);
    saveConcertGoal(goal);
    try {
      await saveConcertGoalToFirestore(goal);
    } catch (e) {
      console.warn('Firestore goal save:', e);
    }
  };

  // Enforce access control for current effective render
  const effectiveMode = !currentUser
    ? 'customer'
    : currentUser.role === 'customer'
    ? 'customer'
    : currentUser.role === 'provider' && appMode === 'admin'
    ? 'provider'
    : appMode;

  // Platform Master Icon and Dynamic Favicon management
  const [platformIcon, setPlatformIcon] = useState<string>(() => getPlatformMasterIcon());

  useEffect(() => {
    // When in My Lounge (customer mode), prioritize tenant's favicon / app icon
    if (effectiveMode === 'customer') {
      const fav = activeTenant?.faviconUrl || activeTenant?.appIconUrl || platformIcon || '/cheer_icon.png';
      updateFavicon(fav);
    } else if (effectiveMode === 'provider') {
      const fav = activeTenant?.faviconUrl || activeTenant?.appIconUrl || platformIcon || '/cheer_icon.png';
      updateFavicon(fav);
    } else {
      updateFavicon(platformIcon || '/cheer_icon.png');
    }
  }, [effectiveMode, activeTenant?.faviconUrl, activeTenant?.appIconUrl, platformIcon]);

  // Render Subpage (PR landing or User Guide) if requested
  if (subPage === 'pr-partner') {
    return <ProPartnerLandingPage onBackToAdmin={() => setSubPage('none')} />;
  }

  if (subPage === 'guide-lounge') {
    return (
      <MyLoungeGuidePage
        onBackToApp={() => setSubPage('none')}
        appIconUrl={activeTenant?.appIconUrl || platformIcon}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-pink-200">
      {/* 1. Global Role Navigation & ID Linkage Bar */}
      <RoleNavigationHeader
        currentMode={effectiveMode}
        onSwitchMode={handleSwitchMode}
        activeTenant={activeTenant}
        activeCustomer={activeCustomer}
        tenants={tenants}
        customers={customers}
        onSelectTenant={handleSelectTenant}
        onSelectCustomer={handleSelectCustomer}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenPasswordModal={() => setIsPasswordChangeModalOpen(true)}
        onLogout={handleLogout}
        cloudStatus={cloudStatus}
        onSyncFirestore={handleManualSyncFirestore}
        isSyncingFirestore={isSyncingAll}
      />

      {/* 2. Page View according to Current Mode & Permissions */}
      {effectiveMode === 'admin' && currentUser?.role === 'admin' && (
        <div className="p-4 sm:p-6">
          <AdminPlatformView
            tenants={tenants}
            customers={customers}
            onSelectTenant={handleSelectTenant}
            onOpenProviderPage={(tenantId) => {
              handleSelectTenant(tenantId);
              handleSwitchMode('provider');
            }}
            onOpenCustomerPage={(tenantId, customerId) => {
              handleSelectTenant(tenantId);
              if (customerId) handleSelectCustomer(customerId);
              handleSwitchMode('customer');
            }}
            onCreateTenant={handleCreateTenant}
            activeTenantId={activeTenantId}
            onOpenPrPartnerPage={() => setSubPage('pr-partner')}
            onOpenMyLoungeGuidePage={() => setSubPage('guide-lounge')}
            platformIcon={platformIcon}
            onUpdatePlatformIcon={setPlatformIcon}
          />
        </div>
      )}

      {effectiveMode === 'provider' && (currentUser?.role === 'admin' || currentUser?.role === 'provider') && (
        <div className="p-4 sm:p-6">
          <ProviderAdminView
            tenant={activeTenant}
            customers={customers}
            onSaveTenant={handleSaveTenant}
            onOpenCustomerPage={(tenantId, customerId) => {
              handleSelectTenant(tenantId);
              if (customerId) handleSelectCustomer(customerId);
              handleSwitchMode('customer');
            }}
            onCreateCustomer={handleCreateCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onRefreshRecords={refreshActiveRecords}
          />
        </div>
      )}

      {effectiveMode === 'customer' && (
        <CustomerPortalView
          tenant={activeTenant}
          customer={activeCustomer}
          dailyLogs={genericDailyLogs}
          evalRecords={genericEvalRecords}
          onSaveDailyLog={handleSaveGenericDailyLog}
          onSaveEvalRecord={handleSaveGenericEvalRecord}
          legacyDailyLogs={legacyDailyLogs}
          legacyPtDocks={legacyPtDocks}
          concertGoal={concertGoal}
          onSaveConcertGoal={handleSaveConcertGoal}
          cloudStatus={cloudStatus}
          onSyncNow={() => {}}
          selectedAvatarStyle={selectedAvatarStyle}
          onSelectAvatarStyle={handleSelectAvatarStyle}
        />
      )}

      {/* 3. Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        currentUser={currentUser}
        onRegisterConsumer={handleRegisterConsumer}
      />

      {/* 4. My Page & Password Modal */}
      <PasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
        currentUser={currentUser}
        activeCustomer={activeCustomer}
        onUpdateCustomer={handleUpdateCustomer}
        onUpdateCurrentUser={(updatedUser) => {
          setCurrentUserState(updatedUser);
          setCurrentUser(updatedUser);
        }}
      />
    </div>
  );
};
export default App;
