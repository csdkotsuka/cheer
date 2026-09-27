import type { DailyCondition, WeatherCondition } from './index';

// 業界種別
export type IndustryType =
  | 'idol'        // 推し活・アイドル・ファンコミュニティ
  | 'fitness'     // フィットネス・パーソナルトレーニング・ジム
  | 'education'   // 教育・学習塾・個別指導・先生
  | 'community'   // コミュニティ・仲間・サークル
  | 'healthcare'  // 医療・クリニック・リハビリ・整体
  | 'beauty'      // ビューティ・エステ・サロン
  | 'coaching'    // ビジネス・メンター・コーチング
  | 'wellness'    // メンタルヘルス・ヨガ・リラクゼーション
  | 'custom';     // カスタム

// カラーテーマ定義
export interface ColorTheme {
  id: string;
  name: string;
  industry: IndustryType;
  primaryColor: string;     // メインアクセント (HEX)
  secondaryColor: string;   // サブカラー (HEX)
  accentColor: string;      // ハイライト (HEX)
  bgGradient: string;       // 背景グラデーション (Tailwind / CSS)
  headerGradient: string;   // ヘッダー背景
  cardBg: string;           // カード背景
  borderStyle: string;      // 枠線スタイル
  badgeBg: string;          // バッジカラー
}

// AIペルソナ設定
export interface AIPersonaQuote {
  id: string;
  quote: string;
  subtext: string;
  emoji: string;
  category?: string;
}

export interface AIPersonaConfig {
  name: string;               // 例: 'JEONGHAN (ジョンハン)', 'KENJI (チーフトレーナー)'
  role: string;               // 例: '専属アイドル', 'チーフトレーナー', '担任の美咲先生', '親友・サポーター'
  tone: 'friendly' | 'polite' | 'passionate' | 'gentle' | 'cool'; // 口調
  avatarUrl: string;          // アバター画像のURLまたはDataURL
  avatarType: 'upload' | 'preset' | 'ai_generated';
  aiPromptSnippet?: string;   // AI生成時・会話時のプロンプト
  speechBubbleText: string;   // タップ時に喋るひとこと
  encouragementQuotes: AIPersonaQuote[];
  // 本人と会話できるAIチャット設定 (Gemini連携)
  chatGreeting?: string;      // チャット開始時の挨拶
  chatFirstPerson?: string;   // 一人称 (例: 僕, 私, 俺, 先生)
  chatSecondPerson?: string;  // 相手の呼び方 (例: ○○さん, ○○ちゃん, あなた, 君)
  chatPersonality?: string;   // キャラクター詳細設定・性格・背景
}

// 日々の記録項目のカスタマイズ定義
export interface DailyCheckItemDef {
  id: string;
  label: string;
  icon?: string;
  defaultChecked?: boolean;
  category?: string;
}

export interface DailySliderDef {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
  defaultValue: number;
}

export interface DailyNumericDef {
  id: string;
  label: string;
  unit: string;
  placeholder?: string;
  defaultValue?: number;
}

export interface DailyConfig {
  title: string;
  // コンディション5段階選択
  enableCondition: boolean;
  conditionLabel: string;
  // お天気・気圧
  enableWeather: boolean;
  // チェック項目
  checkItems: DailyCheckItemDef[];
  // スライダー項目 (疲労度、痛み、集中度、充実度など)
  sliders: DailySliderDef[];
  // 数値項目 (体温、歩数、体重、勉強時間など)
  numericFields: DailyNumericDef[];
  // 特有のモチベーション/エネルギー指数 (例: 推し活エネルギー、モチベーション指数、闘魂度など)
  energyLabel: string;
  energyIcon: string;
  enableEnergy: boolean;
  // メモ欄
  memoLabel: string;
  memoPlaceholder: string;
  quickTags: string[];
}

// 定期評価項目のカスタマイズ定義（特定の測定方法は省き、汎用化）
export interface EvalMetricDef {
  id: string;
  label: string;
  category: string;
  unit: string;
  target?: number;
  type: 'score5' | 'number' | 'text';
  description?: string;
}

export interface PeriodicEvalConfig {
  enabled: boolean;
  title: string;              // 例: '定期コンディショニング測定', '月次フィットネスチェック', '学習到達度チェック'
  evaluatorLabel: string;     // 例: '担当トレーナー / 測定者', '担当講師 / 担任', '専任スタッフ'
  metrics: EvalMetricDef[];   // 測定項目リスト
  adviceLabel: string;        // 例: 'トレーナーからのアドバイス', '先生からの講評', '専門スタッフの所見'
  goalLabel: string;          // 例: '次回までの目標', '来月のターゲット'
}

