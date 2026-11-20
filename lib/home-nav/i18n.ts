/**
 * 홈 바로가기·전체 메뉴 문구 — 영·일·중·불 (v7, 2026-11-20)
 *
 * 한국어는 items.ts 의 ko 가 원문이다. 여기에는 나머지 4개 언어만 둔다.
 * 용어는 홈 사전(HomeV6 의 I18N)과 맞춘다: 오늘의 기운 = Today's energy / 今日の気 / 今日气运 / Énergie du jour,
 * 오행 = Five Elements / 五行 / 五行 / Cinq Phases, 고민 = worries / 悩み / 烦恼 / soucis, 값은 KRW · ウォン · 韩元.
 * {n} 은 게시 중인 고민 주제 수로 바뀐다.
 * (bdgFree · ohMeta · tagFree · tagNm · sv6n 처럼 홈 사전에 이미 있는 key 는 그쪽 번역을 그대로 쓴다)
 */
type L4 = "en" | "ja" | "zh" | "fr";

const T: Record<string, [en: string, ja: string, zh: string, fr: string]> = {
  /* 바로가기 6칸 */
  qSub:      ["No sign-up — tap and it opens right away.", "登録なしで、タップするとすぐ開きます。", "无需注册，点一下马上打开。", "Sans inscription : touchez, ça s’ouvre."],
  qkToday:   ["Today's energy", "今日の気", "今日气运", "Énergie du jour"],
  qtToday:   ["Daily · free", "毎日 · 無料", "每天 · 免费", "Quotidien · gratuit"],
  qkOhaeng:  ["Five Elements check", "五行性格診断", "五行性格测试", "Mes Cinq Phases"],
  qtOhaeng:  ["1 min · free", "1分 · 無料", "1 分钟 · 免费", "1 min · gratuit"],
  qkWorry:   ["Find my worry", "悩みから探す", "找我的烦恼", "Trouver mon souci"],
  qtWorry:   ["{n} topics · 30 sec", "{n}件 · 30秒", "{n}个 · 30秒", "{n} sujets · 30 s"],
  qkMatch:   ["Friend & couple match", "友だち・恋人の相性", "朋友·恋人配对", "Compatibilité amis · couple"],
  qkLearn:   ["Readings", "読みもの", "读物", "À lire"],
  qtLearn:   ["New every week", "毎週更新", "每周更新", "Chaque semaine"],
  qkPrice:   ["Reports & consult", "レポート・相談", "报告·咨询", "Rapports · conseil"],
  qtPrice:   ["From 9,900 KRW", "9,900ウォン〜", "9,900韩元起", "Dès 9 900 KRW"],
  qlSample:  ["Sample reports ›", "レポート見本 ›", "报告样本 ›", "Exemples de rapport ›"],
  qlGunghap: ["Couple report ›", "相性レポート ›", "合婚报告 ›", "Rapport de compatibilité ›"],
  qlNaming:  ["Naming Set of Three ›", "命名 3点セット ›", "取名三件套 ›", "Prénom · ensemble de trois ›"],
  /* 전체 메뉴 */
  nsTitle:   ["Menu", "メニュー", "全部菜单", "Menu"],
  nsG1:      ["Try for free", "無料で試す", "免费体验", "À essayer gratuitement"],
  nsG2:      ["Reports · consultation", "レポート · 相談", "报告 · 咨询", "Rapports · consultation"],
  nsG3:      ["Me · updates", "マイ · お知らせ", "我的 · 资讯", "Moi · actualités"],
  nsAsk:     ["Free one-question answer", "無料 1問1答", "免费一问一答", "Une question, une réponse"],
  nsTodayN:  ["Daily", "毎日", "每天", "Chaque jour"],
  nsMatchN:  ["Share a link", "リンクを送って一緒に", "发链接一起测", "Par un lien"],
  nsPrice:   ["Personal full report", "個人総合レポート", "个人综合报告", "Rapport personnel complet"],
  nsSample:  ["Sample reports", "レポート見本", "报告样本", "Exemples de rapport"],
  nsSampleN: ["Every page shown", "全ページ公開", "完整公开", "Toutes les pages"],
  nsNaming:  ["Naming Set of Three", "命名 3点セット", "取名三件套", "Prénom · ensemble de trois"],
  nsRev:     ["Client reviews", "お客様の声", "用户评价", "Avis clients"],
  nsRevN:    ["Read the reviews", "レビューを見る", "查看评价", "Lire les avis"],
  nsKakao:   ["Ask on KakaoTalk", "カカオトークで質問", "用 KakaoTalk 提问", "Demander sur KakaoTalk"],
  nsMe:      ["My page", "マイページ", "我的页面", "Mon espace"],
  nsMeN:     ["My element result", "自分の五行結果", "我的五行结果", "Mon résultat"],
  nsCh:      ["Add our KakaoTalk channel", "カカオチャンネル追加", "添加 KakaoTalk 频道", "Ajouter la chaîne KakaoTalk"],
  nsChN:     ["Readings twice a week", "週2回の読みもの", "每周两次读物", "Lectures 2 fois par semaine"],
};

/** 번역문 안의 {n} 자리 — 언어를 바꿀 때 HomeV6 의 applyLang 이 실제 수를 채워 넣는다 */
export const WN_SLOT = "<var class='wn'></var>";

const pick = (i: number): Record<string, string> =>
  Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v[i].replace("{n}", WN_SLOT)]));

/** HomeV6 가 홈 사전(I18N)에 합쳐 쓴다 */
export const NAV_I18N: Record<L4, Record<string, string>> = { en: pick(0), ja: pick(1), zh: pick(2), fr: pick(3) };
