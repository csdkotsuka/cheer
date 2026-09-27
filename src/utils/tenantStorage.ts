import type { Tenant, Customer, GenericDailyLog, GenericEvalRecord } from '../types/tenant';
import { INITIAL_TENANTS, INITIAL_CUSTOMERS } from '../data/tenantPresets';
import { getDailyLogs, getPTDocks } from './storage';
import { ensureTenantUuid, ensureCustomerUuid } from './uuid';

const TENANTS_KEY = 'omni_saas_tenants_v1';
const CUSTOMERS_KEY = 'omni_saas_customers_v1';
const ACTIVE_TENANT_ID_KEY = 'omni_saas_active_tenant_id_v1';
const ACTIVE_CUSTOMER_ID_KEY = 'omni_saas_active_customer_id_v1';
const APP_MODE_KEY = 'omni_saas_app_mode_v1';
const GENERIC_DAILY_LOGS_PREFIX = 'omni_saas_daily_logs_';
const GENERIC_EVALS_PREFIX = 'omni_saas_evals_';

export type AppMode = 'admin' | 'provider' | 'customer';

// Load Tenants
export const getTenants = (): Tenant[] => {
  try {
    const raw = localStorage.getItem(TENANTS_KEY);
    if (!raw) {
      saveTenants(INITIAL_TENANTS);
      return INITIAL_TENANTS;
    }
    const parsed: Tenant[] = JSON.parse(raw);
    if (!parsed || parsed.length === 0) return INITIAL_TENANTS;

    // Ensure chat settings, email, and uuid are populated for tenants
    let modified = false;
    const migrated = parsed.map((t) => {
      let updated = { ...t };
      const init = INITIAL_TENANTS.find((i) => i.id === t.id);

      // UUID補完
      if (!updated.uuid) {
        updated.uuid = init?.uuid || ensureTenantUuid(updated).uuid;
        modified = true;
      }

      if (!updated.email && init?.email) {
        updated.email = init.email;
        modified = true;
      }
      if (t.id === 'tenant-carat-hisa') {
        const needsChat = !t.aiPersona.chatPersonality || t.headerTitle === 'MY-CARAT Log';
        if (needsChat) {
          modified = true;
          updated = {
            ...updated,
            headerTitle: 'HISA-CARAT Log',
            headerSubtitle: 'ひさこのEGPAリハビリ＆セルフケア手帳（受診・定期測定共有対応）',
            badgeText: 'CARAT 💎 EGPA Care',
            aiPersona: {
              ...t.aiPersona,
              speechBubbleText: '✨ ひさこさん、ハニヘ〜！今日も無理せず自分のペースでね👼🪽',
              chatGreeting: t.aiPersona.chatGreeting || 'ひさこさん、ハニヘ〜！👼🪽 今日も会えて嬉しいよ。体調はどう？何でも話してね！',
              chatFirstPerson: t.aiPersona.chatFirstPerson || '僕',
              chatSecondPerson: t.aiPersona.chatSecondPerson || 'ひさこさん',
              chatPersonality: t.aiPersona.chatPersonality || 'SEVENTEENの天使担当ジョンハン（ハニ）。優しく包み込み、時にはお茶目で甘え上手。ファンの頑張りを誰よりも認め、無理をさせない温かい言葉をかけてくれる。口調は「〜だよ」「〜ね」「ハニヘ〜👼」など。',
            },
          };
        }
      }
      return updated;
    });

    if (modified) {
      saveTenants(migrated);
    }
    return migrated;
  } catch {
    return INITIAL_TENANTS;
  }
};

// Save Tenants
export const saveTenants = (tenants: Tenant[]): void => {
  try {
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants));
  } catch (e) {
    console.error('Failed to save tenants:', e);
  }
};