// 推し活ラウンジ・おすすめリンク項目
export interface LoungeLinkItem {
  id: string;
  title: string;
  desc: string;
  url: string;
  badge?: string;
  color?: string;
}

// 業者（Tenant / Provider）エンティティ
export interface Tenant {
  id: string;                 // 業者ID (例: 'tenant-carat', 'tenant-fitness')
  adminId: string;            // 管理者ID ('admin-master')
  name: string;               // 業者名・屋号
  email?: string;             // ログイン・事業者アカウントメールアドレス (例: 'kotsuka@creativesd.net')
  industry: IndustryType;
  // 顧客ページ（ヘッダー・ブランディング）
  headerTitle: string;        // 顧客ページの見出し (例: 'HISA-CARAT Log', 'POWER-FIT Gym', 'STEP 学習手帳')
  headerSubtitle: string;     // 顧客ページのサブ見出し
  badgeText: string;          // ヘッダー上のバッジ (例: 'CARAT 💎 Care', 'FITNESS PRO 🔥', 'STUDY ACADEMY ✏️')
  appIconUrl?: string;        // アプリアイコン・ブランドアイコンURL
  faviconUrl?: string;        // ファビコンURL (未指定時はappIconUrlを使用)
  theme: ColorTheme;
  aiPersona: AIPersonaConfig;
  dailyConfig: DailyConfig;
  evalConfig: PeriodicEvalConfig;
  loungeLinks?: LoungeLinkItem[]; // 推し活ラウンジ・外部コンテンツリンク一覧
  customerIds: string[];      // 紐づく顧客IDリスト
  uuid?: string;              // 推測防止用の公開UUID (URLパラメータ制御用)
  isConsumerPersonal?: boolean; // 一般コンシューマー自己登録による個人スペースか
  templateId?: string;        // 選択された公開テンプレートID
  status: 'active' | 'trial' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// 顧客（Customer）エンティティ
export interface Customer {
  id: string;                 // 顧客ID (例: 'cust-hisa-01', 'cust-tanaka-02')
  tenantId: string;           // 所属する業者ID
  uuid?: string;              // 推測防止用の公開UUID (URLパラメータ制御用)
  name: string;               // 顧客氏名
  email?: string;             // ログイン・メンバーアカウントメールアドレス (例: 'hisako@user.cheer.app')
  nickname?: string;          // 呼称 (例: 'ひさこさん', '田中さん')
  joinedDate: string;
  customGoal?: string;        // 顧客の個別目標
  medicalCondition?: string;  // 主疾患・健康管理区分・注力テーマ (例: '好酸球性多発血管炎性肉芽腫症 (EGPA)', '腰痛改善', '体脂肪燃焼')
  isConsumer?: boolean;       // 一般コンシューマーユーザーか
  templateId?: string;        // 利用中の公開テンプレートID
  status: 'active' | 'inactive';
}

// 汎用日々の記録データ
export interface GenericDailyLog {
  id: string;
  customerId: string;
  tenantId: string;
  date: string;
  condition?: DailyCondition;
  weather?: WeatherCondition;
  checkStates: Record<string, boolean>;     // checkItem.id -> boolean
  sliderValues: Record<string, number>;     // slider.id -> number
  numericValues: Record<string, number>;    // numeric.id -> number
  energyLevel?: number;                     // 0 - 100
  memo: string;
  createdAt: string;
}

// 汎用定期評価データ
export interface GenericEvalRecord {
  id: string;
  customerId: string;
  tenantId: string;
  date: string;
  evaluator: string;
  metricValues: Record<string, any>;        // metric.id -> value
  advice: string;
  nextGoal: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// コンシューマー向け公開テンプレート（Tenant/業者とは別コレクション）
// Masterが管理し、新規コンシューマーが選択して利用する
// ─────────────────────────────────────────────
export interface PublicTemplate {
  id: string;                 // 例: 'tmpl-health-basic', 'tmpl-fitness', 'tmpl-oshi'
  name: string;               // 表示名 (例: '基本 健康管理ログ')
  description: string;        // テンプレート説明（選択画面で表示）
  emoji: string;              // アイコン絵文字 (例: '🏥', '💪', '💎')
  category: IndustryType;     // 業種カテゴリー
  headerTitle: string;        // 顧客ページのヘッダータイトル
  headerSubtitle: string;
  badgeText: string;
  theme: ColorTheme;
  aiPersona: AIPersonaConfig;
  dailyConfig: DailyConfig;
  evalConfig: PeriodicEvalConfig;
  loungeLinks?: LoungeLinkItem[];
  isPublic: true;             // 常に true (型判別用)
  isActive: boolean;          // Masterが有効/無効を切り替えられる
  sortOrder: number;          // 表示順
  createdAt: string;
  updatedAt: string;
}
