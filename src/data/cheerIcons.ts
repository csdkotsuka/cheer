export interface CheerIconOption {
  id: string;
  name: string;
  description: string;
  url: string;
  faviconUrl: string;
  tag: string;
  recommendedTheme?: string;
}

export const CHEER_ICON_OPTIONS: CheerIconOption[] = [
  {
    id: 'cheer-original',
    name: 'Cheer Classic (標準)',
    description: '親しみやすい王道ピンク＆パープルグラデーション',
    url: '/cheer_icons/cheer_original.png',
    faviconUrl: '/cheer_icons/cheer_original_favicon.png',
    tag: 'Classic',
    recommendedTheme: '推し活・全般',
  },
  {
    id: 'cheer-v2',
    name: 'Cheer Crystal (高精細)',
    description: '繊細な輝きと立体感を極めたクリスタルデザイン',
    url: '/cheer_icons/cheer_v2.png',
    faviconUrl: '/cheer_icons/cheer_v2_favicon.png',
    tag: 'Crystal',
    recommendedTheme: 'プレミアム・推し活',
  },
  {
    id: 'cheer-variant-1',
    name: 'Cheer Aurora (オーロラ)',
    description: '幻想的なグラデーションと洗練された光彩',
    url: '/cheer_icons/cheer_variant_1.png',
    faviconUrl: '/cheer_icons/cheer_variant_1_favicon.png',
    tag: 'Aurora',
    recommendedTheme: 'ビューティ・ウェルネス',
  },
  {
    id: 'cheer-variant-2',
    name: 'Cheer Vibrant (ビビッド)',
    description: '力強いエナジーと明るさを届ける鮮やかスタイル',
    url: '/cheer_icons/cheer_variant_2.png',
    faviconUrl: '/cheer_icons/cheer_variant_2_favicon.png',
    tag: 'Vibrant',
    recommendedTheme: 'フィットネス・スポーツ',
  },
  {
    id: 'cheer-variant-3',
    name: 'Cheer Cosmic (コズミック)',
    description: '神秘的な星空と煌めきのディープグラデーション',
    url: '/cheer_icons/cheer_variant_3.png',
    faviconUrl: '/cheer_icons/cheer_variant_3_favicon.png',
    tag: 'Cosmic',
    recommendedTheme: '教育・スタディ・夜活',
  },
  {
    id: 'cheer-variant-4',
    name: 'Cheer Elegance (エレガンス)',
    description: 'やわらかく上品なジュエル＆パステルトーン',
    url: '/cheer_icons/cheer_variant_4.png',
    faviconUrl: '/cheer_icons/cheer_variant_4_favicon.png',
    tag: 'Elegance',
    recommendedTheme: 'サロン・リラクゼーション',
  },
  {
    id: 'cheer-variant-5',
    name: 'Cheer Dynamic (ダイナミック)',
    description: '前向きな日々のモチベーションを奮い立たせるデザイン',
    url: '/cheer_icons/cheer_variant_5.png',
    faviconUrl: '/cheer_icons/cheer_variant_5_favicon.png',
    tag: 'Dynamic',
    recommendedTheme: 'コーチング・ビジネス',
  },
  {
    id: 'cheer-variant-6',
    name: 'Cheer Harmony (ハーモニー)',
    description: '心身に優しく寄り添う調和と安心感のカラー',
    url: '/cheer_icons/cheer_variant_6.png',
    faviconUrl: '/cheer_icons/cheer_variant_6_favicon.png',
    tag: 'Harmony',
    recommendedTheme: '医療・リハビリ・コミュニティ',
  },
];

export const DEFAULT_CHEER_ICON = CHEER_ICON_OPTIONS[0].url;
export const DEFAULT_CHEER_FAVICON = CHEER_ICON_OPTIONS[0].faviconUrl;

export function getCheerIconById(id?: string): CheerIconOption {
  if (!id) return CHEER_ICON_OPTIONS[0];
  const found = CHEER_ICON_OPTIONS.find((item) => item.id === id || item.url === id);
  return found || CHEER_ICON_OPTIONS[0];
}
