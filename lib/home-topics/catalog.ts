import type { HomeTopic } from "./types";

/**
 * 홈 고민 주제 24개 — 기본 목록 (v3, 2026-11-05)
 *
 * 역할 두 가지
 *   1) DB(home_topics)가 없거나 비어 있을 때 홈이 그대로 쓰는 예비 목록
 *   2) supabase/migrations/20261105_home_topics_v3.sql 의 씨앗 — `npx tsx scripts/home-topics-sql.ts` 로 다시 만든다
 * 운영 중 수정은 관리자 /admin/topics 에서 한다(여기를 고쳐도 이미 들어간 DB 행은 바뀌지 않는다).
 *
 * 선정 기준(2026-11-04~05 벤치마킹): 사주·타로 상담 시장에서 가장 많이 찾는 키워드 2~4자.
 *   연애 5 · 결혼 3 · 일 7 · 돈 4 · 삶 5 = 24 (24절기)
 *   "할까 말까"(이직·창업·투자·재회) 뿐 아니라 "이미 벌어진 갈등"(이혼·직장갈등·가족갈등·부모부양)을 넣었다 — 상담 신청 비중이 큰 축.
 * 제목은 18자 안팎 한 줄. v3.0(2026-11-05) 8개 랜딩을 더해 24개 모두 /q 랜딩(q)으로 연결 — ask_prefill 은 관리자에서 「1문 1답 바로」로 바꿀 때를 위해 남겨 둔다.
 */
