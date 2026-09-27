import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  PlusCircle,
  Settings,
  Search,
  CheckCircle2,
  Layers,
  TrendingUp,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Save,
  Check,
  Zap,
  FileText,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Copy,
} from 'lucide-react';
import type { Tenant, Customer, IndustryType, PublicTemplate } from '../types/tenant';
import { COLOR_THEMES } from '../data/tenantPresets';
import { getPublicTemplates, savePublicTemplates } from '../data/publicTemplates';
import { saveAllPublicTemplatesToFirestore } from '../firebase/firestoreService';
import { generateSecureUuid } from '../utils/uuid';

import {
  getGeminiApiKey,
  saveGeminiApiKey,
  getGeminiModel,
  saveGeminiModel,
  testGeminiConnection,
} from '../utils/geminiChat';

interface AdminPlatformViewProps {
  tenants: Tenant[];
  customers: Customer[];
  onSelectTenant: (tenantId: string) => void;
  onOpenProviderPage: (tenantId: string) => void;
  onOpenCustomerPage: (tenantId: string, customerId?: string) => void;
  onCreateTenant: (newTenant: Tenant) => void;
  activeTenantId: string;
  onOpenPrPartnerPage?: () => void;
  onOpenMyLoungeGuidePage?: () => void;
}

export const AdminPlatformView: React.FC<AdminPlatformViewProps> = ({
  tenants,
  customers,
  onSelectTenant,
  onOpenProviderPage,
  onOpenCustomerPage,
  onCreateTenant,
  activeTenantId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Public Templates management
  const [publicTemplates, setPublicTemplates] = useState<PublicTemplate[]>(() => getPublicTemplates());
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const handleToggleTemplateActive = (id: string) => {
    const updated = publicTemplates.map((t) =>
      t.id === id ? { ...t, isActive: !t.isActive, updatedAt: new Date().toISOString().slice(0, 10) } : t
    );
    setPublicTemplates(updated);
    savePublicTemplates(updated);
    saveAllPublicTemplatesToFirestore(updated).catch((e) => console.warn('Template firestore sync:', e));
  };

  const handleMoveSortOrder = (id: string, direction: 'up' | 'down') => {
    const idx = publicTemplates.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= publicTemplates.length) return;
    const updated = [...publicTemplates];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    updated.forEach((t, i) => { t.sortOrder = i + 1; });
    setPublicTemplates(updated);
    savePublicTemplates(updated);
    saveAllPublicTemplatesToFirestore(updated).catch((e) => console.warn('Template firestore sync:', e));
  };

  const handleResetTemplates = () => {
    if (!window.confirm('テンプレートをデフォルトにリセットします。現在の変更は失われます。よろしいですか？')) return;
    localStorage.removeItem('cheer_public_templates_v1');
    const fresh = getPublicTemplates();
    setPublicTemplates(fresh);
    saveAllPublicTemplatesToFirestore(fresh).catch((e) => console.warn('Template firestore sync:', e));
  };

  // URL copy status for public pages
  const [copiedPage, setCopiedPage] = useState<string | null>(null);
  const handleCopyPageUrl = (pageKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?page=${pageKey}`;
    navigator.clipboard.writeText(url);
    setCopiedPage(pageKey);
    setTimeout(() => setCopiedPage(null), 2000);
  };

  // Gemini settings
  const [geminiApiKey, setGeminiApiKey] = useState(getGeminiApiKey());
  const [geminiModel, setGeminiModel] = useState(getGeminiModel());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSaveGeminiSettings = () => {
    saveGeminiApiKey(geminiApiKey);
    saveGeminiModel(geminiModel);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);
    const result = await testGeminiConnection(geminiApiKey, geminiModel);
    setGeminiTestResult(result);
    setIsTestingGemini(false);
  };

  // New tenant form states
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIndustry, setNewIndustry] = useState<IndustryType>('fitness');
  const [newHeaderTitle, setNewHeaderTitle] = useState('');

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.headerTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry =
      selectedIndustry === 'all' ||
      t.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleOpenCreateModal = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setNewId(`tenant-org-${randomSuffix}`);
    setNewName('');
    setNewEmail('');
    setNewIndustry('fitness');
    setNewHeaderTitle('');
    setIsCreateModalOpen(true);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newId.trim()) return;

    // Pick matching default theme
    const theme = COLOR_THEMES.find((th) => th.industry === newIndustry) || COLOR_THEMES[1];

    const createdTenant: Tenant = {
      id: newId.trim().toLowerCase(),
      uuid: generateSecureUuid(),
      adminId: 'admin-master',
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      industry: newIndustry,
      headerTitle: newHeaderTitle.trim() || `${newName} ポータルLog`,
      headerSubtitle: '毎日の習慣化・成果向上を支える専用パートナー手帳',
      badgeText: `${newIndustry.toUpperCase()} PRO ✨`,
      theme,
      aiPersona: {
        name: '専属AIパートナー',
        role: '専属アドバイザー',
        tone: 'friendly',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        avatarType: 'preset',
        speechBubbleText: '✨ 今日も一歩ずつ前進！一緒に頑張りましょう！',
        encouragementQuotes: [
          { id: 'q1', quote: '小さな積み重ねが、大きな成果を作ります！', subtext: 'AIパートナーより', emoji: '🌟' },
          { id: 'q2', quote: '今日もご自身のペースで無理なく続けましょう。', subtext: 'デイリーメッセージ', emoji: '🌱' },
        ],
      },
      dailyConfig: {
        title: '毎日のセルフログ',
        enableCondition: true,
        conditionLabel: '本日のコンディション',
        enableWeather: true,
        checkItems: [
          { id: 'task1', label: '基本ルーティン実施', icon: '✅', defaultChecked: false },
          { id: 'task2', label: '水分・栄養補給', icon: '💧', defaultChecked: false },
          { id: 'task3', label: '振り返り・ストレッチ', icon: '🧘', defaultChecked: false },
        ],
        sliders: [
          { id: 'satisfaction', label: '今日の充実感・達成度', min: 1, max: 5, step: 1, minLabel: '低め', maxLabel: '大満足', defaultValue: 3 },
        ],
        numericFields: [
          { id: 'activityTime', label: '活動時間', unit: '分', placeholder: '30', defaultValue: 30 },
        ],
        energyLabel: 'モチベーション充実度',
        energyIcon: '✨',
        enableEnergy: true,
        memoLabel: 'メモ・日記',
        memoPlaceholder: '今日の気づきや成果をメモしましょう...',
        quickTags: ['順調に完了！', '少し疲れたけれど達成', 'アドバイス通り実践できた'],
      },
      evalConfig: {
        enabled: true,
        title: '定期ステップ評価チェック',
        evaluatorLabel: '担当スタッフ / 専門職',
        metrics: [
          { id: 'evalScore', label: '総合スコア達成度', category: '評価', unit: '点', target: 100, type: 'number' },
        ],
        adviceLabel: 'スタッフからのアドバイス',
        goalLabel: '次回までの目標',
      },
      customerIds: [],
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onCreateTenant(createdTenant);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-2xl border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/cheer_icon.png"
              alt="Cheer Master"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-xl border-2 border-indigo-400/40 shrink-0 bg-white"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Platform Super Admin (Cheer Master: kotsuka@creativesd.net)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                多業界対応 汎用SaaS基盤 管理コンソール
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                推し活・パーソナルジム・教育スクール・サークル・医療など、各提携業者（テナント）の発行とID紐付け、利用状況を統合管理します。
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>新規業者アカウントを発行</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>登録業者数</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {tenants.length} <span className="text-xs text-slate-400 font-normal">社</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>全テナント正常稼働中</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>紐付く総顧客数</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {customers.length} <span className="text-xs text-slate-400 font-normal">名</span>
            </div>
            <div className="text-[11px] text-indigo-300 mt-1">全業者でID完全連携</div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>対応業種プリセット</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              10 <span className="text-xs text-slate-400 font-normal">パターン</span>
            </div>
            <div className="text-[11px] text-purple-300 mt-1">カラー＆AIペルソナ連動</div>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>システムステータス</span>
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-300 mt-1">
              Optimal
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Firestore & Local同期</div>
          </div>
        </div>
      </div>

      {/* Guide Pages Navigation Cards (PR & User Guide - General Public URLs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Pro Partner PR Page */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform shrink-0">
              🏢
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase mb-1">
                <span>Pro Partner 向け</span>
                <span>✨ 一般公開PRページ</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-amber-800 transition-colors">
                事業者向けPR・ソリューション紹介ページ
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                推し活・パーソナルトレーニング・個別指導・仲間サークル・セルフケア向け導入メリットとUIプレビュー
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-500/10 px-2 py-1 rounded-lg w-fit">
                <span>公開URL:</span>
                <span className="font-bold">/?page=pr-partner</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/50">
            <button
              type="button"
              onClick={(e) => handleCopyPageUrl('pr-partner', e)}
              className="text-xs font-bold text-slate-600 hover:text-amber-800 flex items-center gap-1 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              {copiedPage === 'pr-partner' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">コピー完了！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>URLをコピー</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => window.open(`${window.location.origin}/?page=pr-partner`, '_blank')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-white hover:bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-xs transition-all cursor-pointer"
            >
              <span>別ページで開く</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: My Lounge Guide Page */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/5 border border-pink-200/80 hover:border-pink-400 hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform shrink-0">
              💎
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-extrabold uppercase mb-1">
                <span>My Lounge 向け</span>
                <span>🌸 一般公開ガイド</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-pink-800 transition-colors">
                メンバー向け使い方・セルフケア案内ページ
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                30秒の簡単記録、AIパートナーとの触れ合い、安心のプライベート空間の魅力
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-pink-800 bg-pink-500/10 px-2 py-1 rounded-lg w-fit">
                <span>公開URL:</span>
                <span className="font-bold">/?page=guide-lounge</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-200/50">
            <button
              type="button"
              onClick={(e) => handleCopyPageUrl('guide-lounge', e)}
              className="text-xs font-bold text-slate-600 hover:text-pink-800 flex items-center gap-1 bg-white hover:bg-pink-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              {copiedPage === 'guide-lounge' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">コピー完了！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>URLをコピー</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => window.open(`${window.location.origin}/?page=guide-lounge`, '_blank')}
              className="text-xs font-bold text-pink-700 hover:text-pink-800 flex items-center gap-1 bg-white hover:bg-pink-50 px-3.5 py-1.5 rounded-xl border border-pink-200 shadow-xs transition-all cursor-pointer"
            >
              <span>別ページで開く</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gemini AI Platform Configuration */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xl shadow-md">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  Google Gemini AI チャット連携設定 (Cheer Master)
                </h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  geminiApiKey
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {geminiApiKey ? `🟢 連携中 (${geminiModel})` : '🟡 未設定 (シミュレーションモード)'}
                </span>
                {import.meta.env.VITE_GEMINI_API_KEY && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                    Vercel環境変数適用中
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200/70 mt-0.5">
                Vercelの環境変数 <code className="text-pink-300 bg-slate-950 px-1 py-0.5 rounded">VITE_GEMINI_API_KEY</code> または下記フォームから設定可能。モデルは即時切り替えてテストできます。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTestingGemini || !geminiApiKey}
              className="px-3.5 py-2 rounded-xl bg-indigo-800/60 hover:bg-indigo-700/80 disabled:opacity-40 text-xs font-bold text-indigo-100 border border-indigo-600/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTestingGemini ? 'テスト中...' : '接続テスト'}</span>
            </button>

            <button
              onClick={handleSaveGeminiSettings}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-xs font-extrabold text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {saveStatus ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saveStatus ? '保存完了！' : 'モデル・キーを保存'}</span>
            </button>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          {/* API Key Input */}
          <div className="md:col-span-7 space-y-1.5">
            <label className="flex items-center justify-between font-bold text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-pink-400" />
                <span>Gemini API Key (Google AI Studio)</span>
              </span>
              <span className="text-[10px] text-indigo-300/70">
                {import.meta.env.VITE_GEMINI_API_KEY ? '（Vercel環境変数から読込中 / 上書き可）' : '（Vercelまたはここで設定）'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (Vercel環境変数未設定時はここに入力)"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-indigo-700/60 rounded-xl font-mono text-xs text-indigo-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-200 p-1"
                title={showApiKey ? '非表示' : '表示'}
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="flex items-center justify-between font-bold text-indigo-200">
              <span>使用モデル (最新3.8・音声3.8-live対応)</span>
              <span className="text-[10px] text-pink-300 font-normal">即時切替可能</span>
            </label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-indigo-700/60 rounded-xl font-mono text-xs text-indigo-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (最新・超高速思考・推奨)</option>
              <option value="gemini-3.8-pro">gemini-3.8-pro (最新・高度推論)</option>
              <option value="gemini-3.8-live">gemini-3.8-live (音声＆リアルタイム対話)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (安定稼働版)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (軽量高速)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (多言語・高精度)</option>
            </select>
          </div>
        </div>

        {/* Vercel Guide Callout Box */}
        <div className="p-3 bg-slate-950/70 border border-indigo-800/60 rounded-2xl text-[11px] text-indigo-200/80 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span>ℹ️ VercelでのAPIキー設定手順:</span>
          </div>
          <p className="leading-relaxed">
            Vercelダッシュボード → 該当プロジェクト（cheer） → <strong>Settings</strong> → <strong>Environment Variables</strong> にて、<br />
            Name: <code className="bg-slate-900 text-pink-300 px-1.5 py-0.5 rounded font-mono font-bold">VITE_GEMINI_API_KEY</code>、Value: <code className="bg-slate-900 text-pink-300 px-1.5 py-0.5 rounded font-mono font-bold">AIzaSy...</code> を追加して保存＆Redeployすると、全ユーザーで自動有効化されます。
          </p>
        </div>

        {/* Test Result Message */}
        {geminiTestResult && (
          <div className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-between ${
            geminiTestResult.success
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
          }`}>
            <span>{geminiTestResult.message}</span>
            <button
              onClick={() => setGeminiTestResult(null)}
              className="text-[10px] underline hover:opacity-75"
            >
              閉じる
            </button>
          </div>
        )}
      </div>

      {/* ── コンシューマー向け公開テンプレート管理 ─────────────── */}
      <div className="glass-card rounded-3xl p-6 border border-violet-200/60 bg-gradient-to-br from-violet-50/60 to-indigo-50/40 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-violet-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-xl shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                コンシューマー向け 公開テンプレート管理
              </h3>
              <p className="text-xs text-slate-500">
                新規ユーザーが自己登録時に選べるテンプレートを管理します。業者（テナント）とは独立したコレクションです。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-violet-700 font-bold bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-200">
              {publicTemplates.filter((t) => t.isActive).length} / {publicTemplates.length} 件 有効
            </span>
            <button
              onClick={handleResetTemplates}
              className="text-xs text-slate-500 hover:text-rose-600 underline underline-offset-2 px-2 py-1 transition-colors"
            >
              デフォルトに戻す
            </button>
          </div>
        </div>

        {/* Template List */}
        <div className="space-y-2">
          {publicTemplates.map((tmpl, idx) => (
            <div
              key={tmpl.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                tmpl.isActive
                  ? 'border-violet-200 bg-white'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Sort Arrows */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveSortOrder(tmpl.id, 'up')}
                    disabled={idx === 0}
                    className="text-slate-300 hover:text-slate-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="上へ"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveSortOrder(tmpl.id, 'down')}
                    disabled={idx === publicTemplates.length - 1}
                    className="text-slate-300 hover:text-slate-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="下へ"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Emoji + Name */}
                <div className="text-2xl">{tmpl.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-sm">{tmpl.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{tmpl.description}</div>
                </div>

                {/* Category badge */}
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-100 text-violet-700 border border-violet-200 whitespace-nowrap">
                  {tmpl.category}
                </span>

                {/* Active toggle */}
                <button
                  onClick={() => handleToggleTemplateActive(tmpl.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    tmpl.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {tmpl.isActive
                    ? <><ToggleRight className="w-4 h-4 text-emerald-500" /><span>有効</span></>
                    : <><ToggleLeft className="w-4 h-4 text-slate-400" /><span>無効</span></>
                  }
                </button>

                {/* Expand button */}
                <button
                  onClick={() => setExpandedTemplateId(expandedTemplateId === tmpl.id ? null : tmpl.id)}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                  title="詳細を表示"
                >
                  {expandedTemplateId === tmpl.id
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded Detail */}
              {expandedTemplateId === tmpl.id && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60 text-xs space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">ヘッダータイトル</div>
                      <div className="font-bold text-slate-700">{tmpl.headerTitle}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">AIパートナー</div>
                      <div className="font-bold text-slate-700">{tmpl.aiPersona.name}</div>
                      <div className="text-slate-500">{tmpl.aiPersona.role}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">デイリー項目数</div>
                      <div className="font-bold text-slate-700">
                        数値{tmpl.dailyConfig.numericFields.length}・スライダー{tmpl.dailyConfig.sliders.length}・チェック{tmpl.dailyConfig.checkItems.length}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">ID: <code className="font-mono bg-slate-200 px-1 rounded">{tmpl.id}</code> ／ 更新: {tmpl.updatedAt}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 bg-white/70 px-3 py-2 rounded-xl border border-slate-100">
          💡 テンプレートを「無効」にすると、新規ユーザーの選択画面に表示されなくなります。並び順は矢印で変更できます。テンプレートの詳細編集（フィールド追加など）は今後のアップデートで対応予定です。
        </p>
      </div>

      {/* Tenants Table & Management Section */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white/90 shadow-sm space-y-4">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="業者名、業者ID、ヘッダー名で検索..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setSelectedIndustry('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedIndustry === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              すべて ({tenants.length})
            </button>
            <button
              onClick={() => setSelectedIndustry('idol')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedIndustry === 'idol'
                  ? 'bg-pink-600 text-white'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              💎 推し活・アイドル
            </button>
            <button
              onClick={() => setSelectedIndustry('fitness')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedIndustry === 'fitness'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              🏋️ フィットネス
            </button>
            <button
              onClick={() => setSelectedIndustry('education')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedIndustry === 'education'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              ✏️ 教育・先生
            </button>
            <button
              onClick={() => setSelectedIndustry('community')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedIndustry === 'community'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              🤝 仲間・コミュニティ
            </button>
            <button
              onClick={() => setSelectedIndustry('healthcare')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedIndustry === 'healthcare'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              🩺 医療・クリニック
            </button>
            <button
              onClick={() => setSelectedIndustry('beauty')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedIndustry === 'beauty'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              💄 ビューティ・サロン
            </button>
          </div>
        </div>

        {/* Tenants List */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">業者ID (Tenant ID)</th>
                <th className="py-3 px-4">事業者名 / 屋号</th>
                <th className="py-3 px-4">アカウントメール</th>
                <th className="py-3 px-4">業種 / テーマ</th>
                <th className="py-3 px-4">顧客画面ヘッダー名</th>
                <th className="py-3 px-4 text-center">顧客数</th>
                <th className="py-3 px-4 text-center">ステータス</th>
                <th className="py-3 px-4 text-right">階層アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTenants.map((tenant) => {
                const tenantCustomerCount = customers.filter((c) => c.tenantId === tenant.id).length;
                const isCurrent = tenant.id === activeTenantId;

                return (
                  <tr
                    key={tenant.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tenant.theme.primaryColor }} />
                        <span>{tenant.id}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-700 font-sans font-bold">
                            選択中
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="text-sm">{tenant.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        AI: {tenant.aiPersona.name} ({tenant.aiPersona.role})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {tenant.email ? (
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <span className="text-[11px] text-indigo-500">✉️</span>
                          <span>{tenant.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">未設定</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs" style={{
                        backgroundColor: `${tenant.theme.primaryColor}25`,
                        color: '#1E293B',
                        border: `1px solid ${tenant.theme.primaryColor}60`
                      }}>
                        {tenant.theme.name.split('(')[0]}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <div className="font-bold">{tenant.headerTitle}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{tenant.badgeText}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                        {tenantCustomerCount} 名
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>有効</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-stretch sm:items-end gap-1 w-24 sm:w-28 ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTenant(tenant.id);
                            onOpenProviderPage(tenant.id);
                          }}
                          className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold transition-all text-xs cursor-pointer"
                          title="この業者の管理設定画面を開く"
                        >
                          <Settings className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>業者設定</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectTenant(tenant.id);
                            onOpenCustomerPage(tenant.id);
                          }}
                          className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold transition-all text-xs cursor-pointer"
                          title="この業者の顧客画面を開く"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>顧客画面</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tenant Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  🏢
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">新規業者 (テナント) の発行</h3>
                  <p className="text-xs text-slate-500">自社管理下へ新しい事業者アカウントを発行・連携します</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  業者ID (テナントID / 半角英数字)
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  required
                  placeholder="tenant-fitness-01"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  事業者名 / 屋号
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="例: RISE パーソナルトレーニング"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  事業者ログイン用メールアドレス (Pro Partner アカウント)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="例: partner@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">※この業者の管理者がログイン認証するメールアドレス</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  業種カテゴリー
                </label>
                <select
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value as IndustryType)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="idol">💎 推し活・アイドル・ファンコミュニティ</option>
                  <option value="fitness">🏋️ フィットネス・パーソナルトレーニング (ジム・トレーナー)</option>
                  <option value="education">✏️ 教育・個別指導・学習スクール (先生・講師)</option>
                  <option value="community">🤝 仲間・サークル・コミュニティ (習慣化仲間)</option>
                  <option value="healthcare">🩺 医療・クリニック・リハビリ・整体</option>
                  <option value="beauty">💄 ビューティ・エステ・サロン</option>
                  <option value="coaching">👔 ビジネス・メンター・コーチング</option>
                  <option value="wellness">🌿 ヨガ・ウェルネス・メンタルケア</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  顧客画面のヘッダータイトル (初期値)
                </label>
                <input
                  type="text"
                  value={newHeaderTitle}
                  onChange={(e) => setNewHeaderTitle(e.target.value)}
                  placeholder="例: RISE Training Log"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-all"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>業者アカウントを発行して登録</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
