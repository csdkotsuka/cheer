import React, { useState } from 'react';
import {
  Palette,
  Bot,
  ListChecks,
  CalendarCheck2,
  Users,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Upload,
  Image,
  RefreshCw,
  Eye,
  Smile,
  Edit3,
  FileEdit,
  X,
} from 'lucide-react';
import type { Tenant, Customer, ColorTheme, AIPersonaQuote, GenericDailyLog, GenericEvalRecord, LoungeLinkItem } from '../types/tenant';
import { COLOR_THEMES, DEFAULT_CARAT_LOUNGE_LINKS } from '../data/tenantPresets';
import { CheerIconSelector } from './CheerIconSelector';
import { triggerSparkleConfetti } from '../utils/confetti';
import {
  getGenericDailyLogs,
  updateGenericDailyLog,
  deleteGenericDailyLog,
  getGenericEvalRecords,
  updateGenericEvalRecord,
  deleteGenericEvalRecord,
  updateCustomer as persistCustomer,
} from '../utils/tenantStorage';
import {
  saveCustomerToFirestore,
  saveGenericDailyLogToFirestore,
  deleteGenericDailyLogFromFirestore,
  saveGenericEvalRecordToFirestore,
  deleteGenericEvalRecordFromFirestore,
} from '../firebase/firestoreService';
import { generateSecureUuid } from '../utils/uuid';


interface ProviderAdminViewProps {
  tenant: Tenant;
  customers: Customer[];
  onSaveTenant: (updatedTenant: Tenant) => void;
  onOpenCustomerPage: (tenantId: string, customerId?: string) => void;
  onCreateCustomer: (newCustomer: Customer) => void;
  onUpdateCustomer?: (updatedCustomer: Customer) => void;
  onRefreshRecords?: () => void;
}