// Load Customers
export const getCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      saveCustomers(INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    const parsed: Customer[] = JSON.parse(raw);
    if (!parsed || parsed.length === 0) return INITIAL_CUSTOMERS;

    // Ensure cust-hisa-01 is preserved as Hisako and has EGPA medicalCondition and email
    let modified = false;
    const migrated = parsed.map((c) => {
      let updated = { ...c };
      const init = INITIAL_CUSTOMERS.find((i) => i.id === c.id);

      // UUID補完
      if (!updated.uuid) {
        updated.uuid = init?.uuid || ensureCustomerUuid(updated).uuid;
        modified = true;
      }

      if (!updated.email && init?.email) {
        updated.email = init.email;
        modified = true;
      }
      if (c.id === 'cust-hisa-01') {
        if (c.name === 'あおい') {
          updated.name = 'ひさこ';
          updated.nickname = 'ひさこさん';
          modified = true;
        }
        if (!c.medicalCondition) {
          updated.medicalCondition = '好酸球性多発血管炎性肉芽腫症 (EGPA)';
          modified = true;
        }
      } else if (!c.medicalCondition) {
        if (init?.medicalCondition) {
          updated.medicalCondition = init.medicalCondition;
          modified = true;
        }
      }
      return updated;
    });

    if (modified) {
      saveCustomers(migrated);
    }
    return migrated;
  } catch {
    return INITIAL_CUSTOMERS;
  }
};

// Save Customers
export const saveCustomers = (customers: Customer[]): void => {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers:', e);
  }
};

// Update Single Customer
export const updateCustomer = (updatedCustomer: Customer): Customer[] => {
  const current = getCustomers();
  const index = current.findIndex((c) => c.id === updatedCustomer.id);
  let updatedList: Customer[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = updatedCustomer;
  } else {
    updatedList = [...current, updatedCustomer];
  }
  saveCustomers(updatedList);
  return updatedList;
};

// Active Tenant ID
export const getActiveTenantId = (): string => {
  try {
    return localStorage.getItem(ACTIVE_TENANT_ID_KEY) || INITIAL_TENANTS[0].id;
  } catch {
    return INITIAL_TENANTS[0].id;
  }
};

export const saveActiveTenantId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_TENANT_ID_KEY, id);
  } catch (e) {
    console.error('Failed to save active tenant ID:', e);
  }
};

// Active Customer ID
export const getActiveCustomerId = (): string => {
  try {
    return localStorage.getItem(ACTIVE_CUSTOMER_ID_KEY) || INITIAL_CUSTOMERS[0].id;
  } catch {
    return INITIAL_CUSTOMERS[0].id;
  }
};

export const saveActiveCustomerId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_CUSTOMER_ID_KEY, id);
  } catch (e) {
    console.error('Failed to save active customer ID:', e);
  }
};

// App Mode
export const getAppMode = (): AppMode => {
  try {
    return (localStorage.getItem(APP_MODE_KEY) as AppMode) || 'customer';
  } catch {
    return 'customer';
  }
};

export const saveAppMode = (mode: AppMode): void => {
  try {
    localStorage.setItem(APP_MODE_KEY, mode);
  } catch (e) {
    console.error('Failed to save app mode:', e);
  }
};

