import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Bot,
  Palette,
  Sliders,
  Zap,
} from 'lucide-react';
import { getCurrentUser } from '../../utils/authStorage';

interface ProPartnerLandingPageProps {
  onBackToAdmin: () => void;
}

export const ProPartnerLandingPage: React.FC<ProPartnerLandingPageProps> = ({
  onBackToAdmin,
}) => {
  const [selectedMockTheme, setSelectedMockTheme] = useState<'idol' | 'fitness' | 'education'>('idol');
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8FA] via-[#F8FAFC] to-[#F0FDF4] text-slate-800 font-sans pb-24">
      {/* Top sticky nav */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-pink-100 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/cheer_icon.png"
            alt="Cheer"
            className="w-8 h-8 rounded-xl object-cover shadow-sm border border-amber-200"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Cheer Pro Partner
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
              事業者・専門職向けPR
            </span>
          </div>
        </div>

        <button
          onClick={onBackToAdmin}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isAdmin ? 'Master Consoleに戻る' : 'トップに戻る'}</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-10 sm:pt-16 pb-10 text-center space-y-5">
        <div className="flex justify-center mb-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl p-1 bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400 shadow-xl">
            <img
              src="/cheer_icon.png"
              alt="Cheer Logo"
              className="w-full h-full rounded-2xl object-cover bg-white"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
          <span>推し活・フィットネス・教育・仲間・セルフケアのための伴走プラットフォーム</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          あなたの専門知見と温かな世界観を、<br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            たった1日で専用ブランドアプリへ。
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          Cheerは、推し活ファンのエナジーチャージ、パーソナルジムの筋トレ習慣、個別指導スクールの学習記録、仲間同士のウォーキングなど、あらゆる「毎日の前進」を後押しする汎用パートナーSaaSです。専門的な開発コスト不要で、今すぐ自社専用の顧客ページを提供できます。
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>自社ブランド＆10色カラーテーマ</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>AIアバター＆ペルソナ自動生成</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>顧客別ゴール＆動的チャート連携</span>
          </div>
        </div>
      </section>

      {/* SCREENSHOT PREVIEW SECTION 1: Partner Studio & Multi-Tenant Customizer */}
      <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Palette className="w-3.5 h-3.5" />
            <span>画面スクリーンショット プレビュー ①</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            事業者画面 (Pro Partner Studio)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            デザインからAIペルソナ、日々のチェック項目まで、ノーコードで直感的にカスタマイズできます。
          </p>
        </div>

        {/* Studio Screenshot Mockup */}
        <div className="rounded-3xl border border-slate-300/80 bg-white shadow-xl overflow-hidden">
          {/* Mock Browser Header */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-500 font-bold bg-white px-3 py-0.5 rounded-md border border-slate-200 flex items-center gap-1.5">
                <span className="text-emerald-500">🔒</span> https://cheer.app/studio/partner?tenant=tenant-fitness-power
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Partner Studio Live View</span>
          </div>

          {/* Screenshot Content Grid */}
          <div className="p-4 sm:p-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Theme & AI Persona Setup */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  <span>ブランドカラー＆テーマ選択 (全10種)</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="p-2 rounded-xl border-2 border-pink-400 bg-pink-50 flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-400 to-indigo-300 shadow-xs" />
                    <span className="text-[9px] font-bold mt-1 text-slate-700">推し活</span>
                  </div>
                  <div className="p-2 rounded-xl border-2 border-orange-500 bg-orange-50 flex flex-col items-center shadow-xs">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-xs" />
                    <span className="text-[9px] font-extrabold mt-1 text-orange-700">ジム🔥</span>
                  </div>
                  <div className="p-2 rounded-xl border border-slate-200 bg-white flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-sky-400" />
                    <span className="text-[9px] font-medium mt-1 text-slate-600">学習</span>
                  </div>
                  <div className="p-2 rounded-xl border border-slate-200 bg-white flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                    <span className="text-[9px] font-medium mt-1 text-slate-600">仲間</span>
                  </div>
                  <div className="p-2 rounded-xl border border-slate-200 bg-white flex flex-col items-center">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-400" />
                    <span className="text-[9px] font-medium mt-1 text-slate-600">サロン</span>
                  </div>
                </div>
              </div>

              {/* AI Persona Studio Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Bot className="w-4 h-4 text-purple-500" />
                    <span>専属AIパートナー設定</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold">
                    AI生成対応
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="AI Avatar"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-400 shadow-md"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-slate-800">KENJI (チーフトレーナー)</div>
                    <div className="text-[10px] text-slate-500">口調: 熱血・エネルギッシュ</div>
                    <div className="text-[10px] bg-orange-50 text-orange-800 px-2 py-1 rounded-lg border border-orange-200">
                      💬「今日も限界を少し超えていこうぜ！応援してるぞ！」
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Daily Fields & Metrics */}
            <div className="md:col-span-7 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>顧客の日々の記録項目設計 (リアルタイムプレビュー)</span>
                </div>
                <span className="text-[10px] text-slate-400">ドラッグ＆ドロップで並び替え</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">⋮⋮</span>
                    <span className="font-bold text-slate-700">☑️ チェックリスト項目</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    プロテイン摂取 / スクワット30回 / 水分補給2L
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">⋮⋮</span>
                    <span className="font-bold text-slate-700">🎚️ スライダー項目</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    筋肉の張り具合 (0〜10) / 睡眠満足度 (0〜10)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">⋮⋮</span>
                    <span className="font-bold text-slate-700">🔢 数値入力項目</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    体重 (kg) / 摂取カロリー (kcal) / 睡眠時間 (h)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs text-orange-900">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="font-bold">🔥 独自エネルギー指数</span>
                  </div>
                  <span className="text-[11px] font-bold bg-white text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                    闘魂・エナジー指数 (0〜100%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCREENSHOT PREVIEW SECTION 2: 3-Domain Transformation Comparison */}
      <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>画面スクリーンショット プレビュー ②</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            業界ごとにガラリと変わる顧客画面 (My Lounge)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            同じシステムでありながら、テーマとペルソナを切り替えるだけで、顧客にとって親しみ深い専用空間へと姿を変えます。
          </p>
        </div>

        {/* Tab switcher for mockup */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setSelectedMockTheme('idol')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedMockTheme === 'idol'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            💎 推し活・ファン仕様 (MY-CARAT)
          </button>
          <button
            onClick={() => setSelectedMockTheme('fitness')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedMockTheme === 'fitness'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🏋️ フィットネス仕様 (POWER-FIT)
          </button>
          <button
            onClick={() => setSelectedMockTheme('education')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedMockTheme === 'education'
                ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ✏️ 学習スクール仕様 (STEP Academy)
          </button>
        </div>

        {/* Phone Frame Mockup Container */}
        <div className="max-w-md mx-auto rounded-3xl border-4 border-slate-800 bg-white shadow-2xl overflow-hidden">
          {/* Mobile Status Bar */}
          <div className="bg-slate-800 text-white text-[10px] px-6 py-1.5 flex items-center justify-between font-mono">
            <span>9:41</span>
            <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Screen Body depending on tab */}
          {selectedMockTheme === 'idol' && (
            <div className="bg-gradient-to-b from-[#FFF0F5] to-white p-4 space-y-4">
              {/* Header Mock */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-[#F7CAC9] via-[#E8D1E6] to-[#92A8D1] text-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
                    <img
                      src="/hani-avatar.png"
                      alt="Hani"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <div className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/70 text-pink-700 mb-0.5">
                      CARAT 💎 Care
                    </div>
                    <div className="font-black text-sm text-slate-800">MY-CARAT Log</div>
                    <div className="text-[10px] text-slate-600">あおいさんの推し活ダイアリー</div>
                  </div>
                </div>

                <div className="mt-2.5 bg-white/90 backdrop-blur-sm rounded-xl p-2 border border-pink-200 text-[11px] font-bold text-pink-900 shadow-xs">
                  💬「あおいちゃん、今日も無理せず自分のペースでね💎」
                </div>
              </div>

              {/* Daily Checklist Mock */}
              <div className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>💎 今日の推し活チェック</span>
                  <span className="text-[10px] text-pink-500 font-extrabold">2/3 完了 ✨</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-pink-50 text-pink-900 font-bold">
                    <span className="w-4 h-4 rounded bg-pink-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>セブチの曲を聴いて元気チャージ</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-pink-50 text-pink-900 font-bold">
                    <span className="w-4 h-4 rounded bg-pink-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>水分補給をしっかり摂る</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 text-slate-500">
                    <span className="w-4 h-4 rounded border border-slate-300 inline-block" />
                    <span>夜のストレッチ5分間</span>
                  </div>
                </div>
              </div>

              {/* Energy Gauge Mock */}
              <div className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-xs space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-pink-700">💎 推し活エネルギー指数</span>
                  <span className="text-sm font-black text-pink-600">92 %</span>
                </div>
                <div className="h-3 w-full bg-pink-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          )}

          {selectedMockTheme === 'fitness' && (
            <div className="bg-gradient-to-b from-[#FFF6F0] to-white p-4 space-y-4">
              {/* Header Mock */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#FFB03A] text-white shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="KENJI"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/30 text-amber-200 mb-0.5">
                      FITNESS PRO 🔥
                    </div>
                    <div className="font-black text-sm text-white">POWER-FIT Personal</div>
                    <div className="text-[10px] text-orange-100">田中さんの肉体改造ログ</div>
                  </div>
                </div>

                <div className="mt-2.5 bg-white/95 backdrop-blur-sm rounded-xl p-2 border border-orange-200 text-[11px] font-bold text-orange-950 shadow-xs">
                  💬「田中さん！昨日の背中トレ最高でした！今日も水分2Lキープ！」
                </div>
              </div>

              {/* Daily Checklist Mock */}
              <div className="bg-white rounded-2xl p-3.5 border border-orange-150 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>🏋️ 今日のフィットネスタスク</span>
                  <span className="text-[10px] text-orange-600 font-extrabold">3/3 コンプリート 🔥</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-orange-50 text-orange-900 font-bold">
                    <span className="w-4 h-4 rounded bg-orange-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>起床時プロテイン30g摂取</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-orange-50 text-orange-900 font-bold">
                    <span className="w-4 h-4 rounded bg-orange-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>自重スクワット 30回 × 3セット</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-orange-50 text-orange-900 font-bold">
                    <span className="w-4 h-4 rounded bg-orange-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>水分 2.0リットル完了</span>
                  </div>
                </div>
              </div>

              {/* Energy Gauge Mock */}
              <div className="bg-white rounded-2xl p-3.5 border border-orange-150 shadow-xs space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-orange-700">🔥 闘魂・モチベーション指数</span>
                  <span className="text-sm font-black text-orange-600">88 %</span>
                </div>
                <div className="h-3 w-full bg-orange-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          )}

          {selectedMockTheme === 'education' && (
            <div className="bg-gradient-to-b from-[#F0F7FF] to-white p-4 space-y-4">
              {/* Header Mock */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#0284C7] text-white shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm flex-shrink-0 bg-blue-100 flex items-center justify-center text-xl">
                    👩‍🏫
                  </div>
                  <div>
                    <div className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-sky-200 mb-0.5">
                      STUDY ACADEMY ✏️
                    </div>
                    <div className="font-black text-sm text-white">STEP 個別指導アカデミー</div>
                    <div className="text-[10px] text-blue-100">さくらさんの志望校突破手帳</div>
                  </div>
                </div>

                <div className="mt-2.5 bg-white/95 backdrop-blur-sm rounded-xl p-2 border border-blue-200 text-[11px] font-bold text-blue-950 shadow-xs">
                  💬「さくらさん、昨日の英単語テスト満点でしたね！自信を持って！」
                </div>
              </div>

              {/* Daily Checklist Mock */}
              <div className="bg-white rounded-2xl p-3.5 border border-blue-150 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>✏️ 今日の自習チェック</span>
                  <span className="text-[10px] text-blue-600 font-extrabold">2/3 完了</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 text-blue-900 font-bold">
                    <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>ターゲット英単語 20語暗記</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-50 text-blue-900 font-bold">
                    <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>数学大問1・2の解き直し</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 text-slate-500">
                    <span className="w-4 h-4 rounded border border-slate-300 inline-block" />
                    <span>古文助動詞の活用表見直し</span>
                  </div>
                </div>
              </div>

              {/* Energy Gauge Mock */}
              <div className="bg-white rounded-2xl p-3.5 border border-blue-150 shadow-xs space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-blue-700">📚 学習集中度指数</span>
                  <span className="text-sm font-black text-blue-600">95 %</span>
                </div>
                <div className="h-3 w-full bg-blue-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5 Genuine Core Domains Showcase */}
      <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Cheer が選ばれる 5つの専門領域
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            日々の習慣化とモチベーション向上を伴走するすべての事業者にフィットします。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Idol Fan Club */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-pink-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">💎</span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                推し活・ファンコミュニティ
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              ファンサロン・推し活ダイアリー
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              「今日も推しを見て頑張れた！」という尊い気持ちを記録。推しのアバターや励ましボイスで、ファン一人ひとりの毎日に寄り添い、ファンダムの熱量を高めます。
            </p>
            <div className="text-[11px] text-pink-700 font-bold bg-pink-50 p-2.5 rounded-xl border border-pink-100">
              💡 アイドルファンクラブ、VTuberファンサロン、声優・タレント公式アプリ
            </div>
          </div>

          {/* Card 2: Personal Trainer & Fitness */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-orange-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🏋️</span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                フィットネス・パーソナルジム
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              パーソナルトレーニング＆食事習慣化
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              筋トレ回数・体重・プロテイン摂取などの日々の記録と、チーフトレーナーAIによる声かけで挫折を防止。定期測定と連携してリピート率・継続率を劇的に向上。
            </p>
            <div className="text-[11px] text-orange-700 font-bold bg-orange-50 p-2.5 rounded-xl border border-orange-100">
              💡 パーソナルジム、ピラティススタジオ、24時間ジム、オンライントレーナー
            </div>
          </div>

          {/* Card 3: Education & Teachers */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-blue-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">✏️</span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                教育・個別指導・先生
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              学習手帳＆自習伴走コーチ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              家庭での自習時間や単語暗記を可視化。担当の先生AIが毎日の努力を即座に褒めることで、生徒の自己肯定感と学習習慣を定着させます。保護者への進捗共有にも最適。
            </p>
            <div className="text-[11px] text-blue-700 font-bold bg-blue-50 p-2.5 rounded-xl border border-blue-100">
              💡 個別指導塾、家庭教師、英語コーチング、音楽・ピアノ教室
            </div>
          </div>

          {/* Card 4: Community & Friends */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-emerald-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🤝</span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                仲間・コミュニティ・サークル
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              習慣化サークル＆チームチャレンジ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              朝活・ウォーキング・読書など、同じ目標を持つ仲間同士で日々の達成を共有。無理のない30秒チェックインで、お互いをポジティブに応援し合える居場所を提供。
            </p>
            <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              💡 ウォーキングサークル、オンラインサロン、読書会、シニア健康クラブ
            </div>
          </div>

          {/* Card 5: Clinic, Rehab & Wellness */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-teal-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🩺</span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                医療・リハビリ・セルフケア
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              コンディション手帳＆通院フォロー
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              痛みやだるさ、ストレッチ実施状況を顧客自身が毎日記録。次回来院時にグラフを見ながら的確な施術・指導が行え、安心感と信頼関係を深めます。
            </p>
            <div className="text-[11px] text-teal-700 font-bold bg-teal-50 p-2.5 rounded-xl border border-teal-100">
              💡 整体院・接骨院、リハビリクリニック、ヨガ・ウェルネスサロン
            </div>
          </div>

          {/* Card 6: Beauty & Salon */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-purple-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">💄</span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                ビューティ・エステ・サロン
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              美肌・ホームケア伴走サポート
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              施術後のスキンケアや保湿習慣を毎日フォロー。担当エステティシャンからのパーソナルアドバイスで、顧客満足度とお手入れ商品の継続購入を促進します。
            </p>
            <div className="text-[11px] text-purple-700 font-bold bg-purple-50 p-2.5 rounded-xl border border-purple-100">
              💡 エステサロン、美肌スキンケア指導、パーソナルスタイリスト
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps To Launch */}
      <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-extrabold text-center text-slate-900">
          導入はかんたん 3ステップ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 font-black flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">テーマと名称を決定</h4>
            <p className="text-xs text-slate-500">
              10色のカラーと貴社の屋号・ロゴを選ぶだけで、顧客向け画面の骨組みが完成します。
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">AIパートナーを生成</h4>
            <p className="text-xs text-slate-500">
              顔写真やイラスト、口調（熱血・丁寧・親友など）を設定し、専属AIを誕生させます。
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">顧客URLを発行して提供</h4>
            <p className="text-xs text-slate-500">
              顧客ごとの専用IDリンクを共有。スマホのホーム画面に追加するだけで即使えます。
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-3xl mx-auto px-4 pt-6 text-center space-y-4">
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white space-y-4 shadow-lg flex flex-col items-center">
          <img
            src="/cheer_icon.png"
            alt="Cheer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shadow-md"
          />
          <h3 className="text-xl sm:text-2xl font-black">
            あなたの顧客を、毎日もっと元気に。
          </h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto leading-relaxed">
            Cheerは、専門職・事業者の皆さまと大切な顧客をつなぐ伴走プラットフォームです。日々の記録を通じて、信頼と成果を育みましょう。
          </p>
        </div>
      </section>
    </div>
  );
};
