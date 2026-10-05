import {
  Heart,
  CheckCircle2,
  Smile,
  Zap,
  Smartphone,
  Sparkles,
  ArrowLeft,
  LogIn,
} from 'lucide-react';

interface MyLoungeGuidePageProps {
  onBackToApp?: () => void;
  onOpenLogin?: () => void;
  appIconUrl?: string;
}

export const MyLoungeGuidePage: React.FC<MyLoungeGuidePageProps> = ({
  onBackToApp,
  onOpenLogin,
  appIconUrl,
}) => {
  const iconSrc = appIconUrl || '/cheer_icon.png';
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-[#FFF9FA] to-[#F2F6FC] text-slate-800 font-sans pb-24">
      {/* Top sticky nav */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-pink-100 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src={iconSrc}
            alt="Cheer"
            className="w-8 h-8 rounded-xl object-cover shadow-sm border border-pink-200"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
              My Lounge
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-200">
              メンバー向け使い方ガイド
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ログイン / 新規登録</span>
            </button>
          )}

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>アプリに戻る</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-10 sm:pt-16 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-pink-600 text-xs font-bold shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          <span>自分らしさを大切にする、毎日の優しい居場所</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          毎日の小さな記録が、<br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            私をちょっと好きになる。
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
          My Loungeは、誰かと比べるためではなく、あなた自身が心地よく前に進むためのプライベート空間です。推し活のときめきも、日々のリハビリやトレーニングの頑張りも、そっと優しく受け止めます。
        </p>
      </section>

      {/* SCREENSHOT SECTION: Actual Mobile UI Mockup */}
      <section className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>実際のマイラウンジ画面プレビュー</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
            シンプルで心地いい、あなたのための手帳画面
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            毎日続けたくなる工夫が、この画面にぎゅっと詰まっています。
          </p>
        </div>

        {/* Mobile Phone Mockup Frame */}
        <div className="max-w-md mx-auto rounded-3xl border-4 border-slate-800 bg-white shadow-2xl overflow-hidden">
          {/* Mobile Top Bar */}
          <div className="bg-slate-800 text-white text-[10px] px-6 py-1.5 flex items-center justify-between font-mono">
            <span>9:41</span>
            <div className="w-16 h-3.5 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Screenshot Body */}
          <div className="bg-gradient-to-b from-[#FFF5F8] via-[#FAF8FF] to-white p-4 space-y-3.5">
            {/* 1. Header with Avatar & Speech Bubble */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-[#F7CAC9] via-[#E8D1E6] to-[#92A8D1] text-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-full border-2 border-white overflow-hidden shadow-md flex-shrink-0 relative group">
                  <img
                    src="/hani-avatar.png"
                    alt="AI Partner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/80 text-pink-700 mb-0.5">
                    CARAT 💎 Care
                  </div>
                  <div className="font-black text-sm text-slate-800">MY-CARAT Log</div>
                  <div className="text-[10px] text-slate-600">あおいさんの推し活ダイアリー</div>
                </div>
              </div>

              {/* Speech bubble */}
              <div className="mt-3 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 border border-pink-200 text-xs font-bold text-pink-900 shadow-xs flex items-center gap-2">
                <span className="text-base">💬</span>
                <span className="leading-snug">「あおいちゃん、今日も無理せず自分のペースでね💎 いつも応援してるよ！」</span>
              </div>
            </div>

            {/* 2. Mood & Weather Selector */}
            <div className="bg-white rounded-2xl p-3 border border-pink-100 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-pink-500" />
                  <span>今日の気分</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium">
                  ☀️ 晴れ・気圧 安定
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="p-2 rounded-xl bg-pink-500 text-white font-black text-xs shadow-xs ring-2 ring-pink-300">
                  <div className="text-base">😄</div>
                  <div className="text-[9px] mt-0.5 font-bold">最高</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 text-xs">
                  <div className="text-base">🙂</div>
                  <div className="text-[9px] mt-0.5">良好</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 text-xs">
                  <div className="text-base">😐</div>
                  <div className="text-[9px] mt-0.5">普通</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 text-xs">
                  <div className="text-base">🥱</div>
                  <div className="text-[9px] mt-0.5">お疲れ</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 text-xs">
                  <div className="text-base">😣</div>
                  <div className="text-[9px] mt-0.5">つらい</div>
                </div>
              </div>
            </div>

            {/* 3. 30-Second Checklist with Confetti preview */}
            <div className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>今日のセルフケア</span>
                </span>
                <span className="text-[10px] text-pink-600 font-extrabold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                  ✨ 3/3 完了！花吹雪発生中 🎉
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/70 border border-pink-200 text-pink-950 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-pink-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>セブチの曲を聴いて元気チャージ</span>
                  </div>
                  <span className="text-[10px] text-pink-600">完了</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/70 border border-pink-200 text-pink-950 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-pink-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>水分を1.5L以上しっかり補給</span>
                  </div>
                  <span className="text-[10px] text-pink-600">完了</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/70 border border-pink-200 text-pink-950 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-pink-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>寝る前のストレッチ5分間</span>
                  </div>
                  <span className="text-[10px] text-pink-600">完了</span>
                </div>
              </div>
            </div>

            {/* 4. Energy Gauge */}
            <div className="bg-white rounded-2xl p-3 border border-pink-100 shadow-xs space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-pink-800">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>💎 推し活エネルギー指数</span>
                </span>
                <span className="text-sm font-black text-pink-600">92 %</span>
              </div>
              <div className="h-3 w-full bg-pink-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            {/* 5. Streak & Trophy Badge */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-3 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center text-lg shadow-xs">
                  🏆
                </div>
                <div>
                  <div className="text-xs font-extrabold text-amber-950">7日間連続チェックイン達成！</div>
                  <div className="text-[10px] text-amber-700">「マイペース継続マスター」バッジ獲得</div>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-200">
                Lv. 3
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Points that Make My Lounge Feel Special */}
      <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-center text-slate-800">
          My Lounge を楽しむ 4つのステップ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                1日30秒。気分をポンと押すだけ
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              朝起きたときや夜寝る前、今日の気分アイコンをタップ。チェックリストもワンタップでチェックできます。完璧に書かなくても、1つ記録するだけで花吹雪でお祝いします✨
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-purple-100 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                パートナーをタップして元気チャージ
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ヘッダーのアバターをタップすると、あなただけに向けた励ましメッセージを喋ってくれます。日替わりの温かい言葉が、疲れた日の心をふっと軽やかにしてくれます。
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                グラフとカレンダーで「できた」を実感
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              記録を重ねるたびに、グラフやカレンダーに彩りが加わります。調子が良い日も、少し休んだ日も、すべてが大切なあなたの軌跡。振り返るたびに自己肯定感が高まります。
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm">
                04
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                誰にも邪魔されない、完全なプライベート空間
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              他の人の視線やSNSの比較は一切ありません。あなたのデータは大切に守られ、あなたと担当パートナーだけがつながる安心で穏やかな場所です。
            </p>
          </div>
        </div>
      </section>

      {/* Secret Mystery Reward Teaser */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl overflow-hidden border border-purple-500/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-black uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>秘密のサプライズ特典</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                「……ちゃんと続けたら、いいことあるよ？💎」
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                最初はちょっぴり懐かしいレトロな【ぽこぽこドット絵】からスタート。<br />
                でも、毎日のセルフケアや記録をコツコツ続けていくと……？<br />
                「あれ？左上のアバターの様子がいつもと違う……！？」<br />
                3日連続、7日連続、そしてその先へ。努力を重ねたあなただけに解禁される特別な進化姿や、パートナーからの限定シークレットメッセージが待っています。<br />
                どんな姿に育つかは、毎日のあなたとパートナーだけの秘密のお楽しみです……👼✨
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex-shrink-0">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-pink-400/50 flex items-center justify-center text-2xl shadow-inner mx-auto mb-1">
                  👾
                </div>
                <span className="text-[10px] text-pink-300 font-bold">Lv.1 ドット絵</span>
              </div>
              <span className="text-slate-400 font-mono text-lg">➔</span>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-purple-400/50 flex items-center justify-center text-2xl shadow-inner mx-auto mb-1">
                  🎨
                </div>
                <span className="text-[10px] text-purple-300 font-bold">Lv.2 水彩画</span>
              </div>
              <span className="text-slate-400 font-mono text-lg">➔</span>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 p-0.5 shadow-md mx-auto mb-1">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-2xl">
                    📸
                  </div>
                </div>
                <span className="text-[10px] text-amber-300 font-extrabold">Lv.3 完全体</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed PWA Home Screen Guide */}
      <section className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>アプリ化でもっと快適に（PWA対応）</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            スマホのホーム画面に追加して、本物のアプリのように使う方法
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            ブラウザのアドレスバーが消えて全画面表示に！毎朝・毎晩ワンタップで瞬時に起動できます。
          </p>

          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-pink-200 shadow-sm">
              <img
                src={iconSrc}
                alt="Cheer"
                className="w-10 h-10 rounded-xl object-cover shadow-xs border border-pink-100"
              />
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 block">Cheer</span>
                <span className="text-[10px] text-pink-600 font-bold block">ホーム画面に配置されるアプリアイコン</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* iPhone / Safari Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="text-2xl">🍎</span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">iPhone / iPad (Safari)</h3>
                <p className="text-[11px] text-slate-500">標準ブラウザ Safari で開いている場合</p>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  画面下部（iPadは右上）の <strong className="text-slate-800">「共有ボタン」</strong> (四角から矢印が飛び出しているアイコン ⎋) をタップします。
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  表示されたメニューを少し下にスクロールして、<strong className="text-slate-800">「ホーム画面に追加」</strong> (➕アイコン) をタップします。
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  右上の <strong className="text-pink-600">「追加」</strong> を押すと完了！ホーム画面に専用アイコンが配置され、アプリとして全画面で開けます。
                </div>
              </li>
            </ol>
          </div>

          {/* Android / Chrome Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Android (Chrome)</h3>
                <p className="text-[11px] text-slate-500">Google Chrome で開いている場合</p>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  画面右上の <strong className="text-slate-800">「︙」</strong> (縦の三点リーダーメニュー) をタップします。
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  メニュー内の <strong className="text-slate-800">「ホーム画面に追加」</strong> または <strong className="text-slate-800">「アプリをインストール」</strong> をタップします。
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  確認ダイアログで <strong className="text-indigo-600">「インストール」</strong> または「追加」を押すと、ホーム画面にアプリが追加されます。
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Benefits banner */}
        <div className="p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-2xl border border-pink-200/80 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-around gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>アドレスバーなしの全画面体験</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>ワンタップで瞬時に起動</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>オフライン・電波微弱時も安心</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-3xl mx-auto px-4 pt-6 text-center space-y-4">
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white space-y-5 shadow-lg flex flex-col items-center">
          <img
            src={iconSrc}
            alt="Cheer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shadow-md"
          />
          <h3 className="text-xl sm:text-2xl font-black">
            今日から、あなたの「できた」を重ねよう。
          </h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto leading-relaxed">
            登録はメールアドレスとお名前を入れるだけ（無料・30秒）。お好みのログスタイルを選んで、あなただけの温かなマイラウンジをはじめませんか？
          </p>

          {onOpenLogin && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <LogIn className="w-4 h-4 text-pink-600" />
                <span>ログイン / 新規登録画面を開く ✨</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