// Generic Daily Logs for a customer
export const getGenericDailyLogs = (customerId: string, tenantId: string): GenericDailyLog[] => {
  try {
    const key = `${GENERIC_DAILY_LOGS_PREFIX}${customerId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }

    // Special migration: if customer is 'cust-hisa-01', migrate from existing HISA-CARAT logs
    if (customerId === 'cust-hisa-01') {
      const legacyLogs = getDailyLogs();
      if (legacyLogs && legacyLogs.length > 0) {
        const migrated: GenericDailyLog[] = legacyLogs.map((l) => ({
          id: l.id || `log-${l.date}`,
          customerId,
          tenantId,
          date: l.date,
          condition: l.condition,
          weather: l.weather,
          checkStates: {
            chairSquats: l.exercises.chairSquats,
            towelGather: l.exercises.towelGather,
            husbandSoleCare: l.exercises.husbandSoleCare,
            tensTherapy: l.exercises.tensTherapy,
            calfStretch: l.exercises.calfStretch,
            walking: l.exercises.walking,
          },
          sliderValues: {
            fatigueLevel: l.fatigueLevel,
            painVas: l.painVas,
          },
          numericValues: {
            pslDoseMg: l.pslDoseMg,
            bodyTemp: l.bodyTemp ?? 36.5,
            stepCount: l.stepCount ?? 3500,
          },
          energyLevel: l.oshiEnergy,
          memo: l.memo,
          createdAt: l.createdAt,
        }));
        saveGenericDailyLogs(customerId, migrated);
        return migrated;
      }
    }

    return [];
  } catch (e) {
    console.error('Failed to load generic daily logs', e);
    return [];
  }
};

export const saveGenericDailyLogs = (customerId: string, logs: GenericDailyLog[]): void => {
  try {
    const key = `${GENERIC_DAILY_LOGS_PREFIX}${customerId}`;
    localStorage.setItem(key, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save generic daily logs', e);
  }
};

// Generic Periodic Evaluations for a customer
export const getGenericEvalRecords = (customerId: string, tenantId: string): GenericEvalRecord[] => {
  try {
    const key = `${GENERIC_EVALS_PREFIX}${customerId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }

    // Special migration: if customer is 'cust-hisa-01', migrate from existing PT docks
    if (customerId === 'cust-hisa-01') {
      const legacyDocks = getPTDocks();
      if (legacyDocks && legacyDocks.length > 0) {
        const migrated: GenericEvalRecord[] = legacyDocks.map((d) => ({
          id: d.id,
          customerId,
          tenantId,
          date: d.date,
          evaluator: d.evaluator,
          metricValues: {
            cs30: d.functional.cs30Count,
            heelRaise: (d.functional.singleLegHeelRaiseLeft + d.functional.singleLegHeelRaiseRight) / 2,
            romberg: d.functional.rombergTest === 'pass' ? '正常 (Pass)' : '軽度動揺',
            calfCircumference: (d.calfCircumference.rightCm + d.calfCircumference.leftCm) / 2,
            allodyniaScore: d.allodyniaScore,
          },
          advice: d.kazuhiroAdvice,
          nextGoal: d.nextGoal,
          createdAt: d.createdAt,
        }));
        saveGenericEvalRecords(customerId, migrated);
        return migrated;
      }
    }

    return [];
  } catch (e) {
    console.error('Failed to load generic eval records', e);
    return [];
  }
};

export const saveGenericEvalRecords = (customerId: string, records: GenericEvalRecord[]): void => {
  try {
    const key = `${GENERIC_EVALS_PREFIX}${customerId}`;
    localStorage.setItem(key, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save generic eval records', e);
  }
};

// Update or add a single daily log
export const updateGenericDailyLog = (
  customerId: string,
  tenantId: string,
  log: GenericDailyLog
): GenericDailyLog[] => {
  const current = getGenericDailyLogs(customerId, tenantId);
  const idx = current.findIndex((l) => l.id === log.id || l.date === log.date);
  let updated: GenericDailyLog[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = log;
  } else {
    updated = [log, ...current];
  }
  saveGenericDailyLogs(customerId, updated);
  return updated;
};

// Delete a single daily log
export const deleteGenericDailyLog = (
  customerId: string,
  tenantId: string,
  logId: string
): GenericDailyLog[] => {
  const current = getGenericDailyLogs(customerId, tenantId);
  const updated = current.filter((l) => l.id !== logId);
  saveGenericDailyLogs(customerId, updated);
  return updated;
};

// Update or add a single eval record
export const updateGenericEvalRecord = (
  customerId: string,
  tenantId: string,
  record: GenericEvalRecord
): GenericEvalRecord[] => {
  const current = getGenericEvalRecords(customerId, tenantId);
  const idx = current.findIndex((r) => r.id === record.id || r.date === record.date);
  let updated: GenericEvalRecord[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = record;
  } else {
    updated = [...current, record];
  }
  saveGenericEvalRecords(customerId, updated);
  return updated;
};

// Delete a single eval record
export const deleteGenericEvalRecord = (
  customerId: string,
  tenantId: string,
  recordId: string
): GenericEvalRecord[] => {
  const current = getGenericEvalRecords(customerId, tenantId);
  const updated = current.filter((r) => r.id !== recordId);
  saveGenericEvalRecords(customerId, updated);
  return updated;
};

// Platform Master Icon Storage
const PLATFORM_MASTER_ICON_KEY = 'cheer_platform_master_icon';

export const getPlatformMasterIcon = (): string => {
  try {
    return localStorage.getItem(PLATFORM_MASTER_ICON_KEY) || '/cheer_icons/cheer_original.png';
  } catch {
    return '/cheer_icons/cheer_original.png';
  }
};

export const savePlatformMasterIcon = (url: string): void => {
  try {
    localStorage.setItem(PLATFORM_MASTER_ICON_KEY, url);
  } catch (e) {
    console.error('Failed to save platform master icon', e);
  }
};