export const TOPIC_CATALOG: HomeTopic[] = [
  /* ── 연애 ── */
  { sort: 1, grp: "연애", category: "연애", title: "왜 나는 사랑에 상처 받을까?", slug: "love-pattern", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    i18n: { en: { category: "Love", title: "Why do I keep getting hurt in love?" }, ja: { category: "恋愛", title: "なぜ私はいつも恋で傷つくの？" }, zh: { category: "恋爱", title: "为什么我总在爱情里受伤？" }, fr: { category: "Amour", title: "Pourquoi je souffre en amour ?" } } },
  { sort: 2, grp: "연애", category: "썸", title: "이게 썸일까, 나만의 착각일까?", slug: "crush", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    ask_prefill: "요즘 자주 연락하는 사람이 있어요. 썸인지, 저 혼자 착각인지 모르겠어요.",
    i18n: { en: { category: "Crush", title: "Is this a thing, or just me?" }, ja: { category: "片思い", title: "これは脈あり？私の勘違い？" }, zh: { category: "暧昧", title: "这是暧昧，还是我的错觉？" }, fr: { category: "Flirt", title: "Un début d’histoire… ou moi seule ?" } } },
  { sort: 3, grp: "연애", category: "속마음", title: "연락이 뜸한 그 사람, 속마음은?", slug: "contact", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    i18n: { en: { category: "Feelings", title: "Fewer texts — what’s on their mind?" }, ja: { category: "本音", title: "連絡が減ったあの人の本音は？" }, zh: { category: "心思", title: "联系变少的那个人，在想什么？" }, fr: { category: "Pensées", title: "Moins de messages : que pense-t-il ?" } } },
  { sort: 4, grp: "연애", category: "이별", title: "헤어지는 게 맞을까, 더 버틸까?", slug: "breakup", link_type: "q", weight: 1, time_slot: "any", tone: "heavy",
    ask_prefill: "헤어져야 할지, 조금 더 노력해 봐야 할지 고민이에요.",
    i18n: { en: { category: "Breakup", title: "Should I leave, or hold on?" }, ja: { category: "別れ", title: "別れるべき？もう少し耐える？" }, zh: { category: "分手", title: "该分手，还是再撑一下？" }, fr: { category: "Rupture", title: "Partir, ou tenir encore ?" } } },
  { sort: 5, grp: "연애", category: "재회", title: "헤어진 그 사람, 먼저 연락할까?", slug: "reunion", link_type: "q", weight: 2, time_slot: "night", tone: "light",
    i18n: { en: { category: "Reunion", title: "My ex — should I reach out first?" }, ja: { category: "復縁", title: "別れた人に、先に連絡する？" }, zh: { category: "复合", title: "分手的那个人，我先联系吗？" }, fr: { category: "Retour", title: "Mon ex : faire le premier pas ?" } } },

  /* ── 결혼 ── */
  { sort: 6, grp: "결혼", category: "궁합", title: "결혼해도 될까? 사랑 말고 볼 3가지", slug: "marriage", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    i18n: { en: { category: "Match", title: "Marry? 3 things beyond love" }, ja: { category: "相性", title: "結婚していい？愛以外に見る3つ" }, zh: { category: "合婚", title: "该结婚吗？爱情之外要看的3件事" }, fr: { category: "Couple", title: "Se marier ? 3 points à vérifier" } } },
  { sort: 7, grp: "결혼", category: "결혼시기", title: "몇 년을 만났는데, 결혼은 언제쯤?", slug: "marriage-talk", link_type: "q", weight: 1, time_slot: "night", tone: "light",
    i18n: { en: { category: "Timing", title: "Years together — when do we marry?" }, ja: { category: "結婚時期", title: "何年も付き合って、結婚はいつ？" }, zh: { category: "婚期", title: "交往多年，什么时候结婚？" }, fr: { category: "Mariage", title: "Des années ensemble : se marier quand ?" } } },
  { sort: 8, grp: "결혼", category: "이혼", title: "이혼이 답일까, 시간을 더 둘까?", slug: "divorce", link_type: "q", weight: 1, time_slot: "any", tone: "heavy",
    ask_prefill: "이혼을 생각하고 있어요. 지금 결정하는 게 맞을지, 별거로 시간을 둬야 할지 모르겠어요.",
    i18n: { en: { category: "Divorce", title: "Divorce — or give it more time?" }, ja: { category: "離婚", title: "離婚が答え？もう少し時間を置く？" }, zh: { category: "离婚", title: "离婚是答案，还是再给些时间？" }, fr: { category: "Divorce", title: "Divorcer, ou laisser du temps ?" } } },

  /* ── 일 ── */
  { sort: 9, grp: "일", category: "취업", title: "99년생, 올해 안에 취업할 수 있을까?", slug: "job-99", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Job", title: "Born in ’99 — a job this year?" }, ja: { category: "就職", title: "99年生まれ、今年中に就職できる？" }, zh: { category: "求职", title: "99年生，今年能找到工作吗？" }, fr: { category: "Emploi", title: "Né en 99 : un job cette année ?" } } },
  { sort: 10, grp: "일", category: "이직", title: "이번 이직이 마지막 기회일까?", slug: "last-chance-83", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Career", title: "Is this job change my last shot?" }, ja: { category: "転職", title: "今回の転職が最後のチャンス？" }, zh: { category: "跳槽", title: "这次跳槽是最后的机会吗？" }, fr: { category: "Carrière", title: "Ce poste : ma dernière chance ?" } } },
  { sort: 11, grp: "일", category: "퇴사", title: "퇴사하고 싶다… 지금 나가도 될까?", slug: "quit", link_type: "q", weight: 2, time_slot: "am", tone: "light",
    i18n: { en: { category: "Quitting", title: "I want to quit… is now the time?" }, ja: { category: "退職", title: "辞めたい…今辞めても大丈夫？" }, zh: { category: "辞职", title: "想辞职……现在走合适吗？" }, fr: { category: "Démission", title: "Démissionner… est-ce le moment ?" } } },
  { sort: 12, grp: "일", category: "승진", title: "일은 내가 하는데 승진은 남이?", slug: "promotion", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Promotion", title: "I do the work — they get promoted?" }, ja: { category: "昇進", title: "仕事は私、昇進は他人？" }, zh: { category: "升职", title: "活是我干的，升的却是别人？" }, fr: { category: "Promotion", title: "Je bosse, eux sont promus ?" } } },
  { sort: 13, grp: "일", category: "적성", title: "지금 새로 시작하면 늦을까?", slug: "second-prime", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    i18n: { en: { category: "Path", title: "Is it too late to start over?" }, ja: { category: "適性", title: "今から始めるのは遅い？" }, zh: { category: "方向", title: "现在重新开始，晚吗？" }, fr: { category: "Voie", title: "Trop tard pour recommencer ?" } } },
  { sort: 14, grp: "일", category: "창업", title: "퇴직금으로 가게 차려도 될까?", slug: "severance-startup", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Startup", title: "Open a shop with my severance?" }, ja: { category: "起業", title: "退職金で店を始めてもいい？" }, zh: { category: "创业", title: "用退休金开店可以吗？" }, fr: { category: "Création", title: "Ouvrir avec mes indemnités ?" } } },
  { sort: 15, grp: "일", category: "직장갈등", title: "상사와 자꾸 부딪히는 나, 왜일까?", slug: "boss-conflict", link_type: "q", weight: 2, time_slot: "am", tone: "heavy",
    i18n: { en: { category: "Work clash", title: "Always clashing with my boss — why?" }, ja: { category: "職場の衝突", title: "上司とぶつかってばかり、なぜ？" }, zh: { category: "职场冲突", title: "总和上司起冲突，为什么？" }, fr: { category: "Conflit pro", title: "Toujours en conflit avec mon chef ?" } } },

  /* ── 돈 ── */
  { sort: 16, grp: "돈", category: "재물", title: "월급은 들어오는데 왜 늘 돈이 없을까?", slug: "no-savings", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    i18n: { en: { category: "Money", title: "Paid monthly — why always broke?" }, ja: { category: "お金", title: "給料はあるのに、なぜお金がない？" }, zh: { category: "财运", title: "有工资，为什么总是没钱？" }, fr: { category: "Argent", title: "Un salaire, mais jamais d’argent ?" } } },
  { sort: 17, grp: "돈", category: "투자", title: "주식만 사면 불안한 나, 왜 그럴까?", slug: "invest-anxiety", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Investing", title: "Stocks make me anxious — why?" }, ja: { category: "投資", title: "株を買うと不安な私、なぜ？" }, zh: { category: "投资", title: "一买股票就焦虑，为什么？" }, fr: { category: "Bourse", title: "La Bourse m’angoisse : pourquoi ?" } } },
  { sort: 18, grp: "돈", category: "내집", title: "지금 집을 사야 할까, 기다릴까?", slug: "buy-home", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Home", title: "Buy a home now, or wait?" }, ja: { category: "マイホーム", title: "今、家を買う？それとも待つ？" }, zh: { category: "买房", title: "现在买房，还是再等等？" }, fr: { category: "Logement", title: "Acheter maintenant, ou attendre ?" } } },
  { sort: 19, grp: "돈", category: "사업", title: "손님 없는 가게, 버틸까 접을까?", slug: "close-or-hold", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    i18n: { en: { category: "Business", title: "Empty shop — hold on or close?" }, ja: { category: "事業", title: "客の来ない店、続ける？畳む？" }, zh: { category: "生意", title: "没客人的店，撑还是关？" }, fr: { category: "Business", title: "Boutique vide : tenir ou fermer ?" } } },

  /* ── 삶 ── */
  { sort: 20, grp: "삶", category: "건강", title: "자꾸 아픈 요즘, 몸조심할 시기일까?", slug: "health", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "요즘 몸이 자꾸 아픈데, 올해 건강 면에서 조심해야 할 시기인지 궁금해요.",
    i18n: { en: { category: "Health", title: "Often unwell — a time to be careful?" }, ja: { category: "健康", title: "最近よく体調を崩す、用心の時期？" }, zh: { category: "健康", title: "最近老生病，是该小心的时期吗？" }, fr: { category: "Santé", title: "Souvent malade : période à risque ?" } } },
  { sort: 21, grp: "삶", category: "가족갈등", title: "가족과 자꾸 부딪힌다, 어떻게 풀까?", slug: "family-conflict", link_type: "q", weight: 1, time_slot: "night", tone: "heavy",
    ask_prefill: "가족과 자꾸 부딪히고 말이 안 통해요. 어떻게 풀어 가면 좋을지 궁금해요.",
    i18n: { en: { category: "Family", title: "Clashing with family — how to mend?" }, ja: { category: "家族の衝突", title: "家族とぶつかる、どう解く？" }, zh: { category: "家庭矛盾", title: "总和家人起冲突，怎么化解？" }, fr: { category: "Famille", title: "Conflits en famille : comment apaiser ?" } } },
  { sort: 22, grp: "삶", category: "부모부양", title: "부모님 부양, 나 혼자 짊어져야 할까?", slug: "parent-care", link_type: "q", weight: 1, time_slot: "night", tone: "heavy",
    ask_prefill: "부모님 부양 문제로 고민이 많아요. 형제 간 역할이나 제가 감당해야 할 몫이 궁금해요.",
    i18n: { en: { category: "Parents", title: "Caring for parents — all on me?" }, ja: { category: "親の介護", title: "親の扶養、私ひとりで背負う？" }, zh: { category: "赡养", title: "赡养父母，要我一个人扛吗？" }, fr: { category: "Parents", title: "Mes parents : tout porter seul ?" } } },
  { sort: 23, grp: "삶", category: "이사", title: "올해 이사해도 될까, 방향은?", slug: "moving", link_type: "q", weight: 1, time_slot: "any", tone: "light",
    ask_prefill: "올해 이사를 생각하고 있어요. 시기나 방향이 괜찮을지 봐 주세요.",
    i18n: { en: { category: "Moving", title: "Move this year? Which direction?" }, ja: { category: "引っ越し", title: "今年引っ越していい？方角は？" }, zh: { category: "搬家", title: "今年能搬家吗？往哪个方向？" }, fr: { category: "Déménager", title: "Déménager cette année ? Où ?" } } },
  { sort: 24, grp: "삶", category: "시험", title: "이번 시험, 올해 승부를 봐도 될까?", slug: "exam", link_type: "q", weight: 1, time_slot: "am", tone: "light",
    ask_prefill: "자격증·공무원 시험을 준비 중이에요. 올해 승부를 보는 게 좋을지 궁금해요.",
    i18n: { en: { category: "Exam", title: "This exam — go all in this year?" }, ja: { category: "試験", title: "この試験、今年勝負していい？" }, zh: { category: "考试", title: "这次考试，今年全力一搏吗？" }, fr: { category: "Examen", title: "Cet examen : tout donner cette année ?" } } },
];
