import React, { useEffect } from 'react';
import { X, Printer, FileText, Sparkles, Activity } from 'lucide-react';
import type { Tenant, Customer, GenericDailyLog, GenericEvalRecord } from '../types/tenant';
import type { DailyLog, PTEvalDock } from '../types';

interface PeriodicSummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  customer: Customer;
  dailyLogs: GenericDailyLog[];
  evalRecords: GenericEvalRecord[];
  // Legacy support
  legacyDailyLogs?: DailyLog[];
  legacyPtDocks?: PTEvalDock[];
}

export const PeriodicSummaryReportModal: React.FC<PeriodicSummaryReportModalProps> = ({
  isOpen,
  onClose,
  tenant,
  customer,
  dailyLogs,
  evalRecords,
  legacyDailyLogs = [],
  legacyPtDocks = [],
}) => {

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Effective daily logs: fall back to legacy if generic logs are empty
  const effectiveDailyLogs =
    dailyLogs.length > 0
      ? dailyLogs
      : legacyDailyLogs.map((l) => ({
          id: l.id,
          tenantId: tenant.id,
          customerId: customer.id,
          date: l.date,
          condition: l.condition,
          energyLevel: Math.max(10, 100 - (l.fatigueLevel * 15)),
          sliderValues: { fatigueLevel: l.fatigueLevel, painVas: l.painVas, allodyniaLevel: l.allodyniaLevel },
          numericValues: { pslDoseMg: l.pslDoseMg, bodyTemp: l.bodyTemp, stepCount: l.stepCount },
          checkStates: l.exercises,
          memo: l.memo || '',
          createdAt: l.date,
        }));

  const sortedDaily = [...effectiveDailyLogs].sort((a, b) => b.date.localeCompare(a.date));
  const sortedEvals = [...evalRecords].sort((a, b) => b.date.localeCompare(a.date));
  const latestDaily = sortedDaily[0];
  const latestEval = sortedEvals[0];

  // Dynamic customer medical condition or health focus
  const displayCondition =
    customer.medicalCondition ||
    (tenant.id === 'tenant-carat-hisa' ? '好酸球性多発血管炎性肉芽腫症 (EGPA)' : undefined);

  const isMedicalCase = !!displayCondition;

  // Chronological logs for sparkline graph (last 7 logs)
  const recentLogsChronological = [...sortedDaily].slice(0, 7).reverse();

  // Average energy & average VAS
  const avgEnergy = sortedDaily.length
    ? Math.round(
        sortedDaily.reduce((acc, l) => acc + (l.energyLevel ?? 75), 0) / sortedDaily.length
      )
    : 80;

  const avgVas = sortedDaily.length
    ? (
        sortedDaily.reduce((acc, l) => acc + (Number(l.sliderValues?.painVas) || 0), 0) /
        sortedDaily.length
      ).toFixed(1)
    : '2.5';

  const latestPsl =
    latestDaily?.numericValues?.pslDoseMg ?? (displayCondition?.includes('EGPA') ? 6 : undefined);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in print-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 text-left relative print-modal-card">
        {/* Modal Top Bar (Screen only, hidden on print) - Streamlined & mobile-optimized */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200 flex items-center justify-between z-20 rounded-t-3xl no-print">
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg text-white shadow-xs"
              style={{ backgroundColor: tenant.theme.primaryColor }}
            >
              <FileText className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              帳票プレビュー
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>帳票印刷 / PDF保存</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ----------------- PRINTABLE A4 REPORT SHEET ----------------- */}
        <div
          id="printable-summary-report"
          className="p-3.5 sm:p-7 bg-white text-slate-900 font-sans printable-sheet"
        >
          {/* Top Title & Header */}
          <div className="border-b-2 border-slate-900 pb-2.5 flex justify-between items-end flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: tenant.theme.primaryColor }}
                />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {tenant.badgeText} • {isMedicalCase ? 'HEALTHCARE & PERIODIC PROGRESS REPORT' : 'PERIODIC PROGRESS REPORT'}
                </span>
              </div>
              <h1 className="text-base sm:text-2xl font-black text-slate-900 mt-0.5">
                {tenant.headerTitle} {displayCondition ? `${displayCondition} 定期進捗報告書` : '定期活動・目標進捗報告書'}
              </h1>
            </div>
            <div className="text-right text-[10px] text-slate-600 flex-shrink-0">
              <div>作成日: <span className="font-bold text-slate-900">{new Date().toLocaleDateString('ja-JP')}</span></div>
              <div className="text-[9px] text-slate-500">発行元: {tenant.name}</div>
            </div>
          </div>

          {/* Customer & Goal Metadata Grid */}
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[9px]">顧客名 / 呼称</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {customer.name} 様 {customer.nickname && `(${customer.nickname})`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">主疾患・健康管理区分</span>
              <span className="font-bold text-slate-800 text-[11px]">
                {displayCondition || `${tenant.name} (一般・健康増進)`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">専属担当 / AIパートナー</span>
              <span className="font-bold text-slate-800 text-[11px]">
                {tenant.aiPersona.name} ({tenant.aiPersona.role})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">集計期間 / 最新測定</span>
              <span className="font-bold text-indigo-700 text-[11px]">
                直近 {effectiveDailyLogs.length} 日間 ({latestDaily ? latestDaily.date : '未登録'})
              </span>
            </div>

            <div className="col-span-2 sm:col-span-4 print:col-span-4 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px] flex-wrap gap-1">
              <div>
                <span className="text-[9px] font-bold text-slate-500 mr-1.5">個別設定目標:</span>
                <span className="font-extrabold text-slate-800">
                  {customer.customGoal || `${tenant.headerTitle} での継続的な習慣化と自己実現`}
                </span>
              </div>
              {latestPsl !== undefined && (
                <div className="text-right text-[10px] text-indigo-900 font-bold">
                  現在ステロイド内服: <span className="text-pink-600 font-black">{latestPsl} mg/日</span>
                </div>
              )}
            </div>
          </div>

          {/* 4 Summary KPI Cards */}
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-500 block">総記録日数</span>
              <span className="text-base font-black text-slate-900">{effectiveDailyLogs.length}</span>
              <span className="text-[9px] text-slate-500 ml-0.5">日</span>
            </div>
            <div className="p-2 rounded-xl border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-500 block">平均エナジー / 充実度</span>
              <span className="text-base font-black text-pink-600">{avgEnergy}</span>
              <span className="text-[9px] text-pink-600 font-bold ml-0.5">%</span>
            </div>
            <div className="p-2 rounded-xl border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-500 block">
                {latestDaily?.sliderValues?.painVas !== undefined ? '疼痛VAS平均 (0〜10)' : '平均コンディション'}
              </span>
              <span className="text-base font-black text-amber-600">
                {latestDaily?.sliderValues?.painVas !== undefined ? avgVas : '良好'}
              </span>
              {latestDaily?.sliderValues?.painVas !== undefined && (
                <span className="text-[9px] text-amber-600 font-bold ml-0.5">/ 10</span>
              )}
            </div>
            <div className="p-2 rounded-xl border border-slate-200 bg-white">
              <span className="text-[9px] text-slate-500 block">直近の体調 (5段階評価)</span>
              <span className="text-xs font-black text-emerald-700 block mt-0.5 truncate">
                {latestDaily?.condition === 'great' ? '絶好調 😄 (5/5)' : latestDaily?.condition === 'good' ? '良好 😊 (4/5)' : latestDaily?.condition === 'okay' ? '普通 😐 (3/5)' : latestDaily?.condition === 'tired' ? '倦怠感 💧 (2/5)' : latestDaily?.condition === 'fever' ? '微熱 🔥 (1/5)' : '安定 🌿'}
              </span>
            </div>
          </div>

          {/* ---------------- SECTION 1: VISUAL TREND CHART & NUMERICAL LOG TABLE ---------------- */}
          <div className="mt-2.5 border border-slate-200 rounded-xl p-2.5 bg-white space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. 直近の日次バイタル推移グラフ ＆ 測定履歴数値 (確認・評価用)</span>
              </h3>
              <span className="text-[9px] text-slate-400">直近7件の記録トレンド</span>
            </div>

            {/* Visual SVG Trend Graph */}
            {recentLogsChronological.length > 0 ? (
              <div className="bg-slate-50/70 rounded-lg p-2 border border-slate-200/80">
                <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1 px-1">
                  <span>棒グラフ: 充実度・エナジー(%) | 数値ラベル: {latestDaily?.sliderValues?.painVas !== undefined ? '疼痛・しびれVAS (0〜10: 臨床尺度)' : '活動スコア'}</span>
                  {latestDaily?.sliderValues?.painVas !== undefined && (
                    <span className="font-bold text-pink-600">最新VAS: {latestDaily.sliderValues.painVas} / 10</span>
                  )}
                </div>

                {/* SVG Visual Sparkline Chart (Prints cleanly with 100% vector resolution) */}
                <div className="h-16 w-full flex items-end justify-between gap-2 px-2 pt-2">
                  {recentLogsChronological.map((l, idx) => {
                    const energyH = Math.max(15, Math.min(100, l.energyLevel ?? 70));
                    const vasVal = Number(l.sliderValues?.painVas) || 0;
                    return (
                      <div key={l.id || idx} className="flex-1 flex flex-col items-center justify-end h-full">
                        {/* VAS Value point label */}
                        <span className="text-[8px] font-black text-pink-600 mb-0.5">
                          {vasVal > 0 ? `${vasVal}` : '0'}
                        </span>
                        {/* Energy bar */}
                        <div
                          className="w-full max-w-[28px] rounded-t-sm bg-gradient-to-t from-indigo-200 to-pink-300 border-t-2 border-pink-500 transition-all"
                          style={{ height: `${energyH * 0.42}px` }}
                          title={`日付: ${l.date} / VAS: ${vasVal}/10 / エナジー: ${l.energyLevel}%`}
                        />
                        {/* Date label */}
                        <span className="text-[8px] text-slate-500 mt-1 whitespace-nowrap">
                          {l.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Numerical Logs History Table */}
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="min-w-[480px] sm:min-w-0 w-full text-[9px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-1">記録日</th>
                    <th className="p-1">日次体調 (5段階)</th>
                    <th className="p-1 text-center">疼痛VAS (0-10: 臨床尺度)</th>
                    {isMedicalCase && <th className="p-1 text-center">PSL内服量</th>}
                    {isMedicalCase && <th className="p-1 text-center">朝の体温</th>}
                    <th className="p-1 text-center">自主ケア実施</th>
                    <th className="p-1">日誌・自覚症状メモ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedDaily.slice(0, 5).map((log) => {
                    const activeExCount = Object.values(log.checkStates || {}).filter(Boolean).length;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60">
                        <td className="p-1 font-bold text-indigo-700 whitespace-nowrap">{log.date}</td>
                        <td className="p-1 whitespace-nowrap">
                          {log.condition === 'great' ? '絶好調 😄 (5)' : log.condition === 'good' ? '良好 😊 (4)' : log.condition === 'okay' ? '普通 😐 (3)' : log.condition === 'tired' ? '倦怠感あり 💧 (2)' : log.condition === 'fever' ? '微熱 🔥 (1)' : '安定 🌿'}
                        </td>
                        <td className="p-1 text-center font-extrabold text-pink-600">
                          {log.sliderValues?.painVas !== undefined ? `${log.sliderValues.painVas} / 10` : '--'}
                        </td>
                        {isMedicalCase && (
                          <td className="p-1 text-center font-bold text-indigo-900">
                            {log.numericValues?.pslDoseMg ? `${log.numericValues.pslDoseMg} mg` : '6 mg'}
                          </td>
                        )}
                        {isMedicalCase && (
                          <td className="p-1 text-center text-slate-700">
                            {log.numericValues?.bodyTemp ? `${log.numericValues.bodyTemp}℃` : '36.5℃'}
                          </td>
                        )}
                        <td className="p-1 text-center font-bold text-emerald-700 whitespace-nowrap">
                          {activeExCount > 0 ? `${activeExCount}項目 達成✨` : '実施'}
                        </td>
                        <td className="p-1 text-slate-600 truncate max-w-[200px]">
                          {log.memo || '順調にセルフケア実施'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------- SECTION 2: PERIODIC EVALUATIONS & REHABILITATION STATUS ---------------- */}
          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-2.5">
            {/* Left: Periodic Evaluation Table (CS-30, MMT, Romberg, Calf) */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-white space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>2. {isMedicalCase ? (displayCondition?.includes('EGPA') ? '専門PT機能評価推移 (EGPA神経・筋力・歩行)' : `${displayCondition} 評価推移`) : '定期評価測定推移'}</span>
                </h3>
                <span className="text-[9px] text-slate-400">客観的機能指標</span>
              </div>

              {legacyPtDocks.length > 0 ? (
                /* Legacy PT Dock support for Hisako's EGPA medical data */
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="min-w-[380px] sm:min-w-0 w-full text-[9px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-1">測定日</th>
                        <th className="p-1 text-center">CS-30 (立座)</th>
                        <th className="p-1 text-center">前脛骨筋</th>
                        <th className="p-1 text-center">ロンベルグ</th>
                        <th className="p-1 text-center">下腿周囲径 (左右)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {legacyPtDocks.slice(0, 3).map((d) => (
                        <tr key={d.id}>
                          <td className="p-1 font-bold text-indigo-700 whitespace-nowrap">{d.date}</td>
                          <td className="p-1 text-center font-extrabold text-indigo-600 whitespace-nowrap">{d.functional.cs30Count} 回</td>
                          <td className="p-1 text-center whitespace-nowrap">MMT {d.mmt.tibialisAnterior}</td>
                          <td className="p-1 text-center whitespace-nowrap">{d.functional.rombergTest === 'pass' ? '陰性(Pass)' : '動揺あり'}</td>
                          <td className="p-1 text-center whitespace-nowrap text-slate-700">右{d.calfCircumference.rightCm} / 左{d.calfCircumference.leftCm}cm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[8px] text-slate-500 mt-1">
                    ※CS-30: 30秒立ち座り回数(下肢持久力) / MMT: 腓骨神経麻痺・下垂足評価 / ロンベルグ: 深部感覚バランス
                  </p>
                </div>
              ) : sortedEvals.length > 0 ? (
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="min-w-[380px] sm:min-w-0 w-full text-[9px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-1">測定日</th>
                        <th className="p-1">評価者</th>
                        <th className="p-1">主要測定数値</th>
                        <th className="p-1">次回目標</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedEvals.slice(0, 3).map((ev) => (
                        <tr key={ev.id}>
                          <td className="p-1 font-bold text-indigo-700 whitespace-nowrap">{ev.date}</td>
                          <td className="p-1 whitespace-nowrap text-slate-600">{ev.evaluator}</td>
                          <td className="p-1 text-slate-800">
                            {Object.entries(ev.metricValues || {})
                              .slice(0, 3)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </td>
                          <td className="p-1 text-slate-600 truncate max-w-[100px]">{ev.nextGoal || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-2 text-center text-[9px] text-slate-400 bg-slate-50 rounded-lg">
                  定期評価測定の記録がまだありません
                </div>
              )}
            </div>

            {/* Right: Daily Habit & Checklist Completion */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-white space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>3. {isMedicalCase ? '自宅自主リハビリ・運動習慣の継続率' : 'セルフケア＆チェック項目実施状況'}</span>
                </h3>
                <span className="text-[9px] text-slate-400">継続習慣</span>
              </div>

              <div className="space-y-1">
                {(isMedicalCase
                  ? [
                      { id: 'chairSquats', label: '椅子立ち座りスクワット (下肢筋力・起立機能)', icon: '🪑' },
                      { id: 'towelGather', label: '足指タオルギャザー (足底内在筋・感覚刺激)', icon: '🦶' },
                      { id: 'husbandSoleCare', label: 'ご主人の包み込みケア (足裏アロディニア脱感作)', icon: '🤲' },
                      { id: 'tensTherapy', label: '低周波TENS神経刺激 (疼痛緩和・血流改善)', icon: '⚡' },
                    ]
                  : tenant.dailyConfig.checkItems.slice(0, 4)
                ).map((item) => (
                  <div
                    key={item.id}
                    className="p-1 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[10px]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs">{item.icon || '✓'}</span>
                      <span className="font-bold text-slate-800 truncate">{item.label}</span>
                    </div>
                    <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                      継続実施中 ✨
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- SECTION 3: DOCTOR / EVALUATOR COMMENTS & SIGN-OFF BOX ---------------- */}
          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-2.5">
            {/* Advice box */}
            <div className="md:col-span-8 print:col-span-8 border border-slate-200 rounded-xl p-2.5 bg-white space-y-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>4. 専門職・AIパートナーからの総合所見 ＆ 励ましアドバイス</span>
                </h3>
                <span className="text-[9px] text-slate-400">{tenant.aiPersona.name} / 担当PTより</span>
              </div>
              <p className="text-[10px] text-slate-700 leading-relaxed bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 font-medium">
                {latestEval?.advice ||
                  legacyPtDocks[0]?.kazuhiroAdvice ||
                  `${customer.name}様の日々の記録とセルフケアの積み重ねが着実な機能改善につながっています。${tenant.aiPersona.speechBubbleText} 無理のないペースで、目標に向けて一歩ずつ前進していきましょう！`}
              </p>
            </div>

            {/* Doctor / Attending Sign-off Box */}
            <div className="md:col-span-4 print:col-span-4 border border-slate-200 rounded-xl p-2.5 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-600 block leading-tight">
                  {isMedicalCase ? '主治医・担当医 確認印 / 指示コメント欄' : '担当スタッフ・責任者 確認印 / 記入欄'}
                </span>
                <p className="text-[8px] text-slate-400 leading-tight mt-0.5">
                  定期受診・面談確認用
                </p>
              </div>
              <div className="mt-1 h-10 border border-dashed border-slate-300 rounded-lg bg-slate-50/70 flex items-center justify-center text-[9px] text-slate-400">
                (主治医確認印 / 処方指示署名)
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-1.5 border-t border-slate-200 text-center text-[8px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <img src="/cheer_icon.png" alt="Cheer" className="w-3.5 h-3.5 rounded object-cover" />
              <span>Powered by Cheer Partner SaaS • https://cheer.app</span>
            </span>
            <span>カルテ共有・提出用サマリー ID: REP-{customer.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
