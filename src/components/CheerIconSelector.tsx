import React, { useRef } from 'react';
import { Sparkles, CheckCircle2, Globe, Upload } from 'lucide-react';
import { CHEER_ICON_OPTIONS, getCheerIconById } from '../data/cheerIcons';
import { updateFavicon } from '../utils/favicon';
import { triggerSparkleConfetti } from '../utils/confetti';

interface CheerIconSelectorProps {
  selectedIconUrl: string;
  onSelectIcon: (iconUrl: string, faviconUrl: string) => void;
  title?: string;
  description?: string;
  badgeLabel?: string;
  variant?: 'admin' | 'provider';
  appNamePreview?: string;
}

export const CheerIconSelector: React.FC<CheerIconSelectorProps> = ({
  selectedIconUrl,
  onSelectIcon,
  title = 'Cheer アプリアイコン＆ファビコン切替',
  description = 'アプリや解説ページ、スマホのホーム画面、ブラウザのファビコン（タブアイコン）に適用するアイコンを選択できます。',
  badgeLabel,
  variant = 'admin',
  appNamePreview = 'Cheer',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIcon = getCheerIconById(selectedIconUrl);
  const isCustomUpload =
    selectedIconUrl &&
    !CHEER_ICON_OPTIONS.some(
      (opt) => opt.url === selectedIconUrl || opt.faviconUrl === selectedIconUrl
    );

  const handleSelect = (url: string, favUrl: string) => {
    onSelectIcon(url, favUrl);
    updateFavicon(favUrl);
    triggerSparkleConfetti();
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        onSelectIcon(dataUrl, dataUrl);
        updateFavicon(dataUrl);
        triggerSparkleConfetti();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestFavicon = () => {
    const favUrl = isCustomUpload ? selectedIconUrl : activeIcon.faviconUrl;
    updateFavicon(favUrl);
    triggerSparkleConfetti();
  };

  const isAmber = variant === 'provider';

  return (
    <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span className={isAmber ? 'text-amber-500' : 'text-indigo-600'}>✨</span>
              <span>{title}</span>
            </h3>
            {badgeLabel && (
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  isAmber
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                }`}
              >
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        {/* Live Preview Button */}
        <button
          type="button"
          onClick={handleTestFavicon}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isAmber
              ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
          }`}
          title="現在のブラウザタブのファビコンに即時テスト適用します"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>ブラウザタブに適用テスト</span>
        </button>
      </div>

      {/* Active Icon & Browser Tab Mockup Preview */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-pink-50/30 to-indigo-50/30 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* App Icon preview */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white p-0.5">
              <img
                src={selectedIconUrl || activeIcon.url}
                alt="Active Icon"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] text-white font-bold">
              ✓
            </span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              現在適用中のアイコン
            </div>
            <div className="text-sm font-black text-slate-800">
              {isCustomUpload ? 'カスタムアップロード画像' : activeIcon.name}
            </div>
            <div className="text-xs text-slate-500">
              {isCustomUpload ? 'ローカルファイルより適用' : activeIcon.description}
            </div>
          </div>
        </div>

        {/* Browser Tab Mockup */}
        <div className="flex flex-col items-start sm:items-end w-full md:w-auto">
          <div className="text-[10px] font-bold text-slate-400 mb-1">
            💻 ブラウザタブ（ファビコン）の表示イメージ
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-slate-200/90 text-slate-700 text-xs font-bold shadow-inner border border-b-0 border-slate-300">
            <img
              src={isCustomUpload ? selectedIconUrl : activeIcon.faviconUrl}
              alt="Favicon"
              className="w-4 h-4 rounded-xs object-cover"
            />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {appNamePreview} ✨ 毎日に寄り添う...
            </span>
            <span className="text-[10px] text-slate-400 ml-1">✕</span>
          </div>
        </div>
      </div>

      {/* Grid of Available Icons */}
      <div>
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
          <span>プリセットコレクション (Provided Files: 8バリエーション)</span>
          <span className="text-[10px] text-slate-400">クリックで即時切替</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CHEER_ICON_OPTIONS.map((opt) => {
            const isSelected =
              selectedIconUrl === opt.url ||
              selectedIconUrl === opt.faviconUrl ||
              (!selectedIconUrl && opt.id === 'cheer-original');

            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.url, opt.faviconUrl)}
                className={`cursor-pointer rounded-2xl p-3 border-2 transition-all text-left relative overflow-hidden group ${
                  isSelected
                    ? isAmber
                      ? 'border-amber-500 shadow-md bg-amber-50/30 scale-[1.02]'
                      : 'border-indigo-600 shadow-md bg-indigo-50/30 scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:scale-[1.01]'
                }`}
              >
                {/* Active badge */}
                {isSelected && (
                  <div
                    className={`absolute top-2 right-2 text-white p-0.5 rounded-full shadow-xs ${
                      isAmber ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Thumbnail Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white p-0.5 mb-2 group-hover:scale-105 transition-transform">
                  <img
                    src={opt.url}
                    alt={opt.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Details */}
                <div className="text-center space-y-0.5">
                  <span
                    className={`inline-block text-[9px] font-black uppercase px-2 py-0.2 rounded-full mb-0.5 ${
                      isSelected
                        ? isAmber
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-indigo-200 text-indigo-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.tag}
                  </span>
                  <div className="text-xs font-black text-slate-800 leading-tight truncate">
                    {opt.name.replace('Cheer ', '')}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {opt.recommendedTheme}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom upload option */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>オリジナル画像のアップロードにも対応（JPG / PNG）</span>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCustomUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>オリジナル画像をアップロード</span>
          </button>
        </div>
      </div>
    </div>
  );
};