export const ProviderAdminView: React.FC<ProviderAdminViewProps> = ({
  tenant,
  customers,
  onSaveTenant,
  onOpenCustomerPage,
  onCreateCustomer,
  onUpdateCustomer,
  onRefreshRecords,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'branding' | 'persona' | 'daily' | 'eval' | 'customers' | 'lounge'
  >('branding');

  // Working copy of tenant settings
  const [currentTenant, setCurrentTenant] = useState<Tenant>({ ...tenant });
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // AI Avatar Generator Simulation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'anime' | 'photo' | 'dot' | '3d' | 'flat'>('photo');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  // New customer form state
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustNickname, setNewCustNickname] = useState('');
  const [newCustGoal, setNewCustGoal] = useState('');
  const [newCustMedicalCondition, setNewCustMedicalCondition] = useState('');

  // Edit customer modal state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Manage Past Records modal state
  const [recordsTargetCustomer, setRecordsTargetCustomer] = useState<Customer | null>(null);
  const [custDailyLogs, setCustDailyLogs] = useState<GenericDailyLog[]>([]);
  const [custEvalRecords, setCustEvalRecords] = useState<GenericEvalRecord[]>([]);
  const [recordsActiveSubTab, setRecordsActiveSubTab] = useState<'daily' | 'eval'>('daily');

  // Editing specific record state
  const [editingDailyLog, setEditingDailyLog] = useState<GenericDailyLog | null>(null);
  const [editingEvalRecord, setEditingEvalRecord] = useState<GenericEvalRecord | null>(null);

  // Handlers for Brand / Header
  const handleThemeSelect = (theme: ColorTheme) => {
    setCurrentTenant((prev) => ({
      ...prev,
      theme,
    }));
  };

  // Save Tenant
  const handleSave = () => {
    onSaveTenant({
      ...currentTenant,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    triggerSparkleConfetti();
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  // Lounge Links Handlers
  const handleAddLoungeLink = () => {
    const newLink: LoungeLinkItem = {
      id: `link-${Date.now()}`,
      title: '新しいコンテンツリンク',
      desc: 'リンクの説明やおすすめポイント',
      url: 'https://',
      badge: 'おすすめ',
    };
    setCurrentTenant((prev) => ({
      ...prev,
      loungeLinks: [...(prev.loungeLinks || []), newLink],
    }));
  };

  const handleUpdateLoungeLink = (index: number, field: keyof LoungeLinkItem, value: string) => {
    setCurrentTenant((prev) => {
      const links = [...(prev.loungeLinks || [])];
      if (links[index]) {
        links[index] = { ...links[index], [field]: value };
      }
      return { ...prev, loungeLinks: links };
    });
  };

  const handleDeleteLoungeLink = (index: number) => {
    setCurrentTenant((prev) => {
      const links = [...(prev.loungeLinks || [])];
      links.splice(index, 1);
      return { ...prev, loungeLinks: links };
    });
  };

  const handleResetDefaultLinks = () => {
    setCurrentTenant((prev) => ({
      ...prev,
      loungeLinks: [...DEFAULT_CARAT_LOUNGE_LINKS],
    }));
  };

  // AI Avatar Generation simulation
  const handleGenerateAIAvatar = () => {
    setIsGeneratingAvatar(true);
    setTimeout(() => {
      let generatedUrl = '';
      const promptLower = (aiPrompt || currentTenant.aiPersona.role).toLowerCase();

      if (aiStyle === 'dot') {
        generatedUrl = '/jeonghan_dot.jpg';
      } else if (aiStyle === 'anime') {
        generatedUrl = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80';
      } else if (aiStyle === '3d') {
        generatedUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80';
      } else {
        // Realistic photo by keywords
        if (promptLower.includes('train') || promptLower.includes('筋') || promptLower.includes('fit')) {
          generatedUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
        } else if (promptLower.includes('先生') || promptLower.includes('teach') || promptLower.includes('学')) {
          generatedUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
        } else if (promptLower.includes('idol') || promptLower.includes('アイドル') || promptLower.includes('ジョンハン')) {
          generatedUrl = '/jeonghan_photo.jpg';
        } else {
          generatedUrl = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
        }
      }

      setCurrentTenant((prev) => ({
        ...prev,
        aiPersona: {
          ...prev.aiPersona,
          avatarUrl: generatedUrl,
          avatarType: 'ai_generated',
          aiPromptSnippet: aiPrompt,
        },
      }));
      setIsGeneratingAvatar(false);
      triggerSparkleConfetti();
    }, 600);
  };

  // Image Upload handler (Base64 DataURL)
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCurrentTenant((prev) => ({
            ...prev,
            aiPersona: {
              ...prev.aiPersona,
              avatarUrl: reader.result as string,
              avatarType: 'upload',
            },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Create Customer for this tenant
  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newCustomer: Customer = {
      id: `cust-${currentTenant.id.replace('tenant-', '')}-${randomSuffix}`,
      uuid: generateSecureUuid(),
      tenantId: currentTenant.id,
      name: newCustName.trim(),
      email: newCustEmail.trim() || undefined,
      nickname: newCustNickname.trim() || newCustName.trim(),
      joinedDate: new Date().toISOString().slice(0, 10),
      customGoal: newCustGoal.trim() || '毎日の記録を続けて健康＆目標達成！',
      medicalCondition: newCustMedicalCondition.trim() || undefined,
      status: 'active',
    };

    onCreateCustomer(newCustomer);
    setCurrentTenant((prev) => ({
      ...prev,
      customerIds: [...prev.customerIds, newCustomer.id],
    }));
    setIsNewCustomerModalOpen(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustNickname('');
    setNewCustGoal('');
    setNewCustMedicalCondition('');
  };

  // Open records modal for a customer
  const handleOpenRecordsModal = (customer: Customer) => {
    setRecordsTargetCustomer(customer);
    const logs = getGenericDailyLogs(customer.id, currentTenant.id);
    const evals = getGenericEvalRecords(customer.id, currentTenant.id);
    setCustDailyLogs(logs);
    setCustEvalRecords(evals);
    setRecordsActiveSubTab('daily');
    setEditingDailyLog(null);
    setEditingEvalRecord(null);
  };

  // Save Customer Profile Edit
  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    persistCustomer(editingCustomer);
    try {
      await saveCustomerToFirestore(editingCustomer);
    } catch (err) {
      console.warn('Firestore customer edit sync:', err);
    }
    if (onUpdateCustomer) {
      onUpdateCustomer(editingCustomer);
    }
    setEditingCustomer(null);
    triggerSparkleConfetti();
  };

  // Save Edited Daily Log
  const handleSaveEditedDailyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordsTargetCustomer || !editingDailyLog) return;
    const updated = updateGenericDailyLog(
      recordsTargetCustomer.id,
      currentTenant.id,
      editingDailyLog
    );
    setCustDailyLogs(updated);
    try {
      await saveGenericDailyLogToFirestore(editingDailyLog);
    } catch (err) {
      console.warn('Firestore daily log edit sync:', err);
    }
    setEditingDailyLog(null);
    if (onRefreshRecords) onRefreshRecords();
  };

  // Delete Daily Log
  const handleDeleteDailyLog = async (logId: string) => {
    if (!recordsTargetCustomer) return;
    if (!window.confirm('この日の記録を削除してもよろしいですか？')) return;
    const updated = deleteGenericDailyLog(
      recordsTargetCustomer.id,
      currentTenant.id,
      logId
    );
    setCustDailyLogs(updated);
    try {
      await deleteGenericDailyLogFromFirestore(recordsTargetCustomer.id, logId);
    } catch (err) {
      console.warn('Firestore daily log delete sync:', err);
    }
    if (onRefreshRecords) onRefreshRecords();
  };

  // Save Edited Eval Record
  const handleSaveEditedEvalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordsTargetCustomer || !editingEvalRecord) return;
    const updated = updateGenericEvalRecord(
      recordsTargetCustomer.id,
      currentTenant.id,
      editingEvalRecord
    );
    setCustEvalRecords(updated);
    try {
      await saveGenericEvalRecordToFirestore(editingEvalRecord);
    } catch (err) {
      console.warn('Firestore eval record edit sync:', err);
    }
    setEditingEvalRecord(null);
    if (onRefreshRecords) onRefreshRecords();
  };

  // Delete Eval Record
  const handleDeleteEvalRecord = async (recordId: string) => {
    if (!recordsTargetCustomer) return;
    if (!window.confirm('この定期評価レコードを削除してもよろしいですか？')) return;
    const updated = deleteGenericEvalRecord(
      recordsTargetCustomer.id,
      currentTenant.id,
      recordId
    );
    setCustEvalRecords(updated);
    try {
      await deleteGenericEvalRecordFromFirestore(recordsTargetCustomer.id, recordId);
    } catch (err) {
      console.warn('Firestore eval record delete sync:', err);
    }
    if (onRefreshRecords) onRefreshRecords();
  };

  const tenantCustomers = customers.filter((c) => c.tenantId === currentTenant.id);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 bg-gradient-to-r from-amber-50 via-white to-amber-50/60 border border-amber-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {currentTenant.appIconUrl ? (
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 border-amber-300 flex-shrink-0 bg-white p-0.5">
                <img
                  src={currentTenant.appIconUrl}
                  alt={currentTenant.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                🏢
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  事業者 (Tenant) 管理コンソール
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  ID: <span className="text-amber-700">{currentTenant.id}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
                {currentTenant.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                顧客（ユーザー）画面のヘッダー、ブランドカラー、アバター、AIペルソナ、日々の記録項目、定期評価項目を自由にカスタマイズできます。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => onOpenCustomerPage(currentTenant.id, tenantCustomers[0]?.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs hover:shadow transition-all"
              title="この業者の設定で顧客画面をプレビュー"
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>顧客画面でプレビュー</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>設定を保存する</span>
            </button>
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="mt-3 p-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-between shadow-md animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>業者の設定を正常に保存しました！顧客ページにも即時反映されます。</span>
            </div>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('branding')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'branding'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>① ヘッダー＆カラーテーマ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('persona')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'persona'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>② アイコン/顔写真・AIペルソナ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('daily')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'daily'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>③ 日々の記録項目設定</span>
        </button>

        <button
          onClick={() => setActiveSubTab('eval')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'eval'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>④ 定期的な評価項目設定</span>
        </button>

        <button
          onClick={() => setActiveSubTab('customers')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'customers'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>⑤ 顧客ID管理 ({tenantCustomers.length}名)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lounge')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'lounge'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>⑥ 推し活ラウンジ・リンク設定 ({currentTenant.loungeLinks?.length || 0}件)</span>
        </button>
      </div>

      {/* SUB TAB 1: BRANDING & THEME */}
      {activeSubTab === 'branding' && (
        <div className="space-y-6">
          {/* Business Account & Login Settings */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-amber-500">🏢</span>
                <span>事業者アカウント情報 (Pro Partner ログイン設定)</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">
                ID: {currentTenant.id}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pro Partnerとしての屋号名およびログイン認証用アカウントメールアドレスを設定・変更します。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  事業者名 / 屋号
                </label>
                <input
                  type="text"
                  value={currentTenant.name}
                  onChange={(e) =>
                    setCurrentTenant({ ...currentTenant, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ログイン用メールアドレス (Pro Partner アカウント)
                </label>
                <input
                  type="email"
                  value={currentTenant.email || ''}
                  onChange={(e) =>
                    setCurrentTenant({ ...currentTenant, email: e.target.value })
                  }
                  placeholder="例: kotsuka@creativesd.net"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">※この業者の管理者がログイン認証するメールアドレス</p>
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span className="text-amber-500">🏷️</span>
              <span>ユーザーページ（顧客ページ）のヘッダー設定</span>
            </h3>
            <p className="text-xs text-slate-500">
              顧客がログインした画面の最上部に表示されるアプリ名・見出し・バッジを設定します（例:「MY-CARAT Log」「POWER-FIT Log」など）。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  メインヘッダータイトル
                </label>
                <input
                  type="text"
                  value={currentTenant.headerTitle}
                  onChange={(e) =>
                    setCurrentTenant({ ...currentTenant, headerTitle: e.target.value })
                  }
                  placeholder="例: MY-CARAT Log または POWER-FIT Log"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  上部バッジラベル
                </label>
                <input
                  type="text"
                  value={currentTenant.badgeText}
                  onChange={(e) =>
                    setCurrentTenant({ ...currentTenant, badgeText: e.target.value })
                  }
                  placeholder="例: CARAT 💎 Care, FITNESS PRO 🔥"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  サブタイトル / 説明
                </label>
                <input
                  type="text"
                  value={currentTenant.headerSubtitle}
                  onChange={(e) =>
                    setCurrentTenant({ ...currentTenant, headerSubtitle: e.target.value })
                  }
                  placeholder="例: 毎日のリハビリ＆セルフケア手帳"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* App Icon & Favicon Selector */}
          <CheerIconSelector
            selectedIconUrl={currentTenant.appIconUrl || ''}
            onSelectIcon={(iconUrl, favUrl) => {
              setCurrentTenant((prev) => ({
                ...prev,
                appIconUrl: iconUrl,
                faviconUrl: favUrl,
              }));
            }}
            title={`${currentTenant.name} アプリアイコン＆ファビコン切替`}
            description="顧客画面（My Lounge）、ホーム画面追加時のアイコン、およびブラウザタブのファビコンに適用するアイコンを選択します。"
            badgeLabel={`Pro Partner: ${currentTenant.name}`}
            variant="provider"
            appNamePreview={currentTenant.headerTitle || currentTenant.name}
          />

          {/* Color Theme Selector (10 Presets + Custom) */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>カラーテーマ設定 (10種類の洗練されたプリセット)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                推し活アイドル、トレーナー、先生、仲間、クリニックなど各業界に最適な10種類のカラーパレットをご用意しています。自社のイメージに合わせてワンクリックで選択できます。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COLOR_THEMES.map((theme, idx) => {
                const isSelected = currentTenant.theme.id === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all text-left relative overflow-hidden group ${
                      isSelected
                        ? 'border-amber-500 shadow-md bg-amber-50/20 scale-[1.01]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                        <span>{theme.name}</span>
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 h-6 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                      <div className="h-full flex-1" style={{ backgroundColor: theme.primaryColor }} />
                      <div className="h-full flex-1" style={{ backgroundColor: theme.secondaryColor }} />
                      <div className="h-full flex-1" style={{ backgroundColor: theme.accentColor }} />
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                      <span>{theme.primaryColor}</span>
                      <span>{theme.secondaryColor}</span>
                      <span>{theme.accentColor}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Color Tuning */}
            {currentTenant.theme.id === 'theme-custom' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700">カスタムカラー微調整 (HEXコード)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">メインカラー</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTenant.theme.primaryColor}
                        onChange={(e) =>
                          setCurrentTenant({
                            ...currentTenant,
                            theme: { ...currentTenant.theme, primaryColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentTenant.theme.primaryColor}
                        onChange={(e) =>
                          setCurrentTenant({
                            ...currentTenant,
                            theme: { ...currentTenant.theme, primaryColor: e.target.value },
                          })
                        }
                        className="w-full text-xs font-mono px-2 py-1 border rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">サブカラー</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTenant.theme.secondaryColor}
                        onChange={(e) =>
                          setCurrentTenant({
                            ...currentTenant,
                            theme: { ...currentTenant.theme, secondaryColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentTenant.theme.secondaryColor}
                        onChange={(e) =>
                          setCurrentTenant({
                            ...currentTenant,
                            theme: { ...currentTenant.theme, secondaryColor: e.target.value },
                          })
                        }
                        className="w-full text-xs font-mono px-2 py-1 border rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">アクセントカラー</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentTenant.theme.accentColor}
                        onChange={(e) =>
                          setCurrentTenant({
                            ...currentTenant,
                            theme: { ...currentTenant.theme, accentColor: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentTenant.theme.accentColor}
                        onChange={(e) =>
                          setCurrentTenant({
                            ...currentTenant,
                            theme: { ...currentTenant.theme, accentColor: e.target.value },
                          })
                        }
                        className="w-full text-xs font-mono px-2 py-1 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 2: PERSONA & AVATAR */}
      {activeSubTab === 'persona' && (
        <div className="space-y-6">
          {/* Avatar Picture Setup (Upload or AI Generated) */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                <span>アイコン・顔写真の設定 (自分で入れる ＆ AIに作ってもらう)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                顧客画面のヘッダーやメッセージ欄に表示されるパートナーのアイコン画像を設定します。お好きな写真ファイルをアップロードするか、AIアバター生成機能で自動作成できます。
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              {/* Current Preview */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-2 ring-amber-300 relative group bg-slate-200">
                  <img
                    src={currentTenant.aiPersona.avatarUrl}
                    alt={currentTenant.aiPersona.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/jeonghan_photo.jpg';
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-600">
                  {currentTenant.aiPersona.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentTenant.aiPersona.avatarType}
                </span>
              </div>

              {/* Upload or Direct URL */}
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ① 自分でファイルアップロード または 画像URL指定
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>写真ファイルをアップロード</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={currentTenant.aiPersona.avatarUrl}
                      onChange={(e) =>
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: {
                            ...currentTenant.aiPersona,
                            avatarUrl: e.target.value,
                            avatarType: 'upload',
                          },
                        })
                      }
                      placeholder="https://... または /jeonghan_photo.jpg"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* AI Avatar Generation Studio */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-50/80 to-amber-50/80 border border-purple-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                      <span>② AIにアバター・顔写真を作ってもらう</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      AI Avatar Studio
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <select
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="photo">リアル写真調 (Real Photo)</option>
                      <option value="anime">イラスト調 (Anime/Manga)</option>
                      <option value="3d">3Dキャラクター調</option>
                      <option value="dot">ドット絵 (Pixel Art)</option>
                    </select>

                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="例: 元気な爽やか男性パーソナルトレーナー, 優しい笑顔の女性講師"
                      className="flex-1 w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />

                    <button
                      type="button"
                      onClick={handleGenerateAIAvatar}
                      disabled={isGeneratingAvatar}
                      className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                    >
                      {isGeneratingAvatar ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>生成中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>AI生成して適用</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Persona Personality & Quotes */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-500" />
              <span>AIペルソナ設定 (キャラクター＆励ましメッセージ)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ペルソナ名 / キャラクター名
                </label>
                <input
                  type="text"
                  value={currentTenant.aiPersona.name}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      aiPersona: { ...currentTenant.aiPersona, name: e.target.value },
                    })
                  }
                  placeholder="例: ジョンハン, KENJIコーチ, 美咲先生"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  役割・肩書き
                </label>
                <input
                  type="text"
                  value={currentTenant.aiPersona.role}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      aiPersona: { ...currentTenant.aiPersona, role: e.target.value },
                    })
                  }
                  placeholder="例: 専属アイドル, チーフトレーナー, 担任講師"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  口調・トーン
                </label>
                <select
                  value={currentTenant.aiPersona.tone}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      aiPersona: { ...currentTenant.aiPersona, tone: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <option value="friendly">フレンドリー・親しみやすい</option>
                  <option value="passionate">情熱的・熱血 (トレーナー風)</option>
                  <option value="gentle">優しく包み込む (先生・癒やし)</option>
                  <option value="polite">丁寧・誠実 (医療・ビジネス)</option>
                  <option value="cool">クール・知的</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  アバタータップ時の吹き出しセリフ (ワンタップ励まし)
                </label>
                <input
                  type="text"
                  value={currentTenant.aiPersona.speechBubbleText}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      aiPersona: {
                        ...currentTenant.aiPersona,
                        speechBubbleText: e.target.value,
                      },
                    })
                  }
                  placeholder="例: ✨ あおいさん、ハニヘ〜！今日も自分のペースでね👼🪽"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Gemini Chat Persona Details ("相手が誰か"設定) */}
              <div className="sm:col-span-3 p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-indigo-50/80 border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      対話AIチャット詳細設定（「相手が誰か」のパーソナリティ）
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                    Gemini 連携
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  顧客が「本人と会話しているかのようなAIチャット」を楽しむための、キャラクターの口調・一人称・背景設定です。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      一人称（AI自身の呼び名）
                    </label>
                    <input
                      type="text"
                      value={currentTenant.aiPersona.chatFirstPerson || ''}
                      onChange={(e) =>
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: {
                            ...currentTenant.aiPersona,
                            chatFirstPerson: e.target.value,
                          },
                        })
                      }
                      placeholder="例: 僕, 私, 俺, 先生, わたし"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      相手（顧客）の呼び方
                    </label>
                    <input
                      type="text"
                      value={currentTenant.aiPersona.chatSecondPerson || ''}
                      onChange={(e) =>
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: {
                            ...currentTenant.aiPersona,
                            chatSecondPerson: e.target.value,
                          },
                        })
                      }
                      placeholder="例: あおいさん, ○○ちゃん, あなた, 君"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      チャット開始時の第一声（オープニング挨拶）
                    </label>
                    <input
                      type="text"
                      value={currentTenant.aiPersona.chatGreeting || ''}
                      onChange={(e) =>
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: {
                            ...currentTenant.aiPersona,
                            chatGreeting: e.target.value,
                          },
                        })
                      }
                      placeholder="例: あおいさん、ハニヘ〜！👼🪽 今日も会えて嬉しいよ。体調はどう？何でも話してね！"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      キャラクター詳細設定・性格・口調の指示（AIプロンプト）
                    </label>
                    <textarea
                      rows={2}
                      value={currentTenant.aiPersona.chatPersonality || ''}
                      onChange={(e) =>
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: {
                            ...currentTenant.aiPersona,
                            chatPersonality: e.target.value,
                          },
                        })
                      }
                      placeholder="例: SEVENTEENの天使担当ジョンハン。優しく包み込み、時にはお茶目で甘え上手。ファンの頑張りを誰よりも認め、無理をさせない温かい言葉をかけてくれる。口調は「〜だよ」「〜ね」「ハニヘ〜👼」など。"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Encouragement Quotes List */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-pink-500" />
                  <span>顧客画面に日替わり表示される励ましメッセージ ({currentTenant.aiPersona.encouragementQuotes.length}件)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newQuote: AIPersonaQuote = {
                      id: `quote-${Date.now()}`,
                      quote: '今日も一歩前進！あなたの努力は実を結びます。',
                      subtext: `${currentTenant.aiPersona.name}より`,
                      emoji: '✨',
                    };
                    setCurrentTenant({
                      ...currentTenant,
                      aiPersona: {
                        ...currentTenant.aiPersona,
                        encouragementQuotes: [newQuote, ...currentTenant.aiPersona.encouragementQuotes],
                      },
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>メッセージを追加</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {currentTenant.aiPersona.encouragementQuotes.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <input
                      type="text"
                      value={q.emoji}
                      onChange={(e) => {
                        const updated = [...currentTenant.aiPersona.encouragementQuotes];
                        updated[idx].emoji = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: { ...currentTenant.aiPersona, encouragementQuotes: updated },
                        });
                      }}
                      className="w-8 text-center bg-white border border-slate-200 rounded py-1"
                    />
                    <input
                      type="text"
                      value={q.quote}
                      onChange={(e) => {
                        const updated = [...currentTenant.aiPersona.encouragementQuotes];
                        updated[idx].quote = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: { ...currentTenant.aiPersona, encouragementQuotes: updated },
                        });
                      }}
                      placeholder="メッセージ本文"
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-800"
                    />
                    <input
                      type="text"
                      value={q.subtext}
                      onChange={(e) => {
                        const updated = [...currentTenant.aiPersona.encouragementQuotes];
                        updated[idx].subtext = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: { ...currentTenant.aiPersona, encouragementQuotes: updated },
                        });
                      }}
                      placeholder="サブテキスト"
                      className="w-36 bg-white border border-slate-200 rounded px-2 py-1 text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = currentTenant.aiPersona.encouragementQuotes.filter((_, i) => i !== idx);
                        setCurrentTenant({
                          ...currentTenant,
                          aiPersona: { ...currentTenant.aiPersona, encouragementQuotes: updated },
                        });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: DAILY LOG CONFIG */}
      {activeSubTab === 'daily' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-amber-500" />
                <span>日々の記録を取る項目のカスタマイズ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                顧客が毎日入力するチェックリスト、スライダー指標、数値項目、メモ欄を業界に合わせて自由に設定できます。
              </p>
            </div>

            {/* Checklists */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">① 毎日のルーティン・チェックリスト</h4>
                  <p className="text-[11px] text-slate-400">日々の運動、ストレッチ、宿題、ケアなどのチェック項目</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newItem = {
                      id: `item-${Date.now()}`,
                      label: '新規チェック項目',
                      icon: '✅',
                      defaultChecked: false,
                    };
                    setCurrentTenant({
                      ...currentTenant,
                      dailyConfig: {
                        ...currentTenant.dailyConfig,
                        checkItems: [...currentTenant.dailyConfig.checkItems, newItem],
                      },
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>項目を追加</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentTenant.dailyConfig.checkItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs">
                    <input
                      type="text"
                      value={item.icon || '✅'}
                      onChange={(e) => {
                        const updated = [...currentTenant.dailyConfig.checkItems];
                        updated[idx].icon = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          dailyConfig: { ...currentTenant.dailyConfig, checkItems: updated },
                        });
                      }}
                      className="w-8 text-center border rounded py-1"
                    />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...currentTenant.dailyConfig.checkItems];
                        updated[idx].label = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          dailyConfig: { ...currentTenant.dailyConfig, checkItems: updated },
                        });
                      }}
                      className="flex-1 font-bold border rounded px-2 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = currentTenant.dailyConfig.checkItems.filter((_, i) => i !== idx);
                        setCurrentTenant({
                          ...currentTenant,
                          dailyConfig: { ...currentTenant.dailyConfig, checkItems: updated },
                        });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">② スライダー評価項目</h4>
                  <p className="text-[11px] text-slate-400">疲労度、痛み、集中力、モチベーションなど度合いを測る指標</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSlider = {
                      id: `slider-${Date.now()}`,
                      label: '新規スライダー指標',
                      min: 1,
                      max: 5,
                      step: 1,
                      minLabel: '低',
                      maxLabel: '高',
                      defaultValue: 3,
                    };
                    setCurrentTenant({
                      ...currentTenant,
                      dailyConfig: {
                        ...currentTenant.dailyConfig,
                        sliders: [...currentTenant.dailyConfig.sliders, newSlider],
                      },
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>スライダーを追加</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentTenant.dailyConfig.sliders.map((s, idx) => (
                  <div key={s.id} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) => {
                        const updated = [...currentTenant.dailyConfig.sliders];
                        updated[idx].label = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          dailyConfig: { ...currentTenant.dailyConfig, sliders: updated },
                        });
                      }}
                      placeholder="指標名"
                      className="flex-1 font-bold border rounded px-2 py-1 w-full"
                    />
                    <div className="flex items-center gap-1 w-full sm:w-auto">
                      <span className="text-[10px] text-slate-400">最小:</span>
                      <input
                        type="text"
                        value={s.minLabel || ''}
                        onChange={(e) => {
                          const updated = [...currentTenant.dailyConfig.sliders];
                          updated[idx].minLabel = e.target.value;
                          setCurrentTenant({
                            ...currentTenant,
                            dailyConfig: { ...currentTenant.dailyConfig, sliders: updated },
                          });
                        }}
                        className="w-16 border rounded px-1.5 py-1 text-center"
                      />
                      <span className="text-[10px] text-slate-400">〜 最大:</span>
                      <input
                        type="text"
                        value={s.maxLabel || ''}
                        onChange={(e) => {
                          const updated = [...currentTenant.dailyConfig.sliders];
                          updated[idx].maxLabel = e.target.value;
                          setCurrentTenant({
                            ...currentTenant,
                            dailyConfig: { ...currentTenant.dailyConfig, sliders: updated },
                          });
                        }}
                        className="w-16 border rounded px-1.5 py-1 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = currentTenant.dailyConfig.sliders.filter((_, i) => i !== idx);
                          setCurrentTenant({
                            ...currentTenant,
                            dailyConfig: { ...currentTenant.dailyConfig, sliders: updated },
                          });
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Numeric Fields */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">③ 数値入力項目 (歩数、体温、体重、時間等)</h4>
                  <p className="text-[11px] text-slate-400">日々の具体的な数値を入力する欄</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newField = {
                      id: `field-${Date.now()}`,
                      label: '新規数値項目',
                      unit: '',
                      placeholder: '0',
                      defaultValue: 0,
                    };
                    setCurrentTenant({
                      ...currentTenant,
                      dailyConfig: {
                        ...currentTenant.dailyConfig,
                        numericFields: [...currentTenant.dailyConfig.numericFields, newField],
                      },
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>数値項目を追加</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentTenant.dailyConfig.numericFields.map((nf, idx) => (
                  <div key={nf.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs">
                    <input
                      type="text"
                      value={nf.label}
                      onChange={(e) => {
                        const updated = [...currentTenant.dailyConfig.numericFields];
                        updated[idx].label = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          dailyConfig: { ...currentTenant.dailyConfig, numericFields: updated },
                        });
                      }}
                      placeholder="項目名"
                      className="flex-1 font-bold border rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={nf.unit}
                      onChange={(e) => {
                        const updated = [...currentTenant.dailyConfig.numericFields];
                        updated[idx].unit = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          dailyConfig: { ...currentTenant.dailyConfig, numericFields: updated },
                        });
                      }}
                      placeholder="単位 (例: mg, ℃, 歩, kg, 分)"
                      className="w-24 border rounded px-2 py-1 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = currentTenant.dailyConfig.numericFields.filter((_, i) => i !== idx);
                        setCurrentTenant({
                          ...currentTenant,
                          dailyConfig: { ...currentTenant.dailyConfig, numericFields: updated },
                        });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation / Energy Level Label */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">④ モチベーション/エネルギー指数設定</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">指数の名称</label>
                  <input
                    type="text"
                    value={currentTenant.dailyConfig.energyLabel}
                    onChange={(e) =>
                      setCurrentTenant({
                        ...currentTenant,
                        dailyConfig: {
                          ...currentTenant.dailyConfig,
                          energyLabel: e.target.value,
                        },
                      })
                    }
                    placeholder="例: 推し活エネルギー, 闘魂度, モチベーション"
                    className="w-full px-3 py-1.5 border rounded-xl text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">アイコン</label>
                  <input
                    type="text"
                    value={currentTenant.dailyConfig.energyIcon}
                    onChange={(e) =>
                      setCurrentTenant({
                        ...currentTenant,
                        dailyConfig: {
                          ...currentTenant.dailyConfig,
                          energyIcon: e.target.value,
                        },
                      })
                    }
                    className="w-20 px-3 py-1.5 border rounded-xl text-xs text-center font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Memo & Quick Tags */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">⑤ メモ欄の名称・クイック入力タグ</h4>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">メモ欄のタイトル</label>
                <input
                  type="text"
                  value={currentTenant.dailyConfig.memoLabel}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      dailyConfig: { ...currentTenant.dailyConfig, memoLabel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border rounded-xl text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  ワンタップ入力クイックタグ (カンマ区切り)
                </label>
                <input
                  type="text"
                  value={currentTenant.dailyConfig.quickTags.join(', ')}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      dailyConfig: {
                        ...currentTenant.dailyConfig,
                        quickTags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 border rounded-xl text-xs bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 4: PERIODIC EVAL CONFIG */}
      {activeSubTab === 'eval' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-amber-500" />
                <span>定期的な評価項目の設定 (汎用測定ドック)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                専門的すぎる固定測定（理学療法手技など）は省き、業者が自由に定義した評価指標（回数、数値、スコア、自由記述など）を顧客にフィードバック・記録できます。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  定期評価のタイトル
                </label>
                <input
                  type="text"
                  value={currentTenant.evalConfig.title}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      evalConfig: { ...currentTenant.evalConfig, title: e.target.value },
                    })
                  }
                  placeholder="例: 月次ボディメイク測定, 定期学習到達度チェック"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  評価者の肩書 / ラベル
                </label>
                <input
                  type="text"
                  value={currentTenant.evalConfig.evaluatorLabel}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      evalConfig: { ...currentTenant.evalConfig, evaluatorLabel: e.target.value },
                    })
                  }
                  placeholder="例: 担当トレーナー, 担当講師, 専任スタッフ"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* Metrics List */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">測定・評価指標のリスト</h4>
                  <p className="text-[11px] text-slate-400">測定項目名、カテゴリ、単位、目標値</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newMetric = {
                      id: `metric-${Date.now()}`,
                      label: '新規測定指標',
                      category: '一般',
                      unit: '',
                      target: 10,
                      type: 'number' as const,
                    };
                    setCurrentTenant({
                      ...currentTenant,
                      evalConfig: {
                        ...currentTenant.evalConfig,
                        metrics: [...currentTenant.evalConfig.metrics, newMetric],
                      },
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>評価項目を追加</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentTenant.evalConfig.metrics.map((m, idx) => (
                  <div key={m.id} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <input
                      type="text"
                      value={m.category}
                      onChange={(e) => {
                        const updated = [...currentTenant.evalConfig.metrics];
                        updated[idx].category = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          evalConfig: { ...currentTenant.evalConfig, metrics: updated },
                        });
                      }}
                      placeholder="分類"
                      className="w-24 bg-white border rounded px-2 py-1 font-bold text-slate-600"
                    />
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const updated = [...currentTenant.evalConfig.metrics];
                        updated[idx].label = e.target.value;
                        setCurrentTenant({
                          ...currentTenant,
                          evalConfig: { ...currentTenant.evalConfig, metrics: updated },
                        });
                      }}
                      placeholder="指標名 (例: 30秒立ち上がり, 体脂肪率)"
                      className="flex-1 bg-white border rounded px-2 py-1 font-bold text-slate-800"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={m.unit}
                        onChange={(e) => {
                          const updated = [...currentTenant.evalConfig.metrics];
                          updated[idx].unit = e.target.value;
                          setCurrentTenant({
                            ...currentTenant,
                            evalConfig: { ...currentTenant.evalConfig, metrics: updated },
                          });
                        }}
                        placeholder="単位 (例: 回, %, kg)"
                        className="w-20 bg-white border rounded px-2 py-1 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = currentTenant.evalConfig.metrics.filter((_, i) => i !== idx);
                          setCurrentTenant({
                            ...currentTenant,
                            evalConfig: { ...currentTenant.evalConfig, metrics: updated },
                          });
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice & Goal Labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  フィードバック欄の名称
                </label>
                <input
                  type="text"
                  value={currentTenant.evalConfig.adviceLabel}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      evalConfig: { ...currentTenant.evalConfig, adviceLabel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  次回目標欄の名称
                </label>
                <input
                  type="text"
                  value={currentTenant.evalConfig.goalLabel}
                  onChange={(e) =>
                    setCurrentTenant({
                      ...currentTenant,
                      evalConfig: { ...currentTenant.evalConfig, goalLabel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 5: CUSTOMERS LINKAGE */}
      {activeSubTab === 'customers' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>所属顧客 (ユーザー) ID一覧・カルテ管理</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  業者ID <span className="font-mono font-bold text-amber-700">[{currentTenant.id}]</span> に紐付いている顧客アカウントです。顧客の主疾患・個別目標の設定や、過去の記録・評価の修正が行えます。
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>新規顧客IDを発行</span>
              </button>
            </div>

            {/* Customer List */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 whitespace-nowrap">顧客ID</th>
                    <th className="py-3 px-4 whitespace-nowrap">顧客氏名 / 呼称</th>
                    <th className="py-3 px-4 whitespace-nowrap">アカウントメール</th>
                    <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">主疾患・健康課題・注力テーマ</th>
                    <th className="py-3 px-4 min-w-[220px] max-w-sm">顧客の個別目標</th>
                    <th className="py-3 px-4 whitespace-nowrap">登録日</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {tenantCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {cust.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        <span>{cust.name}</span>
                        {cust.nickname && cust.nickname !== cust.name && (
                          <span className="text-slate-400 font-normal ml-1.5">
                            ({cust.nickname})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {cust.email ? (
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <span className="text-[11px] text-pink-500">✉️</span>
                            <span>{cust.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">未設定</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        {cust.medicalCondition ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[11px] whitespace-nowrap shadow-xs">
                            {cust.medicalCondition}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">未設定 (一般管理)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 min-w-[220px] max-w-sm whitespace-normal break-words leading-relaxed font-medium">
                        {cust.customGoal || '目標設定なし'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {cust.joinedDate}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-stretch gap-1 w-24 sm:w-28 ml-auto">
                          <button
                            type="button"
                            onClick={() => setEditingCustomer({ ...cust })}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title="顧客プロファイル・主疾患を編集"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span>設定</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenRecordsModal(cust)}
                            className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold text-xs inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title="過去の日報ログ・定期評価の修正・管理"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>記録修正</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenCustomerPage(currentTenant.id, cust.id)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
                            title="顧客のMy Lounge画面を開く"
                          >
                            <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>画面を開く</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 6: 推し活ラウンジ・リンク設定 */}
      {activeSubTab === 'lounge' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>推し活ラウンジ・外部コンテンツ＆リンク設定</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  メンバー画面の「💎 推し活ラウンジ」モーダルに表示されるファンクラブ、YouTube動画、公式SNS、BGMリンク等をパートナー側で自由にカスタマイズできます。
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetDefaultLinks}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  title="SEVENTEEN公式リンク4件を復元"
                >
                  初期リンクに戻す
                </button>
                <button
                  type="button"
                  onClick={handleAddLoungeLink}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>新規リンク追加</span>
                </button>
              </div>
            </div>

            {/* List of Links */}
            <div className="space-y-3">
              {(!currentTenant.loungeLinks || currentTenant.loungeLinks.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <p className="text-xs text-slate-500 font-medium">現在リンクが登録されていません。（未設定時はデフォルトのSEVENTEEN公式リンクが表示されます）</p>
                  <button
                    type="button"
                    onClick={handleResetDefaultLinks}
                    className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold rounded-xl transition-all"
                  >
                    💎 デフォルトの推し活リンクを読み込む
                  </button>
                </div>
              ) : (
                currentTenant.loungeLinks.map((link, idx) => (
                  <div key={link.id || idx} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3 hover:border-pink-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>コンテンツ #{idx + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLoungeLink(idx)}
                        className="text-rose-500 hover:text-rose-700 px-2 py-1 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="このリンクを削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>削除</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">タイトル・サイト名 *</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleUpdateLoungeLink(idx, 'title', e.target.value)}
                          placeholder="例: Weverse SEVENTEEN"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">バッジ表示 (例: 公式YouTube / ファンクラブ / BGM)</label>
                        <input
                          type="text"
                          value={link.badge || ''}
                          onChange={(e) => handleUpdateLoungeLink(idx, 'badge', e.target.value)}
                          placeholder="例: 公式ファンクラブ"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-pink-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">リンク先 URL *</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleUpdateLoungeLink(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">説明・ひとことコメント</label>
                      <input
                        type="text"
                        value={link.desc}
                        onChange={(e) => handleUpdateLoungeLink(idx, 'desc', e.target.value)}
                        placeholder="例: ジョンハンの投稿や動画を直接チェック！"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-pink-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>推し活ラウンジ設定を保存する</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Customer */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">新規顧客IDの発行</h3>
                <p className="text-xs text-slate-500">業者ID [{currentTenant.id}] に紐づく顧客を作成</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">顧客氏名 *</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  required
                  placeholder="例: 佐藤 健 / 鈴木 花子"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ログイン用メールアドレス (My Lounge アカウント)
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="例: hisako@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">※メンバーがログインするメールアドレス（後から変更可能）</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">呼称 / ニックネーム</label>
                <input
                  type="text"
                  value={newCustNickname}
                  onChange={(e) => setNewCustNickname(e.target.value)}
                  placeholder="例: 健さん / 花ちゃん"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  主疾患・健康課題・注力テーマ (PDF帳票にも反映)
                </label>
                <input
                  type="text"
                  value={newCustMedicalCondition}
                  onChange={(e) => setNewCustMedicalCondition(e.target.value)}
                  placeholder="例: 好酸球性多発血管炎性肉芽腫症 (EGPA), 腰痛リハビリ, 体脂肪燃焼"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">個別目標 / チャレンジ</label>
                <input
                  type="text"
                  value={newCustGoal}
                  onChange={(e) => setNewCustGoal(e.target.value)}
                  placeholder="例: 3ヶ月で体脂肪率-3%！"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                >
                  発行・登録
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Customer Profile */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">顧客カルテ設定の変更</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {editingCustomer.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomerEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">顧客氏名</label>
                <input
                  type="text"
                  value={editingCustomer.name}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ログイン用メールアドレス (My Lounge アカウント)
                </label>
                <input
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, email: e.target.value })
                  }
                  placeholder="例: hisako@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">※メンバーがログインするメールアドレス（確認後に設定可能）</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">呼称 / ニックネーム</label>
                <input
                  type="text"
                  value={editingCustomer.nickname || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, nickname: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  主疾患・健康管理区分・注力テーマ (PDFサマリー帳票にも反映)
                </label>
                <input
                  type="text"
                  value={editingCustomer.medicalCondition || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, medicalCondition: e.target.value })
                  }
                  placeholder="例: 好酸球性多発血管炎性肉芽腫症 (EGPA)"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-indigo-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ※ここに設定した疾患名が、PDF出力時のヘッダーや主疾患欄に自動反映されます。
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">個別目標 / チャレンジ</label>
                <textarea
                  rows={2}
                  value={editingCustomer.customGoal || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, customGoal: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
                >
                  変更を保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage & Edit Past Records (Daily Logs & Periodic Evaluations) */}
      {recordsTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-800">
                    過去レコードの管理・修正
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                    {recordsTargetCustomer.name} 様 ({recordsTargetCustomer.id})
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  入力間違いがあった過去の日誌データや定期測定データを修正できます。
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRecordsTargetCustomer(null);
                  setEditingDailyLog(null);
                  setEditingEvalRecord(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab navigation */}
            <div className="px-5 pt-3 border-b border-slate-200 flex gap-4 bg-white">
              <button
                type="button"
                onClick={() => {
                  setRecordsActiveSubTab('daily');
                  setEditingDailyLog(null);
                }}
                className={`pb-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                  recordsActiveSubTab === 'daily'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📅 日々の記録ログ ({custDailyLogs.length}件)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecordsActiveSubTab('eval');
                  setEditingEvalRecord(null);
                }}
                className={`pb-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                  recordsActiveSubTab === 'eval'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🏆 定期評価・測定レコード ({custEvalRecords.length}件)
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Daily Logs View / Edit Form */}
              {recordsActiveSubTab === 'daily' && (
                <div>
                  {editingDailyLog ? (
                    /* Edit Form for a Single Daily Log */
                    <form
                      onSubmit={handleSaveEditedDailyLog}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <h4 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-amber-700" />
                          <span>日々の記録の修正 ({editingDailyLog.date})</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingDailyLog(null)}
                          className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                        >
                          閉じる
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">記録日</label>
                          <input
                            type="date"
                            value={editingDailyLog.date}
                            onChange={(e) =>
                              setEditingDailyLog({ ...editingDailyLog, date: e.target.value })
                            }
                            required
                            className="w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">体調 (5段階)</label>
                          <select
                            value={editingDailyLog.condition || 'good'}
                            onChange={(e) =>
                              setEditingDailyLog({
                                ...editingDailyLog,
                                condition: e.target.value as any,
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold"
                          >
                            <option value="great">😄 絶好調 (5)</option>
                            <option value="good">🙂 良好 (4)</option>
                            <option value="okay">😐 普通 (3)</option>
                            <option value="tired">😫 倦怠感 (2)</option>
                            <option value="fever">🤒 微熱・不調 (1)</option>
                          </select>
                        </div>

                        {currentTenant.dailyConfig.enableEnergy && (
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              {currentTenant.dailyConfig.energyLabel} (%)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editingDailyLog.energyLevel ?? 80}
                              onChange={(e) =>
                                setEditingDailyLog({
                                  ...editingDailyLog,
                                  energyLevel: Number(e.target.value),
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold font-mono"
                            />
                          </div>
                        )}
                      </div>

                      {/* Numeric fields */}
                      {currentTenant.dailyConfig.numericFields.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          {currentTenant.dailyConfig.numericFields.map((nf) => (
                            <div key={nf.id}>
                              <label className="block font-bold text-slate-700 mb-1">
                                {nf.label} ({nf.unit})
                              </label>
                              <input
                                type="number"
                                step={nf.id === 'bodyTemp' ? '0.1' : '1'}
                                value={editingDailyLog.numericValues?.[nf.id] ?? ''}
                                onChange={(e) =>
                                  setEditingDailyLog({
                                    ...editingDailyLog,
                                    numericValues: {
                                      ...editingDailyLog.numericValues,
                                      [nf.id]: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Slider fields */}
                      {currentTenant.dailyConfig.sliders.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {currentTenant.dailyConfig.sliders.map((sl) => (
                            <div key={sl.id}>
                              <label className="block font-bold text-slate-700 mb-1 flex justify-between">
                                <span>{sl.label}</span>
                                <span className="font-mono text-amber-700 font-extrabold">
                                  {editingDailyLog.sliderValues?.[sl.id] ?? sl.min} / {sl.max}
                                </span>
                              </label>
                              <input
                                type="range"
                                min={sl.min}
                                max={sl.max}
                                step={sl.step}
                                value={editingDailyLog.sliderValues?.[sl.id] ?? sl.min}
                                onChange={(e) =>
                                  setEditingDailyLog({
                                    ...editingDailyLog,
                                    sliderValues: {
                                      ...editingDailyLog.sliderValues,
                                      [sl.id]: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full accent-amber-600"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Memo */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-xs">メモ・日誌</label>
                        <textarea
                          rows={2}
                          value={editingDailyLog.memo || ''}
                          onChange={(e) =>
                            setEditingDailyLog({ ...editingDailyLog, memo: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-white border rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingDailyLog(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
                        >
                          変更を保存
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* List of daily logs */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">記録日</th>
                          <th className="py-2 px-3 text-center">体調 (5段階)</th>
                          <th className="py-2 px-3 text-center">エナジー</th>
                          <th className="py-2 px-3">数値・スライダースコア</th>
                          <th className="py-2 px-3">メモ</th>
                          <th className="py-2 px-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {custDailyLogs.length > 0 ? (
                          [...custDailyLogs].sort((a, b) => b.date.localeCompare(a.date)).map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                                {log.date}
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                {log.condition === 'great'
                                  ? '😄 絶好調'
                                  : log.condition === 'good'
                                  ? '🙂 良好'
                                  : log.condition === 'okay'
                                  ? '😐 普通'
                                  : log.condition === 'tired'
                                  ? '😫 倦怠感'
                                  : '🤒 微熱'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-pink-600">
                                {log.energyLevel ?? 80}%
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {Object.entries(log.numericValues || {}).map(([k, v]) => (
                                    <span key={k} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                      {k}: {v}
                                    </span>
                                  ))}
                                  {Object.entries(log.sliderValues || {}).map(([k, v]) => (
                                    <span key={k} className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                {log.memo || '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingDailyLog({ ...log })}
                                    className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold text-[11px]"
                                  >
                                    編集
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDailyLog(log.id)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                                    title="削除"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              日々の記録ログがまだありません。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Periodic Evaluations View / Edit Form */}
              {recordsActiveSubTab === 'eval' && (
                <div>
                  {editingEvalRecord ? (
                    /* Edit Form for a Single Eval Record */
                    <form
                      onSubmit={handleSaveEditedEvalRecord}
                      className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
                        <h4 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-indigo-700" />
                          <span>定期測定・評価レコードの修正 ({editingEvalRecord.date})</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingEvalRecord(null)}
                          className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                        >
                          閉じる
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">測定日</label>
                          <input
                            type="date"
                            value={editingEvalRecord.date}
                            onChange={(e) =>
                              setEditingEvalRecord({ ...editingEvalRecord, date: e.target.value })
                            }
                            required
                            className="w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">評価者 / 担当者名</label>
                          <input
                            type="text"
                            value={editingEvalRecord.evaluator}
                            onChange={(e) =>
                              setEditingEvalRecord({ ...editingEvalRecord, evaluator: e.target.value })
                            }
                            required
                            className="w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      {/* Eval metrics dynamic inputs */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        {currentTenant.evalConfig.metrics.map((m) => (
                          <div key={m.id}>
                            <label className="block font-bold text-slate-700 mb-1">
                              {m.label} ({m.unit})
                            </label>
                            <input
                              type={m.type === 'number' ? 'number' : 'text'}
                              value={editingEvalRecord.metricValues?.[m.id] ?? ''}
                              onChange={(e) =>
                                setEditingEvalRecord({
                                  ...editingEvalRecord,
                                  metricValues: {
                                    ...editingEvalRecord.metricValues,
                                    [m.id]: m.type === 'number' ? Number(e.target.value) : e.target.value,
                                  },
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border rounded-xl font-bold font-mono"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Advice & Goal */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            {currentTenant.evalConfig.adviceLabel || 'アドバイス・所見'}
                          </label>
                          <textarea
                            rows={2}
                            value={editingEvalRecord.advice || ''}
                            onChange={(e) =>
                              setEditingEvalRecord({ ...editingEvalRecord, advice: e.target.value })
                            }
                            className="w-full px-3 py-1.5 bg-white border rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            {currentTenant.evalConfig.goalLabel || '次回目標'}
                          </label>
                          <input
                            type="text"
                            value={editingEvalRecord.nextGoal || ''}
                            onChange={(e) =>
                              setEditingEvalRecord({ ...editingEvalRecord, nextGoal: e.target.value })
                            }
                            className="w-full px-3 py-1.5 bg-white border rounded-xl text-xs font-bold text-amber-800"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingEvalRecord(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                        >
                          測定データを保存
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {/* List of eval records */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">測定日</th>
                          <th className="py-2 px-3">評価者</th>
                          <th className="py-2 px-3">測定スコア数値</th>
                          <th className="py-2 px-3">所見・アドバイス</th>
                          <th className="py-2 px-3">次回目標</th>
                          <th className="py-2 px-3 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {custEvalRecords.length > 0 ? (
                          [...custEvalRecords].sort((a, b) => b.date.localeCompare(a.date)).map((ev) => (
                            <tr key={ev.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                                {ev.date}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                                {ev.evaluator}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">
                                <div className="flex flex-wrap gap-1 max-w-xs text-[10px]">
                                  {Object.entries(ev.metricValues || {}).map(([k, v]) => (
                                    <span key={k} className="bg-indigo-50 text-indigo-900 border border-indigo-100 px-1.5 py-0.5 rounded font-bold">
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                {ev.advice || '-'}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-amber-700 max-w-xs truncate">
                                {ev.nextGoal || '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingEvalRecord({ ...ev })}
                                    className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-bold text-[11px]"
                                  >
                                    編集
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEvalRecord(ev.id)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                                    title="削除"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              定期評価レコードがまだありません。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
